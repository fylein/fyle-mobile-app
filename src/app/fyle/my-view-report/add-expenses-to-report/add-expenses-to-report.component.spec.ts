import { CurrencyPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { AddExpensesToReportComponent } from './add-expenses-to-report.component';
import { expenseData } from 'src/app/core/mock-data/platform/v1/expense.data';

describe('AddExpensesToReportComponent', () => {
  let component: AddExpensesToReportComponent;
  let fixture: ComponentFixture<AddExpensesToReportComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let router: jasmine.SpyObj<Router>;

  const expense1 = expenseData;
  const expense2 = { ...expenseData, id: 'txcSFe6efB62' };
  const expense3 = { ...expenseData, id: 'txcSFe6efB63' };

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [AddExpensesToReportComponent, HumanizeCurrencyPipe],
      imports: [IonicModule.forRoot()],
      providers: [
        FyCurrencyPipe,
        CurrencyPipe,
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(AddExpensesToReportComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    currencyService.getHomeCurrency.and.returnValue(of('USD'));
    component.selectedExpenseIds = ['txCYDX0peUw5', 'txfCdl3TEZ7K'];
    component.selectedTotalAmount = 500;
    component.selectedTotalExpenses = 2;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close(): should dismiss modal', () => {
    const closeButton = getElementBySelector(fixture, '.fy-icon-close') as HTMLElement;
    click(closeButton);

    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('addExpensestoReport(): should dismiss modal with new expense data', () => {
    const addExpToReportButton = getElementBySelector(fixture, '.fy-footer-cta--primary') as HTMLElement;
    click(addExpToReportButton);

    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      selectedExpenseIds: component.selectedExpenseIds,
    });
  });

  describe('updateSelectedExpenses():', () => {
    it('should update selected expenses', () => {
      component.selectedElements = [
        { ...expense1, is_reimbursable: true },
        { ...expense2, is_reimbursable: true },
      ];
      fixture.detectChanges();

      component.updateSelectedExpenses();
      expect(component.selectedExpenseIds).toEqual([expense1.id, expense2.id]);
      expect(component.selectedTotalExpenses).toEqual(2);
      expect(component.selectedTotalAmount).toEqual(expense1.amount + expense2.amount);
    });

    it('should update selected expenses if expense is non-reimbursable', () => {
      component.selectedElements = [
        { ...expense1, is_reimbursable: true },
        { ...expense2, is_reimbursable: false },
      ];
      fixture.detectChanges();

      component.updateSelectedExpenses();
      expect(component.selectedExpenseIds).toEqual([expense1.id, expense2.id]);
      expect(component.selectedTotalExpenses).toEqual(2);
      expect(component.selectedTotalAmount).toEqual(expense1.amount);
    });
  });

  describe('toggleExpense():', () => {
    it('should toggle expenses and filter expense if already selected', () => {
      spyOn(component, 'updateSelectedExpenses');
      component.unreportedExpenses = [expense1, expense2];
      component.selectedElements = [expense1, expense2];
      fixture.detectChanges();

      component.toggleExpense(expense2);
      expect(component.selectedElements).toEqual([expense1]);
      expect(component.updateSelectedExpenses).toHaveBeenCalledTimes(1);
      expect(component.isSelectedAll).toBeFalse();
    });

    it('should toggle expenses and add expense if not selected', () => {
      spyOn(component, 'updateSelectedExpenses');
      component.unreportedExpenses = [expense1, expense2, expense3];
      component.selectedElements = [expense1, expense2];
      fixture.detectChanges();

      component.toggleExpense(expense3);
      expect(component.selectedElements).toEqual([expense1, expense2, expense3]);
      expect(component.updateSelectedExpenses).toHaveBeenCalledTimes(1);
      expect(component.isSelectedAll).toBeTrue();
    });
  });

  describe('toggleSelectAll():', () => {
    it('should select all expenses if value is true', () => {
      spyOn(component, 'updateSelectedExpenses');
      component.unreportedExpenses = [expense1, expense2];
      fixture.detectChanges();

      component.toggleSelectAll(true);
      expect(component.selectedElements).toEqual([expense1, expense2]);
      expect(component.updateSelectedExpenses).toHaveBeenCalledTimes(1);
    });

    it('should unselect and reset all selected expenses if value is false', () => {
      component.toggleSelectAll(false);

      expect(component.selectedElements).toEqual([]);
      expect(component.selectedTotalAmount).toEqual(0);
      expect(component.selectedTotalExpenses).toEqual(0);
    });
  });

  it('ionViewWillEnter():', () => {
    spyOn(component, 'updateSelectedExpenses');
    component.unreportedExpenses = [expense1, expense2];
    fixture.detectChanges();

    component.ionViewWillEnter();
    expect(component.updateSelectedExpenses).toHaveBeenCalledTimes(1);
    expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(2);
    component.homeCurrency$.subscribe((res) => {
      expect(res).toEqual('USD');
    });
    expect(component.isSelectedAll).toBeTrue();
    expect(component.selectedElements).toEqual([expense1, expense2]);
  });

  it('addNewExpense(): should navigate to add expense page', () => {
    component.reportId = 'rpFE5X1Pqi9P';
    fixture.detectChanges();

    const addNewExpenseButton = getElementBySelector(fixture, '.report-list--add-icon') as HTMLElement;
    click(addNewExpenseButton);

    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'add_edit_expense',
      { rp_id: component.reportId, remove_from_report: false, navigate_back: true },
    ]);
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('should show header if no expenses are not selected', () => {
    component.selectedElements = [];
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.report-list--title'))).toEqual('Add Expenses');
  });

  it('should show number of expenses and total amount', () => {
    component.selectedElements = [expense1, expense2];
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.add-expenses-to-report--title'))).toEqual(
      '2 Expenses - $500.00'
    );
  });

  it('should zero state message if no unreported expense exist', () => {
    component.unreportedExpenses = [];
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.add-expenses-to-report--zero-state--header'))).toEqual(
      'Looks like there are no complete expenses!'
    );
  });
});
