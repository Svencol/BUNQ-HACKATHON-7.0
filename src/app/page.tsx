'use client';

import { useState, useRef } from 'react';
import type { AnalysisResult, Recommendation, BudgetCheck } from '@/lib/analyzer';
import type { RetailerPrice, PriceHistory } from '@/lib/mockData';

const VERDICT_CONFIG: Record<Recommendation, {
  label: string;
  verdict: string;
  verdictColor: string;
}> = {
  BUY:                { label: 'Go for it',             verdict: 'Buy it',  verdictColor: 'text-green-400'   },
  WAIT:               { label: 'Timing is off',         verdict: 'Wait',    verdictColor: 'text-amber-400'   },
  CHOOSE_ALTERNATIVE: { label: 'Better option found',   verdict: 'Switch',  verdictColor: 'text-[#FF7819]'   },
  PRICE_NEEDED:       { label: 'Add price to continue', verdict: '—',       verdictColor: 'text-gray-500'    },
};

const PRICE_STATUS_CONFIG = {
  great_deal:    { label: '🔥 Great deal',    bg: 'bg-green-500/10',  text: 'text-green-400'  },
  good_price:    { label: '👍 Good price',    bg: 'bg-green-500/10',  text: 'text-green-400'  },
  fair:          { label: '➡ Fair price',     bg: 'bg-white/10',      text: 'text-gray-300'   },
  above_average: { label: '⚠ Above average', bg: 'bg-amber-500/10',  text: 'text-amber-400'  },
  overpriced:    { label: '🚨 Overpriced',    bg: 'bg-red-500/10',    text: 'text-red-400'    },
};

export default function Home() {
  const [productName, setProductName]   = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productUrl, setProductUrl]     = useState('');
  const [userBudget, setUserBudget]     = useState('');
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState<AnalysisResult | null>(null);
  const [error, setError]               = useState('');

  const [scanning, setScanning]         = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanHint, setScanHint]         = useState('');
  const [fetchingUrl, setFetchingUrl]   = useState(false);
  const [urlHint, setUrlHint]           = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setScanning(true);
    setScanHint('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/scan', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.name) setProductName(data.name);
      if (data.price != null) setProductPrice(String(data.price));

      if (data.error) {
        setScanHint(`Scan error: ${data.error}`);
      } else if (data.isProduct === false) {
        setScanHint('No product detected — fill in manually');
      } else if (data.name && data.needsManualPrice) {
        setScanHint(`Found "${data.name}" — please enter the price`);
      } else if (data.name || data.price != null) {
        setScanHint(`Detected: ${data.name ?? '?'} — €${data.price ?? '?'}`);
      } else {
        setScanHint('Could not read product info — fill in manually');
      }
    } catch {
      setScanHint('Scan failed — fill in manually');
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleFetchFromUrl() {
    if (!productUrl.trim()) return;
    setFetchingUrl(true);
    setUrlHint('');

    try {
      const res = await fetch('/api/fetch-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productUrl.trim() }),
      });
      const data = await res.json();

      if (data.error) { setUrlHint(data.error); return; }

      if (data.productName) setProductName(data.productName);
      if (data.price != null) setProductPrice(String(data.price));

      setUrlHint(
        data.productName || data.price != null
          ? `Got: ${data.productName ?? '?'} — €${data.price ?? '?'}`
          : 'Could not extract product info from that page'
      );
    } catch {
      setUrlHint('Could not fetch from URL');
    } finally {
      setFetchingUrl(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productName.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName.trim(),
          productPrice: productPrice ? parseFloat(productPrice) : undefined,
          productUrl: productUrl.trim() || undefined,
          userBudget: userBudget ? parseFloat(userBudget) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#1C1C1C]">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1C1C1C]/95 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-lg mx-auto px-5 py-3.5 flex items-center justify-between">
          <img src="/bunq-logo.svg" alt="bunq" className="h-5 invert" />
          <span className="text-xs text-gray-500 font-medium tracking-wide">Smart Purchase Assistant</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 pt-10 pb-16 space-y-4">

        {/* Hero */}
        <div className="pb-4">
          <h1 className="text-[2.75rem] font-black text-white leading-[1.1] tracking-tight">
            Should you<br />buy it?
          </h1>
          <p className="text-gray-400 mt-3 text-[15px] leading-relaxed">
            Scan a product. See smarter spending advice.
          </p>
        </div>

        {/* Input card */}
        <section className="bg-white rounded-3xl p-5">

          {/* Photo scan */}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageScan} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="w-full mb-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#FF7819] hover:bg-orange-50/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          >
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Product" className="w-full h-36 object-cover" />
                {scanning && (
                  <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-[#FF7819]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-sm font-semibold text-[#FF7819]">AI is reading the image…</span>
                  </div>
                )}
                {!scanning && scanHint && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-3 py-1.5">
                    <p className="text-xs text-white">{scanHint}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-7 flex flex-col items-center gap-2">
                <span className="text-3xl">📷</span>
                <span className="text-sm font-bold text-gray-800">Snap or upload a product photo</span>
                <span className="text-xs text-gray-400">AI reads the name &amp; price for you</span>
              </div>
            )}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or enter manually</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Product name" required input={
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. iPhone 15 Pro, MacBook Air, Dyson V12…" required className="input" />
            } />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (€)" hint="optional" input={
                <input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="e.g. 1199" min="1" step="0.01" className="input" />
              } />
              <Field label="My budget" hint="optional" input={
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">€</span>
                  <input type="number" value={userBudget} onChange={(e) => setUserBudget(e.target.value)}
                    placeholder="max spend" min="1" step="1" className="input pl-7" />
                </div>
              } />
            </div>

            <Field label="Product link" hint="optional" input={
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input type="url" value={productUrl} onChange={(e) => { setProductUrl(e.target.value); setUrlHint(''); }}
                    placeholder="https://..." className="input flex-1" />
                  {productUrl.trim() && (
                    <button type="button" onClick={handleFetchFromUrl} disabled={fetchingUrl}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-xl text-sm font-medium transition-colors flex-shrink-0 whitespace-nowrap">
                      {fetchingUrl ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : '⬇ Fetch'}
                    </button>
                  )}
                </div>
                {urlHint && (
                  <p className={`text-xs px-1 ${urlHint.startsWith('Got:') ? 'text-[#FF7819]' : 'text-gray-400'}`}>
                    {urlHint}
                  </p>
                )}
              </div>
            } />

            <button type="submit" disabled={loading || !productName.trim()}
              className="w-full bg-[#FF7819] hover:bg-[#e5681a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-4 rounded-full text-sm transition-colors">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {productPrice ? 'Analyzing…' : 'Finding alternatives…'}
                </span>
              ) : productPrice ? 'Analyze Purchase →' : 'Find Alternatives →'}
            </button>
          </form>
        </section>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 text-sm text-red-400">{error}</div>
        )}

        {result && <AnalysisResults result={result} />}
      </div>
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function Field({ label, required, hint, input }: {
  label: string; required?: boolean; hint?: string; input: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1.5">
        {label}
        {required && <span className="text-[#FF7819] ml-0.5">*</span>}
        {hint && <span className="text-gray-400 font-normal ml-1 text-xs">({hint})</span>}
      </label>
      {input}
    </div>
  );
}

function AnalysisResults({ result }: { result: AnalysisResult }) {
  const vcfg = VERDICT_CONFIG[result.recommendation];

  return (
    <div className="space-y-4">

      {/* Verdict hero card */}
      <div className="bg-[#262626] rounded-3xl p-6">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">Verdict</p>
        {result.recommendation === 'PRICE_NEEDED' ? (
          <>
            <p className="text-3xl font-black text-gray-400 leading-tight">Add a price</p>
            <p className="text-gray-500 text-sm mt-1">Enter the price above for a BUY / WAIT / SWITCH verdict.</p>
          </>
        ) : (
          <>
            <p className={`text-5xl font-black ${vcfg.verdictColor} leading-tight`}>{vcfg.verdict}</p>
            <p className="text-gray-400 text-sm mt-1">{vcfg.label}</p>
          </>
        )}

        <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-white font-bold truncate">{result.productName}</p>
            <span className="inline-block text-xs text-gray-500 bg-white/5 rounded-full px-2.5 py-0.5 mt-1">
              {result.categoryLabel}
            </span>
          </div>
          {result.priceKnown && result.productPrice > 0 && (
            <p className="text-2xl font-black text-white flex-shrink-0">€{result.productPrice.toLocaleString()}</p>
          )}
        </div>

        {result.priceKnown && result.confidence > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600 bg-white/5 px-3 py-1 rounded-full">
              {result.confidence}% confidence
            </span>
            {result.productUrl && (
              <a href={result.productUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#FF7819] hover:underline">View product →</a>
            )}
          </div>
        )}
      </div>

      {/* bunq budget insight */}
      <div className="bg-[#FF7819]/10 border border-[#FF7819]/20 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <img src="/bunq-logo.svg" alt="bunq" className="h-3.5 invert opacity-60" />
          <p className="text-xs font-bold text-[#FF7819] uppercase tracking-widest">Budget Insight</p>
        </div>
        <p className="text-white text-sm font-medium leading-relaxed">
          This purchase is <span className="text-[#FF7819] font-bold">€79 over</span> your monthly shopping budget.
        </p>
        <p className="text-gray-500 text-xs mt-1.5">Based on your bunq spending patterns for this category.</p>
      </div>

      {/* Budget check */}
      {result.budgetCheck && <BudgetCheckCard check={result.budgetCheck} productPrice={result.productPrice} />}

      {/* Retailers */}
      {result.retailers.length > 0 && <RetailerCard retailers={result.retailers} productPrice={result.productPrice} />}

      {/* Price history */}
      {result.priceHistory && (
        <PriceHistoryCard history={result.priceHistory} currentPrice={result.productPrice} />
      )}

      {/* Alternatives */}
      {result.alternatives.length > 0 && (
        <div className="bg-[#262626] rounded-3xl p-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Similar Alternatives</h3>
          <div className="divide-y divide-white/5">
            {result.alternatives.map((alt, i) => (
              <div key={i} className="flex items-start justify-between py-3.5 gap-4 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{alt.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alt.reason}</p>
                  {alt.url && (
                    <a href={alt.url} target="_blank" rel="noopener noreferrer" className="text-[#FF7819] text-xs hover:underline">
                      View →
                    </a>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-white">€{alt.price.toLocaleString()}</p>
                  {result.priceKnown && alt.price < result.productPrice && (
                    <p className="text-xs font-semibold text-[#FF7819]">
                      Save €{(result.productPrice - alt.price).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best saving — orange hero */}
      {result.priceKnown && result.estimatedSavings > 0 && (
        <div className="bg-[#FF7819] rounded-3xl p-6 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-semibold">Best saving</p>
            <p className="text-white/60 text-xs mt-0.5">vs. {result.bestAlternative?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-white">€{result.estimatedSavings.toLocaleString()}</p>
            <p className="text-white/70 text-xs">{result.savingsPercent}% less</p>
          </div>
        </div>
      )}

      {/* AI explanation */}
      {result.priceKnown && (
        <div className="bg-[#262626] rounded-3xl p-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Why this verdict?</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{result.explanation}</p>
        </div>
      )}

    </div>
  );
}

function BudgetCheckCard({ check, productPrice }: { check: BudgetCheck; productPrice: number }) {
  return (
    <div className={`rounded-3xl p-5 ${check.withinBudget ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Budget Check</h3>
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-500">Your limit:</span>
            <span className="font-semibold text-white">€{check.userBudget.toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500">Product:</span>
            <span className="font-semibold text-white">€{productPrice.toLocaleString()}</span>
          </div>
        </div>
        <div className={`text-right font-bold ${check.withinBudget ? 'text-green-400' : 'text-red-400'}`}>
          {check.withinBudget
            ? <><span className="text-lg">✓ Within budget</span><br /><span className="text-sm font-normal text-green-500">€{(check.userBudget - productPrice).toLocaleString()} to spare</span></>
            : <><span className="text-lg">€{check.overBy.toLocaleString()} over</span><br /><span className="text-sm font-normal text-red-400/70">exceeds limit</span></>
          }
        </div>
      </div>
      {!check.withinBudget && check.bestOptionInBudget && (
        <div className="bg-white/5 rounded-2xl px-4 py-2.5 text-sm">
          <span className="text-gray-400">Best in-budget: </span>
          <span className="font-semibold text-white">{check.bestOptionInBudget.name}</span>
          <span className="text-[#FF7819] font-semibold ml-2">€{check.bestOptionInBudget.price.toLocaleString()}</span>
        </div>
      )}
      {!check.withinBudget && !check.canAffordAnyAlternative && (
        <p className="text-xs text-red-400/70 mt-2">No alternatives within €{check.userBudget.toLocaleString()}</p>
      )}
    </div>
  );
}

function RetailerCard({ retailers, productPrice }: { retailers: RetailerPrice[]; productPrice: number }) {
  return (
    <div className="bg-[#262626] rounded-3xl p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Where to Buy</h3>
      <div className="space-y-2">
        {retailers.map((r, i) => (
          <div key={i} className={`flex items-center justify-between py-2.5 px-4 rounded-2xl ${i === 0 ? 'bg-[#FF7819]/10 border border-[#FF7819]/20' : 'bg-white/5'}`}>
            <div className="flex items-center gap-2 min-w-0">
              {i === 0 && (
                <span className="text-xs font-bold text-[#FF7819] bg-[#FF7819]/10 px-2 py-0.5 rounded-full flex-shrink-0">
                  Lowest
                </span>
              )}
              <span className="text-sm font-medium text-white truncate">{r.retailer}</span>
              {r.badge && <span className="text-xs text-gray-600 flex-shrink-0 hidden sm:inline">{r.badge}</span>}
              {!r.inStock && <span className="text-xs text-red-400 flex-shrink-0">Out of stock</span>}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {r.savings > 0 && (
                <span className="text-xs font-semibold text-[#FF7819] hidden sm:inline">Save €{r.savings}</span>
              )}
              {r.url
                ? <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className={`font-bold hover:underline ${i === 0 ? 'text-[#FF7819]' : 'text-white'}`}>
                    €{r.price.toLocaleString()}
                  </a>
                : <span className={`font-bold ${i === 0 ? 'text-[#FF7819]' : 'text-white'}`}>€{r.price.toLocaleString()}</span>
              }
            </div>
          </div>
        ))}
      </div>
      {retailers[0]?.savings > 0 && (
        <p className="text-xs text-gray-600 mt-3 text-right">vs. your found price (€{productPrice.toLocaleString()})</p>
      )}
    </div>
  );
}

function PriceHistoryCard({ history, currentPrice }: { history: PriceHistory; currentPrice: number }) {
  const statusCfg = PRICE_STATUS_CONFIG[history.priceStatus];
  const low  = history.thirtyDayLow;
  const high = history.thirtyDayHigh;
  const range = Math.max(high - low, 1);
  const markerPos = Math.max(4, Math.min(96, ((currentPrice - low) / range) * 100));

  return (
    <div className="bg-[#262626] rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Price History</h3>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
          {statusCfg.label}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>30-day range</span>
          <span>{history.percentVsAvg > 0 ? '+' : ''}{history.percentVsAvg}% vs 6-month avg</span>
        </div>
        <div className="relative h-2 bg-white/10 rounded-full">
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-[#FF7819] rounded-full border-2 border-[#262626] shadow-sm z-10"
            style={{ left: `${markerPos}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-xs font-semibold">
          <span className="text-green-400">€{low.toLocaleString()} <span className="font-normal text-gray-600">low</span></span>
          <span className="text-white">€{currentPrice.toLocaleString()} <span className="font-normal text-gray-600">now</span></span>
          <span className="text-red-400">€{high.toLocaleString()} <span className="font-normal text-gray-600">high</span></span>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-gray-600 border-t border-white/5 pt-3">
        <span>6-month avg: <strong className="text-gray-300">€{history.sixMonthAvg.toLocaleString()}</strong></span>
        <span>All-time low: <strong className="text-gray-300">€{history.allTimeLow.toLocaleString()}</strong></span>
      </div>

      {history.isSeasonalHigh && (
        <p className="mt-2 text-xs text-amber-400 font-medium">📅 Prices typically elevated Nov–Feb</p>
      )}
    </div>
  );
}
