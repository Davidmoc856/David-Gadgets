import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, amount, orderId } = await request.json();

    if (!email || !amount || !orderId) {
      return NextResponse.json({ error: 'Missing required checkout fields' }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack is not configured on the server.' }, { status: 500 });
    }

    const amountInKobo = Math.round(Number(amount) * 100);
    if (Number.isNaN(amountInKobo) || amountInKobo <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/paystack/callback`;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference: orderId,
        callback_url: callbackUrl,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    // Return the secure checkout URL to the frontend
    return NextResponse.json({ 
      success: true, 
      authorizationUrl: data.data.authorization_url 
    });
  } catch (error) {
    console.error('Checkout initialization error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
