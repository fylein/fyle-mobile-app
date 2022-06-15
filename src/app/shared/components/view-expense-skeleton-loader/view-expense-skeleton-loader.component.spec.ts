import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExpenseSkeletonLoaderComponent } from './view-expense-skeleton-loader.component';

xdescribe('ViewExpenseSkeletonLoaderComponent', () => {
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
});
