import {
  productDatabase,
  findCategory,
  findRetailers,
  getMockPriceHistory,
  Alternative,
  RetailerPrice,
  PriceHistory,
} from "./mockData";

export type Recommendation = "BUY" | "WAIT" | "CHOOSE_ALTERNATIVE";

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

  priceHistory: PriceHistory;
  budgetCheck?: BudgetCheck;

  recommendation: Recommendation;
  explanation: string;
}

export function analyzeProduct(
  productName: string,
  productPrice: number,
  productUrl?: string,
  userBudget?: number
): AnalysisResult {
  const category = findCategory(productName);
  const categoryData = { label: getCategoryLabel(category) };
  const lower = productName.toLowerCase();

  // Find matching alternatives
  let alternatives: Alternative[] = [];
  for (const entry of productDatabase) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      alternatives = entry.alternatives;
      break;
    }
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

  const bestAlternative = finalAlternatives[0] ?? null;
  const estimatedSavings = bestAlternative ? Math.max(0, productPrice - bestAlternative.price) : 0;
  const savingsPercent =
    estimatedSavings > 0 ? Math.round((estimatedSavings / productPrice) * 100) : 0;

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

  // Recommendation
  let recommendation: Recommendation;
  if (budgetCheck && !budgetCheck.withinBudget) {
    recommendation = budgetCheck.canAffordAnyAlternative ? "CHOOSE_ALTERNATIVE" : "WAIT";
  } else if (savingsPercent >= 20 && bestAlternative) {
    recommendation = "CHOOSE_ALTERNATIVE";
  } else {
    recommendation = "BUY";
  }

  const explanation = buildExplanation(
    productName, productPrice, recommendation,
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
    explanation,
  };
}

function buildExplanation(
  productName: string,
  price: number,
  recommendation: Recommendation,
  bestAlt: Alternative | null,
  savings: number,
  savingsPct: number,
  priceHistory: PriceHistory,
  budgetCheck?: BudgetCheck,
  cheapestRetailer?: RetailerPrice | null,
  retailerSavings?: number
): string {
  switch (recommendation) {
    case "CHOOSE_ALTERNATIVE":
      if (budgetCheck && !budgetCheck.withinBudget && budgetCheck.bestOptionInBudget) {
        return (
          `${productName} at €${price} exceeds your €${budgetCheck.userBudget} budget by €${budgetCheck.overBy}. ` +
          `${budgetCheck.bestOptionInBudget.name} at €${budgetCheck.bestOptionInBudget.price} fits your budget. ` +
          `${priceHistory.priceStatus === "above_average" || priceHistory.priceStatus === "overpriced" ? "The current price is also above the 6-month average — consider waiting for a deal." : ""}`
        );
      }
      return (
        `${bestAlt?.name} at €${bestAlt?.price} saves you €${savings} (${savingsPct}%) for similar functionality. ` +
        `${cheapestRetailer && retailerSavings && retailerSavings > 0 ? `If you still prefer this product, ${cheapestRetailer.retailer} has it for €${cheapestRetailer.price}.` : ""}`
      );

    case "WAIT":
      if (budgetCheck && !budgetCheck.withinBudget) {
        return (
          `At €${price}, this is €${budgetCheck.overBy} over your €${budgetCheck.userBudget} budget, and no alternatives fit within it. ` +
          `The 6-month average price is €${priceHistory.sixMonthAvg} — consider waiting for a price drop or saving a bit more.`
        );
      }
      return (
        `The current price of €${price} is ${priceHistory.percentVsAvg > 0 ? `${priceHistory.percentVsAvg}% above` : "near"} the 6-month average. ` +
        `${priceHistory.allTimeLow ? `It has been as low as €${priceHistory.allTimeLow} historically.` : ""} Consider waiting for a better deal.`
      );

    case "BUY":
      return (
        `${priceHistory.priceStatus === "great_deal" || priceHistory.priceStatus === "good_price"
          ? `Good timing — you're buying below the 6-month average of €${priceHistory.sixMonthAvg}.`
          : `This is fairly priced relative to recent history.`} ` +
        `${cheapestRetailer && retailerSavings && retailerSavings > 0
          ? `Check ${cheapestRetailer.retailer} at €${cheapestRetailer.price} to save €${retailerSavings}.`
          : savingsPct > 0 ? `You could save €${savings} with ${bestAlt?.name}, but if you prefer this product, it's a reasonable buy.` : "No significantly cheaper alternatives found."}`
      );
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
    { name: `${name} (Refurbished)`, price: Math.round(price * 0.7), reason: "Certified refurbished — same product, lower price" },
    { name: `${name} (Previous Gen)`, price: Math.round(price * 0.8), reason: "Last year's model, nearly identical specs" },
    { name: "Generic / Store Brand", price: Math.round(price * 0.55), reason: "Budget-friendly alternative for the same use case" },
  ];
}
