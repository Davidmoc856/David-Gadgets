'use client';

import { useState } from 'react';
import { ArrowDownToLine } from 'lucide-react';

interface WithdrawalWidgetProps {
  currentBalance: number;
  linkedBank: {
    name: string;
    accountNumber: string;
    bankCode: string;
  };
  onRefreshData?: () => void;
}

interface ReceiptData {
  reference: string;
  amount: number;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  createdAt: string;
}

export default function WithdrawalWidget({ currentBalance, linkedBank }: WithdrawalWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleContactSupport = () => {
    setFeedback(null);
    setLoading(true);
    window.open('https://wa.me/2349116883716', '_blank');
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#121212] p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
          <ArrowDownToLine className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Withdraw from Escrow Wallet</h4>
          <p className="text-xs text-zinc-500 mt-1">
            Withdrawals and ledger adjustments are handled securely by our team through WhatsApp support.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-semibold">Available Balance</span>
            <span className="text-xs text-zinc-300">₦{currentBalance.toLocaleString()}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-900 bg-zinc-950/80 p-5 shadow-sm shadow-black/20">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-400">
              <ArrowDownToLine className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">Need an adjustment or manual refund?</h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                If you accidentally deposited incorrect funds or need to update your ledger balance, please message our active support channel. Transactions are settled securely to our central fulfillment desk.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContactSupport}
            disabled={loading}
            className="mt-4 w-full rounded-2xl bg-green-500 px-4 py-3 text-sm font-semibold text-white hover:bg-green-400 transition-colors duration-300 disabled:opacity-60"
          >
            {loading ? 'Opening WhatsApp...' : '💬 Message Support on WhatsApp'}
          </button>

          <p className="mt-3 text-[11px] text-zinc-500">
            WhatsApp: <span className="font-semibold text-white">+234 911 688 3716</span>
          </p>
        </div>

        {feedback ? (
          <div className={`rounded-xl px-3 py-2 text-xs font-medium ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {feedback.message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
