import { ShieldCheck, ArrowUpRight, Cpu, Globe, Star, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { masterInventory, ProductItem } from '../data/products';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'David Gadgets',
  url: 'https://davidgadgets.com.ng',
  description: 'Buy certified original phones, laptops, and accessories with escrow protection.',
  inLanguage: 'en-NG',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://davidgadgets.com.ng/marketplace?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function Home() {
  const trendingDevices = masterInventory.filter((item) => item.trending);
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 text-white sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      
      {/* ⚡ HERO BANNER SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-linear-to-b from-zinc-900 to-zinc-950 px-5 py-10 shadow-2xl animate-fade-in sm:px-8 sm:py-16 md:px-16 md:py-20 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
        <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-blue-600/15 blur-[130px] animate-pulse" />
        <div className="absolute -left-20 -bottom-20 -z-10 h-80 w-80 rounded-full bg-indigo-650/5 blur-[100px]" />
        
        <div className="max-w-2xl">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-[11px] font-semibold text-blue-400 border border-blue-500/20 mb-6 sm:text-xs">
            <ShieldCheck className="h-4 w-4" />
            <span>100% Secured Escrow Multi-Vendor Marketplace</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-linear-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            YOUR TRUSTED TECH PLUG.
          </h1>
          <p className="mt-5 text-sm text-zinc-400 leading-relaxed sm:mt-6 sm:text-base md:text-lg">
           We <span className="font-semibold text-zinc-200">BUY • SELL • SWAP </span>
           premium iPhones, iPads, Laptops, Samsungs, Tablets & more. Upgrading your tech has never been easier and seamless. All transactions are secured through our escrow system, ensuring your peace of mind with every purchase. Let us deal today.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
            <Link 
              href="/marketplace" 
              className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-250 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] active-press interactive-bounce shadow-lg shadow-white/5 sm:px-6 sm:py-3.5"
            >
              <span>Explore Store</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <Link 
              href="/rate-phone" 
              className="flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-5 py-3 text-sm font-bold text-zinc-200 hover:text-white hover:bg-zinc-805 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] active-press interactive-bounce sm:px-6 sm:py-3.5"
            >
              <span>Rate your phone</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-5 py-3 text-sm font-bold text-zinc-200 hover:text-white hover:bg-zinc-805 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] active-press interactive-bounce sm:px-6 sm:py-3.5"
            >
              <span>View Offers</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/5 bg-white/3 p-4 backdrop-blur-sm sm:mt-10 lg:mt-0 lg:p-5">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-4">
              <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Escrow</div>
              <div className="mt-2 text-xl font-extrabold text-white">100%</div>
              <p className="mt-1 text-xs text-zinc-400">Protected payment flow until delivery is confirmed.</p>
            </div>
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-4">
              <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Quality</div>
              <div className="mt-2 text-xl font-extrabold text-white">Multi-step</div>
              <p className="mt-1 text-xs text-zinc-400">Condition screening and spec checks before dispatch.</p>
            </div>
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-4">
              <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Support</div>
              <div className="mt-2 text-xl font-extrabold text-white">24/7</div>
              <p className="mt-1 text-xs text-zinc-400">Guided onboarding for buyers and sellers on every order.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🛡️ VALUE PROPOSITION BADGES */}
      <section className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="flex items-start gap-4 rounded-2xl border border-zinc-900/60 bg-zinc-900/10 p-6 backdrop-blur-sm hover:border-zinc-800 transition duration-300">
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500 border border-blue-500/10">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-200">Inspected Tech</h3>
            <p className="mt-1 text-sm text-zinc-450 leading-relaxed">Every single piece of hardware undergoes multi-point specification and condition screening.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-zinc-900/60 bg-zinc-900/10 p-6 backdrop-blur-sm hover:border-zinc-800 transition duration-300">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500 border border-emerald-500/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-200">Escrow Protected</h3>
            <p className="mt-1 text-sm text-zinc-450 leading-relaxed">Funds are locked securely in our digital wallet framework. Payment drops only after your approval.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-zinc-900/60 bg-zinc-900/10 p-6 backdrop-blur-sm hover:border-zinc-800 transition duration-300">
          <div className="rounded-xl bg-purple-500/10 p-3 text-purple-500 border border-purple-500/10">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-200">Verified Logistics</h3>
            <p className="mt-1 text-sm text-zinc-455 leading-relaxed">Seamless tracking linked directly to local dispatch hubs for transparent international cross-trade.</p>
          </div>
        </div>
      </section>

      {/* 🧾 REVIEWS & TRUST SECTION */}
      <section className="mt-16 rounded-3xl border border-zinc-900/80 bg-zinc-950/60 p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-blue-500 font-bold">Reviews & trust</p>
            <h2 className="mt-2 text-2xl font-bold text-white">A premium checkout experience buyers actually feel safe using.</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-400">
            <Star className="h-4 w-4 fill-current" />
            <span>4.9/5 customer confidence</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Escrow-backed
              </div>
              <p className="mt-3 text-sm text-zinc-400">Funds stay protected until delivery and item condition are confirmed by both sides.</p>
            </div>

            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Condition verified
              </div>
              <p className="mt-3 text-sm text-zinc-400">Every device is checked for specs, cosmetic quality, and device readiness before listing.</p>
            </div>

            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-5 sm:col-span-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Star className="h-4 w-4 text-amber-400 fill-current" />
                Customer sentiment
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <blockquote className="rounded-xl border border-zinc-900 bg-zinc-950/70 p-4 text-sm text-zinc-300">
                  “The escrow flow made the whole purchase feel unbelievably secure. The product landed exactly as described.”
                </blockquote>
                <blockquote className="rounded-xl border border-zinc-900 bg-zinc-950/70 p-4 text-sm text-zinc-300">
                  “No stress, no guesswork. I liked how easy it was to browse, compare, and confirm the offer before buying.”
                </blockquote>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 sm:p-6">
            <div className="text-[11px] uppercase tracking-[0.35em] text-blue-400 font-bold">Trust hierarchy</div>
            <h3 className="mt-3 text-xl font-bold text-white">Start with confidence, finish with clarity.</h3>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
              Buyers move from discovery to secure purchase through a clean, protected path built around wallet-backed escrow and transparent device verification.
            </p>
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-zinc-950/60 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                <div className="text-sm text-zinc-300">Browse verified premium tech without guessing.</div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-zinc-950/60 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                <div className="text-sm text-zinc-300">Review condition and specs before you commit.</div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-zinc-950/60 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                <div className="text-sm text-zinc-300">Get guided support through every stage of the deal.</div>
              </div>
            </div>
            <Link
              href="/marketplace"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-zinc-950 transition-all duration-300 hover:scale-[1.03] hover:bg-zinc-200 active:scale-[0.97] interactive-bounce"
            >
              <span>Browse trusted deals</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* � HOW IT WORKS / TRUST FLOW */}
      <section className="mt-16 rounded-3xl border border-zinc-900/80 bg-zinc-950/60 p-6 sm:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-blue-500 font-bold">How it works</p>
            <h2 className="mt-2 text-2xl font-bold text-white">A safer way to buy, sell, and swap premium tech</h2>
          </div>
          <p className="max-w-2xl text-sm text-zinc-400 leading-relaxed">
            Every transaction is designed to protect both buyer and seller using wallet-backed escrow, verified banking details, and structured delivery tracking.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Step 1</div>
            <h3 className="mt-3 text-lg font-semibold text-white">Rate your device</h3>
            <p className="mt-2 text-sm text-zinc-400">Tell us what you own, what condition it is in, and what you want from the exchange.</p>
          </div>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Step 2</div>
            <h3 className="mt-3 text-lg font-semibold text-white">Secure your wallet</h3>
            <p className="mt-2 text-sm text-zinc-400">Connect your account, verify your bank details, and fund your wallet through a protected flow.</p>
          </div>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Step 3</div>
            <h3 className="mt-3 text-lg font-semibold text-white">Track the handover</h3>
            <p className="mt-2 text-sm text-zinc-400">Your order stays protected until delivery confirmation is verified by both parties.</p>
          </div>
        </div>
      </section>

      {/* �📦 TRENDING LISTINGS GRID */}
      <section className="mt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white animate-fade-in">Trending Gadgets</h2>
            <p className="text-sm text-zinc-450 mt-1">Handpicked premium tech verified through secure logistics networks.</p>
          </div>
          <Link 
            href="/marketplace" 
            className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-zinc-950 hover:bg-zinc-200 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 interactive-bounce shadow-md"
          >
            <span>View All</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Dynamic Trending Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {trendingDevices.map((device: ProductItem) => (
            <div 
              key={device.id} 
              className="group flex flex-col justify-between rounded-2xl border border-zinc-900/80 bg-zinc-950 p-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-zinc-750 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)] sm:p-5"
            >
              <div>
                <div className={`relative h-40 w-full overflow-hidden rounded-xl mb-4 ${device.imageBg} transition-all duration-300 group-hover:scale-[1.02]`}>
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-950/35 via-transparent to-transparent" />
                  {device.imageUrl && device.imageUrl[0] && device.imageUrl[0].trim() !== "" ? (
                    <Image
                      src={device.imageUrl[0]}
                      alt={device.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-contain p-3"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900/65 flex items-center justify-center text-zinc-550 text-sm text-center p-4">
                      Product image unavailable for now.
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{device.condition}</span>
                  <span className="rounded-md border border-blue-500/10 bg-blue-500/5 px-2 py-0.5 text-[10px] font-mono text-blue-400">{device.id}</span>
                </div>
                <h3 className="mt-2 text-base font-bold text-zinc-150 line-clamp-1 group-hover:text-white transition-colors duration-205">{device.title}</h3>
                <p className="mt-2 text-xl font-extrabold text-blue-500">{device.price}</p>
                
                {/* Short specs list */}
                <div className="mt-4 space-y-1.5 border-t border-zinc-900/50 pt-3">
                  {device.specs.slice(0, 2).map((spec, index) => (
                    <div key={index} className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-blue-500" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link 
                href={`/products/${device.id}`} 
                className="mt-5 block text-center rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-zinc-300 transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-800 hover:text-white active:scale-[0.98] interactive-bounce"
              >
                View Deal
              </Link>
            </div>
          ))}
        </div>
      </section>

    </main>
    
  );
  
}