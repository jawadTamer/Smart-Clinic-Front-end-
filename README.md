# 🏥 Smart Clinic - Healthcare Management System (Frontend)

Smart Clinic is a modern healthcare management system designed to connect patients, doctors, and administrators through an intuitive and powerful Angular-based web platform. This repository includes the frontend built with Angular 19 and integrated with a Django REST API backend.

---

## 🚀 Tech Stack

### 🔧 Frontend
- **Framework:** Angular 19.2 (Standalone Components)
- **UI Library:** Angular Material 19.2.19
- **Styling:**
  - Bootstrap 5.3.7
  - Font Awesome 7.0.0
  - Custom CSS (CSS Grid & Flexbox)
- **Animations:**
  - Angular Animations
  - Lottie-web 5.13.0 (for interactive illustrations)
- **State Management:** RxJS 7.8.0 with `BehaviorSubject`
- **Notifications:** SweetAlert2 11.22.2
- **HTTP Client:** Angular `HttpClient` with JWT Authentication
- **Routing:** Angular Router with role-based route guards
- **Forms:** Reactive Forms with custom validation

---

## 🔗 Backend API Integration
- **API Source:** Django REST Framework (DRF)
- **Authentication:** JWT Token-based
- **File Upload:** Multipart Form Data
- **Pagination:** Server-side with recursive fetching

---

## 🔐 Authentication & Authorization

### User Registration
- Multi-step forms for Doctors & Patients
- Role-based dynamic form fields
- Profile picture upload
- Email & username uniqueness validation
- Password confirmation and strength validator

### User Login
- JWT-based secure login
- Role-based dashboard redirection
- Session persistence
- Auto logout on token expiration

### Route Guards
- Role-based route guards (`Admin`, `Doctor`, `Patient`)
- Unauthorized access redirection
- Login enforcement for protected pages

---

## 🏠 Public Pages

### Home Page
- Responsive hero carousel
- Featured doctors (paginated)
- Clinics listing with pagination
- Specialty filtering
- Search and filter functions

### Doctor Details
- Profile with qualifications and experience
- Book appointment functionality
- Clinic info and contact
- Schedule availability

### Clinic Details
- Overview with doctor list
- Contact and location info
- Services & operating hours

---

## 👨‍⚕️ Doctor Features

### 📊 Doctor Dashboard
- Manage profile (bio, contact, credentials)
- View upcoming appointments
- Confirm, cancel, or complete appointments
- View patient medical history & emergency contacts
- Filter/search appointments
- Visual appointment status indicators

### 📅 Schedule Management
- **Recurring Weekly Schedules**
  - Define daily availability
  - Start/end time
  - Availability status & notes
- **Specific Date Schedules**
  - Custom one-time time slots
  - Date picker with validation
- Full CRUD operations
- Conflict checks & validation
- Grouped display (Recurring vs Specific)

---

## 🙋‍♀️ Patient Features

### 📱 Patient Dashboard
- Edit personal info (name, email, phone)
- Medical history tracking
- Allergies & blood type
- Emergency contact details
- Profile picture upload

### 📅 Appointment Management
- View personal appointments
- Doctor and clinic info display
- Appointment status tracking (pending, confirmed, etc.)
- History of past appointments

### 🏥 Services
- Book appointments with doctor & time slot
- Appointment confirmation
- Access medical records and personal health data

---

## 🛡️ Security & Data Protection
- JWT Token Authentication
- Secure password hashing
- Session management with auto logout
- Route protection (role-based)
- Input sanitization and error validation (client & server)

---

## 🎨 User Experience
- Fully responsive UI (Mobile-first)
- Touch-friendly components
- Lottie animations & SweetAlert2
- Smooth navigation and transitions
- Dynamic content loading with spinners
- Status indicators and visual feedback

---

## 📊 Data Handling
- Server-side pagination
- Real-time filtering & sorting
- RxJS `BehaviorSubject` state management
- TypeScript interfaces for type safety
- Error handling and fallback strategies

---

## 🧱 Component Architecture
- **Standalone Components** for scalability
- Modular structure
- Shared components library
- Well-separated concerns & service-based architecture

---

## 📂 Project Structure (Simplified)
```bash
src/
│
├── app/
│   ├── auth/              # Login & Registration (Doctor & Patient)
│   ├── core/              # Services (auth, http, interceptors)
│   ├── shared/            # Shared modules/components (buttons, modals)
│   ├── admin/             # Admin Dashboard components
│   ├── doctor/            # Doctor Dashboard, Schedule, Appointments
│   ├── patient/           # Patient Dashboard, Bookings, Medical Info
│   ├── public/            # Home, Doctor Detail, Clinic Detail
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   └── app.module.ts
│
├── assets/
│   ├── animations/        # Lottie JSON animations
│   └── images/
│
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```
📬 Contact
For support or questions, feel free to contact the project maintainer:

Name: Jawad Tamer Hanafy

Email: jawadtamer97@gmail.com
