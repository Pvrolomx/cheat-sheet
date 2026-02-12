export interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  photo_url: string | null;
  fideicomiso: string | null;
  fideicomiso_bank: string | null;
  fideicomiso_number: string | null;
  closing_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Owner {
  id: string;
  user_id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  property_id: string;
  type: string;
  provider: string;
  account_number: string | null;
  phone: string | null;
  website: string | null;
  payment_freq: string | null;
  notes: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  property_id: string;
  name: string;
  category: string;
  file_url: string;
  uploaded_at: string;
}

export interface Contact {
  id: string;
  property_id: string | null;
  category: string;
  name: string;
  specialty: string | null;
  phone: string;
  phone2: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  is_global: boolean;
  created_at: string;
}

export interface ZoneInfo {
  id: string;
  property_id: string | null;
  category: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  distance: string | null;
  is_global: boolean;
  created_at: string;
}
