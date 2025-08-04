import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PatientGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Check if user is a patient
    if (userType === 'patient') {
      return true;
    }

    // User is not a patient, redirect to appropriate dashboard
    if (userType === 'doctor') {
      this.router.navigate(['/dashboards/doctor-dashboard']);
    } else if (userType === 'admin' || userType === 'staff') {
      this.router.navigate(['/dashboards/admin-dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
    return false;
  }
}
