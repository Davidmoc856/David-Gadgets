import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
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

    // Fetch wallet_transactions for this user (deposits, purchases, refunds)
    const { data: rows, error: fetchErr } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .in('type', ['deposit', 'purchase', 'refund'])
      .order('created_at', { ascending: true });

    if (fetchErr) {
      console.error('Backfill: failed to fetch wallet_transactions', fetchErr);
      return NextResponse.json({ ok: false, error: 'Failed to fetch existing transactions.' }, { status: 500 });
    }

    const inserted: Array<string | undefined> = [];
    const skipped: Array<{ ref?: string; error: string }> = [];
    let transactionsTableMissing = false;

    for (const r of rows || []) {
      const ref = r.reference;
      try {
        const { error: insertErr } = await supabaseAdmin.from('canonical_transactions').insert([{ 
          user_id: userId,
          amount: Number(r.amount) || 0,
          type: r.type || r.transaction_type || 'deposit',
          reference: ref || `legacy-${r.id}`,
          description: r.description || `Legacy ${r.type || r.transaction_type || 'deposit'} transaction`,
          status: (r.status === 'completed') ? 'success' : (r.status || 'pending'),
          created_at: r.created_at || new Date().toISOString(),
        }]);

        if (insertErr) {
          const insertMessage = insertErr.message || JSON.stringify(insertErr);
          const missingTable = insertErr.code === 'PGRST205' || /relation.*canonical_transactions.*does not exist|table .*canonical_transactions.* does not exist/i.test(insertMessage);
          if (missingTable) {
            transactionsTableMissing = true;
            console.error('Backfill: canonical_transactions table is missing in Supabase', insertErr);
            break;
          }

          console.error('Backfill: insert error for ref', ref, insertErr);
          skipped.push({ ref, error: insertMessage });
        } else {
          inserted.push(ref);
        }
      } catch (err) {
        console.error('Backfill: unexpected error for ref', ref, err);
        skipped.push({ ref, error: String(err) });
      }
    }

    if (transactionsTableMissing) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Canonical transactions table is missing in Supabase. Create the canonical_transactions table before running backfill.',
          inserted,
          skipped,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, inserted, skipped });
  } catch (err) {
    console.error('Backfill endpoint error', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
