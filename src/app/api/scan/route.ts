import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json({ error: "Unsupported image format. Use JPEG, PNG, GIF, or WebP." }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = imageFile.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `Extract the product name and price from this image.
Look for price tags, shelf labels, product packaging, or any visible pricing.
The price should be in euros. If you see a different currency, convert approximately.
Respond ONLY with valid JSON — no markdown, no explanation:
{"productName": "name here", "price": 0.00}
If you cannot confidently identify the name or price, use null for that field.`,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ productName: null, price: null });
    }

    const jsonMatch = content.text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      return NextResponse.json({ productName: null, price: null });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      productName: typeof parsed.productName === "string" ? parsed.productName : null,
      price: typeof parsed.price === "number" ? parsed.price : null,
    });
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Image scan failed." }, { status: 500 });
  }
}
