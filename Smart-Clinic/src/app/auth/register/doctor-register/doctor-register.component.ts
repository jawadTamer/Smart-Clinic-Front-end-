import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthService,
  DoctorRegistrationForm,
} from '../../../core/services/auth.service';
import { ClinicService, Clinic } from '../../../core/services/clinic.service';
import { ClinicDialogComponent } from '../../../shared/components/clinic-dialog/clinic-dialog.component';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-doctor-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClinicDialogComponent],
  templateUrl: './doctor-register.component.html',
  styleUrl: './doctor-register.component.css',
})
export class DoctorRegisterComponent implements OnInit {
  doctorForm: FormGroup;
  clinics: Clinic[] = [];
  isLoading = false;
  showClinicDialog = false;
  specializations = [
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'General',
    'Dental',
    'Eye',
    'Surgery',
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private clinicService: ClinicService
  ) {
    this.doctorForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      address: ['', [Validators.required]],
      date_of_birth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      profile_picture: [null],
      specialization: ['', [Validators.required]],
      license_number: ['', [Validators.required]],
      experience_years: [0, [Validators.required, Validators.min(0)]],
      consultation_fee: [0, [Validators.required, Validators.min(0)]],
      bio: [''],
      clinic: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadClinics();
  }

  loadClinics() {
    this.clinicService.getClinics().subscribe({
      next: (clinics) => {
        this.clinics = clinics;
      },
      error: (error) => {
        console.error('Failed to load clinics:', error);
      },
    });
  }

  showCreateClinicDialog() {
    this.showClinicDialog = true;
  }

  onClinicCreated(clinic: Clinic) {
    this.loadClinics();
    this.doctorForm.patchValue({ clinic: clinic.id });
    this.showClinicDialog = false;
  }

  onDialogClosed() {
    this.showClinicDialog = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please select an image file',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'File size should be less than 5MB',
        });
        return;
      }
      this.doctorForm.patchValue({ profile_picture: file });
    }
  }

  getSelectedFileName(): string {
    const file = this.doctorForm.get('profile_picture')?.value;
    return file ? file.name : 'No file chosen';
  }

  onSubmit() {
    if (this.doctorForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      Object.keys(this.doctorForm.value).forEach((key) => {
        const value = this.doctorForm.get(key)?.value;
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      formData.append('user_type', 'doctor');

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Registration Successful!',
            text: 'You can now log in.',
            confirmButtonText: 'Go to Login',
          }).then(() => {
            this.router.navigate(['/auth/login']);
          });
        },
        error: (error) => {
          this.isLoading = false;
          if (error.error && typeof error.error === 'object') {
            const errorMessages = [];
            for (const [field, messages] of Object.entries(error.error)) {
              if (Array.isArray(messages)) {
                errorMessages.push(`${field}: ${messages.join(', ')}`);
              } else {
                errorMessages.push(`${field}: ${messages}`);
              }
            }
            Swal.fire({
              icon: 'error',
              title: 'Registration failed',
              html: errorMessages.join('<br>'),
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Registration failed',
              text: 'Registration failed. Please check your information and try again.',
            });
          }
        },
      });
    } else {
      Object.keys(this.doctorForm.controls).forEach((key) => {
        const control = this.doctorForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.doctorForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } is required`;
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors?.['minlength']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } must be at least ${
          field.errors['minlength'].requiredLength
        } characters`;
      }
      if (field.errors?.['pattern']) {
        if (fieldName === 'phone') {
          return 'Please enter a valid 11-digit phone number';
        }
      }
      if (field.errors?.['min']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } must be at least ${field.errors['min'].min}`;
      }
    }
    return '';
  }
}
