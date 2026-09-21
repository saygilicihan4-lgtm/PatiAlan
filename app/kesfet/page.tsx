import { ListingCard } from "@/components/ListingCard";
import { listings } from "@/data/listings";

export default function ExplorePage() {
  return (
    <section className="section explore">
      <span className="eyebrow">İstanbul</span>
      <h1>Özel köpek alanlarını keşfet</h1>
      <div className="filters"><button>Bugün</button><button>Tam çitli</button><button>500+ m²</button><button>Otopark</button><button>Agility</button></div>
      <div className="exploreLayout">
        <div className="listingColumn">{listings.map(l => <ListingCard key={l.slug} listing={l}/>)}</div>
        <div className="mapPanel"><div className="pin p1">299₺</div><div className="pin p2">349₺</div><div className="pin p3">449₺</div><p>Harita entegrasyonu V0.2'de gerçek koordinatlarla bağlanacak.</p></div>
      </div>
    </section>
  );
}
