-- CHEAT-SHEET: Supabase Schema (prefijo cs_)
-- Run this in Supabase SQL Editor

-- Properties
CREATE TABLE IF NOT EXISTS cs_properties (
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
CREATE TABLE IF NOT EXISTS cs_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES cs_properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS cs_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES cs_properties(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS cs_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES cs_properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'Other',
  file_url TEXT NOT NULL DEFAULT '',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts
CREATE TABLE IF NOT EXISTS cs_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES cs_properties(id) ON DELETE SET NULL,
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
CREATE TABLE IF NOT EXISTS cs_zone_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES cs_properties(id) ON DELETE SET NULL,
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
ALTER TABLE cs_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_zone_info ENABLE ROW LEVEL SECURITY;

-- Admin can do everything (users NOT in cs_owners table)
CREATE POLICY "Admin full access cs_properties" ON cs_properties FOR ALL
  USING (NOT EXISTS (SELECT 1 FROM cs_owners WHERE cs_owners.user_id = auth.uid()));

CREATE POLICY "Admin full access cs_services" ON cs_services FOR ALL
  USING (NOT EXISTS (SELECT 1 FROM cs_owners WHERE cs_owners.user_id = auth.uid()));

CREATE POLICY "Admin full access cs_documents" ON cs_documents FOR ALL
  USING (NOT EXISTS (SELECT 1 FROM cs_owners WHERE cs_owners.user_id = auth.uid()));

CREATE POLICY "Admin full access cs_contacts" ON cs_contacts FOR ALL
  USING (NOT EXISTS (SELECT 1 FROM cs_owners WHERE cs_owners.user_id = auth.uid()));

CREATE POLICY "Admin full access cs_zone_info" ON cs_zone_info FOR ALL
  USING (NOT EXISTS (SELECT 1 FROM cs_owners WHERE cs_owners.user_id = auth.uid()));

CREATE POLICY "Admin full access cs_owners" ON cs_owners FOR ALL
  USING (NOT EXISTS (SELECT 1 FROM cs_owners WHERE cs_owners.user_id = auth.uid()));

-- Owners can read their own property data
CREATE POLICY "Owner read own cs_property" ON cs_properties FOR SELECT
  USING (EXISTS (SELECT 1 FROM cs_owners WHERE cs_owners.user_id = auth.uid() AND cs_owners.property_id = cs_properties.id));

CREATE POLICY "Owner read own cs_services" ON cs_services FOR SELECT
  USING (EXISTS (SELECT 1 FROM cs_owners WHERE cs_owners.user_id = auth.uid() AND cs_owners.property_id = cs_services.property_id));

CREATE POLICY "Owner read own cs_documents" ON cs_documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM cs_owners WHERE cs_owners.user_id = auth.uid() AND cs_owners.property_id = cs_documents.property_id));

CREATE POLICY "Owner read cs_contacts" ON cs_contacts FOR SELECT
  USING (
    is_global = true OR
    EXISTS (SELECT 1 FROM cs_owners WHERE cs_owners.user_id = auth.uid() AND cs_owners.property_id = cs_contacts.property_id)
  );

CREATE POLICY "Owner read cs_zone" ON cs_zone_info FOR SELECT
  USING (
    is_global = true OR
    EXISTS (SELECT 1 FROM cs_owners WHERE cs_owners.user_id = auth.uid() AND cs_owners.property_id = cs_zone_info.property_id)
  );

CREATE POLICY "Owner read own cs_record" ON cs_owners FOR SELECT
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
