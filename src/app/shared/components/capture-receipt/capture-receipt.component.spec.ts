import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Router } from '@angular/router';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { NetworkService } from 'src/app/core/services/network.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OrgService } from 'src/app/core/services/org.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CaptureReceiptComponent } from './capture-receipt.component';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { MatSnackBar } from '@angular/material/snack-bar';

xdescribe('CaptureReceiptComponent', () => {
  let component: CaptureReceiptComponent;
  let fixture: ComponentFixture<CaptureReceiptComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let router: jasmine.SpyObj<Router>;
  let navController: jasmine.SpyObj<NavController>;
  let transactionsOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
  let imagePicker: jasmine.SpyObj<ImagePicker>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let orgService: jasmine.SpyObj<OrgService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'flashModeSet',
      'showToastMessage',
      'switchedToInstafyleBulkMode',
      'switchedToInstafyleSingleMode',
      'captureSingleReceiptTime',
      'instafyleGalleryUploadOpened',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['back']);
    const transactionsOutboxServiceSpy = jasmine.createSpyObj('TransactionOutboxService', [
      'addEntry',
      'incrementSingleCaptureCount',
      'singleCaptureCount',
    ]);
    TestBed.configureTestingModule({
      declarations: [CaptureReceiptComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(CaptureReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('setupNetworkWatcher', () => {});

  xit('addMultipleExpensesToQueue', () => {});

  xit('addExpenseToQueue', () => {});

  xit('onDismissCameraPreview', () => {});

  xit('onToggleFlashMode', () => {});

  xit('showBulkModeToastMessage', () => {});

  xit('onSwitchMode', () => {});

  xit('navigateToExpenseForm', () => {});

  xit('addPerformanceTrackers', () => {});

  xit('openReceiptPreviewModal', () => {});

  xit('createReceiptPreviewModal', () => {});

  xit('showReceiptPreview', () => {});

  xit('onBulkCapture', () => {});

  xit('showLimitReachedPopover', () => {});

  xit('onCaptureReceipt', () => {});

  xit('setupPermissionDeniedPopover', () => {});

  xit('showPermissionDeniedPopover', () => {});

  xit('onGalleryUpload', () => {});

  xit('setUpAndStartCamera', () => {});

  xit('stopCamera', () => {});
});
