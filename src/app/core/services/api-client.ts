import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PagedResponse, UploadProgress } from '../models/api-response-model';

interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
}

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  private cleanParams(params?: RequestOptions['params']): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, value);
      }
    });
    return httpParams;
  }

  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: options?.headers,
      params: this.cleanParams(options?.params)
    });
  }

  getPaged<T>(endpoint: string, options?: RequestOptions): Observable<PagedResponse<T>> {
    return this.get<PagedResponse<T>>(endpoint, options);
  }

  post<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, options);
  }

  put<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, options);
  }

  patch<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, options);
  }

  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, options);
  }

  upload<T>(endpoint: string, file: File, options?: RequestOptions): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, {
      ...options,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<T>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const percent = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            return { type: 'progress', percent } as UploadProgress;
          case HttpEventType.Response:
            return { type: 'complete', result: event.body } as UploadProgress;
          default:
            return { type: 'progress', percent: 0 } as UploadProgress;
        }
      }),
      filter(progress => progress !== undefined)
    );
  }

  download(endpoint: string, options?: RequestOptions): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      ...options,
      responseType: 'blob'
    });
  }
}