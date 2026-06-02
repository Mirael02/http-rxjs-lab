import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading-screen';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [AsyncPipe, NgIf, MatProgressBarModule],
  template: `
    <mat-progress-bar
      *ngIf="loading.isLoading | async"
      mode="indeterminate"
      class="global-loading-bar"
      color="accent">
    </mat-progress-bar>
  `,
  styles: [`
    .global-loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1100;
    }
  `]
})
export class LoadingBarComponent {
  loading = inject(LoadingService);
}