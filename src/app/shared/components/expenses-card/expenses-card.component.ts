import { Component, ElementRef, EventEmitter, Input, OnInit, ViewChild, inject, input, output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IonIcon, IonSpinner, ModalController, Platform, PopoverController } from '@ionic/angular/standalone';
import dayjs from 'dayjs';
import { isEqual, isNumber } from 'lodash';
import { Observable, concat, from, noop } from 'rxjs';
import { finalize, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { MAX_FILE_SIZE } from 'src/app/core/constants';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { Expense } from 'src/app/core/models/expense.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { ExpenseFieldsMap } from 'src/app/core/models/v1/expense-fields-map.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { FileService } from 'src/app/core/services/file.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { PlatformOrgSettingsService } from 'src/app/core/services/platform/v1/spender/org-settings.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { CameraOptionsPopupComponent } from 'src/app/fyle/camera-options-popup/camera-options-popup.component';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from '../../../core/services/snackbar-properties.service';
import { TrackingService } from '../../../core/services/tracking.service';
import { PopupAlertComponent } from '../popup-alert/popup-alert.component';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ReceiptDetail } from 'src/app/core/models/receipt-detail.model';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import {
  NgClass,
  NgStyle,
  NgTemplateOutlet,
  AsyncPipe,
  LowerCasePipe,
  TitleCasePipe,
  CurrencyPipe,
} from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { HumanizeCurrencyPipe } from '../../pipes/humanize-currency.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { ExpenseState } from '../../pipes/expense-state.pipe';
import { FyCurrencyPipe } from '../../pipes/fy-currency.pipe';

@Component({
  selector: 'app-expense-card',
  templateUrl: './expenses-card.component.html',
  styleUrls: ['./expenses-card.component.scss'],
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DateFormatPipe,
    ExpenseState,
    FyCurrencyPipe,
    HumanizeCurrencyPipe,
    IonIcon,
    IonSpinner,
    LowerCasePipe,
    MatCheckbox,
    MatIcon,
    NgClass,
    NgStyle,
    NgTemplateOutlet,
    TitleCasePipe,
    TranslocoPipe,
  ],
})
export class ExpensesCardV1Component implements OnInit {
  private transactionService = inject(TransactionService);

  private platformEmployeeSettingsService = inject(PlatformEmployeeSettingsService);

  private fileService = inject(FileService);

  private popoverController = inject(PopoverController);

  private networkService = inject(NetworkService);

  private transactionOutboxService = inject(TransactionsOutboxService);

  private modalController = inject(ModalController);

  private platform = inject(Platform);

  private matSnackBar = inject(MatSnackBar);

  private snackbarProperties = inject(SnackbarPropertiesService);

  private trackingService = inject(TrackingService);

  private currencyService = inject(CurrencyService);

  private expenseFieldsService = inject(ExpenseFieldsService);

  private orgSettingsService = inject(PlatformOrgSettingsService);

  private expensesService = inject(ExpensesService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('fileUpload') fileUpload: ElementRef;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() expense: Expense;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() previousExpenseTxnDate: string | Date;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() previousExpenseCreatedAt: string | Date;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isSelectionModeEnabled: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() selectedElements: Expense[];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isFirstOfflineExpense: boolean;

  readonly attachments = input(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isOutboxExpense: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isFromReports: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isFromViewReports: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isFromPotentialDuplicates: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() etxnIndex: number;

  readonly isDismissable = input<boolean>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() showDt = true;

  readonly goToTransaction = output<{
    etxn: Expense;
    etxnIndex: number;
  }>();

  readonly cardClickedForSelection = output<Expense>();

  readonly setMultiselectMode = output<Expense>();

  readonly dismissed = output<Expense>();

  readonly showCamera = output<boolean>();

  inlineReceiptDataUrl: string;

  expenseFields: Partial<ExpenseFieldsMap>;

  receiptIcon: string;

  receipt: string;

  isPolicyViolated: boolean;

  isCriticalPolicyViolated: boolean;

  homeCurrency: string;

  paymentModeIcon: string;

  isScanInProgress: boolean;

  isProjectEnabled$: Observable<boolean>;

  attachmentUploadInProgress = false;

  isReceiptPresent: boolean;

  isConnected$: Observable<boolean>;

  isSycing$: Observable<boolean>;

  category: string;

  isScanCompleted: boolean;

  imageTransperencyOverlay = 'linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45)), ';

  isMileageExpense: boolean;

  isPerDiem: boolean;

  showPaymentModeIcon: boolean;

  isIos = false;

  get isSelected(): boolean {
    if (this.selectedElements) {
      if (this.expense.tx_id) {
        return this.selectedElements.some((txn) => this.expense.tx_id === txn.tx_id);
      } else {
        return this.selectedElements.some((txn) => isEqual(this.expense, txn));
      }
    }
    return false;
  }

  onGoToTransaction(): void {
    if (!this.isSelectionModeEnabled) {
      this.goToTransaction.emit({ etxn: this.expense, etxnIndex: this.etxnIndex });
    }
  }

  getReceipt(): void {
    if (this.expense.tx_org_category && this.expense.tx_org_category?.toLowerCase() === 'mileage') {
      this.receiptIcon = 'assets/svg/mileage.svg';
    } else if (this.expense.tx_org_category && this.expense.tx_org_category?.toLowerCase() === 'per diem') {
      this.receiptIcon = 'assets/svg/calendar.svg';
    } else {
      if (!this.expense.tx_file_ids) {
        this.receiptIcon = 'assets/svg/list-plus.svg';
        if (this.isFromPotentialDuplicates || this.isFromViewReports) {
          this.receiptIcon = 'assets/svg/list.svg';
        }
      } else {
        this.isReceiptPresent = true;
      }
    }
  }

  isZeroAmountPerDiem(): boolean {
    return (
      this.expense.tx_org_category?.toLowerCase() === 'per diem' &&
      (this.expense.tx_amount === 0 || this.expense.tx_user_amount === 0)
    );
  }

  checkIfScanIsCompleted(): boolean {
    const isPerDiem = this.isZeroAmountPerDiem();
    const hasUserManuallyEnteredData =
      isPerDiem ||
      ((this.expense.tx_amount || this.expense.tx_user_amount) &&
        isNumber(this.expense.tx_amount || this.expense.tx_user_amount));
    const isRequiredExtractedDataPresent = this.expense.tx_extracted_data && this.expense.tx_extracted_data.amount;

    // this is to prevent the scan failed from being shown from an indefinite amount of time.
    // also transcription kicks in within 15-24 hours, so only post that we should revert to default state
    const hasScanExpired = this.expense.tx_created_at && dayjs(this.expense.tx_created_at).diff(Date.now(), 'day') < 0;
    return !!(hasUserManuallyEnteredData || isRequiredExtractedDataPresent || hasScanExpired);
  }

  handleScanStatus(): void {
    const that = this;
    that.isScanInProgress = false;
    that.isScanCompleted = false;

    if (!that.isOutboxExpense) {
      that.platformEmployeeSettingsService.get().subscribe((employeeSettings) => {
        if (
          employeeSettings.insta_fyle_settings.allowed &&
          employeeSettings.insta_fyle_settings.enabled &&
          (that.homeCurrency === 'USD' || that.homeCurrency === 'INR')
        ) {
          that.isScanCompleted = that.checkIfScanIsCompleted();
          that.isScanInProgress = !that.isScanCompleted && !this.expense.tx_extracted_data;
        } else {
          that.isScanCompleted = true;
          that.isScanInProgress = false;
        }
      });
    }
  }

  canShowPaymentModeIcon(): void {
    this.showPaymentModeIcon =
      this.expense.source_account_type === AccountType.PERSONAL && !this.expense.tx_skip_reimbursement;
  }

  ngOnInit(): void {
    this.setupNetworkWatcher();
    const orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));

    this.isSycing$ = this.isConnected$.pipe(
      map((isConnected) => isConnected && this.transactionOutboxService.isSyncInProgress() && this.isOutboxExpense),
    );

    this.isMileageExpense = this.expense.tx_org_category && this.expense.tx_org_category?.toLowerCase() === 'mileage';
    this.isPerDiem = this.expense.tx_org_category && this.expense.tx_org_category?.toLowerCase() === 'per diem';

    this.category = this.expense.tx_org_category?.toLowerCase();
    this.expense.isDraft = this.transactionService.getIsDraft(this.expense);
    this.expense.isPolicyViolated = this.expense.tx_policy_flag;
    this.expense.isCriticalPolicyViolated = this.transactionService.getIsCriticalPolicyViolated(this.expense);
    this.expense.vendorDetails = this.transactionService.getVendorDetails(this.expense);
    this.expenseFieldsService.getAllMap().subscribe((expenseFields) => {
      this.expenseFields = expenseFields;
    });

    this.currencyService
      .getHomeCurrency()
      .pipe(
        map((homeCurrency) => {
          this.homeCurrency = homeCurrency;
        }),
      )
      .subscribe(noop);

    this.isProjectEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.projects && orgSettings.projects.allowed && orgSettings.projects.enabled),
      shareReplay(1),
    );

    if (!this.expense.tx_id) {
      this.showDt = !!this.isFirstOfflineExpense;
    } else if (this.previousExpenseTxnDate || this.previousExpenseCreatedAt) {
      const currentDate = this.expense && new Date(this.expense.tx_txn_dt || this.expense.tx_created_at).toDateString();
      const previousDate = new Date(
        (this.previousExpenseTxnDate || this.previousExpenseCreatedAt) as string,
      ).toDateString();
      this.showDt = currentDate !== previousDate;
    }

    this.canShowPaymentModeIcon();

    this.getReceipt();

    this.handleScanStatus();

    this.setOtherData();

    this.isIos = this.platform.is('ios');
  }

  setOtherData(): void {
    if (this.expense.source_account_type === AccountType.CCC) {
      if (this.expense.tx_corporate_credit_card_expense_group_id) {
        this.paymentModeIcon = 'card';
      } else {
        this.paymentModeIcon = 'card';
      }
    } else {
      if (!this.expense.tx_skip_reimbursement) {
        this.paymentModeIcon = 'cash';
      } else {
        this.paymentModeIcon = 'cash-slash';
      }
    }
  }

  onSetMultiselectMode(): void {
    if (!this.isSelectionModeEnabled) {
      this.setMultiselectMode.emit(this.expense);
    }
  }

  onTapTransaction(): void {
    if (this.isSelectionModeEnabled) {
      this.cardClickedForSelection.emit(this.expense);
    }
  }

  canAddAttachment(): boolean {
    return (
      !this.isFromViewReports &&
      !(this.isMileageExpense || this.isPerDiem || this.expense.tx_file_ids || this.isFromPotentialDuplicates) &&
      !this.isSelectionModeEnabled
    );
  }

  async onFileUpload(nativeElement: HTMLInputElement): Promise<void> {
    const file = nativeElement.files[0];
    let receiptDetails: ReceiptDetail;
    if (file?.size < MAX_FILE_SIZE) {
      const dataUrl = await this.fileService.readFile(file);
      this.trackingService.addAttachment({ type: file.type });
      receiptDetails = {
        type: file.type,
        dataUrl,
        actionSource: 'gallery_upload',
      };
      this.attachReceipt(receiptDetails);
    } else {
      this.showSizeLimitExceededPopover(MAX_FILE_SIZE);
    }
  }

  async addAttachments(event: Event): Promise<void> {
    if (this.canAddAttachment()) {
      event.stopPropagation();

      if (this.isIos) {
        const nativeElement = this.fileUpload.nativeElement as HTMLInputElement;
        nativeElement.onchange = async (): Promise<void> => {
          await this.onFileUpload(nativeElement);
        };
        nativeElement.click();
      } else {
        const popup = await this.popoverController.create({
          component: CameraOptionsPopupComponent,
          cssClass: 'camera-options-popover',
        });

        await popup.present();

        let { data: receiptDetails } = (await popup.onWillDismiss()) as {
          data: {
            option?: string;
            type?: string;
            actionSource?: string;
            dataUrl?: string;
          };
        };

        if (receiptDetails && receiptDetails.option === 'camera') {
          const captureReceiptModal = await this.modalController.create({
            component: CaptureReceiptComponent,
            componentProps: {
              isModal: true,
              allowGalleryUploads: false,
              allowBulkFyle: false,
            },
            cssClass: 'hide-modal',
          });

          await captureReceiptModal.present();
          this.showCamera.emit(true);

          const { data } = (await captureReceiptModal.onWillDismiss()) as {
            data: {
              dataUrl: string;
            };
          };
          this.showCamera.emit(false);

          if (data && data.dataUrl) {
            receiptDetails = {
              type: this.fileService.getImageTypeFromDataUrl(data.dataUrl),
              dataUrl: data.dataUrl,
              actionSource: 'camera',
            };
          }
        }
        if (receiptDetails && receiptDetails.dataUrl) {
          this.attachReceipt(receiptDetails as ReceiptDetail);
          const message = this.translocoService.translate('expensesCard.receiptAddedSuccess');
          this.matSnackBar.openFromComponent(ToastMessageComponent, {
            ...this.snackbarProperties.setSnackbarProperties('success', { message }),
            panelClass: ['msb-success-with-camera-icon'],
          });
          this.trackingService.showToastMessage({ ToastContent: message });
        }
      }
    }
  }

  matchReceiptWithEtxn(fileObj: FileObject): void {
    this.expense.tx_file_ids = [];
    this.expense.tx_file_ids.push(fileObj.id);
    fileObj.transaction_id = this.expense.tx_id;
  }

  attachReceipt(receiptDetails: ReceiptDetail): void {
    this.attachmentUploadInProgress = true;
    const attachmentType = this.fileService.getAttachmentType(receiptDetails.type);

    this.inlineReceiptDataUrl = attachmentType !== 'pdf' && receiptDetails.dataUrl;
    from(this.transactionOutboxService.fileUpload(receiptDetails.dataUrl, attachmentType))
      .pipe(
        switchMap((fileObj: FileObject) => {
          this.matchReceiptWithEtxn(fileObj);
          return this.expensesService.attachReceiptToExpense(this.expense.tx_id, fileObj.id);
        }),
        finalize(() => {
          this.attachmentUploadInProgress = false;
        }),
      )
      .subscribe(() => {
        this.isReceiptPresent = true;
      });
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = this.networkService.connectivityWatcher(new EventEmitter<boolean>());
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      startWith(true),
    );
  }

  dismiss(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.dismissed.emit(this.expense);
  }

  async showSizeLimitExceededPopover(maxFileSize: number): Promise<void> {
    const title = this.translocoService.translate('expensesCard.sizeLimitExceeded');
    const message = this.translocoService.translate('expensesCard.fileSizeError', {
      maxFileSize: (maxFileSize / (1024 * 1024)).toFixed(0),
    });
    const sizeLimitExceededPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message,
        primaryCta: {
          text: this.translocoService.translate('expensesCard.ok'),
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await sizeLimitExceededPopover.present();
  }
}
