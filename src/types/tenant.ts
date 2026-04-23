export type GymStatus = 'active' | 'paused' | 'suspended';
export type UserStatus = 'active' | 'paused' | 'suspended';
export type AppRole = 'super_admin' | 'admin' | 'coach' | 'client';

export function normalizeAppRole(role: string | null | undefined): AppRole | null {
  const normalized = role?.trim().toLowerCase();

  switch (normalized) {
    case 'super_admin':
    case 'superadmin':
      return 'super_admin';
    case 'admin':
    case 'gym_admin':
      return 'admin';
    case 'coach':
    case 'entrenador':
      return 'coach';
    case 'client':
    case 'cliente':
    case 'user':
    case 'usuario':
      return 'client';
    default:
      return null;
  }
}

export interface Gym {
  id: string;
  name: string;
  legal_name: string | null;
  document_number: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  business_hours: string | null;
  slug: string | null;
  logo_url: string | null;
  status: GymStatus;
  max_coaches: number;
  max_clients: number;
  created_at: string;
  updated_at: string;
}

export interface GymWithCounts extends Gym {
  coach_count: number;
  client_count: number;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  gym_id: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}
