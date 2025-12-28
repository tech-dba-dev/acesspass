export type Role = 'admin' | 'company' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatar: string;
  isActive: boolean; // Vital for clients
  companyId?: string; // If role is company, links to Company details
  memberCode?: string; // Unique code for clients
  birthDate?: string; // Date of birth
  phone?: string; // Phone number
}

export interface Company {
  id: string;
  slug: string;
  name: string;
  description: string;
  benefit: string; // The discount or offer
  address: string;
  image: string;
  isActive?: boolean;
}

export interface ValidationLog {
  id: string;
  companyId: string;
  companyName: string;
  clientId: string;
  clientName: string;
  timestamp: string;
  status: 'success' | 'rejected';
}

// Helper for UI state
export type ViewState = 'login' | 'dashboard';