import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { HumanizeCurrencyPipe } from '../../pipes/humanize-currency.pipe';
import { ExactCurrencyPipe } from '../../pipes/exact-currency.pipe';
import { ModalController } from '@ionic/angular';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { CreateNewReportComponent } from './create-new-report.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ExpensesCardComponent } from '../expenses-card/expenses-card.component';
import { of } from 'rxjs';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { expenseFieldsMapResponse2 } from 'src/app/core/mock-data/expense-fields-map.data';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FyCurrencyPipe } from '../../pipes/fy-currency.pipe';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { apiExpenses1, nonReimbursableExpense } from 'src/app/core/mock-data/platform/v1/expense.data';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { expectedReportsSinglePage } from 'src/app/core/mock-data/platform-report.data';

describe('CreateNewReportComponent', () => {
  let component: CreateNewReportComponent;
  let fixture: ComponentFixture<CreateNewReportComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    modalController = jasmine.createSpyObj('ModalController', ['dismiss']);
    trackingService = jasmine.createSpyObj('TrackingService', ['createReport']);
    currencyService = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    expenseFieldsService = jasmine.createSpyObj('ExpenseFieldsService', ['getAllMap']);
    spenderReportsService = jasmine.createSpyObj('SpenderReportsService', [
      'addExpenses',
      'createDraft',
      'suggestPurpose',
      'create',
    ]);
    const humanizeCurrencyPipeSpy = jasmine.createSpyObj('HumanizeCurrency', ['transform']);
    const exactCurrencyPipeSpy = jasmine.createSpyObj('ExactCurrency', ['transform']);
    const fyCurrencyPipeSpy = jasmine.createSpyObj('FyCurrencyPipe', ['transform']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [CreateNewReportComponent, HumanizeCurrencyPipe, ExactCurrencyPipe, FyCurrencyPipe],
      imports: [
        IonicModule.forRoot(),
        MatIconModule,
        MatIconTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        TranslocoModule,
      ],
      providers: [
        { provide: ModalController, useValue: modalController },
        { provide: TrackingService, useValue: trackingService },
        { provide: CurrencyService, useValue: currencyService },
        { provide: ExpenseFieldsService, useValue: expenseFieldsService },
        { provide: HumanizeCurrencyPipe, useValue: humanizeCurrencyPipeSpy },
        { provide: ExactCurrencyPipe, useValue: exactCurrencyPipeSpy },
        { provide: FyCurrencyPipe, useValue: fyCurrencyPipeSpy },
        { provide: SpenderReportsService, useValue: spenderReportsService },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'createNewReport.title': 'Create new report',
        'createNewReport.expenseSingular': 'expense',
        'createNewReport.expensePlural': 'expenses',
        'createNewReport.reportNameLabel': 'Expense report name',
        'createNewReport.reportNamePlaceholder': 'Enter expense report name',
        'createNewReport.reportNameError': 'Please enter expense report name.',
        'createNewReport.expensesHeading': 'Expenses',
        'createNewReport.selectAll': 'Select all',
        'createNewReport.savingReport': 'Saving Report',
        'createNewReport.saveAsDraft': 'Save as draft',
        'createNewReport.submittingReport': 'Submitting Report',
        'createNewReport.submitReport': 'Submit report',
        'createNewReport.draftSuccessMessage': 'Expenses added to a new report',
        'createNewReport.submitSuccessMessage': 'Expenses submitted for approval',
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
    currencyService.getHomeCurrency.and.returnValue(of(orgData1[0].currency));
    expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse2));
    spenderReportsService.createDraft.and.returnValue(of(expectedReportsSinglePage[0]));
    fixture = TestBed.createComponent(CreateNewReportComponent);
    component = fixture.componentInstance;
    component.selectedElements = apiExpenses1;
    component.selectedExpensesToReport = apiExpenses1;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getReportTitle', () => {
    it('should get the report title', () => {
      const reportName = '#1:  Jul 2021';
      component.selectedElements = apiExpenses1;
      spenderReportsService.suggestPurpose.and.returnValue(of(reportName));
      component.getReportTitle();
      fixture.detectChanges();
      expect(component.reportTitle).toEqual(reportName);
      expect(spenderReportsService.suggestPurpose).toHaveBeenCalledOnceWith(['txDDLtRaflUW', 'tx5WDG9lxBDT']);
    });

    it('should not get the report title when the element is not in the selectedElements array', () => {
      const reportName = '#1:  Jul 2021';
      component.selectedElements = [apiExpenses1[0]];
      spenderReportsService.suggestPurpose.and.returnValue(of(reportName));
      component.getReportTitle();
      fixture.detectChanges();
      expect(component.reportTitle).toEqual(reportName);
      expect(spenderReportsService.suggestPurpose).toHaveBeenCalledOnceWith(['txDDLtRaflUW']);
    });

    it('should get report title without reimbursable amount', () => {
      const reportName = '#1:  Jul 2021';
      component.selectedElements = [nonReimbursableExpense];

      spenderReportsService.suggestPurpose.and.returnValue(of(reportName));
      component.getReportTitle();
      fixture.detectChanges();
      expect(component.reportTitle).toEqual(reportName);
      expect(spenderReportsService.suggestPurpose).toHaveBeenCalledOnceWith([nonReimbursableExpense.id]);
    });
  });

  it('ionViewWillEnter: should call getReportTitle method', () => {
    spyOn(component, 'getReportTitle');
    component.ionViewWillEnter();
    expect(component.getReportTitle).toHaveBeenCalledTimes(1);
  });

  it('closeEvent(): should dismiss the model ', () => {
    component.closeEvent();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  describe('toggleSelectAll():', () => {
    it('should set report title when reportTitleInput is not dirty and txnIds length is greater than 0', () => {
      const reportTitleSpy = spyOn(component, 'getReportTitle');
      component.toggleSelectAll(true);
      expect(component.selectedElements).toEqual(component.selectedExpensesToReport);
      expect(reportTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should deselect all the expenses to be added in the report when false is passed', () => {
      const reportTitleSpy = spyOn(component, 'getReportTitle');
      component.selectedExpensesToReport = [];
      component.toggleSelectAll(false);
      expect(component.selectedElements).toEqual(component.selectedExpensesToReport);
      expect(reportTitleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('selectExpense()', () => {
    it('should add the expense to the array when if it is not already present ', fakeAsync(() => {
      const reportTitleSpy = spyOn(component, 'getReportTitle');
      component.selectedElements = [];
      component.selectExpense(apiExpenses1[0]);
      component.selectedExpensesToReport = [];
      tick(500);
      fixture.detectChanges();
      expect(reportTitleSpy).toHaveBeenCalledTimes(1);

      expect(component.isSelectedAll).toBeFalsy();
    }));

    it('should remove an expense from the selectedElements array', fakeAsync(() => {
      component.selectedElements = apiExpenses1;
      component.selectedExpensesToReport = apiExpenses1;
      const reportTitleSpy = spyOn(component, 'getReportTitle');

      component.selectExpense(apiExpenses1[0]);
      tick(500);
      fixture.detectChanges();
      expect(component.selectedElements).not.toContain(apiExpenses1[0]);
      expect(component.selectedElements.length).toBe(1);
      expect(reportTitleSpy).toHaveBeenCalledTimes(1);
      expect(component.isSelectedAll).toBeFalse();
    }));
  });

  describe('ctaClickedEvent', () => {
    it('should display error and exit if the report title is not present', () => {
      component.reportTitle = '';
      component.ctaClickedEvent('create_draft_report');
      expect(component.showReportNameError).toBeTrue();
    });

    it('should create a new draft report with the title and add transactions', fakeAsync(() => {
      component.reportTitle = '#3 : Mar 2023';
      const reportID = 'rprAfNrce73O';
      const txns = ['txDDLtRaflUW', 'tx5WDG9lxBDT'];
      const reportParam = {
        data: {
          purpose: '#3 : Mar 2023',
          source: 'MOBILE',
        },
      };
      const Expense_Count = txns.length;
      const Report_Value = 0;
      const report = expectedReportsSinglePage[0];
      spenderReportsService.createDraft.and.returnValue(of(report));
      spenderReportsService.addExpenses.and.returnValue(of(undefined));
      component.ctaClickedEvent('create_draft_report');
      fixture.detectChanges();
      tick(500);
      expect(component.saveDraftReportLoader).toBeFalse();
      expect(component.showReportNameError).toBeFalse();
      expect(trackingService.createReport).toHaveBeenCalledOnceWith({ Expense_Count, Report_Value });
      expect(spenderReportsService.createDraft).toHaveBeenCalledOnceWith(reportParam);
      expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith(reportID, txns);
      expect(component.saveDraftReportLoader).toBeFalse();
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({
        report,
        message: 'Expenses added to a new report',
      });
    }));

    it('should create a new draft report with the title and return the report of no transactions ids are present', fakeAsync(() => {
      component.selectedElements = [];
      component.reportTitle = '#3 : Mar 2023';
      const tnxs = [];
      const reportParam = {
        data: {
          purpose: '#3 : Mar 2023',
          source: 'MOBILE',
        },
      };
      const Expense_Count = tnxs.length;
      const Report_Value = 0;
      const report = expectedReportsSinglePage[0];
      spenderReportsService.createDraft.and.returnValue(of(report));
      component.ctaClickedEvent('create_draft_report');
      fixture.detectChanges();
      tick(500);
      expect(component.saveDraftReportLoader).toBeFalse();
      expect(component.showReportNameError).toBeFalse();
      expect(trackingService.createReport).toHaveBeenCalledOnceWith({ Expense_Count, Report_Value });
      expect(spenderReportsService.createDraft).toHaveBeenCalledOnceWith(reportParam);
      expect(component.saveDraftReportLoader).toBeFalse();
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({
        report,
        message: 'Expenses added to a new report',
      });
    }));

    it('should create a new report with the title and submit the report', fakeAsync(() => {
      component.reportTitle = '#3 : Mar 2023';
      const reportPurpose = {
        purpose: '#3 : Mar 2023',
        source: 'MOBILE',
      };
      const txnIds = ['txDDLtRaflUW', 'tx5WDG9lxBDT'];
      const report = expectedReportsSinglePage[0];

      spenderReportsService.create.and.returnValue(of(report));
      fixture.detectChanges();

      component.ctaClickedEvent('submit_report');
      tick(500);
      expect(component.submitReportLoader).toBeFalse();
      expect(component.showReportNameError).toBeFalse();
      expect(spenderReportsService.create).toHaveBeenCalledOnceWith(reportPurpose, txnIds);
      expect(component.submitReportLoader).toBeFalse();
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({
        report,
        message: 'Expenses submitted for approval',
      });
    }));
  });
});
