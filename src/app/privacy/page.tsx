'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Privacy Policy</h1>
          <p className="text-sm text-zinc-500 mb-8">Last updated: July 2026</p>

          <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-white mb-3">1. Information We Collect</h2>
              <p>When you register and use David Gadgets, we collect:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li><strong>Personal Information:</strong> Full name, email address, phone number, and delivery address.</li>
                <li><strong>Financial Information:</strong> Bank account details (collected via Paystack for settlement purposes). We do not store your card numbers or CVV.</li>
                <li><strong>Device Information:</strong> Photos, serial numbers, and IMEI details you submit for device valuation.</li>
                <li><strong>Usage Data:</strong> Pages visited, products viewed, and interactions on our platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">2. How We Use Your Information</h2>
              <p>Your data is used exclusively to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li>Process transactions through our escrow wallet system</li>
                <li>Verify your identity and bank account for secure payouts</li>
                <li>Communicate order updates, valuation offers, and support responses</li>
                <li>Improve our platform and detect fraudulent activity</li>
                <li>Comply with legal obligations under Nigerian law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">3. Data Protection & Security</h2>
              <p>We implement industry-standard security measures including:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li>Supabase Row-Level Security (RLS) for database access control</li>
                <li>Paystack PCI-DSS Level 1 compliant payment processing</li>
                <li>Encrypted data transmission via HTTPS/TLS</li>
                <li>Session-based authentication with secure token management</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">4. Third-Party Services</h2>
              <p>We use the following third-party services that process your data under their own privacy policies:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li><strong>Paystack</strong> &mdash; Payment processing and bank verification</li>
                <li><strong>Supabase</strong> &mdash; Authentication, database, and file storage</li>
                <li><strong>Tawk.to</strong> &mdash; Live chat support</li>
                <li><strong>EmailJS</strong> &mdash; Contact form email delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">5. Data Retention</h2>
              <p>We retain your personal data for as long as your account is active. Upon account deletion, we delete or anonymize your data within 30 days, except where retention is required by Nigerian financial regulations for transaction records.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">6. Your Rights</h2>
              <p>Under the Nigeria Data Protection Regulation (NDPR), you have the right to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Withdraw consent for data processing where applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">7. Contact</h2>
              <p>For privacy-related inquiries, contact our Data Protection Officer via WhatsApp at +234 911 688 3716.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
