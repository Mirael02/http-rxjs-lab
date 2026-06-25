import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, EMPTY, of } from 'rxjs';
import { switchMap, tap, catchError, map, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../services/product';
import { Product } from '../../../../core/models/product-model';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productSvc = inject(ProductService);

  isLoading = false;
  errorMsg: string | null = null;
  selectedImageIndex = 0;

  vm$ = this.route.paramMap.pipe(
    map(params => Number(params.get('id'))),
    distinctUntilChanged(),
    tap(() => {
      this.isLoading = true;
      this.errorMsg = null;
      this.selectedImageIndex = 0;
    }),
    switchMap(id => this.productSvc.getProduct(id).pipe(
      switchMap(product => {
        return this.productSvc.getProducts({ category: product.category, limit: 5 }).pipe(
          map(res => {
            const related = (res.products || []).filter((p: Product) => p.id !== id).slice(0, 4);
            return { product, related };
          }),
          catchError(() => of({ product, related: [] }))
        );
      }),
      tap(() => this.isLoading = false),
      catchError(err => {
        this.errorMsg = err.message || 'Gagal memuat produk';
        this.isLoading = false;
        return EMPTY;
      })
    ))
  );

  selectImage(i: number) {
    this.selectedImageIndex = i;
  }

  addToCart(product: Product) {
    alert(`Ditambahkan ke keranjang: ${product.title}`);
  }

  goBack() {
    this.router.navigate(['/catalog']);
  }
}
