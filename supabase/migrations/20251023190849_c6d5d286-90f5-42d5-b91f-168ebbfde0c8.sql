-- Drop old view and create new one that groups by order_date only
DROP VIEW IF EXISTS public.v_daily_ingredient_summary;

CREATE OR REPLACE VIEW public.v_order_daily_ingredient_summary AS
SELECT
  oi.order_date AS order_date,
  lower(to_char(oi.order_date, 'FMDay')) AS day_name,
  i.name AS ingredient,
  r.unit AS unit,
  SUM(r.quantity_base * oi.quantity) AS total_quantity
FROM public.order_items oi
JOIN public.recipes r ON r.name = oi.recipe_name
JOIN public.ingredients i ON i.id = r.ingredient_id
GROUP BY oi.order_date, i.name, r.unit;