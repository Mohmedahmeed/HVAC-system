export interface ContractorProfile {
  userId: number;
  businessName?: string;
  description?: string;
  licenseNumber?: string;
  insuranceProvider?: string;
  insuranceExpiry?: string;
  specialties?: string;
  baseRate?: number;
  responseTimeHours?: number;
  acceptsEmergency: boolean;
  logoUrl?: string;
  averageRating: number;
  totalReviews: number;
  verified: boolean;
}
