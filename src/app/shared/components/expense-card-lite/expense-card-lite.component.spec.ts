import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCardLiteComponent } from './expense-card-lite.component';

describe('ExpenseCardLiteComponent', () => {
  let component: ExpenseCardLiteComponent;
  let fixture: ComponentFixture<ExpenseCardLiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpenseCardLiteComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseCardLiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
