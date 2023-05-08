import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { from, noop, Observable } from 'rxjs';
import { concat } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { ExpenseFieldsMap } from 'src/app/core/models/v1/expense-fields-map.model';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { concatMap, finalize, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { isNumber, reduce } from 'lodash';
import { FileService } from 'src/app/core/services/file.service';
import { PopoverController, ModalController, Platform } from '@ionic/angular';
import { CameraOptionsPopupComponent } from 'src/app/fyle/add-edit-expense/camera-options-popup/camera-options-popup.component';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { File } from 'src/app/core/models/file.model';
import { map, tap } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { NetworkService } from 'src/app/core/services/network.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import * as dayjs from 'dayjs';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { TrackingService } from '../../../core/services/tracking.service';
import { SnackbarPropertiesService } from '../../../core/services/snackbar-properties.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';

type ReceiptDetail = {
  dataUrl: string;
  type: string;
  actionSource: string;
};
@Component({
  selector: 'app-expense-card',
  templateUrl: './expenses-card.component.html',
  styleUrls: ['./expenses-card.component.scss'],
})
export class ExpensesCardComponent implements OnInit {
  @ViewChild('fileUpload') fileUpload: ElementRef;

  @Input() expense: Expense;

  @Input() previousExpenseTxnDate;

  @Input() previousExpenseCreatedAt;

  @Input() isSelectionModeEnabled: boolean;

  @Input() selectedElements: Expense[];

  @Input() isFirstOfflineExpense: boolean;

  @Input() attachments;

  @Input() isOutboxExpense: boolean;

  @Input() isFromReports: boolean;

  @Input() isFromViewReports: boolean;

  @Input() isFromPotentialDuplicates: boolean;

  @Input() etxnIndex: number;

  @Input() isDismissable: boolean;

  @Input() showDt = true;

  @Output() goToTransaction: EventEmitter<{ etxn: Expense; etxnIndex: number }> = new EventEmitter();

  @Output() cardClickedForSelection: EventEmitter<Expense> = new EventEmitter();

  @Output() setMultiselectMode: EventEmitter<Expense> = new EventEmitter();

  @Output() dismissed: EventEmitter<Expense> = new EventEmitter();

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

  receiptThumbnail: string = null;

  isConnected$: Observable<boolean>;

  isSycing$: Observable<boolean>;

  category: string;

  isScanCompleted: boolean;

  imageTransperencyOverlay = 'linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45)), ';

  isMileageExpense: boolean;

  isPerDiem: boolean;

  showPaymentModeIcon: boolean;

  isIos = false;

  constructor(
    private transactionService: TransactionService,
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

  get isSelected() {
    if (this.selectedElements) {
      if (this.expense.tx_id) {
        return this.selectedElements.some((txn) => this.expense.tx_id === txn.tx_id);
      } else {
        return this.selectedElements.some((txn) => isEqual(this.expense, txn));
      }
    }
  }

  onGoToTransaction() {
    if (!this.isSelectionModeEnabled) {
      this.goToTransaction.emit({ etxn: this.expense, etxnIndex: this.etxnIndex });
    }
  }

  getReceipt() {
    if (this.expense?.tx_fyle_category && this.expense?.tx_fyle_category?.toLowerCase() === 'mileage') {
      this.receiptIcon = 'assets/svg/fy-mileage.svg';
    } else if (this.expense?.tx_fyle_category && this.expense?.tx_fyle_category?.toLowerCase() === 'per diem') {
      this.receiptIcon = 'assets/svg/fy-calendar.svg';
    } else {
      if (!this.expense.tx_file_ids) {
        this.receiptIcon = 'assets/svg/add-receipt.svg';
        if (this.isFromPotentialDuplicates || this.isFromViewReports) {
          this.receiptIcon = 'assets/svg/fy-expense.svg';
        }
      } else {
        this.fileService
          .getFilesWithThumbnail(this.expense.tx_id)
          .pipe(
            map((ThumbFiles: File[]) => {
              if (ThumbFiles.length > 0) {
                this.fileService
                  .downloadThumbnailUrl(ThumbFiles[0].id)
                  .pipe(
                    map((downloadUrl: FileObject[]) => {
                      this.receiptThumbnail = downloadUrl[0].url;
                    })
                  )
                  .subscribe(noop);
              } else {
                this.fileService
                  .downloadUrl(this.expense.tx_file_ids[0])
                  .pipe(
                    map((downloadUrl: string) => {
                      if (this.fileService.getReceiptDetails(downloadUrl) === 'pdf') {
                        this.receiptIcon = 'assets/svg/pdf.svg';
                      } else {
                        this.receiptIcon = 'assets/svg/fy-expense.svg';
                      }
                    })
                  )
                  .subscribe(noop);
              }
            })
          )
          .subscribe(noop);
      }
    }
  }

  checkIfScanIsCompleted(): boolean {
    const hasUserManuallyEnteredData =
      (this.expense.tx_amount || this.expense.tx_user_amount) &&
      isNumber(this.expense.tx_amount || this.expense.tx_user_amount);
    const isRequiredExtractedDataPresent = this.expense.tx_extracted_data && this.expense.tx_extracted_data.amount;

    // this is to prevent the scan failed from being shown from an indefinite amount of time.
    // also transcription kicks in within 15-24 hours, so only post that we should revert to default state
    const hasScanExpired = this.expense.tx_created_at && dayjs(this.expense.tx_created_at).diff(Date.now(), 'day') < 0;
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
  pollDataExtractionStatus(callback: Function) {
    const that = this;
    setTimeout(() => {
      const isPresentInQueue = that.transactionOutboxService.isDataExtractionPending(that.expense.tx_id);
      if (!isPresentInQueue) {
        callback();
      } else {
        that.pollDataExtractionStatus(callback);
      }
    }, 1000);
  }

  handleScanStatus() {
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
            !that.isScanCompleted && that.transactionOutboxService.isDataExtractionPending(that.expense.tx_id);
          if (that.isScanInProgress) {
            that.pollDataExtractionStatus(function () {
              that.transactionService.getETxnUnflattened(that.expense.tx_id).subscribe((etxn) => {
                const extractedData = etxn.tx.extracted_data;
                if (extractedData?.amount && extractedData?.currency) {
                  that.isScanCompleted = true;
                  that.isScanInProgress = false;
                  that.expense.tx_extracted_data = extractedData;
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

  canShowPaymentModeIcon() {
    this.showPaymentModeIcon =
      this.expense.source_account_type === AccountType.PERSONAL && !this.expense.tx_skip_reimbursement;
  }

  ngOnInit() {
    this.setupNetworkWatcher();
    const orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));

    this.isSycing$ = this.isConnected$.pipe(
      map((isConnected) => isConnected && this.transactionOutboxService.isSyncInProgress() && this.isOutboxExpense)
    );

    this.isMileageExpense =
      this.expense?.tx_fyle_category && this.expense?.tx_fyle_category?.toLowerCase() === 'mileage';
    this.isPerDiem = this.expense?.tx_fyle_category && this.expense?.tx_fyle_category?.toLowerCase() === 'per diem';

    this.category = this.expense.tx_org_category?.toLowerCase();
    this.expense.isDraft = this.transactionService.getIsDraft(this.expense);
    this.expense.isPolicyViolated = this.expense.tx_manual_flag || this.expense.tx_policy_flag;
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
        })
      )
      .subscribe(noop);

    this.isProjectEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.projects && orgSettings.projects.allowed && orgSettings.projects.enabled),
      shareReplay(1)
    );

    if (!this.expense.tx_id) {
      this.showDt = !!this.isFirstOfflineExpense;
    } else if (this.previousExpenseTxnDate || this.previousExpenseCreatedAt) {
      const currentDate = this.expense && new Date(this.expense.tx_txn_dt || this.expense.tx_created_at).toDateString();
      const previousDate = new Date(this.previousExpenseTxnDate || this.previousExpenseCreatedAt).toDateString();
      this.showDt = currentDate !== previousDate;
    }

    this.canShowPaymentModeIcon();

    this.getReceipt();

    this.handleScanStatus();

    this.setOtherData();

    this.isIos = this.platform.is('ios');
  }

  setOtherData() {
    if (this.expense.source_account_type === AccountType.CCC) {
      if (this.expense.tx_corporate_credit_card_expense_group_id) {
        this.paymentModeIcon = 'fy-matched';
      } else {
        this.paymentModeIcon = 'fy-unmatched';
      }
    } else {
      if (!this.expense.tx_skip_reimbursement) {
        this.paymentModeIcon = 'fy-reimbursable';
      } else {
        this.paymentModeIcon = 'fy-non-reimbursable';
      }
    }
  }

  getScanningReceiptCard(expense: Expense): boolean {
    if (
      expense?.tx_fyle_category &&
      (expense?.tx_fyle_category?.toLowerCase() === 'mileage' ||
        expense?.tx_fyle_category?.toLowerCase() === 'per diem')
    ) {
      return false;
    } else {
      if (!expense.tx_currency && !expense.tx_amount) {
        if (!expense.tx_extracted_data && !expense.tx_transcribed_data) {
          return true;
        }
      }
    }
    return false;
  }

  onSetMultiselectMode() {
    if (!this.isSelectionModeEnabled) {
      this.setMultiselectMode.emit(this.expense);
    }
  }

  onTapTransaction() {
    if (this.isSelectionModeEnabled) {
      this.cardClickedForSelection.emit(this.expense);
    }
  }

  canAddAttachment() {
    return (
      !this.isFromViewReports &&
      !(this.isMileageExpense || this.isPerDiem || this.expense.tx_file_ids || this.isFromPotentialDuplicates) &&
      !this.isSelectionModeEnabled
    );
  }

  async onFileUploadChange(nativeElement: HTMLInputElement) {
    const file = nativeElement.files[0];
    let receiptDetails;
    if (file) {
      const dataUrl = await this.fileService.readFile(file);
      this.trackingService.addAttachment({ type: file.type });
      receiptDetails = {
        type: file.type,
        dataUrl,
        actionSource: 'gallery_upload',
      };
      this.attachReceipt(receiptDetails);
    }
  }

  async addAttachments(event) {
    if (this.canAddAttachment()) {
      event.stopPropagation();

      let receiptDetails;

      if (this.isIos) {
        const nativeElement = this.fileUpload.nativeElement as HTMLInputElement;
        nativeElement.onchange = async () => {
          await this.onFileUploadChange(nativeElement);
        };
        nativeElement.click();
      } else {
        const popup = await this.popoverController.create({
          component: CameraOptionsPopupComponent,
          cssClass: 'camera-options-popover',
        });

        await popup.present();

        let { data: receiptDetails } = await popup.onWillDismiss();

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

          const { data } = await captureReceiptModal.onWillDismiss();
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
          this.attachReceipt(receiptDetails);
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

  setThumbnail(fileObjId: string, attachmentType: string) {
    this.fileService.downloadUrl(fileObjId).subscribe((downloadUrl) => {
      if (attachmentType === 'pdf') {
        this.receiptIcon = 'assets/svg/pdf.svg';
      } else {
        this.receiptThumbnail = downloadUrl;
      }
    });
  }

  matchReceiptWithEtxn(fileObj: FileObject) {
    this.expense.tx_file_ids = [];
    this.expense.tx_file_ids.push(fileObj.id);
    fileObj.transaction_id = this.expense.tx_id;
  }

  attachReceipt(receiptDetails: ReceiptDetail) {
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
      .subscribe((fileObj) => {
        this.setThumbnail(fileObj.id, attachmentType);
      });
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      startWith(true)
    );
  }

  dismiss(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dismissed.emit(this.expense);
  }
}
