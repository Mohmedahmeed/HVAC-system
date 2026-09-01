import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioItem } from '../models/portfolio-item.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PortfolioDataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyProjects(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.apiUrl}/contractor-portfolio/my-projects`);
  }
}
