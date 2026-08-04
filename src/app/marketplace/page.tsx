'use client';

import { Suspense } from 'react';
import { masterInventory } from '@/data/products';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [filterCategory, setFilterCategory] = useState(categoryParam || 'All');
  
  const categories = ['All', 'Smartphones', 'Laptops', 'Tablets', 'Gaming'];

  const filteredItems = filterCategory === 'All' 
    ? masterInventory 
    : masterInventory.filter(item => item.category === filterCategory);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 sm:px-6 sm:py-12">
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-zinc-450 hover:text-white active:text-white/90 transition-all duration-300 text-sm mb-8 group hover:scale-[1.01] active:scale-[0.99] interactive-bounce"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Home</span>
      </Link>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 border-b border-zinc-900/60 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Full Marketplace Inventory</h1>
            <p className="mt-1 text-sm text-zinc-450">Browse our full sequence of certified premium gadgets.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4.5 py-2 rounded-full text-xs font-bold border transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] interactive-bounce ${
                  filterCategory === cat 
                    ? 'bg-blue-600 border-blue-505 text-white shadow-lg shadow-blue-600/20 glow-hover' 
                    : 'bg-zinc-900/50 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {filteredItems.map((device) => (
            <div key={device.id} className="group bg-zinc-950 border border-zinc-900/80 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-zinc-750 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between">
              <div>
                <div className={`relative h-40 w-full overflow-hidden rounded-xl mb-4 ${device.imageBg} transition-all duration-300 group-hover:scale-[1.02]`}>
                  {device.imageUrl && device.imageUrl[0] && device.imageUrl[0].trim() !== "" ? (
                    <Image src={device.imageUrl[0]} alt={device.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" className="object-contain p-3" />
                  ) : (
                    <div className="w-full h-full bg-zinc-900/65 flex items-center justify-center text-zinc-550 text-sm text-center p-4">Product image unavailable for now.</div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">{device.condition}</span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/5 border border-blue-500/10 px-2 py-0.5 rounded-md font-mono">{device.id}</span>
                </div>
                <h3 className="text-base font-bold text-zinc-150 line-clamp-1 mt-1.5 group-hover:text-white transition-colors duration-205">{device.title}</h3>
                <p className="text-xl font-extrabold text-blue-500 mt-2">{device.price}</p>
                <div className="mt-4 space-y-1.5 border-t border-zinc-900/50 pt-3">
                  {device.specs.map((spec, index) => (
                    <div key={index} className="text-xs text-zinc-400 flex items-start gap-1.5">
                      <span className="text-blue-500 mt-0.5 font-bold">{'\u2022'}</span>
                      <span className="line-clamp-1">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link href={`/products/${device.id}`} className="block text-center bg-zinc-900 hover:bg-zinc-800 hover:text-white text-sm font-semibold text-zinc-300 py-3 rounded-xl mt-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] interactive-bounce">
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function Marketplace() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black text-white px-6 py-12 flex items-center justify-center">
        <p className="text-zinc-500 text-sm animate-pulse">Loading marketplace...</p>
      </main>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
