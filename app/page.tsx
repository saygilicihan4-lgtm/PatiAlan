import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { listings } from "@/data/listings";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="heroCopy">
          <span className="eyebrow">İstanbul pilotu · Özel rezervasyon</span>
          <h1>Köpeğin özgürce koşsun.<br/><em>Alan yalnızca sizin olsun.</em></h1>
          <p>Kalabalık köpek parkı yok. Rastgele karşılaşma yok. Güvenli, doğrulanmış özel alanı seç; saatini ayır; sadece birlikte keyfini çıkarın.</p>
          <div className="heroActions">
            <Link className="primary" href="/kesfet">Yakındaki alanları keşfet</Link>
            <Link className="secondary" href="/ev-sahibi">Alanımı listelemek istiyorum</Link>
          </div>
          <div className="trustRow"><span>✓ Doğrulanmış alanlar</span><span>✓ Tek rezervasyon</span><span>✓ Güvenli ödeme altyapısına hazır</span></div>
        </div>
        <div className="heroPanel">
          <div className="mockMap"><div className="pin p1">299₺</div><div className="pin p2">349₺</div><div className="pin p3">449₺</div><div className="searchBubble">📍 İstanbul · Bugün</div></div>
          <div className="availability"><div><strong>Bugün için uygun</strong><span>Sarıyer · 650 m²</span></div><div className="slot">16:00</div><div className="slot">17:30</div></div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHead"><div><span className="eyebrow">Öne çıkan alanlar</span><h2>İlk pilot deneyimi</h2></div><Link href="/kesfet">Tümünü gör →</Link></div>
        <div className="grid3">{listings.map(l => <ListingCard key={l.slug} listing={l}/>)}</div>
      </section>

      <section className="how">
        <div><span>01</span><h3>Alanı seç</h3><p>Çit, büyüklük, gölge ve diğer özellikleri kontrol et.</p></div>
        <div><span>02</span><h3>Saati ayır</h3><p>30, 60 veya 90 dakikalık müsait zaman dilimini rezerve et.</p></div>
        <div><span>03</span><h3>Özgürce kullan</h3><p>Rezervasyon boyunca alan başka müşteriye açılmaz.</p></div>
      </section>
    </>
  );
}
