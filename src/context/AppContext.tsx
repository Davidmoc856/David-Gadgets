'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Order {
  id: string;
  productTitle: string;
  price: number;
  formattedPrice?: string;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: string;
  address?: string;
  eta?: string;
  status: 'Funds Locked' | 'Verified' | 'In Transit' | 'Ready for Pickup' | 'Completed';
}

interface UserAccount {
  id?: string;
  name: string;
  email: string;
  emailVerified: boolean;
  bankVerified: boolean;
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  walletBalance: number;
  isConnected: boolean;
  registeredAt: string | null;
}

interface AppContextType {
  user: UserAccount | null;
  orders: Order[];
  authLoading: boolean;
  createAccount: (name: string, email: string, password: string) => Promise<{ ok: boolean; needsVerification: boolean; error?: string }>;
  verifyAccountEmail: (email: string, token: string) => Promise<{ ok: boolean; error?: string }>;
  verifyBankDetails: (bankCode: string, accountNumber: string, displayName?: string) => Promise<{ ok: boolean; error?: string; accountName?: string }>;
  updateProfileDetails: (name: string, bankCode?: string, accountNumber?: string) => Promise<{ ok: boolean; error?: string; accountName?: string }>;
  depositWithPaystack: (amount: number) => Promise<{ ok: boolean; url?: string; reference?: string; error?: string }>;
  withdrawFunds: (amount: number, accountDetails: { name: string; accountNumber: string; bankCode: string }) => Promise<{
    ok: boolean;
    message?: string;
    error?: string;
    receipt?: {
      reference: string;
      amount: number;
      accountName: string;
      accountNumber: string;
      bankCode: string;
      createdAt: string;
    };
  }>;
  confirmPaystackDeposit: (reference: string) => Promise<{ ok: boolean; amount?: number; error?: string }>;
  refundPaystackTransaction: (reference: string) => Promise<{ ok: boolean; error?: string }>;
  connectWallet: () => void;
  makeDeposit: (amount: number) => void;
  placeOrder: (productTitle: string, price: number, method: 'pickup' | 'delivery', customerName: string, phoneNumber: string, address?: string) => Promise<{ ok: boolean; error?: string }>;
  cancelOrder: (orderId: string) => void;
  confirmDelivery: (orderId: string) => Promise<void>;
  clearCompletedOrders: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);
  const fetchPromiseRef = useRef<Record<string, Promise<unknown>>>({});

  const getStoredWalletBalance = useCallback((userId: string) => {
    if (typeof window === 'undefined') return null;

    const storedValue = window.localStorage.getItem(`dg-wallet-balance-${userId}`);
    const parsedValue = Number(storedValue);

    return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null;
  }, []);

  const setStoredWalletBalance = useCallback((userId: string, balance: number) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(`dg-wallet-balance-${userId}`, String(balance));
  }, []);

  const fetchUserOrders = useCallback(async (userId: string) => {
    type DbOrderRow = {
      order_number: string;
      phone_model: string;
      price: number;
      fulfillment_method: 'pickup' | 'delivery';
      shipping_address?: string;
      status: string;
      user_id?: string;
      customer_name?: string;
    };

    try {
      const storedOrdersKey = `dg-user-orders-${userId}`;
      const storedOrderNumbers: string[] = JSON.parse(window.localStorage.getItem(storedOrdersKey) || '[]');

      const buildFallbackQuery = () => {
        if (storedOrderNumbers.length === 0) return null;

        return supabase
          .from('orders')
          .select('*')
          .or(`order_number.in.(${storedOrderNumbers.map((n) => `"${n}"`).join(',')})`);
      };

      const { data: dbOrdersByUserId, error: userIdError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      let dbOrders = dbOrdersByUserId;
      let dbError = userIdError;

      if (userIdError && (userIdError.code === 'PGRST116' || /user_id/.test(userIdError.message || ''))) {
        const fallback = buildFallbackQuery();
        if (fallback) {
          const { data: fallbackOrders, error: fallbackError } = await fallback.order('created_at', { ascending: false });
          dbOrders = fallbackOrders;
          dbError = fallbackError;
        }
      } else if (!userIdError && (!dbOrdersByUserId || dbOrdersByUserId.length === 0)) {
        const fallback = buildFallbackQuery();
        if (fallback) {
          const { data: fallbackOrders, error: fallbackError } = await fallback.order('created_at', { ascending: false });
          if (!fallbackError && fallbackOrders && fallbackOrders.length > 0) {
            dbOrders = fallbackOrders;
            dbError = null;
          }
        }
      }

      if (dbError) throw dbError;

      if (dbOrders) {
        const mappedOrders: Order[] = (dbOrders as DbOrderRow[]).map((dbOrder) => {
          let userStatus: Order['status'] = 'Funds Locked';
          if (dbOrder.status === 'verified') {
            userStatus = 'Verified';
          } else if (dbOrder.status === 'ready_for_pickup') {
            userStatus = 'Ready for Pickup';
          } else if (dbOrder.status === 'shipped') {
            userStatus = 'In Transit';
          } else if (dbOrder.status === 'completed') {
            userStatus = 'Completed';
          }

          return {
            id: dbOrder.order_number,
            productTitle: dbOrder.phone_model,
            price: dbOrder.price,
            formattedPrice: `₦${dbOrder.price.toLocaleString()}`,
            deliveryMethod: dbOrder.fulfillment_method,
            deliveryAddress: dbOrder.shipping_address,
            address: dbOrder.shipping_address,
            eta: dbOrder.fulfillment_method === 'pickup' ? 'Ready Today' : 'Arriving in 2 - 5 Hours',
            status: userStatus,
          };
        });

        setOrders(mappedOrders);

        const fetchedNumbers = (dbOrders as DbOrderRow[]).map((order) => order.order_number);
        window.localStorage.setItem(storedOrdersKey, JSON.stringify(fetchedNumbers));
      } else {
        setOrders([]);
        window.localStorage.setItem(storedOrdersKey, JSON.stringify([]));
      }
    } catch (err) {
      console.error('Error fetching user orders from Supabase:', err);
    }
  }, [supabase]);

  // Helper function to fetch persistence details from Supabase tables
  const fetchPersistedUserData = useCallback(async (
    userId: string,
    email: string,
    emailConfirmed: boolean,
    fallbackName: string,
    registeredAt?: string | null,
  ) => {
    // Deduplicate concurrent fetch requests for the same user
    if (fetchPromiseRef.current[userId] !== undefined) {
      return fetchPromiseRef.current[userId];
    }

    const fetchPromise = (async () => {
      try {
        // Fetch profile and wallet in parallel
        const [profileResult, walletResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(),
          supabase
            .from('wallets')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()
        ]);

        let profileData = profileResult.data;
        if (profileResult.error) {
          console.error('Error fetching profile:', profileResult.error);
        }

        if (!profileData && !profileResult.error) {
          // Profile doesn't exist yet, insert a blank one
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: userId, email: email, name: fallbackName }])
            .select()
            .maybeSingle();
          
          if (!insertError) {
            profileData = newProfile;
          } else {
            console.error('Error creating profile:', insertError);
          }
        }

        let walletData = walletResult.data;
        const localWalletBalance = getStoredWalletBalance(userId);
        const hasMissingTableError = walletResult.error?.code === 'PGRST205';

        if (walletResult.error && !hasMissingTableError) {
          console.error('Error fetching wallet balance:', walletResult.error);
        }

        // Try creating the wallet ONLY if wallets table exists and wallet row is missing
        if (!walletData && !hasMissingTableError) {
          const { data: newWallet, error: insertWalletError } = await supabase
            .from('wallets')
            .insert([{ user_id: userId, balance: localWalletBalance ?? 0 }])
            .select()
            .maybeSingle();

          if (!insertWalletError) {
            walletData = newWallet;
          } else if (insertWalletError.code !== 'PGRST205') {
            console.error('Error creating wallet row:', insertWalletError);
          }
        }

        const persistedWalletBalance = Number(walletData?.balance ?? localWalletBalance ?? 0);
        if (typeof window !== 'undefined') {
          setStoredWalletBalance(userId, persistedWalletBalance);
        }

        const resolvedName = profileData?.name || fallbackName;
        // Preserve any existing in-memory user fields if the DB profile fetch errored or missing fields
        const existingUser = user || null;
        const resolvedBankVerified = (profileData && typeof profileData.bank_verified !== 'undefined') ? profileData.bank_verified : (existingUser ? existingUser.bankVerified : false);
        const resolvedBankName = (profileData && profileData.bank_name) ? profileData.bank_name : (existingUser ? existingUser.bankName : '');
        const resolvedBankCode = (profileData && profileData.bank_code) ? profileData.bank_code : (existingUser ? existingUser.bankCode : '');
        const resolvedAccountNumber = (profileData && profileData.account_number) ? profileData.account_number : (existingUser ? existingUser.accountNumber : '');

        setUser({
          id: userId,
          name: resolvedName,
          email: email,
          emailVerified: emailConfirmed,
          bankVerified: resolvedBankVerified || false,
          bankName: resolvedBankName || '',
          bankCode: resolvedBankCode || '',
          accountNumber: resolvedAccountNumber || '',
          walletBalance: persistedWalletBalance,
          isConnected: (profileData && typeof profileData.is_connected !== 'undefined') ? profileData.is_connected : (existingUser ? existingUser.isConnected : false),
          registeredAt: registeredAt || null,
        });

        // Load the persistent orders associated with this user
        await fetchUserOrders(userId);
      } catch (err) {
        console.error('Error syncing data from Supabase DB:', err);
      } finally {
        // Clear reference once done
        delete fetchPromiseRef.current[userId];
      }
    })();

    fetchPromiseRef.current[userId] = fetchPromise;
    return fetchPromise;
  }, [getStoredWalletBalance, setStoredWalletBalance, supabase, fetchUserOrders, user]);

  const writeTransactionHistory = useCallback(async ({
    userId,
    amount,
    type,
    status,
    reference,
    description,
    productDetails,
    bankDetails,
    createdAt,
  }: {
    userId: string;
    amount: number;
    type: 'deposit' | 'purchase' | 'refund' | 'withdrawal';
    status: 'pending' | 'completed' | 'failed' | 'success';
    reference: string;
    description: string;
    productDetails?: { productTitle?: string; orderNumber?: string };
    bankDetails?: { accountNumber?: string; accountName?: string; bankCode?: string };
    createdAt?: string;
  }) => {
    const normalizedStatus = status === 'success' ? 'completed' : status;
    const payload = {
      user_id: userId,
      amount,
      transaction_type: type,
      type,
      reference,
      description,
      status: normalizedStatus,
      created_at: createdAt ?? new Date().toISOString(),
      ...(productDetails ? { product_details: productDetails } : {}),
      ...(bankDetails ? { bank_details: bankDetails } : {}),
    };

    try {
      const { error } = await supabase.from('transactions').insert([payload]);
      if (error) throw error;
      return;
    } catch (transactionTableError) {
      console.warn('transactions table not available, falling back to wallet_transactions:', transactionTableError);
    }

    try {
      await supabase.from('wallet_transactions').insert([{
        user_id: userId,
        amount,
        type,
        status: normalizedStatus === 'completed' ? 'completed' : normalizedStatus,
        reference,
        description,
        created_at: payload.created_at,
        ...(productDetails ? { product_details: productDetails } : {}),
        ...(bankDetails ? { bank_details: bankDetails } : {}),
      }]);
    } catch (walletError) {
      console.error('Failed to store transaction history in wallet_transactions:', walletError);
    }
  }, [supabase]);

  const creditWalletBalance = useCallback(async (userId: string, amount: number) => {
    const safeAmount = Number(amount);
    if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
      throw new Error('Invalid deposit amount.');
    }

    const localBalance = getStoredWalletBalance(userId) ?? 0;
    const nextBalance = localBalance + safeAmount;

    try {
      const { data: existingWallet, error: fetchError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingWallet) {
        const { error: updateError } = await supabase
          .from('wallets')
          .update({ balance: Number(existingWallet.balance) + safeAmount })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('wallets')
          .insert([{ user_id: userId, balance: safeAmount }]);

        if (insertError) throw new Error(insertError.message || JSON.stringify(insertError));
      }
    } catch (err) {
      console.error('DB wallet update failed, falling back to local storage:', err);
      setStoredWalletBalance(userId, nextBalance);
      return;
    }

    setStoredWalletBalance(userId, nextBalance);
  }, [getStoredWalletBalance, setStoredWalletBalance, supabase]);

  useEffect(() => {
    const syncUserSession = async () => {
      setAuthLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchPersistedUserData(
            session.user.id,
            session.user.email || '',
            !!session.user.email_confirmed_at,
            session.user.user_metadata?.full_name || session.user.user_metadata?.username || 'Customer'
          );
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error syncing user session:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    syncUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setAuthLoading(true);
      try {
        if (session?.user) {
          await fetchPersistedUserData(
            session.user.id,
            session.user.email || '',
            !!session.user.email_confirmed_at,
            session.user.user_metadata?.full_name || session.user.user_metadata?.username || 'Customer'
          );
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error in onAuthStateChange:', err);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchPersistedUserData]);

  const createAccount = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        return { ok: false, needsVerification: false, error: error.message };
      }

      if (data.session?.user) {
        await fetchPersistedUserData(
          data.session.user.id,
          email,
          Boolean(data.session.user.email_confirmed_at),
          name,
          data.session.user.created_at || null,
        );
        return { ok: true, needsVerification: false };
      }

      return { ok: false, needsVerification: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create account';
      return { ok: false, needsVerification: false, error: message };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      if (data.session?.user) {
        await fetchPersistedUserData(
          data.session.user.id,
          data.session.user.email || email,
          Boolean(data.session.user.email_confirmed_at),
          data.session.user.user_metadata?.full_name || 'Customer',
          data.session.user.created_at || null,
        );
        return { ok: true };
      }

      return { ok: false, error: 'Login failed. Please try again.' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to login';
      return { ok: false, error: message };
    }
  };

  const verifyAccountEmail = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      if (data.session?.user) {
        await fetchPersistedUserData(
          data.session.user.id,
          email,
          Boolean(data.session.user.email_confirmed_at),
          data.session.user.user_metadata?.full_name || 'Customer',
          data.session.user.created_at || null,
        );
        return { ok: true };
      }

      return { ok: false, error: 'Verification did not complete.' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to verify account';
      return { ok: false, error: message };
    }
  };

  const verifyBankDetails = async (bankCode: string, accountNumber: string, displayName?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !user) {
      return { ok: false, error: 'You must be logged in to verify bank details.' };
    }

    try {
      const response = await fetch('/api/paystack/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankCode, accountNumber, accountDisplayName: displayName || user.name }),
      });
      const data = await response.json();

      if (!data.ok) {
        return { ok: false, error: data.error || 'Unable to verify bank details.' };
      }

      const verifiedBankName = data.bankName || 'Verified Settlement Profile';
      const verifiedAccountName = data.accountName || displayName || user.name;
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          name: verifiedAccountName,
          bank_verified: true,
          bank_name: verifiedBankName,
          account_number: accountNumber,
          is_connected: true
        })
        .eq('id', session.user.id);

      if (dbError) throw dbError;

      setUser({
        ...user,
        name: verifiedAccountName,
        bankName: verifiedBankName,
        bankCode: bankCode,
        accountNumber: accountNumber,
        bankVerified: true,
        isConnected: true,
      });

      return { ok: true, accountName: verifiedAccountName };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to verify bank details.';
      return { ok: false, error: message };
    }
  };

  const updateProfileDetails = async (name: string, bankCode?: string, accountNumber?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !user) {
      return { ok: false, error: 'You must be logged in to update your profile.' };
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      return { ok: false, error: 'Please enter a valid profile name.' };
    }

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: trimmedName,
          is_connected: true,
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      let finalName = trimmedName;
      let finalResult: { ok: boolean; error?: string; accountName?: string } = { ok: true, accountName: trimmedName };

      if (bankCode && accountNumber) {
        finalResult = await verifyBankDetails(bankCode, accountNumber, trimmedName);
        finalName = finalResult.accountName || trimmedName;
      }

      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        return {
          ...currentUser,
          name: finalName,
          bankVerified: currentUser.bankVerified,
          isConnected: true,
        };
      });

      return finalResult.ok
        ? { ok: true, accountName: finalName }
        : { ok: false, error: finalResult.error || 'Unable to update profile.' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update profile.';
      return { ok: false, error: message };
    }
  };

  const depositWithPaystack = async (amount: number) => {
    if (!user) {
      return { ok: false, error: 'Please login before depositing funds.' };
    }

    try {
      const callbackUrl = `${window.location.origin}/paystack/callback`;
      const reference = `DG-DEPOSIT-${Date.now()}`;
      const response = await fetch('/api/paystack/initialize-transaction', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount,
          reference,
          callbackUrl,
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        return { ok: false, error: data.error || 'Unable to start Paystack deposit.' };
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('dg-paystack-deposit-reference', reference);
      }

      return { ok: true, url: data.authorizationUrl, reference };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start deposit.';
      return { ok: false, error: message };
    }
  };

  const withdrawFunds = useCallback(async (amount: number, accountDetails: { name: string; accountNumber: string; bankCode: string }) => {
    if (!user) {
      return { ok: false, error: 'Please login before withdrawing funds.' };
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1000) {
      return { ok: false, error: 'Minimum withdrawal is ₦1,000.' };
    }

    if (parsedAmount > user.walletBalance) {
      return { ok: false, error: 'Requested payout exceeds your available wallet balance.' };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { ok: false, error: 'Unable to authorize withdrawal request. Please sign in again.' };
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      };

      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount: parsedAmount, accountDetails }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { ok: false, error: data.error || 'Unable to process the withdrawal.' };
      }

      const nextBalance = Math.max(user.walletBalance - parsedAmount, 0);
      if (user.id) {
        setStoredWalletBalance(user.id, nextBalance);
      }
      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        return { ...currentUser, walletBalance: nextBalance };
      });

      return {
        ok: true,
        message: data.message || 'Withdrawal completed successfully.',
        receipt: data.receipt || {
          reference: data?.data?.reference || 'PAYSTACK-TRANSFER',
          amount: parsedAmount,
          accountName: accountDetails.name,
          accountNumber: accountDetails.accountNumber,
          bankCode: accountDetails.bankCode,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to process the withdrawal.';
      return { ok: false, error: message };
    }
  }, [setStoredWalletBalance, supabase, user]);

  const confirmPaystackDeposit = async (reference: string) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return { ok: false, error: sessionError.message || 'Unable to read your login session.' };
    }

    const authUser = session?.user;
    if (!authUser) {
      return { ok: false, error: 'Please login before confirming deposit.' };
    }

    if (!reference) {
      return { ok: false, error: 'Paystack reference is required.' };
    }

    try {
      const existingTxCheck = await supabase
        .from('wallet_transactions')
        .select('id')
        .eq('reference', reference)
        .maybeSingle();

      if (existingTxCheck.error) {
        console.error('Failed to check existing deposit transaction:', existingTxCheck.error);
      }

      if (existingTxCheck.data) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(`dg-paystack-credit-${reference}`, 'true');
        }
        return { ok: true, amount: 0 };
      }

      const response = await fetch(`/api/paystack/verify-transaction?reference=${encodeURIComponent(reference)}`);
      let payload: {
        ok?: boolean;
        error?: string;
        status?: string;
        amount?: number;
        data?: {
          status?: string;
          amount?: number;
        };
      } | null = null;

      try {
        payload = await response.json();
      } catch {
        payload = { ok: false, error: 'The verification service returned an invalid response.' };
      }

      if (!response.ok || !payload?.ok) {
        return { ok: false, error: payload?.error || 'Unable to verify Paystack transaction.' };
      }

      const paystackData = payload.data ?? payload;
      const status = paystackData?.status;
      const amountInKobo = Number(paystackData?.amount ?? 0);
      const amount = Number.isFinite(amountInKobo) && amountInKobo > 0 ? amountInKobo / 100 : 0;

      if (status !== 'success') {
        return { ok: false, error: `Transaction status is ${status}.` };
      }

      if (amount <= 0) {
        return { ok: false, error: 'Invalid deposit amount returned from Paystack.' };
      }

      // Ensure user profile data is fetched first
      await fetchPersistedUserData(
        authUser.id,
        authUser.email || '',
        Boolean(authUser.email_confirmed_at),
        authUser.user_metadata?.full_name || authUser.user_metadata?.username || 'Customer',
        authUser.created_at || null,
      );

      // Now credit the wallet balance (which updates local storage and DB table wallets)
      await creditWalletBalance(authUser.id, amount);
 
      // Log deposit transaction history so it appears in the transaction page
      try {
        await writeTransactionHistory({
          userId: authUser.id,
          amount,
          type: 'deposit',
          status: 'success',
          reference,
          description: 'Paystack deposit',
          createdAt: new Date().toISOString(),
        });
      } catch (transactionError) {
        console.error('Failed to store deposit transaction history:', transactionError);
      }
 
      // Direct React state updates
      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        return { ...currentUser, walletBalance: currentUser.walletBalance + amount };
      });
 
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`dg-paystack-credit-${reference}`, 'true');
      }
 
      return { ok: true, amount };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to confirm deposit.';
      return { ok: false, error: message };
    }
  };
 
  const refundPaystackTransaction = async (reference: string) => {
    if (!user) {
      return { ok: false, error: 'Please login before requesting a refund.' };
    }

    try {
      const response = await fetch('/api/paystack/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();
      if (!data.ok) {
        return { ok: false, error: data.error || 'Unable to issue refund.' };
      }

      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to request refund.';
      return { ok: false, error: message };
    }
  };

  const connectWallet = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !user) return;
    
    await supabase.from('profiles').update({ is_connected: true }).eq('id', session.user.id);
    setUser({ ...user, isConnected: true });
  };

  const makeDeposit = async (amount: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !user) return;

    await creditWalletBalance(session.user.id, amount);
    setUser({ ...user, walletBalance: user.walletBalance + amount });
  };

  const placeOrder = async (
    productTitle: string,
    price: number,
    method: 'pickup' | 'delivery',
    customerName: string,
    phoneNumber: string,
    address?: string
  ) => {
    if (!user) {
      return { ok: false, error: 'You must be logged in to place an order.' };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { ok: false, error: 'Unable to verify your session. Please sign in again.' };
      }

      const userId = session.user.id;
      const localBalance = getStoredWalletBalance(userId);

      // 1. Fetch current database wallet balance to check if it's safe
      let wallet: { balance?: number } | null = null;
      const { data, error: walletFetchError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();
      wallet = data;

      if (walletFetchError) throw new Error(walletFetchError.message || JSON.stringify(walletFetchError));

      let dbBalance = Number(wallet?.balance ?? NaN);
      // prefer the larger of database or local cached balances to avoid blocking users from UI-updated values
      const localBalNumber = Number(localBalance ?? NaN);
      if (Number.isFinite(localBalNumber) && (!Number.isFinite(dbBalance) || localBalNumber > dbBalance)) {
        dbBalance = localBalNumber;
      }

      if (!Number.isFinite(dbBalance)) {
        // if both invalid, try to fall back to 0
        dbBalance = 0;
      }

      if (!wallet) {
        const initialBalance = Number.isFinite(dbBalance) ? dbBalance : 0;
        const { data: createdWallet, error: createWalletError } = await supabase
          .from('wallets')
          .insert([{ user_id: userId, balance: initialBalance }])
          .select('balance')
          .maybeSingle();

        if (createWalletError) throw new Error(createWalletError.message || JSON.stringify(createWalletError));
        wallet = createdWallet;
        dbBalance = Number(wallet?.balance ?? initialBalance);
      }

      if (!Number.isFinite(dbBalance)) {
        return { ok: false, error: 'Unable to determine your wallet balance. Please contact support.' };
      }

      // Effective balance for authorization checks uses the possibly preferred dbBalance
      const effectiveBalance = dbBalance;

      // Debug logging to help diagnose balance mismatches (temporary)
      try {
        console.error('placeOrder auth check', {
          sessionUserId: session.user?.id,
          uiUserId: user?.id,
          localCachedBalance: localBalance,
          dbBalance,
          effectiveBalance,
          price,
        });
      } catch (logErr) {
        console.error('Failed to log placeOrder auth context', logErr);
      }

      if (effectiveBalance < price) {
        // Extra log when blocking due to insufficient funds
        console.error('placeOrder blocked due to insufficient funds', { effectiveBalance, price, userId: session.user?.id });
        return { ok: false, error: `Insufficient Escrow Wallet balance. Available: ₦${effectiveBalance.toLocaleString()}` };
      }

      const nextBalance = effectiveBalance - price;

      // 2. Update wallet balance in Supabase database
      const { error: walletUpdateError } = await supabase
       .from('wallets')
       .update({ balance: nextBalance })
       .eq('user_id', userId);

      if (walletUpdateError) throw new Error(walletUpdateError.message || JSON.stringify(walletUpdateError));

      // 3. Generate order number
      const orderNumber = `DG-${Math.floor(100000 + Math.random() * 900000)}`;

      // 4. Insert order details into Supabase
      const { error: insertError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          customer_name: customerName,
          phone_model: productTitle,
          price: price,
          fulfillment_method: method,
          shipping_address: address || "In-Store Pickup (David Gadgets Shop)",
          recipient_phone: phoneNumber,
          user_id: session.user.id,
          status: 'pending'
        }]);
  
      if (insertError) {
        console.error('Order insert failed:', insertError);
        const msg = insertError.message || JSON.stringify(insertError);
        if (typeof msg === 'string' && msg.includes("Could not find the 'user_id' column")) {
          // Provide a clear, actionable error to the UI instead of throwing the raw DB schema message
          return {
            ok: false,
            error: "Server schema mismatch: the orders table is missing the 'user_id' column. Please run the database migration to add this column (or contact the site admin).",
          };
        }
        throw new Error(msg);
      }
  
      // 4a. Log the purchase into the main transaction history table
      try {
        await writeTransactionHistory({
          userId: session.user.id,
          amount: price,
          type: 'purchase',
          status: 'success',
          reference: orderNumber,
          description: `Purchase of ${productTitle}`,
          productDetails: {
            productTitle,
            orderNumber,
          },
          createdAt: new Date().toISOString(),
        });
      } catch (transactionError) {
        console.error('Failed to save purchase transaction record:', transactionError);
      }
 
      // 5. Update browser local storage with the new order number
      const storedOrdersKey = `dg-user-orders-${session.user.id}`;
      const existingStored = JSON.parse(window.localStorage.getItem(storedOrdersKey) || '[]');
      existingStored.push(orderNumber);
      window.localStorage.setItem(storedOrdersKey, JSON.stringify(existingStored));

      // 6. Update local cached wallet balance in local storage
      setStoredWalletBalance(session.user.id, nextBalance);

      // 7. Update React state for instant UI update
      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        return { ...currentUser, walletBalance: nextBalance };
      });

      const newOrder: Order = {
        id: orderNumber,
        productTitle,
        price,
        formattedPrice: `₦${price.toLocaleString()}`,
        deliveryMethod: method,
        deliveryAddress: address,
        address: address || "In-Store Pickup (David Gadgets Shop)",
        status: 'Funds Locked',
        eta: method === 'pickup' ? 'Ready Today' : 'Arriving in 2 - 5 Hours'
      };

      setOrders((currentOrders) => [newOrder, ...currentOrders]);
      return { ok: true };
    } catch (err) {
      console.error('Error in placeOrder transaction:', err);
      const message = err instanceof Error ? err.message : String(err);
      alert("Order placement failed: " + message);
      return { ok: false, error: message || 'Order placement failed. Please try again.' };
    }
  };

  const logout = () => {
    void supabase.auth.signOut();
    setUser(null);
    setOrders([]);
  };

  const cancelOrder = useCallback(async (orderId: string) => {
    const orderToCancel = orders.find(o => o.id === orderId);
    if (!orderToCancel) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // 1. Fetch current database wallet balance
      const { data: wallet, error: walletFetchError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (walletFetchError) throw walletFetchError;
      if (!wallet) throw new Error("Wallet not found in database.");

      const nextBalance = Number(wallet.balance) + orderToCancel.price;

      // 2. Refund wallet balance in Supabase
      const { error: walletUpdateError } = await supabase
        .from('wallets')
        .update({ balance: nextBalance })
        .eq('user_id', session.user.id);
 
      if (walletUpdateError) throw walletUpdateError;
 
      // 3. Log the refund transaction
      try {
        await writeTransactionHistory({
          userId: session.user.id,
          amount: orderToCancel.price,
          type: 'refund',
          status: 'success',
          reference: `REFUND-${orderId}`,
          description: `Refund for cancelled order ${orderId}`,
          productDetails: {
            orderNumber: orderId,
            productTitle: orderToCancel.productTitle,
          },
          createdAt: new Date().toISOString(),
        });
      } catch (transactionError) {
        console.error('Failed to save refund transaction record:', transactionError);
      }
 
      // 4. Delete order record from Supabase database
      let { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('order_number', orderId)
        .eq('user_id', session.user.id);
 
      if (deleteError && (deleteError.code === 'PGRST116' || /user_id/.test(deleteError.message || ''))) {
        const fallbackDelete = await supabase
          .from('orders')
          .delete()
          .eq('order_number', orderId);
        deleteError = fallbackDelete.error;
      }
 
      if (deleteError) throw deleteError;
 
      // 5. Update browser local storage cache
      const storedOrdersKey = `dg-user-orders-${session.user.id}`;
      const existingStored = JSON.parse(window.localStorage.getItem(storedOrdersKey) || '[]');
      const updatedStored = existingStored.filter((num: string) => num !== orderId);
      window.localStorage.setItem(storedOrdersKey, JSON.stringify(updatedStored));
 
      // 6. Update local cached wallet balance in local storage
      setStoredWalletBalance(session.user.id, nextBalance);
 
      // 7. Update React states
      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        return { ...currentUser, walletBalance: nextBalance };
      });
 
      setOrders((currentOrders) => currentOrders.filter(o => o.id !== orderId));
      alert("Order cancelled successfully. Refund credited to your wallet balance.");
    } catch (err) {
      console.error('Error in cancelOrder transaction:', err);
      alert("Order cancellation failed: " + (err instanceof Error ? err.message : String(err)));
    }
  }, [orders, supabase, setStoredWalletBalance]);

  const confirmDelivery = useCallback(async (orderId: string) => {
    const currentOrder = orders.find((order) => order.id === orderId);
    const successMessage = currentOrder?.status === 'Ready for Pickup' && currentOrder?.deliveryMethod === 'pickup'
      ? 'Pickup confirmed! Your store order is now complete.'
      : 'Delivery confirmed! Thank you for shopping with David Gadgets.';

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
  
      let { data: updatedOrders, error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('order_number', orderId)
        .eq('user_id', session.user.id)
        .select();
 
      if (error && (error.code === 'PGRST116' || /user_id/.test(error.message || ''))) {
        const fallbackResult = await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('order_number', orderId)
          .select();
        updatedOrders = fallbackResult.data;
        error = fallbackResult.error;
      }
 
      if (error) throw error;
      if (!updatedOrders || updatedOrders.length === 0) {
        throw new Error('Unable to find the order to confirm.');
      }
 
      setOrders((currentOrders) =>
        currentOrders.map((o) =>
          o.id === orderId ? { ...o, status: 'Completed' } : o
        )
      );

      // Ensure there is a purchase transaction logged for this order. Some earlier failures
      // could have prevented placeOrder from writing the wallet_transactions row. Create one
      // now if it does not exist so it appears in the user's transaction history.
      try {
        const orderRow = (updatedOrders && updatedOrders[0]) || null;
        const amount = orderRow ? Number(orderRow.price || 0) : 0;
        const productTitle = orderRow ? (orderRow.phone_model || orderRow.product_title || '') : '';

        const { data: existingTx, error: existingError } = await supabase
          .from('wallet_transactions')
          .select('id')
          .eq('reference', orderId)
          .eq('type', 'purchase')
          .maybeSingle();

        if (existingError) {
          console.error('Error checking existing transaction for confirmed order:', existingError);
        }

        if (!existingTx) {
          try {
            await writeTransactionHistory({
              userId: session.user.id,
              amount: amount,
              type: 'purchase',
              status: 'success',
              reference: orderId,
              description: `Purchase completed for ${productTitle}`,
              productDetails: {
                productTitle,
                orderNumber: orderId,
              },
              createdAt: new Date().toISOString(),
            });
          } catch (txErr) {
            console.error('Failed to insert purchase transaction after confirmation:', txErr);
          }
        }
      } catch (txCheckErr) {
        console.error('Error ensuring purchase transaction exists after confirmation:', txCheckErr);
      }

      // Notify other UI components (Transactions page) to refresh their data
      try {
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('dg:transactions-updated'));
        }
      } catch (evtErr) {
        console.error('Failed to dispatch transactions-updated event', evtErr);
      }

      alert(successMessage);
    } catch (err) {
      console.error('Failed to confirm delivery:', err);
      alert('Error confirming delivery: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [orders, supabase]);

  const clearCompletedOrders = useCallback(async () => {
    try {
      const completedOrderIds = orders.filter((order) => order.status === 'Completed').map((order) => order.id);
      if (completedOrderIds.length === 0) {
        return;
      }
 
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
 
      let { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .in('order_number', completedOrderIds)
        .eq('user_id', session.user.id);
 
      if (deleteError && (deleteError.code === 'PGRST116' || /user_id/.test(deleteError.message || ''))) {
        const fallbackDelete = await supabase
          .from('orders')
          .delete()
          .in('order_number', completedOrderIds);
        deleteError = fallbackDelete.error;
      }
 
      if (deleteError) throw deleteError;
 
      const storedOrdersKey = `dg-user-orders-${session.user.id}`;
      const existingStored = JSON.parse(window.localStorage.getItem(storedOrdersKey) || '[]');
      const updatedStored = existingStored.filter((orderNumber: string) => !completedOrderIds.includes(orderNumber));
      window.localStorage.setItem(storedOrdersKey, JSON.stringify(updatedStored));
 
      setOrders((currentOrders) => currentOrders.filter((order) => order.status !== 'Completed'));
      alert('Completed order history has been cleared.');
    } catch (err) {
      console.error('Failed to clear completed order history:', err);
      alert('Unable to clear completed order history: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [orders, supabase]);

  return (
    <AppContext.Provider value={{ user, orders, authLoading, createAccount, verifyAccountEmail, verifyBankDetails, updateProfileDetails, depositWithPaystack, withdrawFunds, confirmPaystackDeposit, refundPaystackTransaction, connectWallet, makeDeposit, placeOrder, cancelOrder, confirmDelivery, clearCompletedOrders, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}