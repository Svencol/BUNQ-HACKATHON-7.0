export interface Alternative {
  name: string;
  price: number;
  reason: string;
  url?: string;
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
  category: keyof typeof mockSpendingData.categories;
  alternatives: Alternative[];
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
    category: "electronics",
    alternatives: [
      { name: "Samsung Galaxy S24", price: 799, reason: "Similar flagship performance, better value" },
      { name: "Google Pixel 8a", price: 499, reason: "Clean Android, excellent camera" },
      { name: "OnePlus 12", price: 699, reason: "Top-tier specs at lower price" },
    ],
  },
  {
    keywords: ["macbook", "macbook pro", "macbook air", "apple laptop"],
    category: "electronics",
    alternatives: [
      { name: "Dell XPS 13", price: 999, reason: "Premium build, great display" },
      { name: "ASUS ZenBook 14", price: 849, reason: "Lightweight, solid performance" },
      { name: "Lenovo ThinkPad X1 Carbon", price: 1099, reason: "Business-grade durability" },
    ],
  },
  {
    keywords: ["airpods", "airpods pro", "apple earbuds"],
    category: "electronics",
    alternatives: [
      { name: "Sony WF-1000XM5", price: 199, reason: "Industry-best noise cancellation" },
      { name: "Samsung Galaxy Buds2 Pro", price: 149, reason: "Great sound, comfortable fit" },
      { name: "Anker Soundcore Liberty 4", price: 99, reason: "Budget-friendly ANC earbuds" },
    ],
  },
  {
    keywords: ["headphones", "over-ear headphones", "wireless headphones"],
    category: "electronics",
    alternatives: [
      { name: "Sony WH-1000XM5", price: 279, reason: "Best-in-class ANC" },
      { name: "Jabra Evolve2 55", price: 249, reason: "Great for calls and music" },
      { name: "Anker Soundcore Q45", price: 79, reason: "Solid budget option with ANC" },
    ],
  },
  {
    keywords: ["ipad", "apple tablet", "ipad pro", "ipad air"],
    category: "electronics",
    alternatives: [
      { name: "Samsung Galaxy Tab S9 FE", price: 449, reason: "Great display, versatile" },
      { name: "Lenovo Tab P12", price: 349, reason: "Large screen at lower cost" },
      { name: "Amazon Fire HD 10", price: 149, reason: "Great for media consumption" },
    ],
  },
  {
    keywords: ["samsung tv", "lg tv", "sony tv", "4k tv", "television", "smart tv", "oled"],
    category: "electronics",
    alternatives: [
      { name: "Hisense U6 Series 55\"", price: 399, reason: "Excellent picture for the price" },
      { name: "TCL 5-Series 55\"", price: 449, reason: "Roku built-in, great value" },
      { name: "Vizio V-Series 55\"", price: 329, reason: "Budget 4K with solid performance" },
    ],
  },
  {
    keywords: ["ps5", "playstation 5", "playstation"],
    category: "entertainment",
    alternatives: [
      { name: "Xbox Series S", price: 299, reason: "Game Pass library, all-digital" },
      { name: "Nintendo Switch OLED", price: 349, reason: "Portable + TV, unique library" },
      { name: "Steam Deck OLED", price: 549, reason: "PC gaming on the go" },
    ],
  },
  {
    keywords: ["xbox", "xbox series x", "xbox series s"],
    category: "entertainment",
    alternatives: [
      { name: "Nintendo Switch OLED", price: 349, reason: "Different experience, great exclusives" },
      { name: "Steam Deck OLED", price: 549, reason: "Access to full PC library" },
    ],
  },
  {
    keywords: ["nike", "nike shoes", "air max", "nike sneakers", "air force"],
    category: "clothing",
    alternatives: [
      { name: "Adidas Ultraboost 23", price: 149, reason: "Excellent cushioning, comparable comfort" },
      { name: "New Balance 574", price: 89, reason: "Classic style, great value" },
      { name: "ASICS Gel-Kayano 30", price: 119, reason: "Superior support for runners" },
    ],
  },
  {
    keywords: ["adidas", "yeezy", "stan smith", "adidas shoes"],
    category: "clothing",
    alternatives: [
      { name: "Nike Air Max 270", price: 129, reason: "Bold style, great comfort" },
      { name: "Puma RS-X", price: 89, reason: "Retro look at a lower price" },
      { name: "Reebok Classic Leather", price: 74, reason: "Timeless, affordable style" },
    ],
  },
  {
    keywords: ["north face", "jacket", "winter jacket", "puffer jacket", "down jacket"],
    category: "clothing",
    alternatives: [
      { name: "Columbia Powder Lite Jacket", price: 99, reason: "Warm, lightweight, affordable" },
      { name: "Marmot PreCip Eco Jacket", price: 109, reason: "Waterproof, packable design" },
      { name: "Patagonia Nano Puff", price: 179, reason: "Premium insulation, lighter weight" },
    ],
  },
  {
    keywords: ["nespresso", "coffee machine", "espresso machine", "coffee maker"],
    category: "home",
    alternatives: [
      { name: "De'Longhi Stilosa EC230", price: 69, reason: "Manual espresso, great starter" },
      { name: "Keurig K-Slim", price: 89, reason: "Convenient pod system" },
      { name: "Moka Pot + Grinder", price: 45, reason: "Authentic espresso, no pods needed" },
    ],
  },
  {
    keywords: ["dyson", "vacuum", "dyson vacuum", "robot vacuum"],
    category: "home",
    alternatives: [
      { name: "Shark IZ462H", price: 199, reason: "Comparable suction, much cheaper" },
      { name: "Eufy RoboVac 11S", price: 149, reason: "Reliable robot vacuum at low price" },
      { name: "Bissell CrossWave", price: 179, reason: "Vacuums and mops simultaneously" },
    ],
  },
  {
    keywords: ["gym", "gym membership", "fitness membership", "crossfit"],
    category: "sports",
    alternatives: [
      { name: "Planet Fitness Membership", price: 10, reason: "Basic gym at minimal cost/month" },
      { name: "Resistance Bands Set", price: 29, reason: "Home workout, one-time purchase" },
      { name: "YouTube + Free Weights", price: 49, reason: "Dumbbells + free workout content" },
    ],
  },
  {
    keywords: ["laptop", "notebook", "computer", "pc"],
    category: "electronics",
    alternatives: [
      { name: "Acer Aspire 5", price: 549, reason: "Great budget laptop for daily tasks" },
      { name: "HP Pavilion 15", price: 629, reason: "Solid all-rounder" },
      { name: "Lenovo IdeaPad 5", price: 679, reason: "Good build quality, AMD performance" },
    ],
  },
];

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
