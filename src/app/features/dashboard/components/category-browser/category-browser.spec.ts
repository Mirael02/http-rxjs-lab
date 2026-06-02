import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryBrowser } from './category-browser';

describe('CategoryBrowser', () => {
  let component: CategoryBrowser;
  let fixture: ComponentFixture<CategoryBrowser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryBrowser],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryBrowser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
