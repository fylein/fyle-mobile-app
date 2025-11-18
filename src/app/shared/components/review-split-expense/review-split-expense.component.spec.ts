import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { ReviewSplitExpenseComponent } from './review-split-expense.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { expenseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';
import { ExpensesCardComponent } from '../expenses-card-v2/expenses-card.component';

// mock for expenses card component
@Component({
  selector: 'app-expense-card-v2',
  template: '',
})
class ExpensesCardStubComponent {}

describe('ReviewSplitExpenseComponent', () => {
  let component: ReviewSplitExpenseComponent;
  let fixture: ComponentFixture<ReviewSplitExpenseComponent>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    TestBed.configureTestingModule({
      providers: [
        { provide: ModalController, useValue: modalSpy },
      ],
      imports: [ReviewSplitExpenseComponent,
        getTranslocoTestingModule(),
        MatIconTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).overrideComponent(ReviewSplitExpenseComponent, {
      remove: {imports: [ExpensesCardComponent]},
      add: {imports: [ExpensesCardStubComponent], schemas: [CUSTOM_ELEMENTS_SCHEMA]},
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
    fixture.componentRef.setInput('splitExpenses', mockExpenses);
    fixture.detectChanges();

    expect(component.splitExpenses()).toEqual(mockExpenses);
  });

  it('should handle empty split expenses array', () => {
    fixture.componentRef.setInput('splitExpenses', []);
    fixture.detectChanges();

    expect(component.splitExpenses()).toEqual([]);
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
