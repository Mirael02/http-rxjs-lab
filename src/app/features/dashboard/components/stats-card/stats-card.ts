import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card style="padding: 20px; display: flex; flex-direction: row; align-items: center; gap: 15px; height: 100%; box-sizing: border-box;">
      <mat-icon [color]="color" style="font-size: 40px; width: 40px; height: 40px;">{{ icon }}</mat-icon>
      <div>
        <p style="margin: 0; font-size: 14px; color: gray;">{{ label }}</p>
        <h2 style="margin: 0; font-size: 28px; line-height: 1.2;">{{ value }}</h2>
      </div>
    </mat-card>
  `
})
export class StatsCardComponent {
  @Input() icon = '';
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
}