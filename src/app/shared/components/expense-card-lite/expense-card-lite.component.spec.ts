import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ExpenseCardLiteComponent } from './expense-card-lite.component';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { platformExpenseWithExtractedData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { ExactCurrencyPipe } from '../../pipes/exact-currency.pipe';
import { FyCurrencyPipe } from '../../pipes/fy-currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { platformPersonalCardTxnExpenseSuggestionsRes } from 'src/app/core/mock-data/personal-card-txn-expense-suggestions.data';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';

describe('ExpenseCardLiteComponent', () => {
  let expenseCardLiteComponent: ExpenseCardLiteComponent;
  let fixture: ComponentFixture<ExpenseCardLiteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseCardLiteComponent, CurrencySymbolPipe, ExactCurrencyPipe],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
      providers: [FyCurrencyPipe, CurrencyPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseCardLiteComponent);
    expenseCardLiteComponent = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(expenseCardLiteComponent).toBeTruthy();
  });

  const initialSetup = (expense: Expense) => {
    expenseCardLiteComponent.expense = expense;
    fixture.detectChanges();
  };

  describe('getReceipt():', () => {
    it('should set isReceiptPresent to true when files are present', () => {
      initialSetup(platformExpenseWithExtractedData);
      expect(expenseCardLiteComponent.isReceiptPresent).toBeTrue();
    });

    it('should set isReceiptPresent to false when no files are present', () => {
      initialSetup(platformPersonalCardTxnExpenseSuggestionsRes.data[0]);
      expect(expenseCardLiteComponent.isReceiptPresent).toBeFalse();
    });
  });

  it('should display the receipt when available', () => {
    initialSetup(platformExpenseWithExtractedData);
    const element = fixture.nativeElement;
    const receiptContainer = element.querySelector('.expenses-card--receipt-image-container');
    expect(receiptContainer).toBeTruthy();
  });

  it('should display a default icon when no receipt available', () => {
    initialSetup(platformPersonalCardTxnExpenseSuggestionsRes.data[0]);
    const element = fixture.nativeElement;
    const icon = element.querySelector('.expenses-card--receipt-icon');
    expect(icon).toBeTruthy();
  });

  it('should display "Unspecified" if purpose is not present', () => {
    initialSetup(platformExpenseWithExtractedData);
    const purpose = getElementBySelector(fixture, '.expenses-card--category');
    expect(getTextContent(purpose)).toEqual('Unspecified');
  });
});
