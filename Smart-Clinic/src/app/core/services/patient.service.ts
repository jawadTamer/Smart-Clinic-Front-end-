import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PatientProfile {
  id: string;
  allergies?: string;
  blood_type?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  medical_history?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
    gender?: 'M' | 'F';
    profile_picture?: string;
    user_type: string;
    patient_id: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface PatientUpdateData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F';
  emergency_contact?: string;
  emergency_contact_name?: string;
  medical_history?: string;
  allergies?: string;
  blood_type?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPatientProfile(): Observable<PatientProfile> {
    const token = localStorage.getItem('token');
    return this.http.get<PatientProfile>(`${this.apiUrl}/patients/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  updatePatientProfile(
    profileData: PatientUpdateData
  ): Observable<PatientProfile> {
    const token = localStorage.getItem('token');
    console.log('Updating patient profile with data:', profileData);
    console.log('Using token:', token);

    return this.http.put<PatientProfile>(
      `${this.apiUrl}/patients/me/`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  createAppointment(appointmentData: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(
      `${this.apiUrl}/appointments/create/`,
      appointmentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  getAppointments(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get<any>(`${this.apiUrl}/appointments/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  updateAppointmentStatus(
    appointmentId: string,
    status: string
  ): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.patch(
      `${this.apiUrl}/appointments/${appointmentId}/`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  cancelAppointment(appointmentId: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.put(
      `${this.apiUrl}/appointments/${appointmentId}/`,
      { status: 'cancelled' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
