import { HttpInterceptorFn, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading-screen';

const SKIP_HEADER = 'X-Skip-Loading';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingSvc = inject(LoadingService);

  // Cek kalau request punya header X-Skip-Loading, kita biarkan lewat tanpa nambah loading
  if (req.headers.has(SKIP_HEADER)) {
    return next(req.clone({ headers: req.headers.delete(SKIP_HEADER) }));
  }

  loadingSvc.increment();

  return next(req).pipe(
    finalize(() => loadingSvc.decrement())
  );
};

// Helper khusus buat nanti pas butuh polling di latar belakang
export function skipLoading() {
  return { headers: new HttpHeaders({ [SKIP_HEADER]: 'true' }) };
}