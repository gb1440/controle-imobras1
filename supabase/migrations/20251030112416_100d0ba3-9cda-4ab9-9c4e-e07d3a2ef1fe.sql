-- Add property_type column to contracts table
ALTER TABLE public.contracts 
ADD COLUMN property_type text NOT NULL DEFAULT 'Apartamento';

-- Add a check constraint to ensure only valid property types are used
ALTER TABLE public.contracts 
ADD CONSTRAINT valid_property_type CHECK (property_type IN ('Loja', 'Casa', 'Apartamento', 'Galpão'));