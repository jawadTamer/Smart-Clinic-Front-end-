import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;

          localStorage.setItem('user', JSON.stringify(response.user));

          const token = response.tokens.access;

          const finalToken = token;

          localStorage.setItem('token', finalToken);
          localStorage.setItem('userType', response.user.user_type);

          this.authService.setCurrentUser(response.user);

          let navigationPath = '';
          if (response.user.user_type === 'doctor') {
            navigationPath = 'dashboards/doctor-dashboard';
          } else if (response.user.user_type === 'patient') {
            navigationPath = 'dashboards/patient-dashboard';
          } else {
            navigationPath = 'dashboards/patient-dashboard';
          }

          setTimeout(() => {
            this.router
              .navigate([navigationPath])
              .then(() => {
                Swal.fire({
                  icon: 'success',
                  title: 'Login Successful!',
                  text: `Welcome back, ${response.user.first_name}!`,
                  timer: 1000,
                  showConfirmButton: false,
                });
              })
              .catch((error) => {
                Swal.fire({
                  icon: 'success',
                  title: 'Login Successful!',
                  text: `Welcome back, ${response.user.first_name}!`,
                  timer: 1000,
                  showConfirmButton: false,
                });
              });
          }, 200);
        },
        error: (error) => {
          this.isLoading = false;

          let errorMessage = 'Login failed. Please try again.';

          if (error.error) {
            if (error.error.non_field_errors) {
              errorMessage = error.error.non_field_errors[0];
            } else if (error.error.username) {
              errorMessage = error.error.username[0];
            } else if (error.error.password) {
              errorMessage = error.error.password[0];
            }
          }

          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: errorMessage,
            confirmButtonText: 'Try Again',
          });
        },
      });
    } else {
      Object.keys(this.loginForm.controls).forEach((key) => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } is required`;
      }
      if (field.errors?.['minlength']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } must be at least ${
          field.errors['minlength'].requiredLength
        } characters`;
      }
    }
    return '';
  }
}
