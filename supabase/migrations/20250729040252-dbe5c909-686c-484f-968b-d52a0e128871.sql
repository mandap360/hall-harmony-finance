-- Add default "Refund" income category with subcategories
DO $$
DECLARE
    refund_category_id uuid;
BEGIN
    -- Insert the main "Refund" category
    INSERT INTO public.income_categories (name, description, is_default, organization_id, parent_id)
    VALUES ('Refund', 'Refund transactions', true, null, null)
    RETURNING id INTO refund_category_id;
    
    -- Insert subcategories
    INSERT INTO public.income_categories (name, description, is_default, organization_id, parent_id)
    VALUES 
        ('Booking Cancellation', 'Refunds for cancelled bookings', true, null, refund_category_id),
        ('Excess Advance', 'Refunds for excess advance payments', true, null, refund_category_id);
END $$;