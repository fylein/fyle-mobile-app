import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { HumanizeCurrencyPipe } from '../../pipes/humanize-currency.pipe';
import { ModalController } from '@ionic/angular';
import { ReportService } from 'src/app/core/services/report.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { RefinerService } from 'src/app/core/services/refiner.service';
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
import {
  apiExpenseRes,
  expenseData1,
  splitExpData,
  expenseList2,
  expenseList,
} from 'src/app/core/mock-data/expense.data';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Expense } from 'src/app/core/models/expense.model';
import { reportUnflattenedData, reportUnflattenedData2 } from 'src/app/core/mock-data/report-v1.data';

describe('CreateNewReportComponent', () => {
  let component: CreateNewReportComponent;
  let fixture: ComponentFixture<CreateNewReportComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let reportService: jasmine.SpyObj<ReportService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let refinerService: jasmine.SpyObj<RefinerService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;

  beforeEach(waitForAsync(() => {
    modalController = jasmine.createSpyObj('ModalController', ['dismiss']);
    reportService = jasmine.createSpyObj('ReportService', [
      'getReportPurpose',
      'createDraft',
      'addTransactions',
      'create',
    ]);
    trackingService = jasmine.createSpyObj('TrackingService', ['createReport']);
    refinerService = jasmine.createSpyObj('RefinerService', ['startSurvey']);
    currencyService = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    expenseFieldsService = jasmine.createSpyObj('ExpenseFieldsService', ['getAllMap']);
    const humanizeCurrencyPipeSpy = jasmine.createSpyObj('HumanizeCurrency', ['transform']);
    const fyCurrencyPipeSpy = jasmine.createSpyObj('FyCurrencyPipe', ['transform']);

    TestBed.configureTestingModule({
      declarations: [CreateNewReportComponent, HumanizeCurrencyPipe, FyCurrencyPipe],
      imports: [
        IonicModule.forRoot(),
        MatIconModule,
        MatIconTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule,
      ],
      providers: [
        { provide: ModalController, useValue: modalController },
        { provide: ReportService, useValue: reportService },
        { provide: TrackingService, useValue: trackingService },
        { provide: RefinerService, useValue: refinerService },
        { provide: CurrencyService, useValue: currencyService },
        { provide: ExpenseFieldsService, useValue: expenseFieldsService },
        { provide: HumanizeCurrencyPipe, useValue: humanizeCurrencyPipeSpy },
        { provide: FyCurrencyPipe, useValue: fyCurrencyPipeSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    refinerService = TestBed.inject(RefinerService) as jasmine.SpyObj<RefinerService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;

    currencyService.getHomeCurrency.and.returnValue(of(orgData1[0].currency));
    expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse2));
    reportService.createDraft.and.returnValue(of(reportUnflattenedData2));
    fixture = TestBed.createComponent(CreateNewReportComponent);
    component = fixture.componentInstance;
    component.selectedElements = apiExpenseRes;
    component.selectedExpensesToReport = apiExpenseRes;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getReportTitle', () => {
    it('should get the report title', () => {
      const reportName = '#1:  Jul 2021';
      component.selectedElements = apiExpenseRes;
      reportService.getReportPurpose.and.returnValue(of(reportName));
      component.getReportTitle();
      fixture.detectChanges();
      expect(component.reportTitle).toEqual(reportName);
      expect(reportService.getReportPurpose).toHaveBeenCalledOnceWith({ ids: ['tx3nHShG60zq'] });
    });

    it('should not get the report title when the element is not in the selectedElements array', () => {
      const reportName = '#1:  Jul 2021';
      component.selectedElements = expenseList;
      reportService.getReportPurpose.and.returnValue(of(reportName));
      component.getReportTitle();
      fixture.detectChanges();
      expect(component.reportTitle).toEqual(reportName);
      expect(reportService.getReportPurpose).toHaveBeenCalledOnceWith({ ids: ['txBphgnCHHeO'] });
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
      const newExpense = apiExpenseRes[0];
      component.selectExpense(newExpense);
      tick(500);
      fixture.detectChanges();
      expect(component.selectedElements.length).toBe(component.selectedExpensesToReport.length);
      expect(component.selectedElements).toContain(newExpense);
      expect(reportTitleSpy).toHaveBeenCalledTimes(1);
      expect(component.isSelectedAll).toBeTrue();
    }));

    it('should remove an expense from the selectedElements array', fakeAsync(() => {
      component.selectedElements = expenseList2;
      component.selectedExpensesToReport = expenseList2;
      const reportTitleSpy = spyOn(component, 'getReportTitle');
      const existingExpense: Expense = component.selectedElements[0];
      component.selectExpense(existingExpense);
      tick(500);
      fixture.detectChanges();
      expect(component.selectedElements).not.toContain(existingExpense);
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

    it('shoud create a new draft report with the title and add transactions', fakeAsync(() => {
      component.reportTitle = '#3 : Mar 2023';
      const reportID = 'rp5eUkeNm9wB';
      const tnxs = ['tx3nHShG60zq'];
      const reportParam = {
        purpose: '#3 : Mar 2023',
        source: 'MOBILE',
      };
      const Expense_Count = tnxs.length;
      const Report_Value = 0;
      const report = reportUnflattenedData2;
      reportService.createDraft.and.returnValue(of(reportUnflattenedData2));
      reportService.addTransactions.and.returnValue(of(expenseList2[0]));
      component.ctaClickedEvent('create_draft_report');
      fixture.detectChanges();
      tick(500);
      expect(component.saveDraftReportLoader).toBeFalse();
      expect(component.showReportNameError).toBeFalse();
      expect(trackingService.createReport).toHaveBeenCalledOnceWith({ Expense_Count, Report_Value });
      expect(reportService.createDraft).toHaveBeenCalledOnceWith(reportParam);
      expect(reportService.addTransactions).toHaveBeenCalledOnceWith(reportID, tnxs);
      expect(component.saveDraftReportLoader).toBeFalse();
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({
        report,
        message: 'Expenses added to a new report',
      });
    }));

    it('shoud create a new draft report with the title and return the report of no transactions ids are present', fakeAsync(() => {
      component.selectedElements = [];
      component.reportTitle = '#3 : Mar 2023';
      const tnxs = [];
      const reportParam = {
        purpose: '#3 : Mar 2023',
        source: 'MOBILE',
      };
      const Expense_Count = tnxs.length;
      const Report_Value = 0;
      const report = reportUnflattenedData2;
      reportService.createDraft.and.returnValue(of(reportUnflattenedData2));
      component.ctaClickedEvent('create_draft_report');
      fixture.detectChanges();
      tick(500);
      expect(component.saveDraftReportLoader).toBeFalse();
      expect(component.showReportNameError).toBeFalse();
      expect(trackingService.createReport).toHaveBeenCalledOnceWith({ Expense_Count, Report_Value });
      expect(reportService.createDraft).toHaveBeenCalledOnceWith(reportParam);
      expect(component.saveDraftReportLoader).toBeFalse();
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({
        report,
        message: 'Expenses added to a new report',
      });
    }));

    it('shoud create a new report with the title and submit the report', fakeAsync(() => {
      component.reportTitle = '#3 : Mar 2023';
      const reportPurpose = {
        purpose: '#3 : Mar 2023',
        source: 'MOBILE',
      };

      const txnIds = ['tx3nHShG60zq'];
      const report = reportUnflattenedData2;
      reportService.create.and.returnValue(of(reportUnflattenedData2));
      component.ctaClickedEvent('submit_report');
      fixture.detectChanges();
      tick(500);
      expect(component.submitReportLoader).toBeFalse();
      expect(component.showReportNameError).toBeFalse();
      expect(reportService.create).toHaveBeenCalledOnceWith(reportPurpose, txnIds);
      expect(refinerService.startSurvey).toHaveBeenCalledOnceWith({ actionName: 'Submit Newly Created Report' });
      expect(component.submitReportLoader).toBeFalse();
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({
        report,
        message: 'Expenses submitted for approval',
      });
    }));
  });
});
