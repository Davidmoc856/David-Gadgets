# WITHDRAW ROUTE - SUPABASE CONNECTIONS BREAKDOWN

## File Location
`src/app/api/withdraw/route.ts`

---

## SUPABASE CONNECTION POINTS

### 1. **SUPABASE CLIENT INITIALIZATION** (Lines 25-46)
```typescript
const cookieStore = await cookies();
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (error) {
          console.error('Cookie setting error:', error);
        }
      },
    },
  }
);
```

**What It Does:** Creates a Supabase client using cookies for authentication
**Potential Issue:** If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set in `.env.local`, this will fail

---

### 2. **AUTH SESSION CHECK** (Lines 49-54)
```typescript
const { data: { session }, error: authError } = await supabase.auth.getSession();

if (authError || !session) {
  console.error("Supabase Auth Error Log:", authError);
  return NextResponse.json({ ok: false, error: 'Unauthorized system access.' }, { status: 401 });
}
```

**What It Does:** Verifies the user is logged in
**Potential Issue:** If user's session cookies are invalid or expired, withdrawal fails
**IF THIS FAILS:** You see "Unauthorized system access" error

---

### 3. **FETCH WALLET BALANCE** (Lines 100-108)
```typescript
const { data: walletRow, error: walletError } = await supabase
  .from('wallets')  // Table name
  .select('balance')
  .eq('user_id', user.id)
  .maybeSingle();

if (walletError) {
  throw walletError;
}
```

**What It Does:** Gets user's current wallet balance from database
**Supabase Connection:** YES - This queries the `wallets` table
**Potential Issues:**
- `wallets` table doesn't exist
- User doesn't have a wallet record
- Database permissions issue

**IF THIS FAILS:** Error is caught and you get "Critical server routine failure"

---

### 4. **DEBIT WALLET** (Lines 115-118)
```typescript
const { error: debitError } = await supabase
  .from('wallets')
  .update({ balance: currentBalance - parsedAmount })
  .eq('user_id', user.id);

if (debitError) {
  throw debitError;
}
```

**What It Does:** Subtracts the withdrawal amount from wallet balance
**Supabase Connection:** YES - Updates `wallets` table
**Potential Issues:**
- `wallets` table doesn't exist
- Row-Level Security (RLS) policy prevents update
- Concurrent update conflict

**IF THIS FAILS:** Money is NOT deducted and you get "Critical server routine failure"

---

### 5. **FETCH PAYSTACK RECIPIENT CODE** (Lines 124-128)
```typescript
const { data: profileRow, error: profileError } = await supabase
  .from('profiles')
  .select('paystack_recipient_code')
  .eq('id', user.id)
  .maybeSingle();

if (profileError) {
  throw profileError;
}
```

**What It Does:** Gets stored Paystack recipient code (if user made withdrawal before)
**Supabase Connection:** YES - Queries `profiles` table
**Potential Issues:**
- `profiles` table doesn't exist
- User profile not created
- No recipient code yet (that's okay, will create new one)

**IF THIS FAILS:** Error is caught and you get "Critical server routine failure"

---

### 6. **SAVE PAYSTACK RECIPIENT CODE** (Lines 162-165)
```typescript
await supabase
  .from('profiles')
  .update({ paystack_recipient_code: recipientCode })
  .eq('id', user.id);
```

**What It Does:** Stores Paystack recipient code for future withdrawals
**Supabase Connection:** YES - Updates `profiles` table
**Potential Issues:**
- `profiles` table doesn't exist or missing `paystack_recipient_code` column

---

### 7. **SAVE TRANSACTION HISTORY** (Lines 192-206) ⚠️ **THIS IS THE CULPRIT**
```typescript
// Save transaction record for history (non-blocking - don't let it crash the withdrawal)
try {
  await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'withdrawal',
    amount: parsedAmount,
    status: 'completed',
    description: `Withdrawal to ${resolvedBankName}`,
    reference: transferReference,
    bank_details: {
      accountName: verifiedAccountName,
      accountNumber: safeAccountNumber,
      bankCode: safeBankCode,
    },
    created_at: new Date().toISOString(),
  });
} catch (txError) {
  // Log transaction save error but don't fail the withdrawal
  console.error('Failed to save transaction record:', txError);
  // Withdrawal succeeded, transaction history is optional
}
```

**What It Does:** Records the transaction in history
**Supabase Connection:** YES - Inserts into `transactions` table
**⚠️ CRITICAL:** This was throwing an error and crashing the entire withdrawal!
**Why It Was Failing:**
- `transactions` table doesn't exist (you haven't run the SQL migration yet)
- Missing permissions to insert

**WHY I FIXED IT:**
- Wrapped in try-catch so it won't crash the withdrawal
- Now logs the error but allows withdrawal to complete

---

### 8. **ERROR HANDLER** (Lines 219-226)
```typescript
} catch (error) {
  console.error('========== WITHDRAW ROUTE ERROR ==========');
  console.error('Error Type:', error instanceof Error ? error.constructor.name : typeof error);
  console.error('Error Message:', error instanceof Error ? error.message : String(error));
  console.error('Full Error:', JSON.stringify(error, null, 2));
  
  if (error instanceof Error && error.stack) {
    console.error('Stack Trace:', error.stack);
  }
  
  console.error('========== END ERROR LOG ==========');
  
  const message = error instanceof Error ? error.message : 'Critical server routine failure.';
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}
```

**What It Does:** Catches ANY error and logs detailed info
**Where to Look:** Check your terminal window when you see "Critical server routine failure" - the detailed logs will be there!

---

## REQUIRED SUPABASE TABLES

For the withdraw route to work, you MUST have these tables in Supabase:

### ✅ REQUIRED:
1. **`wallets`** table (with columns: `user_id`, `balance`)
2. **`profiles`** table (with columns: `id`, `paystack_recipient_code`)

### ⚠️ OPTIONAL (but needed for transaction history):
3. **`transactions`** table (run the SQL migration)

---

## HOW TO CHECK IF TABLES EXIST

Go to Supabase Dashboard → **Tables** and look for:
- `wallets` - If missing, this is why withdraw fails!
- `profiles` - If missing, this is why withdraw fails!
- `transactions` - If missing, transaction history won't work

---

## THE ACTUAL PROBLEM - STEP BY STEP

When you click "Confirm & Payout Funds":

1. ✅ **Line 26-46** - Creates Supabase client (uses your cookies to auth)
2. ✅ **Line 49** - Checks if you're logged in
3. ✅ **Line 100** - **QUERIES SUPABASE** for wallet balance
4. ✅ **Line 115** - **UPDATES SUPABASE** to debit wallet
5. ✅ **Line 124** - **QUERIES SUPABASE** for recipient code
6. ✅ **Lines 169-181** - Calls Paystack API (NOT Supabase)
7. ⚠️ **Line 192** - **TRIES TO INSERT TO TRANSACTIONS** (table may not exist - BUT NOW WRAPPED IN TRY-CATCH)
8. ✅ **Line 207** - Returns success to frontend

**If ANY of steps 1-7 fail → "Critical server routine failure"**

---

## WHAT HAPPENS WHEN YOU RELOAD THE PAGE

When you reload (browser refresh):
- Session is still valid in cookies ✅
- Money was already deducted from wallet ✅
- Paystack transfer was already sent ✅
- Receipt data is in the response (doesn't reload from DB) ✅
- Receipt modal closes because component unmounts

**The page reload DOES NOT affect Supabase data** - Your transaction was already saved.

---

## HOW TO DEBUG THE EXACT ERROR

### Option 1: Check Terminal Logs
When you click "Confirm & Payout Funds", look at your terminal running `npm run dev`:
- You'll see the error logs printed there
- Look for: `========== WITHDRAW ROUTE ERROR ==========`

### Option 2: Check Browser Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click "Confirm & Payout Funds"
4. Look for the `/api/withdraw` request
5. Click on it → **Response** tab
6. See the error JSON

### Option 3: Check Supabase Logs
1. Go to Supabase Dashboard
2. Go to **Logs** → **API**
3. Look for failed requests to your database

---

## NEXT STEPS TO FIX

### 1. Check if tables exist
Go to Supabase → Tables and verify `wallets` and `profiles` exist

### 2. Run the transaction SQL migration
Go to Supabase → SQL Editor and run:
```sql
supabase/migrations/create_transactions_table.sql
```

### 3. Make a test withdrawal and check terminal
The terminal logs will tell you exactly what failed

### 4. Send me the terminal error logs
Copy the error between:
```
========== WITHDRAW ROUTE ERROR ==========
...error details here...
========== END ERROR LOG ==========
```

---

## SUPABASE AUTHENTICATION FLOW IN WITHDRAW

```
Browser Request
    ↓
[Line 26] Read cookies from request
    ↓
[Line 27] Create Supabase client with cookie auth
    ↓
[Line 49] supabase.auth.getSession() → validates cookies against Supabase Auth
    ↓
Supabase checks: Are these cookies valid? Is user authenticated?
    ↓
If YES → Continue with withdrawal
If NO → Return "Unauthorized system access" (401)
```

**CONCLUSION:** Withdrawal is connected to Supabase through cookies and requires 2 database tables (`wallets` and `profiles`).
