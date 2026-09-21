import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/panel";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/panel", request.url));
  }

  return NextResponse.redirect(new URL("/giris?error=Do%C4%9Frulama%20ba%C4%9Flant%C4%B1s%C4%B1%20ge%C3%A7ersiz.", request.url));
}
