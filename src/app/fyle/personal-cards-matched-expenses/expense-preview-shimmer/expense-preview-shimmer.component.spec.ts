import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePreviewShimmerComponent } from './expense-preview-shimmer.component';

describe('ExpensePreviewShimmerComponent', () => {
  let expensePreviewShimmerComponent: ExpensePreviewShimmerComponent;
  let fixture: ComponentFixture<ExpensePreviewShimmerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpensePreviewShimmerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensePreviewShimmerComponent);
    expensePreviewShimmerComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(expensePreviewShimmerComponent).toBeTruthy();
  });
});
