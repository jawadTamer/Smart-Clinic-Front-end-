import { Component, Input, ViewChild } from '@angular/core';
import { LottieDirective } from '../directives/lottie.directive';

@Component({
  selector: 'app-lottie-player',
  standalone: true,
  imports: [LottieDirective],
  template: `
    <div
      #lottieContainer
      appLottie
      [lottiePath]="animationPath"
      [autoplay]="autoplay"
      [loop]="loop"
      [speed]="speed"
      [lottieOptions]="options"
      class="lottie-container"
      [style.width]="width"
      [style.height]="height"
    ></div>
  `,
  styles: [
    `
      .lottie-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class LottiePlayerComponent {
  @Input() animationPath: string = '';
  @Input() autoplay: boolean = true;
  @Input() loop: boolean = true;
  @Input() speed: number = 1;
  @Input() width: string = '100%';
  @Input() height: string = '100%';
  @Input() options: any = {};

  @ViewChild(LottieDirective) lottieDirective!: LottieDirective;

  // Public methods to control animation
  play() {
    this.lottieDirective?.play();
  }

  pause() {
    this.lottieDirective?.pause();
  }

  stop() {
    this.lottieDirective?.stop();
  }

  setSpeed(speed: number) {
    this.lottieDirective?.setSpeed(speed);
  }

  goToAndPlay(value: number, isFrame?: boolean) {
    this.lottieDirective?.goToAndPlay(value, isFrame);
  }

  goToAndStop(value: number, isFrame?: boolean) {
    this.lottieDirective?.goToAndStop(value, isFrame);
  }
}
