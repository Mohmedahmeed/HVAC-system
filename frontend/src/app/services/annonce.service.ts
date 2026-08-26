import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Annonce {
  id: number;
  titre: string;
  date: string;
  lieu: string;
  detail: string;
  phone: string;
  prixmin: number;
  prixmax: number;
  categorie: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnnonceService {
  private apiUrl = 'http://localhost:8081/api/v1/annonce';

  constructor(private http: HttpClient) { }

  getAllAnnonces(): Observable<Annonce[]> {
    return this.http.get<Annonce[]>(this.apiUrl);
  }

  createAnnonce(annonce: Annonce): Observable<Annonce> {
    return this.http.post<Annonce>(this.apiUrl, annonce);
  }

  getAnnoncesByFilters(categorie: string, lieu: string): Observable<Annonce[]> {
    return this.http.get<Annonce[]>(`${this.apiUrl}/${categorie}/${lieu}`);
  }
}
