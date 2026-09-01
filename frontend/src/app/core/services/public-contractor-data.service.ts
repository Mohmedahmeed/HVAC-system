import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';
import { environment } from '../../../environments/environment';

export interface PublicContractorProfile {
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

@Injectable({
  providedIn: 'root',
})
export class PublicContractorDataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPublicProfile(contractorId: number): Observable<PublicContractorProfile> {
    return this.http.get<PublicContractorProfile>(
      `${this.apiUrl}/contractor-profile/${contractorId}`
    );
  }

  getContractorReviews(contractorId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/contractor/${contractorId}`);
  }
}
