import { NextResponse } from "next/server";
import { calculatePrice } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createUserClient } from "@/lib/supabase/server";

const ALLOWED_DURATIONS = new Set([30, 60, 90]);
const HOLD_MINUTES = 10;
const ISTANBUL_TZ = "Europe/Istanbul";
const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function localClock(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ISTANBUL_TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = WEEKDAY_INDEX[get("weekday")];
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  return { weekday, minutes: hour * 60 + minute };
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export async function POST(request: Request) {
  try {
    const userClient = await createUserClient();
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims();
    const userId = claimsData?.claims?.sub;

    if (claimsError || typeof userId !== "string") {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    const body = await request.json();
    const listingId = body?.listingId;
    const dogId = body?.dogId ?? null;
    const durationMinutes = Number(body?.durationMinutes);
    const startAt = new Date(body?.startAt);

    if (!isUuid(listingId) || (dogId !== null && !isUuid(dogId))) {
      return NextResponse.json({ error: "Geçersiz rezervasyon verisi." }, { status: 400 });
    }
    if (!ALLOWED_DURATIONS.has(durationMinutes) || Number.isNaN(startAt.getTime())) {
      return NextResponse.json({ error: "Süre veya başlangıç zamanı geçersiz." }, { status: 400 });
    }
    if (startAt.getTime() < Date.now() + 5 * 60_000) {
      return NextResponse.json({ error: "Başlangıç zamanı çok yakın veya geçmişte." }, { status: 400 });
    }

    if (dogId) {
      const { data: ownedDog } = await userClient
        .from("dogs")
        .select("id")
        .eq("id", dogId)
        .maybeSingle();
      if (!ownedDog) {
        return NextResponse.json({ error: "Köpek profili bulunamadı." }, { status: 403 });
      }
    }

    const admin = createAdminClient();
    const { data: listing, error: listingError } = await admin
      .from("listings")
      .select("id,host_id,hourly_price_kurus,status")
      .eq("id", listingId)
      .eq("status", "published")
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Alan rezervasyona açık değil." }, { status: 404 });
    }
    if (listing.host_id === userId) {
      return NextResponse.json({ error: "Kendi alanınıza rezervasyon oluşturamazsınız." }, { status: 400 });
    }

    const endAt = new Date(startAt.getTime() + durationMinutes * 60_000);
    const startLocal = localClock(startAt);
    const endLocal = localClock(endAt);
    if (startLocal.weekday !== endLocal.weekday) {
      return NextResponse.json({ error: "Rezervasyon aynı takvim günü içinde olmalı." }, { status: 400 });
    }

    const { data: windows, error: availabilityError } = await admin
      .from("availability_windows")
      .select("start_local,end_local")
      .eq("listing_id", listingId)
      .eq("weekday", startLocal.weekday);
    if (availabilityError) throw availabilityError;

    const insideAvailability = (windows ?? []).some((window) =>
      startLocal.minutes >= timeToMinutes(window.start_local) &&
      endLocal.minutes <= timeToMinutes(window.end_local)
    );
    if (!insideAvailability) {
      return NextResponse.json({ error: "Seçilen saat alanın müsaitlik penceresi dışında." }, { status: 409 });
    }

    const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000);
    const price = calculatePrice(listing.hourly_price_kurus, durationMinutes as 30 | 60 | 90);

    await admin
      .from("bookings")
      .update({ status: "expired" })
      .eq("listing_id", listingId)
      .eq("status", "held")
      .lt("hold_expires_at", new Date().toISOString());

    const { data: booking, error: insertError } = await admin
      .from("bookings")
      .insert({
        listing_id: listingId,
        guest_id: userId,
        dog_id: dogId,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        status: "held",
        hold_expires_at: holdExpiresAt.toISOString(),
        subtotal_kurus: price.subtotal,
        platform_fee_kurus: price.platformFee,
        host_gross_kurus: price.hostGross,
      })
      .select("id,status,hold_expires_at,subtotal_kurus")
      .single();

    if (insertError) {
      if (insertError.code === "23P01") {
        return NextResponse.json({ error: "Bu saat az önce başka biri tarafından tutuldu." }, { status: 409 });
      }
      throw insertError;
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("booking_hold_failed", error);
    return NextResponse.json({ error: "Rezervasyon oluşturulamadı." }, { status: 500 });
  }
}
