import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, startWith, switchMap, tap } from 'rxjs/operators';
import { NewsService } from '../../services/news-service';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-news-dashboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, 
    MatInputModule, MatSelectModule, MatButtonModule, 
    MatIconModule, MatProgressBarModule, MatChipsModule, MatListModule
  ],
  templateUrl: './news-dashboard.html',
  styleUrl: './news-dashboard.scss'
})
export class NewsDashboardComponent implements OnInit, OnDestroy {
  private newsSvc = inject(NewsService);
  private destroy$ = new Subject<void>();
  private platformId = inject(PLATFORM_ID);

  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  commentControl = new FormControl('');

  sources$ = this.newsSvc.getSources();
  breakingNews: any[] = [];
  homeCategories: any = null;
  filteredArticles: any[] = [];
  
  isLoadingSearch = false;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.newsSvc.getHomeCategories().subscribe(data => {
      this.homeCategories = data;
    });

    this.newsSvc.pollBreakingNews(this.destroy$).subscribe(news => {
      this.breakingNews = news;
    });

    combineLatest([
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(500), distinctUntilChanged()),
      this.categoryControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      filter(([search, category]) => !!search || !!category),
      tap(() => this.isLoadingSearch = true),
      switchMap(([search, category]) => this.newsSvc.getArticles(search || '', category || ''))
    ).subscribe(articles => {
      this.filteredArticles = articles;
      this.isLoadingSearch = false;
    });
  }

  submitComment() {
    if (!this.commentControl.value) return;
    
    this.newsSvc.postComment('Berita Umum', this.commentControl.value).subscribe(res => {
      alert(res.message);
      this.commentControl.reset();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
