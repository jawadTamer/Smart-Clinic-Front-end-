import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LottieLoadingDirective } from '../../directives/lottie-loading.directive';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule, LottieLoadingDirective],
  template: `
    <div class="loading-screen" *ngIf="isLoading">
      <div class="loading-content">
        <div class="animation-container">
          <div
            class="lottie-animation"
            appLottieLoading
            [animationPath]="animationPath"
          ></div>
        </div>
        <div class="loading-text">
          <h2>Smart Clinic</h2>
          <p>Loading your healthcare experience...</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./loading-screen.component.css'],
})
export class LoadingScreenComponent implements OnInit, OnDestroy {
  isLoading = false;
  animationPath = 'assets/animations/Medic.json';
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    // Show loading on initial page load
    this.isLoading = true;

    // Hide loading when page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.isLoading = false;
      }, 1000); // Minimum 1 second display
    });

    // Handle route changes
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.isLoading = true;
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          // Add a small delay to ensure smooth transition
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
