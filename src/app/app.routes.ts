import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(c => c.DashboardComponent)
  },
  {
    path: 'catalog',
    loadComponent: () => import('./features/catalog/pages/catalog-list/catalog-list').then(c => c.CatalogListComponent)
  },
  {
    path: 'catalog/create',
    loadComponent: () => import('./features/catalog/pages/product-form/product-form').then(c => c.ProductFormComponent)
  },
  {
    path: 'catalog/:id/edit',
    loadComponent: () => import('./features/catalog/pages/product-form/product-form').then(c => c.ProductFormComponent)
  },
  {
    path: 'catalog/:id',
    loadComponent: () => import('./features/catalog/pages/product-detail/product-detail').then(c => c.ProductDetailComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];