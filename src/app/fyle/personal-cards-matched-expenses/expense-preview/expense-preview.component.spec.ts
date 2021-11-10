import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePreviewComponent } from './expense-preview.component';

describe('ExpensePreviewComponent', () => {
  let component: ExpensePreviewComponent;
  let fixture: ComponentFixture<ExpensePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpensePreviewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
