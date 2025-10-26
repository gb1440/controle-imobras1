-- Create enum for roles if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_document TEXT NOT NULL,
  tenant_name TEXT NOT NULL,
  tenant_document TEXT NOT NULL,
  property_address TEXT NOT NULL,
  property_iptu TEXT NOT NULL,
  property_due_day INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rent_value DECIMAL(10,2) NOT NULL,
  iptu_value DECIMAL(10,2) NOT NULL,
  admin_fee_percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create revenues table
CREATE TABLE IF NOT EXISTS public.revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('admin', 'location', 'insurance')),
  value DECIMAL(10,2) NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending')),
  bank TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create has_role function if not exists
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" 
ON public.profiles FOR DELETE 
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" 
ON public.user_roles FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" 
ON public.user_roles FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
CREATE POLICY "Admins can update user roles" 
ON public.user_roles FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles" 
ON public.user_roles FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for contracts
CREATE POLICY "Users can view their own contracts" 
ON public.contracts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contracts" 
ON public.contracts FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own contracts" 
ON public.contracts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts" 
ON public.contracts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts" 
ON public.contracts FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for revenues
CREATE POLICY "Users can view their own revenues" 
ON public.revenues FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all revenues" 
ON public.revenues FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own revenues" 
ON public.revenues FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenues" 
ON public.revenues FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenues" 
ON public.revenues FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for expenses
CREATE POLICY "Users can view their own expenses" 
ON public.expenses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all expenses" 
ON public.expenses FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own expenses" 
ON public.expenses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
ON public.expenses FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_revenues_updated_at ON public.revenues;
CREATE TRIGGER update_revenues_updated_at
BEFORE UPDATE ON public.revenues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for new user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_revenues_user_id ON public.revenues(user_id);
CREATE INDEX IF NOT EXISTS idx_revenues_contract_id ON public.revenues(contract_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);