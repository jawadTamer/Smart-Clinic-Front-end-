import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
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
  selector: 'app-doctor-appointments',
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = null;

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http
      .get<AppointmentsResponse>(`${this.apiUrl}/appointments/`, { headers })
      .subscribe({
        next: (data: AppointmentsResponse) => {
          if (data && data.results) {
            this.appointments = data.results;
          } else if (Array.isArray(data)) {
            this.appointments = data as Appointment[];
          } else {
            this.appointments = [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
          this.error = 'Failed to load appointments. Please try again.';
          this.loading = false;
        },
      });
  }

  refreshAppointments(): void {
    this.loadAppointments();
  }

  confirmAppointment(appointmentId: string): void {
    Swal.fire({
      title: 'Confirm Appointment',
      text: 'Are you sure you want to confirm this appointment?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#f44336',
      confirmButtonText: 'Yes, Confirm',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateAppointmentStatus(appointmentId, 'confirmed');
      }
    });
  }

  cancelAppointment(appointmentId: string): void {
    Swal.fire({
      title: 'Cancel Appointment',
      text: 'Are you sure you want to cancel this appointment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep',
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateAppointmentStatus(appointmentId, 'cancelled');
      }
    });
  }

  completeAppointment(appointmentId: string): void {
    Swal.fire({
      title: 'Complete Appointment',
      text: 'Mark this appointment as completed?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2196f3',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Complete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateAppointmentStatus(appointmentId, 'completed');
      }
    });
  }

  private updateAppointmentStatus(appointmentId: string, status: string): void {
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const updateData = { status };

    this.http
      .patch(`${this.apiUrl}/appointments/${appointmentId}/`, updateData, {
        headers,
      })
      .subscribe({
        next: (updatedAppointment: any) => {
          const index = this.appointments.findIndex(
            (app) => app.id === appointmentId
          );
          if (index !== -1) {
            this.appointments[index] = {
              ...this.appointments[index],
              ...updatedAppointment,
            };
          }

          const statusMessages = {
            confirmed: 'Appointment confirmed successfully!',
            cancelled: 'Appointment cancelled successfully!',
            completed: 'Appointment completed successfully!',
          };

          Swal.fire({
            title: 'Success!',
            text:
              statusMessages[status as keyof typeof statusMessages] ||
              'Appointment updated successfully!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (error) => {
          console.error('Error updating appointment:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update appointment. Please try again.',
            icon: 'error',
          });
        },
      });
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      pending: 'schedule',
      confirmed: 'check_circle',
      cancelled: 'cancel',
      completed: 'task_alt',
    };
    return icons[status] || 'help';
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' | undefined {
    const colors: { [key: string]: 'primary' | 'accent' | 'warn' | undefined } =
      {
        pending: 'accent',
        confirmed: 'primary',
        cancelled: 'warn',
        completed: 'primary',
      };
    return colors[status];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return 'Not specified';

    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));

      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return timeString;
    }
  }

  canConfirm(appointment: Appointment): boolean {
    return appointment.status === 'pending';
  }

  canCancel(appointment: Appointment): boolean {
    return (
      appointment.status === 'pending' || appointment.status === 'confirmed'
    );
  }

  canComplete(appointment: Appointment): boolean {
    return appointment.status === 'confirmed';
  }
}
