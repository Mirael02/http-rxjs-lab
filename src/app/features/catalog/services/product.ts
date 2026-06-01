import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../core/services/api-client';
import { Product, ProductFilter, CreateProductDto, UpdateProductDto } from '../../../core/models/product-model';
import { PagedResponse } from '../../../core/models/api-response-model';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiClientService);

  // Cache list kategori agar tidak terus-terusan nembak API
  categories$ = this.api.get<string[]>('/products/categories').pipe(
    shareReplay(1)
  );

  getProducts(filter: ProductFilter = {}): Observable<PagedResponse<Product>> {
    let endpoint = '/products';
    let params = new HttpParams();

    // Prioritaskan pencarian dulu
    if (filter.search) {
      endpoint = '/products/search';
      params = params.set('q', filter.search);
    } 
    // Kalau tidak ada pencarian, baru cek kategori
    else if (filter.category) {
      endpoint = `/products/category/${filter.category}`;
    }

    // Set pagination dan sort
    params = params
      .set('skip', ((filter.page || 0) * (filter.limit || 10)).toString())
      .set('limit', (filter.limit || 10).toString());

    if (filter.sortBy) {
      params = params
        .set('sortBy', filter.sortBy)
        .set('order', filter.order || 'asc');
    }

    return this.api.getPaged<Product>(endpoint, { params });
  }

  // Ambil detail satu produk
  getProduct(id: number): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`);
  }

  // Tambah produk baru
  createProduct(data: CreateProductDto): Observable<Product> {
    return this.api.post<Product>('/products/add', data);
  }

  // Update produk
  updateProduct(id: number, data: UpdateProductDto): Observable<Product> {
    return this.api.put<Product>(`/products/${id}`, data);
  }

  // Hapus produk
  deleteProduct(id: number): Observable<Product> {
    return this.api.delete<Product>(`/products/${id}`);
  }
}