import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewClinic {
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
}

export interface ClinicsApiResponse {
  results: Clinic[];
  count: number;
  next: string | null;
  previous: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ClinicService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getClinics(): Observable<Clinic[]> {
    return this.http.get<Clinic[]>(`${this.apiUrl}/clinics/`);
  }

  getAllClinics(): Observable<ClinicsApiResponse> {
    return this.http.get<ClinicsApiResponse>(`${this.apiUrl}/clinics/?page_size=100`);
  }

  createClinic(clinicData: NewClinic): Observable<Clinic> {
    return this.http.post<Clinic>(`${this.apiUrl}/clinics/create/`, clinicData);
  }

  getClinicDetails(clinicId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/clinics/${clinicId}/`);
  }
}
