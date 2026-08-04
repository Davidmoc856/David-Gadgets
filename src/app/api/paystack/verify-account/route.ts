import { NextResponse } from 'next/server';
import bankDirectoryData from '../../escrow/banks/bank.json';

interface PaystackBank {
  code: string;
  name: string;
}

const bankDirectory = ((bankDirectoryData as { data?: PaystackBank[] }).data || []) as PaystackBank[];

function resolveBankName(bankCode: string) {
  const matchedBank = bankDirectory.find((bank) => bank.code === bankCode);
  return matchedBank?.name || 'Verified Bank Account';
}

export async function POST(request: Request) {
  try {
    const { bankCode, accountNumber, accountDisplayName } = await request.json();

    if (!bankCode || !accountNumber) {
      return NextResponse.json({ ok: false, error: 'Bank selection and account number are required.' }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ ok: false, error: 'Paystack is not configured on the server.' }, { status: 500 });
    }

    const resolveResponse = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${bankCode}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const resolveData = await resolveResponse.json();
    const paystackMessage = typeof resolveData?.message === 'string' ? resolveData.message.toLowerCase() : '';
    const isTestModeResolveLimit = Boolean(
      secretKey.startsWith('sk_test_') &&
      (paystackMessage.includes('daily limit') || paystackMessage.includes('test bank codes') || paystackMessage.includes('test mode'))
    );

    if (isTestModeResolveLimit) {
      console.warn('Paystack resolve fallback triggered for test-mode verification.', { bankCode, accountNumber });
      return NextResponse.json({
        ok: true,
        accountName: accountDisplayName || 'Verified Account',
        accountNumber,
        bankName: resolveBankName(bankCode),
      });
    }

    if (!resolveData.status || !resolveData.data) {
      return NextResponse.json({
        ok: false,
        error: resolveData.message || 'The account number could not be resolved. Please verify details.'
      }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      accountName: resolveData.data.account_name,
      accountNumber: resolveData.data.account_number,
      bankName: resolveBankName(bankCode),
    });
  } catch (error) {
    console.error('Paystack verify-account error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server verification error.' }, { status: 500 });
  }
}
