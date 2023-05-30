import { CurrencyPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import {
  apiExpenseRes,
  expenseData1,
  expenseData2,
  perDiemExpenseMultipleNumDays,
} from 'src/app/core/mock-data/expense.data';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { AddExpensesToReportComponent } from './add-expenses-to-report.component';

describe('AddExpensesToReportComponent', () => {
  let component: AddExpensesToReportComponent;
  let fixture: ComponentFixture<AddExpensesToReportComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let router: jasmine.SpyObj<Router>;

  const closeExpData1 = cloneDeep(expenseData1);

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
    component.selectedTxnIds = ['txCYDX0peUw5', 'txfCdl3TEZ7K'];
    component.selectedTotalAmount = 500;
    component.selectedTotalTxns = 2;
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
      selectedTxnIds: component.selectedTxnIds,
      selectedTotalAmount: component.selectedTotalAmount,
      selectedTotalTxns: component.selectedTotalTxns,
    });
  });

  describe('updateSelectedTxns():', () => {
    it('should update selected txns', () => {
      component.selectedElements = [...apiExpenseRes, closeExpData1];
      fixture.detectChanges();

      component.updateSelectedTxns();
      expect(component.selectedTxnIds).toEqual([apiExpenseRes[0].tx_id, closeExpData1.tx_id]);
      expect(component.selectedTotalTxns).toEqual(2);
      expect(component.selectedTotalAmount).toEqual(959);
    });

    it('should update selected txns expense is non-reimbursable', () => {
      component.selectedElements = [...apiExpenseRes, { ...closeExpData1, tx_skip_reimbursement: true }];
      fixture.detectChanges();

      component.updateSelectedTxns();
      expect(component.selectedTxnIds).toEqual([apiExpenseRes[0].tx_id, closeExpData1.tx_id]);
      expect(component.selectedTotalTxns).toEqual(2);
      expect(component.selectedTotalAmount).toEqual(3);
    });
  });

  describe('toggleTransaction():', () => {
    it('should toggle transactions and filter txn if already selected', () => {
      spyOn(component, 'updateSelectedTxns');
      component.selectedElements = [...apiExpenseRes, closeExpData1];
      component.unReportedEtxns = [perDiemExpenseMultipleNumDays];
      fixture.detectChanges();

      component.toggleTransaction(expenseData2);
      expect(component.selectedElements).toEqual([...apiExpenseRes]);
      expect(component.updateSelectedTxns).toHaveBeenCalledTimes(1);
      expect(component.isSelectedAll).toBeTrue();
    });

    it('should toggle transactions and add txn if not selected', () => {
      spyOn(component, 'updateSelectedTxns');
      component.selectedElements = [...apiExpenseRes];
      component.unReportedEtxns = [perDiemExpenseMultipleNumDays];
      fixture.detectChanges();

      component.toggleTransaction(closeExpData1);
      expect(component.selectedElements).toEqual([...apiExpenseRes, closeExpData1]);
      expect(component.updateSelectedTxns).toHaveBeenCalledTimes(1);
      expect(component.isSelectedAll).toBeFalse();
    });
  });

  describe('toggleSelectAll():', () => {
    it('should select all txns if value is true', () => {
      spyOn(component, 'updateSelectedTxns');
      component.unReportedEtxns = [closeExpData1];
      fixture.detectChanges();

      component.toggleSelectAll(true);
      expect(component.selectedElements).toEqual([closeExpData1]);
      expect(component.updateSelectedTxns).toHaveBeenCalledTimes(1);
    });

    it('should unselect and reset all selected txns if value is false', () => {
      component.toggleSelectAll(false);

      expect(component.selectedElements).toEqual([]);
      expect(component.selectedTotalAmount).toEqual(0);
      expect(component.selectedTotalTxns).toEqual(0);
    });
  });

  it('ionViewWillEnter():', () => {
    spyOn(component, 'updateSelectedTxns');
    component.unReportedEtxns = [...apiExpenseRes, closeExpData1];
    fixture.detectChanges();

    component.ionViewWillEnter();
    expect(component.updateSelectedTxns).toHaveBeenCalledTimes(1);
    expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(2);
    component.homeCurrency$.subscribe((res) => {
      expect(res).toEqual('USD');
    });
    expect(component.isSelectedAll).toBeTrue();
    expect(component.selectedElements).toEqual([...apiExpenseRes, closeExpData1]);
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

  it('should show header if no txns are not selected', () => {
    component.selectedElements = [];
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.report-list--title'))).toEqual('Add Expenses');
  });

  it('should show number of expenses and total amount', () => {
    component.selectedElements = [...apiExpenseRes, closeExpData1];
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.add-expenses-to-report--title'))).toEqual(
      '2 Expenses - $500.00'
    );
  });

  it('should zero state message if no unreported expense exist', () => {
    component.unReportedEtxns = [];
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.add-expenses-to-report--zero-state--header'))).toEqual(
      'Looks like there are no complete expenses!'
    );
  });
});
