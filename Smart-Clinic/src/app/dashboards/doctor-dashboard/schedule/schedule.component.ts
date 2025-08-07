import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doctor-schedule',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
})
export class ScheduleComponent implements OnInit {
  scheduleForm: FormGroup;
  schedules: any[] = [];
  loading = false;
  error: string | null = null;
  editingSchedule: any = null;
  isEditMode = false;

  days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  scheduleTypes = [
    { value: 'recurring', label: 'Recurring Weekly Schedule' },
    { value: 'specific', label: 'Specific Date Schedule' },
  ];

  constructor(
    private fb: FormBuilder,
    @Inject(DoctorService) private doctorService: DoctorService,
    @Inject(AuthService) private authService: AuthService
  ) {
    this.scheduleForm = this.fb.group({
      schedule_type: ['recurring', Validators.required],
      day: [''],
      specific_date: [''],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      is_available: [true],
      notes: [''],
    });

    this.scheduleForm.get('schedule_type')?.valueChanges.subscribe((type) => {
      this.updateValidators(type);
    });

    this.updateValidators('recurring');
  }

  private futureDateValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  private updateValidators(scheduleType: string) {
    const dayControl = this.scheduleForm.get('day');
    const specificDateControl = this.scheduleForm.get('specific_date');

    dayControl?.clearValidators();
    specificDateControl?.clearValidators();

    if (scheduleType === 'recurring') {
      dayControl?.setValidators([Validators.required]);
      specificDateControl?.setValue('');
    } else if (scheduleType === 'specific') {
      specificDateControl?.setValidators([
        Validators.required,
        this.futureDateValidator.bind(this),
      ]);
      dayControl?.setValue('');
    }

    dayControl?.updateValueAndValidity();
    specificDateControl?.updateValueAndValidity();
  }

  get isRecurringSchedule(): boolean {
    return this.scheduleForm.get('schedule_type')?.value === 'recurring';
  }

  get isSpecificDateSchedule(): boolean {
    return this.scheduleForm.get('schedule_type')?.value === 'specific';
  }

  ngOnInit() {
    this.fetchSchedules();
  }

  fetchSchedules() {
    this.loading = true;
    const doctorId = this.authService.getCurrentUser()?.doctor_id;
    if (doctorId === undefined || doctorId === null) {
      this.error = 'Doctor ID is not available.';
      this.loading = false;
      return;
    }
    this.doctorService.getSchedules(doctorId).subscribe({
      next: (data: any) => {
        this.schedules = Array.isArray(data) ? data : data.results || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching schedules:', err);
        this.error = 'Failed to load schedules.';
        this.loading = false;
      },
    });
  }

  createSchedule() {
    if (this.scheduleForm.invalid) {
      Object.keys(this.scheduleForm.controls).forEach((key) => {
        this.scheduleForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = { ...this.scheduleForm.value };

    const doctorId = this.authService.getCurrentUser()?.doctor_id;
    if (doctorId) {
      formValue.doctor = doctorId;
    }

    if (formValue.schedule_type === 'recurring') {
      delete formValue.specific_date;
    } else if (formValue.schedule_type === 'specific') {
      delete formValue.day;
      if (formValue.specific_date) {
        const date = new Date(formValue.specific_date);
        formValue.specific_date = date.toISOString().split('T')[0];
      }
    }

    console.log('Creating schedule with data:', formValue);

    if (this.isEditMode && this.editingSchedule) {
      this.doctorService
        .updateSchedule(this.editingSchedule.id, formValue)
        .subscribe({
          next: (response) => {
            console.log('Schedule updated successfully:', response);
            this.fetchSchedules();
            this.resetForm();
            this.cancelEdit();
            this.loading = false;
          },
          error: (err) => {
            this.handleError(err);
          },
        });
    } else {
      this.doctorService.createSchedule(formValue).subscribe({
        next: (response) => {
          console.log('Schedule created successfully:', response);
          this.fetchSchedules();
          this.resetForm();
          this.loading = false;
        },
        error: (err) => {
          this.handleError(err);
        },
      });
    }
  }

  private handleError(err: any) {
    let errorMessage = this.isEditMode
      ? 'Failed to update schedule: '
      : 'Failed to create schedule: ';
    if (err.error && typeof err.error === 'object') {
      const errors = [];
      for (const field in err.error) {
        if (Array.isArray(err.error[field])) {
          errors.push(`${field}: ${err.error[field].join(', ')}`);
        } else {
          errors.push(`${field}: ${err.error[field]}`);
        }
      }
      errorMessage += errors.join('; ');
    } else if (err.error) {
      errorMessage += err.error;
    } else {
      errorMessage += err.message || 'Unknown error';
    }

    this.error = errorMessage;
    this.loading = false;
    console.error('Schedule operation error:', err);
  }

  private resetForm() {
    const currentScheduleType =
      this.scheduleForm.get('schedule_type')?.value || 'recurring';
    this.scheduleForm.reset({
      schedule_type: currentScheduleType,
      is_available: true,
      notes: '',
    });
    this.updateValidators(currentScheduleType);
  }

  editSchedule(schedule: any) {
    this.editingSchedule = schedule;
    this.isEditMode = true;
    this.error = null;

    const formData = {
      schedule_type:
        schedule.schedule_type ||
        (schedule.specific_date ? 'specific' : 'recurring'),
      day: schedule.day || '',
      specific_date: schedule.specific_date || '',
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      is_available: schedule.is_available,
      notes: schedule.notes || '',
    };

    this.scheduleForm.patchValue(formData);
    this.updateValidators(formData.schedule_type);

    document
      .querySelector('.schedule-card')
      ?.scrollIntoView({ behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingSchedule = null;
    this.isEditMode = false;
    this.error = null;
    this.resetForm();
  }

  deleteSchedule(schedule: any) {
    Swal.fire({
      title: 'Delete Schedule?',
      text: `Are you sure you want to delete this ${
        schedule.schedule_type ||
        (schedule.specific_date ? 'specific date' : 'recurring')
      } schedule?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'clinic-swal-popup',
        title: 'clinic-swal-title',
        confirmButton: 'clinic-swal-confirm',
        cancelButton: 'clinic-swal-cancel',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.doctorService.deleteSchedule(schedule.id).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Schedule has been successfully deleted.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'clinic-swal-popup',
              },
            });
            this.fetchSchedules();
            this.loading = false;
            if (
              this.editingSchedule &&
              this.editingSchedule.id === schedule.id
            ) {
              this.cancelEdit();
            }
          },
          error: (err) => {
            console.error('Error deleting schedule:', err);
            Swal.fire({
              title: 'Delete Failed!',
              text: 'Failed to delete schedule. Please try again.',
              icon: 'error',
              confirmButtonColor: '#2563eb',
              customClass: {
                popup: 'clinic-swal-popup',
                confirmButton: 'clinic-swal-confirm',
              },
            });
            this.loading = false;
          },
        });
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.scheduleForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.replace('_', ' ')} is required`;
    }
    if (field?.hasError('pastDate')) {
      return 'Cannot select a past date';
    }
    return '';
  }

  getGroupedSchedules() {
    const grouped = {
      recurring: this.schedules.filter(
        (s) => s.schedule_type === 'recurring' || (!s.schedule_type && s.day)
      ),
      specific: this.schedules.filter(
        (s) =>
          s.schedule_type === 'specific' ||
          (!s.schedule_type && s.specific_date)
      ),
    };
    return grouped;
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

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
