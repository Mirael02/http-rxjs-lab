import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, timer, of } from 'rxjs';
import { map, switchMap, shareReplay, catchError, takeUntil } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { skipLoading } from '../../../core/interceptors/loading-interceptor';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private http = inject(HttpClient);
  private baseUrl = environment.newsApiUrl;

  private sources$?: Observable<string[]>;
  private homeCategories$?: Observable<any>;

  getSources(): Observable<string[]> {
    if (!this.sources$) {
      this.sources$ = this.http.get<any>(`${this.baseUrl}/search?q=terbaru`).pipe(
        map(res => res.articles.map((a: any) => a.source.name)),
        map(sources => [...new Set(sources)] as string[]),
        shareReplay(1),
        catchError(() => of([]))
      );
    }
    return this.sources$;
  }

  getArticles(query: string, category: string): Observable<any[]> {
    let params = new HttpParams().set('max', '10');
    
    const searchQuery = query || category || 'indonesia';
    params = params.set('q', searchQuery);

    return this.http.get<any>(`${this.baseUrl}/search`, { params }).pipe(
      map(res => res.articles || []),
      catchError(() => of([]))
    );
  }

  getHomeCategories(): Observable<any> {
    if (!this.homeCategories$) {
      const getCat = (cat: string) => this.http.get<any>(`${this.baseUrl}/search?q=${cat}&max=4`).pipe(
        map(res => res.articles || []),
        catchError(() => of([]))
      );

      this.homeCategories$ = forkJoin({
        teknologi: getCat('teknologi'),
        bisnis: getCat('bisnis'),
        olahraga: getCat('olahraga')
      }).pipe(
        shareReplay(1),
        catchError(() => of({ teknologi: [], bisnis: [], olahraga: [] }))
      );
    }
    return this.homeCategories$;
  }

  pollBreakingNews(destroy$: Observable<void>): Observable<any[]> {
    return timer(0, 60000).pipe(
      switchMap(() => 
        this.http.get<any>(`${this.baseUrl}/top-headlines?category=general&max=3`, {
          headers: skipLoading().headers
        }).pipe(
          map(res => res.articles || []),
          catchError(() => of([]))
        )
      ),
      takeUntil(destroy$)
    );
  }

  postComment(articleTitle: string, comment: string): Observable<any> {
    return timer(1000).pipe(
      map(() => ({ success: true, message: 'Komentar berhasil dikirim untuk: ' + articleTitle }))
    );
  }
}
