import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({ error: "Could not access that URL." }, { status: 422 });
    }

    const html = await res.text();

    // 1. Try JSON-LD structured data first (fastest, most reliable)
    const jsonLd = extractFromJsonLd(html);
    if (jsonLd.productName && jsonLd.price) return NextResponse.json(jsonLd);

    // 2. Try Open Graph / meta price tags
    const meta = extractFromMeta(html);
    if (meta.productName && meta.price) return NextResponse.json(meta);

    // 3. Strip tags → plain text → Claude
    const plainText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 6000);

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `Extract the product name and price from this webpage text. Price in euros (€). If another currency is shown, convert approximately.
Respond ONLY with JSON — no markdown: {"productName": "...", "price": 0.00}
Use null for any field you cannot confidently identify.

Page text:
${plainText}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") return NextResponse.json({ productName: null, price: null });

    const jsonMatch = content.text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return NextResponse.json({ productName: null, price: null });

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      productName: typeof parsed.productName === "string" ? parsed.productName : null,
      price: typeof parsed.price === "number" ? parsed.price : null,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out." }, { status: 408 });
    }
    return NextResponse.json({ error: "Could not fetch from URL." }, { status: 500 });
  }
}

function extractFromJsonLd(html: string): { productName: string | null; price: number | null } {
  const matches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  for (const match of matches) {
    try {
      const data = JSON.parse(match[1]);
      const items: unknown[] = Array.isArray(data) ? data : [data];

      for (const item of items) {
        const candidates = [
          item,
          ...(Array.isArray((item as Record<string, unknown>)["@graph"])
            ? ((item as Record<string, unknown>)["@graph"] as unknown[])
            : []),
        ];

        for (const c of candidates) {
          const obj = c as Record<string, unknown>;
          if (obj["@type"] !== "Product") continue;

          const name = typeof obj.name === "string" ? obj.name : null;
          const offers = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
          const priceRaw = (offers as Record<string, unknown> | undefined)?.price;
          const price = priceRaw != null ? parseFloat(String(priceRaw)) : null;

          if (name && price && !isNaN(price)) return { productName: name, price };
        }
      }
    } catch {
      continue;
    }
  }
  return { productName: null, price: null };
}

function extractFromMeta(html: string): { productName: string | null; price: number | null } {
  const nameMatch =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);

  const priceMatch =
    html.match(/<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']product:price:amount["']/i) ||
    html.match(/<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i);

  const price = priceMatch ? parseFloat(priceMatch[1]) : null;

  return {
    productName: nameMatch ? nameMatch[1] : null,
    price: price && !isNaN(price) ? price : null,
  };
}
