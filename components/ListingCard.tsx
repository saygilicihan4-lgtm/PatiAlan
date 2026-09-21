import Link from "next/link";
import type { Listing } from "@/data/listings";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link className="listingCard" href={`/alan/${listing.slug}`}>
      <div className="listingVisual">
        <span className="verified">✓ Doğrulanmış alan</span>
        <span className="visualLabel">{listing.sizeM2} m² özel alan</span>
      </div>
      <div className="listingBody">
        <div className="listingMeta"><span>{listing.district}, {listing.city}</span><strong>★ {listing.rating}</strong></div>
        <h3>{listing.title}</h3>
        <div className="chips">{listing.badges.slice(0,3).map(x => <span key={x}>{x}</span>)}</div>
        <div className="price"><strong>{listing.price} TL</strong> / saat <small>{listing.reviews} değerlendirme</small></div>
      </div>
    </Link>
  );
}
