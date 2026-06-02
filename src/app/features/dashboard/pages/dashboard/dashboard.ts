import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { DashboardService, DashboardStats } from '../../services/dashboard';
import { StatsCardComponent } from '../../components/stats-card/stats-card';
import { CategoryBrowserComponent } from '../../components/category-browser/category-browser';
import { StockMonitorComponent } from '../../components/stock-monitor/stock-monitor';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatsCardComponent,
    CategoryBrowserComponent,
    StockMonitorComponent,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private dashSvc = inject(DashboardService);

  stats: DashboardStats | null = null;
  isLoading = true;
  error: string | null = null;

  ngOnInit() {
    this.isLoading = true;
    this.error = null;
    
    // forkJoin: semua data dashboard dimuat bersamaan
    this.dashSvc.getDashboardStats().pipe(
      finalize(() => this.isLoading = false),
      catchError(err => {
        this.error = err.message;
        return of(null);
      })
    ).subscribe(stats => {
      this.stats = stats;
    });
  }
}