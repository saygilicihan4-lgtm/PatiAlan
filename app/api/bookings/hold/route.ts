import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_DURATIONS = new Set([30, 60, 90]);

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function friendlyError(message: string) {
  const map: Record<string, { status: number; error: string }> = {
    authentication_required: { status: 401, error: "Oturum gerekli." },
    invalid_duration: { status: 400, error: "Rezervasyon süresi geçersiz." },
    start_time_too_soon: { status: 400, error: "Başlangıç zamanı çok yakın veya geçmişte." },
    dog_not_owned: { status: 403, error: "Köpek profili size ait değil." },
    listing_unavailable: { status: 404, error: "Alan rezervasyona açık değil." },
    cannot_book_own_listing: { status: 400, error: "Kendi alanınıza rezervasyon oluşturamazsınız." },
    booking_must_stay_same_day: { status: 400, error: "Rezervasyon aynı gün içinde tamamlanmalı." },
    outside_availability: { status: 409, error: "Seçilen saat alanın müsaitlik penceresi dışında." },
    slot_already_held: { status: 409, error: "Bu saat az önce başka biri tarafından tutuldu." },
  };
  return Object.entries(map).find(([key]) => message.includes(key))?.[1] ?? { status: 500, error: "Rezervasyon oluşturulamadı." };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    if (claimsError || typeof claimsData?.claims?.sub !== "string") {
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

    const { data, error } = await supabase.rpc("create_booking_hold", {
      p_listing_id: listingId,
      p_dog_id: dogId,
      p_start_at: startAt.toISOString(),
      p_duration_minutes: durationMinutes,
    });

    if (error) {
      const mapped = friendlyError(error.message);
      return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    }

    return NextResponse.json({ booking: Array.isArray(data) ? data[0] : data }, { status: 201 });
  } catch (error) {
    console.error("booking_hold_failed", error);
    return NextResponse.json({ error: "Rezervasyon oluşturulamadı." }, { status: 500 });
  }
}
