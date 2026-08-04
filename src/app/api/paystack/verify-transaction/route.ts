import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { ok: false, error: 'Reference query parameter is required.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { ok: false, error: 'Paystack is not configured on the server.' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!data.status || !data.data) {
      return NextResponse.json(
        {
          ok: false,
          error: data.message || 'Unable to verify Paystack transaction.',
        },
        { status: 400 }
      );
    }

    if (data.data.status !== 'success') {
      return NextResponse.json(
        {
          ok: false,
          error: `Transaction verification failed. Status: ${data.data.status}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        status: data.data.status,
        amount: data.data.amount,
        reference: data.data.reference,
        customer: data.data.customer,
        metadata: data.data.metadata,
      },
    });
  } catch (error) {
    console.error('Paystack verify-transaction error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error.' }, { status: 500 });
  }
}
