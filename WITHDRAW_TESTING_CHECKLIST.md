# WITHDRAW TESTING CHECKLIST

## Before Testing - Setup Required Tables

### ✅ Check 1: Do You Have These Tables in Supabase?

Go to **Supabase Dashboard** → **Tables** and verify:

- [ ] **auth.users** (exists by default)
- [ ] **public.wallets** (should exist - check!)
- [ ] **public.profiles** (should exist - check!)

**If ANY are missing**, the withdrawal will fail with "Critical server routine failure"

---

### ✅ Check 2: Run the Transaction Migration (Optional but Recommended)

Go to **Supabase Dashboard** → **SQL Editor**:

1. Create new query
2. Copy all content from: `supabase/migrations/create_transactions_table.sql`
3. Click **Run**

This creates the `transactions` table for history tracking.

---

## Testing the Withdraw Flow

### ✅ Step 1: Start the Dev Server

```bash
cd frontend
npm run dev
```

Watch the terminal - you'll see detailed error logs here if something fails.

---

### ✅ Step 2: Login to Your Account

1. Click **"Connect Wallet"** button (blue button, top right)
2. Login with your credentials
3. You should see your name/wallet display

---

### ✅ Step 3: Check Your Wallet Balance

In the account modal, you should see:
- ✅ Your current balance in the Finances section
- ✅ "Fund Account Escrow" section
- ✅ "Withdraw from Escrow Wallet" section

---

### ✅ Step 4: Make a Test Withdrawal

1. In the account modal, go to "Withdraw from Escrow Wallet" section
2. **Select Bank:** Choose any bank
3. **Account Number:** Enter any test account number (10 digits)
4. **Account Name:** Enter a name (or auto-filled)
5. Click **"Verify Account with Paystack"**
   - Should see success message
6. **Amount:** Enter an amount (minimum ₦1,000)
7. Click **"Confirm & Payout Funds"**

---

### ✅ Step 5: Check What Happens

#### Expected (Working):
- Receipt modal appears showing:
  - ✅ Amount withdrawn
  - ✅ Reference number
  - ✅ Account details
  - ✅ Timestamp
- Backend logs show success

#### If You See "Critical server routine failure":
- Receipt does NOT appear
- **Check terminal for detailed error logs**
- Copy the error between `========== WITHDRAW ROUTE ERROR ==========` lines
- Send me the error

---

### ✅ Step 6: View Transaction History

1. Close the account modal
2. Look in navbar - you should see **"History"** button (next to Connect Wallet)
3. Click **"History"**
4. You should see your withdrawal listed with:
   - Type: Withdrawal
   - Amount: ₦5,000 (or whatever you withdrew)
   - Bank details
   - Timestamp
   - Status: Completed

---

## What to Do If You Get an Error

### The Error Will Look Like:
```
Critical server routine failure.
```

### To Debug:

**1. Check Terminal Output**

Look at the terminal running `npm run dev`:

```
========== WITHDRAW ROUTE ERROR ==========
Error Type: PostgresError
Error Message: relation "public.wallets" does not exist
Full Error: {
  "code": "42P01",
  "message": "relation "public.wallets" does not exist"
}
========== END ERROR LOG ==========
```

**2. Match the Error to the Problem:**

| Error Message | Means | Solution |
|---------------|-------|----------|
| `wallets" does not exist` | wallets table missing | Create wallets table in Supabase |
| `profiles" does not exist` | profiles table missing | Create profiles table in Supabase |
| `transactions" does not exist` | transactions table missing | Run SQL migration (optional) |
| `column "xxx" does not exist` | Missing column | Add column to table in Supabase |
| `new row violates row-level security` | RLS policy blocked insert | Check RLS policies in Supabase |
| `permission denied` | No write permission | Check database role permissions |

**3. Send Me:**

Copy and paste:
- The exact error message
- Which table it's complaining about
- Your Supabase URL (the public part, not the secret)

---

## Common Issues & Fixes

### Issue 1: "Insufficient account balance reserves"
**Means:** Your wallet balance is less than withdrawal amount
**Fix:** Deposit more money first

### Issue 2: "Paystack could not resolve the account details"
**Means:** Account number or bank code is invalid
**Fix:** Verify account details and try again

### Issue 3: "Unauthorized system access"
**Means:** You're not logged in or session expired
**Fix:** Login again, refresh page

### Issue 4: "Critical server routine failure" with no other info
**Means:** An unhandled error occurred (probably table-related)
**Fix:** Check terminal logs as described above

### Issue 5: Receipt shows but transaction not in history
**Means:** transactions table doesn't exist (optional)
**Fix:** Run the SQL migration to create it

---

## Supabase Connection Test

To verify your Supabase is properly connected:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query:

```sql
SELECT 
  table_name 
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public' 
ORDER BY 
  table_name;
```

You should see:
- [ ] wallets
- [ ] profiles
- [ ] transactions (optional, after migration)

---

## Terminal Logs Explained

### When withdrawal succeeds:
Terminal shows logs like:
```
GET /api/paystack/banks 200 in 234ms
POST /api/withdraw 200 in 1200ms
```

No error lines = success!

### When withdrawal fails:
Terminal shows:
```
POST /api/withdraw 500 in 450ms
========== WITHDRAW ROUTE ERROR ==========
Error Type: SyntaxError
Error Message: accountDetails is undefined
...
========== END ERROR LOG ==========
```

The error message is your clue to what went wrong.

---

## Data Flow Diagram

```
User Form Data:
  - amount: "₦5,000"
  - bankCode: "011"
  - accountNumber: "1234567890"
  - name: "John Doe"
        ↓
        ▼
/api/withdraw POST Request
        ↓
        ▼
Step 1: Verify authentication (Line 49)
        ├─ Reads cookies
        └─ Calls supabase.auth.getSession()
        ↓
Step 2: Get wallet balance (Line 100)
        └─ Calls supabase.from('wallets').select()
        ↓
Step 3: Debit wallet (Line 115)
        └─ Calls supabase.from('wallets').update()
        ↓
Step 4: Verify bank account (Line 73)
        └─ Calls Paystack API (not Supabase)
        ↓
Step 5: Get/Create Paystack recipient (Line 124-165)
        ├─ Calls supabase.from('profiles').select()
        └─ Calls supabase.from('profiles').update()
        ↓
Step 6: Send money via Paystack (Line 169)
        └─ Calls Paystack transfer API
        ↓
Step 7: Save transaction (Line 192-211) [NEW, NON-BLOCKING]
        └─ Calls supabase.from('transactions').insert()
        ↓
Step 8: Return receipt to frontend
        └─ JSON response with receipt data
        ↓
        ▼
Frontend: Display Receipt Modal
```

---

## Questions to Ask Yourself

1. **Did the receipt modal appear?**
   - YES → Withdrawal succeeded! Money was sent.
   - NO → Error occurred. Check terminal logs.

2. **Is your wallet balance updated?**
   - YES → Transaction was successful.
   - NO → Transaction failed before debit.

3. **Can you see your withdrawal in transaction history?**
   - YES → Transaction table is working.
   - NO → Optional feature, run SQL migration if you want it.

4. **Did you get an error message?**
   - YES → Search this checklist for that error.
   - NO → Something else might be wrong, check terminal.

---

## Ready to Test?

✅ Terminal open with `npm run dev`?  
✅ Logged in to your account?  
✅ Have a wallet balance?  
✅ Supabase tables verified?  

**Go ahead and try a withdrawal!**

If you get an error, share the terminal error logs (everything between the `=====` lines) and I'll pinpoint the exact issue.
