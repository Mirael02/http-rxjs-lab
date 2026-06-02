import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { DashboardService } from '../../services/dashboard';
import { Product } from '../../../../core/models/product-model';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-stock-monitor',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatListModule, MatIconModule, MatChipsModule],
  templateUrl: './stock-monitor.html'
})
export class StockMonitorComponent implements OnInit, OnDestroy {
  private dashSvc = inject(DashboardService);
  private destroy$ = new Subject<void>();

  lowStockProducts: Product[] = [];
  lastUpdated: Date | null = null;
  isFirstLoad = true;

  ngOnInit() {
    this.dashSvc.pollLowStock(this.destroy$).subscribe({
      next: products => {
        this.lowStockProducts = products;
        this.lastUpdated = new Date();
        this.isFirstLoad = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}