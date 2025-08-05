import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DoctorDetails {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  specialization: string;
  // Add other fields as needed
}

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDoctorById(doctorId: string): Observable<DoctorDetails> {
    return this.http.get<DoctorDetails>(`${this.apiUrl}/doctors/${doctorId}/`);
  }
}
