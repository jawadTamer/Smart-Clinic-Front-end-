import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Clinic {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
}

export interface NewClinic {
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
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

  createClinic(clinicData: NewClinic): Observable<Clinic> {
    return this.http.post<Clinic>(
      `${this.apiUrl}/clinics/create/`,
      clinicData
    );
  }
}
