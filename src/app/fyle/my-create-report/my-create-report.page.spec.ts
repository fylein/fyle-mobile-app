import { CurrencyPipe } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { RefinerService } from 'src/app/core/services/refiner.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { StorageService } from '../../core/services/storage.service';
import { TrackingService } from '../../core/services/tracking.service';
import { MyCreateReportPage } from './my-create-report.page';

describe('MyCreateReportPage', () => {
  let component: MyCreateReportPage;
  let fixture: ComponentFixture<MyCreateReportPage>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let reportService: jasmine.SpyObj<ReportService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let refinerService: jasmine.SpyObj<RefinerService>;

  beforeEach(waitForAsync(() => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getAllExpenses']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getMyReportsCount',
      'createDraft',
      'addTransactions',
      'create',
      'getReportPurpose',
    ]);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['createFirstReport']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const refinerServiceSpy = jasmine.createSpyObj('RefinerService', ['startSurvey']);

    TestBed.configureTestingModule({
      declarations: [MyCreateReportPage, HumanizeCurrencyPipe],
      imports: [IonicModule.forRoot(), RouterTestingModule, ReactiveFormsModule, FormsModule],
      providers: [
        FyCurrencyPipe,
        CurrencyPipe,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                txnIds: [],
              },
            },
          },
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: ReportService,
          useValue: reportServiceSpy,
        },
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: RefinerService,
          useValue: refinerServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MyCreateReportPage);
    component = fixture.componentInstance;

    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    refinerService = TestBed.inject(RefinerService) as jasmine.SpyObj<RefinerService>;

    currencyService.getHomeCurrency.and.returnValue(of('USD'));
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('detectTitleChange()', () => {
    it('should not show report name error if title exists', () => {
      component.reportTitle = '# Sept 23';
      fixture.detectChanges();

      component.detectTitleChange();
      expect(component.emptyInput).toBeFalse();
      expect(component.showReportNameError).toBeFalse();
    });

    it('should show report name error', () => {
      component.reportTitle = '';
      fixture.detectChanges();

      component.detectTitleChange();
      expect(component.emptyInput).toBeTrue();
      expect(component.showReportNameError).toBeTrue();
    });
  });

  describe('cancel():', () => {
    it('should navigate to my expenses if there are any selected txns', () => {
      component.selectedTxnIds = ['txfCdl3TEZ7K'];
      fixture.detectChanges();

      component.cancel();
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
    });

    it('should navigate to my reports if there are no selected txns', () => {
      component.selectedTxnIds = [];
      fixture.detectChanges();

      component.cancel();
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports']);
    });
  });

  xit('sendFirstReportCreated', () => {});

  xit('ctaClickedEvent', () => {});

  xit('selectExpense', () => {});

  xit('toggleSelectAll', () => {});

  xit('getVendorDetails', () => {});

  xit('getReportTitle', () => {});

  xit('toggleTransaction', () => {});

  xit('ionViewWillEnter', () => {});
});
