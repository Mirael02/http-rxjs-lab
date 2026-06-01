import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, startWith, catchError, tap } from 'rxjs/operators';
import { ProductService } from '../../services/product';
import { Product, ProductFilter } from '../../../../core/models/product-model';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatChipsModule
  ],
  templateUrl: './catalog-list.html',
  styleUrls: ['./catalog-list.scss']
})
export class CatalogListComponent implements OnInit {
  private productSvc = inject(ProductService);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  
  categories$: Observable<any[]> = this.productSvc.categories$;
  products$!: Observable<Product[]>;
  isLoading$!: Observable<boolean>;
  
  totalItems = 0;
  pageSize = 12;
  currentPage = 0;

  private filterSubject = new BehaviorSubject<ProductFilter>({
    limit: 12,
    page: 0
  });

  ngOnInit() {
    this.setupFilters();
    this.setupDataStream();
  }

  setupFilters() {
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(500),
        distinctUntilChanged()
      ),
      this.categoryControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(([search, category]) => {
      this.currentPage = 0;
      this.filterSubject.next({
        ...this.filterSubject.value,
        search: search || undefined,
        category: category || undefined,
        page: 0
      });
    });
  }

setupDataStream() {
    const loadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = loadingSubject.asObservable();

    this.products$ = this.filterSubject.pipe(
      // Gunakan setTimeout supaya update nilainya ditunda ke siklus berikutnya
      tap(() => setTimeout(() => loadingSubject.next(true))),
      switchMap(filter => {
        return this.productSvc.getProducts(filter).pipe(
          catchError(() => of({ products: [], total: 0 }))
        );
      }),
      tap(() => {
        // Matikan loading dengan setTimeout juga
        setTimeout(() => loadingSubject.next(false));
      }),
      map(res => {
        if (!res || Array.isArray(res)) return []; 
        
        this.totalItems = res.total || 0;
        return res['products'] || [];
      })
    );
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.filterSubject.next({
      ...this.filterSubject.value,
      page: this.currentPage,
      limit: this.pageSize
    });
  }

  onDelete(product: Product) {
    const isConfirm = confirm(`Hapus produk '${product.title}'?`);
    if (!isConfirm) return;

    this.productSvc.deleteProduct(product.id).subscribe({
      next: () => {
        alert(`${product.title} berhasil dihapus.`);
        // Refresh list dengan men-trigger ulang filter subject
        this.filterSubject.next(this.filterSubject.value);
      },
      error: (err) => {
        alert('Gagal menghapus: ' + err.message);
      }
    });
  }
}