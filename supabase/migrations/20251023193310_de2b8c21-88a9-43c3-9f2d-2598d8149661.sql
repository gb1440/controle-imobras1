-- Add INSERT policy for profiles table
-- Only authenticated users can create their own profile
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add DELETE policy for profiles table
-- Users can delete their own profile OR admins can delete any profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  auth.uid() = id 
  OR 
  public.has_role(auth.uid(), 'admin')
);

-- Add UPDATE policy for user_roles table
-- Only admins can update user roles
CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));