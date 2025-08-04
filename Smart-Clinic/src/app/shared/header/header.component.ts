import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LottiePlayerComponent } from '../components/lottie-player.component';
import { AuthService, User } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LottiePlayerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  isAuthenticated = false;
  isUserDropdownOpen = false;
  imageLoadError = false;
  imageRetryCount = 0;
  maxRetries = 10;
  imageLoading = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      this.imageLoadError = false;
      this.imageRetryCount = 0;
      this.imageLoading = true;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.user-profile-dropdown') &&
      !target.closest('.user-profile-dropdown-mobile')
    ) {
      this.isUserDropdownOpen = false;
    }
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }

  navigateToHome() {
    this.isUserDropdownOpen = false;
    this.router.navigate(['/']);
  }

  navigateToDashboard() {
    this.isUserDropdownOpen = false;
    const userType = this.currentUser?.user_type;

    if (userType === 'doctor') {
      this.router.navigate(['/dashboards/doctor-dashboard']);
    } else if (userType === 'patient') {
      this.router.navigate(['/dashboards/patient-dashboard']);
    } else if (userType === 'admin') {
      this.router.navigate(['/dashboards/admin-dashboard']);
    }
  }

  logout() {
    this.isUserDropdownOpen = false;
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/home']);

        Swal.fire({
          icon: 'success',
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          timer: 1000,
          showConfirmButton: false,
        });
      }
    });
  }

  onImageError(event: any) {
    if (this.imageRetryCount < this.maxRetries) {
      this.imageRetryCount++;
      setTimeout(() => {
        const img = event.target as HTMLImageElement;
        if (img) {
          img.src = img.src;
        }
      }, 200 * this.imageRetryCount);
    } else {
      this.imageLoadError = true;
      this.imageLoading = false;
    }
  }

  onImageLoad(event: any) {
    this.imageLoading = false;
    this.imageLoadError = false;
    this.imageRetryCount = 0;
  }

  getProfilePictureUrl(): string | null {
    if (!this.currentUser) return null;

    // Check multiple possible field names for profile picture
    const possibleFields = [
      'profile_picture',
      'profile_image',
      'avatar',
      'image',
      'photo',
      'picture',
    ];

    for (const field of possibleFields) {
      if (this.currentUser[field as keyof User]) {
        const url = this.currentUser[field as keyof User] as string;

        if (url && url.startsWith('/')) {
          return `${environment.apiUrl}${url}`;
        }

        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          return url;
        }

        if (url && !url.startsWith('http')) {
          return `${environment.apiUrl}${url}`;
        }

        return url;
      }
    }

    return null;
  }
}
