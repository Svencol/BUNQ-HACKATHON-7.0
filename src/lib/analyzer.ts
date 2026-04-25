import {
  productDatabase,
  findCategory,
  findRetailers,
  getMockPriceHistory,
  findProductEcosystem,
  Alternative,
  RetailerPrice,
  PriceHistory,
  VendorPrice,
  ProductEntry,
} from "./mockData";

export type Recommendation = "BUY" | "WAIT" | "CHOOSE_ALTERNATIVE" | "PRICE_NEEDED";

export interface BudgetCheck {
  userBudget: number;
  withinBudget: boolean;
  overBy: number;
  bestOptionInBudget: Alternative | null;
  canAffordAnyAlternative: boolean;
}

export interface AnalysisResult {
  productName: string;
  productPrice: number;
  productUrl?: string;
  category: string;
  categoryLabel: string;

  retailers: RetailerPrice[];
  cheapestRetailer: RetailerPrice | null;
  retailerSavings: number;

  alternatives: Alternative[];
  bestAlternative: Alternative | null;
  estimatedSavings: number;
  savingsPercent: number;

  priceHistory?: PriceHistory; // absent when price is unknown
  budgetCheck?: BudgetCheck;

  recommendation: Recommendation;
  confidence: number; // 0–100
  explanation: string;
  priceKnown: boolean;

  productEcosystem: string;
  bestSameEcosystemAlternative: Alternative | null;
  bestCrossEcosystemAlternative: Alternative | null;
  recommendedAlternative: Alternative | null;
  switchesEcosystem: boolean;
  ecosystemNote: string;

  vendors: VendorPrice[];
  cheapestVendor: VendorPrice | null;
  vendorSavings: number;

  fallback: boolean;
}

const ECOSYSTEM_NOTES: Partial<Record<string, Partial<Record<string, string>>>> = {
  apple: {
    android:      "Switching away from Apple means losing iMessage, AirDrop, and sync with your Mac or iPad. Your AirPods stay compatible but lose some features.",
    windows:      "Windows offers more flexibility, but you'll lose iCloud integration and Handoff with your other Apple devices.",
    'sony-audio': "Sony earbuds work with any device but lose Apple-specific features like automatic ear detection and Siri integration.",
  },
  android: {
    apple: "Moving to iOS is a different ecosystem — Android apps won't transfer. If you own other Apple products, the integration is worth it.",
  },
  playstation: {
    xbox:      "Xbox Game Pass is excellent value, but PlayStation exclusives (God of War, Spider-Man) stay locked to PS. Your PS Plus library won't transfer.",
    nintendo:  "Nintendo Switch is a very different experience — portable-first, family-friendly titles. PS exclusives won't be available.",
  },
  xbox: {
    playstation: "PlayStation has strong exclusives not available on Xbox. Your Game Pass subscription won't carry over.",
    nintendo:    "Nintendo offers portability and unique exclusives. Xbox Game Pass won't be available on Switch.",
  },
  nintendo: {
    playstation: "PlayStation offers higher performance and mature exclusives. You'll lose Nintendo's portable gaming format.",
    xbox:        "Xbox offers more performance and Game Pass value. Nintendo exclusives (Zelda, Mario) stay with Nintendo.",
  },
  nespresso: {
    generic: "Moving away from Nespresso means no Nespresso pod compatibility — but you gain freedom from proprietary capsule costs.",
  },
  dyson: {
    generic: "Third-party vacuums can match Dyson's performance at lower cost, but lack Dyson's advanced filtration and premium build.",
  },
  nike: {
    adidas: "Adidas Boost cushioning feels different from Nike Air. Fit and sizing vary between brands — worth trying on if possible.",
  },
  adidas: {
    nike: "Nike Air cushioning is different from Adidas Boost. Performance and sizing vary between brands.",
  },
  'north-face': {
    generic: "Columbia and Patagonia offer similar warmth and weather resistance. Slightly different fit profile than North Face.",
  },
};

function normalizeInput(input: string): string {
  return input.toLowerCase().trim()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function getStrongProductMatch(inputName: string): ProductEntry | null {
  const normalized = normalizeInput(inputName);
  for (const entry of productDatabase) {
    if (entry.aliases.some(alias => normalizeInput(alias) === normalized)) {
      return entry;
    }
  }
  return null;
}

function getEcosystemSwitchNote(from: string, to: string): string {
  return (
    ECOSYSTEM_NOTES[from]?.[to] ??
    ECOSYSTEM_NOTES[from]?.['generic'] ??
    `Switching brands may affect compatibility with your existing accessories.`
  );
}

export function analyzeProduct(
  productName: string,
  productPrice: number = 0,
  productUrl?: string,
  userBudget?: number
): AnalysisResult {
  const category = findCategory(productName);

  // Electronics/entertainment priced below €10 is almost certainly a data entry error
  if (productPrice > 0 && productPrice < 10 && (category === 'electronics' || category === 'entertainment')) {
    productPrice = 0;
  }

  const priceKnown = productPrice > 0;
  const categoryData = { label: getCategoryLabel(category) };

  // Find matching alternatives and vendors — strict alias match only
  const matchedEntry = getStrongProductMatch(productName);
  const foundInDatabase = matchedEntry !== null;
  const alternatives: Alternative[] = matchedEntry ? matchedEntry.alternatives : [];
  const entryVendors: VendorPrice[] = matchedEntry ? matchedEntry.vendors : [];

  const sortedVendors = [...entryVendors].sort((a, b) => a.price - b.price).slice(0, 4);
  const cheapestVendor = sortedVendors[0] ?? null;
  const vendorSavings =
    sortedVendors.length > 1
      ? sortedVendors[sortedVendors.length - 1].price - sortedVendors[0].price
      : 0;

  // Unknown product — no database match, return fallback immediately
  if (!foundInDatabase) {
    const { ecosystem: productEcosystem } = findProductEcosystem(productName);
    return {
      productName,
      productPrice: priceKnown ? productPrice : 0,
      productUrl,
      category,
      categoryLabel: categoryData.label,
      retailers: [],
      cheapestRetailer: null,
      retailerSavings: 0,
      alternatives: [],
      bestAlternative: null,
      estimatedSavings: 0,
      savingsPercent: 0,
      budgetCheck: undefined,
      recommendation: priceKnown ? "WAIT" : "PRICE_NEEDED",
      confidence: 35,
      explanation: "Limited data available for this product.",
      priceKnown,
      productEcosystem,
      bestSameEcosystemAlternative: null,
      bestCrossEcosystemAlternative: null,
      recommendedAlternative: null,
      switchesEcosystem: false,
      ecosystemNote: '',
      vendors: [],
      cheapestVendor: null,
      vendorSavings: 0,
      fallback: true,
    };
  }

  // No price — return alternatives only, skip all price-based logic
  if (!priceKnown) {
    const alts = alternatives.slice(0, 3);
    const { ecosystem: productEcosystem } = findProductEcosystem(productName);
    const sameEcoAlts = alts.filter(a => a.ecosystem === productEcosystem);
    const crossEcoAlts = alts.filter(a => a.ecosystem !== productEcosystem);
    const bestSameEcosystemAlternative = sameEcoAlts[0] ?? null;
    const bestCrossEcosystemAlternative = crossEcoAlts[0] ?? null;
    const recommendedAlternative = alts[0] ?? null;

    return {
      productName,
      productPrice: 0,
      productUrl,
      category,
      categoryLabel: categoryData.label,
      retailers: [],
      cheapestRetailer: null,
      retailerSavings: 0,
      alternatives: alts,
      bestAlternative: alts[0] ?? null,
      estimatedSavings: 0,
      savingsPercent: 0,
      budgetCheck: undefined,
      recommendation: "PRICE_NEEDED",
      confidence: 0,
      explanation: "Enter the product price for a precise verdict.",
      priceKnown: false,
      productEcosystem,
      bestSameEcosystemAlternative,
      bestCrossEcosystemAlternative,
      recommendedAlternative,
      switchesEcosystem: false,
      ecosystemNote: '',
      vendors: sortedVendors,
      cheapestVendor,
      vendorSavings,
      fallback: false,
    };
  }

  const cheaperAlternatives = alternatives
    .filter((a) => a.price < productPrice)
    .sort((a, b) => a.price - b.price);

  const finalAlternatives =
    cheaperAlternatives.length > 0
      ? cheaperAlternatives
      : alternatives.length > 0
      ? alternatives
      : generateGenericAlternatives(productName, productPrice);

  // Ecosystem classification
  const { ecosystem: productEcosystem } = findProductEcosystem(productName);
  const cheaperAlts = finalAlternatives.filter(a => a.price < productPrice);
  const sameEcoAlts  = cheaperAlts.filter(a => a.ecosystem === productEcosystem).sort((a, b) => a.price - b.price);
  const crossEcoAlts = cheaperAlts.filter(a => a.ecosystem !== productEcosystem).sort((a, b) => a.price - b.price);

  const bestSameEco  = sameEcoAlts[0]  ?? null;
  const bestCrossEco = crossEcoAlts[0] ?? null;

  const sameSavings  = bestSameEco  ? productPrice - bestSameEco.price  : 0;
  const crossSavings = bestCrossEco ? productPrice - bestCrossEco.price : 0;

  // Cross-ecosystem only if it saves >=40% more AND >=€50 more absolute
  const crossIsWorthIt =
    bestCrossEco !== null &&
    bestSameEco  !== null &&
    crossSavings > sameSavings * 1.4 &&
    crossSavings - sameSavings > 50;

  const recommendedAlternative =
    crossIsWorthIt || (bestSameEco === null && bestCrossEco !== null)
      ? bestCrossEco
      : (bestSameEco ?? bestCrossEco ?? finalAlternatives[0] ?? null);

  const switchesEcosystem =
    recommendedAlternative !== null &&
    productEcosystem !== 'generic' &&
    recommendedAlternative.ecosystem !== productEcosystem;

  const ecosystemNote = switchesEcosystem
    ? getEcosystemSwitchNote(productEcosystem, recommendedAlternative!.ecosystem)
    : '';

  const bestAlternative = recommendedAlternative;
  const estimatedSavings = bestAlternative ? Math.max(0, productPrice - bestAlternative.price) : 0;
  const savingsPercent = estimatedSavings > 0 ? Math.round((estimatedSavings / productPrice) * 100) : 0;

  const retailers = findRetailers(productName, productPrice, category);
  const cheapestRetailer = retailers[0] ?? null;
  const retailerSavings = cheapestRetailer ? cheapestRetailer.savings : 0;

  const priceHistory = getMockPriceHistory(productName, productPrice);

  // Per-purchase budget check
  let budgetCheck: BudgetCheck | undefined;
  if (userBudget != null && userBudget > 0) {
    const withinBudget = productPrice <= userBudget;
    const alternativesInBudget = finalAlternatives.filter((a) => a.price <= userBudget);
    budgetCheck = {
      userBudget,
      withinBudget,
      overBy: withinBudget ? 0 : productPrice - userBudget,
      bestOptionInBudget: alternativesInBudget[0] ?? null,
      canAffordAnyAlternative: alternativesInBudget.length > 0,
    };
  }

  const { recommendation, confidence } = computeDecision(
    productPrice, bestAlternative, estimatedSavings, savingsPercent, priceHistory, budgetCheck
  );

  const explanation = buildExplanation(
    productName, productPrice, recommendation, confidence,
    bestAlternative, estimatedSavings, savingsPercent,
    priceHistory, budgetCheck,
    cheapestRetailer, retailerSavings
  );

  return {
    productName,
    productPrice,
    productUrl,
    category,
    categoryLabel: categoryData.label,
    retailers,
    cheapestRetailer,
    retailerSavings,
    alternatives: finalAlternatives.slice(0, 3),
    bestAlternative,
    estimatedSavings,
    savingsPercent,
    priceHistory,
    budgetCheck,
    recommendation,
    confidence,
    explanation,
    priceKnown: true,
    productEcosystem,
    bestSameEcosystemAlternative: bestSameEco,
    bestCrossEcosystemAlternative: bestCrossEco,
    recommendedAlternative,
    switchesEcosystem,
    ecosystemNote,
    vendors: sortedVendors,
    cheapestVendor,
    vendorSavings,
    fallback: false,
  };
}

// Savings below both thresholds are not worth switching for.
const MIN_SAVINGS_ABS = 10;   // €10 minimum to matter
const MIN_SAVINGS_PCT = 5;    // 5% minimum to matter
const STRONG_SAVINGS_PCT = 25;
const STRONG_SAVINGS_ABS = 75;
const HIGH_PRICE_THRESHOLD_PCT = 15; // % above 6-month avg before suggesting WAIT

function computeDecision(
  productPrice: number,
  bestAlternative: Alternative | null,
  estimatedSavings: number,
  savingsPercent: number,
  priceHistory: PriceHistory,
  budgetCheck?: BudgetCheck
): { recommendation: Recommendation; confidence: number } {

  // 1. Over budget — strongest signal
  if (budgetCheck && !budgetCheck.withinBudget) {
    const overRatio = budgetCheck.overBy / budgetCheck.userBudget;
    if (budgetCheck.canAffordAnyAlternative) {
      const confidence = clamp(70 + Math.round(overRatio * 60), 70, 93);
      return { recommendation: "CHOOSE_ALTERNATIVE", confidence };
    } else {
      const confidence = clamp(62 + Math.round(overRatio * 50), 62, 88);
      return { recommendation: "WAIT", confidence };
    }
  }

  const hasMeaningfulSavings =
    estimatedSavings >= MIN_SAVINGS_ABS && savingsPercent >= MIN_SAVINGS_PCT;
  const hasStrongSavings =
    savingsPercent >= STRONG_SAVINGS_PCT || estimatedSavings >= STRONG_SAVINGS_ABS;

  // 2. Strong alternative savings
  if (bestAlternative && hasMeaningfulSavings && hasStrongSavings) {
    let confidence = 72;
    if (savingsPercent >= 35 || estimatedSavings >= 150) confidence += 15;
    else if (savingsPercent >= 25 || estimatedSavings >= 75) confidence += 8;
    // Buying at a historically great price slightly undermines the switch signal
    if (priceHistory.priceStatus === "great_deal") confidence -= 8;
    return { recommendation: "CHOOSE_ALTERNATIVE", confidence: clamp(confidence, 55, 93) };
  }

  // 3. Moderate savings — let price history tip the balance
  if (bestAlternative && hasMeaningfulSavings) {
    if (priceHistory.priceStatus === "great_deal") {
      return { recommendation: "BUY", confidence: 74 };
    }
    if (priceHistory.priceStatus === "good_price") {
      return { recommendation: "BUY", confidence: 64 };
    }
    // Moderate switch signal; confidence reflects it's a close call
    const confidence = clamp(52 + (savingsPercent >= 15 ? 10 : 0), 52, 72);
    return { recommendation: "CHOOSE_ALTERNATIVE", confidence };
  }

  // 4. Price well above average, no compelling alternative → WAIT
  if (priceHistory.percentVsAvg >= HIGH_PRICE_THRESHOLD_PCT) {
    let confidence = 55;
    if (priceHistory.priceStatus === "overpriced") confidence += 20;
    else if (priceHistory.priceStatus === "above_average") confidence += 10;
    if (priceHistory.allTimeLow && priceHistory.allTimeLow < productPrice * 0.8) confidence += 8;
    return { recommendation: "WAIT", confidence: clamp(confidence, 55, 88) };
  }

  // 5. Default BUY — adjust confidence by price history
  let confidence = 62;
  if (priceHistory.priceStatus === "great_deal") confidence += 22;
  else if (priceHistory.priceStatus === "good_price") confidence += 12;
  else if (priceHistory.priceStatus === "above_average") confidence -= 10;
  else if (priceHistory.priceStatus === "overpriced") confidence -= 20;
  // No meaningful alternative reinforces BUY
  if (!hasMeaningfulSavings) confidence += 8;
  return { recommendation: "BUY", confidence: clamp(confidence, 30, 90) };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildExplanation(
  productName: string,
  price: number,
  recommendation: Recommendation,
  confidence: number,
  bestAlt: Alternative | null,
  savings: number,
  savingsPct: number,
  priceHistory: PriceHistory,
  budgetCheck?: BudgetCheck,
  cheapestRetailer?: RetailerPrice | null,
  retailerSavings?: number
): string {
  const certainty = confidence >= 80 ? "Strongly" : confidence >= 65 ? "Likely" : "Possibly";

  switch (recommendation) {
    case "CHOOSE_ALTERNATIVE": {
      if (budgetCheck && !budgetCheck.withinBudget && budgetCheck.bestOptionInBudget) {
        const alt = budgetCheck.bestOptionInBudget;
        const priceNote =
          priceHistory.priceStatus === "above_average" || priceHistory.priceStatus === "overpriced"
            ? " The current price is also above the 6-month average."
            : "";
        return (
          `${certainty} switch. ${productName} at €${price} exceeds your €${budgetCheck.userBudget} budget by €${budgetCheck.overBy}. ` +
          `${alt.name} at €${alt.price} fits your budget and saves you €${price - alt.price}.${priceNote}`
        );
      }
      const retailerNote =
        cheapestRetailer && retailerSavings && retailerSavings > 0
          ? ` Still want this one? ${cheapestRetailer.retailer} has it for €${cheapestRetailer.price}.`
          : "";
      return (
        `${certainty} switch. ${bestAlt?.name} at €${bestAlt?.price} saves you €${savings} (${savingsPct}%) for similar functionality.${retailerNote}`
      );
    }

    case "WAIT": {
      if (budgetCheck && !budgetCheck.withinBudget) {
        return (
          `${certainty} wait. At €${price}, this is €${budgetCheck.overBy} over your €${budgetCheck.userBudget} budget and no alternatives fit within it. ` +
          `The 6-month average is €${priceHistory.sixMonthAvg} — consider waiting for a price drop.`
        );
      }
      const lowNote =
        priceHistory.allTimeLow && priceHistory.allTimeLow < price * 0.85
          ? ` It has been as low as €${priceHistory.allTimeLow} historically.`
          : "";
      return (
        `${certainty} wait. The current price (€${price}) is ${priceHistory.percentVsAvg}% above the 6-month average of €${priceHistory.sixMonthAvg}.${lowNote} A better deal is likely.`
      );
    }

    case "BUY": {
      const timingNote =
        priceHistory.priceStatus === "great_deal"
          ? `Great timing — you're buying well below the 6-month average of €${priceHistory.sixMonthAvg}.`
          : priceHistory.priceStatus === "good_price"
          ? `Good timing — you're buying below the 6-month average of €${priceHistory.sixMonthAvg}.`
          : `Fairly priced relative to the 6-month average of €${priceHistory.sixMonthAvg}.`;
      const altNote =
        cheapestRetailer && retailerSavings && retailerSavings > 0
          ? ` Check ${cheapestRetailer.retailer} at €${cheapestRetailer.price} to save €${retailerSavings}.`
          : savings > 0 && savingsPct >= MIN_SAVINGS_PCT
          ? ` You could save €${savings} with ${bestAlt?.name}, but the switch is marginal.`
          : "";
      return `${certainty} buy. ${timingNote}${altNote}`;
    }

    default:
      return "Enter the product price for a precise verdict.";
  }
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    electronics: "Electronics",
    clothing: "Clothing & Shoes",
    food: "Food & Groceries",
    entertainment: "Entertainment",
    home: "Home & Garden",
    sports: "Sports & Fitness",
    other: "Other",
  };
  return labels[category] ?? "Other";
}

function generateGenericAlternatives(name: string, price: number): Alternative[] {
  return [
    { name: `${name} (Refurbished)`, price: Math.round(price * 0.7), reason: "Certified refurbished — same product, lower price", brand: 'Various', ecosystem: 'generic' },
    { name: `${name} (Previous Gen)`, price: Math.round(price * 0.8), reason: "Last year's model, nearly identical specs", brand: 'Various', ecosystem: 'generic' },
    { name: "Generic / Store Brand", price: Math.round(price * 0.55), reason: "Budget-friendly alternative for the same use case", brand: 'Various', ecosystem: 'generic' },
  ];
}
