import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  DoctorService,
  Doctor,
  DoctorsApiResponse,
} from '../core/services/doctor.service';
import {
  ClinicService,
  Clinic,
  ClinicsApiResponse,
} from '../core/services/clinic.service';
import { environment } from '../../environments/environment';
import { User } from '../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('fadeInOut', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('1000ms ease-in-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  currentImageIndex = 0;
  private intervalId: any;
  imageLoadError = false;
  imageRetryCount = 0;
  maxRetries = 10;
  imageLoading = false;
  currentUser: any = null;

  // Doctors data
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  selectedSpecialization = 'All';
  specializations: string[] = ['All'];
  isLoadingDoctors = false;

  // Clinics data
  clinics: Clinic[] = [];
  isLoadingClinics = false;

  // Background images array - you can add more images to the assets/images folder
  backgroundImages = [
    'assets/images/doctor1.jpg',
    'assets/images/doctor2.jpg',
    'assets/images/doctor3.jpg',
    'assets/images/doctor4.jpg',
  ];

  constructor(
    private router: Router,
    private doctorService: DoctorService,
    private clinicService: ClinicService
  ) {}

  ngOnInit() {
    this.startImageCarousel();
    this.loadDoctors();
    this.loadClinics();
    this.imageLoadError = false;
    this.imageRetryCount = 0;
    this.imageLoading = true;
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadDoctors() {
    this.isLoadingDoctors = true;
    this.doctorService.getAllDoctors().subscribe({
      next: (response: DoctorsApiResponse) => {
        this.doctors = response.results;
        this.filteredDoctors = [...this.doctors];
        this.extractSpecializations();
        this.isLoadingDoctors = false;
      },
      error: (error) => {
        this.isLoadingDoctors = false;
      },
    });
  }

  loadClinics() {
    this.isLoadingClinics = true;

    // Try the simple method first (direct array response)
    this.clinicService.getClinics().subscribe({
      next: (clinics: Clinic[]) => {
        this.clinics = clinics;
        this.isLoadingClinics = false;
      },
      error: (error) => {
        // If that fails, try the paginated response
        this.clinicService.getAllClinics().subscribe({
          next: (response: ClinicsApiResponse) => {
            this.clinics = response.results;
            this.isLoadingClinics = false;
          },
          error: (err) => {
            console.error('Error loading clinics:', err);
            this.isLoadingClinics = false;
          },
        });
      },
    });
  }

  extractSpecializations() {
    const specs = this.doctors.map((doctor) => doctor.specialization);
    this.specializations = ['All', ...Array.from(new Set(specs))];
  }

  filterBySpecialization(specialization: string) {
    this.selectedSpecialization = specialization;
    if (specialization === 'All') {
      this.filteredDoctors = [...this.doctors];
    } else {
      this.filteredDoctors = this.doctors.filter(
        (doctor) => doctor.specialization === specialization
      );
    }
  }

  getDoctorFullName(doctor: Doctor): string {
    return `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`;
  }

  getDoctorImage(doctor: Doctor): string {
    // Log for debugging

    const profilePicture = doctor.user.profile_picture;

    // If profilePicture is null or undefined, return a default image
    if (!profilePicture) {
      return 'assets/images/default-doctor.jpg';
    }

    // If it's already a complete URL (starts with http)
    if (
      profilePicture.startsWith('http://') ||
      profilePicture.startsWith('https://')
    ) {
      // Check if the URL already has /api in it
      if (profilePicture.includes('/api/')) {
        return profilePicture;
      } else {
        // Insert /api into the URL after the domain
        const correctedUrl = profilePicture.replace(
          'smart-clinic-api.fly.dev/',
          'smart-clinic-api.fly.dev/api/'
        );
        return correctedUrl;
      }
    }

    // If it starts with a slash, it's a relative path from the API
    if (profilePicture.startsWith('/')) {
      const fullUrl = `${environment.apiUrl}${profilePicture}`;
      return fullUrl;
    }

    // For any other case, prepend the API URL with a slash
    const fullUrl = `${environment.apiUrl}/${profilePicture}`;
    return fullUrl;
  }

  bookAppointment(doctor: Doctor) {
    // Navigate to appointment booking page or show login modal
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: `/book-appointment/${doctor.id}`,
      },
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

  startImageCarousel() {
    this.intervalId = setInterval(() => {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.backgroundImages.length;
    }, 5000);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  getCurrentBackgroundImage() {
    return this.backgroundImages[this.currentImageIndex];
  }
}
