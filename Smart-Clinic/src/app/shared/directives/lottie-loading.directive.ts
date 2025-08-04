import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import lottie from 'lottie-web';

@Directive({
  selector: '[appLottieLoading]',
  standalone: true,
})
export class LottieLoadingDirective implements OnInit, OnDestroy {
  @Input() animationPath: string = '';
  private animation: any;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.loadAnimation();
  }

  ngOnDestroy() {
    if (this.animation) {
      this.animation.destroy();
    }
  }

  private loadAnimation() {
    const path =
      this.animationPath ||
      this.el.nativeElement.getAttribute('data-animation-path');

    if (path) {
      this.animation = lottie.loadAnimation({
        container: this.el.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: path,
      });
    }
  }
}
