import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const hasBackend = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.SUPABASE_SECRET_KEY);
  if (!hasBackend) {
    return <section className="section"><span className="eyebrow">Yönetim</span><h1>Admin paneli</h1><p className="notice">Canlı backend bağlandığında doğrulama kuyruğu burada açılacak.</p></section>;
  }

  const userClient = await createClient();
  const { data: claimsData } = await userClient.auth.getClaims();
  const claims = claimsData?.claims as Record<string, unknown> | undefined;
  const appMetadata = claims?.app_metadata as { role?: string } | undefined;
  if (!claims?.sub) redirect("/giris?next=/admin");
  if (appMetadata?.role !== "admin") redirect("/");

  const admin = createAdminClient();
  const { data: queue } = await admin
    .from("listings")
    .select("id,title,district,status,verification_status,created_at")
    .in("status", ["draft", "pending_review"])
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <section className="section">
      <span className="eyebrow">Yönetim</span>
      <h1>Doğrulama kuyruğu</h1>
      <div className="tableCard">
        <div className="row head"><span>Alan</span><span>Doğrulama</span><span>Durum</span></div>
        {(queue ?? []).length === 0 ? <p className="muted">Bekleyen alan yok.</p> : (queue ?? []).map((listing) => <div className="row" key={listing.id}><strong>{listing.title} · {listing.district}</strong><span>{listing.verification_status}</span><span className="status">{listing.status}</span></div>)}
      </div>
    </section>
  );
}
