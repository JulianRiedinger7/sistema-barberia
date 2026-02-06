-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES ENUM
CREATE TYPE user_role AS ENUM ('admin', 'barber', 'client');
CREATE TYPE appointment_status AS ENUM ('confirmed', 'no_show', 'completed', 'cancelled');
CREATE TYPE finance_type AS ENUM ('income', 'expense');

-- 1. PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role user_role DEFAULT 'client',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SERVICES
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_min INT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. APPOINTMENTS
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES profiles(id) NOT NULL,
    barber_id UUID REFERENCES profiles(id) NOT NULL,
    service_id UUID REFERENCES services(id) NOT NULL,
    slot TSTZRANGE NOT NULL,
    status appointment_status DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- EXCLUDE constraint to prevent overlapping appointments for the same barber
    EXCLUDE USING GIST (
        barber_id WITH =,
        slot WITH &&
    )
);

-- 4. FINANCES
CREATE TABLE finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type finance_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read for basic info (needed for booking UI), Users edit own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Services: Public read, Admin write
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Admins can insert services" ON services FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update services" ON services FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Appointments: 
-- Clients see their own.
-- Barbers see all appointments where they are the barber.
-- Admins see all.
CREATE POLICY "Clients see their own appointments" ON appointments FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Barbers see their schedule" ON appointments FOR SELECT USING (auth.uid() = barber_id);
CREATE POLICY "Admins see all appointments" ON appointments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Clients can create appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Barbers/Admins can update status" ON appointments FOR UPDATE USING (
    auth.uid() = barber_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Finances: Admin only
CREATE POLICY "Admins view finances" ON finances FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins manage finances" ON finances FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);


-- FUNCTION: get_available_slots
-- Returns available start times for a given barber and date
-- Assumes shop open 9AM - 8PM (modify as needed)
CREATE OR REPLACE FUNCTION get_available_slots(
    p_barber_id UUID,
    p_date DATE
)
RETURNS TABLE (slot_start TIMESTAMPTZ) AS $$
DECLARE
    shop_open TIMESTAMPTZ := (p_date + TIME '09:00:00')::TIMESTAMPTZ;
    shop_close TIMESTAMPTZ := (p_date + TIME '20:00:00')::TIMESTAMPTZ;
    curr_slot TIMESTAMPTZ;
    slot_duration INTERVAL := INTERVAL '30 minutes';
BEGIN
    curr_slot := shop_open;
    
    WHILE curr_slot < shop_close LOOP
        -- Check if this slot overlaps with any existing confirmed appointment for the barber
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
