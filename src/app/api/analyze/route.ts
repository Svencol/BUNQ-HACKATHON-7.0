import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeProduct } from "@/lib/analyzer";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, productPrice, productUrl, userBudget } = body;

    if (!productName || typeof productName !== "string") {
      return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    }
    const price = typeof productPrice === "number" && productPrice > 0 ? productPrice : 0;

    if (price > 50000) {
      return NextResponse.json({ error: "Price looks unusual. Please check the amount." }, { status: 400 });
    }

    const result = analyzeProduct(
      productName.trim(),
      price,
      productUrl?.trim() || undefined,
      typeof userBudget === "number" && userBudget > 0 ? userBudget : undefined
    );

    // Skip AI explanation when price is unknown or product is unknown
    if (result.recommendation === "PRICE_NEEDED" || result.fallback) {
      return NextResponse.json(result);
    }

    const aiExplanation = await generateExplanation(result);
    return NextResponse.json({ ...result, explanation: aiExplanation });
  } catch {
    return NextResponse.json({ error: "Failed to analyze product." }, { status: 500 });
  }
}

async function generateExplanation(result: ReturnType<typeof analyzeProduct>): Promise<string> {
  const {
    productName, productPrice, recommendation, bestAlternative, estimatedSavings,
    savingsPercent, categoryLabel, priceHistory, budgetCheck,
    cheapestRetailer, retailerSavings,
  } = result;

  if (!priceHistory) return result.explanation;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `You are a smart personal finance advisor helping someone decide on a purchase.

Product: ${productName} — €${productPrice} (${categoryLabel})
Recommendation: ${recommendation}

${budgetCheck
  ? `User's budget for this purchase: €${budgetCheck.userBudget} — ${budgetCheck.withinBudget ? "within budget" : `over by €${budgetCheck.overBy}`}`
  : "No personal budget set."}
${cheapestRetailer && retailerSavings > 0
  ? `Cheapest retailer found: ${cheapestRetailer.retailer} at €${cheapestRetailer.price} (saves €${retailerSavings})`
  : ""}
Price vs 6-month average: ${priceHistory.percentVsAvg > 0 ? "+" : ""}${priceHistory.percentVsAvg}% — status: ${priceHistory.priceStatus} (avg €${priceHistory.sixMonthAvg}, 30-day low €${priceHistory.thirtyDayLow})
${bestAlternative ? `Best similar alternative: ${bestAlternative.name} at €${bestAlternative.price} (saves €${estimatedSavings} / ${savingsPercent}%)` : "No cheaper alternatives found."}

Write 2-3 sentences explaining the ${recommendation} recommendation. Use specific numbers. Sound like a knowledgeable friend, not a bot. No filler opener.`,
        },
      ],
    });

    const content = message.content[0];
    return content.type === "text" ? content.text : result.explanation;
  } catch {
    return result.explanation;
  }
}
