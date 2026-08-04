import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const bankData = await import('../../escrow/banks/bank.json');

    return NextResponse.json({
      ok: true,
      banks: bankData.default?.data || [],
    });
  } catch (error) {
    console.error('Failed to load Paystack bank list:', error);
    return NextResponse.json({ ok: false, error: 'Unable to load bank list.' }, { status: 500 });
  }
}
