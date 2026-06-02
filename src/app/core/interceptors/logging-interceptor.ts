import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const COLORS = {
  GET: '#4CAF50',
  POST: '#2196F3',
  PUT: '#FF9800',
  PATCH: '#9C27B0',
  DELETE: '#F44336'
};

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.enableLogging) return next(req);

  const started = performance.now();
  const method = req.method;
  const url = req.urlWithParams;
  const color = COLORS[method as keyof typeof COLORS] ?? '#607D8B';

  console.group(`%c${method} %c${url}`, `color: ${color}; font-weight: bold`, 'color: #607D8B');
  if (req.body) console.log('Request Body:', req.body);
  console.groupEnd();

  let statusCode = 0;

  return next(req).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse) {
          statusCode = event.status;
        }
      },
      error: err => {
        statusCode = err.status ?? 0;
      }
    }),
    finalize(() => {
      const elapsed = (performance.now() - started).toFixed(1);
      const isOk = statusCode >= 200 && statusCode < 300;
      console.log(
        `%c${method} %c${url} - %c${statusCode} %c[${elapsed} ms]`,
        `color: ${color}; font-weight: bold`,
        'color: #607D8B',
        `color: ${isOk ? '#4CAF50' : '#F44336'}; font-weight: bold`,
        'color: #9E9E9E'
      );
    })
  );
};  