import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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

import { of } from 'rxjs';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { expenseFieldsMapResponse2 } from 'src/app/core/mock-data/expense-fields-map.data';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FyCurrencyPipe } from '../../pipes/fy-currency.pipe';
import { apiExpenseRes } from 'src/app/core/mock-data/expense.data';

fdescribe('CreateNewReportComponent', () => {
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
    }).compileComponents();

    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    refinerService = TestBed.inject(RefinerService) as jasmine.SpyObj<RefinerService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;

    currencyService.getHomeCurrency.and.returnValue(of(orgData1[0].currency));
    expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse2));

    fixture = TestBed.createComponent(CreateNewReportComponent);
    component = fixture.componentInstance;
    component.selectedExpensesToReport = apiExpenseRes;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('getReportTitle', () => {});
  xit('ionViewWillEnter', () => {});
  xit('selectExpense', () => {});
  xit('toggleSelectAll', () => {});
  xit('closeEvent', () => {});
  xit('ctaClickedEvent', () => {});
});
