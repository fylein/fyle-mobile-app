import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { ReviewSplitExpenseComponent } from './review-split-expense.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { expenseData } from 'src/app/core/mock-data/platform/v1/expense.data';

describe('ReviewSplitExpenseComponent', () => {
  let component: ReviewSplitExpenseComponent;
  let fixture: ComponentFixture<ReviewSplitExpenseComponent>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [ReviewSplitExpenseComponent],
      providers: [{ provide: ModalController, useValue: modalSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewSplitExpenseComponent);
    component = fixture.componentInstance;
    modalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with split expenses input', () => {
    const mockExpenses = [expenseData];
    component.splitExpenses = mockExpenses;
    fixture.detectChanges();

    expect(component.splitExpenses).toEqual(mockExpenses);
  });

  it('should handle empty split expenses array', () => {
    component.splitExpenses = [];
    fixture.detectChanges();

    expect(component.splitExpenses).toEqual([]);
  });

  it('goToExpense(): should call modalController.dismiss with correct params on goToTransaction', () => {
    const event = { expense: expenseData, expenseIndex: 0 };

    component.goToExpense(event);

    expect(modalControllerSpy.dismiss).toHaveBeenCalledWith({
      dismissed: true,
      action: 'navigate',
      expense: expenseData,
    });
  });

  it('close(): should call modalController.dismiss with correct params on close', () => {
    component.close();

    expect(modalControllerSpy.dismiss).toHaveBeenCalledWith({
      dismissed: true,
      action: 'close',
    });
  });
});
