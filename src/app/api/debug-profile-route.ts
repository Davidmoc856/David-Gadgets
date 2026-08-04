import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/Bearer\s+/i, '').trim();

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Authorization token is required.' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unable to authenticate request.' }, { status: 401 });
    }

    const userId = user.id;

    const [{ data: profile, error: profileError }, { data: wallet, error: walletError }, { data: transactions, error: txError }] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabaseAdmin.from('wallets').select('*').eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('canonical_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    ]);

    let transactionsData = transactions;
    if (txError) {
      const missingTransactionsTable = txError.code === 'PGRST205' || /relation.*canonical_transactions.*does not exist|table .*canonical_transactions.* does not exist/i.test(txError.message || '');
      if (missingTransactionsTable) {
        const { data: legacyTransactions, error: legacyError } = await supabaseAdmin
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!legacyError) {
          transactionsData = legacyTransactions;
        } else {
          console.error('Debug profile endpoint fallback wallet_transactions error', legacyError);
        }
      }
    }

    if ((!transactionsData || transactionsData.length === 0) && !txError) {
      const { data: legacyTransactions, error: legacyError } = await supabaseAdmin
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!legacyError && legacyTransactions && legacyTransactions.length > 0) {
        transactionsData = legacyTransactions;
      }
    }

    if (profileError || walletError || txError) {
      console.error('Debug profile endpoint DB errors', { profileError, walletError, txError });
    }

    return NextResponse.json({ ok: true, profile: profile ?? null, wallet: wallet ?? null, transactions: transactionsData ?? [] });
  } catch (err) {
    console.error('Debug profile endpoint error', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
