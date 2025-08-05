import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import {
  DoctorService,
  DoctorDetails,
} from '../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css',
})
export class DoctorDashboardComponent {
  isSidebarOpen = true;
  currentUser: User | null = null;
  specialization: string | null = null;

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService
  ) {
    this.setSidebarForScreen(window.innerWidth);
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user && user.user_type === 'doctor' && user.doctor_id) {
        this.doctorService.getDoctorById(user.doctor_id).subscribe({
          next: (doctor: DoctorDetails) => {
            this.specialization = doctor.specialization;
          },
          error: (err) => {
            console.error('Failed to fetch doctor details', err);
            this.specialization = 'Doctor';
          },
        });
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setSidebarForScreen(event.target.innerWidth);
  }

  setSidebarForScreen(width: number) {
    this.isSidebarOpen = width > 991;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth <= 991) {
      this.isSidebarOpen = false;
    }
  }
}
