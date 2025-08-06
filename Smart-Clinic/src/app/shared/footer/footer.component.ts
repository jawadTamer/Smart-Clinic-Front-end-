import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  quickLinks = [
    { name: 'Home', route: '/' },
    { name: 'Dashboard', route: '/dashboard' },
  ];

  services = [
    { name: 'Find Doctors', route: '/doctors' },
    { name: 'Book Appointment', route: '/appointments' },
    { name: 'Online Consultation', route: '/consultation' },
    { name: 'Emergency Care', route: '/emergency' },
  ];

  contactInfo = {
    phone: '+20 123 456 789',
    email: 'info@smartclinic.com',
    address: '123 Healthcare Street, Medical District, Cairo, Egypt',
  };
}
