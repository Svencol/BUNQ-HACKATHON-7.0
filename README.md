# bunq Purchase Advisor

An AI purchase decision assistant that helps users decide whether to buy, wait, or choose a better option before spending.

## Problem

People often make purchase decisions without enough financial context. They may overspend, miss cheaper vendors, or ignore better alternatives. Banking apps typically show spending after it happens — not before.

## Solution

The app answers: **Should I buy this?**

- User can scan a product image, paste a URL, or enter product details manually
- The app compares mocked vendor prices, alternatives, and simulated bunq spending context
- It returns one clear decision: **BUY**, **WAIT**, or **CHOOSE_ALTERNATIVE**

## How it works

1. Input product by image, URL, or manual entry
2. AI extracts product details from image or URL
3. Deterministic analyzer compares vendor prices, alternatives, budget, and spending context
4. App returns a clear financial recommendation

## AI usage

- Anthropic vision model extracts product name and price from images
- Anthropic text model generates a short, human-readable explanation of the recommendation
- AI handles input understanding and explanation only
- Final decision logic is fully deterministic — for trust and consistency

## Multimodal aspect

Image scanning is the non-text modality. Users can photograph a product or price tag instead of typing. This makes the experience faster and more natural than manual entry.

## Key features

- Image-based product scan
- URL and manual product input
- Mock vendor price comparison
- Ecosystem-aware alternative recommendations
- Clear BUY / WAIT / CHOOSE_ALTERNATIVE decision

## bunq integration

This prototype is designed as a bunq-style pre-purchase feature. It uses simulated bunq spending context for demo reliability. In production, it would connect to bunq transaction data to personalize purchase recommendations based on real budget usage, category spend, and savings goals.

## Tech stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Anthropic SDK

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

```
ANTHROPIC_API_KEY=your_key_here
```

## Demo notes

- Vendor prices are mocked
- bunq spending context is simulated
- Product data is demo-focused (16 products with explicit alias matching)
- The goal is to demonstrate the decision flow and user value, not live data integrations

## Why it matters

This helps users make smarter spending decisions before money leaves their account. Instead of only reviewing purchases after the fact, the app gives real-time financial guidance at the moment of purchase — directly in the context of a banking experience.
