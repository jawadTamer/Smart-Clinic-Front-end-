import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
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
    MatPaginatorModule,
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

  // Doctors pagination
  doctorsPageSize = 6;
  doctorsCurrentPage = 0;
  paginatedDoctors: Doctor[] = [];

  // Clinics data
  clinics: Clinic[] = [];
  isLoadingClinics = false;

  // Clinics pagination
  clinicsPageSize = 6;
  clinicsCurrentPage = 0;
  paginatedClinics: Clinic[] = [];

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
        this.updateDoctorsPagination();
        this.isLoadingDoctors = false;

        if (response.count && response.results.length < response.count) {
          this.loadAllDoctorsAlternative();
        }
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.isLoadingDoctors = false;
        this.loadAllDoctorsAlternative();
      },
    });
  }

  private loadAllDoctorsAlternative() {
    this.isLoadingDoctors = true;
    this.doctorService.getAllDoctorsComplete().subscribe({
      next: (doctors: Doctor[]) => {
        this.doctors = doctors;
        this.filteredDoctors = [...this.doctors];
        this.extractSpecializations();
        this.updateDoctorsPagination();
        this.isLoadingDoctors = false;
      },
      error: (error) => {
        console.error('Error loading doctors with alternative method:', error);
        this.isLoadingDoctors = false;
      },
    });
  }

  loadClinics() {
    this.isLoadingClinics = true;

    this.clinicService.getClinics().subscribe({
      next: (clinics: Clinic[]) => {
        this.clinics = clinics;
        this.updateClinicsPagination();
        this.isLoadingClinics = false;
      },
      error: (error) => {
        this.clinicService.getAllClinics().subscribe({
          next: (response: ClinicsApiResponse) => {
            this.clinics = response.results;
            this.updateClinicsPagination();
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
    this.doctorsCurrentPage = 0;
    this.updateDoctorsPagination();
  }

  getDoctorFullName(doctor: Doctor): string {
    return `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`;
  }

  getDoctorImage(doctor: Doctor): string {
    const profilePicture = doctor.user.profile_picture;

    if (!profilePicture) {
      return 'assets/images/default-doctor.jpg';
    }

    if (
      profilePicture.startsWith('http://') ||
      profilePicture.startsWith('https://')
    ) {
      if (profilePicture.includes('/api/')) {
        return profilePicture;
      } else {
        const correctedUrl = profilePicture.replace(
          'smart-clinic-api.fly.dev/',
          'smart-clinic-api.fly.dev/api/'
        );
        return correctedUrl;
      }
    }

    if (profilePicture.startsWith('/')) {
      const fullUrl = `${environment.apiUrl}${profilePicture}`;
      return fullUrl;
    }

    const fullUrl = `${environment.apiUrl}/${profilePicture}`;
    return fullUrl;
  }

  bookAppointment(doctor: Doctor) {
    this.router.navigate(['/doctor', doctor.id]);
  }

  openDoctorDetailsDialog(doctor: Doctor) {
    this.router.navigate(['/doctor', doctor.id]);
  }

  viewClinicDetails(clinic: Clinic) {
    this.router.navigate(['/clinic', clinic.id]);
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

  updateDoctorsPagination() {
    const startIndex = this.doctorsCurrentPage * this.doctorsPageSize;
    const endIndex = startIndex + this.doctorsPageSize;
    this.paginatedDoctors = this.filteredDoctors.slice(startIndex, endIndex);
  }

  onDoctorsPageChange(event: any) {
    this.doctorsCurrentPage = event.pageIndex;
    this.updateDoctorsPagination();
  }

  updateClinicsPagination() {
    const startIndex = this.clinicsCurrentPage * this.clinicsPageSize;
    const endIndex = startIndex + this.clinicsPageSize;
    this.paginatedClinics = this.clinics.slice(startIndex, endIndex);
  }

  onClinicsPageChange(event: any) {
    this.clinicsCurrentPage = event.pageIndex;
    this.updateClinicsPagination();
  }
}
