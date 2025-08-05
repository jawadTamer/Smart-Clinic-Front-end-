import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService, DoctorDetails, DoctorApiResponse } from '../../../core/services/doctor.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  doctorProfile: DoctorDetails | null = null;
  loading = true;
  error: string | null = null;
  currentUser: User | null = null;
  imageLoadError = false;
  imageRetryCount = 0;
  maxRetries = 10;
  imageLoading = false;

  constructor(
    private doctorService: DoctorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.imageLoadError = false;
      this.imageRetryCount = 0;
      this.imageLoading = true;
      if (user && user.user_type === 'doctor' && user.doctor_id) {
        this.loadDoctorProfile(user.doctor_id);
      } else {
        this.error = 'Unable to load profile. Please ensure you are logged in as a doctor.';
        this.loading = false;
      }
    });
  }

  loadDoctorProfile(doctorId: string): void {
    this.loading = true;
    this.error = null;
    
    this.doctorService.getDoctorById(doctorId).subscribe({
      next: (profile) => {
        this.doctorProfile = {
          ...profile,
          // Extract data from nested user object
          name: profile.user?.first_name && profile.user?.last_name 
            ? `${profile.user.first_name} ${profile.user.last_name}`.trim()
            : profile.name || '',
          email: profile.user?.email || '',
          phone: profile.user?.phone || '',
          username: profile.user?.username || '',
          first_name: profile.user?.first_name || '',
          last_name: profile.user?.last_name || '',
          // Extract profile picture from user object
          profilepic: profile.user?.profile_picture || '',
          // Extract clinic name from clinic object
          clinicname: profile.clinic?.name || '',
          // Direct fields from the main response
          bio: profile.bio || '',
          specialization: profile.specialization || '',
          experience_years: profile.experience_years || 0,
          id: profile.id || 0
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load doctor profile. Please try again.';
        this.loading = false;
      }
    });
  }



  retryLoadProfile(): void {
    if (this.currentUser?.doctor_id) {
      this.loadDoctorProfile(this.currentUser.doctor_id);
    }
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
