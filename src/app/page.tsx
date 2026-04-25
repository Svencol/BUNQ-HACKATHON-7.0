'use client';

import { useState, useRef, useEffect } from 'react';
import type { AnalysisResult, Recommendation } from '@/lib/analyzer';
import type { Alternative } from '@/lib/mockData';

/* ── Brand config ────────────────────────────────────────────────────── */

const VERDICT: Record<Recommendation, {
  label: string;
  textClass: string; bgClass: string; borderClass: string;
}> = {
  BUY:                { label: 'Buy this',       textClass: 'text-[#34CC8D]', bgClass: 'bg-[#34CC8D]/10', borderClass: 'border-[#34CC8D]/20' },
  WAIT:               { label: 'Wait',           textClass: 'text-[#FF7819]', bgClass: 'bg-[#FF7819]/10', borderClass: 'border-[#FF7819]/20' },
  CHOOSE_ALTERNATIVE: { label: "Don't buy this", textClass: 'text-[#E63223]', bgClass: 'bg-[#E63223]/10', borderClass: 'border-[#E63223]/20' },
  PRICE_NEEDED:       { label: 'Add a price',    textClass: 'text-gray-500',  bgClass: 'bg-white/[0.03]', borderClass: 'border-white/[0.08]' },
};

/* ── Tiny shared components ──────────────────────────────────────────── */

function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md'; className?: string }) {
  return (
    <svg className={`animate-spin ${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function CameraIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

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
  const [inputSource, setInputSource]   = useState<'manual' | 'image' | 'url'>('manual');
  const [hadImageScan, setHadImageScan] = useState(false);
  const fileInputRef                    = useRef<HTMLInputElement>(null);
  const resultsRef                      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, [result]);

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
        setInputSource('image');
        setHadImageScan(true);
        setScanHint(`Found "${data.name}" — please enter the price`);
      } else if (data.name || data.price != null) {
        setInputSource('image');
        setHadImageScan(true);
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
      if (data.productName || data.price != null) {
        setInputSource('url');
      }
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
      <div className="max-w-md mx-auto px-4 pb-20">

        {/* ── Header ── */}
        <header className="pt-8 pb-8">
          <div className="flex items-center gap-2.5 mb-8">
            <img src="/bunq-logo.svg" alt="bunq" className="h-[18px] invert" />
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-600 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
              Purchase Advisor
            </span>
          </div>
          <h1 className="text-[2.75rem] font-black text-white leading-[1.0] tracking-tight">
            Should you<br />buy it?
          </h1>
          <p className="text-gray-500 mt-3 text-[15px]">
            Scan a product. Get a data-driven decision before you spend.
          </p>
        </header>

        {/* ── Input card ── */}
        <section className="bg-[#222222] rounded-3xl border border-white/[0.05] overflow-hidden">

          {/* Photo scan */}
          <div className="p-4">
            <input
              ref={fileInputRef} type="file" accept="image/*"
              capture="environment" onChange={handleImageScan} className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
              className="w-full rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-[#FF7819]/40 hover:bg-[#FF7819]/[0.04] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Scanned product" className="w-full h-40 object-cover" />
                  {scanning && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2.5">
                      <Spinner className="text-[#FF7819]" />
                      <span className="text-sm font-semibold text-[#FF7819]">Reading image…</span>
                    </div>
                  )}
                  {!scanning && scanHint && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
                      <p className="text-xs text-white font-medium">{scanHint}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-9 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF7819]/10 border border-[#FF7819]/15 flex items-center justify-center">
                    <CameraIcon className="w-6 h-6 text-[#FF7819]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-200">Snap a product photo</p>
                    <p className="text-xs text-gray-600 mt-0.5">AI reads the name &amp; price for you</p>
                  </div>
                </div>
              )}
            </button>
            {!imagePreview && scanHint && (
              <p className="text-xs text-center text-gray-500 mt-2.5 px-2">{scanHint}</p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-4 pb-1">
            <div className="flex-1 h-px bg-white/[0.05]" />
            <span className="text-[11px] text-gray-600 font-medium">or type it in</span>
            <div className="flex-1 h-px bg-white/[0.05]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 pt-3 space-y-3">

            {/* Product name */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Product name <span className="text-[#FF7819] normal-case tracking-normal">*</span>
              </label>
              <input
                type="text" value={productName}
                onChange={(e) => {
                  setProductName(e.target.value);
                  if (inputSource !== 'manual') setInputSource('manual');
                }}
                placeholder="iPhone 15 Pro, Dyson V12, Nike Air Max…"
                required className="input-dark"
              />
              {inputSource === 'image' && (
                <p className="text-[11px] text-gray-500 mt-1.5">Detected from image</p>
              )}
              {inputSource === 'url' && (
                <p className="text-[11px] text-gray-500 mt-1.5">Detected from URL</p>
              )}
              {inputSource === 'manual' && hadImageScan && (
                <p className="text-[11px] text-amber-500 mt-1.5">Manual edits replace the scanned product.</p>
              )}
              {inputSource === 'manual' && !hadImageScan && (
                <p className="text-[11px] text-gray-700 mt-1.5">
                  Try: iPhone 16 Pro, Samsung Galaxy A14 5G, PlayStation 5
                </p>
              )}
            </div>

            {/* Price + Budget */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  Price <span className="text-gray-700 normal-case tracking-normal font-normal">€ opt.</span>
                </label>
                <input
                  type="number" value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="e.g. 1199" min="1" step="0.01"
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  My budget <span className="text-gray-700 normal-case tracking-normal font-normal">€ opt.</span>
                </label>
                <input
                  type="number" value={userBudget}
                  onChange={(e) => setUserBudget(e.target.value)}
                  placeholder="max spend" min="1" step="1"
                  className="input-dark"
                />
              </div>
            </div>

            {/* Product URL */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Product link <span className="text-gray-700 normal-case tracking-normal font-normal">optional</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url" value={productUrl}
                  onChange={(e) => { setProductUrl(e.target.value); setUrlHint(''); }}
                  placeholder="https://..." className="input-dark flex-1 min-w-0"
                />
                {productUrl.trim() && (
                  <button
                    type="button" onClick={handleFetchFromUrl} disabled={fetchingUrl}
                    className="px-3 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-50 text-gray-300 rounded-xl border border-white/[0.08] transition-colors flex-shrink-0"
                  >
                    {fetchingUrl ? <Spinner size="sm" /> : <span className="text-xs font-semibold">Fetch</span>}
                  </button>
                )}
              </div>
              {urlHint && (
                <p className={`text-xs mt-1.5 ${urlHint.startsWith('Got:') ? 'text-[#FF7819]' : 'text-gray-600'}`}>
                  {urlHint}
                </p>
              )}
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={loading || !productName.trim()}
              className="w-full mt-1 bg-[#FF7819] hover:bg-[#e5681a] active:scale-[0.98] disabled:bg-white/[0.07] disabled:cursor-not-allowed text-white disabled:text-gray-600 font-bold py-[14px] rounded-full text-sm transition-all duration-150"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  {productPrice ? 'Analyzing…' : 'Finding alternatives…'}
                </span>
              ) : (
                productPrice ? 'Analyze Purchase →' : 'Find Alternatives →'
              )}
            </button>

          </form>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-3 bg-[#E63223]/10 border border-[#E63223]/20 rounded-2xl px-5 py-4 text-sm text-[#E63223] font-medium">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultsRef} className="mt-4 scroll-mt-6 animate-fade-up">
            <AnalysisResults result={result} />
          </div>
        )}

      </div>
    </main>
  );
}

/* ── Helper: financial impact line ──────────────────────────────────── */

function getImpact(result: AnalysisResult): { line: JSX.Element | null; sub: string } {
  const {
    recommendation, estimatedSavings, savingsPercent, bestAlternative,
    budgetCheck, priceHistory, productPrice,
  } = result;

  if (recommendation === 'CHOOSE_ALTERNATIVE' && estimatedSavings > 0) {
    return {
      line: <>You can save <span className="text-[#FF7819] font-black">€{estimatedSavings.toLocaleString()}</span> ({savingsPercent}%)</>,
      sub: `vs. ${bestAlternative?.name ?? 'best alternative'}`,
    };
  }
  if (budgetCheck && !budgetCheck.withinBudget) {
    return {
      line: <><span className="text-[#E63223] font-black">€{budgetCheck.overBy.toLocaleString()} over</span> your budget</>,
      sub: `Your limit: €${budgetCheck.userBudget.toLocaleString()}`,
    };
  }
  if (recommendation === 'WAIT' && priceHistory) {
    return {
      line: <><span className="text-[#FF7819] font-black">+{priceHistory.percentVsAvg}%</span> above the 6-month average</>,
      sub: `Avg €${priceHistory.sixMonthAvg.toLocaleString()} — a better price is likely`,
    };
  }
  if (recommendation === 'BUY' && priceHistory && priceHistory.percentVsAvg < 0) {
    const saved = Math.abs(Math.round((priceHistory.percentVsAvg / 100) * productPrice));
    return {
      line: <>Good timing — <span className="text-[#34CC8D] font-black">€{saved}</span> below the average</>,
      sub: `6-month avg: €${priceHistory.sixMonthAvg.toLocaleString()}`,
    };
  }
  if (recommendation === 'BUY') {
    return {
      line: <>Fairly priced at <span className="text-[#34CC8D] font-black">€{productPrice.toLocaleString()}</span></>,
      sub: priceHistory ? `6-month avg: €${priceHistory.sixMonthAvg.toLocaleString()}` : '',
    };
  }
  return { line: null, sub: '' };
}

/* ── Helper: bunq insight copy ───────────────────────────────────────── */

function getBunqInsight(result: AnalysisResult): JSX.Element {
  const { budgetCheck, estimatedSavings, productPrice, categoryLabel } = result;

  if (budgetCheck && !budgetCheck.withinBudget) {
    return <>This purchase is <span className="text-[#FF7819] font-bold">€{budgetCheck.overBy.toLocaleString()} over</span> your set budget for this purchase.</>;
  }
  if (budgetCheck?.withinBudget) {
    const spare = budgetCheck.userBudget - productPrice;
    return <>After this purchase you&apos;ll have <span className="text-[#34CC8D] font-bold">€{spare.toLocaleString()} remaining</span> within your budget.</>;
  }
  if (estimatedSavings >= 30) {
    return <>The cheaper alternative saves <span className="text-[#FF7819] font-bold">€{estimatedSavings.toLocaleString()}</span>, which would add directly to your monthly savings target.</>;
  }
  return <>Connect bunq to track your <strong className="text-white font-semibold">{categoryLabel}</strong> spending and see how this purchase fits your monthly goals.</>;
}

/* ── Vendor comparison card ──────────────────────────────────────────── */

function VendorComparisonCard({ result }: { result: AnalysisResult }) {
  if (!result.vendors || result.vendors.length === 0) return null;

  return (
    <div className="bg-[#222222] rounded-2xl p-5 border border-white/[0.05]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          Where to buy
        </p>
        {result.vendorSavings > 0 && (
          <span className="text-[10px] font-bold text-[#34CC8D] bg-[#34CC8D]/10 px-2 py-0.5 rounded-full">
            Up to €{result.vendorSavings} difference
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {result.vendors.map((vendor) => {
          const isCheapest = vendor.name === result.cheapestVendor?.name;
          return (
            <div
              key={vendor.name}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl ${
                isCheapest
                  ? 'bg-[#34CC8D]/[0.07] border border-[#34CC8D]/20'
                  : 'border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{vendor.name}</span>
                {vendor.badge && (
                  <span className="text-[9px] font-semibold text-gray-600 bg-white/[0.05] px-1.5 py-0.5 rounded-full">
                    {vendor.badge}
                  </span>
                )}
                {isCheapest && (
                  <span className="text-[9px] font-bold text-[#34CC8D] uppercase tracking-wide">
                    Best price
                  </span>
                )}
              </div>
              <span className={`text-sm font-black tabular-nums ${isCheapest ? 'text-[#34CC8D]' : 'text-white'}`}>
                €{vendor.price.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Ecosystem Alternatives component ───────────────────────────────── */

function EcosystemAlternatives({ result }: { result: AnalysisResult }) {
  const showEcosystemSplit =
    result.productEcosystem !== 'generic' &&
    result.bestSameEcosystemAlternative !== null &&
    result.bestCrossEcosystemAlternative !== null;

  if (showEcosystemSplit) {
    const sameAlt = result.bestSameEcosystemAlternative!;
    const crossAlt = result.bestCrossEcosystemAlternative!;
    const isSameRecommended = result.recommendedAlternative?.name === sameAlt.name;
    const isCrossRecommended = result.recommendedAlternative?.name === crossAlt.name;
    const sameSavings = Math.max(0, result.productPrice - sameAlt.price);
    const crossSavings = Math.max(0, result.productPrice - crossAlt.price);

    return (
      <div className="space-y-2.5">
        {/* Card A: Stay in your ecosystem */}
        <div className="bg-[#222222] rounded-2xl p-5 border border-white/[0.05]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              Stay in your ecosystem
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold text-gray-700 uppercase tracking-wider">
                {sameAlt.brand}
              </span>
              {isSameRecommended && (
                <span className="text-[10px] font-bold text-[#34CC8D] bg-[#34CC8D]/10 px-2 py-0.5 rounded-full">Recommended</span>
              )}
            </div>
          </div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold leading-snug">{sameAlt.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">{sameAlt.reason}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-black text-white">€{sameAlt.price.toLocaleString()}</p>
              {result.priceKnown && sameSavings > 0 && (
                <p className="text-xs font-bold text-[#FF7819] mt-0.5">
                  Save €{sameSavings.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          {isSameRecommended && result.recommendation === 'CHOOSE_ALTERNATIVE' && (
            <div className="space-y-2.5">
              {result.recommendedAlternative && result.estimatedSavings > 0 && (
                <p className="text-xs text-gray-500">
                  Best option: <span className="text-white font-semibold">{result.recommendedAlternative.name}</span>
                  {' '}→ Save <span className="text-[#FF7819] font-bold">€{result.estimatedSavings.toLocaleString()}</span>
                </p>
              )}
              <p className="text-xs text-gray-700">Original choice kept as reference</p>
            </div>
          )}
        </div>

        {/* Card B: Switch & save more */}
        <div className="bg-[#222222] rounded-2xl p-5 border border-white/[0.05]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              Switch &amp; save more
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold text-gray-700 uppercase tracking-wider">
                {crossAlt.brand}
              </span>
              {isCrossRecommended && (
                <span className="text-[10px] font-bold text-[#34CC8D] bg-[#34CC8D]/10 px-2 py-0.5 rounded-full">Recommended</span>
              )}
            </div>
          </div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold leading-snug">{crossAlt.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">{crossAlt.reason}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-black text-white">€{crossAlt.price.toLocaleString()}</p>
              {result.priceKnown && crossSavings > 0 && (
                <p className="text-xs font-bold text-[#FF7819] mt-0.5">
                  Save €{crossSavings.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          {result.ecosystemNote && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
              <p className="text-xs text-amber-400 leading-relaxed">{result.ecosystemNote}</p>
            </div>
          )}
          {isCrossRecommended && result.recommendation === 'CHOOSE_ALTERNATIVE' && (
            <div className="space-y-2.5 mt-3">
              {result.recommendedAlternative && result.estimatedSavings > 0 && (
                <p className="text-xs text-gray-500">
                  Best option: <span className="text-white font-semibold">{result.recommendedAlternative.name}</span>
                  {' '}→ Save <span className="text-[#FF7819] font-bold">€{result.estimatedSavings.toLocaleString()}</span>
                </p>
              )}
              <p className="text-xs text-gray-700">Original choice kept as reference</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Single card fallback using recommendedAlternative
  const alt: Alternative | null = result.recommendedAlternative ?? result.bestAlternative;
  if (!alt) return null;

  const savings = result.priceKnown ? Math.max(0, result.productPrice - alt.price) : 0;

  return (
    <div className="bg-[#222222] rounded-2xl p-5 border border-white/[0.05]">
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
        Best alternative
      </p>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <p className="text-white font-bold leading-snug">{alt.name}</p>
          <p className="text-xs text-gray-600 mt-0.5">{alt.reason}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-black text-white">€{alt.price.toLocaleString()}</p>
          {result.priceKnown && savings > 0 && (
            <p className="text-xs font-bold text-[#FF7819] mt-0.5">
              Save €{savings.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {result.recommendation === 'CHOOSE_ALTERNATIVE' && (
        <div className="space-y-2.5">
          {result.recommendedAlternative && result.estimatedSavings > 0 && (
            <p className="text-xs text-gray-500">
              Best option: <span className="text-white font-semibold">{result.recommendedAlternative.name}</span>
              {' '}→ Save <span className="text-[#FF7819] font-bold">€{result.estimatedSavings.toLocaleString()}</span>
            </p>
          )}
          <button className="w-full border border-white/[0.08] hover:border-white/20 text-gray-500 hover:text-gray-300 font-semibold py-2.5 rounded-full text-sm transition-colors">
            Keep original choice
          </button>
        </div>
      )}

      {result.recommendation !== 'CHOOSE_ALTERNATIVE' && result.productUrl && (
        <a
          href={result.productUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center w-full bg-[#FF7819] hover:bg-[#e5681a] text-white font-bold py-2.5 rounded-full text-sm transition-colors"
        >
          Proceed to buy →
        </a>
      )}
    </div>
  );
}

/* ── Fallback card (unknown product) ─────────────────────────────────── */

const DEMO_SUGGESTIONS = ['iPhone 16 Pro', 'Samsung Galaxy A14 5G', 'PlayStation 5', 'Sony WH-1000XM5'];

function FallbackCard({ productName }: { productName: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-3xl p-6 border bg-white/[0.03] border-white/[0.08]">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">
          Limited data
        </p>
        <p className="text-2xl font-black text-gray-400 leading-tight">
          Limited data available
        </p>
        <p className="text-gray-600 text-sm mt-2 leading-relaxed">
          We couldn&apos;t find reliable pricing or alternatives for &ldquo;{productName}&rdquo;. Try adding a price or use one of the demo products below.
        </p>
      </div>
      <div className="bg-[#222222] rounded-2xl p-5 border border-white/[0.05]">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
          Demo products
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_SUGGESTIONS.map((s) => (
            <span
              key={s}
              className="text-xs font-semibold text-gray-400 bg-white/[0.05] px-3 py-1.5 rounded-full border border-white/[0.06]"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Result component ────────────────────────────────────────────────── */

function AnalysisResults({ result }: { result: AnalysisResult }) {
  if (result.fallback) {
    return <FallbackCard productName={result.productName} />;
  }

  const vcfg = VERDICT[result.recommendation];

  /* PRICE_NEEDED — minimal state, show alt */
  if (result.recommendation === 'PRICE_NEEDED') {
    const hasSplit =
      result.productEcosystem !== 'generic' &&
      result.bestSameEcosystemAlternative !== null &&
      result.bestCrossEcosystemAlternative !== null;

    return (
      <div className="space-y-3">
        <div className={`rounded-3xl p-6 border ${vcfg.bgClass} ${vcfg.borderClass}`}>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2.5">
            Awaiting price
          </p>
          <p className="text-3xl font-black text-gray-400 leading-tight">Price needed</p>
          <p className="text-gray-600 text-sm mt-2">
            Enter the price above for a BUY / WAIT / SWITCH verdict.
          </p>
          <p className="text-xs text-gray-700 font-medium mt-1.5 truncate">
            {result.productName} · {result.categoryLabel}
          </p>
        </div>

        {result.vendors && result.vendors.length > 0 && (
          <VendorComparisonCard result={result} />
        )}

        {hasSplit ? (
          <div className="space-y-2.5">
            {/* Same eco */}
            <div className="bg-[#222222] rounded-2xl p-5 border border-white/[0.05]">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
                Stay in your ecosystem
              </p>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold">{result.bestSameEcosystemAlternative!.name}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{result.bestSameEcosystemAlternative!.reason}</p>
                </div>
                <p className="text-xl font-black text-[#FF7819] flex-shrink-0">
                  €{result.bestSameEcosystemAlternative!.price.toLocaleString()}
                </p>
              </div>
            </div>
            {/* Cross eco */}
            <div className="bg-[#222222] rounded-2xl p-5 border border-white/[0.05]">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
                Switch &amp; save more
              </p>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold">{result.bestCrossEcosystemAlternative!.name}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{result.bestCrossEcosystemAlternative!.reason}</p>
                </div>
                <p className="text-xl font-black text-[#FF7819] flex-shrink-0">
                  €{result.bestCrossEcosystemAlternative!.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : result.recommendedAlternative ? (
          <div className="bg-[#222222] rounded-2xl p-5 border border-white/[0.05]">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
              Best alternative found
            </p>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold">{result.recommendedAlternative.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{result.recommendedAlternative.reason}</p>
              </div>
              <p className="text-xl font-black text-[#FF7819] flex-shrink-0">
                €{result.recommendedAlternative.price.toLocaleString()}
              </p>
            </div>
          </div>
        ) : null}

        <div className="bg-[#FF7819]/10 border border-[#FF7819]/[0.15] rounded-2xl p-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-[11px] font-black text-[#FF7819]">bunq</span>
            <span className="text-[9px] font-bold text-[#FF7819]/60 uppercase tracking-widest">Insight</span>
          </div>
          <p className="text-white text-sm font-medium leading-relaxed">
            Connect bunq to track your <strong className="text-white font-semibold">{result.categoryLabel}</strong> spending and see how this purchase fits your monthly goals.
          </p>
        </div>
      </div>
    );
  }

  /* Full result */
  const { line: impactLine, sub: impactSub } = getImpact(result);

  return (
    <div className="space-y-3">

      {/* 1 ── Verdict */}
      <div className={`rounded-3xl p-6 border ${vcfg.bgClass} ${vcfg.borderClass}`}>
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
          Decision
        </p>
        <div className="flex items-start justify-between gap-3">
          <p className={`text-[2.1rem] font-black leading-tight ${vcfg.textClass}`}>
            {vcfg.label}
          </p>
          {result.priceKnown && (
            <p className="text-2xl font-black text-white flex-shrink-0 mt-1">
              €{result.productPrice.toLocaleString()}
            </p>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2 font-medium truncate">
          {result.productName} <span className="text-gray-700">·</span> {result.categoryLabel}
        </p>
      </div>

      {/* 2 ── Financial impact */}
      {result.priceKnown && impactLine && (
        <div className="bg-[#222222] rounded-2xl px-5 py-4 border border-white/[0.05]">
          <p className="text-[17px] font-bold text-white leading-snug">{impactLine}</p>
          {impactSub && <p className="text-xs text-gray-600 mt-1.5">{impactSub}</p>}
        </div>
      )}

      {/* 3 ── Vendor comparison */}
      <VendorComparisonCard result={result} />

      {/* 4 ── Ecosystem alternatives */}
      <EcosystemAlternatives result={result} />

      {/* 5 ── bunq insight */}
      <div className="bg-[#FF7819]/10 border border-[#FF7819]/[0.15] rounded-2xl p-5">
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="text-[11px] font-black text-[#FF7819]">bunq</span>
          <span className="text-[9px] font-bold text-[#FF7819]/60 uppercase tracking-widest">Insight</span>
        </div>
        <p className="text-white text-sm font-medium leading-relaxed">{getBunqInsight(result)}</p>
      </div>

      {/* 6 ── Short explanation */}
      {result.explanation && (
        <p className="text-[13px] text-gray-500 leading-relaxed px-1 pb-2">{result.explanation}</p>
      )}

    </div>
  );
}
