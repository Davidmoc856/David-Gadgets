import { NextResponse } from 'next/server';

interface PaystackBank {
  name: string;
  code: string;
}

export async function GET() {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ ok: false, error: 'Paystack is not configured on the server.' }, { status: 500 });
    }

    const response = await fetch('https://api.paystack.co/bank', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 86400 },
    });

    const data = await response.json();

    if (!data.status || !Array.isArray(data.data)) {
      return NextResponse.json({ ok: false, error: 'Failed to retrieve bank directories.' }, { status: 400 });
    }

    const formattedBanks = (data.data as PaystackBank[]).map((bank) => ({
      name: bank.name,
      code: bank.code,
    }));

    return new NextResponse(
      JSON.stringify({ ok: true, banks: formattedBanks }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Nigerian banks:', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
