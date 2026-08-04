'use client';

import { useEffect, useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, LayoutDashboard, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function PaystackCallbackPage() {
  const { confirmPaystackDeposit } = useApp();
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [message, setMessage] = useState('Verifying your payment with Paystack...');
  const [countdown, setCountdown] = useState(3);
  
  // Guard flag to prevent React Strict Mode dual-execution bugs in development
  const verificationStarted = useRef(false);

  useEffect(() => {
    const verify = async () => {
      const url = new URL(window.location.href);
      const reference = url.searchParams.get('reference');

      if (!reference) {
        setStatus('failed');
        setMessage('No Paystack reference was provided.');
        return;
      }

      if (verificationStarted.current) return;
      verificationStarted.current = true;

      try {
        const result = await confirmPaystackDeposit(reference);

        if (!result.ok) {
          setStatus('failed');
          setMessage(result.error || 'Unable to verify payment.');
          return;
        }

        setStatus('success');
        setMessage(result.amount && result.amount > 0
          ? `Payment verified successfully. ₦${result.amount.toLocaleString()} has been added to your wallet.`
          : 'Payment already verified. Your wallet is up to date.');

        // Initialize redirect countdown
        let count = 3;
        const interval = setInterval(() => {
          count -= 1;
          setCountdown(count);
          if (count <= 0) {
            clearInterval(interval);
            router.push('/marketplace');
          }
        }, 1000);

      } catch {
        setStatus('failed');
        setMessage('An error occurred while verifying the payment.');
      }
    };

    verify();
  }, [confirmPaystackDeposit, router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border border-zinc-800 bg-zinc-900/95 p-8 text-center shadow-2xl">
        {status === 'pending' ? (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700/50 mb-6">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : status === 'success' ? (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 animate-bounce" />
          </div>
        ) : (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30 mb-6">
            <XCircle className="h-8 w-8 text-rose-400" />
          </div>
        )}

        <h1 className="text-2xl font-bold mb-3 tracking-tight">Paystack Verification</h1>
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed px-4">{message}</p>
        
        {status === 'pending' ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800/80 border border-zinc-700/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-zinc-400 animate-pulse" />
            Verifying Transaction
          </div>
        ) : status === 'success' ? (
          <div className="space-y-6">
            <div className="text-xs text-zinc-500 italic">
              Redirecting you to the marketplace in {countdown} second{countdown !== 1 ? 's' : ''}...
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/marketplace"
                className="flex items-center justify-center gap-2 rounded-xl bg-white text-zinc-950 px-5 py-2.5 text-xs font-bold hover:bg-zinc-200 transition active:scale-[0.98]"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Go to Marketplace
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 text-white px-5 py-2.5 text-xs font-bold hover:bg-zinc-700 transition active:scale-[0.98] border border-zinc-700/50"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                My Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 justify-center pt-2">
              <Link
                href="/marketplace"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-2.5 text-xs font-bold hover:bg-blue-500 transition active:scale-[0.98]"
              >
                Try Again / Marketplace
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}