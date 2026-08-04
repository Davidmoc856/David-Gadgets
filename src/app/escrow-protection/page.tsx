'use client';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Wallet, Truck, CheckCircle, Lock, Smartphone } from 'lucide-react';

export default function EscrowProtectionPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-450 hover:text-white transition-all duration-300 text-sm mb-8 group hover:scale-[1.01] active:scale-[0.99] interactive-bounce"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-8">
          <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-8 md:p-12 glass-panel">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-extrabold tracking-tight text-white">How David Gadgets Escrow Works</h1>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-8">
              Every transaction on David Gadgets is protected by our secure escrow system. 
              Think of us as a trusted middleman &mdash; we hold the funds until you confirm you have received 
              your item and are satisfied. This protects both buyers and sellers from fraud.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4 items-start bg-zinc-900/40 border border-zinc-900 rounded-xl p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30">
                  <Wallet className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">1. Fund Your Escrow Wallet</h3>
                  <p className="text-xs text-zinc-400 mt-1">Deposit funds into your secure David Gadgets wallet via Paystack. Your bank account is verified first, ensuring safe transactions.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-zinc-900/40 border border-zinc-900 rounded-xl p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600/20 border border-emerald-500/30">
                  <Lock className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">2. Funds Locked in Escrow</h3>
                  <p className="text-xs text-zinc-400 mt-1">When you place an order, the exact amount is deducted from your wallet and locked in escrow. The seller knows funds are secured but cannot access them yet.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-zinc-900/40 border border-zinc-900 rounded-xl p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-600/20 border border-amber-500/30">
                  <Truck className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">3. Seller Ships or Prepares Item</h3>
                  <p className="text-xs text-zinc-400 mt-1">The seller prepares your item for pickup or dispatches it via our logistics network. The status updates to &ldquo;In Transit&rdquo; or &ldquo;Ready for Pickup&rdquo;.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-zinc-900/40 border border-zinc-900 rounded-xl p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600/20 border border-emerald-500/30">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">4. You Confirm Delivery</h3>
                  <p className="text-xs text-zinc-400 mt-1">Once you receive the item and are satisfied, click &ldquo;Delivery Confirmed&rdquo; in your order tracker. This signals the escrow to release funds.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-zinc-900/40 border border-zinc-900 rounded-xl p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30">
                  <Smartphone className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">5. Funds Released to Seller</h3>
                  <p className="text-xs text-zinc-400 mt-1">Funds are transferred to the seller verified bank account. The transaction is complete, and both parties are protected throughout.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-5 glass-panel">
              <h3 className="font-bold text-white text-sm mb-2">Paystack Secure</h3>
              <p className="text-xs text-zinc-400">All payments are processed through Paystack, a PCI-DSS Level 1 compliant gateway trusted by thousands of Nigerian businesses.</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-5 glass-panel">
              <h3 className="font-bold text-white text-sm mb-2">Dispute Mediation</h3>
              <p className="text-xs text-zinc-400">Our team mediates any disputes between buyers and sellers. Funds remain locked until a resolution is reached.</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-5 glass-panel">
              <h3 className="font-bold text-white text-sm mb-2">Buyer Protection</h3>
              <p className="text-xs text-zinc-400">If your order does not match the description, you can cancel before shipping and receive an instant refund to your wallet.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
