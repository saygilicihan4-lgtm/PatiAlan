"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function intField(formData: FormData, name: string) {
  const value = Number(formData.get(name));
  return Number.isFinite(value) ? Math.round(value) : NaN;
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (typeof userId !== "string") redirect("/giris?next=/ev-sahibi/yeni");

  const title = String(formData.get("title") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const areaM2 = intField(formData, "area_m2");
  const fenceHeightCm = intField(formData, "fence_height_cm");
  const hourlyPriceTl = intField(formData, "hourly_price_tl");
  const startLocal = String(formData.get("start_local") ?? "08:00");
  const endLocal = String(formData.get("end_local") ?? "22:00");
  const fullyFenced = formData.get("fully_fenced") === "yes";
  const usageRight = formData.get("usage_right") === "on";

  if (!title || !district || !description || !usageRight || areaM2 <= 0 || fenceHeightCm < 0 || hourlyPriceTl < 100) {
    redirect(`/ev-sahibi/yeni?error=${encodeURIComponent("Zorunlu alanları kontrol et. Saatlik fiyat en az 100 TL olmalı.")}`);
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startLocal) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endLocal) || endLocal <= startLocal) {
    redirect(`/ev-sahibi/yeni?error=${encodeURIComponent("Müsaitlik saatlerini kontrol et.")}`);
  }

  const slug = `${slugify(title) || "alan"}-${crypto.randomUUID().slice(0, 8)}`;
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      host_id: userId,
      slug,
      title,
      description,
      city: "İstanbul",
      district,
      area_m2: areaM2,
      fence_height_cm: fenceHeightCm,
      fully_fenced: fullyFenced,
      hourly_price_kurus: hourlyPriceTl * 100,
      status: "draft",
      verification_status: "not_started",
    })
    .select("id")
    .single();

  if (error || !listing) {
    redirect(`/ev-sahibi/yeni?error=${encodeURIComponent("Taslak oluşturulamadı. Lütfen tekrar dene.")}`);
  }

  const availability = Array.from({ length: 7 }, (_, weekday) => ({
    listing_id: listing.id,
    weekday,
    start_local: startLocal,
    end_local: endLocal,
  }));
  await supabase.from("availability_windows").insert(availability);
  await supabase.from("profiles").update({ user_kind: "host" }).eq("id", userId);

  redirect("/panel?created=1");
}
