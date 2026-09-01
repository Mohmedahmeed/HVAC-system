export type UserRole = 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  siret?: string;
  createdAt?: string;
}

export interface MeResponse {
  authenticated: boolean;
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
}

export const ROLE_DASHBOARDS: Record<string, string> = {
  CUSTOMER: '/customer/dashboard',
  CONTRACTOR: '/contractor/dashboard',
  ADMIN: '/admin/dashboard',
};
