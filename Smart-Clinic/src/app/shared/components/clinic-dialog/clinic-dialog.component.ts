import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  ClinicService,
  NewClinic,
} from '../../../core/services/clinic.service';

@Component({
  selector: 'app-clinic-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clinic-dialog.component.html',
  styleUrl: './clinic-dialog.component.css',
})
export class ClinicDialogComponent {
  @Output() clinicCreated = new EventEmitter<any>();
  @Output() dialogClosed = new EventEmitter<void>();

  clinicForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private clinicService: ClinicService) {
    this.clinicForm = this.fb.group({
      name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      description: [''],
    });
  }

  onSubmit() {
    if (this.clinicForm.valid) {
      this.isLoading = true;
      const clinicData: NewClinic = this.clinicForm.value;

      this.clinicService.createClinic(clinicData).subscribe({
        next: (clinic) => {
          this.isLoading = false;
          this.clinicCreated.emit(clinic);
          this.closeDialog();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Failed to create clinic:', error);
          // You can add error handling here (e.g., show error message)
        },
      });
    }
  }

  closeDialog() {
    this.dialogClosed.emit();
  }
}
