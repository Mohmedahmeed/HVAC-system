import { ServiceRequest, ServiceRequestUser } from './service-request.model';

export interface Appointment {
  id: number;
  serviceRequest: ServiceRequest;
  contractor: ServiceRequestUser;
  scheduledStart: string;
  scheduledEnd: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  completionNotes?: string;
  completedAt?: string;
}
