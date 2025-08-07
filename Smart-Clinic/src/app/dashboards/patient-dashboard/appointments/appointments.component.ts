import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PatientService } from '../../../core/services/patient.service';
import Swal from 'sweetalert2';

export interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  doctor: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
    };
    specialization: string;
    clinic?: any;
  };
  patient: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
    };
    medical_history?: string;
    allergies?: string;
    emergency_contact?: string;
  };
}

export interface AppointmentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Appointment[];
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = true;
  error: string | null = null;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = null;

    this.patientService.getAppointments().subscribe({
      next: (data: any) => {
        if (data && data.results) {
          this.appointments = data.results;
        } else if (Array.isArray(data)) {
          this.appointments = data;
        } else {
          this.appointments = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.error = 'Failed to load appointments. Please try again.';
        this.loading = false;

        Swal.fire({
          title: 'Error!',
          text: 'Failed to load appointments. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'warn';
      default:
        return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'check_circle';
      case 'pending':
        return 'schedule';
      case 'completed':
        return 'task_alt';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(timeString: string): string {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  cancelAppointment(appointmentId: string): void {
    Swal.fire({
      title: 'Cancel Appointment?',
      text: 'Are you sure you want to cancel this appointment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performCancelAppointment(appointmentId);
      }
    });
  }

  private performCancelAppointment(appointmentId: string): void {
    this.patientService.cancelAppointment(appointmentId).subscribe({
      next: () => {
        Swal.fire({
          title: 'Cancelled!',
          text: 'Your appointment has been cancelled.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        this.loadAppointments(); // Reload appointments
      },
      error: (error) => {
        console.error('Error cancelling appointment:', error);
        console.error('Response:', error.error);
        console.error('Status:', error.status);
        console.error('URL attempted:', error.url);

        // Check if it's a specific API error
        let errorMessage = 'Failed to cancel appointment. Please try again.';
        if (error.status === 404) {
          errorMessage = 'Appointment not found or endpoint not available.';
        } else if (error.status === 403) {
          errorMessage = 'You are not authorized to cancel this appointment.';
        } else if (error.status === 405) {
          errorMessage =
            'Method not allowed. The API endpoint may be different.';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && error.error.detail) {
          errorMessage = error.error.detail;
        }

        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  refreshAppointments(): void {
    this.loadAppointments();
  }
}
