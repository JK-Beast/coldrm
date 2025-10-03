-- Create table for encrypted SMTP credentials
CREATE TABLE IF NOT EXISTS public.smtp_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.smtp_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own SMTP credentials" 
ON public.smtp_credentials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SMTP credentials" 
ON public.smtp_credentials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SMTP credentials" 
ON public.smtp_credentials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SMTP credentials" 
ON public.smtp_credentials 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_smtp_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_smtp_credentials_updated_at
BEFORE UPDATE ON public.smtp_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_smtp_credentials_updated_at();