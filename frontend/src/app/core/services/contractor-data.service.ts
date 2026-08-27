import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeadAssignment } from '../models/lead-assignment.model';
import { Appointment } from '../models/appointment.model';
import { ContractorProfile } from '../models/contractor-profile.model';
import { ServiceArea } from '../models/service-area.model';
import { Availability } from '../models/availability.model';

@Injectable({
  providedIn: 'root',
})
export class ContractorDataService {
  private apiUrl = 'http://localhost:8081/api/v1';

  constructor(private http: HttpClient) {}

  getMyLeads(): Observable<LeadAssignment[]> {
    return this.http.get<LeadAssignment[]>(`${this.apiUrl}/leads/my-leads`);
  }

  getLead(id: number): Observable<LeadAssignment> {
    return this.http.get<LeadAssignment>(`${this.apiUrl}/leads/${id}`);
  }

  acceptLead(id: number): Observable<LeadAssignment> {
    return this.http.post<LeadAssignment>(`${this.apiUrl}/leads/${id}/accept`, {});
  }

  rejectLead(id: number, reason: string): Observable<LeadAssignment> {
    return this.http.post<LeadAssignment>(`${this.apiUrl}/leads/${id}/reject`, { reason });
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/my-appointments`);
  }

  updateAppointmentStatus(
    id: number,
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/appointments/${id}/status`, { status });
  }

  getMyProfile(): Observable<ContractorProfile> {
    return this.http.get<ContractorProfile>(`${this.apiUrl}/contractor-profile/me`);
  }

  updateMyProfile(data: Partial<ContractorProfile>): Observable<ContractorProfile> {
    return this.http.put<ContractorProfile>(`${this.apiUrl}/contractor-profile/me`, data);
  }

  getMyServiceAreas(): Observable<ServiceArea[]> {
    return this.http.get<ServiceArea[]>(`${this.apiUrl}/service-areas/my-areas`);
  }

  createServiceArea(data: { zipCode: string; city?: string; state?: string }): Observable<ServiceArea> {
    return this.http.post<ServiceArea>(`${this.apiUrl}/service-areas`, data);
  }

  deleteServiceArea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/service-areas/${id}`);
  }

  getMyAvailability(): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.apiUrl}/availability/my-availability`);
  }

  createAvailability(data: Omit<Availability, 'id'>): Observable<Availability> {
    return this.http.post<Availability>(`${this.apiUrl}/availability`, data);
  }

  updateAvailability(id: number, data: Partial<Availability>): Observable<Availability> {
    return this.http.put<Availability>(`${this.apiUrl}/availability/${id}`, data);
  }

  deleteAvailability(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/availability/${id}`);
  }
}
