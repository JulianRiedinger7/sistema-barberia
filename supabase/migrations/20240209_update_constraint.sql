-- Update Appointments exclusion constraint to allow overlapping cancelled appointments
-- This is necessary so that a 'cancelled' appointment doesn't block the slot for a new 'confirmed' one.

DO $$
DECLARE constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'appointments'::regclass
    AND contype = 'x'; -- 'x' = exclusion constraint

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE appointments DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

ALTER TABLE appointments
ADD CONSTRAINT appointments_barber_slot_excl
EXCLUDE USING GIST (barber_id WITH =, slot WITH &&)
WHERE (status = 'confirmed' OR status = 'completed');
-- We include 'completed' to prevent double booking on past slots if that matters, 
-- but main logic is: only 'confirmed' blocks future slots. 
-- Actually, 'completed' blocks history, which is fine. 
-- 'cancelled' and 'no_show' should NOT block.

