import { CurrencyPipe } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatBottomSheet, MatBottomSheetModule, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { FyZeroStateComponent } from 'src/app/shared/components/fy-zero-state/fy-zero-state.component';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from 'src/app/shared/pipes/snake-case-to-space-case.pipe';
import { AddTxnToReportDialogComponent } from './add-txn-to-report-dialog.component';
import { expectedReportsSinglePage } from 'src/app/core/mock-data/platform-report.data';
import { ExactCurrencyPipe } from 'src/app/shared/pipes/exact-currency.pipe';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';

describe('AddTxnToReportDialogComponent', () => {
  let component: AddTxnToReportDialogComponent;
  let fixture: ComponentFixture<AddTxnToReportDialogComponent>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let matBottomsheet: jasmine.SpyObj<MatBottomSheet>;
  let router: jasmine.SpyObj<Router>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const matBottomsheetSpy = jasmine.createSpyObj('MatBottomSheet', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });

    // Mock the translate method
    translocoServiceSpy.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'pipes.reportState.draft': 'Draft',
        'addTxnToReportDialog.title': 'Add to report',
        'addTxnToReportDialog.expense': 'Expense',
        'addTxnToReportDialog.expenses': 'Expenses',
        'addTxnToReportDialog.noReports': 'You have no reports right now',
        'addTxnToReportDialog.createDraftReportCta':
          'To create a draft report please click on <ion-icon class="report-list--zero-state__icon" slot="icon-only" src="../../../../../assets/svg/plus-square.svg"></ion-icon>',
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

    TestBed.configureTestingModule({
      declarations: [
        AddTxnToReportDialogComponent,
        FyZeroStateComponent,
        HumanizeCurrencyPipe,
        ExactCurrencyPipe,
        ReportState,
        SnakeCaseToSpaceCase,
      ],
      imports: [IonicModule.forRoot(), RouterTestingModule, RouterModule, MatBottomSheetModule, TranslocoModule],
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
          useValue: { openReports: expectedReportsSinglePage, isNewReportsFlowEnabled: true },
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTxnToReportDialogComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    matBottomsheet = TestBed.inject(MatBottomSheet) as jasmine.SpyObj<MatBottomSheet>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
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

    component.addTransactionToReport(expectedReportsSinglePage[0]);
    expect(matBottomsheet.dismiss).toHaveBeenCalledOnceWith({ report: expectedReportsSinglePage[0] });
  });

  it('onClickCreateReportTask(): should navigate to create report page', () => {
    matBottomsheet.dismiss.and.callThrough();
    router.navigate.and.callThrough();

    component.onClickCreateReportTask();
    expect(matBottomsheet.dismiss).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_create_report']);
  });

  it('should display report information correctly', () => {
    component.openReports = [expectedReportsSinglePage[0]];
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.report-list--purpose'))).toEqual('#8:  Jan 2023');
    expect(getTextContent(getElementBySelector(fixture, '.report-list--count'))).toEqual('0 Expense');
    expect(getTextContent(getElementBySelector(fixture, '.report-list--currency'))).toEqual('$');
    expect(getTextContent(getElementBySelector(fixture, '.report-list--amount'))).toEqual('100.00');
    expect(getTextContent(getElementBySelector(fixture, '.report-list--state'))).toEqual('Draft');
  });

  it('should call addTransactionToReport() when clicked', () => {
    spyOn(component, 'addTransactionToReport');
    component.openReports = [expectedReportsSinglePage];

    const reportCard = getElementBySelector(fixture, '[data-testid="report"]') as HTMLElement;
    click(reportCard);
    expect(component.addTransactionToReport).toHaveBeenCalledOnceWith(expectedReportsSinglePage[0]);
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
