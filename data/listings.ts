export type Listing = {
  slug: string;
  title: string;
  district: string;
  city: string;
  price: number;
  sizeM2: number;
  fenceCm: number;
  rating: number;
  reviews: number;
  badges: string[];
  description: string;
};

export const listings: Listing[] = [
  {
    slug: "sariyer-yesil-bahce",
    title: "Tam çitli geniş yeşil bahçe",
    district: "Sarıyer",
    city: "İstanbul",
    price: 299,
    sizeM2: 650,
    fenceCm: 180,
    rating: 4.9,
    reviews: 34,
    badges: ["Tam çitli", "Su", "Gölge", "Otopark"],
    description: "Koşmayı seven köpekler için sessiz, tamamen çevrili ve rezervasyon süresince yalnızca size ayrılan özel bahçe."
  },
  {
    slug: "cekmece-pati-ciftligi",
    title: "Doğa içinde özel oyun alanı",
    district: "Büyükçekmece",
    city: "İstanbul",
    price: 349,
    sizeM2: 1200,
    fenceCm: 160,
    rating: 4.8,
    reviews: 21,
    badges: ["Tam çitli", "Agility", "Otopark", "Su"],
    description: "Geniş koşu alanı ve temel agility ekipmanları bulunan sakin çiftlik alanı."
  },
  {
    slug: "beykoz-orman-bahcesi",
    title: "Orman kenarında gölgeli bahçe",
    district: "Beykoz",
    city: "İstanbul",
    price: 449,
    sizeM2: 900,
    fenceCm: 190,
    rating: 5.0,
    reviews: 12,
    badges: ["Tam çitli", "Yoğun gölge", "Su", "Sessiz"],
    description: "Reaktif veya kalabalıktan hoşlanmayan köpekler için yüksek çitli, gözlerden uzak özel alan."
  }
];
