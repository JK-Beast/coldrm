-- Add additional fields to contacts table for a real CRM experience
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lead', 'customer'));

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);