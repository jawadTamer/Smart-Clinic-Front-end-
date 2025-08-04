import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Check if user is admin/staff
    if (user.is_staff || user.is_superuser || userType === 'admin') {
      return true;
    }

    // User is not admin, redirect to appropriate dashboard
    if (userType === 'doctor') {
      this.router.navigate(['/dashboards/doctor-dashboard']);
    } else if (userType === 'patient') {
      this.router.navigate(['/dashboards/patient-dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
    return false;
  }
}
