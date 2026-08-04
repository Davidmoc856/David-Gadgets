-- Create transactions table to track all user transactions (withdrawals, deposits, purchases)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('withdrawal', 'deposit', 'purchase')),
  amount DECIMAL(19, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed')) DEFAULT 'completed',
  description TEXT NOT NULL,
  reference TEXT,
  bank_details JSONB,
  product_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- Enable RLS (Row Level Security)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only view their own transactions
CREATE POLICY IF NOT EXISTS "Users can view their own transactions" ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policy: Service role can insert transactions
CREATE POLICY IF NOT EXISTS "Service role can insert transactions" ON public.transactions
  FOR INSERT
  WITH CHECK (true);

-- Create RLS policy: Users can only update their own transactions
CREATE POLICY IF NOT EXISTS "Users can update their own transactions" ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id);
