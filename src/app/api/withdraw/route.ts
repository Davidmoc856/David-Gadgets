import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch (parsingError) {
    throw new Error('Received an invalid response from Paystack.');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ ok: false, error: 'Invalid withdrawal request payload.' }, { status: 400 });
    }

    const { amount, accountDetails } = body as {
      amount?: unknown;
      accountDetails?: {
        bankCode?: string;
        accountNumber?: string;
        name?: string;
      };
    };
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount < 1000) {
      return NextResponse.json({ ok: false, error: 'Minimum withdrawal threshold is ₦1,000.' }, { status: 400 });
    }

    if (!accountDetails || typeof accountDetails !== 'object' || !('bankCode' in accountDetails) || !('accountNumber' in accountDetails)) {
      return NextResponse.json({ ok: false, error: 'Missing destination bank routing details.' }, { status: 400 });
    }

    const accountName = accountDetails.name || 'David Gadgets Vendor';
    const accountNumber = accountDetails.accountNumber || '';
    const bankCode = accountDetails.bankCode || '';

    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/Bearer\s+/i, '').trim();
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Authorization token is required for withdrawals.' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unable to authenticate withdrawal request.' }, { status: 401 });
    }

    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if (walletError) {
      throw new Error(walletError.message || JSON.stringify(walletError));
    }

    let currentBalance = Number(wallet?.balance ?? NaN);

    if (!wallet) {
      const { data: newWallet, error: createWalletError } = await supabaseAdmin
        .from('wallets')
        .insert([{ user_id: user.id, balance: 0 }])
        .select('balance')
        .maybeSingle();

      if (createWalletError) {
        throw new Error(createWalletError.message || JSON.stringify(createWalletError));
      }

      currentBalance = Number(newWallet?.balance ?? 0);
    }

    if (!Number.isFinite(currentBalance)) {
      return NextResponse.json(
        { ok: false, error: 'Unable to read your wallet balance. Please contact support or try again later.' },
        { status: 500 }
      );
    }

    if (currentBalance < parsedAmount) {
      return NextResponse.json(
        { ok: false, error: 'Insufficient wallet balance for this withdrawal.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ ok: false, error: 'Paystack is not configured on the server.' }, { status: 500 });
    }

    const recipientRegister = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'nuban',
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      }),
    });

    const recipientRes = await recipientRegister.json();
    if (!recipientRes?.status || !recipientRes?.data?.recipient_code) {
      return NextResponse.json({
        ok: false,
        error: `Paystack Recipient Error: ${recipientRes?.message || 'Could not verify recipient details.'}`,
      }, { status: 422 });
    }

    const recipientCode = recipientRes.data.recipient_code;
    const amountInKobo = Math.round(parsedAmount * 100);

    const payoutTransfer = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: amountInKobo,
        recipient: recipientCode,
        reason: 'David Gadgets Escrow Wallet Payout',
      }),
    });

    const payoutRes = await payoutTransfer.json();
    if (!payoutRes?.status || !payoutRes?.data) {
      return NextResponse.json({
        ok: false,
        error: `Paystack Payout Refused: ${payoutRes?.message || 'Check your Paystack balance or recipient settings.'}`,
      }, { status: 502 });
    }

    const transactionReference = payoutRes.data.reference || `DG-TRF-${Date.now()}`;
    const nextBalance = Math.max(currentBalance - parsedAmount, 0);

    await supabaseAdmin
      .from('wallets')
      .update({ balance: nextBalance })
      .eq('user_id', user.id);

    try {
      await supabaseAdmin.from('wallet_transactions').insert([{
        user_id: user.id,
        amount: parsedAmount,
        type: 'withdrawal',
        status: 'completed',
        reference: transactionReference,
        description: `Withdrawal to account ending in ${accountNumber.slice(-4)}`,
        bank_details: {
          accountName,
          accountNumber,
          bankCode,
        },
        created_at: new Date().toISOString(),
      }]);
    } catch (txError) {
      console.error('Failed to save transaction record:', txError);
    }

    return NextResponse.json({
      ok: true,
      message: 'Withdrawal completed processing successfully.',
      receipt: {
        reference: transactionReference,
        amount: parsedAmount,
        accountName: accountDetails.name,
        accountNumber: accountDetails.accountNumber,
        bankCode: accountDetails.bankCode,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Critical server routine failure.';
    console.error('Critical Withdrawal API Error:', err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
