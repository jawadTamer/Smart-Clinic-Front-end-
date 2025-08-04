import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import lottie from 'lottie-web';

@Directive({
  selector: '[appLottie]',
  standalone: true,
})
export class LottieDirective implements OnInit, OnDestroy {
  @Input() lottiePath: string = '';
  @Input() lottieOptions: any = {};
  @Input() autoplay: boolean = true;
  @Input() loop: boolean = true;
  @Input() speed: number = 1;

  private animation: any;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.loadAnimation();
  }

  ngOnDestroy() {
    if (this.animation) {
      this.animation.destroy();
    }
  }

  private loadAnimation() {
    const options = {
      container: this.elementRef.nativeElement,
      renderer: 'svg',
      loop: this.loop,
      autoplay: this.autoplay,
      path: this.lottiePath,
      ...this.lottieOptions,
    };

    this.animation = lottie.loadAnimation(options);

    if (this.speed !== 1) {
      this.animation.setSpeed(this.speed);
    }
  }

  // Public methods to control animation
  play() {
    if (this.animation) {
      this.animation.play();
    }
  }

  pause() {
    if (this.animation) {
      this.animation.pause();
    }
  }

  stop() {
    if (this.animation) {
      this.animation.stop();
    }
  }

  setSpeed(speed: number) {
    if (this.animation) {
      this.animation.setSpeed(speed);
    }
  }

  goToAndPlay(value: number, isFrame?: boolean) {
    if (this.animation) {
      this.animation.goToAndPlay(value, isFrame);
    }
  }

  goToAndStop(value: number, isFrame?: boolean) {
    if (this.animation) {
      this.animation.goToAndStop(value, isFrame);
    }
  }
}
