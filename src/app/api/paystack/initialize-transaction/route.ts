import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, amount, reference, callbackUrl } = await request.json();

    if (!email || !amount || !reference) {
      return NextResponse.json({ ok: false, error: 'Email, amount, and reference are required.' }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ ok: false, error: 'Paystack is not configured on the server.' }, { status: 500 });
    }

    const amountInKobo = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountInKobo) || amountInKobo <= 0) {
      return NextResponse.json({ ok: false, error: 'Invalid amount provided.' }, { status: 400 });
    }

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference,
        callback_url: callbackUrl,
      }),
    });

    const data = await paystackResponse.json();

    if (!data.status || !data.data) {
      return NextResponse.json({
        ok: false,
        error: data.message || 'Failed to initialize Paystack transaction.',
      }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error('Paystack initialize-transaction error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error initializing deposit.' }, { status: 500 });
  }
}
