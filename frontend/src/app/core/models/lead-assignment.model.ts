import { ServiceRequest, ServiceRequestUser } from './service-request.model';

export type LeadAssignmentStatus = 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface LeadAssignment {
  id: number;
  serviceRequest: ServiceRequest;
  contractor: ServiceRequestUser;
  status: LeadAssignmentStatus;
  sentAt: string;
  respondedAt?: string;
  quotedPrice?: number;
  contractorNotes?: string;
}
