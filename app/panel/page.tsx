import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function formatTl(kurus: number | null | undefined) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format((kurus ?? 0) / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(value));
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const params = await searchParams;
  const hasBackend = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (!hasBackend) {
    return <section className="section"><span className="eyebrow">Demo panel</span><h1>PatiAlan paneli</h1><p className="notice">Canlı Supabase projesi bağlandığında bu ekran gerçek rezervasyonları gösterecek.</p></section>;
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect("/giris?next=/panel");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id,start_at,status,subtotal_kurus,listings(title,district)")
    .order("start_at", { ascending: true })
    .limit(20);

  const { data: listings } = await supabase
    .from("listings")
    .select("id,title,status,verification_status")
    .order("created_at", { ascending: false })
    .limit(20);

  const upcoming = (bookings ?? []).filter((b) => new Date(b.start_at).getTime() > Date.now() && ["held", "confirmed"].includes(b.status));
  const confirmedGmv = (bookings ?? []).filter((b) => b.status === "confirmed" || b.status === "completed").reduce((sum, b) => sum + (b.subtotal_kurus ?? 0), 0);

  return (
    <section className="section">
      <span className="eyebrow">Hesabım</span>
      <h1>PatiAlan paneli</h1>
      {params.created ? <p className="notice">Alan taslağın oluşturuldu. Sıradaki adım fotoğraf ve doğrulama belgeleri.</p> : null}
      <div className="dashboardGrid">
        <div className="metric"><span>Yaklaşan rezervasyon</span><strong>{upcoming.length}</strong><small>Held + confirmed</small></div>
        <div className="metric"><span>Rezervasyon hacmi</span><strong>{formatTl(confirmedGmv)}</strong><small>Onaylı + tamamlanmış</small></div>
        <div className="metric"><span>Alanlarım</span><strong>{listings?.length ?? 0}</strong><small>Taslak ve yayınlananlar</small></div>
      </div>

      <div className="tableCard">
        <h2>Rezervasyonlar</h2>
        {(bookings ?? []).length === 0 ? <p className="muted">Henüz rezervasyon yok.</p> : (bookings ?? []).map((booking) => {
          const listing = Array.isArray(booking.listings) ? booking.listings[0] : booking.listings;
          return <div className="row" key={booking.id}><span>{formatDate(booking.start_at)}</span><strong>{listing?.title ?? "Alan"}</strong><span className="status">{booking.status}</span></div>;
        })}
      </div>

      <div className="tableCard">
        <h2>Alanlarım</h2>
        {(listings ?? []).length === 0 ? <p className="muted">Henüz alan eklemedin.</p> : (listings ?? []).map((listing) => <div className="row" key={listing.id}><strong>{listing.title}</strong><span>{listing.verification_status}</span><span className="status">{listing.status}</span></div>)}
      </div>

      <form action="/auth/signout" method="post" style={{ marginTop: 24 }}><button className="secondary" type="submit">Çıkış yap</button></form>
    </section>
  );
}
