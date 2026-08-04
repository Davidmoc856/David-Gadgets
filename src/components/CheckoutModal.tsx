'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/utils/supabase/client';
import { X, Store, Truck, ShieldAlert, CheckCircle, Wallet, PackageCheck } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  productPrice: string;
}

export default function CheckoutModal({ isOpen, onClose, productTitle, productPrice }: CheckoutModalProps) {
  const { user, authLoading, placeOrder } = useApp();
  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [customerName, setCustomerName] = useState("");
  const customerNameValue = customerName || user?.name || "";

  const cleanPrice = Number(productPrice.toString().replace(/[^0-9.-]+/g, ""));
  const deliveryFee = method === 'delivery' ? 3000 : 0;
  const totalPrice = cleanPrice + deliveryFee;

  const [dbBalance, setDbBalance] = useState<number | null>(null);
  const [checkingDbBalance, setCheckingDbBalance] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    const fetchBalance = async () => {
      if (!isOpen) return;
      setCheckingDbBalance(true);
      try {
        const supabase = createClient();
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr || !session?.user) {
          // if no session, keep dbBalance as null so button remains disabled until user connects
          if (mounted) setDbBalance(null);
          return;
        }
        const userId = session.user.id;
        const { data: wallet, error } = await supabase.from('wallets').select('balance').eq('user_id', userId).maybeSingle();
        if (error) {
          console.error('Failed to fetch wallet balance:', error);
          if (mounted) setDbBalance(null);
          return;
        }
        const numeric = Number(wallet?.balance ?? 0);
        if (mounted) setDbBalance(Number.isFinite(numeric) ? numeric : 0);
      } catch (err) {
        console.error('Error fetching authoritative wallet balance:', err);
        if (mounted) setDbBalance(null);
      } finally {
        if (mounted) setCheckingDbBalance(false);
      }
    };

    fetchBalance();
    return () => { mounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
          <LoadingSpinner />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-center space-y-4">
          <h3 className="font-bold text-zinc-100">Account Required</h3>
          <p className="text-xs text-zinc-400">Please connect your wallet using the button in the top-right navigation bar to proceed with checkout.</p>
          <button onClick={onClose} className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white transition-all duration-300 active:scale-[0.98]">
            Close & Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

// Ensure authoritative balance is loaded and sufficient before attempting to place order
if (checkingDbBalance || dbBalance === null) {
  alert('Please wait while we verify your wallet balance.');
  return;
}

if (totalPrice > dbBalance) {
  alert(`Insufficient Escrow Wallet balance. You need ₦${(totalPrice - dbBalance).toLocaleString()} more to complete this purchase.`);
  return;
}

const result = await placeOrder(
  productTitle,
  totalPrice,
  method,
  customerNameValue,
  phoneNumber,
  method === 'delivery' ? `State: ${selectedState} | Address: ${address}` : undefined
);

if (result.ok) {
  setIsSuccess(true);
  return;
}

alert(result.error || 'Order placement failed. Please deposit funds via your wallet options first.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950 text-white shadow-2xl glass-panel animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-zinc-500 hover:text-zinc-200 transition-all duration-200 hover:scale-110 active:scale-90 p-1 rounded-lg hover:bg-zinc-900/60" aria-label="Close modal">
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[92vh] overflow-y-auto p-6">
        {isSuccess ? (
          /* 🎉 SUCCESS INVOICE DISPLAY */
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Escrow Securely Locked!</h2>
              <p className="text-xs text-zinc-400 mt-1">Order processed for {productTitle}</p>
            </div>
            <div className="rounded-xl bg-zinc-900/50 p-4 text-left text-xs space-y-2 border border-zinc-900">
              <p><span className="text-zinc-500">Customer:</span> {customerNameValue}</p>
              <p><span className="text-zinc-500">Contact Phone:</span> {phoneNumber}</p>
              <p><span className="text-zinc-500">Full Payment:</span> ₦{totalPrice.toLocaleString()}</p>
              <p><span className="text-zinc-500">Fulfillment:</span> {method === 'pickup' ? 'In-Store Pickup (David Gadgets Shop)' : 'Logistics Route Delivery'}</p>
              {method === 'delivery' && <p className="truncate"><span className="text-zinc-500">Address:</span> {address}</p>}
            </div>
            <button onClick={() => { setIsSuccess(false); onClose(); }} className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] active-press interactive-bounce">
              Done
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <section className="rounded-xl border border-zinc-800 bg-[#121212] p-4">
                <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-4">Confirm Escrow Purchase</h3>
                <p className="text-xs text-zinc-500 mb-4">{productTitle} — <span className="text-blue-400 font-semibold">{productPrice}</span></p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-450 mb-1.5 text-xs font-semibold">Customer Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={customerNameValue}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800/80 px-4 py-3 text-xs text-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-455 mb-1.5 text-xs font-semibold">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 08012345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800/80 px-4 py-3 text-xs text-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-2">Fulfillment Choice</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMethod('pickup')}
                        className={`flex flex-col items-center gap-2 rounded-xl p-4 border text-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${method === 'pickup' ? 'border-blue-600 bg-blue-600/10 text-white shadow-md shadow-blue-600/5' : 'border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-750 hover:bg-zinc-900/40'}`}
                      >
                        <Store className="h-5 w-5 text-blue-500" />
                        <span className="text-xs font-bold">Pick up at Shop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMethod('delivery')}
                        className={`flex flex-col items-center gap-2 rounded-xl p-4 border text-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${method === 'delivery' ? 'border-blue-600 bg-blue-600/10 text-white shadow-md shadow-blue-600/5' : 'border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-750 hover:bg-zinc-900/40'}`}
                      >
                        <Truck className="h-5 w-5 text-blue-500" />
                        <span className="text-xs font-bold">Logistics Delivery</span>
                      </button>
                    </div>
                  </div>

                  {method === 'delivery' && (
                    <div className="transition-all duration-300 space-y-4 animate-fade-in">
                      <div>
                        <label className="block text-zinc-400 mb-1.5 text-xs font-semibold">State / Region</label>
                        <select
                          required
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-zinc-800/80 px-4 py-3 text-xs text-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                        >
                          <option value="" disabled className="bg-zinc-950 text-zinc-400">Select State</option>
                          <option value="Lagos" className="bg-zinc-950">Lagos</option>
                          <option value="Abuja" className="bg-zinc-950">Abuja</option>
                          <option value="Anambra" className="bg-zinc-950">Anambra</option>
                          <option value="Oyo" className="bg-zinc-950">Oyo</option>
                          <option value="Imo" className="bg-zinc-950">Imo</option>
                          <option value="Abia" className="bg-zinc-950">Abia</option>
                          <option value="Kwara" className="bg-zinc-950">Kwara</option>
                          <option value="Benue" className="bg-zinc-950">Benue</option>
                          <option value="Delta" className="bg-zinc-950">Delta</option>
                          <option value="Port Harcourt" className="bg-zinc-950">Port Harcourt</option>
                          <option value="Cross-river" className="bg-zinc-950">Cross-river</option>
                          <option value="Benin" className="bg-zinc-950">Benin</option>
                          <option value="Ogun" className="bg-zinc-950">Ogun</option>
                          <option value="Ekiti" className="bg-zinc-950">Ekiti</option>
                          <option value="Osun" className="bg-zinc-950">Osun</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-1.5 text-xs font-semibold">Shipping Destination Address</label>
                        <textarea
                          required
                          rows={2}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter street name, apartment number..."
                          className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-3 text-xs text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-zinc-900 bg-zinc-900/30 p-4 text-xs space-y-2">
                    <div className="flex justify-between text-zinc-500 font-medium">
                      <span>Product Price</span>
                      <span className="text-zinc-300">₦{cleanPrice.toLocaleString()}</span>
                    </div>
                    {method === 'delivery' && (
                      <div className="flex justify-between text-zinc-500 font-medium">
                        <span>Delivery Fee</span>
                        <span className="text-zinc-300">₦3,000</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-zinc-900 pt-2.5 font-bold text-white text-sm">
                      <span>Total Amount</span>
                      <span className="text-blue-550">₦{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-3 flex gap-2 items-start text-xs text-zinc-450 leading-relaxed">
                    <ShieldAlert className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>Your funds are deposited securely into an isolated escrow wallet pool. Settlement to the vendor occurs strictly after inspection clearance.</span>
                  </div>

                  {!user ? (
                    <div className="text-center text-xs text-red-400 font-medium">Please connect your wallet/account first using the navbar button.</div>
                  ) : (
                    <>
                      <button
                        type="submit"
                        disabled={checkingDbBalance || dbBalance === null || totalPrice > (dbBalance ?? 0)}
                        className={`w-full rounded-xl py-3.5 font-bold text-white transition-all duration-300 text-xs shadow-lg active:scale-[0.98] active-press interactive-bounce ${checkingDbBalance || dbBalance === null || totalPrice > (dbBalance ?? 0)
                          ? 'bg-zinc-700 cursor-not-allowed hover:bg-zinc-700/95 shadow-none'
                          : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/10 hover:shadow-blue-500/25 hover:scale-[1.02]'} `}
                      >
                        {checkingDbBalance ? 'Checking balance...' : 'Authorize Escrow Agreement'}
                      </button>

                      {dbBalance !== null && totalPrice > dbBalance && (
                        <p className="mt-2 text-xs text-red-400">You need an additional <strong>₦{(totalPrice - dbBalance).toLocaleString()}</strong> to complete this purchase.</p>
                      )}
                    </>
                  )}
                </form>
              </section>
            </div>

            <div className="md:col-span-1">
              <div className="sticky top-0 rounded-xl border border-zinc-800 bg-[#121212] p-4 space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-blue-500 font-extrabold">Delivery Summary</span>
                  <h2 className="text-lg font-bold text-zinc-100 mt-1">{customerNameValue || 'Customer Name'}</h2>
                  <p className="text-xs text-zinc-500 break-all">{phoneNumber || 'Phone number not entered yet'}</p>
                </div>

                <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-3 space-y-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-semibold">Fulfillment</span>
                    <p className="text-xs text-zinc-300 mt-1">{method === 'pickup' ? 'In-store pickup' : 'Home delivery'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-semibold">Delivery State</span>
                    <p className="text-xs text-zinc-300 mt-1">{selectedState || 'Select a state'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-semibold">Order Total</span>
                    <p className="text-2xl font-bold text-blue-500 mt-1">₦{totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-2 mb-2 text-zinc-200">
                    <Wallet className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">Escrow Wallet</span>
                  </div>
                  <p>{user?.walletBalance ? `Current wallet balance: ₦${user.walletBalance.toLocaleString()}` : 'Your balance will appear here once connected.'}</p>
                </div>

                <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-2 mb-2 text-zinc-200">
                    <PackageCheck className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold">Protected Checkout</span>
                  </div>
                  <p>Funds stay secured until the device is delivered and confirmed.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
