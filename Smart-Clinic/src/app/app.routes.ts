import { Routes } from '@angular/router';
import { DoctorGuard } from './core/guards/doctor.guard';
import { PatientGuard } from './core/guards/patient.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'clinic/:id',
    loadComponent: () =>
      import('./clinic-details/clinic-details.component').then(
        (m) => m.ClinicDetailsComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'doctor/:id',
    loadComponent: () =>
      import('./doctor-details/doctor-details.component').then(
        (m) => m.DoctorDetailsComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'auth/patient-register',
    loadComponent: () =>
      import(
        './auth/register/patient-register/patient-register.component'
      ).then((m) => m.PatientRegisterComponent),
  },
  {
    path: 'auth/doctor-register',
    loadComponent: () =>
      import('./auth/register/doctor-register/doctor-register.component').then(
        (m) => m.DoctorRegisterComponent
      ),
  },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'dashboards/admin-dashboard',
    loadComponent: () =>
      import('./dashboards/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [AdminGuard],
  },
  {
    path: 'dashboards/patient-dashboard',
    loadComponent: () =>
      import('./dashboards/patient-dashboard/patient-dashboard.component').then(
        (m) => m.PatientDashboardComponent
      ),
    canActivate: [PatientGuard],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () =>
          import(
            './dashboards/patient-dashboard/profile/profile.component'
          ).then((m) => m.PatientProfileComponent),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import(
            './dashboards/patient-dashboard/appointments/appointments.component'
          ).then((m) => m.AppointmentsComponent),
      },
    ],
  },
  {
    path: 'dashboards/doctor-dashboard',
    loadComponent: () =>
      import('./dashboards/doctor-dashboard/doctor-dashboard.component').then(
        (m) => m.DoctorDashboardComponent
      ),
    canActivate: [DoctorGuard],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () =>
          import(
            './dashboards/doctor-dashboard/profile/profile.component'
          ).then((m) => m.ProfileComponent),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import(
            './dashboards/doctor-dashboard/appointments/appointments.component'
          ).then((m) => m.AppointmentsComponent),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import(
            './dashboards/doctor-dashboard/schedule/schedule.component'
          ).then((m) => m.ScheduleComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
