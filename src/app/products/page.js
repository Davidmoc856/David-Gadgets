'use client';

import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch products from the backend search endpoint
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const query = encodeURIComponent(searchQuery.trim());
        const res = await fetch(`http://localhost:5000/api/search?q=${query}`);
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Unable to load products right now. Please try again later.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="space-y-8 min-h-screen bg-black text-white px-6 py-12">
      {/* Search Section */}
      <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-2xl shadow-xl max-w-2xl mx-auto glass-panel animate-fade-in">
        <label htmlFor="product-search" className="block text-sm font-semibold text-zinc-300 mb-2">
          Search inventory
        </label>

        <div className="flex gap-3 items-center">
          <input
            id="product-search"
            type="search"
            autoComplete="off"
            placeholder="Search laptops, phones, specs, condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-0 flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-550 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300 hover:border-zinc-700"
          />
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Clear
          </button>
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          Start typing to filter by product name, category, condition, RAM, or storage.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-900/30 bg-rose-950/10 p-6 text-rose-455 text-center">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-12 text-center text-zinc-500 shadow-sm">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-12 text-center text-zinc-550 shadow-sm italic">
          No products found. Try a broader query or clear the search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id ?? product.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-750 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="p-6">
                <span className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-4 border border-zinc-800">
                  {product.condition || product.specs?.condition || 'Unknown'}
                </span>
                <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-white transition-colors">{product.name}</h3>
                <p className="text-xs text-zinc-500 mb-3">{product.category}</p>
                {product.description ? (
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">{product.description}</p>
                ) : null}
              </div>
              
              <div className="p-6 bg-zinc-900/20 border-t border-zinc-900/60 flex items-center justify-between">
                <span className="text-xl font-extrabold text-white">
                  ₦{Number(product.price).toLocaleString()}
                </span>
                <button className="rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] px-4 py-2.5 active-press interactive-bounce">
                  View & Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}