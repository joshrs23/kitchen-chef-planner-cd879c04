-- Add prep_date to order_items
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS prep_date DATE NULL;

-- Inicializa prep_date con order_date para filas existentes (opcional pero útil)
UPDATE public.order_items
SET prep_date = order_date
WHERE prep_date IS NULL;

-- Índice para filtrar por prep_date (opcional)
CREATE INDEX IF NOT EXISTS order_items_prep_date_idx
  ON public.order_items(prep_date);

COMMENT ON COLUMN public.order_items.prep_date
  IS 'Date used for preparation the order';