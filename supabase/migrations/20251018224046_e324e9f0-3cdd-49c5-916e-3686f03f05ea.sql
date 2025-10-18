-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- Create user_permissions table
CREATE TABLE public.user_permissions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource VARCHAR(64) NOT NULL,
    action VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, resource, action)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create ingredients table
CREATE TABLE public.ingredients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- Create recipe_types table
CREATE TABLE public.recipe_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recipe_types ENABLE ROW LEVEL SECURITY;

-- Create recipes table (row-per-ingredient model)
CREATE TABLE public.recipes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    recipe_type_id BIGINT REFERENCES public.recipe_types(id) ON DELETE SET NULL,
    ingredient_id BIGINT NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
    quantity_base NUMERIC(14,3) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX recipes_name_idx ON public.recipes(name);
CREATE INDEX recipes_ingredient_idx ON public.recipes(ingredient_id);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Create order_items table
CREATE TABLE public.order_items (
    id BIGSERIAL PRIMARY KEY,
    day_name VARCHAR(16) NOT NULL CHECK (day_name IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
    order_date DATE NOT NULL,
    recipe_name VARCHAR(160) NOT NULL,
    quantity NUMERIC(14,3) NOT NULL DEFAULT 1,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX order_items_date_idx ON public.order_items(order_date);
CREATE INDEX order_items_recipe_idx ON public.order_items(recipe_name);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create daily ingredient summary view
CREATE OR REPLACE VIEW public.v_daily_ingredient_summary AS
SELECT 
    oi.order_date,
    LOWER(oi.day_name) AS day_name,
    i.name AS ingredient,
    r.unit AS unit,
    SUM(r.quantity_base * oi.quantity) AS total_quantity
FROM public.order_items oi
JOIN public.recipes r ON r.name = oi.recipe_name
JOIN public.ingredients i ON i.id = r.ingredient_id
GROUP BY oi.order_date, LOWER(oi.day_name), i.name, r.unit;

-- RLS Policies for user_roles (only admins can modify)
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert user roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_permissions (only admins can manage)
CREATE POLICY "Admins can view all permissions"
ON public.user_permissions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can grant permissions"
ON public.user_permissions FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can revoke permissions"
ON public.user_permissions FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Helper function to check permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _resource VARCHAR, _action VARCHAR)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions
    WHERE user_id = _user_id
      AND (resource = _resource OR resource = '*')
      AND (action = _action OR action = '*')
  ) OR public.has_role(_user_id, 'admin')
$$;

-- RLS Policies for ingredients
CREATE POLICY "Users with read permission can view ingredients"
ON public.ingredients FOR SELECT
TO authenticated
USING (public.has_permission(auth.uid(), 'ingredients', 'read'));

CREATE POLICY "Users with create permission can add ingredients"
ON public.ingredients FOR INSERT
TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'ingredients', 'create'));

CREATE POLICY "Users with update permission can modify ingredients"
ON public.ingredients FOR UPDATE
TO authenticated
USING (public.has_permission(auth.uid(), 'ingredients', 'update'));

CREATE POLICY "Users with delete permission can remove ingredients"
ON public.ingredients FOR DELETE
TO authenticated
USING (public.has_permission(auth.uid(), 'ingredients', 'delete'));

-- RLS Policies for recipe_types
CREATE POLICY "Users with read permission can view recipe types"
ON public.recipe_types FOR SELECT
TO authenticated
USING (public.has_permission(auth.uid(), 'recipe_types', 'read'));

CREATE POLICY "Users with create permission can add recipe types"
ON public.recipe_types FOR INSERT
TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'recipe_types', 'create'));

CREATE POLICY "Users with update permission can modify recipe types"
ON public.recipe_types FOR UPDATE
TO authenticated
USING (public.has_permission(auth.uid(), 'recipe_types', 'update'));

CREATE POLICY "Users with delete permission can remove recipe types"
ON public.recipe_types FOR DELETE
TO authenticated
USING (public.has_permission(auth.uid(), 'recipe_types', 'delete'));

-- RLS Policies for recipes
CREATE POLICY "Users with read permission can view recipes"
ON public.recipes FOR SELECT
TO authenticated
USING (public.has_permission(auth.uid(), 'recipes', 'read'));

CREATE POLICY "Users with create permission can add recipes"
ON public.recipes FOR INSERT
TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'recipes', 'create'));

CREATE POLICY "Users with update permission can modify recipes"
ON public.recipes FOR UPDATE
TO authenticated
USING (public.has_permission(auth.uid(), 'recipes', 'update'));

CREATE POLICY "Users with delete permission can remove recipes"
ON public.recipes FOR DELETE
TO authenticated
USING (public.has_permission(auth.uid(), 'recipes', 'delete'));

-- RLS Policies for order_items
CREATE POLICY "Users with read permission can view orders"
ON public.order_items FOR SELECT
TO authenticated
USING (public.has_permission(auth.uid(), 'order_items', 'read'));

CREATE POLICY "Users with create permission can add orders"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'order_items', 'create'));

CREATE POLICY "Users with update permission can modify orders"
ON public.order_items FOR UPDATE
TO authenticated
USING (public.has_permission(auth.uid(), 'order_items', 'update'));

CREATE POLICY "Users with delete permission can remove orders"
ON public.order_items FOR DELETE
TO authenticated
USING (public.has_permission(auth.uid(), 'order_items', 'delete'));

-- Trigger to create user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed data: ingredients
INSERT INTO public.ingredients (name) VALUES
  ('butter'), ('flour'), ('salt'), ('eggs'),
  ('garlic puree'), ('lemon juice'), ('canola oil'),
  ('anchovy'), ('dijon mustard'), ('capers'),
  ('parmesan'), ('worcestershire'), ('white pepper');

-- Seed data: recipe types
INSERT INTO public.recipe_types (name) VALUES
  ('sauce'), ('dressing');

-- Seed data: recipes (burger sauce mc)
INSERT INTO public.recipes (name, ingredient_id, quantity_base, unit, recipe_type_id)
SELECT 
  'burger sauce mc',
  i.id,
  CASE i.name
    WHEN 'butter' THEN 2
    WHEN 'flour' THEN 300
    WHEN 'salt' THEN 50
    WHEN 'eggs' THEN 2
  END,
  CASE i.name
    WHEN 'butter' THEN 'tbsp'
    WHEN 'flour' THEN 'g'
    WHEN 'salt' THEN 'g'
    WHEN 'eggs' THEN 'units'
  END,
  rt.id
FROM public.ingredients i
CROSS JOIN public.recipe_types rt
WHERE i.name IN ('butter', 'flour', 'salt', 'eggs')
  AND rt.name = 'sauce';

-- Seed data: recipes (caesar dressing)
INSERT INTO public.recipes (name, ingredient_id, quantity_base, unit, recipe_type_id)
SELECT 
  'caesar dressing',
  i.id,
  CASE i.name
    WHEN 'garlic puree' THEN 7.5
    WHEN 'lemon juice' THEN 15
    WHEN 'canola oil' THEN 300
    WHEN 'anchovy' THEN 10
    WHEN 'eggs' THEN 2
    WHEN 'dijon mustard' THEN 20
    WHEN 'capers' THEN 10
    WHEN 'parmesan' THEN 100
    WHEN 'worcestershire' THEN 2.5
    WHEN 'salt' THEN 2.5
    WHEN 'white pepper' THEN 1
  END,
  CASE i.name
    WHEN 'garlic puree' THEN 'ml'
    WHEN 'lemon juice' THEN 'ml'
    WHEN 'canola oil' THEN 'ml'
    WHEN 'anchovy' THEN 'g'
    WHEN 'eggs' THEN 'units'
    WHEN 'dijon mustard' THEN 'g'
    WHEN 'capers' THEN 'g'
    WHEN 'parmesan' THEN 'g'
    WHEN 'worcestershire' THEN 'ml'
    WHEN 'salt' THEN 'g'
    WHEN 'white pepper' THEN 'g'
  END,
  rt.id
FROM public.ingredients i
CROSS JOIN public.recipe_types rt
WHERE i.name IN ('garlic puree', 'lemon juice', 'canola oil', 'anchovy', 'eggs', 'dijon mustard', 'capers', 'parmesan', 'worcestershire', 'salt', 'white pepper')
  AND rt.name = 'dressing';