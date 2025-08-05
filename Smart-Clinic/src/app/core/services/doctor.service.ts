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
  name: string;
  phone: string;
  bio: string;
  specialization: string;
  experience_years: number;
  clinicname: string;
  profilepic: string;
}

export interface DoctorApiResponse {
  id: number;
  bio: string;
  specialization: string;
  experience_years: number;
  profilepic?: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    profile_picture?: string;
  };
  clinic?: {
    id: number;
    name: string;
  };
  name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createSchedule(schedule: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/doctors/schedule/create/`, schedule, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  getSchedules(doctorId: string | number): Observable<any> {
    const url = `${this.apiUrl}/doctors/${doctorId}/schedules/`;
    return this.http.get<any>(url);
  }

  getDoctorById(doctorId: string): Observable<DoctorApiResponse> {
    return this.http.get<DoctorApiResponse>(
      `${this.apiUrl}/doctors/${doctorId}/`
    );
  }
}
