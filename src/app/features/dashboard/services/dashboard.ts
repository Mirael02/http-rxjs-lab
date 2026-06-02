import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of, timer } from 'rxjs';
import { map, switchMap, shareReplay, catchError, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ApiClientService } from '../../../core/services/api-client';
import { Product } from '../../../core/models/product-model';
import { skipLoading } from '../../../core/interceptors/loading-interceptor';

export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalCarts: number;
  lowStockItems: Product[];
  topRatedItems: Product[];
  categoryCount: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiClientService);
  private categories$?: Observable<string[]>;

  // forkJoin: Request data secara paralel dalam satu aliran
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      allProducts: this.api.getPaged<any>('/products', { params: { limit: 100, sortBy: 'stock', order: 'asc' } }),
      users: this.api.getPaged<any>('/users', { params: { limit: 1 } }).pipe(catchError(() => of({ total: 0 } as any))),
      carts: this.api.getPaged<any>('/carts', { params: { limit: 1 } }).pipe(catchError(() => of({ total: 0 } as any))),
      categories: this.api.get<any[]>('/products/categories').pipe(catchError(() => of([]))),
      topRated: this.api.getPaged<any>('/products', { params: { limit: 5, sortBy: 'rating', order: 'desc' } })
    }).pipe(
      map(({ allProducts, users, carts, categories, topRated }) => ({
        totalProducts: allProducts.total,
        totalUsers: users.total,
        totalCarts: carts.total,
        lowStockItems: (allProducts['products'] || []).filter((p: Product) => p.stock < 10),
        topRatedItems: topRated['products'] || [],
        categoryCount: Array.isArray(categories) ? categories.length : 0
      }))
    );
  }

  // shareReplay: Cache data kategori supaya tidak melakukan HTTP request berulang kali
  getCategories(): Observable<string[]> {
    if (!this.categories$) {
      this.categories$ = this.api.get<any[]>('/products/categories').pipe(
        map(cats => cats.map(c => typeof c === 'string' ? c : c.slug)),
        shareReplay(1),
        catchError(() => of([]))
      );
    }
    return this.categories$;
  }

  // Produk per kategori untuk dropdown reaktif
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.api.getPaged<any>(`/products/category/${category}`, { params: { limit: 8 } }).pipe(
      map(r => r['products'] || []),
      catchError(() => of([]))
    );
  }

  // Polling: Monitor produk dengan stok rendah secara background setiap 30 detik
  pollLowStock(destroy$: Observable<any>): Observable<Product[]> {
    return timer(0, 30000).pipe(
      switchMap(() => 
        this.api.getPaged<any>('/products', { 
          params: { limit: 20, sortBy: 'stock', order: 'asc' },
          headers: skipLoading().headers // Menggunakan helper skipLoading agar loading bar tidak muncul
        }).pipe(
          map(r => (r['products'] || []).filter((p: Product) => p.stock < 10)),
          catchError(() => of([]))
        )
      ),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      takeUntil(destroy$)
    );
  }
}