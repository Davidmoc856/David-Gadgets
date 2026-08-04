'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ChevronLeft, ChevronRight, Cpu, Expand, ShieldCheck, Smartphone, X, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { masterInventory } from '@/data/products';
import CheckoutModal from '@/components/CheckoutModal';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isGalleryOpen, setGalleryOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Dynamic Lookup: Find matching item from the real 100-gadget master database
  const item = masterInventory.find((prod) => prod.id === productId);
  const galleryImages = useMemo(() => {
    if (!item?.imageUrl) return [];
    return item.imageUrl.filter((imgUrl) => imgUrl && imgUrl.trim() !== '');
  }, [item]);

  const goToSlide = (nextIndex: number) => {
    if (galleryImages.length === 0) return;
    setActiveIdx((nextIndex + galleryImages.length) % galleryImages.length);
  };

  const handleGalleryTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleGalleryTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const diff = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    if (Math.abs(diff) > 45) {
      if (diff < 0) {
        goToSlide(activeIdx + 1);
      } else {
        goToSlide(activeIdx - 1);
      }
    }

    setTouchStartX(null);
  };

  // Fallback if the user types a random ID string into the URL path directly
  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-bold text-zinc-500">Product Not Found</h2>
        <button onClick={() => router.push('/')} className="text-blue-500 hover:underline mt-4 text-sm">
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 text-white font-sans sm:px-6 sm:py-12">
      
      {/* Back Navigation Shortcut */}
      <button 
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-zinc-450 hover:text-white transition-all duration-300 text-sm mb-8 group hover:scale-[1.01] active:scale-[0.99] interactive-bounce"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Marketplace</span>
      </button>

      {/* SPLIT COLUMN PRESENTATION */}
      <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
        
        {/* Left Column: Visual Media Display Frame / Gallery */}
        <div className="flex flex-col gap-4 w-full">
          {/* Main Large Display Image */}
          <button
            type="button"
            onClick={() => {
              if (galleryImages.length > 0) {
                setGalleryOpen(true);
              }
            }}
            className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-855 bg-zinc-900 flex items-center justify-center group cursor-pointer shadow-2xl transition-all duration-300 hover:shadow-zinc-900/50 hover:border-zinc-700/60 text-left sm:rounded-3xl"
          >
            {/* Category / Condition Badges */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              <span className="rounded-full bg-zinc-950/90 border border-zinc-850 px-3 py-1 text-xs font-bold text-zinc-300">
                {item.category}
              </span>
              <span className="rounded-full bg-zinc-950/90 border border-zinc-850 px-3 py-1 text-xs font-bold text-blue-400">
                {item.condition}
              </span>
            </div>

            <div className="absolute right-3 top-3 z-10 rounded-full bg-zinc-950/90 border border-zinc-800 px-2.5 py-1 text-[10px] font-bold text-zinc-300 flex items-center gap-1.5 sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[11px]">
              <Expand className="h-3.5 w-3.5" />
              Tap to expand
            </div>

            {galleryImages.length > 0 ? (
              <div className="relative h-full w-full overflow-hidden">
                <div
                  className="flex h-full w-full transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${activeIdx * 100}%)` }}
                >
                  {galleryImages.map((imgUrl, index) => (
                    <div key={`${imgUrl}-${index}`} className="min-w-full h-full shrink-0 relative">
                      <Image
                        src={imgUrl}
                        alt={`${item.title} view ${index + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain p-6 transition-all duration-500 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-zinc-900/60 flex flex-col items-center justify-center text-zinc-500 p-4">
                <Smartphone className="h-16 w-16 mb-2 text-zinc-700" />
                <span className="text-sm font-semibold">Product image unavailable for now.</span>
              </div>
            )}
          </button>

          {/* Sliding / Scrollable Thumbnails Layout */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {galleryImages.map((imgUrl, index) => (
                <button
                  key={`${imgUrl}-${index}`}
                  onClick={() => {
                    setActiveIdx(index);
                    setGalleryOpen(true);
                  }}
                  className={`relative h-16 w-16 rounded-2xl overflow-hidden bg-zinc-900 border-2 shrink-0 transition-all sm:h-20 sm:w-20 ${
                    activeIdx === index ? 'border-blue-500 scale-95' : 'border-zinc-805 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Descriptions & Interactive Escrow Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl text-white">
              {item.title}
            </h1>
            
            <p className="text-sm text-zinc-500 mt-2">
              Verified Merchant: <span className="text-zinc-300 font-medium">{item.seller}</span>
            </p>

            <div className="mt-4 text-3xl font-bold text-blue-500">
              {item.price}
            </div>

            <hr className="border-zinc-900 my-6" />

            {/* Description */}
            <div>
              <h3 className="font-semibold text-zinc-200 text-sm uppercase tracking-wide font-mono">
                Overview
              </h3>
              <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Hardware Specification Grid */}
            <div className="mt-8">
              <h3 className="font-semibold text-zinc-200 text-sm uppercase tracking-wide font-mono mb-3">
                Technical Specifications
              </h3>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {item.specs.map((spec, index) => (
                  <li 
                    key={index} 
                    className="flex items-center gap-2.5 rounded-xl bg-zinc-900/30 border border-zinc-900 px-4 py-3 text-xs text-zinc-300 hover:border-zinc-805 transition duration-250"
                  >
                    <Cpu className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="line-clamp-1">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Call To Action - Escrow Safe Pay */}
          <div className="mt-8 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 backdrop-blur-sm glass-panel animate-fade-in sm:mt-12 sm:p-6">
            <div className="flex gap-3 items-start mb-5 leading-relaxed">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-400">
                <span className="font-bold text-zinc-200 block mb-1">David Gadgets Escrow Protection</span>
                Funds remain locked completely secure in contract until shipping logistics tracking confirms perfect arrival setup.
              </div>
            </div>

            <button 
              onClick={() => setCheckoutOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-4 font-bold text-white transition-all duration-300 shadow-lg shadow-blue-600/10 hover:shadow-blue-550/20 hover:scale-[1.02] active:scale-[0.98] text-sm active-press interactive-bounce"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>Secure Purchase via Escrow</span>
            </button>
          </div>

        </div>
      </div>

      {isGalleryOpen && galleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-4 lg:p-8"
          onClick={() => setGalleryOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-[0_25px_120px_rgba(0,0,0,0.8)] sm:rounded-[28px] lg:max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setGalleryOpen(false)}
              className="absolute right-3 top-3 z-20 rounded-full bg-zinc-900/80 p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white sm:right-4 sm:top-4 lg:right-5 lg:top-5 lg:bg-white lg:text-zinc-950 lg:hover:bg-zinc-100 lg:shadow-lg"
              aria-label="Close product gallery"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="relative overflow-hidden rounded-2xl sm:rounded-[28px]"
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeIdx * 100}%)` }}
              >
                {galleryImages.map((imgUrl, index) => (
                  <div key={`gallery-${imgUrl}-${index}`} className="min-w-full shrink-0">
                    <div className="aspect-[4/3] w-full bg-zinc-950 relative sm:aspect-4/3">
                      <Image
                        src={imgUrl}
                        alt={`${item.title} detail ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 80vw"
                        className="object-contain p-6 sm:p-10"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => goToSlide(activeIdx - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-zinc-950/80 p-2 text-white shadow-lg transition hover:scale-105 hover:bg-zinc-900"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goToSlide(activeIdx + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-zinc-950/80 p-2 text-white shadow-lg transition hover:scale-105 hover:bg-zinc-900"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/5 bg-zinc-950/80 px-4 py-3 sm:px-6">
              <div className="text-xs font-semibold text-zinc-400">
                {activeIdx + 1} / {galleryImages.length}
              </div>

              <div className="flex items-center gap-2">
                {galleryImages.map((imgUrl, index) => (
                  <button
                    key={`dot-${imgUrl}-${index}`}
                    type="button"
                    onClick={() => setActiveIdx(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      activeIdx === index ? 'w-7 bg-blue-500' : 'w-2.5 bg-zinc-700 hover:bg-zinc-500'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Checkout Sheet Overlay */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setCheckoutOpen(false)}
        productTitle={item.title}
        productPrice={item.price}
      />

    </main>
  );
}