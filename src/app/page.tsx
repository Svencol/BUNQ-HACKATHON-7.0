'use client';

import { useState, useRef } from 'react';
import type { AnalysisResult, Recommendation, BudgetCheck } from '@/lib/analyzer';
import type { RetailerPrice, PriceHistory } from '@/lib/mockData';

const RECOMMENDATION_CONFIG: Record<
  Recommendation,
  { label: string; emoji: string; bg: string; border: string; text: string }
> = {
  BUY:                { label: 'Go ahead and buy it',   emoji: '✅', bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800' },
  WAIT:               { label: 'Better to wait',        emoji: '⏳', bg: 'bg-amber-50',   border: 'border-amber-400',   text: 'text-amber-800'   },
  CHOOSE_ALTERNATIVE: { label: 'Choose an alternative', emoji: '🔀', bg: 'bg-blue-50',    border: 'border-blue-400',    text: 'text-blue-800'    },
};

const PRICE_STATUS_CONFIG = {
  great_deal:    { label: '🔥 Great deal',    bg: 'bg-emerald-100', text: 'text-emerald-700' },
  good_price:    { label: '👍 Good price',    bg: 'bg-emerald-50',  text: 'text-emerald-600' },
  fair:          { label: '➡ Fair price',     bg: 'bg-gray-100',    text: 'text-gray-600'    },
  above_average: { label: '⚠ Above average', bg: 'bg-amber-50',    text: 'text-amber-600'   },
  overpriced:    { label: '🚨 Overpriced',    bg: 'bg-red-50',      text: 'text-red-600'     },
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

      if (data.productName) setProductName(data.productName);
      if (data.price != null) setProductPrice(String(data.price));

      setScanHint(
        data.productName || data.price != null
          ? `Detected: ${data.productName ?? '?'} — €${data.price ?? '?'}`
          : 'Could not read product info — fill in manually'
      );
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

      if (data.error) {
        setUrlHint(data.error);
        return;
      }

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
    if (!productName.trim() || !productPrice) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName.trim(),
          productPrice: parseFloat(productPrice),
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
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">💰 AI Financial Assistant</h1>
          <p className="text-xs text-gray-500">Should you buy it? Get an AI-powered recommendation.</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Input card */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Analyze a Purchase</h2>

          {/* Photo scan */}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageScan} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="w-full mb-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          >
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Product" className="w-full h-36 object-cover" />
                {scanning && (
                  <div className="absolute inset-0 bg-white/75 flex flex-col items-center justify-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-700">AI is reading the image…</span>
                  </div>
                )}
                {!scanning && scanHint && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-3 py-1.5">
                    <p className="text-xs text-white">{scanHint}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center gap-1.5">
                <span className="text-3xl">📷</span>
                <span className="text-sm font-semibold text-gray-700">Snap or upload a product photo</span>
                <span className="text-xs text-gray-400">AI reads the name &amp; price for you</span>
              </div>
            )}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or enter manually</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Product name" required input={
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. iPhone 15 Pro, MacBook Air, Dyson V12…" required className="input" />
            } />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (€)" required input={
                <input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="e.g. 1199" required min="1" step="0.01" className="input" />
              } />
              <Field label="My budget for this" hint="optional" input={
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">€</span>
                  <input type="number" value={userBudget} onChange={(e) => setUserBudget(e.target.value)}
                    placeholder="max I want to spend" min="1" step="1" className="input pl-7" />
                </div>
              } />
            </div>

            <Field label="Product link" hint="optional — AI can extract price from it" input={
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
                      ) : '⬇ Fetch details'}
                    </button>
                  )}
                </div>
                {urlHint && (
                  <p className={`text-xs px-1 ${urlHint.startsWith('Got:') ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {urlHint}
                  </p>
                )}
              </div>
            } />

            <button type="submit" disabled={loading || !productName.trim() || !productPrice}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-semibold py-3 rounded-xl text-sm transition-colors">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing…
                </span>
              ) : 'Analyze Purchase →'}
            </button>
          </form>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">{error}</div>
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
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && <span className="text-gray-400 font-normal ml-1 text-xs">({hint})</span>}
      </label>
      {input}
    </div>
  );
}

function AnalysisResults({ result }: { result: AnalysisResult }) {
  const cfg = RECOMMENDATION_CONFIG[result.recommendation];

  return (
    <div className="space-y-4">

      {/* Recommendation */}
      <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-5`}>
        <div className="flex items-center gap-4">
          <span className="text-5xl leading-none">{cfg.emoji}</span>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest opacity-60 ${cfg.text}`}>Recommendation</p>
            <p className={`text-2xl font-bold ${cfg.text}`}>
              {result.recommendation === 'BUY' ? 'Buy' : result.recommendation === 'WAIT' ? 'Wait' : 'Choose Alternative'}
            </p>
            <p className={`text-sm mt-0.5 opacity-80 ${cfg.text}`}>{cfg.label}</p>
          </div>
        </div>
      </div>

      {/* Product */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Product Analyzed</h3>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-lg leading-tight">{result.productName}</p>
            <span className="inline-block text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 mt-1.5">{result.categoryLabel}</span>
            {result.productUrl && (
              <a href={result.productUrl} target="_blank" rel="noopener noreferrer" className="block text-blue-500 text-xs mt-1 hover:underline">
                View product →
              </a>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 flex-shrink-0">€{result.productPrice.toLocaleString()}</p>
        </div>
      </div>

      {/* Budget check */}
      {result.budgetCheck && <BudgetCheckCard check={result.budgetCheck} productPrice={result.productPrice} />}

      {/* Retailer comparison */}
      {result.retailers.length > 0 && <RetailerCard retailers={result.retailers} productPrice={result.productPrice} />}

      {/* Price history */}
      <PriceHistoryCard history={result.priceHistory} currentPrice={result.productPrice} />

      {/* Similar alternatives */}
      {result.alternatives.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Similar Alternatives</h3>
          <div className="divide-y divide-gray-100">
            {result.alternatives.map((alt, i) => (
              <div key={i} className="flex items-start justify-between py-3 gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{alt.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alt.reason}</p>
                  {alt.url && <a href={alt.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline">View →</a>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">€{alt.price.toLocaleString()}</p>
                  {alt.price < result.productPrice && (
                    <p className="text-xs font-semibold text-emerald-600">Save €{(result.productPrice - alt.price).toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best saving */}
      {result.estimatedSavings > 0 && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Best Possible Saving</p>
            <p className="text-xs text-emerald-600">vs. {result.bestAlternative?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-700">€{result.estimatedSavings.toLocaleString()}</p>
            <p className="text-xs text-emerald-600">{result.savingsPercent}% less</p>
          </div>
        </div>
      )}

      {/* AI Explanation */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Why this recommendation?</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{result.explanation}</p>
      </div>

    </div>
  );
}

function BudgetCheckCard({ check, productPrice }: { check: BudgetCheck; productPrice: number }) {
  return (
    <div className={`rounded-2xl border p-5 ${check.withinBudget ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3 text-gray-500">Your Budget Check</h3>
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1 text-sm">
          <div className="flex gap-2"><span className="text-gray-500">Your limit:</span><span className="font-semibold">€{check.userBudget.toLocaleString()}</span></div>
          <div className="flex gap-2"><span className="text-gray-500">Product:</span><span className="font-semibold">€{productPrice.toLocaleString()}</span></div>
        </div>
        <div className={`text-right font-bold ${check.withinBudget ? 'text-emerald-700' : 'text-red-700'}`}>
          {check.withinBudget
            ? <><span className="text-lg">✓ Within budget</span><br /><span className="text-sm font-normal text-emerald-600">€{(check.userBudget - productPrice).toLocaleString()} to spare</span></>
            : <><span className="text-lg">€{check.overBy.toLocaleString()} over</span><br /><span className="text-sm font-normal text-red-500">exceeds your limit</span></>
          }
        </div>
      </div>
      {!check.withinBudget && check.bestOptionInBudget && (
        <div className="bg-white/70 rounded-xl px-4 py-2 text-sm">
          <span className="text-gray-600">Best in-budget option: </span>
          <span className="font-semibold text-gray-900">{check.bestOptionInBudget.name}</span>
          <span className="text-emerald-600 font-semibold ml-2">€{check.bestOptionInBudget.price.toLocaleString()}</span>
        </div>
      )}
      {!check.withinBudget && !check.canAffordAnyAlternative && (
        <p className="text-xs text-red-500 mt-2">No alternatives found within your €{check.userBudget.toLocaleString()} budget</p>
      )}
    </div>
  );
}

function RetailerCard({ retailers, productPrice }: { retailers: RetailerPrice[]; productPrice: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Where to Buy</h3>
      <div className="space-y-2">
        {retailers.map((r, i) => (
          <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-xl ${i === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 min-w-0">
              {i === 0 && <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-1.5 py-0.5 rounded-full flex-shrink-0">Lowest</span>}
              <span className="text-sm font-medium text-gray-900 truncate">{r.retailer}</span>
              {r.badge && <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:inline">{r.badge}</span>}
              {!r.inStock && <span className="text-xs text-red-400 flex-shrink-0">Out of stock</span>}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {r.savings > 0 && <span className="text-xs font-semibold text-emerald-600 hidden sm:inline">Save €{r.savings}</span>}
              {r.url
                ? <a href={r.url} target="_blank" rel="noopener noreferrer" className={`font-bold hover:underline ${i === 0 ? 'text-emerald-700' : 'text-gray-900'}`}>€{r.price.toLocaleString()}</a>
                : <span className={`font-bold ${i === 0 ? 'text-emerald-700' : 'text-gray-900'}`}>€{r.price.toLocaleString()}</span>
              }
            </div>
          </div>
        ))}
      </div>
      {retailers[0]?.savings > 0 && (
        <p className="text-xs text-gray-400 mt-2 text-right">vs. your found price (€{productPrice.toLocaleString()})</p>
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
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Price History</h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>{statusCfg.label}</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>30-day range</span>
          <span>{history.percentVsAvg > 0 ? '+' : ''}{history.percentVsAvg}% vs 6-month avg</span>
        </div>
        <div className="relative h-3 bg-gray-100 rounded-full">
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-sm z-10"
            style={{ left: `${markerPos}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs font-semibold">
          <span className="text-emerald-600">€{low.toLocaleString()} <span className="font-normal text-gray-400">low</span></span>
          <span className="text-gray-700">€{currentPrice.toLocaleString()} <span className="font-normal text-gray-400">now</span></span>
          <span className="text-red-500">€{high.toLocaleString()} <span className="font-normal text-gray-400">high</span></span>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
        <span>6-month avg: <strong className="text-gray-700">€{history.sixMonthAvg.toLocaleString()}</strong></span>
        <span>All-time low: <strong className="text-gray-700">€{history.allTimeLow.toLocaleString()}</strong></span>
      </div>

      {history.isSeasonalHigh && (
        <p className="mt-2 text-xs text-amber-600 font-medium">📅 Prices typically elevated Nov–Feb</p>
      )}
    </div>
  );
}
