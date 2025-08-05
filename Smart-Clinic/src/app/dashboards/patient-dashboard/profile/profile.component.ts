import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService, User } from '../../../core/services/auth.service';
import {
  PatientService,
  PatientProfile,
  PatientUpdateData,
} from '../../../core/services/patient.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class PatientProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  patientProfile: PatientProfile | null = null;
  isEditing = false;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  imageLoadError = false;
  imageRetryCount = 0;
  maxRetries = 10;
  imageLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private patientService: PatientService
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[\d\s-()]+$/)]],
      address: [''],
      date_of_birth: [''],
      gender: [''],
      emergency_contact: [''],
      emergency_contact_name: [''],
      medical_history: [''],
      allergies: [''],
      blood_type: [''],
    });
  }

  ngOnInit() {
    this.loadUserProfile();
    this.imageLoadError = false;
    this.imageRetryCount = 0;
    this.imageLoading = true;
  }

  loadUserProfile() {
    this.loading = true;
    this.error = null;

    this.patientService.getPatientProfile().subscribe({
      next: (profile: PatientProfile) => {
        this.patientProfile = profile;
        this.currentUser = this.authService.getCurrentUser();

        this.profileForm.patchValue({
          first_name: profile.user.first_name || '',
          last_name: profile.user.last_name || '',
          email: profile.user.email || '',
          phone: profile.user.phone || '',
          address: profile.user.address || '',
          date_of_birth: profile.user.date_of_birth || '',
          gender: profile.user.gender || '',
          emergency_contact: profile.emergency_contact || '',
          emergency_contact_name: profile.emergency_contact_name || '',
          medical_history: profile.medical_history || '',
          allergies: profile.allergies || '',
          blood_type: profile.blood_type || '',
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading patient profile:', err);
        this.error = 'Failed to load profile data';
        this.loading = false;

        this.currentUser = this.authService.getCurrentUser();
        if (this.currentUser) {
          this.profileForm.patchValue({
            first_name: this.currentUser.first_name || '',
            last_name: this.currentUser.last_name || '',
            email: this.currentUser.email || '',
            phone: this.currentUser.phone || '',
            address: this.currentUser.address || '',
            date_of_birth: this.currentUser.date_of_birth || '',
            emergency_contact: this.currentUser.emergency_contact || '',
            medical_history: this.currentUser.medical_history || '',
            gender: this.currentUser.gender || '',
          });
        }
      },
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserProfile();
      this.error = null;
      this.successMessage = null;
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      const updateData: PatientUpdateData = this.profileForm.value;

      this.patientService.updatePatientProfile(updateData).subscribe({
        next: (updatedProfile: PatientProfile) => {
          this.patientProfile = updatedProfile;
          this.loading = false;
          this.isEditing = false;
          this.successMessage = 'Profile updated successfully!';

          if (this.currentUser) {
            this.currentUser.first_name = updatedProfile.user.first_name;
            this.currentUser.last_name = updatedProfile.user.last_name;
            this.currentUser.email = updatedProfile.user.email;
            this.currentUser.phone = updatedProfile.user.phone;
            this.currentUser.address = updatedProfile.user.address;
            this.currentUser.date_of_birth = updatedProfile.user.date_of_birth;
            this.currentUser.gender = updatedProfile.user.gender;
            this.currentUser.emergency_contact =
              updatedProfile.emergency_contact;
            this.currentUser.medical_history = updatedProfile.medical_history;
            this.authService.setCurrentUser(this.currentUser);
          }

          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.loading = false;

          let errorMessage = 'Failed to update profile: ';
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
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors?.['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${
          field.errors['minlength'].requiredLength
        } characters`;
      }
      if (field.errors?.['pattern']) {
        return 'Please enter a valid phone number';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      first_name: 'First Name',
      last_name: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      date_of_birth: 'Date of Birth',
      gender: 'Gender',
      emergency_contact: 'Emergency Contact',
      emergency_contact_name: 'Emergency Contact Name',
      medical_history: 'Medical History',
      allergies: 'Allergies',
      blood_type: 'Blood Type',
    };
    return displayNames[fieldName] || fieldName;
  }

  calculateAge(): number | null {
    const birthDate =
      this.patientProfile?.user?.date_of_birth ||
      this.currentUser?.date_of_birth;
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }

      return age;
    }
    return null;
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

  getProfilePictureUrl(): string | null {
    if (!this.currentUser) return null;

    const possibleFields = [
      'profile_picture',
      'profile_image',
      'avatar',
      'image',
      'photo',
      'picture',
    ];

    for (const field of possibleFields) {
      if (this.currentUser[field as keyof User]) {
        const url = this.currentUser[field as keyof User] as string;

        if (url && url.startsWith('/')) {
          return `${environment.apiUrl}${url}`;
        }

        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          return url;
        }

        if (url && !url.startsWith('http')) {
          return `${environment.apiUrl}${url}`;
        }

        return url;
      }
    }

    return null;
  }
}
