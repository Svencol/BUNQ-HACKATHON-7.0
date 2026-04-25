export interface Alternative {
  name: string;
  price: number;
  reason: string;
  url?: string;
  brand: string;
  ecosystem: string;
}

export interface VendorPrice {
  name: string;
  price: number;
  url?: string;
  badge?: string;
}

export interface RetailerPrice {
  retailer: string;
  price: number;
  url?: string;
  inStock: boolean;
  badge?: string;
  savings: number;
}

export interface PriceHistory {
  thirtyDayLow: number;
  thirtyDayHigh: number;
  sixMonthAvg: number;
  allTimeLow: number;
  priceStatus: "great_deal" | "good_price" | "fair" | "above_average" | "overpriced";
  percentVsAvg: number;
  isSeasonalHigh: boolean;
}

export interface ProductEntry {
  keywords: string[];
  aliases: string[];
  category: keyof typeof mockSpendingData.categories;
  alternatives: Alternative[];
  brand: string;
  ecosystem: string;
  vendors: VendorPrice[];
}

export const mockSpendingData = {
  monthlyBudget: 2500,
  currentMonthSpent: 1920,
  categories: {
    electronics: { budget: 300, spent: 295, label: "Electronics" },
    clothing: { budget: 200, spent: 310, label: "Clothing & Shoes" },
    food: { budget: 600, spent: 540, label: "Food & Groceries" },
    entertainment: { budget: 150, spent: 175, label: "Entertainment" },
    home: { budget: 250, spent: 130, label: "Home & Garden" },
    sports: { budget: 100, spent: 40, label: "Sports & Fitness" },
    other: { budget: 200, spent: 180, label: "Other" },
  },
  savingsGoal: 500,
  currentSavings: 290,
  userName: "Alex",
};

export const productDatabase: ProductEntry[] = [
  {
    keywords: ["iphone", "apple phone", "iphone 15", "iphone 14", "iphone 16"],
    aliases: [
      "iphone", "apple iphone", "apple phone",
      "iphone 14", "iphone 14 pro", "iphone 14 pro max",
      "iphone 15", "iphone 15 pro", "iphone 15 pro max",
      "iphone 16", "iphone 16 pro", "iphone 16 pro max",
      "apple iphone 14", "apple iphone 15", "apple iphone 16",
      "apple iphone 16 pro",
    ],
    category: "electronics",
    brand: "Apple",
    ecosystem: "apple",
    alternatives: [
      { name: "iPhone SE 4th Gen", price: 529, reason: "Full Apple experience at a much lower price", brand: "Apple", ecosystem: "apple" },
      { name: "Google Pixel 9a", price: 499, reason: "Clean Android, excellent camera system", brand: "Google", ecosystem: "android" },
      { name: "Samsung Galaxy S24", price: 799, reason: "Premium Android, vibrant display", brand: "Samsung", ecosystem: "android" },
    ],
    vendors: [
      { name: "Apple Store", price: 1199, url: "https://apple.com/nl", badge: "Official" },
      { name: "Coolblue", price: 1149, url: "https://coolblue.nl", badge: "Same-day delivery" },
      { name: "MediaMarkt", price: 1159, url: "https://mediamarkt.nl" },
      { name: "Bol.com", price: 1119, url: "https://bol.com", badge: "Free shipping" },
    ],
  },
  {
    keywords: ["macbook", "macbook pro", "macbook air", "apple laptop"],
    aliases: [
      "macbook", "macbook pro", "macbook air", "apple macbook", "apple laptop",
      "macbook air m1", "macbook air m2", "macbook air m3",
      "macbook pro 14", "macbook pro 16",
      "macbook pro m3", "macbook pro m4",
    ],
    category: "electronics",
    brand: "Apple",
    ecosystem: "apple",
    alternatives: [
      { name: "MacBook Air M1 (Refurb)", price: 849, reason: "Same Apple chip quality, officially refurbished", brand: "Apple", ecosystem: "apple" },
      { name: "Dell XPS 13", price: 999, reason: "Premium Windows build, comparable performance", brand: "Dell", ecosystem: "windows" },
      { name: "ASUS ZenBook 14", price: 849, reason: "Lightweight Windows laptop, great value", brand: "ASUS", ecosystem: "windows" },
    ],
    vendors: [
      { name: "Apple Store", price: 1499, url: "https://apple.com/nl", badge: "Official" },
      { name: "Coolblue", price: 1449, url: "https://coolblue.nl", badge: "Same-day delivery" },
      { name: "MediaMarkt", price: 1469, url: "https://mediamarkt.nl" },
      { name: "Bol.com", price: 1399, url: "https://bol.com", badge: "Free shipping" },
    ],
  },
  {
    keywords: ["airpods", "airpods pro", "apple earbuds"],
    aliases: [
      "airpods", "apple airpods", "apple earbuds",
      "airpods pro", "airpods pro 2", "airpods pro 2nd generation",
      "airpods max", "airpods 3", "airpods 4",
    ],
    category: "electronics",
    brand: "Apple",
    ecosystem: "apple",
    alternatives: [
      { name: "Beats Studio Buds+", price: 149, reason: "Apple-owned, seamless iPhone pairing", brand: "Apple", ecosystem: "apple" },
      { name: "Sony WF-1000XM5", price: 199, reason: "Best-in-class noise cancellation", brand: "Sony", ecosystem: "sony-audio" },
      { name: "Samsung Galaxy Buds3", price: 149, reason: "Great sound, works with any device", brand: "Samsung", ecosystem: "android" },
    ],
    vendors: [
      { name: "Apple Store", price: 279, url: "https://apple.com/nl", badge: "Official" },
      { name: "Coolblue", price: 269, url: "https://coolblue.nl" },
      { name: "MediaMarkt", price: 265, url: "https://mediamarkt.nl" },
      { name: "Bol.com", price: 259, url: "https://bol.com", badge: "Free shipping" },
      { name: "Amazon.nl", price: 249, url: "https://amazon.nl", badge: "Prime" },
    ],
  },
  {
    keywords: ["headphones", "over-ear headphones", "wireless headphones"],
    aliases: [
      "headphones", "wireless headphones", "over ear headphones",
      "over-ear headphones", "bluetooth headphones",
      "noise cancelling headphones", "noise canceling headphones",
      "sony wh-1000xm5", "sony wh1000xm5", "sony wh 1000xm5",
      "sony headphones", "wh-1000xm5", "wh1000xm5",
    ],
    category: "electronics",
    brand: "Various",
    ecosystem: "generic",
    alternatives: [
      { name: "Sony WH-1000XM5", price: 279, reason: "Best-in-class ANC, industry standard", brand: "Sony", ecosystem: "sony-audio" },
      { name: "Jabra Evolve2 55", price: 249, reason: "Great for calls and focused work", brand: "Jabra", ecosystem: "generic" },
      { name: "Anker Soundcore Q45", price: 79, reason: "Solid ANC at a budget price", brand: "Anker", ecosystem: "generic" },
    ],
    vendors: [
      { name: "Coolblue", price: 350, url: "https://coolblue.nl" },
      { name: "MediaMarkt", price: 339, url: "https://mediamarkt.nl" },
      { name: "Bol.com", price: 329, url: "https://bol.com", badge: "Free shipping" },
      { name: "Amazon.nl", price: 309, url: "https://amazon.nl", badge: "Prime" },
    ],
  },
  {
    keywords: ["ipad", "apple tablet", "ipad pro", "ipad air"],
    aliases: [
      "ipad", "apple ipad", "apple tablet",
      "ipad pro", "ipad pro 11", "ipad pro 13",
      "ipad air", "ipad air m2", "ipad air m3",
      "ipad mini", "ipad mini 6", "ipad mini 7",
    ],
    category: "electronics",
    brand: "Apple",
    ecosystem: "apple",
    alternatives: [
      { name: "iPad mini 6", price: 499, reason: "Compact Apple tablet, same iOS ecosystem", brand: "Apple", ecosystem: "apple" },
      { name: "Samsung Galaxy Tab S9 FE", price: 449, reason: "Versatile Android tablet, great display", brand: "Samsung", ecosystem: "android" },
      { name: "Amazon Fire HD 10", price: 149, reason: "Budget media tablet, good for streaming", brand: "Amazon", ecosystem: "generic" },
    ],
    vendors: [
      { name: "Apple Store", price: 749, url: "https://apple.com/nl", badge: "Official" },
      { name: "Coolblue", price: 719, url: "https://coolblue.nl", badge: "Same-day delivery" },
      { name: "MediaMarkt", price: 729, url: "https://mediamarkt.nl" },
      { name: "Bol.com", price: 699, url: "https://bol.com", badge: "Free shipping" },
    ],
  },
  {
    keywords: ["samsung galaxy", "galaxy s24", "galaxy s25", "galaxy s23", "galaxy phone", "samsung phone"],
    aliases: [
      "samsung galaxy", "samsung phone", "samsung smartphone", "galaxy phone",
      "galaxy s23", "galaxy s24", "galaxy s25",
      "samsung galaxy s23", "samsung galaxy s24", "samsung galaxy s25",
      "galaxy a14", "galaxy a14 5g", "galaxy a55", "galaxy a35",
      "samsung galaxy a14", "samsung galaxy a14 5g",
      "samsung galaxy a55", "samsung galaxy a35",
      "samsung galaxy a14 5g", "galaxy a14 5g",
    ],
    category: "electronics",
    brand: "Samsung",
    ecosystem: "android",
    alternatives: [
      { name: "Samsung Galaxy A55", price: 449, reason: "Solid Samsung mid-ranger, same ecosystem", brand: "Samsung", ecosystem: "android" },
      { name: "Google Pixel 8a", price: 499, reason: "Clean Android, excellent camera for less", brand: "Google", ecosystem: "android" },
      { name: "iPhone 15", price: 799, reason: "Premium Apple experience, tighter ecosystem integration", brand: "Apple", ecosystem: "apple" },
    ],
    vendors: [
      { name: "Samsung Store", price: 899, url: "https://samsung.com/nl", badge: "Official" },
      { name: "Coolblue", price: 869, url: "https://coolblue.nl" },
      { name: "MediaMarkt", price: 879, url: "https://mediamarkt.nl" },
      { name: "Bol.com", price: 849, url: "https://bol.com", badge: "Free shipping" },
    ],
  },
  {
    keywords: ["samsung tv", "lg tv", "sony tv", "4k tv", "television", "smart tv", "oled"],
    aliases: [
      "tv", "television", "smart tv", "4k tv", "oled tv", "qled tv",
      "samsung tv", "lg tv", "sony tv", "hisense tv", "tcl tv",
      "55 inch tv", "65 inch tv", "4k television",
    ],
    category: "electronics",
    brand: "Various",
    ecosystem: "generic",
    alternatives: [
      { name: "Hisense U6 Series 55\"", price: 399, reason: "Excellent picture quality for the price", brand: "Hisense", ecosystem: "generic" },
      { name: "TCL 5-Series 55\"", price: 449, reason: "Roku built-in, great all-round value", brand: "TCL", ecosystem: "generic" },
      { name: "Vizio V-Series 55\"", price: 329, reason: "Budget 4K with solid performance", brand: "Vizio", ecosystem: "generic" },
    ],
    vendors: [
      { name: "MediaMarkt", price: 599, url: "https://mediamarkt.nl" },
      { name: "Coolblue", price: 569, url: "https://coolblue.nl", badge: "Same-day delivery" },
      { name: "Bol.com", price: 549, url: "https://bol.com", badge: "Free shipping" },
      { name: "Alternate", price: 529, url: "https://alternate.nl" },
    ],
  },
  {
    keywords: ["ps5", "playstation 5", "playstation"],
    aliases: [
      "ps5", "playstation 5", "playstation", "sony ps5", "playstation5",
      "ps5 digital", "ps5 digital edition",
      "playstation 5 digital", "playstation 5 digital edition",
      "playstation 5 slim", "ps5 slim",
    ],
    category: "entertainment",
    brand: "Sony",
    ecosystem: "playstation",
    alternatives: [
      { name: "PS5 Digital Edition", price: 449, reason: "Same PlayStation library, no disc drive needed", brand: "Sony", ecosystem: "playstation" },
      { name: "Xbox Series S", price: 299, reason: "Game Pass library, all-digital, very affordable", brand: "Microsoft", ecosystem: "xbox" },
      { name: "Nintendo Switch OLED", price: 349, reason: "Portable gaming, unique exclusive library", brand: "Nintendo", ecosystem: "nintendo" },
    ],
    vendors: [
      { name: "PlayStation Direct", price: 549, url: "https://direct.playstation.com", badge: "Official" },
      { name: "MediaMarkt", price: 529, url: "https://mediamarkt.nl" },
      { name: "GameMania", price: 539, url: "https://gamemania.nl" },
      { name: "Bol.com", price: 519, url: "https://bol.com", badge: "Free shipping" },
    ],
  },
  {
    keywords: ["xbox", "xbox series x", "xbox series s"],
    aliases: [
      "xbox", "xbox series x", "xbox series s", "microsoft xbox",
      "xbox series", "xbox one", "xbox one x",
      "xbox series x s", "xbox controller",
    ],
    category: "entertainment",
    brand: "Microsoft",
    ecosystem: "xbox",
    alternatives: [
      { name: "Xbox Series S", price: 299, reason: "Entry-level Xbox with full Game Pass access", brand: "Microsoft", ecosystem: "xbox" },
      { name: "PlayStation 5 Slim", price: 449, reason: "Stronger exclusive library, great performance", brand: "Sony", ecosystem: "playstation" },
      { name: "Nintendo Switch OLED", price: 349, reason: "Portable gaming, very different experience", brand: "Nintendo", ecosystem: "nintendo" },
    ],
    vendors: [
      { name: "Microsoft Store", price: 499, url: "https://microsoft.com/nl", badge: "Official" },
      { name: "MediaMarkt", price: 479, url: "https://mediamarkt.nl" },
      { name: "GameMania", price: 489, url: "https://gamemania.nl" },
      { name: "Bol.com", price: 469, url: "https://bol.com", badge: "Free shipping" },
    ],
  },
  {
    keywords: ["nike", "nike shoes", "air max", "nike sneakers", "air force"],
    aliases: [
      "nike", "nike shoes", "nike sneakers",
      "air max", "nike air max", "air max 270", "nike air max 270",
      "air force 1", "nike air force 1", "air force", "nike air force",
      "nike revolution", "nike react",
    ],
    category: "clothing",
    brand: "Nike",
    ecosystem: "nike",
    alternatives: [
      { name: "Nike Revolution 7", price: 69, reason: "Nike quality and fit at an entry-level price", brand: "Nike", ecosystem: "nike" },
      { name: "Adidas Ultraboost 23", price: 149, reason: "Boost cushioning, premium everyday feel", brand: "Adidas", ecosystem: "adidas" },
      { name: "New Balance 574", price: 89, reason: "Classic comfort, great everyday value", brand: "New Balance", ecosystem: "generic" },
    ],
    vendors: [
      { name: "Nike.com", price: 149, url: "https://nike.com/nl", badge: "Official" },
      { name: "Foot Locker", price: 139, url: "https://footlocker.nl" },
      { name: "Bol.com", price: 135, url: "https://bol.com" },
      { name: "Zalando", price: 129, url: "https://zalando.nl", badge: "Free returns" },
    ],
  },
  {
    keywords: ["adidas", "yeezy", "stan smith", "adidas shoes"],
    aliases: [
      "adidas", "adidas shoes", "adidas sneakers",
      "stan smith", "adidas stan smith",
      "yeezy", "adidas yeezy",
      "ultraboost", "adidas ultraboost",
      "adidas lite racer", "adidas gazelle",
    ],
    category: "clothing",
    brand: "Adidas",
    ecosystem: "adidas",
    alternatives: [
      { name: "Adidas Lite Racer 3.0", price: 49, reason: "Lightweight everyday Adidas at budget price", brand: "Adidas", ecosystem: "adidas" },
      { name: "Nike Air Max 270", price: 129, reason: "Bold Air cushioning, different feel and style", brand: "Nike", ecosystem: "nike" },
      { name: "Puma RS-X", price: 89, reason: "Retro look, comfortable daily wear", brand: "Puma", ecosystem: "generic" },
    ],
    vendors: [
      { name: "Adidas.com", price: 129, url: "https://adidas.com/nl", badge: "Official" },
      { name: "Bol.com", price: 115, url: "https://bol.com" },
      { name: "Zalando", price: 109, url: "https://zalando.nl", badge: "Free returns" },
      { name: "ASOS", price: 99, url: "https://asos.com", badge: "Student discount" },
    ],
  },
  {
    keywords: ["north face", "jacket", "winter jacket", "puffer jacket", "down jacket"],
    aliases: [
      "north face", "the north face", "north face jacket",
      "winter jacket", "puffer jacket", "down jacket",
      "north face hoodie", "north face gilet",
      "north face nuptse", "north face 1996",
    ],
    category: "clothing",
    brand: "The North Face",
    ecosystem: "north-face",
    alternatives: [
      { name: "The North Face Resolve Jacket", price: 99, reason: "Same brand, lightweight waterproof option", brand: "The North Face", ecosystem: "north-face" },
      { name: "Columbia Powder Lite Jacket", price: 99, reason: "Warm, lightweight, reliable waterproofing", brand: "Columbia", ecosystem: "generic" },
      { name: "Patagonia Nano Puff", price: 179, reason: "Premium recycled insulation, lighter weight", brand: "Patagonia", ecosystem: "generic" },
    ],
    vendors: [
      { name: "The North Face", price: 249, url: "https://thenorthface.com/nl", badge: "Official" },
      { name: "Bol.com", price: 229, url: "https://bol.com" },
      { name: "Zalando", price: 219, url: "https://zalando.nl", badge: "Free returns" },
      { name: "About You", price: 209, url: "https://aboutyou.nl" },
    ],
  },
  {
    keywords: ["nespresso", "coffee machine", "espresso machine", "coffee maker"],
    aliases: [
      "nespresso", "nespresso machine", "coffee machine", "coffee maker",
      "espresso machine", "nespresso vertuo", "nespresso essenza",
      "nespresso citiz", "nespresso lattissima",
    ],
    category: "home",
    brand: "Nespresso",
    ecosystem: "nespresso",
    alternatives: [
      { name: "Nespresso Essenza Mini", price: 79, reason: "Entry-level Nespresso, same pods compatible", brand: "Nespresso", ecosystem: "nespresso" },
      { name: "De'Longhi Stilosa EC230", price: 69, reason: "Manual espresso, no pod lock-in", brand: "De'Longhi", ecosystem: "generic" },
      { name: "Moka Pot + Grinder Bundle", price: 45, reason: "Authentic espresso, minimal ongoing cost", brand: "Generic", ecosystem: "generic" },
    ],
    vendors: [
      { name: "Nespresso Store", price: 149, url: "https://nespresso.com/nl", badge: "Official" },
      { name: "MediaMarkt", price: 139, url: "https://mediamarkt.nl" },
      { name: "Coolblue", price: 129, url: "https://coolblue.nl" },
      { name: "Bol.com", price: 119, url: "https://bol.com", badge: "Free shipping" },
    ],
  },
  {
    keywords: ["dyson", "vacuum", "dyson vacuum", "robot vacuum"],
    aliases: [
      "dyson", "dyson vacuum", "vacuum cleaner", "dyson vacuum cleaner",
      "dyson v8", "dyson v10", "dyson v11", "dyson v12", "dyson v15",
      "robot vacuum", "dyson ball", "dyson outsize",
    ],
    category: "home",
    brand: "Dyson",
    ecosystem: "dyson",
    alternatives: [
      { name: "Dyson V8 Absolute", price: 299, reason: "Previous-gen Dyson, same quality at lower price", brand: "Dyson", ecosystem: "dyson" },
      { name: "Shark IZ462H", price: 199, reason: "Comparable suction, significantly cheaper", brand: "Shark", ecosystem: "generic" },
      { name: "Eufy RoboVac 11S", price: 149, reason: "Hands-free robot vacuum at low cost", brand: "Eufy", ecosystem: "generic" },
    ],
    vendors: [
      { name: "Dyson Store", price: 499, url: "https://dyson.nl", badge: "Official" },
      { name: "MediaMarkt", price: 479, url: "https://mediamarkt.nl" },
      { name: "Coolblue", price: 469, url: "https://coolblue.nl" },
      { name: "Bol.com", price: 449, url: "https://bol.com", badge: "Free shipping" },
    ],
  },
  {
    keywords: ["gym", "gym membership", "fitness membership", "crossfit"],
    aliases: [
      "gym", "gym membership", "fitness membership",
      "crossfit membership", "basic-fit", "basic fit",
      "anytime fitness", "sport membership",
    ],
    category: "sports",
    brand: "Various",
    ecosystem: "generic",
    alternatives: [
      { name: "Planet Fitness Membership", price: 10, reason: "Basic gym at minimal cost per month", brand: "Planet Fitness", ecosystem: "generic" },
      { name: "Resistance Bands Set", price: 29, reason: "Home workout, one-time purchase", brand: "Generic", ecosystem: "generic" },
      { name: "YouTube + Free Weights", price: 49, reason: "Dumbbells + free workout content online", brand: "Generic", ecosystem: "generic" },
    ],
    vendors: [],
  },
  {
    keywords: ["laptop", "notebook", "computer", "pc"],
    aliases: [
      "laptop", "notebook", "windows laptop", "gaming laptop",
      "budget laptop", "student laptop", "office laptop",
      "dell laptop", "hp laptop", "lenovo laptop", "asus laptop", "acer laptop",
      "dell xps", "hp pavilion", "lenovo ideapad", "asus zenbook",
    ],
    category: "electronics",
    brand: "Various",
    ecosystem: "windows",
    alternatives: [
      { name: "Acer Aspire 5", price: 549, reason: "Great budget laptop for daily tasks", brand: "Acer", ecosystem: "windows" },
      { name: "HP Pavilion 15", price: 629, reason: "Solid all-rounder with good build quality", brand: "HP", ecosystem: "windows" },
      { name: "Lenovo IdeaPad 5", price: 679, reason: "Good build, strong AMD performance", brand: "Lenovo", ecosystem: "windows" },
    ],
    vendors: [
      { name: "Coolblue", price: 899, url: "https://coolblue.nl", badge: "Same-day delivery" },
      { name: "MediaMarkt", price: 879, url: "https://mediamarkt.nl" },
      { name: "Bol.com", price: 849, url: "https://bol.com", badge: "Free shipping" },
      { name: "Alternate", price: 819, url: "https://alternate.nl" },
    ],
  },
];

export function findProductEcosystem(productName: string): { brand: string; ecosystem: string } {
  const lower = productName.toLowerCase();

  for (const entry of productDatabase) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return { brand: entry.brand, ecosystem: entry.ecosystem };
    }
  }

  // Pattern-based fallback
  if (/iphone|macbook|ipad|airpod|apple watch/.test(lower)) return { brand: 'Apple', ecosystem: 'apple' };
  if (/galaxy|samsung/.test(lower)) return { brand: 'Samsung', ecosystem: 'android' };
  if (/pixel/.test(lower)) return { brand: 'Google', ecosystem: 'android' };
  if (/ps5|playstation/.test(lower)) return { brand: 'Sony', ecosystem: 'playstation' };
  if (/xbox/.test(lower)) return { brand: 'Microsoft', ecosystem: 'xbox' };
  if (/nintendo/.test(lower)) return { brand: 'Nintendo', ecosystem: 'nintendo' };
  if (/dyson/.test(lower)) return { brand: 'Dyson', ecosystem: 'dyson' };
  if (/nespresso/.test(lower)) return { brand: 'Nespresso', ecosystem: 'nespresso' };
  if (/nike/.test(lower)) return { brand: 'Nike', ecosystem: 'nike' };
  if (/adidas/.test(lower)) return { brand: 'Adidas', ecosystem: 'adidas' };

  return { brand: 'Unknown', ecosystem: 'generic' };
}

export function findCategory(productName: string): keyof typeof mockSpendingData.categories {
  const lower = productName.toLowerCase();
  for (const entry of productDatabase) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return entry.category;
    }
  }
  if (/phone|tablet|laptop|tv|headphone|earbud|camera|watch/.test(lower)) return "electronics";
  if (/shoe|jacket|shirt|pants|dress|clothing|jeans|sneaker/.test(lower)) return "clothing";
  if (/game|movie|concert|netflix|spotify/.test(lower)) return "entertainment";
  if (/furniture|kitchen|vacuum|appliance/.test(lower)) return "home";
  if (/gym|bike|yoga|sport|fitness/.test(lower)) return "sports";
  return "other";
}

/* ── Retailer comparison ──────────────────────────────────────────────── */

type RetailerDef = { retailer: string; factor: number; url: string; badge?: string };

const retailerSets: Record<string, RetailerDef[]> = {
  apple: [
    { retailer: "Apple Store", factor: 1.00, url: "https://apple.com/nl", badge: "Official" },
    { retailer: "bol.com", factor: 0.96, url: "https://bol.com", badge: "Free shipping" },
    { retailer: "Coolblue", factor: 0.97, url: "https://coolblue.nl", badge: "Same-day delivery" },
    { retailer: "MediaMarkt", factor: 0.99, url: "https://mediamarkt.nl" },
    { retailer: "Amazon.nl", factor: 0.95, url: "https://amazon.nl", badge: "Prime" },
  ],
  electronics: [
    { retailer: "bol.com", factor: 0.97, url: "https://bol.com", badge: "Free shipping" },
    { retailer: "Coolblue", factor: 0.98, url: "https://coolblue.nl", badge: "Same-day delivery" },
    { retailer: "MediaMarkt", factor: 1.00, url: "https://mediamarkt.nl" },
    { retailer: "Amazon.nl", factor: 0.95, url: "https://amazon.nl", badge: "Prime" },
    { retailer: "Alternate", factor: 0.94, url: "https://alternate.nl" },
  ],
  gaming: [
    { retailer: "bol.com", factor: 0.97, url: "https://bol.com" },
    { retailer: "GameMania", factor: 1.00, url: "https://gamemania.nl" },
    { retailer: "Coolblue", factor: 0.98, url: "https://coolblue.nl" },
    { retailer: "Amazon.nl", factor: 0.96, url: "https://amazon.nl" },
    { retailer: "MediaMarkt", factor: 0.99, url: "https://mediamarkt.nl" },
  ],
  clothing: [
    { retailer: "Zalando", factor: 0.95, url: "https://zalando.nl", badge: "Free returns" },
    { retailer: "ASOS", factor: 0.88, url: "https://asos.com", badge: "Student discount" },
    { retailer: "About You", factor: 0.92, url: "https://aboutyou.nl" },
    { retailer: "H&M Online", factor: 0.82, url: "https://hm.com/nl", badge: "Sale items" },
    { retailer: "Vinted", factor: 0.50, url: "https://vinted.nl", badge: "2nd hand" },
  ],
  home: [
    { retailer: "bol.com", factor: 0.96, url: "https://bol.com", badge: "Free shipping" },
    { retailer: "Coolblue", factor: 0.97, url: "https://coolblue.nl" },
    { retailer: "Blokker", factor: 0.98, url: "https://blokker.nl" },
    { retailer: "Amazon.nl", factor: 0.93, url: "https://amazon.nl" },
    { retailer: "IKEA", factor: 0.89, url: "https://ikea.com/nl", badge: "Click & Collect" },
  ],
  sports: [
    { retailer: "Decathlon", factor: 0.82, url: "https://decathlon.nl", badge: "Best value" },
    { retailer: "bol.com", factor: 0.94, url: "https://bol.com" },
    { retailer: "Amazon.nl", factor: 0.92, url: "https://amazon.nl" },
    { retailer: "Sport 2000", factor: 0.97, url: "https://sport2000.nl" },
    { retailer: "Intersport", factor: 1.00, url: "https://intersport.nl" },
  ],
};

function getRetailerSet(productName: string, category: string): RetailerDef[] {
  const lower = productName.toLowerCase();
  if (
    lower.includes("iphone") || lower.includes("macbook") || lower.includes("ipad") ||
    lower.includes("airpod") || lower.includes("apple watch")
  ) return retailerSets.apple;
  if (
    lower.includes("ps5") || lower.includes("xbox") || lower.includes("nintendo") ||
    lower.includes("playstation") || lower.includes("switch")
  ) return retailerSets.gaming;
  if (category === "clothing") return retailerSets.clothing;
  if (category === "home") return retailerSets.home;
  if (category === "sports") return retailerSets.sports;
  return retailerSets.electronics;
}

export function findRetailers(
  productName: string,
  productPrice: number,
  category: string
): RetailerPrice[] {
  const set = getRetailerSet(productName, category);

  let hash = 0;
  for (let i = 0; i < productName.length; i++) {
    hash = (Math.imul(31, hash) + productName.charCodeAt(i)) | 0;
  }

  return set
    .map((r, i) => {
      const price = Math.round(productPrice * r.factor);
      return {
        retailer: r.retailer,
        price,
        url: r.url,
        inStock: (Math.abs(hash) + i * 7) % 9 !== 0,
        badge: r.badge,
        savings: Math.max(0, productPrice - price),
      };
    })
    .sort((a, b) => a.price - b.price);
}

/* ── Price history ────────────────────────────────────────────────────── */

export function getMockPriceHistory(
  productName: string,
  currentPrice: number
): PriceHistory {
  let hash = 0;
  for (let i = 0; i < productName.length; i++) {
    hash = (Math.imul(31, hash) + productName.charCodeAt(i)) | 0;
  }
  const h = Math.abs(hash);

  // How far current price is from the 6-month average (-5% to +15%)
  const avgOffset = ((h % 21) - 5) / 100;
  const sixMonthAvg = Math.round(currentPrice / (1 + avgOffset));

  const thirtyDayLow = Math.round(sixMonthAvg * (0.90 + (h % 8) / 100));
  const thirtyDayHigh = Math.round(sixMonthAvg * (1.04 + (h % 7) / 100));
  const allTimeLow = Math.round(sixMonthAvg * (0.68 + (h % 12) / 100));

  const percentVsAvg = Math.round(((currentPrice - sixMonthAvg) / sixMonthAvg) * 100);

  let priceStatus: PriceHistory["priceStatus"];
  if (percentVsAvg <= -8) priceStatus = "great_deal";
  else if (percentVsAvg <= -2) priceStatus = "good_price";
  else if (percentVsAvg <= 5) priceStatus = "fair";
  else if (percentVsAvg <= 12) priceStatus = "above_average";
  else priceStatus = "overpriced";

  const month = new Date().getMonth();
  const isSeasonalHigh = month >= 10 || month <= 1; // Nov–Feb: holiday/post-holiday

  return {
    thirtyDayLow,
    thirtyDayHigh,
    sixMonthAvg,
    allTimeLow,
    priceStatus,
    percentVsAvg,
    isSeasonalHigh,
  };
}
