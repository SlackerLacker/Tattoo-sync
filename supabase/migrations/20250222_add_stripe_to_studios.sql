-- Add Stripe Connect account ID to studios table
ALTER TABLE public.studios
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_studios_stripe_account_id ON public.studios(stripe_account_id);
