import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import dayjs from 'dayjs';
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
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { CameraOptionsPopupComponent } from 'src/app/fyle/add-edit-expense/camera-options-popup/camera-options-popup.component';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from '../../../core/services/snackbar-properties.service';
import { TrackingService } from '../../../core/services/tracking.service';
import { PopupAlertComponent } from '../popup-alert/popup-alert.component';
import { ExpensesService as SharedExpenseService } from 'src/app/core/services/platform/v1/shared/expenses.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ReceiptDetail } from 'src/app/core/models/receipt-detail.model';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { TranslocoService } from '@jsverse/transloco';
import { ExpenseMissingMandatoryFields } from 'src/app/core/models/platform/v1/expense-missing-mandatory-fields.model';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { ExpensesService as SharedExpensesService } from 'src/app/core/services/platform/v1/shared/expenses.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-expense-card-v2',
  templateUrl: './expenses-card.component.html',
  styleUrls: ['./expenses-card.component.scss'],
  standalone: false,
})
export class ExpensesCardComponent implements OnInit {
  private transactionService = inject(TransactionService);

  private sharedExpenseService = inject(SharedExpenseService);

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

  private orgSettingsService = inject(OrgSettingsService);

  private expensesService = inject(ExpensesService);

  private translocoService = inject(TranslocoService);

  // Cache key for localStorage
  private static readonly CACHE_KEY = 'mandatory_expense_fields_cache';

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

  missingMandatoryFields: ExpenseMissingMandatoryFields;

  allMandatoryExpenseFields: ExpenseField[];

  // map of mandatory expense fields id to their names
  mandatoryFieldsMap: Record<number, string>;

  // array of missing mandatory field names
  missingMandatoryFieldNames: string[] = [];

  // processed display text for missing fields
  missingFieldsDisplayText = '';

  // count of remaining fields not displayed
  remainingFieldsCount = 0;

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

  readonly isPendingGasCharge = signal<boolean>(false);

  private sharedExpensesService = inject(SharedExpensesService);

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
      this.receiptIcon = 'assets/svg/mileage.svg';
    } else if (this.expense?.category?.name && this.expense?.category?.name.toLowerCase() === 'per diem') {
      this.receiptIcon = 'assets/svg/calendar.svg';
    } else {
      if (!this.expense.file_ids?.length) {
        this.receiptIcon = 'assets/svg/list-plus.svg';
        if (this.isFromPotentialDuplicates || this.isFromViewReports) {
          this.receiptIcon = 'assets/svg/list.svg';
        }
      } else {
        this.isReceiptPresent = true;
      }
    }
  }

  isZeroAmountPerDiemOrMileage(): boolean {
    return (
      (this.expense?.category?.name?.toLowerCase() === 'per diem' ||
        this.expense?.category?.name?.toLowerCase() === 'mileage') &&
      (this.expense.amount === 0 || this.expense.claim_amount === 0)
    );
  }

  checkIfScanIsCompleted(): boolean {
    const isZeroAmountPerDiemOrMileage = this.isZeroAmountPerDiemOrMileage();

    const hasUserManuallyEnteredData =
      isZeroAmountPerDiemOrMileage ||
      ((this.expense.amount || this.expense.claim_amount) &&
        isNumber(this.expense.amount || this.expense.claim_amount));
    const isRequiredExtractedDataPresent = this.expense.extracted_data?.amount;

    // this is to prevent the scan failed from being shown from an indefinite amount of time.
    // also transcription kicks in within 15-24 hours, so only post that we should revert to default state
    const hasScanExpired = this.expense.created_at && dayjs(this.expense.created_at).diff(Date.now(), 'day') < 0;
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
          that.isScanInProgress = !that.isScanCompleted && !this.expense.extracted_data;
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

  setIsPolicyViolated(): void {
    this.isPolicyViolated = this.expense.is_policy_flagged;
  }

  setExpenseDetails(): void {
    this.category = this.expense?.category?.name && this.expense?.category?.name.toLowerCase();
    this.isMileageExpense = this.category === 'mileage';
    this.isPerDiem = this.category === 'per diem';

    this.isDraft = this.sharedExpenseService.isExpenseInDraft(this.expense);
    this.isCriticalPolicyViolated = this.sharedExpenseService.isCriticalPolicyViolatedExpense(this.expense);
    this.vendorDetails = this.sharedExpenseService.getVendorDetails(this.expense);

    this.setIsPolicyViolated();

    if (!this.expense.id) {
      this.showDt = !!this.isFirstOfflineExpense;
    } else if (this.previousExpenseTxnDate || this.previousExpenseCreatedAt) {
      const currentDate = (this.expense.spent_at || this.expense.created_at).toDateString();
      const previousDate = new Date(
        (this.previousExpenseTxnDate || this.previousExpenseCreatedAt) as string,
      ).toDateString();
      this.showDt = currentDate !== previousDate;
    }

    this.canShowPaymentModeIcon();

    this.getReceipt();

    this.setOtherData();
  }

  ngOnInit(): void {
    this.setupNetworkWatcher();
    const orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));

    this.isSycing$ = this.isConnected$.pipe(
      map((isConnected) => isConnected && this.transactionOutboxService.isSyncInProgress() && this.isOutboxExpense),
    );
    this.expenseFieldsService.getAllMap().subscribe((expenseFields) => {
      this.expenseFields = expenseFields;
    });

    this.missingMandatoryFields = this.expense.missing_mandatory_fields;

    // get the mandatory expense fields using cached approach
    this.ensureMandatoryFieldsMap();

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

    this.setExpenseDetails();

    this.handleScanStatus();

    this.isIos = this.platform.is('ios');

    this.isPendingGasCharge.set(this.sharedExpensesService.isPendingGasCharge(this.expense));
  }

  setOtherData(): void {
    if (this.expense?.source_account?.type === AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT) {
      if (this.expense?.matched_corporate_card_transaction_ids?.length > 0) {
        this.paymentModeIcon = 'card';
      } else {
        this.paymentModeIcon = 'card';
      }
    } else {
      if (this.expense?.is_reimbursable) {
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
          const message = this.translocoService.translate('expensesCard.receiptAdded');
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
          return this.expensesService.attachReceiptToExpense(this.expense.id, fileObj.id);
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
    const message = this.translocoService.translate('expensesCard.fileTooLarge', {
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

  /**
   * Gets cached mandatory fields map from localStorage
   */
  private getCachedMandatoryFieldsMap(): Record<number, string> {
    try {
      const cachedData = localStorage.getItem(ExpensesCardComponent.CACHE_KEY);
      return cachedData ? (JSON.parse(cachedData) as Record<number, string>) : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Sets mandatory fields map to localStorage
   */
  private setCachedMandatoryFieldsMap(fieldsMap: Record<number, string>): void {
    try {
      localStorage.setItem(ExpensesCardComponent.CACHE_KEY, JSON.stringify(fieldsMap));
    } catch (error) {
      // Ignore localStorage errors (e.g., quota exceeded)
    }
  }

  /**
   * Gets array of missing mandatory field names from the missingMandatoryFields object
   */
  private getMissingMandatoryFieldNames(): string[] {
    const missingFieldNames: string[] = [];

    if (!this.missingMandatoryFields) {
      return missingFieldNames;
    }

    // Check receipt field
    if (this.missingMandatoryFields.receipt) {
      missingFieldNames.push('receipt');
    }

    // Check currency field
    if (this.missingMandatoryFields.currency) {
      missingFieldNames.push('currency');
    }

    // Check amount field
    if (this.missingMandatoryFields.amount) {
      missingFieldNames.push('amount');
    }

    // Check expense field IDs and get their names from the map
    if (this.missingMandatoryFields.expense_field_ids?.length > 0) {
      this.missingMandatoryFields.expense_field_ids.forEach((fieldId) => {
        const fieldName = this.mandatoryFieldsMap?.[fieldId];
        if (fieldName) {
          missingFieldNames.push(fieldName);
        }
      });
    }

    return missingFieldNames;
  }

  /**
   * Processes missing field names with character limits and ellipsis support.
   * Converts field names to lowercase, truncates long names, and tracks overflow count.
   * @param maxCharacters - Maximum character count for display (default: 20)
   * @param maxWordLength - Maximum length for individual words before ellipsis (default: 12)
   */
  private processMissingFieldsForDisplay(maxCharacters: number = 20, maxWordLength: number = 12): void {
    if (!this.missingMandatoryFieldNames.length) {
      this.missingFieldsDisplayText = '';
      this.remainingFieldsCount = 0;
      return;
    }

    const processedFields: string[] = [];
    let currentLength = 0;
    let remainingCount = 0;

    for (let i = 0; i < this.missingMandatoryFieldNames.length; i++) {
      let fieldName = this.missingMandatoryFieldNames[i];

      if (fieldName && fieldName.length > 0) {
        fieldName = fieldName.toLowerCase();
      }

      if (fieldName.length > maxWordLength) {
        fieldName = fieldName.substring(0, maxWordLength - 3) + '...';
      }

      const separator = processedFields.length > 0 ? ', ' : '';
      const potentialLength = currentLength + separator.length + fieldName.length;

      if (potentialLength > maxCharacters && processedFields.length > 0) {
        remainingCount = this.missingMandatoryFieldNames.length - i;
        break;
      }

      processedFields.push(fieldName);
      currentLength = potentialLength;
    }

    this.missingFieldsDisplayText = processedFields.join(', ');
    this.remainingFieldsCount = remainingCount;
  }

  /**
   * Creates and caches a map of mandatory expense fields (ID -> name).
   * Uses cached data when available, otherwise makes API call to fetch fields.
   * Populates missing field names and processes them for display after map is ready.
   */
  private ensureMandatoryFieldsMap(): void {
    const requiredFieldIds = this.missingMandatoryFields?.expense_field_ids || [];
    const cachedMap = this.getCachedMandatoryFieldsMap();
    const allIdsPresent = requiredFieldIds.every((id) => cachedMap.hasOwnProperty(id));

    // If all required field IDs are present in the cached map, use the cached map
    if (allIdsPresent && requiredFieldIds.length > 0) {
      this.mandatoryFieldsMap = cachedMap;
      this.missingMandatoryFieldNames = this.getMissingMandatoryFieldNames();
      this.processMissingFieldsForDisplay();
      return;
    }

    this.expenseFieldsService.getMandatoryExpenseFields().subscribe({
      next: (mandatoryExpenseFields) => {
        if (mandatoryExpenseFields && Array.isArray(mandatoryExpenseFields)) {
          this.allMandatoryExpenseFields = mandatoryExpenseFields;

          const newFieldsMap: Record<number, string> = {};
          mandatoryExpenseFields.forEach((field) => {
            if (field && field.id && field.field_name) {
              newFieldsMap[field.id] = field.field_name;
            }
          });

          this.mandatoryFieldsMap = newFieldsMap;
          this.setCachedMandatoryFieldsMap(newFieldsMap);
          this.missingMandatoryFieldNames = this.getMissingMandatoryFieldNames();
          this.processMissingFieldsForDisplay();
        } else {
          this.mandatoryFieldsMap = cachedMap;
          this.missingMandatoryFieldNames = this.getMissingMandatoryFieldNames();
          this.processMissingFieldsForDisplay();
        }
      },
      // Fallback to existing cache if API call fails
      error: () => {
        this.mandatoryFieldsMap = cachedMap;
        this.missingMandatoryFieldNames = this.getMissingMandatoryFieldNames();
        this.processMissingFieldsForDisplay();
      },
    });
  }
}
