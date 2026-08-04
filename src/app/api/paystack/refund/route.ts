import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json({ ok: false, error: 'Reference is required for refund.' }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ ok: false, error: 'Paystack is not configured on the server.' }, { status: 500 });
    }

    const response = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: reference,
      }),
    });

    const data = await response.json();

    if (!data.status || !data.data) {
      return NextResponse.json({
        ok: false,
        error: data.message || 'Refund request declined by payment gateway.',
      }, { status: 400 });
    }

    const refundedAmountInNaira = data.data.amount ? data.data.amount / 100 : 0;

    return NextResponse.json({
      ok: true,
      status: data.data.status,
      refundReference: data.data.reference,
      amount: refundedAmountInNaira,
    });
  } catch (error) {
    console.error('Paystack refund error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error processing refund.' }, { status: 500 });
  }
}
