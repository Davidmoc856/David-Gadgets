'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpToLine, ShoppingBag, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/utils/supabase/client';

interface Transaction {
  id: string;
  type: 'withdrawal' | 'deposit' | 'purchase';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  reference?: string;
  createdAt: string;
  bankDetails?: {
    accountNumber?: string;
    accountName?: string;
    bankCode?: string;
  };
  productDetails?: {
    productTitle?: string;
    orderNumber?: string;
  };
}

export default function TransactionsPage() {
  const { user } = useApp();
  const userId = user?.id;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  // We hide withdrawals from customer-facing history to avoid exposing payout details
  const [filter, setFilter] = useState<'all' | 'deposit' | 'purchase'>('all');

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const missingTransactionsTable = (error: { code?: string; message?: string } | null) =>
        !!error && (error.code === 'PGRST205' || /relation.*canonical_transactions.*does not exist|table .*canonical_transactions.* does not exist/i.test(error.message || ''));

      const { data: canonicalData, error: canonicalError } = await supabase
        .from('canonical_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      let rows: Record<string, unknown>[] = canonicalData || [];

      if (canonicalError && !missingTransactionsTable(canonicalError)) {
        throw canonicalError;
      }

      const { data: legacyData, error: legacyError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (legacyError && !/relation.*wallet_transactions.*does not exist|table .*wallet_transactions.* does not exist/i.test(legacyError.message || '')) {
        throw legacyError;
      }

      rows = [...rows, ...(legacyData || [])];

      const seen = new Set<string>();
      const dedupedRows = rows.filter((tx) => {
        const row = tx as Record<string, unknown>;
        const signature = `${String(row.id ?? '')}-${String(row.reference ?? '')}-${String(row.created_at ?? row.createdAt ?? '')}-${String(row.type ?? row.transaction_type ?? '')}-${String(row.amount ?? '')}`;
        if (!signature || seen.has(signature)) {
          return false;
        }
        seen.add(signature);
        return true;
      });

      // Filter out withdrawal entries from the customer-facing history (we do not show payouts)
      const formattedTransactions: Transaction[] = dedupedRows
        .map((tx) => {
          const row = tx as Record<string, unknown>;
          const rawType = String(row.transaction_type ?? row.type ?? row.kind ?? 'deposit').toLowerCase();
          const normalizedType = rawType === 'refund' ? 'deposit' : rawType === 'withdrawal' || rawType === 'payout' ? 'withdrawal' : rawType;
          const rawStatus = String(row.status ?? row.transaction_status ?? 'pending').toLowerCase();
          const mappedStatus = rawStatus === 'success' || rawStatus === 'completed' || rawStatus === 'paid'
            ? 'completed'
            : rawStatus === 'failed'
              ? 'failed'
              : 'pending';

          const amountValue = Number(row.amount ?? 0);

          return {
            id: String(row.id ?? `${row.reference ?? 'txn'}-${row.created_at ?? row.createdAt ?? Date.now()}`),
            type: normalizedType as 'withdrawal' | 'deposit' | 'purchase',
            amount: Number.isFinite(amountValue) ? amountValue : 0,
            status: mappedStatus as 'completed' | 'pending' | 'failed',
            description: String(row.description ?? row.reference ?? 'Transaction'),
            reference: typeof row.reference === 'string' ? row.reference : undefined,
            createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
            bankDetails: row.bank_details as Transaction['bankDetails'] || undefined,
            productDetails: row.product_details as Transaction['productDetails'] || undefined,
          };
        })
        .filter((t) => t.type !== 'withdrawal');

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // initial load
    Promise.resolve().then(loadTransactions);

    // refresh when other app parts signal transactions update
    const handler = () => {
      void loadTransactions();
    };
    window.addEventListener('dg:transactions-updated', handler);
    return () => window.removeEventListener('dg:transactions-updated', handler);
  }, [loadTransactions]);

  const filteredTransactions =
    filter === 'all'
      ? transactions
      : transactions.filter((tx) => tx.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'withdrawal':
        return <ArrowDownToLine className="h-4 w-4 text-orange-400" />;
      case 'deposit':
        return <ArrowUpToLine className="h-4 w-4 text-emerald-400" />;
      case 'purchase':
        return <ShoppingBag className="h-4 w-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-300';
      case 'pending':
        return 'bg-amber-500/10 text-amber-300';
      case 'failed':
        return 'bg-rose-500/10 text-rose-300';
      default:
        return 'bg-zinc-700/20 text-zinc-300';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Please login to view transactions</h2>
          <p className="text-zinc-400">Your transaction history will appear here once you&apos;re signed in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-semibold">Back to Home</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-zinc-400">View your deposits and purchases</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['all', 'deposit', 'purchase'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <p className="text-zinc-400">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="rounded-lg bg-zinc-800 p-2 mt-1">{getIcon(tx.type)}</div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">{tx.description}</h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(tx.createdAt).toLocaleString('en-NG')}
                      </p>
                      {tx.reference && (
                        <p className="text-xs text-zinc-600 mt-1 break-all">Ref: {tx.reference}</p>
                      )}

                      {/* Bank Details for Withdrawals */}
                      {tx.type === 'withdrawal' && tx.bankDetails && (
                        <div className="mt-2 text-xs text-zinc-500 space-y-1">
                          <p>
                            To: <span className="text-white">{tx.bankDetails.accountName}</span>
                          </p>
                          <p>
                            Account: <span className="text-white">•••• {tx.bankDetails.accountNumber?.slice(-4)}</span>
                          </p>
                        </div>
                      )}

                      {/* Product Details for Purchases */}
                      {tx.type === 'purchase' && tx.productDetails && (
                        <div className="mt-2 text-xs text-zinc-500">
                          <p>
                            Product: <span className="text-white">{tx.productDetails.productTitle}</span>
                          </p>
                          {tx.productDetails.orderNumber && (
                            <p>
                              Order #<span className="text-white">{tx.productDetails.orderNumber}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${
                      tx.type === 'withdrawal' ? 'text-orange-400' :
                      tx.type === 'deposit' ? 'text-emerald-400' :
                      'text-blue-400'
                    }`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}₦{tx.amount.toLocaleString()}
                    </div>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(
                        tx.status
                      )}`}
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
