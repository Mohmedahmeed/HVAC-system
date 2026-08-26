import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceRequest } from '../models/service-request.model';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerDataService {
  private apiUrl = 'http://localhost:8081/api/v1';

  constructor(private http: HttpClient) {}

  getMyServiceRequests(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/service-requests/my-requests`);
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/my-appointments`);
  }

  createServiceRequest(data: {
    serviceType: string;
    problemDescription: string;
    urgency: string;
    zipCode: string;
    propertyType?: string;
    squareFootage?: number;
    hvacSystemType?: string;
    address?: string;
    preferredDate?: string;
  }): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(`${this.apiUrl}/service-requests`, data);
  }

  getServiceRequest(id: number): Observable<ServiceRequest> {
    return this.http.get<ServiceRequest>(`${this.apiUrl}/service-requests/${id}`);
  }
}
