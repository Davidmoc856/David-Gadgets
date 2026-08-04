'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, ShieldCheck, Wallet, Banknote, LogOut } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import WithdrawalWidget from './WithdrawalWidget';

export default function AccountModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    user,
    authLoading,
    createAccount,
    verifyAccountEmail,
    updateProfileDetails,
    depositWithPaystack,
    refundPaystackTransaction,
    connectWallet,
    login,
    logout
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [depositMessage, setDepositMessage] = useState('');
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileMessage, setProfileMessage] = useState('');
  
  // Dynamic Banks State hooks
  const [banksList, setBanksList] = useState<{ name: string; code: string }[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState('');

  const [refundReference] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('dg-paystack-deposit-reference') || '';
  });
  const [refundMessage, setRefundMessage] = useState('');

  // Automatically fetch complete bank data dynamically when modal is mounted
  useEffect(() => {
    if (isOpen) {
      fetch('/api/paystack/banks')
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            const sorted = data.banks.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
            setBanksList(sorted);
          }
        })
        .catch((err) => console.error('Failed processing backend financial directories', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950 text-white shadow-2xl animate-fade-in glass-panel">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-zinc-500 hover:text-zinc-200 transition-all duration-200 hover:scale-110 active:scale-90 p-1 rounded-lg hover:bg-zinc-900/60" aria-label="Close modal">
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[92vh] overflow-y-auto p-6">
        {authLoading ? (
          <LoadingSpinner />
        ) : !user ? (
          <div>
            <div className="flex items-center gap-2 mb-4 justify-between">
              <div>
                <h2 className="text-xl font-bold">Welcome Back</h2>
                <p className="text-xs text-zinc-400">Select Login if you already have an account, or Register to create a new one.</p>
              </div>
              <div className="rounded-full bg-zinc-900/80 p-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-400 shrink-0">
                {activeTab === 'login' ? 'Sign In' : 'Register'}
              </div>
            </div>

            <div className="mb-6 flex rounded-2xl border border-zinc-900 bg-zinc-900/50 p-1 text-xs font-semibold text-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setAuthMessage('');
                  setAwaitingVerification(false);
                }}
                className={`flex-1 rounded-xl px-3 py-2.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${activeTab === 'login' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setAuthMessage('');setAwaitingVerification(false);
                }}
                className={`flex-1 rounded-xl px-3 py-2.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${activeTab === 'register' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Register
              </button>
            </div>

            {activeTab === 'login' ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  setAuthMessage('');
                  const result = await login(loginEmail, loginPassword); 
                  setLoading(false);

                  if (result.ok) {
                    setAuthMessage('Logged in successfully.');
                    onClose();
                    return;
                  }
                  setAuthMessage(result.error || 'Unable to login.');
                }}
                className="space-y-4"
              >
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                />
                {authMessage ? <p className="text-xs text-rose-400">{authMessage}</p> : null}
                <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 font-bold text-white transition-all duration-300 text-sm disabled:opacity-60 shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] active-press interactive-bounce">
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </form>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (password !== confirmPassword) {
                    setAuthMessage('Passwords do not match.');
                    return;
                  }

                  setLoading(true);
                  setAuthMessage('');
                  const result = await createAccount(name, email, password);
                  setLoading(false);

                  if (result.ok) {
                    setAuthMessage('Account created successfully.');
                    onClose();
                    return;
                  }

                  if (result.needsVerification) {
                    setAwaitingVerification(true);
                    setAuthMessage('Check your inbox for the verification code.');
                  } else {
                    setAuthMessage(result.error || 'Unable to create account.');
                  }
                }}
                className="space-y-3"
              >
                <input 
                  type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                />
                <input 
                  type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                />
                <input 
                  type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                />
                <input 
                  type="password" required placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                />
                {authMessage ? <p className="text-xs text-zinc-400">{authMessage}</p> : null}
                <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 font-bold text-white transition-all duration-300 text-sm disabled:opacity-60 shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] active-press interactive-bounce">
                  {loading ? 'Creating account...' : 'Save & Continue'}
                </button>
              </form>
            )}

            {awaitingVerification ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  const result = await verifyAccountEmail(email, otpToken);
                  setLoading(false);

                  if (result.ok) {
                    setAuthMessage('Email verified. You can use the wallet now.');
                    onClose();
                  } else {
                    setAuthMessage(result.error || 'Verification failed.');
                  }
                }}
                className="mt-4 space-y-3"
              >
                <input
                  type="text"
                  required
                  placeholder="6-digit verification code"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700 text-center font-mono tracking-widest"
                />
                <button type="submit" disabled={loading} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 font-bold text-white transition-all duration-300 text-sm disabled:opacity-60 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] active-press interactive-bounce">
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <section className="rounded-xl border border-zinc-800 bg-[#121212] p-4">
                <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-4">Edit Profile</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    setProfileMessage('');
                    setVerifyMessage('');

                    const result = await updateProfileDetails(profileName, selectedBankCode, accountNumber);
                    setLoading(false);

                    if (result.ok) {
                      setProfileMessage('Profile updated successfully.');
                      setVerifyMessage(`Account verified: ${result.accountName || 'Verified'}`);
                      setSelectedBankCode('');
                      setAccountNumber('');
                    } else {
                      setProfileMessage(result.error || 'Unable to update profile.');
                    }
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    required
                    placeholder="Display Name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                  />

                  <select
                    value={selectedBankCode}
                    onChange={(e) => setSelectedBankCode(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                  >
                    <option value="" className="bg-zinc-950">Select Bank / Wallet (optional update)</option>
                    {banksList.map((b) => (
                      <option key={b.code} value={b.code} className="bg-zinc-950 text-white">
                        {b.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Account Number (optional update)"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                  />

                  {profileMessage ? <p className="text-xs text-emerald-400">{profileMessage}</p> : null}
                  {verifyMessage ? <p className="text-xs text-emerald-400">{verifyMessage}</p> : null}
                  <button type="submit" className="w-full rounded-xl bg-zinc-900 border border-zinc-850 py-2.5 font-semibold text-zinc-200 hover:text-white hover:bg-zinc-850 transition-all duration-300 text-xs shadow-sm hover:scale-[1.01] active:scale-[0.99] interactive-bounce">
                    {loading ? 'Saving...' : 'Save Profile & Bank Details'}
                  </button>
                </form>
              </section>

              <section className="rounded-xl border border-zinc-800 bg-[#121212] p-4">
                <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-4">Finances</h3>

                <div className="space-y-4">
                  {user.bankVerified ? (
                    <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3 flex gap-2.5 items-center">
                      <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div className="text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-200 block">Bank Settlement Profile Verified</span>
                        Linked to {user.bankName} •••• {user.accountNumber.slice(-4)}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200 leading-relaxed">
                      Add your bank details in the profile form below to enable secure payout settlement. Deposits are ready right away.
                    </div>
                  )}

                  <div className="grid gap-4 lg:grid-cols-2">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        setDepositMessage('');
                        const result = await depositWithPaystack(Number(depositAmount));
                        setLoading(false);
                        if (!result.ok) {
                          setDepositMessage(result.error || 'Unable to start deposit.');
                          return;
                        }
                        setDepositMessage('Redirecting to Paystack...');
                        if (result.url) {
                          window.location.href = result.url;
                        }
                      }}
                      className="space-y-2"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Fund Account Escrow</h4>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          required
                          placeholder="Amount (₦)"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="flex-1 rounded-xl bg-zinc-900/50 border border-zinc-800/80 px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all duration-300 hover:border-zinc-700"
                        />
                        <button type="submit" className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center gap-1.5 interactive-bounce">
                          <Banknote className="h-3.5 w-3.5" />
                          Deposit
                        </button>
                      </div>
                      {depositMessage ? <p className="text-xs text-emerald-400">{depositMessage}</p> : null}
                    </form>

                    <div className="space-y-4">
                      {refundReference ? (
                        <div className="space-y-3 rounded-3xl border border-zinc-900 bg-zinc-950/80 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Deposit Refunds</h4>
                          <p className="text-xs leading-relaxed text-zinc-400">
                            Deposit refunds are handled securely by our operations team through the Paystack Dashboard. We do not allow manual refund triggers from the app to avoid security gaps on unverified backend integrations.
                          </p>
                          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 text-xs text-zinc-300">
                            <p>Detected deposit reference from your most recent Paystack payment:</p>
                            <p className="mt-2 text-white break-all">{refundReference}</p>
                          </div>
                          <p className="text-[11px] text-zinc-500">
                            Need help? Please contact support and we&apos;ll manage your refund safely.
                          </p>
                        </div>
                      ) : null}

                      <WithdrawalWidget
                        key={`${user.bankName}-${user.accountNumber}-${user.bankCode}`}
                        currentBalance={user.walletBalance}
                        linkedBank={{
                          name: user.bankName || user.name,
                          accountNumber: user.accountNumber,
                          bankCode: user.bankCode || '',
                        }}
                        onRefreshData={() => {
                          window.location.reload();
                        }}
                      />

                      <div className="rounded-xl border border-zinc-900 bg-zinc-950/80 p-4 text-xs text-zinc-400">
                        Advanced wallet debug and transaction backfill tools are temporarily disabled for launch. Your wallet balance and purchase experience continue to function normally.
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="md:col-span-1">
              <div className="sticky top-0 rounded-xl border border-zinc-800 bg-[#121212] p-4 space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-blue-500 font-extrabold">Active Escrow Profile</span>
                  <h2 className="text-lg font-bold text-zinc-100 mt-1">{user.name}</h2>
                  <p className="text-xs text-zinc-500 break-all">{user.email}</p>
                </div>

                <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-3 space-y-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-semibold">Registered</span>
                    <p className="text-xs text-zinc-300 mt-1">
                      {user.registeredAt
                        ? new Date(user.registeredAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'Registration date unavailable'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-semibold">Wallet Balance</span>
                    <p className="text-2xl font-bold text-blue-500 mt-1">₦{user.walletBalance.toLocaleString()}</p>
                  </div>
                  {!user.isConnected ? (
                    <button onClick={connectWallet} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-3 py-2 text-xs font-bold text-white transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98] interactive-bounce w-full">
                      <Wallet className="h-3.5 w-3.5" />
                      Connect Wallet
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Connected
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500 py-3 text-xs font-bold text-red-400 hover:text-white transition-all duration-300 shadow-md shadow-red-500/5 hover:shadow-red-500/20 hover:scale-[1.01] active:scale-[0.99] active-press interactive-bounce"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
