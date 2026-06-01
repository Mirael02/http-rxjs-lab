import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'catalog',
    loadComponent: () => import('./features/catalog/pages/catalog-list/catalog-list').then(c => c.CatalogListComponent)
  },
  {
    // Rute dinamis dengan parameter :id
    path: 'catalog/:id',
    loadComponent: () => import('./features/catalog/pages/product-detail/product-detail').then(c => c.ProductDetailComponent)
  },
  { path: '', redirectTo: 'catalog', pathMatch: 'full' }
];