# AI Financial Assistant

> Hackathon MVP — Should you buy it? Get a smart purchase recommendation based on your spending habits.

## What it does

Enter any product name and price. The app will:

1. **Identify cheaper alternatives** from a curated product database
2. **Calculate estimated savings** if you choose an alternative
3. **Give a clear recommendation**: Buy / Wait / Choose Alternative
4. **Explain the reasoning** based on mock spending data (budget usage, category overspend, savings goal)

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How to use

1. Check your **budget overview** at the top — see what you've spent this month
2. Enter a **product name** (e.g. `iPhone 15 Pro`, `MacBook Air`, `Dyson V12`, `Nike Air Max`)
3. Enter the **price in euros**
4. Optionally paste a **product link**
5. Click **Analyze Purchase**
6. See: alternatives, savings estimate, recommendation, and spending context

## Example products to try

| Product | Price |
|---|---|
| iPhone 15 Pro | €1199 |
| MacBook Air M2 | €1299 |
| Sony WH-1000XM5 | €349 |
| Dyson V12 | €599 |
| Nike Air Max 270 | €150 |
| PS5 | €499 |

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — styling
- **Mock data only** — no auth, no database, no external APIs

## Project structure

```
src/
  app/
    page.tsx              # Main UI (client component)
    globals.css           # Tailwind + base styles
    api/
      analyze/
        route.ts          # POST /api/analyze — runs the analysis
  lib/
    mockData.ts           # Mock spending data + product alternatives database
    analyzer.ts           # Recommendation logic (BUY / WAIT / CHOOSE_ALTERNATIVE)
```

## Recommendation logic

| Condition | Result |
|---|---|
| Cheaper alternative saves ≥ 25% | Choose Alternative |
| Over category budget OR can't afford from monthly buffer | Wait |
| Otherwise | Buy |

## Mock data

- Monthly budget: **€2,500** (€1,920 spent)
- Savings goal: **€500** (€290 saved)
- Product database covers: phones, laptops, earbuds, headphones, tablets, TVs, gaming consoles, shoes, jackets, coffee machines, vacuums, and more
