import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { FileService } from 'src/app/core/services/file.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { TrackingService } from '../../../core/services/tracking.service';
import { SnackbarPropertiesService } from '../../../core/services/snackbar-properties.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { ExpensesCardComponent } from './expenses-card.component';
import { PopoverController, ModalController, Platform } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { orgSettingsGetData } from 'src/app/core/test-data/org-settings.service.spec.data';
import { of } from 'rxjs';
import { expenseData1 } from 'src/app/core/mock-data/expense.data';
import { apiExpenseRes } from 'src/app/core/mock-data/expense.data';
import { expenseFieldsMapResponse2 } from 'src/app/core/mock-data/expense-fields-map.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { DateFormatPipe } from 'src/app/shared/pipes/date-format.pipe';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { fileObjectAdv, fileObjectData1 } from 'src/app/core/mock-data/file-object.data';
import { unflattenedTxnData } from 'src/app/core/mock-data/unflattened-txn.data';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { fileData1 } from 'src/app/core/mock-data/file.data';

const thumbnailUrlMockData1: FileObject[] = [
  {
    id: 'fiwJ0nQTBpYH',
    purpose: 'THUMBNAILx200x200',
    url: '/assets/images/add-to-list.png',
  },
];

fdescribe('ExpensesCardComponent', () => {
  let component: ExpensesCardComponent;
  let fixture: ComponentFixture<ExpensesCardComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let fileService: jasmine.SpyObj<FileService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let transactionOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let platform: jasmine.SpyObj<Platform>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;

  beforeEach(waitForAsync(() => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'getETxnUnflattened',
      'getIsDraft',
      'getIsCriticalPolicyViolated',
      'getVendorDetails',
    ]);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', [
      'getFilesWithThumbnail',
      'downloadThumbnailUrl',
      'downloadUrl',
      'getReceiptDetails',
      'readFile',
      'getImageTypeFromDataUrl',
      'getAttachmentType',
      'post',
    ]);
    fileServiceSpy.getFilesWithThumbnail.and.returnValue(of(fileObjectData1));
    fileServiceSpy.downloadThumbnailUrl.and.returnValue(of(thumbnailUrlMockData1));
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const transactionOutboxServiceSpy = jasmine.createSpyObj([
      'isDataExtractionPending',
      'isSyncInProgress',
      'fileUpload',
    ]);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['addAttachment', 'showToastMessage']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllMap']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const dateFormatPipeSpy = jasmine.createSpyObj('DateFormatPipe', ['transform']);
    const humanizeCurrencyPipeSpy = jasmine.createSpyObj('HumanizeCurrencyPipe', ['transform']);

    TestBed.configureTestingModule({
      declarations: [ExpensesCardComponent, DateFormatPipe, HumanizeCurrencyPipe],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, MatCheckboxModule, FormsModule],
      providers: [
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: OrgUserSettingsService, useValue: orgUserSettingsServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: TransactionsOutboxService, useValue: transactionOutboxServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: Platform, useValue: platformSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ExpenseFieldsService, useValue: expenseFieldsServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: DateFormatPipe, useValue: dateFormatPipeSpy },
        { provide: HumanizeCurrencyPipe, useValue: humanizeCurrencyPipeSpy },
      ],
    }).compileComponents();

    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    transactionOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;

    orgSettingsService.get.and.returnValue(of(orgSettingsGetData));
    transactionOutboxService.isSyncInProgress.and.returnValue(true);
    expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse2));
    transactionService.getVendorDetails.and.returnValue('asd');
    currencyService.getHomeCurrency.and.returnValue(of(orgData1[0].currency));
    transactionService.getIsCriticalPolicyViolated.and.returnValue(false);
    platform.is.and.returnValue(true);
    fileService.getReceiptDetails.and.returnValue(fileObjectAdv[0].type);
    transactionOutboxService.isDataExtractionPending.and.returnValue(true);
    transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
    networkService.isOnline.and.returnValue(of(true));
    transactionService.getIsDraft.and.returnValue(true);

    fixture = TestBed.createComponent(ExpensesCardComponent);
    component = fixture.componentInstance;

    component.receiptIcon = 'assets/svg/pdf.svg';
    component.isOutboxExpense = true;
    component.selectedElements = apiExpenseRes;
    component.expense = expenseData1;
    component.isConnected$ = of(true);
    component.isSycing$ = of(true);
    component.attachments = 'pdf';
    component.isPerDiem = true;
    component.receiptThumbnail = 'assets/svg/pdf.svg';

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  // xit("onGoToTransaction", () => { });
  // xit("getReceipt", () => { });
  // xit("checkIfScanIsCompleted", () => { });
  // xit("pollDataExtractionStatus", () => { });
  // xit("handleScanStatus", () => { });
  // xit("canShowPaymentModeIcon", () => { });
  // xit("setOtherData", () => { });
  // xit("onSetMultiselectMode", () => { });
  // xit("onTapTransaction", () => { });
  // xit("canAddAttachment", () => { });
  // xit("addAttachments", () => { });
  // xit("setThumbnail", () => { });
  // xit("matchReceiptWithEtxn", () => { });
  // xit("attachReceipt", () => { });
  // xit("setupNetworkWatcher", () => { });
  // xit("dismiss", () => { });
});
