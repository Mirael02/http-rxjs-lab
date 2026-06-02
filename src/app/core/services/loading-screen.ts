import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeCount = 0;
  private loading$ = new BehaviorSubject<boolean>(false);

  // Observable publik yang nanti di-subscribe oleh komponen Loading Bar
  readonly isLoading = this.loading$.pipe(distinctUntilChanged());

  increment() {
    this.activeCount++;
    if (this.activeCount === 1) this.loading$.next(true);
  }

  decrement() {
    this.activeCount = Math.max(0, this.activeCount - 1);
    if (this.activeCount === 0) this.loading$.next(false);
  }

  reset() {
    this.activeCount = 0;
    this.loading$.next(false);
  }
}