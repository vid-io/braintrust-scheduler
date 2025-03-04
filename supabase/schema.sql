-- Create tables for the Brain Trust meeting system

-- Slots table
CREATE TABLE IF NOT EXISTS slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  presenter_name TEXT,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security policies
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only)
CREATE POLICY "Allow public read access to slots" 
  ON slots FOR SELECT USING (true);

-- Create policies for insert/update
CREATE POLICY "Allow insert to slots" 
  ON slots FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to slots" 
  ON slots FOR UPDATE USING (true);

-- Function to generate slots for upcoming meetings
CREATE OR REPLACE FUNCTION generate_upcoming_slots(weeks_ahead INTEGER DEFAULT 2, slots_per_meeting INTEGER DEFAULT 3)
RETURNS void AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  next_tuesday DATE;
  next_thursday DATE;
  i INTEGER;
  j INTEGER;
BEGIN
  -- Find the next Tuesday
  next_tuesday := current_date + ((9 - EXTRACT(DOW FROM current_date)) % 7) * INTERVAL '1 day';
  
  -- Find the next Thursday
  next_thursday := current_date + ((11 - EXTRACT(DOW FROM current_date)) % 7) * INTERVAL '1 day';
  
  -- Generate slots for the specified number of weeks
  FOR i IN 0..(weeks_ahead-1) LOOP
    -- Create slots for Tuesday
    FOR j IN 1..slots_per_meeting LOOP
      INSERT INTO slots (date) VALUES (next_tuesday + (i * 7) * INTERVAL '1 day');
    END LOOP;
    
    -- Create slots for Thursday
    FOR j IN 1..slots_per_meeting LOOP
      INSERT INTO slots (date) VALUES (next_thursday + (i * 7) * INTERVAL '1 day');
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the function to generate initial slots
SELECT generate_upcoming_slots();

