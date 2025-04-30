
-- Create RPC function to fetch a user's profile
CREATE OR REPLACE FUNCTION public.get_profile_by_id(user_id UUID)
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM profiles WHERE id = user_id;
$$;

-- Create RPC function to update a user's profile
CREATE OR REPLACE FUNCTION public.update_user_profile(user_id UUID, new_full_name TEXT)
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles 
  SET 
    full_name = new_full_name,
    updated_at = now()
  WHERE id = user_id
  RETURNING *;
$$;

-- Create RPC function to get cart items with products
CREATE OR REPLACE FUNCTION public.get_cart_items_with_products()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  product_id UUID,
  quantity INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  product JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    ci.user_id,
    ci.product_id,
    ci.quantity,
    ci.created_at,
    ci.updated_at,
    row_to_json(p) AS product
  FROM 
    cart_items ci
    JOIN products p ON ci.product_id = p.id
  WHERE 
    ci.user_id = auth.uid()
  ORDER BY 
    ci.created_at DESC;
END;
$$;

-- Create RPC function to get a specific cart item
CREATE OR REPLACE FUNCTION public.get_cart_item(product_id_param UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  product_id UUID,
  quantity INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    ci.user_id,
    ci.product_id,
    ci.quantity,
    ci.created_at,
    ci.updated_at
  FROM 
    cart_items ci
  WHERE 
    ci.user_id = auth.uid()
    AND ci.product_id = product_id_param;
END;
$$;

-- Create RPC function to update cart item quantity
CREATE OR REPLACE FUNCTION public.update_cart_item_quantity(cart_item_id UUID, new_quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cart_items
  SET 
    quantity = LEAST(GREATEST(new_quantity, 1), 10), -- Ensure quantity is between 1 and 10
    updated_at = now()
  WHERE 
    id = cart_item_id
    AND user_id = auth.uid();
END;
$$;

-- Create RPC function to add item to cart
CREATE OR REPLACE FUNCTION public.add_to_cart(product_id_param UUID, quantity_param INTEGER)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO cart_items (
    user_id,
    product_id,
    quantity
  ) VALUES (
    auth.uid(),
    product_id_param,
    LEAST(GREATEST(quantity_param, 1), 10) -- Ensure quantity is between 1 and 10
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Create RPC function to remove item from cart
CREATE OR REPLACE FUNCTION public.remove_from_cart(cart_item_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM cart_items
  WHERE 
    id = cart_item_id
    AND user_id = auth.uid();
END;
$$;

-- Create RPC function to get saved items with products
CREATE OR REPLACE FUNCTION public.get_saved_items_with_products()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  product_id UUID,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  product JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    si.id,
    si.user_id,
    si.product_id,
    si.created_at,
    si.expires_at,
    row_to_json(p) AS product
  FROM 
    saved_items si
    JOIN products p ON si.product_id = p.id
  WHERE 
    si.user_id = auth.uid()
  ORDER BY 
    si.created_at DESC;
END;
$$;

-- Create RPC function to get a specific saved item
CREATE OR REPLACE FUNCTION public.get_saved_item(product_id_param UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  product_id UUID,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    si.id,
    si.user_id,
    si.product_id,
    si.created_at,
    si.expires_at
  FROM 
    saved_items si
  WHERE 
    si.user_id = auth.uid()
    AND si.product_id = product_id_param;
END;
$$;

-- Create RPC function to add item to saved items
CREATE OR REPLACE FUNCTION public.add_to_saved_items(product_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO saved_items (
    user_id,
    product_id
  ) VALUES (
    auth.uid(),
    product_id_param
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Create RPC function to remove item from saved items
CREATE OR REPLACE FUNCTION public.remove_from_saved_items(saved_item_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM saved_items
  WHERE 
    id = saved_item_id
    AND user_id = auth.uid();
END;
$$;
