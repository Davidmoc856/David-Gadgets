'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import AccountModal from './AccountModal';
import { Shield, Wallet, History } from 'lucide-react';
import Link from 'next/link';
import { masterInventory} from '@/data/products';





export default function Navbar() {
  const { user } = useApp();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const displayName = user?.name?.trim() || 'Customer';
  const welcomeText = user?.isConnected ? `Hi, ${displayName}` : 'Link Wallet';
  const isSearchActive = searchQuery.trim().length > 0 || isSearchFocused;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-900/60 bg-zinc-950/75 backdrop-blur-md text-white px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 transition-all duration-300">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-sm sm:text-lg tracking-tight hover:opacity-90 transition active-press shrink-0">
          <Shield className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-blue-500 fill-blue-500/10" />
          <span className="text-white font-bold whitespace-nowrap">
            David<span className="hidden sm:inline text-blue-500"> Gadgets</span>
          </span>
        </Link>

        {/* Search Bar Container */}
        <div className={`relative mx-2 min-w-0 flex-1 transition-all duration-300 ${isSearchActive ? 'max-w-none' : 'max-w-md'}`}>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-zinc-900 text-xs sm:text-sm text-white pl-3 pr-8 py-1.5 sm:pl-4 sm:pr-10 sm:py-2.5 rounded-lg sm:rounded-xl border border-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300 hover:border-zinc-700"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3 pointer-events-none text-zinc-500">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Live Search Results Dropdown Drop-frame */}
          {searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl mt-2 p-2 shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar animate-fade-in">
              {(() => {
                const query = searchQuery.toLowerCase().trim();
                const isGamingQuery = query === 'gaming';
                const filtered = masterInventory.filter(item => {
                  const matchesTitle = item.title.toLowerCase().includes(query);
                  const matchesCategory = item.category.toLowerCase().includes(query);
                  const matchesSpecs = item.specs.some(spec => spec.toLowerCase().includes(query));
                  
                  // Exclude laptops from showing up when searching specifically for "gaming"
                  if (isGamingQuery && item.category === 'Laptops') {
                    return false;
                  }
                  
                  return matchesTitle || matchesCategory || matchesSpecs;
                });
                
                return filtered.length > 0 ? (
                  filtered.slice(0, 8).map(product => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={() => setSearchQuery("")}
                      className="block w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900/80 hover:text-white rounded-lg transition-all duration-200 active:scale-[0.99]"
                    >
                      <div className="font-medium text-zinc-200">{product.title}</div>
                      <div className="text-xs text-blue-500">{product.price} • {product.category}</div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-zinc-500 italic text-center">
                    Product unavailable
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div className="flex items-center shrink-0 gap-2">
          {user && user.isConnected && (
            <Link
              href="/transactions"
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-all duration-300 shadow-lg shadow-zinc-900/20 hover:shadow-zinc-800/30 hover:scale-[1.03] active:scale-[0.97]"
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">History</span>
            </Link>
          )}
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-white transition-all duration-300 shadow-lg shadow-blue-600/15 hover:shadow-blue-500/25 hover:scale-[1.03] active:scale-[0.97] active-press interactive-bounce whitespace-nowrap"
          >
            <Wallet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {user ? (user.isConnected ? welcomeText : 'Link Wallet') : 'Connect Wallet'}
            </span>
            <span className="sm:hidden">
              {user ? (user.isConnected ? displayName : 'Wallet') : 'Connect'}
            </span>
          </button>
        </div>
      </nav>


      {/* Account & Onboarding Modal */}
      <AccountModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}