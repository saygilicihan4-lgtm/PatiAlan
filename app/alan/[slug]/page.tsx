import { notFound } from "next/navigation";
import { listings } from "@/data/listings";

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = listings.find(x => x.slug === slug);
  if (!listing) notFound();
  return (
    <section className="section detail">
      <div className="detailGallery"><div className="galleryMain">{listing.title}</div><div className="gallerySmall">{listing.sizeM2} m²</div><div className="gallerySmall">{listing.fenceCm} cm çit</div></div>
      <div className="detailLayout">
        <div>
          <span className="eyebrow">✓ Doğrulanmış alan · {listing.district}</span>
          <h1>{listing.title}</h1>
          <p className="lead">{listing.description}</p>
          <div className="stats"><div><strong>{listing.sizeM2}</strong><span>m² alan</span></div><div><strong>{listing.fenceCm}</strong><span>cm çit</span></div><div><strong>{listing.rating}</strong><span>puan</span></div></div>
          <h2>Bu alanda</h2><div className="chips">{listing.badges.map(x => <span key={x}>{x}</span>)}</div>
          <div className="safety"><strong>Güvenlik özeti</strong><p>Rezervasyon saatinde alan yalnızca sizin grubunuza ayrılır. Kapı ve çit bilgileri alan sahibi tarafından beyan edilir ve yayın öncesi doğrulama akışından geçer.</p></div>
        </div>
        <aside className="bookingCard">
          <div className="priceBig"><strong>{listing.price} TL</strong> / saat</div>
          <label>Tarih<input type="date" defaultValue="2026-09-22"/></label>
          <label>Süre<select defaultValue="60"><option value="30">30 dakika</option><option value="60">60 dakika</option><option value="90">90 dakika</option></select></label>
          <label>Saat<select defaultValue="16:00"><option>16:00</option><option>17:30</option><option>19:00</option></select></label>
          <button className="primary full">Rezervasyon talebi oluştur</button>
          <small>Bu V0.1 ekranda ödeme henüz canlı değildir.</small>
        </aside>
      </div>
    </section>
  );
}
