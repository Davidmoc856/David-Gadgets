'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Terms of Service</h1>
          <p className="text-sm text-zinc-500 mb-8">Last updated: July 2026</p>

          <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using David Gadgets (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. These terms govern all transactions conducted through our escrow-based marketplace.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">2. Eligibility</h2>
              <p>You must be at least 16 years old with a bank account to use this Platform. By registering, you confirm that all information you provide is accurate, complete, and current. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">3. Escrow Protection & Payment Terms</h2>
              <p>All financial transactions on David Gadgets are processed through our escrow wallet system in partnership with Paystack, a PCI-DSS compliant payment gateway licensed by the Central Bank of Nigeria.</p>
              <p className="mt-2">Funds deposited by buyers are held in escrow until the buyer confirms satisfactory receipt of goods. Once confirmation is provided, funds are released to the seller. This process protects both parties from fraudulent transactions.</p>
              <p className="mt-2">All prices displayed on the Platform are in Nigerian Naira (₦) and inclusive of applicable taxes. Delivery fees, where applicable, are calculated at checkout.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">4. User Responsibilities</h2>
              <p>As a user of David Gadgets, you agree to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li>Provide accurate and truthful information for all transactions</li>
                <li>Not engage in chargeback fraud or attempt to reverse legitimate payments</li>
                <li>Not list counterfeit or stolen items</li>
                <li>Cooperate with our dispute resolution process in good faith</li>
                <li>Comply with all applicable Nigerian laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">5. Device Valuation & Trade-In</h2>
              <p>When submitting a device for valuation or trade-in, you certify that you are the legal owner of the device. Our team performs manual inspection of all submitted devices. The valuation offer provided is final once accepted. Any misrepresentation of device condition may result in a revised offer or cancellation of the transaction.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">6. Shipping & Fulfillment</h2>
              <p>For delivery orders, the seller is responsible for ensuring the item reaches the buyer in the condition described. Tracking information must be provided. David Gadgets is not liable for delays caused by third-party logistics providers but will facilitate communication and dispute resolution.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">7. Limitation of Liability</h2>
              <p>David Gadgets acts solely as an intermediary facilitating transactions between buyers and sellers. We are not liable for any direct, indirect, incidental, or consequential damages arising from the use of our platform, including but not limited to loss of funds, device damage during shipping, or disputes between users.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">8. Termination</h2>
              <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or pose a risk to other users. Terminated users forfeit any pending escrow protections.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">9. Contact</h2>
              <p>For questions about these terms, please contact us via WhatsApp at +234 911 688 3716 or visit our support chat on the Platform.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
