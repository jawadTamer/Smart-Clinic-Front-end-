import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DoctorRegistrationForm {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  user_type: 'doctor';
  phone: string;
  address: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  specialization: string;
  license_number: string;
  experience_years: number;
  consultation_fee: number;
  bio: string;
  clinic: number;
  new_clinic?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    description?: string;
  };
}

export interface PatientRegistrationForm {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  user_type: 'patient';
  phone: string;
  address: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  medical_history: string;
  allergies: string;
  emergency_contact: string;
  emergency_contact_name: string;
  blood_type: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number | string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'doctor' | 'patient' | 'admin';
  is_staff?: boolean;
  is_superuser?: boolean;
  profile_picture?: string;
  doctor_id?: string;
  patient_id?: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
  access?: string;
  refresh?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  register(
    userData: DoctorRegistrationForm | PatientRegistrationForm | FormData
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/`, userData);
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login/`,
      credentials
    );
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userType');

    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserType(): string | null {
    return localStorage.getItem('userType');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.logout();
      }
    }
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
}
