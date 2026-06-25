import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.scss'
})
export class StatsCardComponent {
  @Input() icon = '';
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
}
