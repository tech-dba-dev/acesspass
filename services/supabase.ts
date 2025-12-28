import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on the schema
export type UserRole = 'admin' | 'company' | 'client';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  is_active: boolean;
  company_id: string | null;
  member_code: string | null;
  birth_date: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  benefit: string;
  address: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ValidationLog {
  id: string;
  company_id: string;
  client_id: string;
  status: 'success' | 'rejected';
  validated_by: string;
  created_at: string;
}
