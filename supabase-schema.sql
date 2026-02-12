-- CHEAT-SHEET: Supabase Schema
-- Run this in Supabase SQL Editor

-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  type TEXT DEFAULT 'Condo',
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  sqft INT DEFAULT 0,
  photo_url TEXT,
  fideicomiso TEXT,
  fideicomiso_bank TEXT,
  fideicomiso_number TEXT,
  closing_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Owners (linked to auth.users)
CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT '',
  provider TEXT DEFAULT '',
  account_number TEXT,
  phone TEXT,
  website TEXT,
  payment_freq TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'Other',
  file_url TEXT NOT NULL DEFAULT '',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'Maintenance',
  name TEXT NOT NULL DEFAULT '',
  specialty TEXT,
  phone TEXT NOT NULL DEFAULT '',
  phone2 TEXT,
  email TEXT,
  address TEXT,
  website TEXT,
  notes TEXT,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zone Info
CREATE TABLE IF NOT EXISTS zone_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'Restaurant',
  name TEXT NOT NULL DEFAULT '',
  description TEXT,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  phone TEXT,
  website TEXT,
  distance TEXT,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_info ENABLE ROW LEVEL SECURITY;

-- Admin can do everything (users NOT in owners table)
CREATE POLICY "Admin full access properties" ON properties FOR ALL
  USING (NOT EXISTS (SELECT 1 FROM owners WHERE owners.user_id = auth.uid()));

CREATE POLICY "Admin full access services" ON services FOR ALL
  USING (NOT EXISTS (SELECT 1 FROM owners WHERE owners.user_id = auth.uid()));

CREATE POLICY "Admin full access documents" ON documents FOR ALL
  USING (NOT EXISTS (SELECT 1 FROM owners WHERE owners.user_id = auth.uid()));

CREATE POLICY "Admin full access contacts" ON contacts FOR ALL
  USING (NOT EXISTS (SELECT 1 FROM owners WHERE owners.user_id = auth.uid()));

CREATE POLICY "Admin full access zone_info" ON zone_info FOR ALL
  USING (NOT EXISTS (SELECT 1 FROM owners WHERE owners.user_id = auth.uid()));

CREATE POLICY "Admin full access owners" ON owners FOR ALL
  USING (NOT EXISTS (SELECT 1 FROM owners WHERE owners.user_id = auth.uid()));

-- Owners can read their own property data
CREATE POLICY "Owner read own property" ON properties FOR SELECT
  USING (EXISTS (SELECT 1 FROM owners WHERE owners.user_id = auth.uid() AND owners.property_id = properties.id));

CREATE POLICY "Owner read own services" ON services FOR SELECT
  USING (EXISTS (SELECT 1 FROM owners WHERE owners.user_id = auth.uid() AND owners.property_id = services.property_id));

CREATE POLICY "Owner read own documents" ON documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM owners WHERE owners.user_id = auth.uid() AND owners.property_id = documents.property_id));

CREATE POLICY "Owner read contacts" ON contacts FOR SELECT
  USING (
    is_global = true OR
    EXISTS (SELECT 1 FROM owners WHERE owners.user_id = auth.uid() AND owners.property_id = contacts.property_id)
  );

CREATE POLICY "Owner read zone" ON zone_info FOR SELECT
  USING (
    is_global = true OR
    EXISTS (SELECT 1 FROM owners WHERE owners.user_id = auth.uid() AND owners.property_id = zone_info.property_id)
  );

CREATE POLICY "Owner read own record" ON owners FOR SELECT
  USING (user_id = auth.uid());

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can read documents" ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Admin can upload documents" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Admin can delete documents" ON storage.objects FOR DELETE
  USING (bucket_id = 'documents');
