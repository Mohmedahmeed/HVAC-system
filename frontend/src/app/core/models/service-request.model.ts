export interface ServiceRequestUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

export interface ServiceRequest {
  id: number;
  customer: ServiceRequestUser;
  serviceType: string;
  problemDescription: string;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  propertyType?: string;
  squareFootage?: number;
  hvacSystemType?: string;
  zipCode: string;
  address?: string;
  status: 'NEW' | 'MATCHED' | 'ACCEPTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimatedPrice?: number;
  preferredDate?: string;
  createdAt: string;
  completedAt?: string;
  photoUrl?: string;
}
