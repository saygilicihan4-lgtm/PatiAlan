"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function cleanEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function login(formData: FormData) {
  const email = cleanEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/panel");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/giris?error=${encodeURIComponent("E-posta veya şifre hatalı.")}`);
  redirect(next.startsWith("/") ? next : "/panel");
}

export async function signup(formData: FormData) {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const email = cleanEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const origin = String(formData.get("origin") ?? "").replace(/\/$/, "");
  const supabase = await createClient();

  if (password.length < 8) {
    redirect(`/giris?error=${encodeURIComponent("Şifre en az 8 karakter olmalı.")}`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
    },
  });

  if (error) redirect(`/giris?error=${encodeURIComponent(error.message)}`);
  if (data.session) redirect("/panel");
  redirect(`/giris?message=${encodeURIComponent("E-postanı doğruladıktan sonra giriş yapabilirsin.")}`);
}
