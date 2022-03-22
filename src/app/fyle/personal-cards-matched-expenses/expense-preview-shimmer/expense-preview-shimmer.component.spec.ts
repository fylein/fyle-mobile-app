import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePreviewShimmerComponent } from './expense-preview-shimmer.component';

describe('ExpensePreviewShimmerComponent', () => {
  let component: ExpensePreviewShimmerComponent;
  let fixture: ComponentFixture<ExpensePreviewShimmerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpensePreviewShimmerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensePreviewShimmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
