import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-register.component.html',
  styleUrl: './patient-register.component.css',
})
export class PatientRegisterComponent implements OnInit {
  patientForm: FormGroup;
  isLoading = false;
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.patientForm = this.fb.group({
      // Common fields
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

      // Patient-specific fields
      medical_history: [''],
      allergies: [''],
      emergency_contact: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{11}$/)],
      ],
      emergency_contact_name: ['', [Validators.required]],
      blood_type: ['', [Validators.required]],
    });
  }

  ngOnInit() {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please select an image file',
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'File size should be less than 5MB',
        });
        return;
      }
      this.patientForm.patchValue({ profile_picture: file });
    }
  }

  getSelectedFileName(): string {
    const file = this.patientForm.get('profile_picture')?.value;
    return file ? file.name : 'No file chosen';
  }

  onSubmit() {
    if (this.patientForm.valid) {
      this.isLoading = true;

      const formData = new FormData();

      Object.keys(this.patientForm.value).forEach((key) => {
        const value = this.patientForm.get(key)?.value;
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Add user_type
      formData.append('user_type', 'patient');

      const patientFields = [
        'medical_history',
        'allergies',
        'emergency_contact',
        'emergency_contact_name',
        'blood_type',
      ];
      patientFields.forEach((field) => {
        const value = formData.get(field);
        console.log(`${field}: ${value}`);
      });

      for (let [key, value] of formData.entries()) {
        console.log(key, '►', value);
      }

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Registration successful:', response);
          console.log('Response data:', response);

          Swal.fire({
            icon: 'success',
            title: 'Registration Successful!',
            text: 'Your patient account has been created successfully.',
            confirmButtonText: 'Continue to Dashboard',
          }).then(() => {
            this.router.navigate(['/dashboards/patient-dashboard']);
          });
        },
        error: (error) => {
          this.isLoading = false;
          // Display error message to user
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
      // Mark all fields as touched to show validation errors
      Object.keys(this.patientForm.controls).forEach((key) => {
        const control = this.patientForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.patientForm.get(fieldName);
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
        if (fieldName === 'phone' || fieldName === 'emergency_contact') {
          return 'Please enter a valid 11-digit phone number';
        }
      }
    }
    return '';
  }
}
