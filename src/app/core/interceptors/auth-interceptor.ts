import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth-service';

// URL yang tidak memerlukan token
const PUBLIC_URLS = ['/auth/login', '/auth/register', '/products', '/users'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Skip jika URL publik
  const isPublic = PUBLIC_URLS.some(url => req.url.includes(url));
  if (isPublic && req.method === 'GET') return next(req);

  const token = auth.getAccessToken();
  if (!token) return next(req);

  // Clone request dan inject Bearer token
  const authReq = req.clone({
    setHeaders: { 'Authorization': `Bearer ${token}` }
  });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Jika 401 dan bukan dari endpoint refresh itu sendiri
      if (err.status === 401 && !req.url.includes('/auth/refresh')) {
        return auth.refreshToken().pipe(
          switchMap(newToken => {
            // Retry request asli dengan token baru
            const retried = req.clone({
              setHeaders: { 'Authorization': `Bearer ${newToken}` }
            });
            return next(retried);
          }),
          catchError(refreshErr => {
            // Refresh gagal: paksa logout
            auth.logout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => err);
    })
  );
};