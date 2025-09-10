import { ComponentFixture, TestBed, waitForAsync, fakeAsync } from '@angular/core/testing';
import { tick } from '@angular/core/testing';
import { ExpenseCardLiteComponent } from './expense-card-lite.component';
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
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('ExpenseCardLiteComponent', () => {
  let expenseCardLiteComponent: ExpenseCardLiteComponent;
  let fixture: ComponentFixture<ExpenseCardLiteComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        MatIconModule,
        MatIconTestingModule,
        TranslocoModule,
        ExpenseCardLiteComponent,
        CurrencySymbolPipe,
        ExactCurrencyPipe,
      ],
      providers: [
        FyCurrencyPipe,
        CurrencyPipe,
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseCardLiteComponent);
    expenseCardLiteComponent = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'expenseCardLite.unspecified': 'Unspecified',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
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

  it('should display "Unspecified" if purpose is not present', fakeAsync(() => {
    initialSetup(platformExpenseWithExtractedData);
    tick();
    fixture.detectChanges();
    const purpose = getElementBySelector(fixture, '.expenses-card--category');
    expect(getTextContent(purpose)).toEqual('Unspecified');
  }));
});
