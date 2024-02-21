import { CurrencyPipe } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatBottomSheet, MatBottomSheetModule, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { apiExtendedReportRes } from 'src/app/core/mock-data/report.data';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { FyZeroStateComponent } from 'src/app/shared/components/fy-zero-state/fy-zero-state.component';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from 'src/app/shared/pipes/snake-case-to-space-case.pipe';
import { AddTxnToReportDialogComponent } from './add-txn-to-report-dialog.component';

describe('AddTxnToReportDialogComponent', () => {
  let component: AddTxnToReportDialogComponent;
  let fixture: ComponentFixture<AddTxnToReportDialogComponent>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let matBottomsheet: jasmine.SpyObj<MatBottomSheet>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const matBottomsheetSpy = jasmine.createSpyObj('MatBottomSheet', ['dismiss']);
    TestBed.configureTestingModule({
      declarations: [
        AddTxnToReportDialogComponent,
        FyZeroStateComponent,
        HumanizeCurrencyPipe,
        ReportState,
        SnakeCaseToSpaceCase,
      ],
      imports: [IonicModule.forRoot(), RouterTestingModule, RouterModule, MatBottomSheetModule],
      providers: [
        FyCurrencyPipe,
        CurrencyPipe,
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
        {
          provide: MatBottomSheet,
          useValue: matBottomsheetSpy,
        },
        {
          provide: MAT_BOTTOM_SHEET_DATA,
          useValue: { openReports: apiExtendedReportRes, isNewReportsFlowEnabled: true },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTxnToReportDialogComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    matBottomsheet = TestBed.inject(MatBottomSheet) as jasmine.SpyObj<MatBottomSheet>;
    currencyService.getHomeCurrency.and.returnValue(of('USD'));
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closeAddToReportModal(): should close Add To Report modal', () => {
    matBottomsheet.dismiss.and.callThrough();

    component.closeAddToReportModal();
    expect(matBottomsheet.dismiss).toHaveBeenCalledTimes(1);
  });

  it('addTransactionToReport(): should add txn to report', () => {
    matBottomsheet.dismiss.and.callThrough();

    component.addTransactionToReport(apiExtendedReportRes[0]);
    expect(matBottomsheet.dismiss).toHaveBeenCalledOnceWith({ report: apiExtendedReportRes[0] });
  });

  it('onClickCreateReportTask(): should navigate to create report page', () => {
    matBottomsheet.dismiss.and.callThrough();
    router.navigate.and.callThrough();

    component.onClickCreateReportTask();
    expect(matBottomsheet.dismiss).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_create_report']);
  });

  it('should display report information correctly', () => {
    component.openReports = [apiExtendedReportRes[0]];
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.report-list--purpose'))).toEqual('#8:  Jan 2023');
    expect(getTextContent(getElementBySelector(fixture, '.report-list--count'))).toEqual('1 Expense');
    expect(getTextContent(getElementBySelector(fixture, '.report-list--currency'))).toEqual('$');
    expect(getTextContent(getElementBySelector(fixture, '.report-list--amount'))).toEqual('116.90');
    expect(getTextContent(getElementBySelector(fixture, '.report-list--state'))).toEqual('Submitted');
  });

  it('should call addTransactionToReport() when clicked', () => {
    spyOn(component, 'addTransactionToReport');
    component.openReports = [apiExtendedReportRes[0]];

    const reportCard = getElementBySelector(fixture, '[data-testid="report"]') as HTMLElement;
    click(reportCard);
    expect(component.addTransactionToReport).toHaveBeenCalledOnceWith(apiExtendedReportRes[0]);
  });

  it('should call closeAddToReportModal() when clicked', () => {
    spyOn(component, 'closeAddToReportModal');

    const closeIcon = getElementBySelector(fixture, '.report-list--header--row-icon') as HTMLElement;
    click(closeIcon);
    expect(component.closeAddToReportModal).toHaveBeenCalledTimes(1);
  });

  it('should call onClickCreateReportTask() when clicked', () => {
    spyOn(component, 'onClickCreateReportTask');

    const addToReportButton = getElementBySelector(fixture, '[data-testid="addIcon"]') as HTMLElement;
    click(addToReportButton);
    expect(component.onClickCreateReportTask).toHaveBeenCalledTimes(1);
  });
});
