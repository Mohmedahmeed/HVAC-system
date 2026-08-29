import { ServiceRequest, ServiceRequestUser } from './service-request.model';

export interface Review {
  id: number;
  customer: ServiceRequestUser;
  contractor: ServiceRequestUser;
  serviceRequest: ServiceRequest;
  overallRating: number;
  qualityRating: number;
  professionalismRating: number;
  punctualityRating: number;
  communicationRating: number;
  comment?: string;
  createdAt: string;
}

export interface ReviewInput {
  overallRating: number;
  qualityRating: number;
  professionalismRating: number;
  punctualityRating: number;
  communicationRating: number;
  comment?: string;
}

export type ReviewRatingKey =
  | 'overallRating'
  | 'qualityRating'
  | 'professionalismRating'
  | 'punctualityRating'
  | 'communicationRating';

export interface ReviewDimension {
  key: ReviewRatingKey;
  label: string;
}

export const REVIEW_DIMENSIONS: ReviewDimension[] = [
  { key: 'overallRating', label: 'Overall Experience' },
  { key: 'qualityRating', label: 'Quality of Work' },
  { key: 'professionalismRating', label: 'Professionalism' },
  { key: 'punctualityRating', label: 'Punctuality' },
  { key: 'communicationRating', label: 'Communication' },
];