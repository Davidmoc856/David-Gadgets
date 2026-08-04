import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-900 text-zinc-400 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Column 1: Brand & Core Identity */}
        <div className="flex flex-col gap-3">
          <div className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-blue-500">🛡️</span> David Gadgets
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-500">
            A 100% secured multi-vendor escrow marketplace. We buy, sell, and swap premium devices with ultimate transaction protection.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
            <Link href="/marketplace" className="hover:text-blue-500 transition-colors">Shop now</Link>
            <Link href="/rate-phone" className="hover:text-blue-500 transition-colors">Rate your device</Link>
          </div>
        </div>

        {/* Column 2: Quick Shop Links */}
        <div className="flex flex-col gap-2 text-sm">
          <h4 className="text-white font-semibold mb-2">Marketplace</h4>
          <Link href="/marketplace" className="hover:text-blue-500 transition-colors">All Products</Link>
          <Link href="/marketplace?category=Smartphones" className="hover:text-blue-500 transition-colors">Smartphones</Link>
          <Link href="/marketplace?category=Tablets" className="hover:text-blue-500 transition-colors">Tablets & iPads</Link>
          <Link href="/marketplace?category=Laptops" className="hover:text-blue-500 transition-colors">Workstations & Laptops</Link>
          <Link href="/marketplace?category=Gaming" className="hover:text-blue-500 transition-colors">Gaming Consoles</Link>
        </div>

        {/* Column 3: Account & Protection */}
        <div className="flex flex-col gap-2 text-sm">
          <h4 className="text-white font-semibold mb-2">Account & Protection</h4>
         
          <Link href="/orders" className="hover:text-blue-500 transition-colors">My Orders</Link>
          <Link href="/escrow-protection" className="hover:text-blue-500 transition-colors">How Escrow Works</Link>
          <Link href="/refunds" className="hover:text-blue-500 transition-colors">Dispute Resolution</Link>
        </div>

        {/* Column 4: Trust & Legal */}
        <div className="flex flex-col gap-2 text-sm">
          <h4 className="text-white font-semibold mb-2">Safety & Legal</h4>
          <Link href="/terms" className="hover:text-blue-500 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link>
          <p className="text-zinc-500 text-xs sm:text-sm mt-2">
            David Gadgets,<br />
            Phone village, Alaba internation, Ojo,
             Lagos state
          </p>
          <div className="mt-2 text-xs sm:text-sm">
            <span className="text-zinc-500">Hotline:</span>{' '}
            <a href="https://wa.me/2349116883716" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              +234 Support WhatsApp
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Strip */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} David Gadgets Inc. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Secured via <span className="text-emerald-500 font-medium">Supabase Auth & RLS Encryption</span>
        </p>
      </div>
    </footer>
  );
}
