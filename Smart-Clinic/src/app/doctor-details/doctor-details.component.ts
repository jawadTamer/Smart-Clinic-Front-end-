import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { DoctorService, Doctor } from '../core/services/doctor.service';
import { PatientService } from '../core/services/patient.service';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

interface Schedule {
  id: number;
  doctor: number;
  schedule_type: 'recurring' | 'specific';
  day?: string;
  specific_date?: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
}

@Component({
  selector: 'app-doctor-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
  ],
  templateUrl: './doctor-details.component.html',
  styleUrl: './doctor-details.component.css',
})
export class DoctorDetailsComponent implements OnInit {
  doctor: Doctor | null = null;
  schedules: Schedule[] = [];
  recurringSchedules: Schedule[] = [];
  appointmentForm: FormGroup;
  loading = false;
  schedulesLoading = false;
  bookingLoading = false;
  error: string | null = null;
  today = new Date();
  selectedTabIndex = 0;
  imageLoadError = false;
  imageRetryCount = 0;
  maxRetries = 10;
  imageLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.appointmentForm = this.fb.group({
      appointment_date: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const doctorId = params['id'];
      if (doctorId) {
        this.loadDoctorDetails(doctorId);
        this.loadDoctorSchedules(doctorId);
        this.imageLoadError = false;
        this.imageRetryCount = 0;
        this.imageLoading = true;
      }
    });
  }

  loadDoctorDetails(doctorId: number) {
    this.loading = true;
    this.error = null;

    this.doctorService.getDoctorById(doctorId.toString()).subscribe({
      next: (response: any) => {
        this.doctor = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading doctor details:', err);
        this.error = 'Failed to load doctor details.';
        this.loading = false;
      },
    });
  }

  loadDoctorSchedules(doctorId: number) {
    this.schedulesLoading = true;

    this.doctorService.getSchedules(doctorId).subscribe({
      next: (data: any) => {
        this.schedules = Array.isArray(data) ? data : data.results || [];
        this.recurringSchedules = this.schedules.filter(
          (s) => s.schedule_type === 'recurring' && s.is_available
        );
        this.schedulesLoading = false;
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
        this.schedulesLoading = false;
      },
    });
  }

  getScheduleForDate(selectedDate: Date): Schedule | null {
    const specificSchedule = this.schedules.find((schedule) => {
      if (
        schedule.schedule_type === 'specific' &&
        schedule.specific_date &&
        schedule.is_available
      ) {
        const scheduleDate = new Date(schedule.specific_date);
        scheduleDate.setHours(0, 0, 0, 0);
        const selectedDateCopy = new Date(selectedDate);
        selectedDateCopy.setHours(0, 0, 0, 0);
        return scheduleDate.getTime() === selectedDateCopy.getTime();
      }
      return false;
    });

    if (specificSchedule) {
      return specificSchedule;
    }

    // If no specific date found, check recurring schedule
    const dayName = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
    });

    // Find the first available schedule for the selected day
    return (
      this.recurringSchedules.find(
        (schedule) => schedule.day === dayName && schedule.is_available
      ) || null
    );
  }

  getDoctorImage(): string {
    if (!this.doctor?.user.profile_picture) {
      return 'assets/images/default-doctor.jpg';
    }

    const profilePicture = this.doctor.user.profile_picture;

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

  getScheduleDisplay(schedule: Schedule): string {
    if (schedule.schedule_type === 'recurring') {
      return `${schedule.day} • ${schedule.start_time} - ${schedule.end_time}`;
    } else {
      const date = schedule.specific_date
        ? new Date(schedule.specific_date).toLocaleDateString()
        : '';
      return `${date} • ${schedule.start_time} - ${schedule.end_time}`;
    }
  }

  getScheduleType(schedule: Schedule): string {
    return schedule.schedule_type === 'recurring' ? 'Weekly' : 'Specific Date';
  }

  bookAppointment() {
    if (this.appointmentForm.invalid) {
      Object.keys(this.appointmentForm.controls).forEach((key) => {
        this.appointmentForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.user_type !== 'patient') {
      Swal.fire({
        title: 'Access Denied',
        text: 'Only patients can book appointments.',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    const formValues = this.appointmentForm.value;
    const selectedDate = new Date(formValues.appointment_date);

    const schedule = this.getScheduleForDate(selectedDate);

    if (!schedule) {
      Swal.fire({
        title: 'No Schedule Available',
        text: 'No available schedule found for the selected date.',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    this.bookingLoading = true;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const appointmentDate = `${year}-${month}-${day}`;

    const doctorId = this.doctor!.id;

    const appointmentData = {
      doctor: doctorId,
      appointment_date: appointmentDate,
      appointment_time: schedule.start_time,
      reason: formValues.reason,
    };

    this.patientService.createAppointment(appointmentData).subscribe({
      next: (response) => {
        console.log('Appointment booked successfully:', response);
        this.bookingLoading = false;

        Swal.fire({
          title: 'Success!',
          text: 'Your appointment has been booked successfully.',
          icon: 'success',
          confirmButtonColor: '#22c55e',
        }).then(() => {
          this.router.navigate(['/dashboards/patient-dashboard']);
        });
      },
      error: (err) => {
        console.error('Error booking appointment:', err);
        console.error('Error details:', err.error);
        this.bookingLoading = false;

        let errorMessage = 'Failed to book appointment. Please try again.';
        if (err.error && typeof err.error === 'object') {
          const errors = [];
          for (const field in err.error) {
            if (Array.isArray(err.error[field])) {
              errors.push(`${field}: ${err.error[field].join(', ')}`);
            } else {
              errors.push(`${field}: ${err.error[field]}`);
            }
          }
          errorMessage = errors.join('; ');
        } else if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        }

        Swal.fire({
          title: 'Booking Failed',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#dc2626',
        });
      },
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  isDateAvailable = (date: Date | null): boolean => {
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return false;
    }

    const specificDateMatch = this.schedules.find((schedule) => {
      if (
        schedule.schedule_type === 'specific' &&
        schedule.specific_date &&
        schedule.is_available
      ) {
        const scheduleDate = new Date(schedule.specific_date);
        scheduleDate.setHours(0, 0, 0, 0);
        return scheduleDate.getTime() === selectedDate.getTime();
      }
      return false;
    });

    if (specificDateMatch) {
      return true;
    }

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return this.recurringSchedules.some(
      (schedule) => schedule.day === dayName && schedule.is_available
    );
  };

  get specificSchedules(): Schedule[] {
    return this.schedules.filter(
      (s) => s.schedule_type === 'specific' && s.is_available
    );
  }

  get upcomingSpecificDates(): Schedule[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.specificSchedules
      .filter((schedule) => {
        if (schedule.specific_date) {
          const scheduleDate = new Date(schedule.specific_date);
          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate >= today;
        }
        return false;
      })
      .sort((a, b) => {
        const dateA = new Date(a.specific_date!);
        const dateB = new Date(b.specific_date!);
        return dateA.getTime() - dateB.getTime();
      });
  }

  formatSpecificDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  selectSpecificDate(dateString: string): void {
    const date = new Date(dateString);
    this.appointmentForm.patchValue({
      appointment_date: date,
    });
  }
}
