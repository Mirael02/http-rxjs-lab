import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { startWith, switchMap, tap, catchError } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard';
import { Product } from '../../../../core/models/product-model';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-category-browser',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatSelectModule, 
    MatProgressBarModule, MatChipsModule
  ],
  templateUrl: './category-browser.html'
})
export class CategoryBrowserComponent implements OnInit {
  private dashSvc = inject(DashboardService);
  private destroyRef = inject(DestroyRef);

  categoryControl = new FormControl<string>('');
  categories$ = this.dashSvc.getCategories();
  
  products: Product[] = [];
  isLoadingProducts = false;
  selectedCategory = '';

  ngOnInit() {
    this.categoryControl.valueChanges.pipe(
      startWith(''),
      tap(cat => {
        this.selectedCategory = cat || '';
        this.isLoadingProducts = !!cat;
        if (!cat) this.products = [];
      }),
      switchMap(category => {
        if (!category) return of([]);
        return this.dashSvc.getProductsByCategory(category).pipe(
          tap(() => this.isLoadingProducts = false),
          catchError(() => {
            this.isLoadingProducts = false;
            return of([]);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(products => {
      this.products = products;
    });
  }
}