import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { from, noop, Observable } from 'rxjs';
import { concat } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { ExpenseFieldsMap } from 'src/app/core/models/v1/expense-fields-map.model';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { getCurrencySymbol } from '@angular/common';
import { OfflineService } from 'src/app/core/services/offline.service';
import { concatMap, finalize, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { isNumber, reduce } from 'lodash';
import { FileService } from 'src/app/core/services/file.service';
import { PopoverController } from '@ionic/angular';
import { CameraOptionsPopupComponent } from 'src/app/fyle/add-edit-expense/camera-options-popup/camera-options-popup.component';
import { FileObject } from 'src/app/core/models/file_obj.model';
import { File } from 'src/app/core/models/file.model';
import { map, tap } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { NetworkService } from 'src/app/core/services/network.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import * as moment from 'moment';

@Component({
  selector: 'app-expense-card',
  templateUrl: './expenses-card.component.html',
  styleUrls: ['./expenses-card.component.scss'],
})
export class ExpensesCardComponent implements OnInit {
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

  @Input() etxnIndex: number;

  @Output() goToTransaction: EventEmitter<{ etxn: Expense; etxnIndex: number }> = new EventEmitter();

  @Output() cardClickedForSelection: EventEmitter<Expense> = new EventEmitter();

  @Output() setMultiselectMode: EventEmitter<Expense> = new EventEmitter();

  inlineReceiptDataUrl: string;

  expenseFields$: Observable<Partial<ExpenseFieldsMap>>;

  receiptIcon: string;

  receipt: string;

  showDt = true;

  isPolicyViolated: boolean;

  isCriticalPolicyViolated: boolean;

  homeCurrency: string;

  homeCurrencySymbol = '';

  foreignCurrencySymbol = '';

  paymentModeIcon: string;

  isScanInProgress: boolean;

  isProjectEnabled$: Observable<boolean>;

  attachmentUploadInProgress = false;

  attachedReceiptsCount = 0;

  receiptThumbnail: string = null;

  isConnected$: Observable<boolean>;

  isSycing$: Observable<boolean>;

  category: string;

  isScanCompleted: boolean;

  imageTransperencyOverlay = 'linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45)), ';

  isMileageExpense: boolean;

  isPerDiem: boolean;

  constructor(
    private transactionService: TransactionService,
    private offlineService: OfflineService,
    private fileService: FileService,
    private popoverController: PopoverController,
    private networkService: NetworkService,
    private transactionOutboxService: TransactionsOutboxService
  ) {}

  onGoToTransaction() {
    if (!this.isSelectionModeEnabled) {
      this.goToTransaction.emit({ etxn: this.expense, etxnIndex: this.etxnIndex });
    }
  }

  get isSelected() {
    if (this.expense.tx_id) {
      return this.selectedElements.some((txn) => this.expense.tx_id === txn.tx_id);
    } else {
      return this.selectedElements.some((txn) => isEqual(this.expense, txn));
    }
  }

  getReceipt() {
    if (this.expense.tx_fyle_category && this.expense.tx_fyle_category.toLowerCase() === 'mileage') {
      this.receiptIcon = 'assets/svg/fy-mileage.svg';
    } else if (this.expense.tx_fyle_category && this.expense.tx_fyle_category.toLowerCase() === 'per diem') {
      this.receiptIcon = 'assets/svg/fy-calendar.svg';
    } else {
      if (!this.expense.tx_file_ids) {
        this.receiptIcon = 'assets/svg/add-receipt.svg';
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
    const hasScanExpired =
      this.expense.tx_created_at && moment(this.expense.tx_created_at).diff(moment.now(), 'day') < 0;
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
      that.offlineService.getOrgUserSettings().subscribe((orgUserSettings) => {
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
              that.transactionService.getETxn(that.expense.tx_id).subscribe((etxn) => {
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

  ngOnInit() {
    this.setupNetworkWatcher();
    this.isSycing$ = this.isConnected$.pipe(
      map((isConnected) => isConnected && this.transactionOutboxService.isSyncInProgress() && this.isOutboxExpense)
    );

    this.isMileageExpense = this.expense.tx_fyle_category && this.expense.tx_fyle_category.toLowerCase() === 'mileage';
    this.isPerDiem = this.expense.tx_fyle_category && this.expense.tx_fyle_category.toLowerCase() === 'per diem';

    this.category = this.expense.tx_org_category?.toLowerCase();
    this.expense.isDraft = this.transactionService.getIsDraft(this.expense);
    this.expense.isPolicyViolated = this.expense.tx_manual_flag || this.expense.tx_policy_flag;
    this.expense.isCriticalPolicyViolated = this.transactionService.getIsCriticalPolicyViolated(this.expense);
    this.expense.vendorDetails = this.transactionService.getVendorDetails(this.expense);
    this.expenseFields$ = this.offlineService.getExpenseFieldsMap();

    this.offlineService
      .getHomeCurrency()
      .pipe(
        map((homeCurrency) => {
          this.homeCurrency = homeCurrency;
          this.homeCurrencySymbol = getCurrencySymbol(homeCurrency, 'wide');
          this.foreignCurrencySymbol = getCurrencySymbol(this.expense.tx_orig_currency, 'wide');
        })
      )
      .subscribe(noop);

    this.isProjectEnabled$ = this.offlineService.getOrgSettings().pipe(
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

    this.getReceipt();

    this.handleScanStatus();

    this.setOtherData();
  }

  setOtherData() {
    if (this.expense.source_account_type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT') {
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
      expense.tx_fyle_category &&
      (expense.tx_fyle_category.toLowerCase() === 'mileage' || expense.tx_fyle_category.toLowerCase() === 'per diem')
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

  async addAttachments(event) {
    if (
      !this.isFromViewReports &&
      !(this.isMileageExpense || this.isPerDiem || this.expense.tx_file_ids) &&
      !this.isSelectionModeEnabled
    ) {
      event.stopPropagation();
      event.preventDefault();

      const popup = await this.popoverController.create({
        component: CameraOptionsPopupComponent,
        cssClass: 'camera-options-popover',
      });

      await popup.present();

      const { data } = await popup.onWillDismiss();
      if (data) {
        this.attachmentUploadInProgress = true;
        const attachmentType = this.fileService.getAttachmentType(data.type);

        this.inlineReceiptDataUrl = attachmentType !== 'pdf' && data.dataUrl;
        from(this.transactionOutboxService.fileUpload(data.dataUrl, attachmentType))
          .pipe(
            tap((fileObj: FileObject) => {
              this.expense.tx_file_ids = [];
              this.expense.tx_file_ids.push(fileObj.id);
              if (this.expense.tx_file_ids) {
                this.fileService
                  .downloadUrl(this.expense.tx_file_ids[0])
                  .pipe(
                    map((downloadUrl) => {
                      if (attachmentType === 'pdf') {
                        this.receiptIcon = 'assets/svg/pdf.svg';
                      } else {
                        this.receiptThumbnail = downloadUrl;
                      }
                    })
                  )
                  .subscribe(noop);
              }
            }),
            switchMap((fileObj: FileObject) => {
              fileObj.transaction_id = this.expense.tx_id;
              return this.fileService.post(fileObj);
            }),
            finalize(() => {
              this.attachmentUploadInProgress = false;
            })
          )
          .subscribe((attachmentsCount) => {
            this.attachedReceiptsCount = attachmentsCount;
          });
      }
    }
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      startWith(true)
    );
  }
}
