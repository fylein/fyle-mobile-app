// TODO: Very hard to fix this file without making massive changes
/* eslint-disable complexity */
import { TitleCasePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';

import * as dayjs from 'dayjs';
import { cloneDeep, isEqual, isNull, isNumber, mergeWith } from 'lodash';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  combineLatest,
  concat,
  forkJoin,
  from,
  iif,
  noop,
  of,
  throwError,
} from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  reduce,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  timeout,
  withLatestFrom,
} from 'rxjs/operators';
import { MAX_FILE_SIZE } from 'src/app/core/constants';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { ExpenseType } from 'src/app/core/enums/expense-type.enum';
import { AccountOption } from 'src/app/core/models/account-option.model';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { CCCExpUnflattened, CCCExpense } from 'src/app/core/models/corporate-card-expense-unflattened.model';
import { CostCenterOptions } from 'src/app/core/models/cost-centers-options.model';
import { CurrencyObj } from 'src/app/core/models/currency-obj.model';
import { Currency } from 'src/app/core/models/currency.model';
import { CustomInput } from 'src/app/core/models/custom-input.model';
import { Destination } from 'src/app/core/models/destination.model';
import { Expense } from 'src/app/core/models/expense.model';
import { ExtendedAccount } from 'src/app/core/models/extended-account.model';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { InstaFyleResponse } from 'src/app/core/models/insta-fyle-data.model';
import { MatchedCCCTransaction } from 'src/app/core/models/matchedCCCTransaction.model';
import { OrgSettings, TaxSettings } from 'src/app/core/models/org-settings.model';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { OutboxQueue } from 'src/app/core/models/outbox-queue.model';
import { ParsedReceipt } from 'src/app/core/models/parsed_receipt.model';
import { ParsedResponse } from 'src/app/core/models/parsed_response.model';
import { PersonalCardTxn } from 'src/app/core/models/personal_card_txn.model';
import { ExpensePolicy } from 'src/app/core/models/platform/platform-expense-policy.model';
import { FinalExpensePolicyState } from 'src/app/core/models/platform/platform-final-expense-policy-state.model';
import { IndividualExpensePolicyState } from 'src/app/core/models/platform/platform-individual-expense-policy-state.model';
import { PublicPolicyExpense } from 'src/app/core/models/public-policy-expense.model';
import { UnflattenedReport } from 'src/app/core/models/report-unflattened.model';
import { TaxGroup } from 'src/app/core/models/tax-group.model';
import { CorporateCardExpenseProperties } from 'src/app/core/models/tracking-properties.model';
import { TxnCustomProperties } from 'src/app/core/models/txn-custom-properties.model';
import { UndoMerge } from 'src/app/core/models/undo-merge.model';
import { UnflattenedTransaction } from 'src/app/core/models/unflattened-transaction.model';
import { CostCenter } from 'src/app/core/models/v1/cost-center.model';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { ExpenseFieldsObj } from 'src/app/core/models/v1/expense-fields-obj.model';
import { OrgCategory, OrgCategoryListItem } from 'src/app/core/models/v1/org-category.model';
import { RecentlyUsed } from 'src/app/core/models/v1/recently_used.model';
import { Transaction } from 'src/app/core/models/v1/transaction.model';
import { DuplicateSet } from 'src/app/core/models/v2/duplicate-sets.model';
import { ExtendedProject } from 'src/app/core/models/v2/extended-project.model';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { DateService } from 'src/app/core/services/date.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { FileService } from 'src/app/core/services/file.service';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StatusService } from 'src/app/core/services/status.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TaxGroupService } from 'src/app/core/services/tax-group.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { DependentFieldsComponent } from 'src/app/shared/components/dependent-fields/dependent-fields.component';
import { FyCriticalPolicyViolationComponent } from 'src/app/shared/components/fy-critical-policy-violation/fy-critical-policy-violation.component';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { FyPolicyViolationComponent } from 'src/app/shared/components/fy-policy-violation/fy-policy-violation.component';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { CorporateCreditCardExpenseService } from '../../core/services/corporate-credit-card-expense.service';
import { TrackingService } from '../../core/services/tracking.service';
import { CameraOptionsPopupComponent } from './camera-options-popup/camera-options-popup.component';
import { SuggestedDuplicatesComponent } from './suggested-duplicates/suggested-duplicates.component';
import { InstaFyleImageData } from 'src/app/core/models/insta-fyle-image-data.model';

type FormValue = {
  currencyObj: {
    currency: string;
    amount: number;
    orig_currency: string;
    orig_amount: number;
  };
  paymentMode: ExtendedAccount;
  project: ExtendedProject;
  category: OrgCategory;
  dateOfSpend: Date;
  vendor_id: {
    display_name: string;
  };
  purpose: string;
  report: UnflattenedReport;
  tax_group: TaxGroup;
  tax_amount: number;
  location_1: string | Destination;
  location_2: string | Destination;
  from_dt: Date;
  to_dt: Date;
  flight_journey_travel_class: string;
  flight_return_travel_class: string;
  train_travel_class: string;
  bus_travel_class: string;
  distance: number;
  distance_unit: string;
  custom_inputs: CustomInput[];
  duplicate_detection_reason: string;
  billable: boolean;
  costCenter: CostCenter;
  hotel_is_breakfast_provided: boolean;
  project_dependent_fields: TxnCustomProperties[];
  cost_center_dependent_fields: TxnCustomProperties[];
};

@Component({
  selector: 'app-add-edit-expense',
  templateUrl: './add-edit-expense.page.html',
  styleUrls: ['./add-edit-expense.page.scss'],
})
export class AddEditExpensePage implements OnInit {
  @ViewChild('formContainer') formContainer: ElementRef<HTMLFormElement>;

  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef<HTMLInputElement>;

  @ViewChild('projectDependentFieldsRef') projectDependentFieldsRef: DependentFieldsComponent;

  @ViewChild('costCenterDependentFieldsRef') costCenterDependentFieldsRef: DependentFieldsComponent;

  etxn$: Observable<UnflattenedTransaction>;

  paymentModes$: Observable<AccountOption[]>;

  recentlyUsedValues$: Observable<RecentlyUsed>;

  isCreatedFromCCC = false;

  isCreatedFromPersonalCard = false;

  paymentAccount$: Observable<ExtendedAccount>;

  isCCCAccountSelected$: Observable<boolean>;

  homeCurrency$: Observable<string>;

  mode: string;

  title: string;

  activeIndex: number;

  reviewList: string[];

  fg: FormGroup;

  filteredCategories$: Observable<OrgCategoryListItem[]>;

  minDate: string;

  maxDate: string;

  txnFields$: Observable<Partial<ExpenseFieldsObj>>;

  taxSettings$: Observable<TaxSettings>;

  reports$: Observable<{ label: string; value: UnflattenedReport }[]>;

  isProjectsEnabled$: Observable<boolean>;

  isCostCentersEnabled$: Observable<boolean>;

  flightJourneyTravelClassOptions$: Observable<{ label: string; value: string }[]>;

  customInputs$: Observable<TxnCustomProperties[]>;

  isBalanceAvailableInAnyAdvanceAccount$: Observable<boolean>;

  selectedCCCTransaction: CCCExpense;

  canChangeMatchingCCCTransaction = true;

  transactionInReport$: Observable<boolean>;

  isCriticalPolicyViolated = false;

  showSelectedTransaction = false;

  isIndividualProjectsEnabled$: Observable<boolean>;

  individualProjectIds$: Observable<number[]>;

  isNotReimbursable$: Observable<boolean>;

  costCenters$: Observable<CostCenterOptions[]>;

  isAmountCapped$: Observable<boolean>;

  isAmountDisabled$: Observable<boolean>;

  isCriticalPolicyViolated$: Observable<boolean>;

  isSplitExpenseAllowed$: Observable<boolean>;

  attachmentUploadInProgress = false;

  attachedReceiptsCount = 0;

  instaFyleCancelled = false;

  newExpenseDataUrls: Partial<FileObject>[] = [];

  loadAttachments$ = new BehaviorSubject<void>(null);

  attachments$: Observable<FileObject[] | unknown>;

  focusState = false;

  isConnected$: Observable<boolean>;

  invalidPaymentMode = false;

  isAdvancesEnabled$: Observable<boolean>;

  comments$: Observable<ExtendedStatus[]>;

  isCCCPaymentModeSelected$: Observable<boolean>;

  matchedCCCTransaction: MatchedCCCTransaction;

  alreadyApprovedExpenses: Expense[];

  isSplitExpensesPresent: boolean;

  showCardTransaction = true;

  canEditCCCMatchedSplitExpense: boolean;

  cardEndingDigits: string;

  isCCCTransactionAutoSelected: boolean;

  isChangeCCCSuggestionClicked: boolean;

  isDraftExpenseEnabled: boolean;

  isDraftExpense: boolean;

  isProjectsVisible$: Observable<boolean>;

  saveExpenseLoader = false;

  saveAndNewExpenseLoader = false;

  saveAndNextExpenseLoader = false;

  saveAndPrevExpenseLoader = false;

  canAttachReceipts: boolean;

  expenseStartTime: number;

  navigateBack = false;

  isExpenseBankTxn = false;

  recentCategories: OrgCategoryListItem[];

  // Todo: Rename all `selected` to `isSelected`
  presetCategoryId: number;

  recentlyUsedCategories$: Observable<OrgCategoryListItem[]>;

  clusterDomain: string;

  orgUserSettings$: Observable<OrgUserSettings>;

  recentProjects: { label: string; value: ExtendedProject; selected?: boolean }[];

  recentCurrencies: Currency[];

  presetProjectId: number | string;

  recentlyUsedProjects$: Observable<ExtendedProject[]>;

  recentlyUsedCurrencies$: Observable<Currency[]>;

  recentCostCenters: { label: string; value: CostCenter; selected?: boolean }[];

  presetCostCenterId: number;

  recentlyUsedCostCenters$: Observable<{ label: string; value: CostCenter; selected?: boolean }[]>;

  presetCurrency: string;

  initialFetch: boolean;

  inpageExtractedData: ParsedResponse;

  actionSheetOptions$: Observable<{ text: string; handler: () => void }[]>;

  billableDefaultValue: boolean;

  taxGroups$: Observable<TaxGroup[]>;

  taxGroupsOptions$: Observable<{ label: string; value: TaxGroup }[]>;

  isRedirectedFromReport = false;

  canRemoveFromReport = false;

  isSplitExpense: boolean;

  isCccExpense: string;

  cardNumber: string;

  policyDetails: IndividualExpensePolicyState[];

  source = 'MOBILE';

  isCameraPreviewStarted = false;

  isIos = false;

  duplicateExpenses: Expense[];

  isExpenseMatchedForDebitCCCE: boolean;

  canDismissCCCE: boolean;

  canRemoveCardExpense: boolean;

  isCorporateCreditCardEnabled: boolean;

  corporateCreditCardExpenseGroupId: string;

  showPaymentMode = true;

  autoSubmissionReportName$: Observable<string>;

  isIncompleteExpense = false;

  systemCategories: string[];

  breakfastSystemCategories: string[];

  hardwareBackButtonAction: Subscription;

  isNewReportsFlowEnabled = false;

  onPageExit$: Subject<void>;

  dependentFields$: Observable<ExpenseField[]>;

  selectedProject$: BehaviorSubject<ExtendedProject | null>;

  selectedCostCenter$: BehaviorSubject<CostCenter | null>;

  _isExpandedView = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private accountsService: AccountsService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private dateService: DateService,
    private projectsService: ProjectsService,
    private reportService: ReportService,
    private customInputsService: CustomInputsService,
    private customFieldsService: CustomFieldsService,
    private transactionService: TransactionService,
    private policyService: PolicyService,
    private transactionOutboxService: TransactionsOutboxService,
    private router: Router,
    private loaderService: LoaderService,
    private modalController: ModalController,
    private statusService: StatusService,
    private fileService: FileService,
    private popoverController: PopoverController,
    private currencyService: CurrencyService,
    private networkService: NetworkService,
    private popupService: PopupService,
    private navController: NavController,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private trackingService: TrackingService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService,
    private recentlyUsedItemsService: RecentlyUsedItemsService,
    private tokenService: TokenService,
    private expenseFieldsService: ExpenseFieldsService,
    private modalProperties: ModalPropertiesService,
    private actionSheetController: ActionSheetController,
    private orgSettingsService: OrgSettingsService,
    private sanitizer: DomSanitizer,
    private personalCardsService: PersonalCardsService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    public platform: Platform,
    private titleCasePipe: TitleCasePipe,
    private handleDuplicates: HandleDuplicatesService,
    private paymentModesService: PaymentModesService,
    private taxGroupService: TaxGroupService,
    private orgUserSettingsService: OrgUserSettingsService,
    private storageService: StorageService,
    private launchDarklyService: LaunchDarklyService,
    private platformHandlerService: PlatformHandlerService
  ) {}

  get isExpandedView(): boolean {
    return this._isExpandedView;
  }

  set isExpandedView(expandedView: boolean) {
    this._isExpandedView = expandedView;

    //Change the storage only in case of add expense
    if (this.mode === 'add') {
      this.storageService.set('isExpandedView', expandedView);
    }
  }

  @HostListener('keydown')
  scrollInputIntoView(): void {
    const el = document.activeElement;
    if (el && el instanceof HTMLInputElement) {
      el.scrollIntoView({
        block: 'center',
      });
    }
  }

  getFormValues(): FormValue {
    return this.fg.value as FormValue;
  }

  getFormControl(name: string): AbstractControl {
    return this.fg.controls[name];
  }

  goBack(): void {
    if (this.activatedRoute.snapshot.params.persist_filters || this.isRedirectedFromReport) {
      this.navController.back();
    } else {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    }
  }

  async showClosePopup(): Promise<void> {
    const isAutofilled =
      this.presetCategoryId || this.presetProjectId || this.presetCostCenterId || this.presetCurrency;
    if (this.fg.touched || this.activatedRoute.snapshot.params.dataUrl || isAutofilled) {
      const unsavedChangesPopOver = await this.popoverController.create({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Unsaved Changes',
          message: 'You have unsaved information that will be lost if you discard this expense.',
          primaryCta: {
            text: 'Discard',
            action: 'continue',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
        },
        cssClass: 'pop-up-in-center',
      });

      await unsavedChangesPopOver.present();

      const { data } = (await unsavedChangesPopOver.onWillDismiss()) as {
        data: {
          action: string;
        };
      };

      if (data && data.action === 'continue') {
        if (this.navigateBack) {
          this.navController.back();
        } else {
          this.goBack();
        }
      }
    } else {
      if (this.activatedRoute.snapshot.params.id) {
        this.trackingService.viewExpense({ Type: 'Receipt' });
      }

      if (this.navigateBack) {
        this.navController.back();
      } else {
        this.goBack();
      }
    }
  }

  merchantValidator(c: AbstractControl): ValidationErrors {
    const controlValue = c.value as { display_name: string };
    if (controlValue && controlValue.display_name) {
      return controlValue.display_name.length > 250 ? { merchantNameSize: 'Length is greater than 250' } : null;
    }
    return null;
  }

  currencyObjValidator(c: AbstractControl): ValidationErrors {
    const controlValue = c.value as CurrencyObj;
    if (
      controlValue &&
      ((controlValue.amount && controlValue.currency) || (controlValue.orig_amount && controlValue.orig_currency))
    ) {
      return null;
    }
    return {
      required: false,
    };
  }

  setUpTaxCalculations(): void {
    const currencyObjControl = this.getFormControl('currencyObj') as {
      value: {
        amount: number;
        currency: string;
      };
    };

    const taxGroupControl = this.getFormControl('tax_group') as {
      value: {
        percentage: number;
      };
    };

    combineLatest(this.fg.controls.currencyObj.valueChanges, this.fg.controls.tax_group.valueChanges).subscribe(() => {
      if (
        this.fg.controls.tax_group.value &&
        isNumber(taxGroupControl.value?.percentage) &&
        this.fg.controls.currencyObj.value
      ) {
        const amount =
          currencyObjControl.value?.amount - currencyObjControl.value?.amount / (taxGroupControl.value?.percentage + 1);

        const formattedAmount = this.currencyService.getAmountWithCurrencyFraction(
          amount,
          currencyObjControl.value?.currency
        );

        this.fg.controls.tax_amount.setValue(formattedAmount);
      } else {
        this.fg.controls.tax_amount.setValue(null);
      }
    });
  }

  checkIfInvalidPaymentMode(): Observable<boolean> {
    const formValues = this.getFormValues();
    return this.etxn$.pipe(
      map((etxn) => {
        const paymentAccount = formValues.paymentMode;
        const originalSourceAccountId = etxn && etxn.tx && etxn.tx.source_account_id;
        let isPaymentModeInvalid = false;
        if (paymentAccount && paymentAccount.acc && paymentAccount.acc.type === AccountType.ADVANCE) {
          if (paymentAccount.acc.id !== originalSourceAccountId) {
            isPaymentModeInvalid =
              paymentAccount.acc.tentative_balance_amount < (formValues.currencyObj && formValues.currencyObj.amount);
          } else {
            isPaymentModeInvalid =
              paymentAccount.acc.tentative_balance_amount + etxn.tx.amount <
              (formValues.currencyObj && formValues.currencyObj.amount);
          }
        }
        if (isPaymentModeInvalid) {
          this.paymentModesService.showInvalidPaymentModeToast();
        }
        return isPaymentModeInvalid;
      })
    );
  }

  async unmatchExpense(etxn: UnflattenedTransaction): Promise<void> {
    const message = this.isSplitExpensesPresent
      ? 'Unmatching the card transaction from this split expense will also unmatch it from the other splits associated with the expense.'
      : 'This will remove the mapping between corporate card expense and this expense.';
    const confirmPopup = await this.popupService.showPopup({
      header: 'Unmatch?',
      message,
      primaryCta: {
        text: 'UNMATCH',
      },
    });

    if (confirmPopup === 'primary') {
      this.showSelectedTransaction = false;
      if (this.isDraftExpenseEnabled) {
        this.isDraftExpense = false;
      } else {
        this.isDraftExpense = true;
      }

      if (['APPROVER_PENDING', 'APPROVER_INQUIRY'].indexOf(etxn.tx.state) > -1) {
        this.canChangeMatchingCCCTransaction = false;
      }

      if (this.isSplitExpensesPresent) {
        this.canChangeMatchingCCCTransaction = this.alreadyApprovedExpenses.length < 1;
      }

      this.selectedCCCTransaction = null;
    }
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  openSplitExpenseModal(splitType: string): void {
    const customFields$ = this.getCustomFields();
    const reportValue = this.getFormValues();

    forkJoin({
      generatedEtxn: this.generateEtxnFromFg(this.etxn$, customFields$),
      txnFields: this.txnFields$.pipe(take(1)),
    }).subscribe((res: { generatedEtxn: UnflattenedTransaction; txnFields: ExpenseFieldsObj }) => {
      this.router.navigate([
        '/',
        'enterprise',
        'split_expense',
        {
          splitType,
          txnFields: JSON.stringify(res.txnFields),
          txn: JSON.stringify(res.generatedEtxn.tx),
          currencyObj: JSON.stringify(this.fg.controls.currencyObj.value),
          fileObjs: JSON.stringify(res.generatedEtxn.dataUrls),
          selectedCCCTransaction: this.selectedCCCTransaction ? JSON.stringify(this.selectedCCCTransaction) : null,
          selectedReportId: reportValue.report ? JSON.stringify(reportValue.report.rp.id) : null,
        },
      ]);
    });
  }

  markCCCAsPersonal(txnId: string): Observable<null> {
    return this.transactionService.delete(txnId).pipe(
      switchMap((res) => {
        if (res) {
          this.trackingService.deleteExpense({ Type: 'Marked Personal' });
          return this.corporateCreditCardExpenseService.markPersonal(this.corporateCreditCardExpenseGroupId);
        } else {
          return of(null);
        }
      })
    );
  }

  dismissCCC(txnId: string, corporateCreditCardExpenseId: string): Observable<null> {
    return this.transactionService.delete(txnId).pipe(
      switchMap((res) => {
        if (res) {
          this.trackingService.deleteExpense({ Type: 'Dismiss as Card Payment' });
          return this.corporateCreditCardExpenseService.dismissCreditTransaction(corporateCreditCardExpenseId);
        } else {
          return of(null);
        }
      })
    );
  }

  getRemoveCCCExpModalParams(
    header: string,
    body: string,
    ctaText: string,
    ctaLoadingText: string
  ): {
    component: typeof FyDeleteDialogComponent;
    cssClass: string;
    backdropDismiss: boolean;
    componentProps: {
      header: string;
      body: string;
      ctaText: string;
      ctaLoadingText: string;
      deleteMethod: () => Observable<UndoMerge>;
    };
  } {
    return {
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header,
        body,
        ctaText,
        ctaLoadingText,
        deleteMethod: (): Observable<UndoMerge> =>
          this.transactionService.removeCorporateCardExpense(this.activatedRoute.snapshot.params.id as string),
      },
    };
  }

  async removeCorporateCardExpense(): Promise<void> {
    const header = 'Remove Card Expense';
    const body = this.transactionService.getRemoveCardExpenseDialogBody(this.isSplitExpensesPresent);
    const ctaText = 'Confirm';
    const ctaLoadingText = 'Confirming';
    const deletePopover = await this.popoverController.create(
      this.getRemoveCCCExpModalParams(header, body, ctaText, ctaLoadingText)
    );

    await deletePopover.present();
    const { data } = (await deletePopover.onDidDismiss()) as {
      data: {
        status: string;
      };
    };

    if (data?.status === 'success') {
      let txnDetails: UnflattenedTransaction;
      this.etxn$.subscribe((etxn) => (txnDetails = etxn));
      const properties = {
        Type: 'unlink corporate card expense',
        transaction: txnDetails?.tx,
      };
      this.trackingService.unlinkCorporateCardExpense(properties as CorporateCardExpenseProperties);
      if (txnDetails?.tx?.report_id) {
        this.router.navigate([
          '/',
          'enterprise',
          'my_view_report',
          { id: txnDetails.tx.report_id, navigateBack: true },
        ]);
      } else {
        this.goBack();
      }
      const toastMessage = 'Successfully removed the card details from the expense.';
      const toastMessageData = {
        message: toastMessage,
      };

      this.showSnackBarToast(toastMessageData, 'information', ['msb-info']);
      this.trackingService.showToastMessage({ ToastContent: toastMessageData.message });
    }
  }

  getMarkDismissModalParams(
    componentPropsParam: { header: string; body: string; ctaText: string; ctaLoadingText: string },
    isMarkPersonal: boolean
  ): {
    component: typeof FyDeleteDialogComponent;
    cssClass: string;
    backdropDismiss: boolean;
    componentProps: {
      header: string;
      body: string;
      ctaText: string;
      ctaLoadingText: string;
      deleteMethod: () => Observable<null>;
    };
  } {
    const id = this.activatedRoute.snapshot.params.id as string;
    return {
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: componentPropsParam.header,
        body: componentPropsParam.body,
        ctaText: componentPropsParam.ctaText,
        ctaLoadingText: componentPropsParam.ctaLoadingText,
        deleteMethod: (): Observable<null> => {
          if (isMarkPersonal) {
            return this.transactionService
              .unmatchCCCExpense(id, this.corporateCreditCardExpenseGroupId)
              .pipe(switchMap(() => this.markCCCAsPersonal(id)));
          } else {
            return this.transactionService
              .unmatchCCCExpense(id, this.matchedCCCTransaction?.id)
              .pipe(switchMap(() => this.dismissCCC(id, this.matchedCCCTransaction?.id)));
          }
        },
      },
    };
  }

  async markPeronsalOrDismiss(type: string): Promise<void> {
    this.etxn$.subscribe(
      (etxn) => (this.corporateCreditCardExpenseGroupId = etxn?.tx?.corporate_credit_card_expense_group_id)
    );
    const isMarkPersonal = type === 'personal' && this.isExpenseMatchedForDebitCCCE;
    const header = isMarkPersonal ? 'Mark Expense as Personal' : 'Dismiss this expense?';
    const body = isMarkPersonal
      ? "This corporate card expense will be marked as personal and you won't be able to edit it.\nDo you wish to proceed?"
      : "This corporate card expense will be dismissed and you won't be able to edit it.\nDo you wish to proceed?";
    const ctaText = 'Yes';
    const ctaLoadingText = isMarkPersonal ? 'Marking' : 'Dismissing';

    const deletePopover = await this.popoverController.create(
      this.getMarkDismissModalParams(
        {
          header,
          body,
          ctaText,
          ctaLoadingText,
        },
        isMarkPersonal
      )
    );

    await deletePopover.present();
    const { data } = (await deletePopover.onDidDismiss()) as {
      data: {
        status: string;
      };
    };

    if (data && data.status === 'success') {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
      const toastMessage = isMarkPersonal ? 'Marked expense as Personal' : 'Dismissed expense';
      const toastMessageData = {
        message: toastMessage,
      };
      this.showSnackBarToast(toastMessageData, 'information', ['msb-info']);
      this.trackingService.showToastMessage({ ToastContent: toastMessage });
    }
  }

  showFormValidationErrors(): void {
    this.fg.markAllAsTouched();
    const formContainer = this.formContainer.nativeElement as HTMLElement;
    if (formContainer) {
      const invalidElement = formContainer.querySelector('.ng-invalid');
      if (invalidElement) {
        invalidElement.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }
  }

  removeCCCHandler(): Promise<void> {
    return this.removeCorporateCardExpense();
  }

  markPersonalHandler(): Promise<void> {
    return this.markPeronsalOrDismiss('personal');
  }

  markDismissHandler(): Promise<void> {
    return this.markPeronsalOrDismiss('dismiss');
  }

  splitExpCategoryHandler(): void {
    if (this.fg.valid) {
      this.openSplitExpenseModal('categories');
    } else {
      this.showFormValidationErrors();
    }
  }

  splitExpProjectHandler(): void {
    if (this.fg.valid) {
      this.openSplitExpenseModal('projects');
    } else {
      this.showFormValidationErrors();
    }
  }

  splitExpCostCenterHandler(): void {
    if (this.fg.valid) {
      this.openSplitExpenseModal('cost centers');
    } else {
      this.showFormValidationErrors();
    }
  }

  getActionSheetOptions(): Observable<{ text: string; handler: () => void }[]> {
    return forkJoin({
      orgSettings: this.orgSettingsService.get(),
      costCenters: this.costCenters$,
      projects: this.projectsService.getAllActive(),
      txnFields: this.txnFields$.pipe(take(1)),
      filteredCategories: this.filteredCategories$.pipe(take(1)),
      showProjectMappedCategoriesInSplitExpense: this.launchDarklyService.getVariation(
        'show_project_mapped_categories_in_split_expense',
        false
      ),
    }).pipe(
      map(
        ({
          orgSettings,
          costCenters,
          projects,
          txnFields,
          filteredCategories,
          showProjectMappedCategoriesInSplitExpense,
        }) => {
          const isSplitExpenseAllowed = orgSettings.expense_settings.split_expense_settings.enabled;

          const actionSheetOptions: { text: string; handler: () => void }[] = [];

          if (isSplitExpenseAllowed) {
            const areCostCentersAvailable = costCenters.length > 0;
            const areProjectsAvailable = orgSettings.projects.enabled && projects.length > 0;
            const areProjectDependentCategoriesAvailable = filteredCategories.length > 1;
            const projectField = txnFields.project_id;

            if (!showProjectMappedCategoriesInSplitExpense || areProjectDependentCategoriesAvailable) {
              actionSheetOptions.push({
                text: 'Split Expense By Category',
                handler: () => this.splitExpCategoryHandler(),
              });
            }

            if (areProjectsAvailable) {
              actionSheetOptions.push({
                text: 'Split Expense By ' + this.titleCasePipe.transform(projectField?.field_name),
                handler: () => this.splitExpProjectHandler(),
              });
            }

            if (areCostCentersAvailable) {
              actionSheetOptions.push({
                text: 'Split Expense By Cost Center',
                handler: () => this.splitExpCostCenterHandler(),
              });
            }
          }

          if (this.isCccExpense) {
            if (this.isExpenseMatchedForDebitCCCE) {
              actionSheetOptions.push({
                text: 'Mark as Personal',
                handler: () => this.markPersonalHandler(),
              });
            }

            if (this.canDismissCCCE) {
              actionSheetOptions.push({
                text: 'Dimiss as Card Payment',
                handler: () => this.markDismissHandler(),
              });
            }
          }

          if (this.isCorporateCreditCardEnabled && this.canRemoveCardExpense) {
            actionSheetOptions.push({
              text: 'Remove Card Expense',
              handler: () => this.removeCCCHandler(),
            });
          }
          return actionSheetOptions;
        }
      )
    );
  }

  showMoreActions(): void {
    this.actionSheetOptions$
      .pipe(
        switchMap((actionSheetOptions) => {
          const actionSheet = this.actionSheetController.create({
            header: 'MORE ACTIONS',
            mode: 'md',
            cssClass: 'fy-action-sheet',
            buttons: actionSheetOptions,
          });
          return actionSheet;
        })
      )
      .subscribe((actionSheet) => actionSheet.present());
  }

  ngOnInit(): void {
    this.isRedirectedFromReport = this.activatedRoute.snapshot.params.remove_from_report ? true : false;
    this.canRemoveFromReport = this.activatedRoute.snapshot.params.remove_from_report === 'true';
  }

  setupCostCenters(): void {
    const orgSettings$ = this.orgSettingsService.get();

    this.isCostCentersEnabled$ = orgSettings$.pipe(map((orgSettings) => orgSettings.cost_centers.enabled));

    this.costCenters$ = forkJoin({
      orgSettings: orgSettings$,
      orgUserSettings: this.orgUserSettings$,
    }).pipe(
      switchMap(({ orgSettings, orgUserSettings }) => {
        if (orgSettings.cost_centers.enabled) {
          return this.orgUserSettingsService.getAllowedCostCenters(orgUserSettings);
        } else {
          return of([]);
        }
      }),
      map((costCenters: CostCenter[]) =>
        costCenters.map((costCenter) => ({
          label: costCenter.name,
          value: costCenter,
        }))
      )
    );
  }

  checkAdvanceAccountAndBalance(account: ExtendedAccount): boolean {
    return account?.acc?.type === AccountType.ADVANCE && account.acc.tentative_balance_amount > 0;
  }

  setupBalanceFlag(): void {
    const accounts$ = this.accountsService.getEMyAccounts();
    this.isBalanceAvailableInAnyAdvanceAccount$ = this.fg.controls.paymentMode.valueChanges.pipe(
      switchMap((paymentMode: ExtendedAccount) => {
        if (paymentMode?.acc?.type === AccountType.PERSONAL) {
          return accounts$.pipe(
            map((accounts) => accounts.filter((account) => this.checkAdvanceAccountAndBalance(account)).length > 0)
          );
        }
        return of(false);
      })
    );
  }

  getCCCSettings(orgSettings: OrgSettings): boolean {
    return orgSettings?.corporate_credit_card_settings?.allowed && orgSettings.corporate_credit_card_settings.enabled;
  }

  getPaymentModes(): Observable<AccountOption[]> {
    return forkJoin({
      accounts: this.accountsService.getEMyAccounts(),
      orgSettings: this.orgSettingsService.get(),
      etxn: this.etxn$,
      allowedPaymentModes: this.orgUserSettingsService.getAllowedPaymentModes(),
      isPaymentModeConfigurationsEnabled: this.paymentModesService.checkIfPaymentModeConfigurationsIsEnabled(),
    }).pipe(
      map(({ accounts, orgSettings, etxn, allowedPaymentModes, isPaymentModeConfigurationsEnabled }) => {
        const isCCCEnabled = this.getCCCSettings(orgSettings);

        if (!isCCCEnabled && !etxn.tx.corporate_credit_card_expense_group_id) {
          this.showCardTransaction = false;
        }
        const config = {
          etxn,
          orgSettings,
          expenseType: ExpenseType.EXPENSE,
          isPaymentModeConfigurationsEnabled,
        };

        return this.accountsService.getPaymentModes(accounts, allowedPaymentModes, config);
      }),
      shareReplay(1)
    );
  }

  getActiveCategories(): Observable<OrgCategory[]> {
    const allCategories$ = this.categoriesService.getAll();

    return allCategories$.pipe(map((catogories) => this.categoriesService.filterRequired(catogories)));
  }

  getInstaFyleImageData(): Observable<Partial<InstaFyleImageData>> {
    if (this.activatedRoute.snapshot.params.dataUrl && this.activatedRoute.snapshot.params.canExtractData !== 'false') {
      const dataUrl = this.activatedRoute.snapshot.params.dataUrl as string;
      const b64Image = dataUrl.replace('data:image/jpeg;base64,', '');
      return from(this.transactionOutboxService.parseReceipt(b64Image)).pipe(
        timeout(15000),
        map((parsedResponse) => ({
          parsedResponse: parsedResponse.data,
        })),
        catchError(() =>
          of({
            error: true,
            parsedResponse: {
              source: 'MOBILE_INSTA',
            },
          })
        ),
        switchMap((extractedDetails) => {
          const instaFyleImageData = {
            thumbnail: this.activatedRoute.snapshot.params.dataUrl as string,
            type: 'image',
            url: this.activatedRoute.snapshot.params.dataUrl as string,
            ...extractedDetails,
          };

          const details = extractedDetails.parsedResponse as ParsedResponse;

          if (details) {
            return this.currencyService.getHomeCurrency().pipe(
              switchMap((homeCurrency) => {
                if (homeCurrency !== details.currency) {
                  return this.currencyService
                    .getExchangeRate(details.currency, homeCurrency, details.date ? new Date(details.date) : new Date())
                    .pipe(
                      catchError(() => of(null)),
                      map((exchangeRate) => ({
                        ...instaFyleImageData,
                        exchangeRate,
                      }))
                    );
                } else {
                  return of(instaFyleImageData);
                }
              })
            );
          } else {
            return of(instaFyleImageData);
          }
        })
      );
    } else if (this.activatedRoute.snapshot.params.dataUrl) {
      const instaFyleImageData = {
        thumbnail: this.activatedRoute.snapshot.params.dataUrl as string,
        type: 'image',
        url: this.activatedRoute.snapshot.params.dataUrl as string,
      };
      return of(instaFyleImageData);
    } else {
      return of(null);
    }
  }

  getNewExpenseObservable(): Observable<Partial<UnflattenedTransaction>> {
    const orgSettings$ = this.orgSettingsService.get();

    const eou$ = from(this.authService.getEou());

    return forkJoin({
      orgSettings: orgSettings$,
      orgUserSettings: this.orgUserSettings$,
      categories: this.categoriesService.getAll(),
      homeCurrency: this.homeCurrency$,
      eou: eou$,
      imageData: this.getInstaFyleImageData(),
      recentCurrency: from(this.recentLocalStorageItemsService.get<Currency>('recent-currency-cache')),
      recentValue: this.recentlyUsedValues$,
    }).pipe(
      map(
        (dependencies: {
          orgSettings: OrgSettings;
          orgUserSettings: OrgUserSettings;
          categories: OrgCategory[];
          homeCurrency: string;
          eou: ExtendedOrgUser;
          imageData: InstaFyleResponse;
          recentCurrency: Currency[];
          recentValue: RecentlyUsed;
        }) => {
          const {
            orgSettings,
            orgUserSettings,
            categories,
            homeCurrency,
            eou,
            imageData,
            recentCurrency,
            recentValue,
          } = dependencies;
          const bankTxn =
            this.activatedRoute.snapshot.params.bankTxn &&
            (JSON.parse(this.activatedRoute.snapshot.params.bankTxn as string) as CCCExpUnflattened);
          const personalCardTxn =
            this.activatedRoute.snapshot.params.personalCardTxn &&
            (JSON.parse(this.activatedRoute.snapshot.params.personalCardTxn as string) as PersonalCardTxn);
          this.isExpenseBankTxn = !!bankTxn;
          const projectEnabled = orgSettings.projects && orgSettings.projects.enabled;
          let etxn: Partial<UnflattenedTransaction>;
          if (!bankTxn && !personalCardTxn) {
            etxn = {
              tx: {
                skip_reimbursement: false,
                source: 'MOBILE',
                txn_dt: new Date(),
                currency: homeCurrency,
                amount: null,
                orig_currency: null,
                orig_amount: null,
                policy_amount: null,
                locations: [],
                custom_properties: [],
                num_files: this.activatedRoute.snapshot.params.dataUrl ? 1 : 0,
                org_user_id: eou.ou.id,
              },
              dataUrls: [],
            };

            this.source = 'MOBILE';

            if (orgUserSettings.currency_settings && orgUserSettings.currency_settings.enabled) {
              if (orgUserSettings.currency_settings.preferred_currency) {
                etxn.tx.currency = orgUserSettings.currency_settings.preferred_currency;
              }
            } else if (
              orgSettings.org_expense_form_autofills &&
              orgSettings.org_expense_form_autofills.allowed &&
              orgSettings.org_expense_form_autofills.enabled &&
              orgUserSettings.expense_form_autofills.allowed &&
              orgUserSettings.expense_form_autofills.enabled &&
              recentValue &&
              recentValue.recent_currencies &&
              recentValue.recent_currencies.length > 0
            ) {
              etxn.tx.currency = recentValue.recent_currencies[0];
              this.presetCurrency = recentValue.recent_currencies[0];
            } else {
              etxn.tx.currency =
                (recentCurrency && recentCurrency[0] && recentCurrency[0].shortCode) || etxn.tx.currency;
            }

            if (projectEnabled && orgUserSettings.preferences && orgUserSettings.preferences.default_project_id) {
              etxn.tx.project_id = orgUserSettings.preferences.default_project_id;
            }
          } else if (personalCardTxn) {
            etxn = {
              tx: {
                txn_dt: new Date(personalCardTxn.btxn_transaction_dt),
                source: 'MOBILE',
                currency: personalCardTxn.btxn_currency,
                amount: personalCardTxn.btxn_amount,
                vendor: personalCardTxn.btxn_vendor,
                purpose: personalCardTxn.btxn_description,
                skip_reimbursement: false,
                locations: [],
                num_files: 0,
                org_user_id: eou.ou.id,
              },
              dataUrls: [],
            };
          } else {
            etxn = {
              tx: {
                txn_dt: new Date(bankTxn.ccce.txn_dt),
                source: 'MOBILE',
                currency: bankTxn.ccce.currency,
                org_category_id: bankTxn.org_category_id,
                amount: bankTxn.ccce.amount,
                vendor: bankTxn.ccce.vendor,
                purpose: bankTxn.ccce.description,
                skip_reimbursement: false,
                locations: [],
                hotel_is_breakfast_provided: false,
                num_files: 0,
                org_user_id: eou.ou.id,
              },
              dataUrls: [],
            };
          }

          if (imageData && imageData.error) {
            this.instaFyleCancelled = true;
          } else if (imageData && imageData.parsedResponse) {
            const extractedData = {
              amount: imageData && imageData.parsedResponse && imageData.parsedResponse.amount,
              currency: imageData && imageData.parsedResponse && imageData.parsedResponse.currency,
              category: imageData && imageData.parsedResponse && imageData.parsedResponse.category,
              date:
                imageData && imageData.parsedResponse && imageData.parsedResponse.date
                  ? new Date(imageData.parsedResponse.date)
                  : null,
              vendor: imageData && imageData.parsedResponse && imageData.parsedResponse.vendor_name,
              invoice_dt: (imageData && imageData.parsedResponse && imageData.parsedResponse.invoice_dt) || null,
            };

            etxn.tx.extracted_data = extractedData;

            if (extractedData.amount) {
              etxn.tx.amount = extractedData.amount;
            }

            if (extractedData.currency) {
              etxn.tx.currency = extractedData.currency;

              if (homeCurrency !== extractedData.currency && extractedData.amount && imageData.exchangeRate) {
                etxn.tx.orig_amount = extractedData.amount;
                etxn.tx.orig_currency = extractedData.currency;
                etxn.tx.amount = imageData.exchangeRate * extractedData.amount;
                etxn.tx.currency = homeCurrency;
              }
            }

            if (extractedData.date) {
              etxn.tx.txn_dt = this.dateService.getUTCDate(new Date(extractedData.date));
            }

            if (extractedData.invoice_dt) {
              etxn.tx.txn_dt = this.dateService.getUTCDate(new Date(extractedData.invoice_dt));
            }

            if (extractedData.vendor) {
              etxn.tx.vendor = extractedData.vendor;
            }

            if (extractedData.category) {
              const category = categories.find((orgCategory) => orgCategory.name === extractedData.category);
              etxn.tx.org_category_id = category?.id;
              etxn.tx.fyle_category = category?.fyle_category;
            }
          }

          this.source = 'MOBILE';

          if (imageData && imageData.url) {
            etxn.dataUrls.push({
              url: imageData.url,
              type: 'image',
              thumbnail: imageData.url,
            });
            etxn.tx.num_files = etxn.dataUrls.length;
            this.source = 'MOBILE_DASHCAM_SINGLE';
          }

          return etxn;
        }
      ),
      shareReplay(1)
    );
  }

  getSelectedProjects(): Observable<ExtendedProject> {
    return this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.project_id) {
          return of(etxn.tx.project_id);
        } else {
          return forkJoin({
            orgSettings: this.orgSettingsService.get(),
            orgUserSettings: this.orgUserSettings$,
          }).pipe(
            map(({ orgSettings, orgUserSettings }) => {
              if (orgSettings.projects.enabled) {
                return orgUserSettings && orgUserSettings.preferences && orgUserSettings.preferences.default_project_id;
              }
            })
          );
        }
      }),
      switchMap((projectId) => {
        if (projectId) {
          return this.projectsService.getbyId(projectId);
        } else {
          return of(null);
        }
      })
    );
  }

  getSelectedCategory(): Observable<OrgCategory> {
    return this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.org_category_id) {
          return this.categoriesService.getCategoryById(etxn.tx.org_category_id);
        } else {
          return of(null);
        }
      })
    );
  }

  getSelectedReport(): Observable<UnflattenedReport> {
    return forkJoin({
      autoSubmissionReportName: this.autoSubmissionReportName$,
      etxn: this.etxn$,
      reportOptions: this.reports$,
    }).pipe(
      map(
        ({
          autoSubmissionReportName,
          etxn,
          reportOptions,
        }: {
          autoSubmissionReportName: string;
          etxn: UnflattenedTransaction;
          reportOptions: { label: string; value: UnflattenedReport }[];
        }) => {
          if (etxn.tx.report_id) {
            return reportOptions
              .map((res) => res.value)
              .find((reportOption: UnflattenedReport) => reportOption.rp.id === etxn.tx.report_id);
          } else if (!etxn.tx.report_id && this.activatedRoute.snapshot.params.rp_id) {
            return reportOptions
              .map((res) => res.value)
              .find(
                (reportOption: UnflattenedReport) => reportOption.rp.id === this.activatedRoute.snapshot.params.rp_id
              );
          } else if (
            !autoSubmissionReportName &&
            reportOptions.length === 1 &&
            reportOptions[0].value.rp.state === 'DRAFT'
          ) {
            return reportOptions[0].value;
          } else {
            return null;
          }
        }
      )
    );
  }

  getSelectedPaymentModes(): Observable<ExtendedAccount> {
    return forkJoin({
      etxn: this.etxn$,
      paymentModes: this.paymentModes$,
    }).pipe(map(({ etxn, paymentModes }) => this.accountsService.getEtxnSelectedPaymentMode(etxn, paymentModes)));
  }

  getDefaultPaymentModes(): Observable<ExtendedAccount> {
    return forkJoin({
      paymentModes: this.paymentModes$,
      orgUserSettings: this.orgUserSettings$,
      isPaymentModeConfigurationsEnabled: this.paymentModesService.checkIfPaymentModeConfigurationsIsEnabled(),
    }).pipe(
      map(({ paymentModes }) => {
        //If the user is creating expense from Corporate cards page, the default payment mode should be CCC
        if (this.isCreatedFromCCC) {
          const CCCAccount = paymentModes.find((paymentMode) => paymentMode.value.acc.type === AccountType.CCC);
          return CCCAccount.value;
        }

        return paymentModes[0].value;
      })
    );
  }

  getRecentProjects(): Observable<ExtendedProject[]> {
    return forkJoin({
      recentValues: this.recentlyUsedValues$,
      eou: this.authService.getEou(),
    }).pipe(
      switchMap(({ recentValues, eou }) => {
        const formControl = this.getFormControl('category') as { value: OrgCategory };
        const categoryId = formControl.value && (formControl.value.id as unknown as string[]);
        return this.recentlyUsedItemsService.getRecentlyUsedProjects({
          recentValues,
          eou,
          categoryIds: categoryId,
        });
      })
    );
  }

  getRecentCostCenters(): Observable<
    {
      label: string;
      value: CostCenter;
      selected?: boolean;
    }[]
  > {
    return forkJoin({
      costCenters: this.costCenters$,
      recentValue: this.recentlyUsedValues$,
    }).pipe(
      concatMap(({ costCenters, recentValue }) =>
        this.recentlyUsedItemsService.getRecentCostCenters(costCenters, recentValue)
      )
    );
  }

  getRecentCurrencies(): Observable<Currency[]> {
    return forkJoin({
      recentValues: this.recentlyUsedValues$,
      currencies: this.currencyService.getAll(),
    }).pipe(
      switchMap(({ recentValues, currencies }) =>
        this.recentlyUsedItemsService.getRecentCurrencies(currencies, recentValues)
      )
    );
  }

  getSelectedCostCenters(): Observable<CostCenter> {
    return this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.cost_center_id) {
          return of(etxn.tx.cost_center_id);
        } else {
          return forkJoin({
            orgSettings: this.orgSettingsService.get(),
            costCenters: this.costCenters$,
          }).pipe(
            map(({ orgSettings, costCenters }: { orgSettings: OrgSettings; costCenters: CostCenterOptions[] }) => {
              if (orgSettings.cost_centers.enabled) {
                if (costCenters.length === 1 && this.mode === 'add') {
                  return costCenters[0].value.id;
                }
              }
            })
          );
        }
      }),
      switchMap((costCenterId) => {
        if (costCenterId) {
          return this.costCenters$.pipe(
            map((costCenters) =>
              costCenters
                .map((res: CostCenterOptions) => res.value)
                .find((costCenter) => costCenter.id === costCenterId)
            )
          );
        } else {
          return of(null);
        }
      })
    );
  }

  getReceiptCount(): Observable<number> {
    return this.etxn$.pipe(
      switchMap((etxn) => this.fileService.findByTransactionId(etxn.tx.id)),
      map((fileObjs) => (fileObjs && fileObjs.length) || 0)
    );
  }

  setCategoryOnValueChange(): void {
    this.fg.controls.vendor_id.valueChanges.subscribe((vendor: { default_category: string }) => {
      if (this.fg.controls.category.pristine && !this.fg.controls.category.value && vendor && vendor.default_category) {
        this.setCategoryFromVendor(vendor.default_category);
      }
    });
  }

  setupFormInit(): void {
    const selectedProject$ = this.getSelectedProjects();

    const selectedCategory$ = this.getSelectedCategory();

    const selectedReport$ = this.getSelectedReport();

    const selectedPaymentMode$ = this.getSelectedPaymentModes();

    this.recentlyUsedCostCenters$ = this.getRecentCostCenters();

    const defaultPaymentMode$ = this.getDefaultPaymentModes();

    this.recentlyUsedProjects$ = this.getRecentProjects();

    this.recentlyUsedCurrencies$ = this.getRecentCurrencies();

    const selectedCostCenter$ = this.getSelectedCostCenters();

    const customExpenseFields$ = this.customInputsService.getAll(true).pipe(shareReplay(1));

    const txnReceiptsCount$ = this.getReceiptCount();

    from(this.loaderService.showLoader('Loading expense...', 15000))
      .pipe(
        switchMap(() =>
          forkJoin({
            etxn: this.etxn$,
            paymentMode: selectedPaymentMode$,
            project: selectedProject$,
            category: selectedCategory$,
            report: selectedReport$,
            costCenter: selectedCostCenter$,
            customExpenseFields: customExpenseFields$,
            txnReceiptsCount: txnReceiptsCount$,
            homeCurrency: this.currencyService.getHomeCurrency(),
            orgSettings: this.orgSettingsService.get(),
            defaultPaymentMode: defaultPaymentMode$,
            orgUserSettings: this.orgUserSettings$,
            recentValue: this.recentlyUsedValues$,
            recentProjects: this.recentlyUsedProjects$,
            recentCurrencies: this.recentlyUsedCurrencies$,
            recentCostCenters: this.recentlyUsedCostCenters$,
            recentCategories: this.recentlyUsedCategories$,
            taxGroups: this.taxGroups$,
          })
        ),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(
        ({
          etxn,
          paymentMode,
          project,
          category,
          report,
          costCenter,
          customExpenseFields,
          txnReceiptsCount,
          homeCurrency,
          orgSettings,
          defaultPaymentMode,
          orgUserSettings,
          recentValue,
          recentCategories,
          recentProjects,
          recentCurrencies,
          recentCostCenters,
          taxGroups,
        }) => {
          if (project) {
            this.selectedProject$.next(project);
          }

          if (costCenter) {
            this.selectedCostCenter$.next(costCenter);
          }

          const customInputs = this.customFieldsService.standardizeCustomFields(
            [],
            this.customInputsService.filterByCategory(customExpenseFields, etxn.tx.org_category_id)
          );

          const customInputValues: {
            name: string;
            value: string | number | string[] | number[] | Date | boolean | { display: string };
          }[] = customInputs
            .filter((customInput) => customInput.type !== 'DEPENDENT_SELECT')
            .map((customInput) => {
              const cpor =
                etxn.tx.custom_properties &&
                etxn.tx.custom_properties.find((customProp) => customProp.name === customInput.name);
              if (customInput.type === 'DATE') {
                return {
                  name: customInput.name,
                  value: (cpor && cpor.value && dayjs(new Date(cpor.value as string)).format('YYYY-MM-DD')) || null,
                };
              } else {
                return {
                  name: customInput.name,
                  value: (cpor && cpor.value) || null,
                };
              }
            });

          if (etxn.tx.amount && etxn.tx.currency) {
            this.fg.patchValue({
              currencyObj: {
                amount: etxn.tx.amount,
                currency: etxn.tx.currency,
                orig_amount: etxn.tx.orig_amount,
                orig_currency: etxn.tx.orig_currency,
              },
            });
          } else if (etxn.tx.user_amount && isNumber(etxn.tx.policy_amount) && etxn.tx.policy_amount < 0.0001) {
            this.fg.patchValue({
              currencyObj: {
                amount: etxn.tx.user_amount,
                currency: etxn.tx.currency,
                orig_amount: etxn.tx.orig_amount,
                orig_currency: etxn.tx.orig_currency,
              },
            });
          } else if (etxn.tx.currency !== homeCurrency) {
            this.fg.patchValue({
              currencyObj: {
                amount: null,
                currency: homeCurrency,
                orig_amount: null,
                orig_currency: etxn.tx.currency,
              },
            });
          } else if (etxn.tx.currency === homeCurrency) {
            this.fg.patchValue({
              currencyObj: {
                amount: null,
                currency: etxn.tx.currency,
                orig_amount: null,
                orig_currency: null,
              },
            });
          }

          if (etxn.tx.tax_group_id) {
            const tg = taxGroups.find((tg) => tg.id === etxn.tx.tax_group_id);
            this.fg.patchValue({
              tax_group: tg,
            });
          }

          // Check if auto-fills is enabled
          const isAutofillsEnabled =
            orgSettings.org_expense_form_autofills &&
            orgSettings.org_expense_form_autofills.allowed &&
            orgSettings.org_expense_form_autofills.enabled &&
            orgUserSettings.expense_form_autofills &&
            orgUserSettings.expense_form_autofills.allowed &&
            orgUserSettings.expense_form_autofills.enabled;

          // Check if recent projects exist
          const doRecentProjectIdsExist =
            isAutofillsEnabled &&
            recentValue &&
            recentValue.recent_project_ids &&
            recentValue.recent_project_ids.length > 0;

          if (recentProjects && recentProjects.length > 0) {
            this.recentProjects = recentProjects.map((item) => ({ label: item.project_name, value: item }));
          }

          this.recentCurrencies = recentCurrencies;

          let canAutofillCategory = true;
          /* Autofill project during these cases:
           * 1. Autofills is allowed and enabled
           * 2. During add expense - When project field is empty
           * 3. During edit expense - When the expense is in draft state and there is no project already added
           * 4. When there exists recently used project ids to auto-fill
           */
          if (
            orgSettings.projects.enabled &&
            doRecentProjectIdsExist &&
            (!etxn.tx.id || (etxn.tx.id && etxn.tx.state === 'DRAFT' && !etxn.tx.project_id))
          ) {
            const autoFillProject = recentProjects && recentProjects.length > 0 && recentProjects[0];

            if (autoFillProject) {
              project = autoFillProject;
              this.presetProjectId = project.project_id;

              if (recentCategories?.length) {
                // Check if the recent categories are allowed for the project auto-filled
                const isAllowedRecentCategories = recentCategories.map((category) =>
                  project.project_org_category_ids.includes(category.value.id)
                );

                // Set the updated allowed recent categories
                this.recentCategories = recentCategories.filter((category) =>
                  project.project_org_category_ids.includes(category.value.id)
                );

                // Only if the most recent category is allowed for the auto-filled project, category field can be auto-filled
                canAutofillCategory = isAllowedRecentCategories[0];
              }

              // Set the project preset value to the formGroup to trigger filtering of all allowed categories
              this.fg.patchValue({ project });
            }
          }

          if (canAutofillCategory) {
            // Check if recent categories exist
            category = this.getAutofillCategory({
              isAutofillsEnabled,
              recentValue,
              recentCategories,
              etxn,
              category,
            });

            /*
             * Patching the category value here to trigger 'customInputs$' to get the
             * custom inputs for this category. The patchValue call below uses
             * 'emitEvent: false' which does not trigger valueChanges.
             */
            this.fg.controls.category.patchValue(category);
          }

          // Check if recent cost centers exist
          const doRecentCostCenterIdsExist =
            isAutofillsEnabled &&
            recentValue &&
            recentValue.recent_cost_center_ids &&
            recentValue.recent_cost_center_ids.length > 0;

          if (recentCostCenters && recentCostCenters.length > 0) {
            this.recentCostCenters = recentCostCenters;
          }

          /* Autofill cost center during these cases:
           * 1. Autofills is allowed and enabled
           * 2. During add expense - When cost center field is empty
           * 3. During edit expense - When the expense is in draft state and there is no cost center already added - optional
           * 4. When there exists recently used cost center ids to auto-fill
           */
          if (
            doRecentCostCenterIdsExist &&
            (!etxn.tx.id || (etxn.tx.id && etxn.tx.state === 'DRAFT' && !etxn.tx.cost_center_id))
          ) {
            const autoFillCostCenter = recentCostCenters && recentCostCenters.length > 0 && recentCostCenters[0];

            if (autoFillCostCenter) {
              costCenter = autoFillCostCenter.value;
              this.presetCostCenterId = autoFillCostCenter.value.id;
              this.fg.patchValue({ costCenter });
            }
          }

          this.fg.patchValue(
            {
              project,
              category,
              dateOfSpend: etxn.tx.txn_dt && dayjs(etxn.tx.txn_dt).format('YYYY-MM-DD'),
              vendor_id: etxn.tx.vendor
                ? {
                    display_name: etxn.tx.vendor,
                  }
                : null,
              purpose: etxn.tx.purpose,
              report,
              tax_amount: etxn.tx.tax_amount,
              location_1: etxn.tx.locations[0],
              location_2: etxn.tx.locations[1],
              from_dt: etxn.tx.from_dt && dayjs(etxn.tx.from_dt).format('YYYY-MM-DD'),
              to_dt: etxn.tx.to_dt && dayjs(etxn.tx.to_dt).format('YYYY-MM-DD'),
              flight_journey_travel_class: etxn.tx.flight_journey_travel_class,
              flight_return_travel_class: etxn.tx.flight_return_travel_class,
              train_travel_class: etxn.tx.train_travel_class,
              bus_travel_class: etxn.tx.bus_travel_class,
              distance: etxn.tx.distance,
              distance_unit: etxn.tx.distance_unit,
              duplicate_detection_reason: etxn.tx.user_reason_for_duplicate_expenses,
              billable: etxn.tx.billable,
              custom_inputs: customInputValues,

              hotel_is_breakfast_provided: etxn.tx.hotel_is_breakfast_provided,
            },
            {
              emitEvent: false,
            }
          );

          this.fg.patchValue({
            costCenter,
          });
          this.initialFetch = false;

          setTimeout(() => {
            this.fg.patchValue({
              paymentMode: paymentMode || defaultPaymentMode,
            });

            this.fg.controls.custom_inputs.patchValue(customInputValues);
          }, 600);

          this.attachedReceiptsCount = txnReceiptsCount;
          this.canAttachReceipts = this.attachedReceiptsCount === 0;

          if (etxn.dataUrls && etxn.dataUrls.length) {
            this.newExpenseDataUrls = etxn.dataUrls;
            this.attachedReceiptsCount = this.newExpenseDataUrls.length;
          }

          this.setCategoryOnValueChange();

          if (this.activatedRoute.snapshot.params.extractData && this.activatedRoute.snapshot.params.image) {
            this.parseFile(
              JSON.parse(this.activatedRoute.snapshot.params.image as string) as {
                type: string;
                url: string;
                thumbnail?: string;
              }
            );
          }
        }
      );
  }

  getAutofillCategory(config: {
    isAutofillsEnabled: boolean;
    recentValue: RecentlyUsed;
    recentCategories: OrgCategoryListItem[];
    etxn: UnflattenedTransaction;
    category: OrgCategory;
  }): OrgCategory {
    const { isAutofillsEnabled, recentValue, recentCategories, etxn } = config;

    let category = config.category;

    const doRecentOrgCategoryIdsExist = isAutofillsEnabled && recentValue?.recent_org_category_ids?.length;

    if (recentCategories?.length) {
      this.recentCategories = recentCategories;
    }

    const isCategoryEmpty = !etxn.tx.org_category_id || etxn.tx.fyle_category?.toLowerCase() === 'unspecified';

    /*
     * Autofill should be applied iff:
     * - Autofilled is allowed and enabled for the user
     * - The user has some recently used categories present
     * - The transaction category is empty or 'unspecified'
     * - The user is on creating a new expense or editing a DRAFT expense
     */
    if (doRecentOrgCategoryIdsExist && isCategoryEmpty && (!etxn.tx.id || etxn.tx.state === 'DRAFT')) {
      const autoFillCategory = recentCategories.length && recentCategories[0];

      if (autoFillCategory) {
        category = autoFillCategory.value;
        this.presetCategoryId = autoFillCategory.value.id;
      }
    }
    return category;
  }

  setCategoryFromVendor(defaultCategory: string): void {
    this.categoriesService.getCategoryByName(defaultCategory).subscribe((category) => {
      if (category) {
        this.trackingService.setCategoryFromVendor(category);
        this.fg.controls.category.patchValue(category);
      }
    });
  }

  getCategoryOnEdit(category: OrgCategory): Observable<OrgCategory | null> {
    return forkJoin({
      orgUserSettings: this.orgUserSettingsService.get(),
      orgSettings: this.orgSettingsService.get(),
      recentValues: this.recentlyUsedValues$,
      recentCategories: this.recentlyUsedCategories$,
      etxn: this.etxn$,
    }).pipe(
      switchMap(
        ({
          orgUserSettings,
          orgSettings,
          recentValues,
          recentCategories,
          etxn,
        }: {
          orgUserSettings: OrgUserSettings;
          orgSettings: OrgSettings;
          recentValues: RecentlyUsed;
          recentCategories: OrgCategoryListItem[];
          etxn: UnflattenedTransaction;
        }) => {
          const isExpenseDraft = etxn.tx.state === 'DRAFT';
          const isExpenseCategoryUnspecified = etxn.tx?.fyle_category?.toLowerCase() === 'unspecified';
          if (this.initialFetch && etxn.tx.org_category_id && !isExpenseDraft && !isExpenseCategoryUnspecified) {
            return this.categoriesService.getCategoryById(etxn.tx.org_category_id).pipe(
              map((selectedCategory) => ({
                orgUserSettings,
                orgSettings,
                recentValues,
                recentCategories,
                etxn,
                selectedCategory,
              }))
            );
          }
          return of({
            orgUserSettings,
            orgSettings,
            recentValues,
            recentCategories,
            etxn,
            selectedCategory: null as OrgCategory,
          });
        }
      ),
      map(({ orgUserSettings, orgSettings, recentValues, recentCategories, etxn, selectedCategory }) => {
        const isAutofillsEnabled =
          orgSettings.org_expense_form_autofills &&
          orgSettings.org_expense_form_autofills.allowed &&
          orgSettings.org_expense_form_autofills.enabled &&
          orgUserSettings.expense_form_autofills &&
          orgUserSettings.expense_form_autofills.allowed &&
          orgUserSettings.expense_form_autofills.enabled;
        const isCategoryExtracted = etxn.tx?.extracted_data?.category;
        if (this.initialFetch) {
          if (etxn.tx.org_category_id) {
            if (etxn.tx.state === 'DRAFT' && etxn.tx.fyle_category?.toLowerCase() === 'unspecified') {
              return this.getAutofillCategory({
                isAutofillsEnabled,
                recentValue: recentValues,
                recentCategories,
                etxn,
                category,
              });
            } else {
              return selectedCategory;
            }
          } else if (
            etxn.tx.state === 'DRAFT' &&
            !isCategoryExtracted &&
            (!etxn.tx.org_category_id || etxn.tx.fyle_category?.toLowerCase() === 'unspecified')
          ) {
            return this.getAutofillCategory({
              isAutofillsEnabled,
              recentValue: recentValues,
              recentCategories,
              etxn,
              category,
            });
          } else {
            return null;
          }
        } else {
          return category;
        }
      })
    );
  }

  getCategoryOnAdd(category: OrgCategory): Observable<OrgCategory> {
    if (category) {
      return of(category);
    } else {
      return forkJoin({
        orgUserSettings: this.orgUserSettingsService.get(),
        orgSettings: this.orgSettingsService.get(),
        recentValues: this.recentlyUsedValues$,
        recentCategories: this.recentlyUsedCategories$,
        etxn: this.etxn$,
      }).pipe(
        map(({ orgUserSettings, orgSettings, recentValues, recentCategories, etxn }) => {
          const isAutofillsEnabled =
            orgSettings.org_expense_form_autofills &&
            orgSettings.org_expense_form_autofills.allowed &&
            orgSettings.org_expense_form_autofills.enabled &&
            orgUserSettings.expense_form_autofills &&
            orgUserSettings.expense_form_autofills.allowed &&
            orgUserSettings.expense_form_autofills.enabled;
          const isCategoryExtracted = etxn.tx && etxn.tx.extracted_data && etxn.tx.extracted_data.category;
          if (
            !isCategoryExtracted &&
            (!etxn.tx.org_category_id ||
              (etxn.tx.fyle_category && etxn.tx.fyle_category.toLowerCase() === 'unspecified'))
          ) {
            return this.getAutofillCategory({
              isAutofillsEnabled,
              recentValue: recentValues,
              recentCategories,
              etxn,
              category: null,
            });
          } else {
            return null;
          }
        })
      );
    }
  }

  setupCustomFields(): void {
    this.initialFetch = true;

    const customExpenseFields$ = this.customInputsService.getAll(true).pipe(shareReplay(1));

    const categoryControl = this.getFormControl('category');

    const customInputsFeilds$: Observable<TxnCustomProperties[]> = categoryControl.valueChanges.pipe(
      filter((category) => !!category),
      startWith({}),
      distinctUntilChanged(),
      switchMap((category) =>
        iif(
          () => this.mode === 'add',
          this.getCategoryOnAdd(category as OrgCategory),
          this.getCategoryOnEdit(category as OrgCategory)
        )
      ),
      switchMap((category: OrgCategory) => {
        const formValue = this.fg.value as {
          custom_inputs: CustomInput[];
        };
        return customExpenseFields$.pipe(
          map((customFields: ExpenseField[]) =>
            customFields.filter((customField) => customField.type !== 'DEPENDENT_SELECT')
          ),
          map((customFields: ExpenseField[]) =>
            this.customFieldsService.standardizeCustomFields(
              formValue.custom_inputs || [],
              this.customInputsService.filterByCategory(customFields, category && category.id)
            )
          )
        );
      }),
      map((customFields: TxnCustomProperties[]) =>
        customFields.map((customField: TxnCustomProperties) => {
          if (customField.options) {
            const customFieldsOptions = customField.options as string[];
            customField.options = customFieldsOptions.map((option) => ({
              label: option,
              value: option,
            }));
          }
          return customField;
        })
      ),
      switchMap((customFields: TxnCustomProperties[]) =>
        this.isConnected$.pipe(
          take(1),
          map((isConnected: boolean) => {
            const customFieldsFormArray = this.fg.controls.custom_inputs as FormArray;
            customFieldsFormArray.clear();
            for (const customField of customFields) {
              customFieldsFormArray.push(
                this.formBuilder.group({
                  name: [customField.name],
                  // Since in boolean, required validation is kinda unnecessary
                  value: [
                    customField.type !== 'DATE'
                      ? customField.value
                      : customField.value && dayjs(customField.value as string).format('YYYY-MM-DD'),
                    customField.type !== 'BOOLEAN' && customField.mandatory && isConnected && Validators.required,
                  ],
                })
              );
            }
            customFieldsFormArray.updateValueAndValidity();
            return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
          })
        )
      ),
      shareReplay(1)
    );

    this.customInputs$ = customInputsFeilds$;

    this.dependentFields$ = customExpenseFields$.pipe(
      map((customFields) => customFields.filter((customField) => customField.type === 'DEPENDENT_SELECT'))
    );
  }

  generateTxnFieldsMap(): Observable<Partial<ExpenseFieldsObj>> {
    return this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue: FormValue) =>
        this.expenseFieldsService.getAllMap().pipe(
          switchMap((expenseFieldsMap) => {
            const fields = [
              'purpose',
              'txn_dt',
              'vendor_id',
              'cost_center_id',
              'project_id',
              'from_dt',
              'to_dt',
              'location1',
              'location2',
              'distance',
              'distance_unit',
              'flight_journey_travel_class',
              'flight_return_travel_class',
              'train_travel_class',
              'bus_travel_class',
              'billable',
              'tax_group_id',
              'org_category_id',
            ];
            return this.expenseFieldsService.filterByOrgCategoryId(expenseFieldsMap, fields, formValue.category);
          })
        )
      )
    );
  }

  updateFormForExpenseFields(txnFieldsMap$: Observable<Partial<ExpenseFieldsObj>>): void {
    this.etxn$
      .pipe(
        switchMap(() => txnFieldsMap$),
        map((txnFields) => this.expenseFieldsService.getDefaultTxnFieldValues(txnFields))
      )
      .subscribe((defaultValues) => {
        this.billableDefaultValue = defaultValues.billable;
        const keyToControlMap: {
          [id: string]: AbstractControl;
        } = {
          purpose: this.fg.controls.purpose,
          txn_dt: this.fg.controls.dateOfSpend,
          vendor_id: this.fg.controls.vendor_id,
          cost_center_id: this.fg.controls.costCenter,
          from_dt: this.fg.controls.from_dt,
          to_dt: this.fg.controls.to_dt,
          location1: this.fg.controls.location_1,
          location2: this.fg.controls.location_2,
          distance: this.fg.controls.distance,
          distance_unit: this.fg.controls.distance_unit,
          flight_journey_travel_class: this.fg.controls.flight_journey_travel_class,
          flight_return_travel_class: this.fg.controls.flight_return_travel_class,
          train_travel_class: this.fg.controls.train_travel_class,
          bus_travel_class: this.fg.controls.bus_travel_class,
          billable: this.fg.controls.billable,
          tax_group_id: this.fg.controls.tax_group,
        };

        for (const defaultValueColumn in defaultValues) {
          if (defaultValues.hasOwnProperty(defaultValueColumn)) {
            const control = keyToControlMap[defaultValueColumn];

            if (
              !['vendor_id', 'billable', 'tax_group_id'].includes(defaultValueColumn) &&
              !control.value &&
              !control.touched
            ) {
              control.patchValue(defaultValues[defaultValueColumn]);
            } else if (defaultValueColumn === 'vendor_id' && !control.value && !control.touched) {
              control.patchValue({
                display_name: defaultValues[defaultValueColumn],
              });
            } else if (
              defaultValueColumn === 'billable' &&
              this.fg.controls.project.value &&
              (control.value === null || control.value === undefined) &&
              !control.touched
            ) {
              control.patchValue(defaultValues[defaultValueColumn]);
            } else if (
              defaultValueColumn === 'tax_group_id' &&
              !control.value &&
              !control.touched &&
              control.value !== ''
            ) {
              this.taxGroups$.subscribe((taxGroups) => {
                const tg = taxGroups.find((tg) => (tg.name = defaultValues[defaultValueColumn]));
                control.patchValue(tg);
              });
            }
          }
        }
      });
  }

  setupExpenseFields(): void {
    const txnFieldsMap$ = this.generateTxnFieldsMap();

    this.txnFields$ = txnFieldsMap$.pipe(
      map((expenseFieldsMap: ExpenseFieldsObj) => {
        if (expenseFieldsMap) {
          for (const tfc of Object.keys(expenseFieldsMap)) {
            const expenseField = expenseFieldsMap[tfc] as ExpenseField;
            const options = expenseField.options as string[];
            const ifOptions = expenseField.options && expenseField.options.length > 0;
            if (ifOptions) {
              if (tfc === 'vendor_id') {
                expenseField.options = options.map((value) => ({
                  label: value,
                  value: {
                    display_name: value,
                  },
                }));
              } else {
                expenseField.options = options.map((value) => ({
                  label: value,
                  value,
                }));
              }
            }
          }
        }
        return expenseFieldsMap;
      }),
      shareReplay(1)
    );

    forkJoin({
      txnFields: this.txnFields$.pipe(take(1)),
      orgSettings: this.orgSettingsService.get(),
      isIndividualProjectsEnabled: this.isIndividualProjectsEnabled$,
      individualProjectIds: this.individualProjectIds$,
    }).subscribe(
      ({
        orgSettings,
        isIndividualProjectsEnabled,
        individualProjectIds,
        txnFields,
      }: {
        orgSettings: OrgSettings;
        isIndividualProjectsEnabled: boolean;
        individualProjectIds: number[];
        txnFields: ExpenseFieldsObj;
      }) => {
        const projectFormControl = this.fg.controls.project;
        projectFormControl.clearValidators();
        if (txnFields?.project_id?.is_mandatory) {
          projectFormControl.setValidators(
            orgSettings.projects.enabled && isIndividualProjectsEnabled && individualProjectIds.length === 0
              ? null
              : Validators.required
          );
          projectFormControl.updateValueAndValidity();
        }
      }
    );

    combineLatest({
      txnFields: this.txnFields$,
      costCenters: this.costCenters$,
    })
      .pipe(distinctUntilChanged((a, b) => isEqual(a, b)))
      .subscribe(({ costCenters, txnFields }: { txnFields: ExpenseFieldsObj; costCenters: CostCenterOptions[] }) => {
        const costCenterControl = this.fg.controls.costCenter;
        costCenterControl.clearValidators();
        if (txnFields?.cost_center_id?.is_mandatory) {
          costCenterControl.setValidators(costCenters?.length > 0 ? Validators.required : null);
        }
        //If cost center field is not present in txnFields, then clear its value
        else if (txnFields.cost_center_id === undefined) {
          costCenterControl.setValue(null);
        }
        costCenterControl.updateValueAndValidity();
      });

    this.txnFields$
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        switchMap((txnFields) =>
          forkJoin({
            isConnected: this.isConnected$.pipe(take(1)),
            taxGroups: this.taxGroups$,
            filteredCategories: this.filteredCategories$.pipe(take(1)),
          }).pipe(
            map(({ isConnected, taxGroups, filteredCategories }) => ({
              isConnected,
              txnFields,
              taxGroups,
              filteredCategories,
            }))
          )
        )
      )
      .subscribe(({ isConnected, txnFields, taxGroups, filteredCategories }) => {
        const keyToControlMap: {
          [id: string]: AbstractControl;
        } = {
          purpose: this.fg.controls.purpose,
          txn_dt: this.fg.controls.dateOfSpend,
          vendor_id: this.fg.controls.vendor_id,
          from_dt: this.fg.controls.from_dt,
          to_dt: this.fg.controls.to_dt,
          location1: this.fg.controls.location_1,
          location2: this.fg.controls.location_2,
          distance: this.fg.controls.distance,
          distance_unit: this.fg.controls.distance_unit,
          flight_journey_travel_class: this.fg.controls.flight_journey_travel_class,
          flight_return_travel_class: this.fg.controls.flight_return_travel_class,
          train_travel_class: this.fg.controls.train_travel_class,
          bus_travel_class: this.fg.controls.bus_travel_class,
          billable: this.fg.controls.billable,
          tax_group_id: this.fg.controls.tax_group,
          org_category_id: this.fg.controls.category,
        };

        for (const control of Object.values(keyToControlMap)) {
          control.clearValidators();
          control.updateValueAndValidity();
        }

        const formValues = this.getFormValues();

        // setup validations
        const txnFieldsCopy = cloneDeep(txnFields);
        delete txnFieldsCopy.project_id;
        delete txnFieldsCopy.cost_center_id;
        for (const txnFieldKey of Object.keys(txnFieldsCopy)) {
          const control = keyToControlMap[txnFieldKey];
          const expenseField = txnFieldsCopy[txnFieldKey] as ExpenseField;
          if (expenseField.is_mandatory) {
            if (txnFieldKey === 'vendor_id') {
              if (isConnected) {
                control.setValidators(Validators.compose([Validators.required, this.merchantValidator]));
              } else {
                control.setValidators(Validators.compose([this.merchantValidator]));
              }
            } else if (
              [
                'location1',
                'location2',
                'from_dt',
                'to_dt',
                'flight_journey_travel_class',
                'flight_return_travel_class',
                'train_travel_class',
                'bus_travel_class',
              ].includes(txnFieldKey)
            ) {
              if (
                formValues.category &&
                formValues.category.fyle_category &&
                this.systemCategories?.includes(formValues.category.fyle_category) &&
                isConnected
              ) {
                control.setValidators(Validators.required);
              }
            } else if (['distance', 'distance_unit'].includes(txnFieldKey)) {
              if (
                formValues.category &&
                formValues.category.fyle_category &&
                ['Taxi'].includes(formValues.category.fyle_category) &&
                isConnected
              ) {
                control.setValidators(Validators.required);
              }
            } else if (txnFieldKey === 'txn_dt') {
              control.setValidators(
                isConnected ? Validators.compose([Validators.required, this.customDateValidator]) : null
              );
            } else if (txnFieldKey === 'tax_group_id') {
              control.setValidators(isConnected && taxGroups && taxGroups.length > 0 ? Validators.required : null);
            } else if (txnFieldKey === 'org_category_id') {
              control.setValidators(
                isConnected && filteredCategories && filteredCategories.length > 0 ? Validators.required : null
              );
            } else {
              control.setValidators(isConnected ? Validators.required : null);
            }
          }
          control.updateValueAndValidity();
        }
        this.fg.updateValueAndValidity();
      });

    this.updateFormForExpenseFields(txnFieldsMap$);
  }

  setupFilteredCategories(activeCategories$: Observable<OrgCategory[]>): void {
    const projectControl = this.fg.controls.project as {
      value: {
        project_id: number;
      };
    };

    const categoryControl = this.fg.value as {
      category: {
        id: number;
      };
    };
    this.filteredCategories$ = this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.project_id) {
          return this.projectsService.getbyId(etxn.tx.project_id);
        } else if (projectControl?.value?.project_id) {
          return this.projectsService.getbyId(projectControl.value.project_id);
        } else {
          return of(null);
        }
      }),
      switchMap((initialProject) =>
        this.fg.controls.project.valueChanges.pipe(
          tap((initialProject) => {
            if (!initialProject) {
              this.fg.patchValue({ billable: false });
            } else {
              this.fg.patchValue({ billable: this.billableDefaultValue });
            }
          }),
          startWith(initialProject),
          concatMap((project: ExtendedProject) =>
            activeCategories$.pipe(
              map((activeCategories) => this.projectsService.getAllowedOrgCategoryIds(project, activeCategories))
            )
          ),
          map((categories) => categories.map((category) => ({ label: category.displayName, value: category })))
        )
      ),
      shareReplay(1)
    );

    this.filteredCategories$.subscribe((categories) => {
      if (
        categoryControl.category &&
        categoryControl.category.id &&
        !categories.some(
          (category: { value: { id: number } }) =>
            categoryControl.category && categoryControl.category.id === category.value.id
        )
      ) {
        this.fg.controls.category.reset();
      }
    });
  }

  getEditExpenseObservable(): Observable<UnflattenedTransaction> {
    return this.transactionService.getETxnUnflattened(this.activatedRoute.snapshot.params.id as string).pipe(
      tap((etxn) => (this.isIncompleteExpense = etxn.tx.state === 'DRAFT')),
      switchMap((etxn) => {
        this.source = etxn.tx.source || 'MOBILE';
        if (etxn.tx.state === 'DRAFT' && etxn.tx.extracted_data) {
          if (etxn.tx.extracted_data.amount && !etxn.tx.amount) {
            etxn.tx.amount = etxn.tx.extracted_data.amount;
          }

          if (etxn.tx.extracted_data.currency && !etxn.tx.currency) {
            etxn.tx.currency = etxn.tx.extracted_data.currency;
          }

          if (etxn.tx.extracted_data.date) {
            etxn.tx.txn_dt = this.dateService.getUTCDate(new Date(etxn.tx.extracted_data.date));
          }

          if (etxn.tx.extracted_data.invoice_dt) {
            etxn.tx.txn_dt = this.dateService.getUTCDate(new Date(etxn.tx.extracted_data.invoice_dt));
          }

          if (etxn.tx.extracted_data.vendor && !etxn.tx.vendor) {
            etxn.tx.vendor = etxn.tx.extracted_data.vendor;
          }

          if (
            etxn.tx.extracted_data.category &&
            etxn.tx.fyle_category &&
            etxn.tx.fyle_category.toLowerCase() === 'unspecified'
          ) {
            const categoryName = etxn.tx.extracted_data.category || 'unspecified';
            return this.categoriesService.getCategoryByName(categoryName).pipe(
              map((selectedCategory) => {
                etxn.tx.org_category_id = selectedCategory && selectedCategory.id;
                return etxn;
              })
            );
          }
          return of(etxn);
        }
        return of(etxn);
      }),
      shareReplay(1)
    );
  }

  goToPrev(): void {
    this.activeIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex as string, 10);
    if (this.reviewList[+this.activeIndex - 1]) {
      this.transactionService.getETxnUnflattened(this.reviewList[+this.activeIndex - 1]).subscribe((etxn) => {
        this.goToTransaction(etxn, this.reviewList, +this.activeIndex - 1);
      });
    }
  }

  goToNext(): void {
    this.activeIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex as string, 10);
    if (this.reviewList[+this.activeIndex + 1]) {
      this.transactionService.getETxnUnflattened(this.reviewList[+this.activeIndex + 1]).subscribe((etxn) => {
        this.goToTransaction(etxn, this.reviewList, +this.activeIndex + 1);
      });
    }
  }

  goToTransaction(expense: UnflattenedTransaction, reviewList: string[], activeIndex: number): void {
    let category: string;

    if (expense.tx.org_category) {
      category = expense.tx.org_category.toLowerCase();
    }

    if (category === 'mileage') {
      this.router.navigate([
        '/',
        'enterprise',
        'add_edit_mileage',
        {
          id: expense.tx.id,
          txnIds: JSON.stringify(reviewList),
          activeIndex,
        },
      ]);
    } else if (category === 'per diem') {
      this.router.navigate([
        '/',
        'enterprise',
        'add_edit_per_diem',
        {
          id: expense.tx.id,
          txnIds: JSON.stringify(reviewList),
          activeIndex,
        },
      ]);
    } else {
      this.router.navigate([
        '/',
        'enterprise',
        'add_edit_expense',
        {
          id: expense.tx.id,
          txnIds: JSON.stringify(reviewList),
          activeIndex,
        },
      ]);
    }
  }

  customDateValidator(control: AbstractControl): ValidationErrors {
    const today = new Date();
    const minDate = dayjs(new Date('Jan 1, 2001'));
    const maxDate = dayjs(new Date(today)).add(1, 'day');
    const passedInDate = control.value && dayjs(new Date(control.value as string));
    if (passedInDate) {
      return passedInDate.isBefore(maxDate) && passedInDate.isAfter(minDate)
        ? null
        : {
            invalidDateSelection: true,
          };
    }
  }

  initClassObservables(): void {
    this.isNewReportsFlowEnabled = false;
    this.onPageExit$ = new Subject();
    this.projectDependentFieldsRef?.ngOnInit();
    this.costCenterDependentFieldsRef?.ngOnInit();
    this.selectedProject$ = new BehaviorSubject<ExtendedProject>(null);
    this.selectedCostCenter$ = new BehaviorSubject<CostCenter>(null);
    const fn = (): void => {
      this.showClosePopup();
    };
    const priority = BackButtonActionPriority.MEDIUM;
    this.hardwareBackButtonAction = this.platformHandlerService.registerBackButtonAction(priority, fn);
  }

  setupSelectedProjectObservable(): void {
    this.fg.controls.project.valueChanges
      .pipe(takeUntil(this.onPageExit$))
      .subscribe((project: ExtendedProject) => this.selectedProject$.next(project));
  }

  setupSelectedCostCenterObservable(): void {
    this.fg.controls.costCenter.valueChanges.pipe(takeUntil(this.onPageExit$)).subscribe((costCenter: CostCenter) => {
      this.selectedCostCenter$.next(costCenter);
    });
  }

  getCCCpaymentMode(): void {
    this.isCCCPaymentModeSelected$ = this.fg.controls.paymentMode.valueChanges.pipe(
      map((paymentMode: ExtendedAccount) => paymentMode?.acc?.type === AccountType.CCC)
    );
  }

  clearCategoryOnValueChange(): void {
    this.fg.controls.category.valueChanges.subscribe(() => {
      if (this.fg.controls.category.dirty) {
        [
          'from_dt',
          'to_dt',
          'location_1',
          'location_2',
          'distance',
          'distance_unit',
          'flight_journey_travel_class',
          'flight_return_travel_class',
          'train_travel_class',
          'bus_travel_class',
        ].forEach((categoryDependentField) => {
          this.fg.controls[categoryDependentField]?.patchValue(null);
        });
      }
    });
  }

  initCCCTxn(): void {
    const bankTxn =
      this.activatedRoute.snapshot.params.bankTxn &&
      (JSON.parse(this.activatedRoute.snapshot.params.bankTxn as string) as CCCExpUnflattened);
    this.showSelectedTransaction = true;
    this.selectedCCCTransaction = bankTxn.ccce;
    let cccAccountNumber: string;
    if (bankTxn.flow && bankTxn.flow === 'newCCCFlow') {
      cccAccountNumber = this.selectedCCCTransaction.corporate_credit_card_account_number;
    }
    this.cardEndingDigits = cccAccountNumber && cccAccountNumber.slice(-4);
    this.selectedCCCTransaction.corporate_credit_card_account_number = cccAccountNumber;
    this.isCreatedFromCCC = true;
  }

  handleCCCExpenses(etxn: UnflattenedTransaction): Subscription {
    return this.corporateCreditCardExpenseService
      .getEccceByGroupId(etxn.tx.corporate_credit_card_expense_group_id)
      .subscribe((matchedExpense: CCCExpUnflattened[]) => {
        this.matchedCCCTransaction = matchedExpense[0].ccce;
        this.selectedCCCTransaction = this.matchedCCCTransaction;
        this.cardEndingDigits = (
          this.selectedCCCTransaction.corporate_credit_card_account_number
            ? this.selectedCCCTransaction.corporate_credit_card_account_number
            : this.selectedCCCTransaction.card_or_account_number
        ).slice(-4);

        etxn.tx.matchCCCId = this.selectedCCCTransaction.id;

        const txnDt = dayjs(this.selectedCCCTransaction.txn_dt).format('MMM D, YYYY');

        this.selectedCCCTransaction.displayObject =
          txnDt +
          ' - ' +
          (this.selectedCCCTransaction.vendor
            ? this.selectedCCCTransaction.vendor
            : this.selectedCCCTransaction.description) +
          this.selectedCCCTransaction.amount;

        if (this.selectedCCCTransaction) {
          this.cardNumber = this.selectedCCCTransaction.card_or_account_number;
        }
      });
  }

  getSplitExpenses(splitExpenses: Expense[]): void {
    this.isSplitExpensesPresent = splitExpenses.length > 1;
    if (this.isSplitExpensesPresent) {
      this.alreadyApprovedExpenses = splitExpenses.filter((txn) => ['DRAFT', 'COMPLETE'].indexOf(txn.tx_state) === -1);

      this.canEditCCCMatchedSplitExpense = this.alreadyApprovedExpenses.length < 1;
    }
  }

  initSplitTxn(orgSettings$: Observable<OrgSettings>): void {
    orgSettings$
      .pipe(
        switchMap((orgSettings) => this.etxn$.pipe(map((etxn) => ({ etxn, orgSettings })))),
        filter(
          ({ orgSettings, etxn }: { orgSettings: OrgSettings; etxn: UnflattenedTransaction }) =>
            this.getCCCSettings(orgSettings) || !!etxn.tx.corporate_credit_card_expense_group_id
        ),
        filter(({ etxn }) => etxn.tx.corporate_credit_card_expense_group_id && !!etxn.tx.txn_dt),
        switchMap(({ etxn }) =>
          this.transactionService.getSplitExpenses(etxn.tx.split_group_id).pipe(
            map((splitExpenses) => ({
              etxn,
              splitExpenses,
            }))
          )
        )
      )
      .subscribe(({ etxn, splitExpenses }) => {
        if (splitExpenses && splitExpenses.length > 0) {
          this.getSplitExpenses(splitExpenses);
        }

        this.handleCCCExpenses(etxn);
      });
  }

  getIsPolicyExpense(etxn: Expense): boolean {
    return isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001;
  }

  getCheckSpiltExpense(etxn: UnflattenedTransaction): boolean {
    return etxn?.tx?.split_group_id !== etxn?.tx?.id;
  }

  getDebitCCCExpense(etxn: UnflattenedTransaction): boolean {
    return !!etxn?.tx?.corporate_credit_card_expense_group_id && etxn.tx.amount > 0;
  }

  getDismissCCCExpense(etxn: UnflattenedTransaction): boolean {
    return !!etxn?.tx?.corporate_credit_card_expense_group_id && etxn.tx.amount < 0;
  }

  getRemoveCCCExpense(etxn: UnflattenedTransaction): boolean {
    return (
      !!etxn?.tx?.corporate_credit_card_expense_group_id &&
      ['APPROVER_PENDING', 'COMPLETE', 'DRAFT'].includes(etxn.tx.state)
    );
  }

  ionViewWillEnter(): void {
    this.initClassObservables();

    this.newExpenseDataUrls = [];

    from(this.tokenService.getClusterDomain()).subscribe((clusterDomain) => {
      this.clusterDomain = clusterDomain;
    });

    this.navigateBack = this.activatedRoute.snapshot.params.navigate_back as boolean;
    this.expenseStartTime = new Date().getTime();
    this.fg = this.formBuilder.group({
      currencyObj: [, this.currencyObjValidator],
      paymentMode: [, Validators.required],
      project: [],
      category: [],
      dateOfSpend: [, this.customDateValidator],
      vendor_id: [, this.merchantValidator],
      purpose: [],
      report: [],
      tax_group: [],
      tax_amount: [],
      location_1: [],
      location_2: [],
      from_dt: [],
      to_dt: [],
      flight_journey_travel_class: [],
      flight_return_travel_class: [],
      train_travel_class: [],
      bus_travel_class: [],
      distance: [],
      distance_unit: [],
      custom_inputs: new FormArray([]),
      duplicate_detection_reason: [],
      billable: [],
      costCenter: [],
      hotel_is_breakfast_provided: [],
      project_dependent_fields: this.formBuilder.array([]),
      cost_center_dependent_fields: this.formBuilder.array([]),
    });

    this.systemCategories = this.categoriesService.getSystemCategories();
    this.breakfastSystemCategories = this.categoriesService.getBreakfastSystemCategories();
    this.autoSubmissionReportName$ = this.reportService.getAutoSubmissionReportName();

    this.setupSelectedProjectObservable();

    this.setupSelectedCostCenterObservable();

    this.getCCCpaymentMode();

    this.isCreatedFromCCC = (!this.activatedRoute.snapshot.params.id &&
      this.activatedRoute.snapshot.params.bankTxn) as boolean;

    this.isCreatedFromPersonalCard = (!this.activatedRoute.snapshot.params.id &&
      this.activatedRoute.snapshot.params.personalCardTxn) as boolean;

    this.setUpTaxCalculations();

    const orgSettings$ = this.orgSettingsService.get();
    this.orgUserSettings$ = this.orgUserSettingsService.get();
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
    const accounts$ = this.accountsService.getEMyAccounts();

    this.isAdvancesEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          (orgSettings.advances && orgSettings.advances.enabled) ||
          (orgSettings.advance_requests && orgSettings.advance_requests.enabled)
      )
    );

    this.taxGroups$ = orgSettings$.pipe(
      switchMap((orgSettings) => {
        if (orgSettings && orgSettings.tax_settings && orgSettings.tax_settings.enabled) {
          return this.taxGroupService.get().pipe(shareReplay(1));
        } else {
          return of(null);
        }
      })
    );

    this.taxGroupsOptions$ = this.taxGroups$.pipe(
      map((taxGroupsOptions) => taxGroupsOptions?.map((tg) => ({ label: tg.name, value: tg })))
    );

    orgSettings$.subscribe((orgSettings) => {
      this.isCorporateCreditCardEnabled = this.getCCCSettings(orgSettings);

      this.isNewReportsFlowEnabled = orgSettings?.simplified_report_closure_settings?.enabled || false;

      this.isDraftExpenseEnabled =
        orgSettings.ccc_draft_expense_settings &&
        orgSettings.ccc_draft_expense_settings.allowed &&
        orgSettings.ccc_draft_expense_settings.enabled;
    });

    this.setupNetworkWatcher();

    this.recentlyUsedValues$ = this.isConnected$.pipe(
      take(1),
      switchMap((isConnected) => {
        if (isConnected) {
          return this.recentlyUsedItemsService.getRecentlyUsed();
        } else {
          return of(null);
        }
      }),
      shareReplay(1)
    );

    this.individualProjectIds$ = this.orgUserSettings$.pipe(
      map((orgUserSettings: OrgUserSettings) => orgUserSettings.project_ids || []),
      shareReplay(1)
    );

    this.isIndividualProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.advanced_projects && orgSettings.advanced_projects.enable_individual_projects)
    );

    this.isProjectsVisible$ = forkJoin({
      individualProjectIds: this.individualProjectIds$,
      isIndividualProjectsEnabled: this.isIndividualProjectsEnabled$,
      projectsCount: this.projectsService.getProjectCount(),
    }).pipe(
      map(({ individualProjectIds, isIndividualProjectsEnabled, projectsCount }) => {
        if (!isIndividualProjectsEnabled) {
          return projectsCount > 0;
        } else {
          return individualProjectIds.length > 0;
        }
      })
    );

    this.setupCostCenters();

    this.mode = this.activatedRoute.snapshot.params.id ? 'edit' : 'add';

    // If User has already clicked on See More he need not to click again and again
    from(this.storageService.get<boolean>('isExpandedView')).subscribe((expandedView) => {
      this.isExpandedView = this.mode !== 'add' || expandedView;
    });

    this.activeIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex as string, 10);
    this.reviewList =
      this.activatedRoute.snapshot.params.txnIds &&
      (JSON.parse(this.activatedRoute.snapshot.params.txnIds as string) as string[]);

    this.title = 'Add Expense';
    this.title =
      this.activeIndex > -1 && this.reviewList && this.activeIndex < this.reviewList.length ? 'Review' : 'Edit';

    this.isProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.projects && orgSettings.projects.enabled)
    );

    this.comments$ = this.statusService.find('transactions', this.activatedRoute.snapshot.params.id as string);

    this.isSplitExpenseAllowed$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.expense_settings.split_expense_settings.enabled)
    );

    this.setupBalanceFlag();

    const today = new Date();
    this.minDate = dayjs(new Date('Jan 1, 2001')).format('YYYY-MM-D');
    this.maxDate = dayjs(this.dateService.addDaysToDate(today, 1)).format('YYYY-MM-D');

    const activeCategories$ = this.getActiveCategories();

    this.paymentAccount$ = accounts$.pipe(
      map((accounts) => {
        if (!this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn) {
          return accounts.find((account) => account.acc.type === AccountType.CCC);
        } else {
          return null;
        }
      })
    );

    this.isCCCAccountSelected$ = accounts$.pipe(
      map((accounts) => {
        if (!this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn) {
          return accounts.some((account) => account.acc.type === AccountType.CCC);
        } else {
          return false;
        }
      })
    );

    const newExpensePipe$ = this.getNewExpenseObservable();

    const editExpensePipe$ = this.getEditExpenseObservable();

    this.etxn$ = iif(() => this.activatedRoute.snapshot.params.id as boolean, editExpensePipe$, newExpensePipe$).pipe(
      shareReplay(1)
    ) as Observable<UnflattenedTransaction>;

    this.attachments$ = this.loadAttachments$.pipe(
      switchMap(() =>
        this.etxn$.pipe(
          switchMap((etxn) => this.fileService.findByTransactionId(etxn.tx.id)),
          switchMap((fileObjs) => from(fileObjs)),
          concatMap((fileObj: FileObject) =>
            this.fileService.downloadUrl(fileObj.id).pipe(
              map((downloadUrl) => {
                fileObj.url = downloadUrl;
                const details = this.getReceiptDetails(fileObj);
                fileObj.type = details.type;
                fileObj.thumbnail = details.thumbnail;
                return fileObj;
              })
            )
          ),
          reduce((acc: FileObject[], curr) => acc.concat(curr), [])
        )
      )
    );

    this.paymentModes$ = this.getPaymentModes();

    // Show payment mode if it is not a CCC expense
    this.showPaymentMode = !this.isCccExpense;

    this.initSplitTxn(orgSettings$);

    this.setupFilteredCategories(activeCategories$);

    this.setupExpenseFields();

    this.flightJourneyTravelClassOptions$ = this.txnFields$.pipe(
      map((txnFields) => {
        const txnFieldsOptions = txnFields?.flight_journey_travel_class?.options as string[];
        return txnFields.flight_journey_travel_class && txnFieldsOptions.map((v) => ({ label: v, value: v }));
      })
    );

    this.taxSettings$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.tax_settings),
      map((taxSettings) => {
        const taxOptions = taxSettings.groups as TaxGroup[];
        return {
          ...taxSettings,
          groups: taxOptions && taxOptions.map((tax) => ({ label: tax.name, value: tax })),
        };
      })
    );

    this.reports$ = this.reportService
      .getFilteredPendingReports({ state: 'edit' })
      .pipe(
        map((reports: UnflattenedReport[]) => reports.map((report) => ({ label: report.rp.purpose, value: report })))
      ) as Observable<
      {
        label: string;
        value: UnflattenedReport;
      }[]
    >;

    this.recentlyUsedCategories$ = forkJoin({
      filteredCategories: this.filteredCategories$.pipe(take(1)),
      recentValues: this.recentlyUsedValues$,
    }).pipe(
      concatMap(
        ({
          filteredCategories,
          recentValues,
        }: {
          filteredCategories: OrgCategoryListItem[];
          recentValues: RecentlyUsed;
        }) => this.recentlyUsedItemsService.getRecentCategories(filteredCategories, recentValues)
      )
    );

    this.setupFormInit();

    this.setupCustomFields();

    this.transactionInReport$ = this.etxn$.pipe(
      map((etxn) => ['APPROVER_PENDING', 'APPROVER_INQUIRY'].indexOf(etxn.tx.state) > -1)
    );

    this.isNotReimbursable$ = this.etxn$.pipe(map((etxn) => !etxn.tx.user_can_delete && this.mode === 'edit'));

    this.isAmountCapped$ = this.etxn$.pipe(
      map((etxn) => isNumber(etxn.tx.admin_amount) || isNumber(etxn.tx.policy_amount))
    );

    this.isAmountDisabled$ = this.etxn$.pipe(map((etxn) => !!etxn.tx.admin_amount));

    this.isCriticalPolicyViolated$ = this.etxn$.pipe(
      map((etxn) => isNumber(etxn.tx.policy_amount) && etxn.tx.policy_amount < 0.0001)
    );

    this.etxn$.subscribe((etxn) => {
      this.isSplitExpense = this.getCheckSpiltExpense(etxn);
      this.isCccExpense = etxn?.tx?.corporate_credit_card_expense_group_id;
      this.isExpenseMatchedForDebitCCCE = this.getDebitCCCExpense(etxn);
      this.canDismissCCCE = this.getDismissCCCExpense(etxn);
      this.canRemoveCardExpense = this.getRemoveCCCExpense(etxn);
    });

    //Clear all category dependent fields when user changes the category
    this.clearCategoryOnValueChange();

    this.actionSheetOptions$ = this.getActionSheetOptions();

    this.getPolicyDetails();
    this.getDuplicateExpenses();
    this.isIos = this.platform.is('ios');
  }

  getExpenseAttachments(mode: string, txnId?: string): Observable<FileObject[]> {
    if (mode === 'add') {
      return of(
        this.newExpenseDataUrls.map((fileObj: FileObject) => {
          fileObj.type = fileObj.type === 'application/pdf' || fileObj.type === 'pdf' ? 'pdf' : 'image';
          return fileObj;
        })
      );
    } else {
      return this.fileService.findByTransactionId(txnId).pipe(
        switchMap((fileObjs: FileObject[]) => from(fileObjs)),
        concatMap((fileObj: FileObject) =>
          this.fileService.downloadUrl(fileObj.id).pipe(
            map((downloadUrl: string) => {
              fileObj.url = downloadUrl;
              const details = this.getReceiptDetails(fileObj);
              fileObj.type = details.type;
              fileObj.thumbnail = details.thumbnail;
              return fileObj;
            })
          )
        ),
        reduce((acc: FileObject[], curr) => acc.concat(curr), [])
      );
    }
  }

  getSourceAccID(): string {
    const formValue = this.getFormValues();
    return formValue?.paymentMode?.acc?.id;
  }

  getBillable(): boolean {
    return this.getFormValues()?.billable;
  }

  getSkipRemibursement(): boolean {
    const formValue = this.getFormValues();
    return formValue?.paymentMode?.acc?.type === AccountType.PERSONAL && !formValue.paymentMode.acc?.isReimbursable;
  }

  getTxnDate(): Date {
    const formValue = this.getFormValues();
    return formValue?.dateOfSpend && this.dateService.getUTCDate(new Date(formValue.dateOfSpend));
  }

  getCurrency(): string {
    return this.getFormValues()?.currencyObj?.currency;
  }

  getOriginalCurrency(): string {
    return this.getFormValues()?.currencyObj?.orig_currency;
  }

  getOriginalAmount(): number {
    return this.getFormValues()?.currencyObj?.orig_amount;
  }

  getProjectID(): number {
    return this.getFormValues()?.project?.project_id;
  }

  getTaxAmount(): number {
    return this.getFormValues()?.tax_amount;
  }

  getTaxGroupID(): string {
    return this.getFormValues()?.tax_group?.id;
  }

  getOrgCategoryID(): number {
    return this.getFormValues()?.category?.id;
  }

  getFyleCategory(): string {
    return this.getFormValues()?.category?.fyle_category;
  }

  getDisplayName(): string {
    return this.getFormValues()?.vendor_id?.display_name;
  }

  getPurpose(): string {
    return this.getFormValues()?.purpose;
  }

  getFromDt(): Date {
    return this.getFormValues()?.from_dt && this.dateService.getUTCDate(new Date(this.getFormValues().from_dt));
  }

  getToDt(): Date {
    return this.getFormValues()?.to_dt && this.dateService.getUTCDate(new Date(this.getFormValues().to_dt));
  }

  getFlightJourneyClass(): string {
    return this.getFormValues()?.flight_journey_travel_class;
  }

  getFlightReturnClass(): string {
    return this.getFormValues()?.flight_return_travel_class;
  }

  getTrainTravelClass(): string {
    return this.getFormValues()?.train_travel_class;
  }

  getBusTravelClass(): string {
    return this.getFormValues()?.bus_travel_class;
  }

  getDistance(): number {
    return this.getFormValues()?.distance;
  }

  getDistanceUnit(): string {
    return this.getFormValues()?.distance_unit;
  }

  getBreakfastProvided(): boolean {
    return this.getFormValues()?.hotel_is_breakfast_provided;
  }

  getDuplicateReason(): string {
    return this.getFormValues()?.duplicate_detection_reason;
  }

  getAmount(): number {
    return this.getFormValues()?.currencyObj?.amount;
  }

  generateEtxnFromFg(
    etxn$: Observable<UnflattenedTransaction>,
    standardisedCustomProperties$: Observable<TxnCustomProperties[]>,
    isPolicyEtxn = false
  ): Observable<Partial<UnflattenedTransaction>> {
    let txId: string;
    etxn$.subscribe((etxn) => {
      txId = etxn.tx.id;
    });
    const attachements$ = this.getExpenseAttachments(this.mode, txId);
    return forkJoin({
      etxn: etxn$,
      customProperties: standardisedCustomProperties$,
      attachments: attachements$,
    }).pipe(
      map((res) => {
        const etxn: UnflattenedTransaction = res.etxn;
        let customProperties = res.customProperties;
        customProperties = customProperties.map((customProperty) => {
          if (customProperty.type === 'DATE') {
            customProperty.value =
              customProperty.value && this.dateService.getUTCDate(new Date(customProperty.value as string));
          }
          return customProperty;
        });

        const formValues = this.getFormValues();

        let locations: Destination[];
        if (formValues.location_1 && formValues.location_2) {
          locations = [formValues.location_1 as Destination, formValues.location_2 as Destination];
        } else if (formValues.location_1) {
          locations = [formValues.location_1 as Destination];
        }

        const costCenter: { cost_center_id?: number; cost_center_name?: string; cost_center_code?: string } = {};

        if (formValues.costCenter) {
          costCenter.cost_center_id = formValues.costCenter.id;
          costCenter.cost_center_name = formValues.costCenter.name;
          costCenter.cost_center_code = formValues.costCenter.code;
        }

        const policyProps: { org_category?: string; sub_category?: string } = {};

        if (isPolicyEtxn) {
          policyProps.org_category = formValues.category && formValues.category.name;
          policyProps.sub_category = formValues.category && formValues.category.sub_category;
        }

        if (this.inpageExtractedData) {
          etxn.tx.extracted_data = this.inpageExtractedData;
        }

        // If user has not edited the amount, then send user_amount to check_policies
        let amount = this.getAmount();
        if (isPolicyEtxn && amount === etxn.tx.amount && etxn.tx.user_amount) {
          amount = etxn.tx.user_amount;
        }

        //TODO: Add depenedent fields to custom_properties array once APIs are available
        return {
          tx: {
            ...etxn.tx,
            source: this.source || etxn.tx.source,
            source_account_id: this.getSourceAccID(),
            billable: this.getBillable(),
            skip_reimbursement: this.getSkipRemibursement(),
            txn_dt: this.getTxnDate(),
            currency: this.getCurrency(),
            amount,
            orig_currency: this.getOriginalCurrency(),
            orig_amount: this.getOriginalAmount(),
            project_id: this.getProjectID(),
            tax_amount: this.getTaxAmount(),
            tax_group_id: this.getTaxGroupID(),
            org_category_id: this.getOrgCategoryID(),
            fyle_category: this.getFyleCategory(),
            policy_amount: null,
            vendor: this.getDisplayName(),
            purpose: this.getPurpose(),
            locations: locations || [],
            custom_properties: customProperties || [],
            num_files: isPolicyEtxn ? res.attachments?.length : this.activatedRoute.snapshot.params?.dataUrl ? 1 : 0,
            ...policyProps,
            org_user_id: etxn.tx.org_user_id,
            from_dt: this.getFromDt(),
            to_dt: this.getToDt(),
            flight_journey_travel_class: this.getFlightJourneyClass(),
            flight_return_travel_class: this.getFlightReturnClass(),
            train_travel_class: this.getTrainTravelClass(),
            bus_travel_class: this.getBusTravelClass(),
            distance: this.getDistance(),
            distance_unit: this.getDistanceUnit(),
            hotel_is_breakfast_provided: this.getBreakfastProvided(),
            user_reason_for_duplicate_expenses: this.getDuplicateReason(),
            ...costCenter,
          },
          ou: etxn.ou,
          dataUrls: [].concat(this.newExpenseDataUrls),
        };
      })
    );
  }

  checkPolicyViolation(etxn: { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] }): Observable<ExpensePolicy> {
    const transactionCopy = cloneDeep(etxn.tx);
    /* Adding number of attachements and sending in test call as tx_num_files
     * If editing an expense with receipts, check for already uploaded receipts
     */
    if (etxn.tx) {
      transactionCopy.num_files = etxn.tx.num_files;

      // Check for receipts uploaded from mobile
      if (etxn.dataUrls && etxn.dataUrls.length > 0) {
        transactionCopy.num_files = etxn.tx.num_files + etxn.dataUrls.length;
      }
    }

    transactionCopy.is_matching_ccc_expense = !!this.selectedCCCTransaction;
    if (!transactionCopy.org_category_id) {
      const categoryName = 'Unspecified';
      return this.categoriesService.getCategoryByName(categoryName).pipe(
        map((category: OrgCategory) => {
          transactionCopy.org_category_id = category.id;
          return transactionCopy;
        }),
        switchMap((unspecifiedTransaction) => {
          /* Expense creation has not moved to platform yet and since policy is moved to platform,
           * it expects the expense object in terms of platform world. Until then, the method
           * `transformTo` act as a bridge by translating the public expense object to platform
           * expense.
           */
          const policyExpense = this.policyService.transformTo(unspecifiedTransaction);
          return this.transactionService.checkPolicy(policyExpense);
        })
      );
    } else {
      /* Expense creation has not moved to platform yet and since policy is moved to platform,
       * it expects the expense object in terms of platform world. Until then, the method
       * `transformTo` act as a bridge by translating the public expense object to platform
       * expense.
       */
      const policyExpense = this.policyService.transformTo(transactionCopy);
      return this.transactionService.checkPolicy(policyExpense);
    }
  }

  getProjectDependentFields(): TxnCustomProperties[] {
    const projectDependentFieldsControl = this.fg.value as {
      project_dependent_fields: TxnCustomProperties[];
    };
    return projectDependentFieldsControl.project_dependent_fields;
  }

  getCostCenterDependentFields(): TxnCustomProperties[] {
    const CCDependentFieldsControl = this.fg.value as {
      cost_center_dependent_fields: TxnCustomProperties[];
    };
    return CCDependentFieldsControl.cost_center_dependent_fields;
  }

  getCustomFields(): Observable<TxnCustomProperties[]> {
    const dependentFieldsWithValue$ = this.dependentFields$.pipe(
      map((customFields) => {
        const allDependentFields = [...this.getProjectDependentFields(), ...this.getCostCenterDependentFields()];
        const mappedDependentFields = allDependentFields.map((dependentField) => ({
          name: dependentField.label,
          value: dependentField.value,
        }));
        return this.customFieldsService.standardizeCustomFields(mappedDependentFields || [], customFields);
      })
    );

    return forkJoin({
      customInputs: this.customInputs$.pipe(take(1)),
      dependentFieldsWithValue: dependentFieldsWithValue$.pipe(take(1)),
    }).pipe(
      map(
        ({
          customInputs,
          dependentFieldsWithValue,
        }: {
          customInputs: TxnCustomProperties[];
          dependentFieldsWithValue: TxnCustomProperties[];
        }) => {
          const customInpustWithValue: TxnCustomProperties[] = customInputs.map((customInput, i: number) => ({
            id: customInput.id,
            mandatory: customInput.mandatory,
            name: customInput.name,
            options: customInput?.options,
            placeholder: customInput?.placeholder,
            prefix: customInput?.prefix,
            type: customInput.type,
            value: this.getFormValues()?.custom_inputs[i]?.value,
          }));
          return [...customInpustWithValue, ...dependentFieldsWithValue];
        }
      )
    );
  }

  async reloadCurrentRoute(): Promise<void> {
    await this.router.navigateByUrl('/enterprise/my_expenses', { skipLocationChange: true });
    await this.router.navigate(['/', 'enterprise', 'add_edit_expense']);
  }

  showAddToReportSuccessToast(reportId: string): void {
    const toastMessageData = {
      message: 'Expense added to report successfully',
      redirectionText: 'View Report',
    };
    const expensesAddedToReportSnackBar = this.showSnackBarToast(toastMessageData, 'success', [
      'msb-success-with-camera-icon',
    ]) as {
      onAction: () => Observable<unknown>;
    };

    this.trackingService.showToastMessage({ ToastContent: toastMessageData.message });

    expensesAddedToReportSnackBar.onAction().subscribe(() => {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: reportId, navigateBack: true }]);
    });
  }

  saveExpense(): void {
    const that = this;
    const formValues = this.getFormValues();

    that
      .checkIfInvalidPaymentMode()
      .pipe(take(1))
      .subscribe((invalidPaymentMode) => {
        const saveIncompleteExpense = that.activatedRoute.snapshot.params.dataUrl && !formValues.report?.rp?.id;
        if (saveIncompleteExpense || (that.fg.valid && !invalidPaymentMode)) {
          if (that.mode === 'add') {
            if (that.isCreatedFromPersonalCard) {
              that.saveAndMatchWithPersonalCardTxn();
            } else {
              if (saveIncompleteExpense && !that.fg.valid) {
                this.trackingService.saveReceiptWithInvalidForm();
              }

              that
                .addExpense('SAVE_EXPENSE')
                .pipe(
                  switchMap((txnData) => {
                    if (txnData) {
                      return from(txnData as Promise<OutboxQueue>);
                    } else {
                      return of(null);
                    }
                  }),
                  finalize(() => {
                    this.saveExpenseLoader = false;
                  })
                )
                .subscribe(() => this.goBack());
            }
          } else {
            // to do edit
            that.editExpense('SAVE_EXPENSE').subscribe(() => this.goBack());
          }
        } else {
          that.showFormValidationErrors();

          if (invalidPaymentMode) {
            that.invalidPaymentMode = true;
            setTimeout(() => {
              that.invalidPaymentMode = false;
            }, 3000);
          }
        }
      });
  }

  saveAndNewExpense(): void {
    const that = this;
    this.trackingService.clickSaveAddNew();
    that
      .checkIfInvalidPaymentMode()
      .pipe(take(1))
      .subscribe((invalidPaymentMode) => {
        if (that.fg.valid && !invalidPaymentMode) {
          if (that.mode === 'add') {
            that.addExpense('SAVE_AND_NEW_EXPENSE').subscribe(() => {
              this.reloadCurrentRoute();
            });
          } else {
            that.editExpense('SAVE_AND_NEW_EXPENSE').subscribe(() => {
              that.goBack();
            });
          }
        } else {
          that.showFormValidationErrors();
          if (invalidPaymentMode) {
            that.invalidPaymentMode = true;
            setTimeout(() => {
              that.invalidPaymentMode = false;
            }, 3000);
          }
        }
      });
  }

  saveExpenseAndGotoPrev(): void {
    const that = this;
    if (that.fg.valid) {
      if (that.mode === 'add') {
        that.addExpense('SAVE_AND_PREV_EXPENSE').subscribe(() => {
          if (+this.activeIndex === 0) {
            that.closeAddEditExpenses();
          } else {
            that.goToPrev();
          }
        });
      } else {
        // to do edit
        that.editExpense('SAVE_AND_PREV_EXPENSE').subscribe(() => {
          if (+this.activeIndex === 0) {
            that.closeAddEditExpenses();
          } else {
            that.goToPrev();
          }
        });
      }
    } else {
      that.showFormValidationErrors();
    }
  }

  saveExpenseAndGotoNext(): void {
    const that = this;
    if (that.fg.valid) {
      if (that.mode === 'add') {
        that.addExpense('SAVE_AND_NEXT_EXPENSE').subscribe(() => {
          if (+this.activeIndex === this.reviewList.length - 1) {
            that.closeAddEditExpenses();
          } else {
            that.goToNext();
          }
        });
      } else {
        // to do edit
        that.editExpense('SAVE_AND_NEXT_EXPENSE').subscribe(() => {
          if (+this.activeIndex === this.reviewList.length - 1) {
            that.closeAddEditExpenses();
          } else {
            that.goToNext();
          }
        });
      }
    } else {
      that.showFormValidationErrors();
    }
  }

  async continueWithCriticalPolicyViolation(criticalPolicyViolations: string[]): Promise<boolean> {
    const fyCriticalPolicyViolationPopOver = await this.modalController.create({
      component: FyCriticalPolicyViolationComponent,
      componentProps: {
        criticalViolationMessages: criticalPolicyViolations,
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await fyCriticalPolicyViolationPopOver.present();

    const { data } = (await fyCriticalPolicyViolationPopOver.onWillDismiss()) as {
      data: boolean;
    };
    return !!data;
  }

  async continueWithPolicyViolations(
    policyViolations: string[],
    policyAction: FinalExpensePolicyState
  ): Promise<{ comment: string }> {
    const currencyModal = await this.modalController.create({
      component: FyPolicyViolationComponent,
      componentProps: {
        policyViolationMessages: policyViolations,
        policyAction,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await currencyModal.present();

    const { data } = (await currencyModal.onWillDismiss()) as {
      data: {
        comment: string;
      };
    };
    return data;
  }

  trackPolicyCorrections(): void {
    this.isCriticalPolicyViolated$.subscribe((isCriticalPolicyViolated) => {
      if (isCriticalPolicyViolated && this.fg.dirty) {
        this.trackingService.policyCorrection({ Violation: 'Critical', Mode: 'Edit Expense' });
      }
    });

    this.comments$
      .pipe(
        map((estatuses) => estatuses.filter((estatus) => estatus.st_org_user_id === 'POLICY')),
        map((policyViolationComments) => policyViolationComments.length > 0)
      )
      .subscribe((policyViolated) => {
        if (policyViolated && this.fg.dirty) {
          this.trackingService.policyCorrection({ Violation: 'Regular', Mode: 'Edit Expense' });
        }
      });
  }

  trackEditExpense(etxn: UnflattenedTransaction): void {
    this.trackingService.editExpense({
      Type: 'Receipt',
      Amount: etxn.tx.amount,
      Currency: etxn.tx.currency,
      Category: etxn.tx.org_category,
      Time_Spent: this.getTimeSpentOnPage() + ' secs',
      Used_Autofilled_Category:
        etxn.tx.org_category_id && this.presetCategoryId && etxn.tx.org_category_id === this.presetCategoryId,
      Used_Autofilled_Project:
        etxn.tx.project_id && this.presetProjectId && etxn.tx.project_id === this.presetProjectId,
      Used_Autofilled_CostCenter:
        etxn.tx.cost_center_id && this.presetCostCenterId && etxn.tx.cost_center_id === this.presetCostCenterId,
      Used_Autofilled_Currency:
        (etxn.tx.currency || etxn.tx.orig_currency) &&
        this.presetCurrency &&
        (etxn.tx.currency === this.presetCurrency || etxn.tx.orig_currency === this.presetCurrency),
    });
  }

  editExpense(redirectedFrom: string): Observable<Partial<Transaction>> {
    this.saveExpenseLoader = redirectedFrom === 'SAVE_EXPENSE';
    this.saveAndNewExpenseLoader = redirectedFrom === 'SAVE_AND_NEW_EXPENSE';
    this.saveAndNextExpenseLoader = redirectedFrom === 'SAVE_AND_NEXT_EXPENSE';
    this.saveAndPrevExpenseLoader = redirectedFrom === 'SAVE_AND_PREV_EXPENSE';

    this.trackPolicyCorrections();

    const customFields$ = this.getCustomFields();

    return this.generateEtxnFromFg(this.etxn$, customFields$, true).pipe(
      switchMap((etxn) => {
        const policyViolations$ = this.checkPolicyViolation(
          etxn as unknown as { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] }
        ).pipe(shareReplay(1));
        return policyViolations$.pipe(
          map(this.policyService.getCriticalPolicyRules),
          switchMap((policyViolations) => {
            if (policyViolations.length > 0) {
              return throwError({
                type: 'criticalPolicyViolations',
                policyViolations,
                etxn,
              });
            } else {
              return policyViolations$;
            }
          }),
          map((policyViolations: ExpensePolicy): [string[], FinalExpensePolicyState] => [
            this.policyService.getPolicyRules(policyViolations),
            policyViolations?.data?.final_desired_state,
          ]),
          switchMap(([policyViolations, policyAction]: [string[], FinalExpensePolicyState]) => {
            if (policyViolations.length > 0) {
              return throwError({
                type: 'policyViolations',
                policyViolations,
                policyAction,
                etxn,
              });
            } else {
              return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                map((innerEtxn) => ({ etxn: innerEtxn, comment: null }))
              );
            }
          })
        );
      }),
      catchError(
        (err: {
          status?: number;
          type: string;
          policyViolations: string[];
          policyAction: FinalExpensePolicyState;
          etxn: Partial<UnflattenedTransaction>;
        }) => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
              map((innerEtxn) => ({ etxn: innerEtxn, comment: null }))
            );
          }
          if (err.type === 'criticalPolicyViolations') {
            return this.criticalPolicyViolationErrorHandler(err, customFields$);
          } else if (err.type === 'policyViolations') {
            return this.policyViolationErrorHandler(err, customFields$);
          } else {
            return throwError(err);
          }
        }
      ),
      switchMap(({ etxn, comment }: { etxn: UnflattenedTransaction; comment: string }) =>
        forkJoin({
          eou: from(this.authService.getEou()),
          txnCopy: this.etxn$,
        }).pipe(
          switchMap(({ txnCopy }: { txnCopy: UnflattenedTransaction }) => {
            if (!isEqual(etxn.tx, txnCopy)) {
              // only if the form is edited
              this.trackEditExpense(etxn);
            } else {
              // tracking expense closed without editing
              this.trackingService.viewExpense({ Type: 'Receipt' });
            }

            const reportControl = this.fg.value as {
              report: UnflattenedReport;
            };

            // NOTE: This double call is done as certain fields will not be present in return of upsert call. policy_amount in this case.
            return this.transactionService.upsert(etxn.tx as Transaction).pipe(
              switchMap((txn) => this.transactionService.getETxnUnflattened(txn.id)),
              map((savedEtxn) => savedEtxn && savedEtxn.tx),
              switchMap((tx) => {
                const selectedReportId = reportControl.report && reportControl.report.rp && reportControl.report.rp.id;
                const criticalPolicyViolated = this.getIsPolicyExpense(etxn as unknown as Expense);
                if (!criticalPolicyViolated) {
                  if (!txnCopy.tx.report_id && selectedReportId) {
                    return this.reportService.addTransactions(selectedReportId, [tx.id]).pipe(
                      tap(() => this.trackingService.addToExistingReportAddEditExpense()),
                      map(() => tx)
                    );
                  }

                  if (txnCopy.tx.report_id && selectedReportId && txnCopy.tx.report_id !== selectedReportId) {
                    return this.reportService.removeTransaction(txnCopy.tx.report_id, tx.id).pipe(
                      switchMap(() => this.reportService.addTransactions(selectedReportId, [tx.id])),
                      tap(() => this.trackingService.addToExistingReportAddEditExpense()),
                      map(() => tx)
                    );
                  }

                  if (txnCopy.tx.report_id && !selectedReportId) {
                    return this.reportService.removeTransaction(txnCopy.tx.report_id, tx.id).pipe(
                      tap(() => this.trackingService.removeFromExistingReportEditExpense()),
                      map(() => tx)
                    );
                  }
                }

                return of(null).pipe(map(() => tx));
              }),
              switchMap((tx) => {
                const criticalPolicyViolated = this.getIsPolicyExpense(etxn as unknown as Expense);
                if (!criticalPolicyViolated && etxn.tx.user_review_needed) {
                  return this.transactionService.review(tx.id).pipe(map(() => tx));
                }

                return of(null).pipe(map(() => tx));
              })
            );
          }),
          switchMap((txn) => {
            if (comment) {
              return this.statusService.findLatestComment(txn.id, 'transactions', txn.org_user_id).pipe(
                switchMap((result) => {
                  if (result !== comment) {
                    return this.statusService.post('transactions', txn.id, { comment }, true).pipe(map(() => txn));
                  } else {
                    return of(txn);
                  }
                })
              );
            } else {
              return of(txn);
            }
          })
        )
      ),
      switchMap((transaction) => {
        if (
          transaction.corporate_credit_card_expense_group_id &&
          this.selectedCCCTransaction &&
          this.selectedCCCTransaction.id
        ) {
          if (
            transaction.corporate_credit_card_expense_group_id !== this.selectedCCCTransaction.id &&
            this.matchedCCCTransaction
          ) {
            return this.transactionService
              .unmatchCCCExpense(transaction.id, this.matchedCCCTransaction.id)
              .pipe(
                switchMap(() => this.transactionService.matchCCCExpense(transaction.id, this.selectedCCCTransaction.id))
              );
          }
        }

        // Case is for unmatching a matched expense
        if (
          !this.selectedCCCTransaction &&
          transaction.corporate_credit_card_expense_group_id &&
          this.matchedCCCTransaction
        ) {
          return this.transactionService.unmatchCCCExpense(transaction.id, this.matchedCCCTransaction.id);
        }

        // Case is for matching a normal(unmatched) expense for the first time(edit)
        if (this.selectedCCCTransaction && !transaction.corporate_credit_card_expense_group_id) {
          return this.transactionService.matchCCCExpense(transaction.id, this.selectedCCCTransaction.id);
        }

        return of(transaction);
      }),
      finalize(() => {
        this.saveExpenseLoader = false;
        this.saveAndNewExpenseLoader = false;
        this.saveAndNextExpenseLoader = false;
        this.saveAndPrevExpenseLoader = false;
      })
    );
  }

  getTimeSpentOnPage(): number {
    const expenseEndTime = new Date().getTime();
    // Get time spent on page in seconds
    return (expenseEndTime - this.expenseStartTime) / 1000;
  }

  trackAddExpense(): void {
    const customFields$ = this.getCustomFields();
    const isInstaFyleExpense = !!this.activatedRoute.snapshot.params.dataUrl;
    this.generateEtxnFromFg(this.etxn$, customFields$).subscribe((etxn) => {
      this.trackingService.createExpense({
        Type: 'Receipt',
        Amount: etxn.tx.amount,
        Currency: etxn.tx.currency,
        Category: etxn.tx.org_category,
        Time_Spent: this.getTimeSpentOnPage() + ' secs',
        Used_Autofilled_Category:
          etxn.tx.org_category_id && this.presetCategoryId && etxn.tx.org_category_id === this.presetCategoryId,
        Used_Autofilled_Project:
          etxn.tx.project_id && this.presetProjectId && etxn.tx.project_id === this.presetProjectId,
        Used_Autofilled_CostCenter:
          etxn.tx.cost_center_id && this.presetCostCenterId && etxn.tx.cost_center_id === this.presetCostCenterId,
        Used_Autofilled_Currency:
          (etxn.tx.currency || etxn.tx.orig_currency) &&
          this.presetCurrency &&
          (etxn.tx.currency === this.presetCurrency || etxn.tx.orig_currency === this.presetCurrency),
        Instafyle: isInstaFyleExpense,
      });
    });
  }

  criticalPolicyViolationErrorHandler(
    err: {
      status?: number;
      type?: string;
      policyViolations?: string[];
      policyAction?: FinalExpensePolicyState;
      etxn?: Partial<UnflattenedTransaction>;
    },
    customFields$: Observable<TxnCustomProperties[]>
  ): Observable<{ etxn: Partial<UnflattenedTransaction> }> {
    return from(this.loaderService.hideLoader()).pipe(
      switchMap(() => this.continueWithCriticalPolicyViolation(err.policyViolations)),
      switchMap((continueWithTransaction) => {
        if (continueWithTransaction) {
          return from(this.loaderService.showLoader()).pipe(
            switchMap(() =>
              this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                map((innerEtxn) => ({ etxn: innerEtxn, comment: null }))
              )
            )
          );
        } else {
          return throwError('unhandledError');
        }
      })
    );
  }

  policyViolationErrorHandler(
    err: {
      status?: number;
      type?: string;
      policyViolations?: string[];
      policyAction?: FinalExpensePolicyState;
      etxn?: Partial<UnflattenedTransaction>;
    },
    customFields$: Observable<TxnCustomProperties[]>
  ): Observable<{ etxn: Partial<UnflattenedTransaction>; comment: string }> {
    return from(this.loaderService.hideLoader()).pipe(
      switchMap(() => this.continueWithPolicyViolations(err.policyViolations, err.policyAction)),
      switchMap((continueWithTransaction: { comment: string }) => {
        if (continueWithTransaction) {
          if (continueWithTransaction.comment === '' || continueWithTransaction.comment === null) {
            continueWithTransaction.comment = 'No policy violation explaination provided';
          }
          return from(this.loaderService.showLoader()).pipe(
            switchMap(() =>
              this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                map((innerEtxn) => ({ etxn: innerEtxn, comment: continueWithTransaction.comment }))
              )
            )
          );
        } else {
          return throwError('unhandledError');
        }
      })
    );
  }

  trackCreateExpense(etxn: UnflattenedTransaction, isInstaFyleExpense: boolean): void {
    this.trackingService.createExpense({
      Type: 'Receipt',
      Amount: etxn.tx.amount,
      Currency: etxn.tx.currency,
      Category: etxn.tx.org_category,
      Time_Spent: this.getTimeSpentOnPage() + ' secs',
      Used_Autofilled_Category:
        etxn.tx.org_category_id && this.presetCategoryId && etxn.tx.org_category_id === this.presetCategoryId,
      Used_Autofilled_Project:
        etxn.tx.project_id && this.presetProjectId && etxn.tx.project_id === this.presetProjectId,
      Used_Autofilled_CostCenter:
        etxn.tx.cost_center_id && this.presetCostCenterId && etxn.tx.cost_center_id === this.presetCostCenterId,
      Used_Autofilled_Currency:
        (etxn.tx.currency || etxn.tx.orig_currency) &&
        this.presetCurrency &&
        (etxn.tx.currency === this.presetCurrency || etxn.tx.orig_currency === this.presetCurrency),
      Instafyle: isInstaFyleExpense,
    });
  }

  addExpense(redirectedFrom: string): Observable<OutboxQueue | Promise<OutboxQueue>> {
    this.saveExpenseLoader = redirectedFrom === 'SAVE_EXPENSE';
    this.saveAndNewExpenseLoader = redirectedFrom === 'SAVE_AND_NEW_EXPENSE';
    this.saveAndNextExpenseLoader = redirectedFrom === 'SAVE_AND_NEXT_EXPENSE';
    this.saveAndPrevExpenseLoader = redirectedFrom === 'SAVE_AND_PREV_EXPENSE';

    const customFields$ = this.getCustomFields();

    this.trackAddExpense();

    return this.generateEtxnFromFg(this.etxn$, customFields$, true).pipe(
      switchMap((etxn) =>
        this.isConnected$.pipe(
          take(1),
          switchMap((isConnected) => {
            if (isConnected) {
              const policyViolations$ = this.checkPolicyViolation(
                etxn as unknown as { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] }
              ).pipe(shareReplay(1));
              return policyViolations$.pipe(
                map(this.policyService.getCriticalPolicyRules),
                switchMap((criticalPolicyViolations) => {
                  if (criticalPolicyViolations.length > 0) {
                    return throwError({
                      type: 'criticalPolicyViolations',
                      policyViolations: criticalPolicyViolations,
                      etxn,
                    });
                  } else {
                    return policyViolations$;
                  }
                }),
                map((policyViolations: ExpensePolicy): [string[], FinalExpensePolicyState] => [
                  this.policyService.getPolicyRules(policyViolations),
                  policyViolations?.data?.final_desired_state,
                ]),
                switchMap(([policyViolations, policyAction]: [string[], FinalExpensePolicyState]) => {
                  if (policyViolations.length > 0) {
                    return throwError({
                      type: 'policyViolations',
                      policyViolations,
                      policyAction,
                      etxn,
                    });
                  } else {
                    return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                      map((innerEtxn) => ({ etxn: innerEtxn, comment: null }))
                    );
                  }
                })
              );
            } else {
              return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                map((innerEtxn) => ({ etxn: innerEtxn, comment: null }))
              );
            }
          })
        )
      ),

      catchError(
        (err: {
          status?: number;
          type?: string;
          policyViolations?: string[];
          policyAction?: FinalExpensePolicyState;
          etxn?: Partial<UnflattenedTransaction>;
        }) => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(map((etxn) => ({ etxn })));
          }

          if (err.type === 'criticalPolicyViolations') {
            return this.criticalPolicyViolationErrorHandler(err, customFields$);
          } else if (err.type === 'policyViolations') {
            return this.policyViolationErrorHandler(err, customFields$);
          } else {
            return throwError(err);
          }
        }
      ),
      switchMap(({ etxn, comment }: { etxn: UnflattenedTransaction; comment: string }) =>
        from(this.authService.getEou()).pipe(
          switchMap(() => {
            const comments: string[] = [];
            const isInstaFyleExpense = !!this.activatedRoute.snapshot.params.dataUrl;
            this.trackCreateExpense(etxn, isInstaFyleExpense);

            if (comment) {
              comments.push(comment);
            }
            if (this.selectedCCCTransaction) {
              etxn.tx.matchCCCId = this.selectedCCCTransaction.id;
            }

            let reportId: string;
            const formValues = this.getFormValues();
            if (
              formValues.report &&
              (etxn.tx.policy_amount === null || (etxn.tx.policy_amount && !(etxn.tx.policy_amount < 0.0001)))
            ) {
              reportId = formValues.report.rp.id;
            }

            etxn.dataUrls = etxn.dataUrls.map((data: FileObject) => {
              let attachmentType = 'image';

              if (data.type === 'application/pdf' || data.type === 'pdf') {
                attachmentType = 'pdf';
              }

              data.type = attachmentType;

              return data;
            });

            if (this.activatedRoute.snapshot.params.bankTxn) {
              return from(
                this.transactionOutboxService.addEntryAndSync(
                  etxn.tx,
                  etxn.dataUrls as { url: string; type: string }[],
                  comments,
                  reportId
                )
              );
            } else {
              return this.isConnected$.pipe(
                take(1),
                switchMap((isConnected) => {
                  if (!isConnected) {
                    etxn.tx.source += '_OFFLINE';
                  }

                  if (this.activatedRoute.snapshot.params.rp_id) {
                    return of(
                      this.transactionOutboxService.addEntryAndSync(
                        etxn.tx,
                        etxn.dataUrls as { url: string; type: string }[],
                        comments,
                        reportId
                      )
                    );
                  } else {
                    this.transactionOutboxService
                      .addEntry(etxn.tx, etxn.dataUrls as { url: string; type: string }[], comments, reportId)
                      .then(noop);

                    return of(null);
                  }
                })
              );
            }
          })
        )
      ),
      finalize(() => {
        this.saveAndNewExpenseLoader = false;
        this.saveAndNextExpenseLoader = false;
        this.saveAndPrevExpenseLoader = false;
      })
    );
  }

  closeAddEditExpenses(): void {
    this.router.navigate(['/', 'enterprise', 'my_expenses']);
  }

  async getParsedReceipt(base64Image: string, fileType: string): Promise<ParsedReceipt> {
    const parsedData: ParsedReceipt = await this.transactionOutboxService.parseReceipt(base64Image, fileType);
    const homeCurrency = await this.currencyService.getHomeCurrency().toPromise();

    if (
      (parsedData as ParsedResponse) &&
      parsedData.data &&
      parsedData.data.currency &&
      homeCurrency !== parsedData.data.currency
    ) {
      parsedData.exchangeRate = await this.currencyService
        .getExchangeRate(
          parsedData.data.currency,
          homeCurrency,
          parsedData.data.date ? new Date(parsedData.data.date) : new Date()
        )
        .toPromise();
    }

    return parsedData;
  }

  parseFile(fileInfo: { type: string; url: string; thumbnail?: string }): Subscription {
    const base64Image = fileInfo && fileInfo.url.split(';base64,')[1];
    let fileType = null;
    if (fileInfo && fileInfo.type && fileInfo.type.indexOf('image') > -1) {
      fileType = 'image';
    } else if (fileInfo && fileInfo.type && fileInfo.type.indexOf('pdf') > -1) {
      fileType = 'pdf';
    }

    const instaFyleEnabled$ = this.orgUserSettings$.pipe(
      map(
        (orgUserSettings) => orgUserSettings.insta_fyle_settings.allowed && orgUserSettings.insta_fyle_settings.enabled
      )
    );

    return instaFyleEnabled$
      .pipe(
        filter((instafyleEnabled) => instafyleEnabled),
        switchMap(() =>
          forkJoin({
            imageData: from(this.getParsedReceipt(base64Image, fileType as string)),
            filteredCategories: this.filteredCategories$.pipe(take(1)),
            homeCurrency: this.currencyService.getHomeCurrency(),
          })
        )
      )
      .subscribe(({ imageData, filteredCategories, homeCurrency }) => {
        const extractedData = {
          amount: imageData && imageData.data && imageData.data.amount,
          currency: imageData && imageData.data && imageData.data.currency,
          category: imageData && imageData.data && imageData.data.category,
          date: imageData && imageData.data && imageData.data.date,
          vendor: imageData && imageData.data && imageData.data.vendor_name,
          invoice_dt: (imageData && imageData.data && imageData.data.invoice_dt) || null,
        };

        if (!this.inpageExtractedData) {
          this.inpageExtractedData = imageData.data;
        } else {
          this.inpageExtractedData = mergeWith(
            {},
            this.inpageExtractedData,
            imageData.data,
            (currentValue, newValue) => (isNull(currentValue) ? newValue : currentValue) as ParsedResponse
          );
        }

        const currenctControl = this.getFormControl('currencyObj') as { value: { amount: number } };

        if (!currenctControl?.value?.amount && extractedData.amount && extractedData.currency) {
          const currencyObj = {
            amount: null,
            currency: homeCurrency,
            orig_amount: null,
            orig_currency: null,
          };

          if (homeCurrency !== extractedData.currency && imageData.exchangeRate) {
            currencyObj.orig_amount = extractedData.amount;
            currencyObj.orig_currency = extractedData.currency;
            currencyObj.amount = imageData.exchangeRate * extractedData.amount;
            currencyObj.currency = homeCurrency;
          } else {
            currencyObj.amount = extractedData.amount;
          }

          this.fg.patchValue({
            currencyObj,
          });
        }

        if (extractedData.date && this.dateService.isSameDate(this.fg.controls.dateOfSpend.value as Date, new Date())) {
          this.fg.patchValue({
            dateOfSpend: extractedData.date,
          });
        }

        if (!this.fg.controls.vendor_id.value && extractedData.vendor) {
          this.fg.patchValue({
            vendor_id: { display_name: extractedData.vendor },
          });
        }

        // If category is auto-filled and there exists extracted category, priority is given to extracted category
        const isExtractedCategoryValid = extractedData.category && extractedData.category !== 'Unspecified';
        if (
          (!this.fg.controls.category.value || this.presetCategoryId) &&
          !this.fg.controls.category.dirty &&
          isExtractedCategoryValid
        ) {
          const categoryName = extractedData.category || 'Unspecified';
          const category = filteredCategories.find(
            (orgCategory: { value: { fyle_category: string } }) => orgCategory.value.fyle_category === categoryName
          );
          this.fg.patchValue({
            category: category && category.value,
          });
        }
      });
  }

  attachReceipts(data: { type: string; dataUrl: string | ArrayBuffer; actionSource?: string }): void {
    if (data) {
      const fileInfo = {
        type: data.type,
        url: data.dataUrl,
        thumbnail: data.dataUrl,
      };
      if (this.mode === 'add') {
        const fileInfo = {
          type: data.type,
          url: data.dataUrl as string,
          thumbnail: data.dataUrl,
        };
        this.newExpenseDataUrls.push(fileInfo as Partial<FileObject>);
        this.sanitizer.bypassSecurityTrustUrl(fileInfo.url);
        this.newExpenseDataUrls.forEach((fileObj) => {
          fileObj.type = fileObj.type === 'application/pdf' || fileObj.type === 'pdf' ? 'pdf' : 'image';
          return fileObj;
        });

        if (this.source.includes('MOBILE') && !(this.source.includes('_CAMERA') || this.source.includes('_FILE'))) {
          if (this.newExpenseDataUrls.some((fileObj) => fileObj.type === 'pdf')) {
            this.source = 'MOBILE_FILE';
          } else if (this.newExpenseDataUrls.some((fileObj) => fileObj.type === 'image')) {
            this.source = 'MOBILE_CAMERA';
          }
        }

        this.attachedReceiptsCount = this.newExpenseDataUrls.length;
        this.isConnected$.pipe(take(1)).subscribe((isConnected) => {
          if (isConnected && this.attachedReceiptsCount === 1) {
            this.parseFile(
              fileInfo as {
                type: string;
                url: string;
                thumbnail: string;
              }
            );
          }
        });
      } else {
        const editExpenseAttachments$ = this.etxn$.pipe(
          switchMap((etxn) => this.fileService.findByTransactionId(etxn.tx.id)),
          map((fileObjs) => (fileObjs && fileObjs.length) || 0)
        );

        this.attachmentUploadInProgress = true;
        let attachmentType = 'image';

        if (data.type === 'application/pdf' || data.type === 'pdf') {
          attachmentType = 'pdf';
        }
        from(this.transactionOutboxService.fileUpload(data.dataUrl as string, attachmentType))
          .pipe(
            switchMap((fileObj: FileObject) => {
              fileObj.transaction_id = this.activatedRoute.snapshot.params.id as string;
              return this.fileService.post(fileObj);
            }),
            switchMap(() =>
              editExpenseAttachments$.pipe(
                withLatestFrom(this.isConnected$),
                map(([attachments, isConnected]) => ({
                  attachments,
                  isConnected,
                }))
              )
            ),
            finalize(() => {
              this.loadAttachments$.next();
              this.attachmentUploadInProgress = false;
            })
          )
          .subscribe(({ attachments, isConnected }) => {
            this.attachedReceiptsCount = attachments;
            if (isConnected && this.attachedReceiptsCount === 1) {
              this.parseFile(
                fileInfo as {
                  type: string;
                  url: string;
                  thumbnail: string;
                }
              );
            }
          });
      }
    }
  }

  async uploadFileCallback(file: File): Promise<void> {
    let fileData: { type: string; dataUrl: string | ArrayBuffer; actionSource: string };
    if (file) {
      if (file.size < MAX_FILE_SIZE) {
        const dataUrl = await this.fileService.readFile(file);
        this.trackingService.addAttachment({ type: file.type });
        fileData = {
          type: file.type,
          dataUrl,
          actionSource: 'gallery_upload',
        };
        this.attachReceipts(fileData);
      } else {
        this.showSizeLimitExceededPopover();
      }
    }
  }

  async onChangeCallback(nativeElement: HTMLInputElement): Promise<void> {
    const file = nativeElement.files[0];
    this.uploadFileCallback(file);
  }

  async addAttachments(event: Event): Promise<void> {
    event.stopPropagation();

    if (this.platform.is('ios')) {
      const nativeElement = this.fileUpload.nativeElement;
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      nativeElement.onchange = async () => {
        this.onChangeCallback(nativeElement);
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
          type: string;
          dataUrl: string;
          actionSource?: string;
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
        this.isCameraPreviewStarted = true;

        const { data } = (await captureReceiptModal.onWillDismiss()) as {
          data: {
            dataUrl: string;
          };
        };
        this.isCameraPreviewStarted = false;

        if (data && data.dataUrl) {
          receiptDetails = {
            type: this.fileService.getImageTypeFromDataUrl(data.dataUrl),
            dataUrl: data.dataUrl,
            actionSource: 'camera',
          };
        }
      }
      if (receiptDetails && receiptDetails.dataUrl) {
        this.attachReceipts(receiptDetails as { type: string; dataUrl: string });
        const message = 'Receipt added to Expense successfully';
        this.showSnackBarToast({ message }, 'success', ['msb-success-with-camera-icon']);

        this.trackingService.showToastMessage({ ToastContent: message });
      }
    }
  }

  getReceiptExtension(name: string): string | null {
    let res: string = null;

    if (name) {
      const filename = name.toLowerCase();
      const idx = filename.lastIndexOf('.');

      if (idx > -1) {
        res = filename.substring(idx + 1, filename.length);
      }
    }

    return res;
  }

  getReceiptDetails(file: FileObject): { type: string; thumbnail: string } {
    const ext = this.getReceiptExtension(file.name);
    const res = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg',
    };

    if (ext && ['pdf'].indexOf(ext) > -1) {
      res.type = 'pdf';
      res.thumbnail = 'img/fy-pdf.svg';
    } else if (ext && ['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1) {
      res.type = 'image';
      res.thumbnail = file.url;
    }

    return res;
  }

  viewAttachments(): void {
    let txId: string;
    this.etxn$.subscribe((etxn) => {
      txId = etxn.tx.id;
    });

    const attachements$ = this.getExpenseAttachments(this.mode, txId);

    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => attachements$),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(async (attachments) => {
        const attachmentsModal = await this.modalController.create({
          component: FyViewAttachmentComponent,
          componentProps: {
            attachments,
            canEdit: true,
          },
          mode: 'ios',
        });

        await attachmentsModal.present();

        const { data } = (await attachmentsModal.onWillDismiss()) as {
          data: {
            attachments: File[];
          };
        };

        if (this.mode === 'add') {
          if (data && data.attachments) {
            this.newExpenseDataUrls = data.attachments;
            this.attachedReceiptsCount = data.attachments.length;
          }
        } else {
          if ((data && data.attachments.length !== this.attachedReceiptsCount) || !data) {
            this.etxn$
              .pipe(
                switchMap((etxn) => this.fileService.findByTransactionId(etxn.tx.id)),
                map((fileObjs) => (fileObjs && fileObjs.length) || 0)
              )
              .subscribe((attachedReceipts) => {
                this.loadAttachments$.next();
                if (this.attachedReceiptsCount === attachedReceipts) {
                  this.trackingService.viewAttachment();
                }
                this.attachedReceiptsCount = attachedReceipts;
              });
          }
        }
      });
  }

  getDeleteReportParams(
    config: { header: string; body: string; ctaText: string; ctaLoadingText: string },
    removeExpenseFromReport: boolean = false,
    reportId?: string
  ): {
    component: typeof FyDeleteDialogComponent;
    cssClass: string;
    backdropDismiss: boolean;
    componentProps: {
      header: string;
      body: string;
      ctaText: string;
      ctaLoadingText: string;
      deleteMethod: () => Observable<Expense | void>;
    };
  } {
    return {
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: config.header,
        body: config.body,
        ctaText: config.ctaText,
        ctaLoadingText: config.ctaLoadingText,
        deleteMethod: (): Observable<Expense | void> => {
          if (removeExpenseFromReport) {
            return this.reportService.removeTransaction(reportId, this.activatedRoute.snapshot.params.id as string);
          }
          return this.transactionService.delete(this.activatedRoute.snapshot.params.id as string);
        },
      },
    };
  }

  async deleteExpense(reportId?: string): Promise<void> {
    const removeExpenseFromReport = reportId && this.isRedirectedFromReport;
    const header = removeExpenseFromReport ? 'Remove Expense' : 'Delete Expense';
    const body = removeExpenseFromReport
      ? 'Are you sure you want to remove this expense from this report?'
      : 'Are you sure you want to delete this expense?';
    const ctaText = removeExpenseFromReport ? 'Remove' : 'Delete';
    const ctaLoadingText = removeExpenseFromReport ? 'Removing' : 'Deleting';

    const deletePopover = await this.popoverController.create(
      this.getDeleteReportParams(
        {
          header,
          body,
          ctaText,
          ctaLoadingText,
        },
        removeExpenseFromReport,
        reportId
      )
    );

    await deletePopover.present();
    const { data } = (await deletePopover.onDidDismiss()) as {
      data: {
        status: 'success';
      };
    };

    if (data && data.status === 'success') {
      if (this.reviewList && this.reviewList.length && +this.activeIndex < this.reviewList.length - 1) {
        this.reviewList.splice(+this.activeIndex, 1);
        this.transactionService.getETxnUnflattened(this.reviewList[+this.activeIndex]).subscribe((etxn) => {
          this.goToTransaction(etxn, this.reviewList, +this.activeIndex);
        });
      } else if (removeExpenseFromReport) {
        this.router.navigate(['/', 'enterprise', 'my_view_report', { id: reportId }]);
      } else {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    }
  }

  async openCommentsModal(): Promise<void> {
    const etxn = await this.etxn$.toPromise();

    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'transactions',
        objectId: etxn.tx.id,
      },
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();

    const { data } = (await modal.onDidDismiss()) as {
      data: {
        updated: boolean;
      };
    };

    if (data && data.updated) {
      this.trackingService.addComment();
    } else {
      this.trackingService.viewComment();
    }
  }

  hideFields(): void {
    this.trackingService.hideMoreClicked({
      source: 'Add Edit Expenses page',
    });

    this.isExpandedView = false;
  }

  showFields(): void {
    this.trackingService.showMoreClicked({
      source: 'Add Edit Expenses page',
    });

    this.isExpandedView = true;
  }

  getPolicyDetails(): void {
    const expenseId = this.activatedRoute.snapshot.params.id as string;
    if (expenseId) {
      from(this.policyService.getSpenderExpensePolicyViolations(expenseId))
        .pipe()
        .subscribe((policyDetails) => {
          this.policyDetails = policyDetails;
        });
    }
  }

  saveAndMatchWithPersonalCardTxn(): Subscription {
    this.saveExpenseLoader = true;
    const customFields$ = this.getCustomFields();
    return this.generateEtxnFromFg(this.etxn$, customFields$, true)
      .pipe(
        switchMap((etxn) =>
          this.isConnected$.pipe(
            take(1),
            switchMap((isConnected) => {
              if (isConnected) {
                const policyViolations$ = this.checkPolicyViolation(
                  etxn as unknown as { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] }
                ).pipe(shareReplay(1));
                return policyViolations$.pipe(
                  map(this.policyService.getCriticalPolicyRules),
                  switchMap((criticalPolicyViolations) => {
                    if (criticalPolicyViolations.length > 0) {
                      return throwError({
                        type: 'criticalPolicyViolations',
                        policyViolations: criticalPolicyViolations,
                        etxn,
                      });
                    } else {
                      return policyViolations$;
                    }
                  }),
                  map((policyViolations: ExpensePolicy): [string[], FinalExpensePolicyState] => [
                    this.policyService.getPolicyRules(policyViolations),
                    policyViolations?.data?.final_desired_state,
                  ]),
                  switchMap(([policyViolations, policyAction]: [string[], FinalExpensePolicyState]) => {
                    if (policyViolations.length > 0) {
                      return throwError({
                        type: 'policyViolations',
                        policyViolations,
                        policyAction,
                        etxn,
                      });
                    } else {
                      return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                        map((innerEtxn) => ({ etxn: innerEtxn, comment: null }))
                      );
                    }
                  })
                );
              } else {
                return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                  map((innerEtxn) => ({ etxn: innerEtxn, comment: null }))
                );
              }
            })
          )
        ),
        catchError(
          (err: {
            status?: number;
            type: string;
            policyViolations: string[];
            policyAction: FinalExpensePolicyState;
            etxn: Partial<UnflattenedTransaction>;
          }) => {
            if (err.status === 500) {
              return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(map((etxn) => ({ etxn })));
            }

            if (err.type === 'criticalPolicyViolations') {
              return this.criticalPolicyViolationErrorHandler(err, customFields$);
            } else if (err.type === 'policyViolations') {
              return this.policyViolationErrorHandler(err, customFields$);
            } else {
              return throwError(err);
            }
          }
        ),
        switchMap(({ etxn }: { etxn: UnflattenedTransaction }) => {
          const personalCardTxn =
            this.activatedRoute.snapshot.params.personalCardTxn &&
            (JSON.parse(this.activatedRoute.snapshot.params.personalCardTxn as string) as PersonalCardTxn);
          const externalExpenseId = personalCardTxn.btxn_id;
          return this.transactionService.upsert(etxn.tx as Transaction).pipe(
            switchMap((txn) =>
              this.personalCardsService
                .matchExpense(txn.split_group_id, externalExpenseId)
                .pipe(switchMap(() => this.uploadAttachments(txn.split_group_id)))
            ),
            finalize(() => {
              this.saveExpenseLoader = false;
            })
          );
        })
      )
      .subscribe(() => {
        this.showSnackBarToast({ message: 'Expense created successfully.' }, 'success', ['msb-success']);
        this.router.navigate(['/', 'enterprise', 'personal_cards']);
        this.trackingService.newExpenseCreatedFromPersonalCard();
      });
  }

  uploadAttachments(txnId: string): Observable<FileObject[] | unknown> {
    if (this.newExpenseDataUrls.length > 0) {
      this.newExpenseDataUrls = this.addFileType(this.newExpenseDataUrls as FileObject[]);
      const addExpenseAttachments$ = of(this.newExpenseDataUrls);
      return addExpenseAttachments$.pipe(
        switchMap((fileObjs: FileObject[]) => this.uploadMultipleFiles(fileObjs, txnId))
      );
    } else {
      return of([]);
    }
  }

  addFileType(dataUrls: FileObject[]): FileObject[] {
    const dataUrlsCopy = cloneDeep(dataUrls);
    dataUrlsCopy.map((dataUrl) => {
      dataUrl.type = this.transactionOutboxService.isPDF(dataUrl.type) ? 'pdf' : 'image';
    });

    return dataUrlsCopy;
  }

  uploadMultipleFiles(fileObjs: FileObject[], txnId: string): Observable<unknown> {
    return forkJoin(fileObjs.map((file) => this.uploadFileAndPostToFileService(file, txnId)));
  }

  postToFileService(fileObj: FileObject, txnId: string): Observable<FileObject | unknown> {
    const fileObjCopy = cloneDeep(fileObj);
    fileObjCopy.transaction_id = txnId;
    return this.fileService.post(fileObjCopy);
  }

  uploadFileAndPostToFileService(file: FileObject, txnId: string): Observable<FileObject[] | unknown> {
    return from(this.transactionOutboxService.fileUpload(file.url, file.type)).pipe(
      switchMap((fileObj: FileObject) => this.postToFileService(fileObj, txnId))
    );
  }

  getDuplicateExpenses(): void {
    if (this.activatedRoute.snapshot.params.id) {
      this.handleDuplicates
        .getDuplicatesByExpense(this.activatedRoute.snapshot.params.id as string)
        .pipe(
          switchMap((duplicateSets) => {
            const duplicateIds = duplicateSets
              .map((value) => value.transaction_ids)
              .reduce((acc, curVal) => acc.concat(curVal), []);

            if (duplicateIds.length > 0) {
              const params = {
                tx_id: `in.(${duplicateIds.join(',')})`,
              };
              return this.transactionService.getETxnc({ offset: 0, limit: 100, params }).pipe(
                map((expenses) => {
                  const expensesArray = expenses as [];
                  return duplicateSets.map((duplicateSet) =>
                    this.addExpenseDetailsToDuplicateSets(duplicateSet, expensesArray)
                  );
                })
              );
            } else {
              return of([]);
            }
          })
        )
        .subscribe((duplicateExpensesSet) => {
          this.duplicateExpenses = duplicateExpensesSet[0] as Expense[];
        });
    }
  }

  addExpenseDetailsToDuplicateSets(duplicateSet: DuplicateSet, expensesArray: Expense[]): Expense[] {
    return duplicateSet.transaction_ids.map(
      (expenseId) => expensesArray[expensesArray.findIndex((duplicateTxn: Expense) => expenseId === duplicateTxn.tx_id)]
    );
  }

  async showSuggestedDuplicates(duplicateExpenses: Expense[]): Promise<void> {
    const currencyModal = await this.modalController.create({
      component: SuggestedDuplicatesComponent,
      componentProps: {
        duplicateExpenses,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await currencyModal.present();

    const { data } = (await currencyModal.onWillDismiss()) as {
      data: { action: string };
    };

    if (data?.action === 'dismissed') {
      this.getDuplicateExpenses();
    }
  }

  showSnackBarToast(
    toastMessageData: { message: string; redirectionText?: string },
    type: 'success' | 'information' | 'failure',
    panelClass: string[]
  ): MatSnackBarRef<ToastMessageComponent> {
    return this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties(type, toastMessageData),
      panelClass,
    });
  }

  ionViewWillLeave(): void {
    this.hardwareBackButtonAction.unsubscribe();
    this.projectDependentFieldsRef?.ngOnDestroy();
    this.costCenterDependentFieldsRef?.ngOnDestroy();
    this.onPageExit$.next(null);
    this.onPageExit$.complete();
    this.selectedProject$.complete();
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
