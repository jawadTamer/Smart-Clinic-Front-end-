import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css',
})
export class PatientDashboardComponent {
  isSidebarOpen = true;
  currentUser: User | null = null;

  constructor(private authService: AuthService) {
    this.setSidebarForScreen(window.innerWidth);
    this.currentUser = this.authService.getCurrentUser();
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
