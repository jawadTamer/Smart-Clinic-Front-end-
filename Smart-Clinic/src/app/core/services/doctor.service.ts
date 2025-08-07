import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, EMPTY } from 'rxjs';
import { map, expand, reduce, takeWhile } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  phone: string;
  address: string;
  date_of_birth: string;
  gender: string;
  profile_picture: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  doctor_id: string | null;
  patient_id: string | null;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  doctor: string;
}

export interface Doctor {
  id: string;
  user: User;
  clinic: Clinic;
  schedules: Schedule[];
  specialization: string;
  license_number: string;
  experience_years: number;
  consultation_fee: string;
  bio: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Doctor[];
}

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

  getAllDoctors(): Observable<DoctorsApiResponse> {
    return this.http.get<DoctorsApiResponse>(
      `${this.apiUrl}/doctors/?page_size=1000`
    );
  }

  getAllDoctorsComplete(): Observable<Doctor[]> {
    console.log('getAllDoctorsComplete() called');
    return this.fetchAllDoctorsPages();
  }

  private fetchAllDoctorsPages(
    url: string = `${this.apiUrl}/doctors/`
  ): Observable<Doctor[]> {
    console.log('fetchAllDoctorsPages called with URL:', url);
    return this.http.get<DoctorsApiResponse>(url).pipe(
      expand((response: DoctorsApiResponse) => {
        console.log('Expand called with response:', response);
        console.log('Next URL:', response.next);
        
        // Fix HTTP to HTTPS for next URL if needed
        let nextUrl = response.next;
        if (nextUrl && nextUrl.startsWith('http://')) {
          nextUrl = nextUrl.replace('http://', 'https://');
          console.log('Fixed next URL to HTTPS:', nextUrl);
        }
        
        // If there's a next page, continue fetching, otherwise return EMPTY
        return nextUrl
          ? this.http.get<DoctorsApiResponse>(nextUrl)
          : EMPTY;
      }),
      map((response: DoctorsApiResponse) => {
        console.log('Map called, doctors in this page:', response.results.length);
        return response.results;
      }),
      reduce((allDoctors: Doctor[], doctors: Doctor[]) => {
        console.log(`Reduce called: ${allDoctors.length} + ${doctors.length} = ${allDoctors.length + doctors.length}`);
        return [...allDoctors, ...doctors];
      }, [])
    );
  }

  createSchedule(schedule: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/doctors/schedule/create/`, schedule, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  updateSchedule(scheduleId: string | number, schedule: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.put(
      `${this.apiUrl}/doctors/schedule/${scheduleId}/`,
      schedule,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  deleteSchedule(scheduleId: string | number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(
      `${this.apiUrl}/doctors/schedule/${scheduleId}/delete/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
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
