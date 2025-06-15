
-- Create the user_downloads table to track which books users have purchased/downloaded
CREATE TABLE public.user_downloads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ebook_id uuid NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
  downloaded_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, ebook_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;

-- Create policies for user_downloads
CREATE POLICY "Users can view their own downloads" 
  ON public.user_downloads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads" 
  ON public.user_downloads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add missing payment columns to orders table
ALTER TABLE public.orders 
ADD COLUMN payment_amount numeric,
ADD COLUMN payment_currency text DEFAULT 'USD',
ADD COLUMN payment_confirmed boolean DEFAULT false;

-- Enable realtime for user_downloads table
ALTER TABLE public.user_downloads REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_downloads;
