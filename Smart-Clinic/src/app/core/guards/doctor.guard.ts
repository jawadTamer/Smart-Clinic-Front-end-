import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DoctorGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Check if user is a doctor
    if (userType === 'doctor') {
      return true;
    }

    // User is not a doctor, redirect to appropriate dashboard
    if (userType === 'patient') {
      this.router.navigate(['/dashboards/patient-dashboard']);
    } else if (userType === 'admin' || userType === 'staff') {
      this.router.navigate(['/dashboards/admin-dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
    return false;
  }
}
