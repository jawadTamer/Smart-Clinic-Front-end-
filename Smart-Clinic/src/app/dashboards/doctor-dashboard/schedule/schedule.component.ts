import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-doctor-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
})
export class ScheduleComponent implements OnInit {
  scheduleForm: FormGroup;
  schedules: any[] = [];
  loading = false;
  error: string | null = null;
  days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  constructor(
    private fb: FormBuilder,
    @Inject(DoctorService) private doctorService: DoctorService,
    @Inject(AuthService) private authService: AuthService
  ) {
    this.scheduleForm = this.fb.group({
      day: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      is_available: [true],
    });
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
    if (this.scheduleForm.invalid) return;
    this.loading = true;
    this.doctorService.createSchedule(this.scheduleForm.value).subscribe({
      next: (response) => {
        console.log('Schedule created successfully:', response);
        this.fetchSchedules();
        this.scheduleForm.reset({ is_available: true });
        this.loading = false;
        this.error = null; 
      },
      error: (err) => {
        let errorMessage = 'Failed to create schedule: ';
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
      },
    });
  }
}
