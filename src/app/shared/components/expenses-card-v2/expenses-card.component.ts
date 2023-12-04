import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { isEqual, isNumber } from 'lodash';
import { Observable, concat, from, noop } from 'rxjs';
import { finalize, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { MAX_FILE_SIZE } from 'src/app/core/constants';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { ExpenseFieldsMap } from 'src/app/core/models/v1/expense-fields-map.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { FileService } from 'src/app/core/services/file.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { CameraOptionsPopupComponent } from 'src/app/fyle/add-edit-expense/camera-options-popup/camera-options-popup.component';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from '../../../core/services/snackbar-properties.service';
import { TrackingService } from '../../../core/services/tracking.service';
import { PopupAlertComponent } from '../popup-alert/popup-alert.component';
import { ExpensesService as SharedExpenseService } from 'src/app/core/services/platform/v1/shared/expenses.service';

type ReceiptDetail = {
  dataUrl: string;
  type: string;
  actionSource: string;
};
@Component({
  selector: 'app-expense-card-v2',
  templateUrl: './expenses-card.component.html',
  styleUrls: ['./expenses-card.component.scss'],
})
export class ExpensesCardComponent implements OnInit {
  @ViewChild('fileUpload') fileUpload: ElementRef;

  @Input() expense: Expense;

  @Input() previousExpenseTxnDate: string | Date;

  @Input() previousExpenseCreatedAt: string | Date;

  @Input() isSelectionModeEnabled: boolean;

  @Input() selectedElements: Expense[];

  @Input() isFirstOfflineExpense: boolean;

  @Input() attachments;

  @Input() isOutboxExpense: boolean;

  @Input() isFromReports: boolean;

  @Input() isFromViewReports: boolean;

  @Input() isFromPotentialDuplicates: boolean;

  @Input() expenseIndex: number;

  @Input() isDismissable: boolean;

  @Input() showDt = true;

  @Output() goToTransaction: EventEmitter<{ expense: Expense; expenseIndex: number }> = new EventEmitter<{
    expense: Expense;
    expenseIndex: number;
  }>();

  @Output() cardClickedForSelection: EventEmitter<Expense> = new EventEmitter<Expense>();

  @Output() setMultiselectMode: EventEmitter<Expense> = new EventEmitter<Expense>();

  @Output() dismissed: EventEmitter<Expense> = new EventEmitter<Expense>();

  @Output() showCamera = new EventEmitter<boolean>();

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

  isDraft: boolean;

  vendorDetails: string;

  constructor(
    private transactionService: TransactionService,
    private sharedExpenseService: SharedExpenseService,
    private orgUserSettingsService: OrgUserSettingsService,
    private fileService: FileService,
    private popoverController: PopoverController,
    private networkService: NetworkService,
    private transactionOutboxService: TransactionsOutboxService,
    private modalController: ModalController,
    private platform: Platform,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private trackingService: TrackingService,
    private currencyService: CurrencyService,
    private expenseFieldsService: ExpenseFieldsService,
    private orgSettingsService: OrgSettingsService
  ) {}

  get isSelected(): boolean {
    if (this.selectedElements) {
      if (this.expense.id) {
        return this.selectedElements.some((expense) => this.expense.id === expense.id);
      } else {
        return this.selectedElements.some((expense) => isEqual(this.expense, expense));
      }
    }
    return false;
  }

  onGoToTransaction(): void {
    if (!this.isSelectionModeEnabled) {
      this.goToTransaction.emit({ expense: this.expense, expenseIndex: this.expenseIndex });
    }
  }

  getReceipt(): void {
    if (this.expense?.category?.name && this.expense?.category?.name.toLowerCase() === 'mileage') {
      this.receiptIcon = 'assets/svg/fy-mileage.svg';
    } else if (this.expense?.category?.name && this.expense?.category?.name.toLowerCase() === 'per diem') {
      this.receiptIcon = 'assets/svg/fy-calendar.svg';
    } else {
      if (!this.expense.file_ids?.length) {
        this.receiptIcon = 'assets/svg/list-plus.svg';
        if (this.isFromPotentialDuplicates || this.isFromViewReports) {
          this.receiptIcon = 'assets/svg/fy-expense.svg';
        }
      } else {
        this.isReceiptPresent = true;
      }
    }
  }

  isZeroAmountPerDiem(): boolean {
    return (
      this.expense?.category?.name?.toLowerCase() === 'per diem' &&
      (this.expense.amount === 0 || this.expense.claim_amount === 0)
    );
  }

  checkIfScanIsCompleted(): boolean {
    const isPerDiem = this.isZeroAmountPerDiem();
    const hasUserManuallyEnteredData =
      isPerDiem ||
      ((this.expense.amount || this.expense.claim_amount) &&
        isNumber(this.expense.amount || this.expense.claim_amount));
    const isRequiredExtractedDataPresent = this.expense.extracted_data?.amount;

    // this is to prevent the scan failed from being shown from an indefinite amount of time.
    // also transcription kicks in within 15-24 hours, so only post that we should revert to default state
    const hasScanExpired = this.expense.created_at && dayjs(this.expense.created_at).diff(Date.now(), 'day') < 0;
    return !!(hasUserManuallyEnteredData || isRequiredExtractedDataPresent || hasScanExpired);
  }

  /**
   * This is to check if the expense is currently in data extraction queue. If the item is not in data extraction queue anymore,
   * a callback method is fired.
   *
   * The reasoning behind this is to check if scanning expenses have finished scanning
   *
   * @param callback Callback method to be fired when item has finished scanning
   */
  pollDataExtractionStatus(callback: Function): void {
    const that = this;
    setTimeout(() => {
      const isPresentInQueue = that.transactionOutboxService.isDataExtractionPending(that.expense.id);
      if (!isPresentInQueue) {
        callback();
      } else {
        that.pollDataExtractionStatus(callback);
      }
    }, 1000);
  }

  handleScanStatus(): void {
    const that = this;
    that.isScanInProgress = false;
    that.isScanCompleted = false;

    if (!that.isOutboxExpense) {
      that.orgUserSettingsService.get().subscribe((orgUserSettings) => {
        if (
          orgUserSettings.insta_fyle_settings.allowed &&
          orgUserSettings.insta_fyle_settings.enabled &&
          (that.homeCurrency === 'USD' || that.homeCurrency === 'INR')
        ) {
          that.isScanCompleted = that.checkIfScanIsCompleted();
          that.isScanInProgress =
            !that.isScanCompleted && that.transactionOutboxService.isDataExtractionPending(that.expense.id);
          if (that.isScanInProgress) {
            that.pollDataExtractionStatus(function () {
              that.transactionService.getETxnUnflattened(that.expense.id).subscribe((etxn) => {
                const extractedData = etxn.tx.extracted_data;
                if (!!extractedData) {
                  that.isScanCompleted = true;
                  that.isScanInProgress = false;
                  that.expense.extracted_data = extractedData;
                } else {
                  that.isScanInProgress = false;
                  that.isScanCompleted = false;
                }
              });
            });
          }
        } else {
          that.isScanCompleted = true;
          that.isScanInProgress = false;
        }
      });
    }
  }

  canShowPaymentModeIcon(): void {
    this.showPaymentModeIcon =
      this.expense.source_account?.type === AccountType.PERSONAL_CASH_ACCOUNT && this.expense.is_reimbursable;
  }

  ngOnInit(): void {
    this.setupNetworkWatcher();
    const orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));

    this.isSycing$ = this.isConnected$.pipe(
      map((isConnected) => isConnected && this.transactionOutboxService.isSyncInProgress() && this.isOutboxExpense)
    );

    this.category = this.expense?.category?.name && this.expense?.category?.name.toLowerCase();
    this.isMileageExpense = this.category === 'mileage';
    this.isPerDiem = this.category === 'per diem';

    this.isDraft = this.sharedExpenseService.isExpenseInDraft(this.expense);
    this.isPolicyViolated = this.expense.is_manually_flagged || this.expense.is_policy_flagged;
    this.isCriticalPolicyViolated = this.sharedExpenseService.isCriticalPolicyViolatedExpense(this.expense);
    this.vendorDetails = this.sharedExpenseService.getVendorDetails(this.expense);
    this.expenseFieldsService.getAllMap().subscribe((expenseFields) => {
      this.expenseFields = expenseFields;
    });

    this.currencyService
      .getHomeCurrency()
      .pipe(
        map((homeCurrency) => {
          this.homeCurrency = homeCurrency;
        })
      )
      .subscribe(noop);

    this.isProjectEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.projects && orgSettings.projects.allowed && orgSettings.projects.enabled),
      shareReplay(1)
    );

    if (!this.expense.id) {
      this.showDt = !!this.isFirstOfflineExpense;
    } else if (this.previousExpenseTxnDate || this.previousExpenseCreatedAt) {
      const currentDate = (this.expense.spent_at || this.expense.created_at).toDateString();
      const previousDate = new Date(
        (this.previousExpenseTxnDate || this.previousExpenseCreatedAt) as string
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
    if (this.expense?.source_account?.type === AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT) {
      if (this.expense?.matched_corporate_card_transaction_ids?.length > 0) {
        this.paymentModeIcon = 'fy-matched';
      } else {
        this.paymentModeIcon = 'fy-unmatched';
      }
    } else {
      if (this.expense?.is_reimbursable) {
        this.paymentModeIcon = 'fy-reimbursable';
      } else {
        this.paymentModeIcon = 'fy-non-reimbursable';
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
      !(
        this.isMileageExpense ||
        this.isPerDiem ||
        this.expense.file_ids?.length > 0 ||
        this.isFromPotentialDuplicates
      ) &&
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
      this.showSizeLimitExceededPopover();
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
          const message = 'Receipt added to Expense successfully';
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
    this.expense.file_ids = [];
    this.expense.file_ids.push(fileObj.id);
    fileObj.transaction_id = this.expense.id;
  }

  attachReceipt(receiptDetails: ReceiptDetail): void {
    this.attachmentUploadInProgress = true;
    const attachmentType = this.fileService.getAttachmentType(receiptDetails.type);

    this.inlineReceiptDataUrl = attachmentType !== 'pdf' && receiptDetails.dataUrl;
    from(this.transactionOutboxService.fileUpload(receiptDetails.dataUrl, attachmentType))
      .pipe(
        switchMap((fileObj: FileObject) => {
          this.matchReceiptWithEtxn(fileObj);
          return this.fileService.post(fileObj);
        }),
        finalize(() => {
          this.attachmentUploadInProgress = false;
        })
      )
      .subscribe(() => {
        this.isReceiptPresent = true;
      });
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = this.networkService.connectivityWatcher(new EventEmitter<boolean>());
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      startWith(true)
    );
  }

  dismiss(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.dismissed.emit(this.expense);
  }

  async showSizeLimitExceededPopover(): Promise<void> {
    const sizeLimitExceededPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Size limit exceeded',
        message: 'The uploaded file is greater than 5MB in size. Please reduce the file size and try again.',
        primaryCta: {
          text: 'OK',
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await sizeLimitExceededPopover.present();
  }
}
