import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { ClinicService, Clinic } from '../core/services/clinic.service';
import { environment } from '../../environments/environment';

interface Doctor {
  id: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    profile_picture?: string;
  };
  specialization: string;
  license_number?: string;
  experience_years?: number;
  consultation_fee?: string;
  bio?: string;
  is_available: boolean;
  schedules?: any[];
}

interface ClinicDetails extends Clinic {
  doctors: Doctor[];
  doctors_count: number;
}

@Component({
  selector: 'app-clinic-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatGridListModule,
  ],
  templateUrl: './clinic-details.component.html',
  styleUrls: ['./clinic-details.component.css'],
})
export class ClinicDetailsComponent implements OnInit {
  clinic: ClinicDetails | null = null;
  loading = true;
  error: string | null = null;
  imageLoadError = false;
  imageRetryCount = 0;
  maxRetries = 10;
  imageLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clinicService: ClinicService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const clinicId = params['id'];
      if (clinicId) {
        this.loadClinicDetails(clinicId);
      }
      this.imageLoadError = false;
      this.imageRetryCount = 0;
      this.imageLoading = true;
    });
  }

  loadClinicDetails(clinicId: string) {
    this.loading = true;
    this.error = null;

    this.clinicService.getClinicDetails(clinicId).subscribe({
      next: (data) => {
        this.clinic = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading clinic details:', error);
        this.error = 'Failed to load clinic details. Please try again.';
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  viewDoctorDetails(doctorId: string) {
    this.router.navigate(['/doctor', doctorId]);
  }

  getDoctorImage(doctor: Doctor): string {
    if (!doctor.user.profile_picture) {
      return 'assets/images/default-doctor.jpg';
    }

    const profilePicture = doctor.user.profile_picture;

    if (
      profilePicture.startsWith('http://') ||
      profilePicture.startsWith('https://')
    ) {
      if (profilePicture.includes('/api/')) {
        return profilePicture;
      } else {
        return profilePicture.replace(
          'smart-clinic-api.fly.dev/',
          'smart-clinic-api.fly.dev/api/'
        );
      }
    }

    if (profilePicture.startsWith('/')) {
      return `${environment.apiUrl}${profilePicture}`;
    }

    return `${environment.apiUrl}/${profilePicture}`;
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
  getAvailableSchedulesCount(doctor: Doctor): number {
    if (!doctor.schedules) return 0;
    return doctor.schedules.filter((schedule) => schedule.is_available).length;
  }

  formatPhoneNumber(phone: string): string {
    if (phone && phone.length >= 10) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    }
    return phone;
  }
}
