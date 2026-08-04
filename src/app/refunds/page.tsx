'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RefundsPage() {
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

        <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-8 md:p-12 glass-panel">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Dispute Resolution & Refund Policy</h1>
          <p className="text-sm text-zinc-500 mb-8">Last updated: July 2026</p>

          <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-white mb-3">1. Escrow Protection Overview</h2>
              <p>David Gadgets operates a secure escrow system designed to protect both buyers and sellers. When you make a purchase, funds are deducted from your wallet and held in escrow. They are only released to the seller after you have confirmed receipt and satisfaction with the product. This ensures that neither party bears the full risk of the transaction.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">2. Buyer Protection & Order Cancellation</h2>
              <p>As a buyer, you may cancel an order and receive a full refund to your wallet if the order status is still &ldquo;Funds Locked&rdquo; or &ldquo;Verified&rdquo; — meaning the seller has not yet shipped the item or made it ready for pickup.</p>
              <p className="mt-2">To cancel an order:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1.5">
                <li>Open the Order Tracker from the shopping bag icon</li>
                <li>Locate the order you wish to cancel</li>
                <li>Click &ldquo;Cancel Order&rdquo; and confirm</li>
                <li>Funds are instantly refunded to your escrow wallet balance</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">3. Dispute Initiation</h2>
              <p>If you receive an item that is significantly different from its description, or if a transaction cannot be completed, you may initiate a dispute by contacting our support team through:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li>The live chat widget on our website (powered by Tawk.to)</li>
                <li>WhatsApp support at +234 911 688 3716</li>
                <li>Our contact form under the &ldquo;Leave a Message&rdquo; tab</li>
              </ul>
              <p className="mt-2">Disputes are reviewed within 24-48 hours by our mediation team.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">4. Refund Timeline & Method</h2>
              <p>Approved refunds are processed as follows:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li><strong>Wallet Refunds:</strong> Instant — funds are credited back to your David Gadgets escrow wallet immediately upon cancellation.</li>
                <li><strong>Bank Settlement Refunds:</strong> 3-5 business days — if a refund needs to be sent to your bank account via Paystack, processing takes 3-5 working days.</li>
                <li><strong>Paystack Transaction Refunds:</strong> Initiated from your Account modal under &ldquo;Request Deposit Refund&rdquo;. Paystack processes these within 1-7 business days depending on your bank.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">5. Non-Refundable Situations</h2>
              <p>Refunds will not be issued in the following cases:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li>Change of mind after the item has been shipped or marked ready for pickup</li>
                <li>Damage caused by the buyer after delivery confirmation</li>
                <li>Misrepresentation of device condition during valuation (trade-in items)</li>
                <li>Orders where delivery has already been confirmed by the buyer</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">6. Chargeback Policy</h2>
              <p>Initiating a chargeback with your bank without first contacting our support team will result in immediate account suspension. We are committed to resolving all disputes fairly through our escrow mediation process. Please reach out to us before escalating to your financial institution.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">7. Device Trade-In & Valuation Disputes</h2>
              <p>If you disagree with the valuation offered for your device, you may decline the offer and request the return of your device. Return shipping costs may apply. Accepted valuation offers are final, and the device becomes the property of David Gadgets upon acceptance.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">8. Contact for Disputes</h2>
              <p>For all dispute-related inquiries, contact us directly via WhatsApp at +234 911 688 3716 with your order number and a detailed description of the issue.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
