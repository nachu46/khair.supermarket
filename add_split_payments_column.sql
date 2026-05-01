-- Run this in your Supabase SQL Editor to add the split_payments column

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS split_payments JSONB;
