import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExpenseSkeletonLoaderComponent } from './view-expense-skeleton-loader.component';

describe('ViewExpenseSkeletonLoaderComponent', () => {
  let component: ViewExpenseSkeletonLoaderComponent;
  let fixture: ComponentFixture<ViewExpenseSkeletonLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewExpenseSkeletonLoaderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewExpenseSkeletonLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an array of length 7 to set default skeleton rows', () => {
    expect(component.rows.length).toEqual(7);
  });
});
