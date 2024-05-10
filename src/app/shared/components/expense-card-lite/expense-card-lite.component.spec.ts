import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FileService } from 'src/app/core/services/file.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ExpenseCardLiteComponent } from './expense-card-lite.component';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { of } from 'rxjs';
import { platformExpenseData, platformExpenseWithExtractedData } from 'src/app/core/mock-data/platform/v1/expense.data';

describe('ExpenseCardLiteComponent', () => {
  let expenseCardLiteComponent: ExpenseCardLiteComponent;
  let fixture: ComponentFixture<ExpenseCardLiteComponent>;
  let expensesService: jasmine.SpyObj<ExpensesService>;

  beforeEach(waitForAsync(() => {
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseById']);

    TestBed.configureTestingModule({
      declarations: [ExpenseCardLiteComponent, CurrencySymbolPipe],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
      providers: [
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
      ],
    }).compileComponents();
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;

    fixture = TestBed.createComponent(ExpenseCardLiteComponent);
    expenseCardLiteComponent = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(expenseCardLiteComponent).toBeTruthy();
  });

  const initialSetup = (expenseData) => {
    expensesService.getExpenseById.and.returnValue(of(expenseData));
    expenseCardLiteComponent.expense = { id: 'txn1234' };
    fixture.detectChanges();
  };

  describe('getReceipt():', () => {
    it('should set isReceiptPresent to true when files are present', () => {
      initialSetup(platformExpenseWithExtractedData);
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith('txn1234');
      expect(expenseCardLiteComponent.isReceiptPresent).toBeTrue();
    });

    it('should set isReceiptPresent to false when no files are present', () => {
      initialSetup(platformExpenseData);
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith('txn1234');
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
    initialSetup(platformExpenseData);
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
