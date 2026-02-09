-- Update get_available_slots to:
-- 1. Use specific barber 'work_start' and 'work_end' from profiles table.
-- 2. Fix Timezone logic (Interpret times as Argentina Time, not UTC) so 20:00 isn't cut off.
-- 3. Change slot duration to 1 HOUR.

CREATE OR REPLACE FUNCTION get_available_slots(
    p_barber_id UUID,
    p_date DATE
)
RETURNS TABLE (slot_start TIMESTAMPTZ) AS $$
DECLARE
    -- Use specific barber schedule or default
    v_work_start TEXT;
    v_work_end TEXT;
    
    -- Timestamps
    shop_open TIMESTAMPTZ;
    shop_close TIMESTAMPTZ;
    
    curr_slot TIMESTAMPTZ;
    slot_duration INTERVAL := INTERVAL '1 hour'; -- CHANGED TO 1 HOUR
BEGIN
    -- 1. Fetch Barber Schedule (or default 09:00 - 20:00)
    SELECT 
        COALESCE(work_start, '09:00'), 
        COALESCE(work_end, '20:00')
    INTO v_work_start, v_work_end
    FROM profiles 
    WHERE id = p_barber_id;

    -- 2. Construct Timestamps using Argentina Timezone
    -- interpreted AS Argentina time -> converted to absolute TIMESTAMPTZ (UTC)
    shop_open := (p_date::text || ' ' || v_work_start || ':00')::timestamp AT TIME ZONE 'America/Argentina/Buenos_Aires';
    shop_close := (p_date::text || ' ' || v_work_end || ':00')::timestamp AT TIME ZONE 'America/Argentina/Buenos_Aires';

    -- 3. Loop
    curr_slot := shop_open;
    
    WHILE curr_slot < shop_close LOOP
        IF NOT EXISTS (
            SELECT 1 FROM appointments
            WHERE barber_id = p_barber_id
            AND status = 'confirmed'
            AND slot && TSTZRANGE(curr_slot, curr_slot + slot_duration)
        ) THEN
            slot_start := curr_slot;
            RETURN NEXT;
        END IF;
        
        curr_slot := curr_slot + slot_duration;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
