import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    // Auto-retry untuk error jaringan atau server sibuk
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, count) => {
        const isRetryable = error.status === 0 || error.status === 503;
        if (!isRetryable) throw error;
        console.warn(`Retry ${count}/2 untuk ${req.url}...`);
        return timer(1000 * count);
      }
    }),
    catchError((err: HttpErrorResponse) => {
      const message = extractErrorMessage(err);
      
      switch (err.status) {
        case 0:
          snackBar.open('Tidak ada koneksi internet. Periksa jaringan Anda.', 'Coba Lagi', { duration: 4000 });
          break;
        case 401:
          snackBar.open('Sesi berakhir. Silakan login kembali.', 'OK', { duration: 4000 });
          router.navigate(['/login'], { queryParams: { reason: 'session_expired' } });
          break;
        case 403:
          snackBar.open('Akses ditolak. Anda tidak memiliki izin.', 'OK', { duration: 4000 });
          router.navigate(['/forbidden']);
          break;
        case 422:
          snackBar.open(`Data tidak valid: ${message}`, 'Tutup', { duration: 5000 });
          break;
        case 429:
          snackBar.open('Terlalu banyak permintaan. Tunggu sebentar.', 'OK', { duration: 5000 });
          break;
        case 500:
        case 502:
        case 503:
          snackBar.open(`Server bermasalah (${err.status}). Tim kami sedang menangani.`, 'Tutup', { duration: 6000 });
          break;
      }
      return throwError(() => new Error(message));
    })
  );
};

function extractErrorMessage(err: HttpErrorResponse): string {
  if (err.error?.message) return err.error.message;
  if (err.error?.errors?.join) return err.error.errors.join(', ');
  if (typeof err.error === 'string') return err.error;
  if (err.status === 0) return 'Tidak ada koneksi internet';
  return err.message || `HTTP Error ${err.status}`;
}