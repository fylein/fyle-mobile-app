// TODO: Very hard to fix this file without making massive changes
/* eslint-disable complexity */
import { TitleCasePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, OnInit, signal, ViewChild, inject } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import dayjs from 'dayjs';
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
  EMPTY,
  timer,
} from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  raceWith,
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
import { CCCExpUnflattened } from 'src/app/core/models/corporate-card-expense-unflattened.model';
import { CostCenterOptions } from 'src/app/core/models/cost-centers-options.model';
import { CurrencyObj } from 'src/app/core/models/currency-obj.model';
import { Currency } from 'src/app/core/models/currency.model';
import { CustomInput } from 'src/app/core/models/custom-input.model';
import { Destination } from 'src/app/core/models/destination.model';
import { Expense } from 'src/app/core/models/expense.model';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { InstaFyleResponse } from 'src/app/core/models/insta-fyle-data.model';
import { MatchedCCCTransaction } from 'src/app/core/models/matchedCCCTransaction.model';
import { OrgSettings, TaxSettings } from 'src/app/core/models/org-settings.model';
import { OutboxQueue } from 'src/app/core/models/outbox-queue.model';
import { ParsedReceipt } from 'src/app/core/models/parsed_receipt.model';
import { ParsedResponse } from 'src/app/core/models/parsed_response.model';
import { PlatformPersonalCardTxn } from 'src/app/core/models/platform/platform-personal-card-txn.model';
import { ExpensePolicy } from 'src/app/core/models/platform/platform-expense-policy.model';
import { FinalExpensePolicyState } from 'src/app/core/models/platform/platform-final-expense-policy-state.model';
import { IndividualExpensePolicyState } from 'src/app/core/models/platform/platform-individual-expense-policy-state.model';
import { PublicPolicyExpense } from 'src/app/core/models/public-policy-expense.model';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { TaxGroup } from 'src/app/core/models/tax-group.model';
import { TxnCustomProperties } from 'src/app/core/models/txn-custom-properties.model';
import { PlatformAccount } from 'src/app/core/models/platform-account.model';

import { UnflattenedTransaction } from 'src/app/core/models/unflattened-transaction.model';
import { CostCenter } from 'src/app/core/models/v1/cost-center.model';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { ExpenseFieldsObj } from 'src/app/core/models/v1/expense-fields-obj.model';
import { OrgCategory, OrgCategoryListItem } from 'src/app/core/models/v1/org-category.model';
import { RecentlyUsed } from 'src/app/core/models/v1/recently_used.model';
import { Transaction } from 'src/app/core/models/v1/transaction.model';
import { DuplicateSet } from 'src/app/core/models/v2/duplicate-sets.model';
import { ProjectV2 } from 'src/app/core/models/v2/project-v2.model';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { DateService } from 'src/app/core/services/date.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { FileService } from 'src/app/core/services/file.service';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
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
import { Expense as PlatformExpense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { AdvanceWallet } from 'src/app/core/models/platform/v1/advance-wallet.model';
import { AdvanceWalletsService } from 'src/app/core/services/platform/v1/spender/advance-wallets.service';
import { TransactionStatusInfoPopoverComponent } from 'src/app/shared/components/transaction-status-info-popover/transaction-status-info-popover.component';
import { CorporateCardTransactionRes } from 'src/app/core/models/platform/v1/corporate-card-transaction-res.model';
import { corporateCardTransaction } from 'src/app/core/models/platform/v1/cc-transaction.model';
import { PlatformFileGenerateUrlsResponse } from 'src/app/core/models/platform/platform-file-generate-urls-response.model';
import { SpenderFileService } from 'src/app/core/services/platform/v1/spender/file.service';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { RefinerService } from 'src/app/core/services/refiner.service';
import { CostCentersService } from 'src/app/core/services/cost-centers.service';
import { CCExpenseMerchantInfoModalComponent } from 'src/app/shared/components/cc-expense-merchant-info-modal/cc-expense-merchant-info-modal.component';
import { CorporateCardExpenseProperties } from 'src/app/core/models/corporate-card-expense-properties.model';
import { TranslocoService } from '@jsverse/transloco';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { ExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { UnlinkCardTransactionResponse } from 'src/app/core/models/platform/unlink-card-transaction-response.model';
import { ExpensesService as SharedExpensesService } from 'src/app/core/services/platform/v1/shared/expenses.service';

// eslint-disable-next-line
type FormValue = {
  currencyObj: {
    currency: string;
    amount: number;
    orig_currency: string;
    orig_amount: number;
  };
  paymentMode: PlatformAccount;
  project: ProjectV2;
  category: OrgCategory;
  dateOfSpend: Date;
  vendor_id: {
    display_name: string;
  };
  purpose: string;
  report: Report;
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
  standalone: false,
})
export class AddEditExpensePage implements OnInit {
  private activatedRoute = inject(ActivatedRoute);

  private accountsService = inject(AccountsService);

  private authService = inject(AuthService);

  private formBuilder = inject(UntypedFormBuilder);

  private categoriesService = inject(CategoriesService);

  private dateService = inject(DateService);

  private projectsService = inject(ProjectsService);

  private reportService = inject(ReportService);

  private platformReportService = inject(SpenderReportsService);

  private customInputsService = inject(CustomInputsService);

  private customFieldsService = inject(CustomFieldsService);

  private transactionService = inject(TransactionService);

  private policyService = inject(PolicyService);

  private transactionOutboxService = inject(TransactionsOutboxService);

  private router = inject(Router);

  private loaderService = inject(LoaderService);

  private modalController = inject(ModalController);

  private fileService = inject(FileService);

  private spenderFileService = inject(SpenderFileService);

  private popoverController = inject(PopoverController);

  private currencyService = inject(CurrencyService);

  private networkService = inject(NetworkService);

  private navController = inject(NavController);

  private corporateCreditCardExpenseService = inject(CorporateCreditCardExpenseService);

  private trackingService = inject(TrackingService);

  private recentLocalStorageItemsService = inject(RecentLocalStorageItemsService);

  private recentlyUsedItemsService = inject(RecentlyUsedItemsService);

  private tokenService = inject(TokenService);

  private expenseFieldsService = inject(ExpenseFieldsService);

  private modalProperties = inject(ModalPropertiesService);

  private actionSheetController = inject(ActionSheetController);

  private orgSettingsService = inject(OrgSettingsService);

  private sanitizer = inject(DomSanitizer);

  private personalCardsService = inject(PersonalCardsService);

  private matSnackBar = inject(MatSnackBar);

  private snackbarProperties = inject(SnackbarPropertiesService);

  platform = inject(Platform);

  private titleCasePipe = inject(TitleCasePipe);

  private paymentModesService = inject(PaymentModesService);

  private taxGroupService = inject(TaxGroupService);

  private costCentersService = inject(CostCentersService);

  private platformEmployeeSettingsService = inject(PlatformEmployeeSettingsService);

  private storageService = inject(StorageService);

  private launchDarklyService = inject(LaunchDarklyService);

  private refinerService = inject(RefinerService);

  private platformHandlerService = inject(PlatformHandlerService);

  private expensesService = inject(ExpensesService);

  private advanceWalletsService = inject(AdvanceWalletsService);

  private expenseCommentService = inject(ExpenseCommentService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('formContainer') formContainer: ElementRef<HTMLFormElement>;

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef<HTMLInputElement>;

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('projectDependentFieldsRef') projectDependentFieldsRef: DependentFieldsComponent;

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('costCenterDependentFieldsRef') costCenterDependentFieldsRef: DependentFieldsComponent;

  etxn$: Observable<Partial<UnflattenedTransaction>>;

  platformExpense$: Observable<PlatformExpense>;

  paymentModes$: Observable<AccountOption[]>;

  recentlyUsedValues$: Observable<RecentlyUsed>;

  isCreatedFromCCC = false;

  isCreatedFromPersonalCard = false;

  paymentAccount$: Observable<PlatformAccount>;

  isCCCAccountSelected$: Observable<boolean>;

  homeCurrency$: Observable<string>;

  mode: string;

  title: string;

  activeIndex: number;

  reviewList: string[];

  fg: UntypedFormGroup;

  filteredCategories$: Observable<OrgCategoryListItem[]>;

  minDate: string;

  maxDate: string;

  txnFields$: Observable<Partial<ExpenseFieldsObj>>;

  taxSettings$: Observable<TaxSettings>;

  reports$: Observable<{ label: string; value: Report }[]>;

  isProjectsEnabled$: Observable<boolean>;

  isCostCentersEnabled$: Observable<boolean>;

  flightJourneyTravelClassOptions$: Observable<{ label: string; value: string }[]>;

  customInputs$: Observable<TxnCustomProperties[]>;

  isBalanceAvailableInAnyAdvanceAccount$: Observable<boolean>;

  selectedCCCTransaction: Partial<MatchedCCCTransaction>;

  canChangeMatchingCCCTransaction = true;

  transactionInReport$: Observable<boolean>;

  isCriticalPolicyViolated = false;

  showSelectedTransaction = false;

  isIndividualProjectsEnabled$: Observable<boolean>;

  individualProjectIds$: Observable<number[]>;

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

  matchedCCCTransaction: Partial<MatchedCCCTransaction>;

  alreadyApprovedExpenses: PlatformExpense[];

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

  fromSplitExpenseReview = false;

  isExpenseBankTxn = false;

  recentCategories: OrgCategoryListItem[];

  // Todo: Rename all `selected` to `isSelected`
  presetCategoryId: number;

  recentlyUsedCategories$: Observable<OrgCategoryListItem[]>;

  clusterDomain: string;

  employeeSettings$: Observable<EmployeeSettings>;

  recentProjects: { label: string; value: ProjectV2; selected?: boolean }[];

  recentCurrencies: Currency[];

  presetProjectId: number | string;

  recentlyUsedProjects$: Observable<ProjectV2[]>;

  recentlyUsedCurrencies$: Observable<Currency[]>;

  recentCostCenters: { label: string; value: CostCenter; selected?: boolean }[];

  presetCostCenterId: number;

  recentlyUsedCostCenters$: Observable<{ label: string; value: CostCenter; selected?: boolean }[]>;

  presetCurrency: string;

  initialFetch: boolean;

  inpageExtractedData: ParsedResponse;

  autoCodedData: ParsedResponse;

  actionSheetOptions$: Observable<{ text: string; handler: () => void }[]>;

  billableDefaultValue: boolean;

  taxGroups$: Observable<TaxGroup[]>;

  taxGroupsOptions$: Observable<{ label: string; value: TaxGroup }[]>;

  isRedirectedFromReport = false;

  canRemoveFromReport = false;

  isSplitExpense: boolean;

  isCccExpense: string;

  cardNumber: string;

  cardNickname: string;

  policyDetails: IndividualExpensePolicyState[];

  source = 'MOBILE';

  isCameraPreviewStarted = false;

  isIos = false;

  duplicateExpenses: Expense[];

  isExpenseMatchedForDebitCCCE: boolean;

  canDismissCCCE: boolean;

  canRemoveCardExpense: boolean;

  isCorporateCreditCardEnabled: boolean;

  isProjectCategoryRestrictionsEnabled$: Observable<boolean>;

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

  selectedProject$: BehaviorSubject<ProjectV2 | null>;

  selectedCostCenter$: BehaviorSubject<CostCenter | null>;

  showReceiptMandatoryError = false;

  _isExpandedView = false;

  recentCategoriesOriginal: OrgCategoryListItem[];

  isRTFEnabled$: Observable<boolean>;

  pendingTransactionAllowedToReportAndSplit = true;

  allCategories$: Observable<OrgCategory[]>;

  activeCategories$: Observable<OrgCategory[]>;

  selectedCategory$: Observable<OrgCategory>;

  isProjectEnabled: boolean;

  isCostCenterEnabled: boolean;

  vendorOptions: string[] = [];

  showBillable = false;

  isLoading = true;

  readonly isPendingGasCharge = signal<boolean>(false);

  readonly isSelectedProjectDisabled = signal(false);

  readonly selectedDisabledProject = signal<ProjectV2 | null>(null);

  private sharedExpensesService = inject(SharedExpensesService);

  private translocoService = inject(TranslocoService);

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
    const el = this.getActiveElement();
    if (el && el instanceof HTMLInputElement) {
      el.scrollIntoView({
        block: 'center',
      });
    }
  }

  getActiveElement(): Element {
    return document.activeElement;
  }

  getFormValues(): FormValue {
    return this.fg.value as FormValue;
  }

  getFormControl(name: string): AbstractControl {
    return this.fg.controls[name];
  }

  goBack(isSameReport?: boolean): void {
    // Get necessary IDs from form and route params.
    const formReportId = this.getFormValues().report?.id;
    const routeReportId = this.activatedRoute.snapshot.params.rp_id as string;

    const shouldPersistFilters = !!this.activatedRoute.snapshot.params.persist_filters;
    const isRedirectedFromReport = !!this.activatedRoute.snapshot.params.isRedirectedFromReport;

    // If filters need to be persisted or if the user was redirected from a report,
    // simply navigate back to the previous page.
    if (shouldPersistFilters || isRedirectedFromReport) {
      this.navController.back();
      return;
    }

    let navigationRoute: [string, string, string, { id?: string }?];
    let queryParams: { [key: string]: boolean } | undefined;

    // Determine the navigation route based on the report context.
    if (formReportId && routeReportId) {
      // If the expense is associated with a report.
      const reportId = isSameReport ? routeReportId : formReportId;
      navigationRoute = ['/', 'enterprise', 'my_view_report', { id: String(reportId) }];
    } else {
      // Default navigation if no report context.
      navigationRoute = ['/', 'enterprise', 'my_expenses'];
      if (this.mode === 'add') {
        // If a new expense was added, add a query param for redirection context.
        queryParams = { redirected_from_add_expense: true };
      }
    }

    // Execute the navigation.
    this.router.navigate(navigationRoute, { queryParams });
  }

  async showClosePopup(): Promise<void> {
    const isAutofilled =
      this.presetCategoryId || this.presetProjectId || this.presetCostCenterId || this.presetCurrency;
    if (this.fg.touched || this.activatedRoute.snapshot.params.dataUrl || isAutofilled) {
      const unsavedChangesPopOver = await this.popoverController.create({
        component: PopupAlertComponent,
        componentProps: {
          title: this.translocoService.translate<string>('addEditExpense.unsavedChanges'),
          message: this.translocoService.translate<string>('addEditExpense.unsavedChangesMessage'),
          primaryCta: {
            text: this.translocoService.translate<string>('addEditExpense.discard'),
            action: 'continue',
          },
          secondaryCta: {
            text: this.translocoService.translate<string>('addEditExpense.cancel'),
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
        isNumber(taxGroupControl.value.percentage) &&
        this.fg.controls.currencyObj.value
      ) {
        const amount =
          currencyObjControl.value.amount - currencyObjControl.value.amount / (taxGroupControl.value.percentage + 1);

        const formattedAmount = this.currencyService.getAmountWithCurrencyFraction(
          amount,
          currencyObjControl.value.currency,
        );

        this.fg.controls.tax_amount.setValue(formattedAmount);
      } else {
        this.fg.controls.tax_amount.setValue(null);
      }
    });
  }

  checkIfInvalidPaymentMode(): Observable<boolean> {
    const formValues = this.getFormValues();
    return forkJoin({
      etxn: this.etxn$,
      orgSettings: this.orgSettingsService.get(),
    }).pipe(
      map(({ etxn, orgSettings }) => {
        const paymentMode: PlatformAccount | AdvanceWallet = formValues.paymentMode;
        const isAdvanceWalletEnabled = orgSettings?.advances?.advance_wallets_enabled;
        const originalAdvanceWalletId = etxn && etxn.tx && etxn.tx.advance_wallet_id;
        let isPaymentModeInvalid = false;

        // Check if it's specifically an advance wallet (has id but no acc property)
        const isAdvanceWallet = isAdvanceWalletEnabled && paymentMode?.id && !paymentMode?.type;

        if (isAdvanceWallet) {
          const advanceWallet = paymentMode as unknown as AdvanceWallet;
          if (etxn.tx.id && paymentMode.id === originalAdvanceWalletId) {
            isPaymentModeInvalid =
              advanceWallet.balance_amount + etxn.tx.amount < (formValues.currencyObj && formValues.currencyObj.amount);
          } else {
            isPaymentModeInvalid =
              advanceWallet.balance_amount < (formValues.currencyObj && formValues.currencyObj.amount);
          }
        }

        if (isPaymentModeInvalid && isAdvanceWallet) {
          this.paymentModesService.showInvalidPaymentModeToast();
        }
        return isPaymentModeInvalid;
      }),
    );
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1),
    );
  }

  async showSplitBlockedPopover(message: string): Promise<void> {
    const splitBlockedPopoverSpy = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Expense cannot be split',
        message,
        primaryCta: {
          text: 'OK',
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await splitBlockedPopoverSpy.present();
  }

  openSplitExpenseModal(): void {
    const customFields$ = this.getCustomFields();
    const formValue = this.getFormValues();

    forkJoin({
      generatedEtxn: this.generateEtxnFromFg(this.etxn$, customFields$),
      txnFields: this.txnFields$.pipe(take(1)),
      expenseFields: this.expenseFieldsService.getAllEnabled(false).pipe(shareReplay(1)),
    }).subscribe(
      (res: { generatedEtxn: UnflattenedTransaction; txnFields: ExpenseFieldsObj; expenseFields: ExpenseField[] }) => {
        if (res.generatedEtxn.tx.report_id && !formValue.report?.id) {
          const popoverMessage =
            'Looks like you have removed this expense from the report. Please select a report for this expense before splitting it.';
          return this.showSplitBlockedPopover(popoverMessage);
        }

        if (
          res.generatedEtxn.tx.tax_amount &&
          Math.abs(res.generatedEtxn.tx.amount) < Math.abs(res.generatedEtxn.tx.tax_amount)
        ) {
          const popoverMessage =
            'Looks like the tax amount is more than the expense amount. Please correct the tax amount before splitting it.';
          return this.showSplitBlockedPopover(popoverMessage);
        }
        const splitConfig = {
          category: {
            is_visible: !!res.txnFields.org_category_id,
            value: formValue.category,
            is_mandatory: res.txnFields.org_category_id?.is_mandatory || false,
          },
          project: {
            is_visible: this.isProjectEnabled,
            value: formValue.project,
            is_mandatory: res.txnFields.project_id?.is_mandatory || false,
          },
          costCenter: {
            is_visible: this.isCostCenterEnabled,
            value: formValue.costCenter,
            is_mandatory: res.txnFields.cost_center_id?.is_mandatory || false,
          },
        };

        this.router.navigate([
          '/',
          'enterprise',
          'split_expense',
          {
            splitConfig: JSON.stringify(splitConfig),
            txnFields: JSON.stringify(res.txnFields),
            txn: JSON.stringify(res.generatedEtxn.tx),
            currencyObj: JSON.stringify(this.fg.controls.currencyObj.value),
            fileObjs: JSON.stringify(res.generatedEtxn.dataUrls),
            selectedCCCTransaction: this.selectedCCCTransaction ? JSON.stringify(this.selectedCCCTransaction) : null,
            selectedReportId: formValue.report ? JSON.stringify(formValue.report.id) : null,
            selectedProject: formValue.project ? JSON.stringify(formValue.project) : null,
            expenseFields: res.expenseFields ? JSON.stringify(res.expenseFields) : null,
          },
        ]);
      },
    );
  }

  markCCCAsPersonal(): Observable<CorporateCardTransactionRes> {
    this.trackingService.deleteExpense({ Type: 'Marked Personal' });
    return this.corporateCreditCardExpenseService.markPersonal(this.corporateCreditCardExpenseGroupId);
  }

  dismissCCC(corporateCreditCardExpenseId: string): Observable<CorporateCardTransactionRes> {
    this.trackingService.deleteExpense({ Type: 'Dismiss as Card Payment' });
    return this.corporateCreditCardExpenseService.dismissCreditTransaction(corporateCreditCardExpenseId);
  }

  getRemoveCCCExpModalParams(
    header: string,
    body: string,
    ctaText: string,
    ctaLoadingText: string,
  ): {
    component: typeof FyDeleteDialogComponent;
    cssClass: string;
    backdropDismiss: boolean;
    componentProps: {
      header: string;
      body: string;
      ctaText: string;
      ctaLoadingText: string;
      deleteMethod: () => Observable<UnlinkCardTransactionResponse>;
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
        deleteMethod: (): Observable<UnlinkCardTransactionResponse> =>
          this.transactionService.removeCorporateCardExpense(this.activatedRoute.snapshot.params.id as string),
      },
    };
  }

  async removeCorporateCardExpense(): Promise<void> {
    const header = this.translocoService.translate('addEditExpense.removeCardExpense');
    const body = this.transactionService.getRemoveCardExpenseDialogBody(this.isSplitExpensesPresent);
    const ctaText = this.translocoService.translate('addEditExpense.confirm');
    const ctaLoadingText = this.translocoService.translate('addEditExpense.confirming');
    const deletePopover = await this.popoverController.create(
      this.getRemoveCCCExpModalParams(header, body, ctaText, ctaLoadingText),
    );

    await deletePopover.present();
    const { data } = (await deletePopover.onDidDismiss()) as {
      data: {
        status: string;
      };
    };

    if (data?.status === 'success') {
      let txnDetails: Partial<UnflattenedTransaction>;
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
      const toastMessage = this.translocoService.translate('addEditExpense.successfullyRemovedCardDetails');
      const toastMessageData = {
        message: toastMessage,
      };

      this.showSnackBarToast(toastMessageData, 'information', ['msb-info']);
      this.trackingService.showToastMessage({ ToastContent: toastMessageData.message });
    }
  }

  getMarkDismissModalParams(
    componentPropsParam: { header: string; body: string; ctaText: string; ctaLoadingText: string },
    isMarkPersonal: boolean,
  ): {
    component: typeof FyDeleteDialogComponent;
    cssClass: string;
    backdropDismiss: boolean;
    componentProps: {
      header: string;
      body: string;
      ctaText: string;
      ctaLoadingText: string;
      deleteMethod: () => Observable<CorporateCardTransactionRes>;
    };
  } {
    return {
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: componentPropsParam.header,
        body: componentPropsParam.body,
        ctaText: componentPropsParam.ctaText,
        ctaLoadingText: componentPropsParam.ctaLoadingText,
        deleteMethod: (): Observable<CorporateCardTransactionRes> => {
          if (isMarkPersonal) {
            return this.markCCCAsPersonal();
          } else {
            return this.dismissCCC(this.matchedCCCTransaction?.id);
          }
        },
      },
    };
  }

  async markPeronsalOrDismiss(type: string): Promise<void> {
    this.etxn$.subscribe(
      (etxn) => (this.corporateCreditCardExpenseGroupId = etxn?.tx?.corporate_credit_card_expense_group_id),
    );
    const isMarkPersonal = type === 'personal' && this.isExpenseMatchedForDebitCCCE;
    const header = isMarkPersonal
      ? this.translocoService.translate('addEditExpense.markExpenseAsPersonal')
      : this.translocoService.translate('addEditExpense.dismissThisExpense');
    const body = isMarkPersonal
      ? this.translocoService.translate('addEditExpense.markAsPersonalMessage')
      : this.translocoService.translate('addEditExpense.dismissMessage');
    const ctaText = this.translocoService.translate('addEditExpense.yes');
    const ctaLoadingText = isMarkPersonal
      ? this.translocoService.translate('addEditExpense.marking')
      : this.translocoService.translate('addEditExpense.dismissing');

    const deletePopover = await this.popoverController.create(
      this.getMarkDismissModalParams(
        {
          header,
          body,
          ctaText,
          ctaLoadingText,
        },
        isMarkPersonal,
      ),
    );

    await deletePopover.present();
    const { data } = (await deletePopover.onDidDismiss()) as {
      data: {
        status: string;
      };
    };

    if (data && data.status === 'success') {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
      const toastMessage = isMarkPersonal
        ? this.translocoService.translate('addEditExpense.markedExpenseAsPersonal')
        : this.translocoService.translate('addEditExpense.dismissedExpense');
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
      let invalidElement: Element;

      if (this.showReceiptMandatoryError) {
        invalidElement = formContainer.querySelector('.receipt-mandatory-error');
      } else {
        invalidElement = formContainer.querySelector('.ng-invalid');
      }

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

  splitExpenseHandler(): void {
    if (this.pendingTransactionAllowedToReportAndSplit) {
      if (this.fg.valid) {
        this.openSplitExpenseModal();
      } else {
        this.showFormValidationErrors();
      }
    } else {
      this.showTransactionPendingToast();
    }
  }

  showTransactionPendingToast(): void {
    this.showSnackBarToast(
      { message: this.translocoService.translate('addEditExpense.cantSplitTransactionPending') },
      'failure',
      ['msb-failure'],
    );
    this.trackingService.spenderTriedSplittingExpenseWithPendingTxn();
  }

  getActionSheetOptions(): Observable<{ text: string; handler: () => void }[]> {
    return this.orgSettingsService.get().pipe(
      map((orgSettings) => {
        const isSplitExpenseAllowed = orgSettings.expense_settings.split_expense_settings.enabled;

        const actionSheetOptions: { text: string; handler: () => void }[] = [];

        if (isSplitExpenseAllowed) {
          actionSheetOptions.push({
            text: this.translocoService.translate('addEditExpense.actionSheetSplitExpense'),
            handler: () => this.splitExpenseHandler(),
          });
        }

        if (this.isCccExpense) {
          if (this.isExpenseMatchedForDebitCCCE) {
            actionSheetOptions.push({
              text: this.translocoService.translate('addEditExpense.actionSheetMarkAsPersonal'),
              handler: () => this.markPersonalHandler(),
            });
          }

          if (this.canDismissCCCE) {
            actionSheetOptions.push({
              text: this.translocoService.translate('addEditExpense.actionSheetDismissAsCardPayment'),
              handler: () => this.markDismissHandler(),
            });
          }
        }

        if (this.isCorporateCreditCardEnabled && this.canRemoveCardExpense) {
          actionSheetOptions.push({
            text: this.translocoService.translate('addEditExpense.actionSheetRemoveCardExpense'),
            handler: () => this.removeCCCHandler(),
          });
        }
        return actionSheetOptions;
      }),
    );
  }

  showMoreActions(): void {
    this.actionSheetOptions$
      .pipe(
        switchMap((actionSheetOptions) => {
          const actionSheet = this.actionSheetController.create({
            header: this.translocoService.translate('addEditExpense.actionSheetMoreActionsHeader'),
            mode: 'md',
            cssClass: 'fy-action-sheet',
            buttons: actionSheetOptions,
          });
          return actionSheet;
        }),
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

    this.costCenters$ = orgSettings$.pipe(
      switchMap((orgSettings) => {
        if (orgSettings.cost_centers.enabled) {
          return this.costCentersService.getAllActive();
        } else {
          return of([]);
        }
      }),
      map((costCenters: CostCenter[]) =>
        costCenters.map((costCenter) => ({
          label: costCenter.name,
          value: costCenter,
        })),
      ),
    );
  }

  checkAdvanceWalletsWithSufficientBalance(advanceWallets: AdvanceWallet[]): boolean {
    return !!advanceWallets?.some((advanceWallet) => advanceWallet.balance_amount > 0);
  }

  checkAdvanceAccountAndBalance(account: PlatformAccount): boolean {
    return account?.type === AccountType.ADVANCE && account.tentative_balance_amount > 0;
  }

  setupBalanceFlag(): void {
    const accounts$ = this.accountsService.getMyAccounts();
    const advanceWallets$ = this.advanceWalletsService.getAllAdvanceWallets();
    const orgSettings$ = this.orgSettingsService.get();
    this.isBalanceAvailableInAnyAdvanceAccount$ = this.fg.controls.paymentMode.valueChanges.pipe(
      switchMap((paymentMode: PlatformAccount) => {
        // check both advance wallets and advance accounts
        let isAdvanceWalletEnabled = false;
        orgSettings$.pipe(map((orgSettings) => orgSettings?.advances?.advance_wallets_enabled)).subscribe((data) => {
          isAdvanceWalletEnabled = data;
        });
        if (paymentMode?.type === AccountType.PERSONAL && !!isAdvanceWalletEnabled) {
          return advanceWallets$.pipe(
            map((advanceWallets) => this.checkAdvanceWalletsWithSufficientBalance(advanceWallets)),
          );
        } else if (paymentMode?.type === AccountType.PERSONAL && !isAdvanceWalletEnabled) {
          return accounts$.pipe(
            map((accounts) => accounts.filter((account) => this.checkAdvanceAccountAndBalance(account)).length > 0),
          );
        }
        return of(false);
      }),
    );
  }

  getCCCSettings(orgSettings: OrgSettings): boolean {
    return orgSettings?.corporate_credit_card_settings?.allowed && orgSettings.corporate_credit_card_settings.enabled;
  }

  getPaymentModes(): Observable<AccountOption[]> {
    return forkJoin({
      accounts: this.accountsService.getMyAccounts(),
      advanceWallets: this.advanceWalletsService.getAllAdvanceWallets(),
      orgSettings: this.orgSettingsService.get(),
      etxn: this.etxn$,
      allowedPaymentModes: this.platformEmployeeSettingsService.getAllowedPaymentModes(),
      isPaymentModeConfigurationsEnabled: this.paymentModesService.checkIfPaymentModeConfigurationsIsEnabled(),
    }).pipe(
      map(
        ({ accounts, advanceWallets, orgSettings, etxn, allowedPaymentModes, isPaymentModeConfigurationsEnabled }) => {
          const isCCCEnabled = this.getCCCSettings(orgSettings);
          const isAdvanceWalletEnabled = orgSettings?.advances?.advance_wallets_enabled;

          if (!isCCCEnabled && !etxn.tx.corporate_credit_card_expense_group_id) {
            this.showCardTransaction = false;
          }
          const config = {
            etxn,
            orgSettings,
            expenseType: ExpenseType.EXPENSE,
            isPaymentModeConfigurationsEnabled,
          };

          if (isAdvanceWalletEnabled) {
            return this.accountsService.getPaymentModesWithAdvanceWallets(
              accounts,
              advanceWallets,
              allowedPaymentModes,
              config,
            );
          }

          return this.accountsService.getPaymentModes(accounts, allowedPaymentModes, config);
        },
      ),
      shareReplay(1),
    );
  }

  getInstaFyleImageData(): Observable<Partial<InstaFyleImageData>> {
    if (this.activatedRoute.snapshot.params.dataUrl && this.activatedRoute.snapshot.params.canExtractData !== 'false') {
      const dataUrl = this.activatedRoute.snapshot.params.dataUrl as string;
      const b64Image = dataUrl.replace('data:image/jpeg;base64,', '');
      const scanStartTime = Date.now();
      return from(this.transactionOutboxService.parseReceipt(b64Image)).pipe(
        timeout(15000),
        map((parsedResponse) => {
          const scanEndTime = Date.now();
          const scanDuration = (scanEndTime - scanStartTime) / 1000; // in seconds
          this.trackingService.receiptScanTimeInstaFyle({ duration: scanDuration, fileType: 'image' });
          return {
            parsedResponse: parsedResponse.data,
          };
        }),
        catchError(() =>
          of({
            error: true,
            parsedResponse: {
              source: 'MOBILE_INSTA',
            },
          }),
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
            this.autoCodedData = details;
          }

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
                      })),
                    );
                } else {
                  return of(instaFyleImageData);
                }
              }),
            );
          } else {
            return of(instaFyleImageData);
          }
        }),
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
      employeeSettings: this.employeeSettings$,
      homeCurrency: this.homeCurrency$,
      eou: eou$,
      imageData: this.getInstaFyleImageData(),
      recentCurrency: from(this.recentLocalStorageItemsService.get<Currency>('recent-currency-cache')),
      recentValue: this.recentlyUsedValues$,
    }).pipe(
      switchMap((dependencies) => {
        const extractedCategoryDetails = dependencies.imageData?.parsedResponse as ParsedResponse;
        if (extractedCategoryDetails?.category) {
          return this.categoriesService.getCategoryByName(extractedCategoryDetails.category).pipe(
            map((category) => {
              const newDependencies = { ...dependencies, extractedCategory: category };
              return newDependencies;
            }),
          );
        } else {
          return of({ ...dependencies, extractedCategory: null });
        }
      }),
      map(
        (dependencies: {
          orgSettings: OrgSettings;
          employeeSettings: EmployeeSettings;
          extractedCategory: OrgCategory;
          homeCurrency: string;
          eou: ExtendedOrgUser;
          imageData: InstaFyleResponse;
          recentCurrency: Currency[];
          recentValue: RecentlyUsed;
        }) => {
          const {
            orgSettings,
            employeeSettings,
            extractedCategory,
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
            (JSON.parse(this.activatedRoute.snapshot.params.personalCardTxn as string) as PlatformPersonalCardTxn);
          this.isExpenseBankTxn = !!bankTxn;
          const projectEnabled = orgSettings.projects && orgSettings.projects.enabled;
          let etxn: Partial<UnflattenedTransaction>;
          if (!bankTxn && !personalCardTxn) {
            etxn = {
              tx: {
                skip_reimbursement: false,
                source: 'MOBILE',
                spent_at: new Date(),
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

            if (
              orgSettings.org_expense_form_autofills &&
              orgSettings.org_expense_form_autofills.allowed &&
              orgSettings.org_expense_form_autofills.enabled &&
              employeeSettings.expense_form_autofills?.allowed &&
              employeeSettings.expense_form_autofills?.enabled &&
              recentValue &&
              recentValue.currencies &&
              recentValue.currencies.length > 0
            ) {
              etxn.tx.currency = recentValue.currencies[0];
              this.presetCurrency = recentValue.currencies[0];
            } else {
              etxn.tx.currency =
                (recentCurrency && recentCurrency[0] && recentCurrency[0].shortCode) || etxn.tx.currency;
            }

            if (projectEnabled && employeeSettings.default_project_id) {
              etxn.tx.project_id = employeeSettings.default_project_id;
            }
          } else if (personalCardTxn) {
            etxn = {
              tx: {
                spent_at: new Date(personalCardTxn.spent_at),
                source: 'MOBILE',
                currency: personalCardTxn.currency,
                amount: personalCardTxn.amount,
                vendor: personalCardTxn.merchant,
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
                spent_at: new Date(bankTxn.ccce.txn_dt),
                source: 'MOBILE',
                currency: bankTxn.ccce.currency,
                category_id: bankTxn.org_category_id,
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
              etxn.tx.spent_at = this.dateService.getUTCDate(new Date(extractedData.date));
            }

            if (extractedData.invoice_dt) {
              etxn.tx.spent_at = this.dateService.getUTCDate(new Date(extractedData.invoice_dt));
            }

            if (extractedData.vendor) {
              const vendor = this.filterVendor(extractedData.vendor);
              etxn.tx.vendor = vendor;
            }

            if (extractedCategory) {
              etxn.tx.category_id = extractedCategory.id;
              etxn.tx.fyle_category = extractedCategory.fyle_category;
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
        },
      ),
      shareReplay(1),
    );
  }

  getSelectedProjects(): Observable<ProjectV2> {
    return this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.project_id) {
          return of(etxn.tx.project_id);
        } else {
          return forkJoin({
            orgSettings: this.orgSettingsService.get(),
            employeeSettings: this.employeeSettings$,
          }).pipe(
            map(({ orgSettings, employeeSettings }) => {
              if (orgSettings.projects.enabled) {
                return employeeSettings.default_project_id;
              }
            }),
          );
        }
      }),
      switchMap((projectId) => {
        if (projectId) {
          return this.activeCategories$.pipe(
            switchMap((allActiveCategories) => this.projectsService.getbyId(projectId, allActiveCategories)),
          );
        } else {
          return of(null);
        }
      }),
    );
  }

  getSelectedCategory(): Observable<OrgCategory> {
    return this.etxn$.pipe(
      switchMap((etxn) => {
        // filter out unspecified category as it is not a valid category
        if (etxn.tx.category_id && etxn.tx.fyle_category?.toLowerCase() !== 'unspecified') {
          return this.categoriesService.getCategoryById(etxn.tx.category_id);
        } else {
          return of(null);
        }
      }),
    );
  }

  getSelectedReport(): Observable<Report> {
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
          etxn: Partial<UnflattenedTransaction>;
          reportOptions: { label: string; value: Report }[];
        }) => {
          if (etxn.tx.report_id) {
            return reportOptions
              .map((res) => res.value)
              .find((reportOption: Report) => reportOption.id === etxn.tx.report_id);
          } else if (!etxn.tx.report_id && this.activatedRoute.snapshot.params.rp_id) {
            return reportOptions
              .map((res) => res.value)
              .find((reportOption: Report) => reportOption.id === this.activatedRoute.snapshot.params.rp_id);
          } else if (
            !autoSubmissionReportName &&
            reportOptions.length === 1 &&
            reportOptions[0].value.state === 'DRAFT'
          ) {
            return reportOptions[0].value;
          } else {
            return null;
          }
        },
      ),
    );
  }

  getSelectedPaymentModes(): Observable<PlatformAccount | AdvanceWallet> {
    return forkJoin({
      etxn: this.etxn$,
      paymentModes: this.paymentModes$,
    }).pipe(map(({ etxn, paymentModes }) => this.accountsService.getEtxnSelectedPaymentMode(etxn, paymentModes)));
  }

  getDefaultPaymentModes(): Observable<PlatformAccount | AdvanceWallet> {
    return forkJoin({
      paymentModes: this.paymentModes$,
      employeeSettings: this.platformEmployeeSettingsService.get(),
    }).pipe(
      map(({ paymentModes, employeeSettings }) => {
        const allAllowedPaymentModes = employeeSettings?.payment_mode_settings?.allowed_payment_modes;

        if (allAllowedPaymentModes && allAllowedPaymentModes.length > 0) {
          // Use first allowed payment mode from employee settings
          const defaultPaymentModeType = allAllowedPaymentModes[0];

          // Find the first payment mode that matches the default type
          const defaultPaymentMode = paymentModes.find((paymentMode) => {
            if ('type' in paymentMode.value) {
              // For PlatformAccount objects, check the type property
              return (paymentMode.value as PlatformAccount).type === defaultPaymentModeType;
            } else {
              // For AdvanceWallet objects, they represent PERSONAL_ADVANCE_ACCOUNT
              return defaultPaymentModeType === 'PERSONAL_ADVANCE_ACCOUNT';
            }
          });

          if (defaultPaymentMode) {
            return defaultPaymentMode.value;
          }
        }
        // Fallback to the first available payment mode if no match found
        return paymentModes[0]?.value;
      }),
    );
  }

  getRecentProjects(): Observable<ProjectV2[]> {
    return forkJoin({
      recentValues: this.recentlyUsedValues$,
      eou: this.authService.getEou(),
      activeCategories: this.activeCategories$,
      isProjectCategoryRestrictionsEnabled: this.isProjectCategoryRestrictionsEnabled$,
      selectedCategoryId: this.etxn$.pipe(map((etxn) => etxn.tx.category_id)),
    }).pipe(
      switchMap(({ recentValues, eou, activeCategories, isProjectCategoryRestrictionsEnabled, selectedCategoryId }) => {
        const categoryIds = selectedCategoryId ? [`${selectedCategoryId}`] : null;
        return this.recentlyUsedItemsService.getRecentlyUsedProjects({
          recentValues,
          eou,
          categoryIds,
          isProjectCategoryRestrictionsEnabled,
          activeCategoryList: activeCategories,
        });
      }),
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
        this.recentlyUsedItemsService.getRecentCostCenters(costCenters, recentValue),
      ),
    );
  }

  getRecentCurrencies(): Observable<Currency[]> {
    return forkJoin({
      recentValues: this.recentlyUsedValues$,
      currencies: this.currencyService.getAll(),
    }).pipe(
      switchMap(({ recentValues, currencies }) =>
        this.recentlyUsedItemsService.getRecentCurrencies(currencies, recentValues),
      ),
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
            }),
          );
        }
      }),
      switchMap((costCenterId) => {
        if (costCenterId) {
          return this.costCenters$.pipe(
            map((costCenters) =>
              costCenters
                .map((res: CostCenterOptions) => res.value)
                .find((costCenter) => costCenter.id === costCenterId),
            ),
          );
        } else {
          return of(null);
        }
      }),
    );
  }

  getReceiptCount(): Observable<number> {
    return this.etxn$.pipe(
      switchMap((etxn) => (etxn.tx.id ? this.platformExpense$ : of({}))),
      map((expense: PlatformExpense) => expense.file_ids?.length || 0),
    );
  }

  setupFormInit(): void {
    // Set loading state when form initialization starts
    this.isLoading = true;

    const selectedProject$ = this.getSelectedProjects();

    this.selectedCategory$ = this.getSelectedCategory().pipe(shareReplay(1));

    const selectedReport$ = this.getSelectedReport();

    const selectedPaymentMode$ = this.getSelectedPaymentModes();

    this.recentlyUsedCostCenters$ = this.getRecentCostCenters();

    const defaultPaymentMode$ = this.getDefaultPaymentModes();

    this.recentlyUsedProjects$ = this.getRecentProjects();

    this.recentlyUsedCurrencies$ = this.getRecentCurrencies();

    const selectedCostCenter$ = this.getSelectedCostCenters();

    const customExpenseFields$ = this.customInputsService.getAll(true).pipe(shareReplay(1));

    const txnReceiptsCount$ = this.getReceiptCount();

    // Keep the scanning loader for receipt scanning, but remove the general loading overlay
    if (this.activatedRoute.snapshot.params.dataUrl) {
      from(
        this.loaderService.showLoader('Scanning information from the receipt...', 15000, 'assets/images/scanning.gif'),
      ).subscribe();
    }

    // Load data without overlay loader, using skeleton loading instead
    forkJoin({
      etxn: this.etxn$,
      paymentMode: selectedPaymentMode$,
      project: selectedProject$,
      category: this.selectedCategory$,
      report: selectedReport$,
      costCenter: selectedCostCenter$,
      customExpenseFields: customExpenseFields$,
      txnReceiptsCount: txnReceiptsCount$,
      homeCurrency: this.currencyService.getHomeCurrency(),
      orgSettings: this.orgSettingsService.get(),
      defaultPaymentMode: defaultPaymentMode$,
      employeeSettings: this.employeeSettings$,
      recentValue: this.recentlyUsedValues$,
      recentProjects: this.recentlyUsedProjects$,
      recentCurrencies: this.recentlyUsedCurrencies$,
      recentCostCenters: this.recentlyUsedCostCenters$,
      recentCategories: this.recentlyUsedCategories$,
      taxGroups: this.taxGroups$,
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          // Hide scanning loader if it was shown
          if (this.activatedRoute.snapshot.params.dataUrl) {
            this.loaderService.hideLoader();
          }
        }),
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
          employeeSettings,
          recentValue,
          recentCategories,
          recentProjects,
          recentCurrencies,
          recentCostCenters,
          taxGroups,
        }) => {
          this.recentCategoriesOriginal = recentCategories;

          if (project) {
            this.selectedProject$.next(project);
          }

          if (costCenter) {
            this.selectedCostCenter$.next(costCenter);
          }

          const customInputs = this.customFieldsService.standardizeCustomFields(
            [],
            this.customInputsService.filterByCategory(customExpenseFields, etxn.tx.category_id),
          );

          const customInputValues: {
            name: string;
            value: string | number | string[] | number[] | Date | boolean | { display?: string };
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

          if (etxn.tx.tax_group_id && taxGroups) {
            const tg = taxGroups.find((tg) => tg.id === etxn.tx.tax_group_id);
            this.fg.patchValue({
              tax_group: tg,
            });
          }

          // Check if auto-fills is enabled
          const isAutofillsEnabled =
            orgSettings?.org_expense_form_autofills?.allowed &&
            orgSettings?.org_expense_form_autofills?.enabled &&
            employeeSettings?.expense_form_autofills?.allowed &&
            employeeSettings?.expense_form_autofills?.enabled;

          // Check if recent projects exist
          const doRecentProjectIdsExist =
            isAutofillsEnabled && recentValue && recentValue.project_ids && recentValue.project_ids.length > 0;

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
                const isProjectCategoryRestrictionsEnabled =
                  orgSettings.advanced_projects.allowed && orgSettings.advanced_projects.enable_category_restriction;

                if (isProjectCategoryRestrictionsEnabled) {
                  const isAllowedRecentCategories = recentCategories.map((category) =>
                    project.project_org_category_ids.includes(category.value.id),
                  );

                  // Set the updated allowed recent categories
                  this.recentCategories = recentCategories.filter((category) =>
                    project.project_org_category_ids.includes(category.value.id),
                  );

                  // Only if the most recent category is allowed for the auto-filled project, category field can be auto-filled
                  canAutofillCategory = isAllowedRecentCategories[0];
                }
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
            isAutofillsEnabled && recentValue && recentValue.cost_center_ids && recentValue.cost_center_ids.length > 0;

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

          const expenseCategory = category?.enabled ? category : null;

          this.fg.patchValue(
            {
              project,
              category: expenseCategory,
              dateOfSpend: etxn.tx.spent_at && dayjs(etxn.tx.spent_at).format('YYYY-MM-DD'),
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
              billable: etxn.tx.billable,
              custom_inputs: customInputValues,

              hotel_is_breakfast_provided: etxn.tx.hotel_is_breakfast_provided,
            },
            {
              emitEvent: false,
            },
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

          if (this.activatedRoute.snapshot.params.extractData && this.activatedRoute.snapshot.params.image) {
            this.parseFile(
              JSON.parse(this.activatedRoute.snapshot.params.image as string) as {
                type: string;
                url: string;
                thumbnail?: string;
              },
            );
          }
        },
      );
  }

  getAutofillCategory(config: {
    isAutofillsEnabled: boolean;
    recentValue: RecentlyUsed;
    recentCategories: OrgCategoryListItem[];
    etxn: Partial<UnflattenedTransaction>;
    category: OrgCategory;
  }): OrgCategory {
    const { isAutofillsEnabled, recentValue, recentCategories, etxn } = config;

    let category = config.category;

    const doRecentOrgCategoryIdsExist = isAutofillsEnabled && recentValue?.category_ids?.length;

    if (recentCategories?.length) {
      this.recentCategories = recentCategories;
    }

    const isCategoryEmpty = !etxn.tx.category_id || etxn.tx.fyle_category?.toLowerCase() === 'unspecified';

    /*
     * Autofill should be applied if:
     * - Autofilled is allowed and enabled for the user
     * - The user has some recently used categories present
     * - isTxnEligibleForCategoryAutofill:
     * - The transaction category is empty or 'unspecified'
     * - The user is on creating a new expense or editing a DRAFT expense that was created from bulk upload or bulk instafyle
     */
    const isNewExpense = !etxn.tx.id;
    const canAutofillCategoryDuringEdit =
      etxn.tx.state === 'DRAFT' && ['WEBAPP_BULK', 'MOBILE_DASHCAM_BULK'].includes(etxn.tx.source);
    const isTxnEligibleForCategoryAutofill = isCategoryEmpty && (isNewExpense || canAutofillCategoryDuringEdit);
    if (doRecentOrgCategoryIdsExist && isTxnEligibleForCategoryAutofill) {
      const autoFillCategory = recentCategories?.length && recentCategories[0];

      if (autoFillCategory) {
        category = autoFillCategory.value;
        this.presetCategoryId = autoFillCategory.value.id;
      }
    }
    return category;
  }

  getCategoryOnEdit(category: OrgCategory): Observable<OrgCategory | null> {
    return forkJoin({
      employeeSettings: this.platformEmployeeSettingsService.get(),
      orgSettings: this.orgSettingsService.get(),
      recentValues: this.recentlyUsedValues$,
      recentCategories: this.recentlyUsedCategories$,
      etxn: this.etxn$,
    }).pipe(
      switchMap(
        ({
          employeeSettings,
          orgSettings,
          recentValues,
          recentCategories,
          etxn,
        }: {
          employeeSettings: EmployeeSettings;
          orgSettings: OrgSettings;
          recentValues: RecentlyUsed;
          recentCategories: OrgCategoryListItem[];
          etxn: Partial<UnflattenedTransaction>;
        }) => {
          const isExpenseCategoryUnspecified = etxn.tx.fyle_category?.toLowerCase() === 'unspecified';
          if (this.initialFetch && etxn.tx.category_id && !isExpenseCategoryUnspecified) {
            return this.selectedCategory$.pipe(
              map((selectedCategory) => ({
                employeeSettings,
                orgSettings,
                recentValues,
                recentCategories,
                etxn,
                selectedCategory,
              })),
            );
          }
          return of({
            employeeSettings,
            orgSettings,
            recentValues,
            recentCategories,
            etxn,
            selectedCategory: null as OrgCategory,
          });
        },
      ),
      map(({ employeeSettings, orgSettings, recentValues, recentCategories, etxn, selectedCategory }) => {
        const isAutofillsEnabled =
          orgSettings?.org_expense_form_autofills?.allowed &&
          orgSettings?.org_expense_form_autofills?.enabled &&
          employeeSettings?.expense_form_autofills?.allowed &&
          employeeSettings?.expense_form_autofills?.enabled;
        const isCategoryExtracted = etxn.tx?.extracted_data?.category;
        if (this.initialFetch) {
          if (etxn.tx.category_id) {
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
          } else if (etxn.tx.state === 'DRAFT' && !isCategoryExtracted && !etxn.tx.category_id) {
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
      }),
    );
  }

  getCategoryOnAdd(category: OrgCategory): Observable<OrgCategory> {
    if (category) {
      return of(category);
    } else {
      return forkJoin({
        employeeSettings: this.platformEmployeeSettingsService.get(),
        orgSettings: this.orgSettingsService.get(),
        recentValues: this.recentlyUsedValues$,
        recentCategories: this.recentlyUsedCategories$,
        etxn: this.etxn$,
      }).pipe(
        map(({ employeeSettings, orgSettings, recentValues, recentCategories, etxn }) => {
          const isAutofillsEnabled =
            orgSettings?.org_expense_form_autofills?.allowed &&
            orgSettings?.org_expense_form_autofills?.enabled &&
            employeeSettings?.expense_form_autofills?.allowed &&
            employeeSettings?.expense_form_autofills?.enabled;
          const isCategoryExtracted = etxn.tx && etxn.tx.extracted_data && etxn.tx.extracted_data.category;
          if (
            !isCategoryExtracted &&
            (!etxn.tx.category_id || (etxn.tx.fyle_category && etxn.tx.fyle_category.toLowerCase() === 'unspecified'))
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
        }),
      );
    }
  }

  setupCustomFields(): void {
    this.initialFetch = true;

    const customExpenseFields$ = this.customInputsService.getAll(true).pipe(shareReplay(1));

    const categoryControl = this.getFormControl('category');

    const customInputsFeilds$: Observable<TxnCustomProperties[]> = categoryControl.valueChanges.pipe(
      startWith({}),
      distinctUntilChanged(),
      switchMap((category) =>
        iif(
          () => this.mode === 'add',
          this.getCategoryOnAdd(categoryControl.value as OrgCategory),
          this.getCategoryOnEdit(categoryControl.value as OrgCategory),
        ),
      ),
      switchMap((category: OrgCategory) => {
        if (!category) {
          // set to unspecified category if no category is selected
          return this.allCategories$.pipe(
            map((categories) => {
              const unspecifiedCategory = categories.find(
                (category) => category.fyle_category?.toLowerCase() === 'unspecified',
              );
              return unspecifiedCategory;
            }),
          );
        } else {
          return of(category);
        }
      }),
      switchMap((category: OrgCategory) => {
        const formValue = this.fg.value as {
          custom_inputs: CustomInput[];
        };
        return customExpenseFields$.pipe(
          map((customFields: ExpenseField[]) =>
            customFields.filter((customField) => customField.type !== 'DEPENDENT_SELECT'),
          ),
          map((customFields: ExpenseField[]) =>
            this.customFieldsService.standardizeCustomFields(
              formValue.custom_inputs || [],
              this.customInputsService.filterByCategory(customFields, category?.enabled && category.id),
            ),
          ),
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
        }),
      ),
      switchMap((customFields: TxnCustomProperties[]) =>
        this.isConnected$.pipe(
          take(1),
          map((isConnected: boolean) => {
            const customFieldsFormArray = this.fg.controls.custom_inputs as UntypedFormArray;
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
                }),
              );
            }
            customFieldsFormArray.updateValueAndValidity();
            return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
          }),
        ),
      ),
      shareReplay(1),
    );

    this.customInputs$ = customInputsFeilds$;

    this.dependentFields$ = customExpenseFields$.pipe(
      map((customFields) => customFields.filter((customField) => customField.type === 'DEPENDENT_SELECT')),
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
          }),
        ),
      ),
    );
  }

  updateFormForExpenseFields(txnFieldsMap$: Observable<Partial<ExpenseFieldsObj>>): void {
    this.etxn$
      .pipe(
        switchMap(() => txnFieldsMap$),
        tap((txnFields) => {
          this.showBillable = txnFields?.billable?.is_enabled;
        }),
        map((txnFields) => this.expenseFieldsService.getDefaultTxnFieldValues(txnFields)),
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
              control.patchValue(this.showBillable ? defaultValues[defaultValueColumn] : false);
            } else if (
              defaultValueColumn === 'tax_group_id' &&
              !control.value &&
              !control.touched &&
              control.value !== ''
            ) {
              this.taxGroups$.subscribe((taxGroups) => {
                if (taxGroups) {
                  const tg = taxGroups.find((tg) => (tg.name = defaultValues[defaultValueColumn]));
                  control.patchValue(tg);
                }
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
                this.vendorOptions = options;
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
      shareReplay(1),
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
              : Validators.required,
          );
          projectFormControl.updateValueAndValidity();
        }
      },
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
            })),
          ),
        ),
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
            } else if (txnFieldKey === 'spent_at') {
              control.setValidators(
                isConnected ? Validators.compose([Validators.required, this.customDateValidator]) : null,
              );
            } else if (txnFieldKey === 'tax_group_id') {
              control.setValidators(isConnected && taxGroups && taxGroups.length > 0 ? Validators.required : null);
            } else if (txnFieldKey === 'org_category_id') {
              control.setValidators(
                isConnected && filteredCategories && filteredCategories.length > 0 ? Validators.required : null,
              );
            } else {
              control.setValidators(isConnected ? Validators.required : null);
            }
          } else {
            // set back the customDateValidator for spent_at field
            if (txnFieldKey === 'spent_at' && isConnected) {
              control.setValidators(this.customDateValidator);
            }
          }

          control.updateValueAndValidity();
        }
        this.fg.updateValueAndValidity();
      });

    this.updateFormForExpenseFields(txnFieldsMap$);
  }

  setupFilteredCategories(): void {
    const projectControl = this.fg.controls.project as {
      value: {
        project_id: number;
      };
    };

    const projectId$ = this.etxn$.pipe(map((etxn) => etxn.tx.project_id || projectControl?.value?.project_id));

    this.filteredCategories$ = combineLatest([projectId$, this.activeCategories$]).pipe(
      switchMap(([projectId, allActiveCategories]) => {
        if (projectId) {
          return this.projectsService.getbyId(projectId, allActiveCategories);
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
              this.fg.patchValue({ billable: this.showBillable ? this.billableDefaultValue : false });
            }
          }),
          startWith(initialProject),
          concatMap((project: ProjectV2) =>
            forkJoin([this.activeCategories$, this.isProjectCategoryRestrictionsEnabled$]).pipe(
              map(([activeCategories, isProjectCategoryRestrictionsEnabled]) =>
                this.projectsService.getAllowedOrgCategoryIds(
                  project,
                  activeCategories,
                  isProjectCategoryRestrictionsEnabled,
                ),
              ),
            ),
          ),
          tap((categories) => this.handleCategoryValidation(categories)),
          map((categories) => categories.map((category) => ({ label: category.displayName, value: category }))),
        ),
      ),
      shareReplay(1),
    );

    this.fg.controls.project.valueChanges
      .pipe(
        withLatestFrom(this.isProjectCategoryRestrictionsEnabled$),
        tap(([project, isProjectCategoryRestrictionsEnabled]: [{ project_org_category_ids: number[] }, boolean]) => {
          if (project && project.project_org_category_ids.length !== 0 && isProjectCategoryRestrictionsEnabled) {
            this.recentCategories = this.recentCategoriesOriginal?.filter((originalCategory) =>
              project.project_org_category_ids.includes(originalCategory.value.id),
            );
          } else {
            this.recentCategories = this.recentCategoriesOriginal;
          }
        }),
      )
      .subscribe(noop);

    this.filteredCategories$.subscribe((categories) => {
      const formValue = this.fg.value as {
        category: {
          id: number;
        };
      };
      if (
        formValue.category &&
        formValue.category.id &&
        !categories.some(
          (category: { value: { id: number } }) => formValue.category && formValue.category.id === category.value.id,
        )
      ) {
        this.fg.controls.category.reset();
      }
    });
  }

  handleCategoryValidation(categories: OrgCategory[]): void {
    this.txnFields$.pipe(takeUntil(this.onPageExit$)).subscribe((txnFields) => {
      const isMandatory = txnFields?.org_category_id?.is_mandatory;
      const categoryControl = this.fg.controls.category;
      if (!categoryControl) {
        return;
      }
      if (isMandatory) {
        categoryControl.setValidators(categories.length ? [Validators.required] : null);
      } else {
        categoryControl.clearValidators();
      }
      categoryControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  getEditExpenseObservable(): Observable<Partial<UnflattenedTransaction>> {
    this.platformExpense$ = this.expensesService.getExpenseById(this.activatedRoute.snapshot.params.id as string).pipe(
      catchError(() => {
        this.loaderService.hideLoader();
        this.loaderService.showLoader('This expense no longer exists. Redirecting to expenses list', 1000);
        this.goBack();
        return EMPTY;
      }),
      shareReplay(1),
    );
    return this.platformExpense$.pipe(
      switchMap((expense) => {
        const etxn = this.transactionService.transformExpense(expense);
        this.isPendingGasCharge.set(this.sharedExpensesService.isPendingGasCharge(expense));

        if (etxn && etxn.tx.extracted_data) {
          this.autoCodedData = etxn.tx.extracted_data;
          this.autoCodedData.vendor_name = etxn.tx.extracted_data.vendor;
        }

        this.isIncompleteExpense = etxn.tx.state === 'DRAFT';
        this.source = etxn.tx.source || 'MOBILE';
        if (etxn.tx.state === 'DRAFT' && etxn.tx.extracted_data) {
          if (etxn.tx.extracted_data.amount && !etxn.tx.amount) {
            etxn.tx.amount = etxn.tx.extracted_data.amount;
          }

          if (etxn.tx.extracted_data.currency && !etxn.tx.currency) {
            etxn.tx.currency = etxn.tx.extracted_data.currency;
          }

          if (etxn.tx.extracted_data.date && !etxn.tx.spent_at) {
            etxn.tx.spent_at = this.dateService.getUTCDate(new Date(etxn.tx.extracted_data.date));
          }

          if (etxn.tx.extracted_data.invoice_dt && !etxn.tx.spent_at) {
            etxn.tx.spent_at = this.dateService.getUTCDate(new Date(etxn.tx.extracted_data.invoice_dt));
          }

          if (etxn.tx.extracted_data.vendor && !etxn.tx.vendor) {
            const vendor = this.filterVendor(etxn.tx.extracted_data.vendor);
            etxn.tx.vendor = vendor;
          }

          if (
            etxn.tx.extracted_data.category &&
            etxn.tx.fyle_category &&
            etxn.tx.fyle_category.toLowerCase() === 'unspecified'
          ) {
            const categoryName = etxn.tx.extracted_data.category || 'unspecified';
            return this.categoriesService.getCategoryByName(categoryName).pipe(
              map((selectedCategory) => {
                etxn.tx.category_id = selectedCategory && selectedCategory.id;
                return etxn;
              }),
            );
          }
          return of(etxn);
        }
        return of(etxn);
      }),
      shareReplay(1),
    );
  }

  goToPrev(activeIndex: number): void {
    if (this.reviewList[activeIndex - 1]) {
      this.expensesService
        .getExpenseById(this.reviewList[activeIndex - 1])
        .pipe(
          catchError(() => {
            // expense not found, so skipping it
            this.reviewList.splice(activeIndex - 1, 1);
            if (activeIndex === 0) {
              this.goBack();
            } else {
              this.goToPrev(activeIndex - 1);
            }
            return EMPTY;
          }),
        )
        .subscribe((expense) => {
          const etxn = this.transactionService.transformExpense(expense);
          this.goToTransaction(etxn, this.reviewList, activeIndex - 1);
        });
    } else {
      this.goBack();
    }
  }

  goToNext(activeIndex: number): void {
    if (this.reviewList[activeIndex + 1]) {
      this.expensesService
        .getExpenseById(this.reviewList[activeIndex + 1])
        .pipe(
          catchError(() => {
            // expense not found, so skipping it
            this.reviewList.splice(activeIndex + 1, 1);
            if (activeIndex === this.reviewList.length - 1) {
              this.goBack();
            } else {
              this.goToNext(activeIndex);
            }
            return EMPTY;
          }),
        )
        .subscribe((expense) => {
          const etxn = this.transactionService.transformExpense(expense);
          this.goToTransaction(etxn, this.reviewList, activeIndex + 1);
        });
    }
  }

  goToTransaction(expense: Partial<UnflattenedTransaction>, reviewList: string[], activeIndex: number): void {
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
          navigate_back: true,
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
          navigate_back: true,
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
          navigate_back: true,
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

  taxAmountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const isAmountGreaterThanTaxAmount = Math.abs(this.getAmount()) > Math.abs(control.value as number);
      return isAmountGreaterThanTaxAmount ? null : { taxAmountGreaterThanAmount: true };
    };
  }

  initClassObservables(): void {
    this.isNewReportsFlowEnabled = false;
    this.onPageExit$ = new Subject();
    this.projectDependentFieldsRef?.ngOnInit();
    this.costCenterDependentFieldsRef?.ngOnInit();
    this.selectedProject$ = new BehaviorSubject<ProjectV2>(null);
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
      .subscribe((project: ProjectV2) => this.selectedProject$.next(project));
  }

  setupSelectedCostCenterObservable(): void {
    this.fg.controls.costCenter.valueChanges.pipe(takeUntil(this.onPageExit$)).subscribe((costCenter: CostCenter) => {
      this.selectedCostCenter$.next(costCenter);
    });
  }

  getCCCpaymentMode(): void {
    this.isCCCPaymentModeSelected$ = this.fg.controls.paymentMode.valueChanges.pipe(
      map((paymentMode: PlatformAccount) => paymentMode?.type === AccountType.CCC),
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

  handleCCCExpenses(etxn: Partial<UnflattenedTransaction>, matchedTransaction: corporateCardTransaction): void {
    if (matchedTransaction) {
      this.matchedCCCTransaction = this.corporateCreditCardExpenseService.transformCCTransaction(matchedTransaction);
    } else {
      this.matchedCCCTransaction = etxn.tx.matched_corporate_card_transactions[0];
    }
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
      this.cardNickname = this.selectedCCCTransaction.corporate_card_nickname;
    }
  }

  getSplitExpenses(splitExpenses: PlatformExpense[]): void {
    this.isSplitExpensesPresent = splitExpenses.length > 1;
    if (this.isSplitExpensesPresent) {
      this.alreadyApprovedExpenses = splitExpenses.filter(
        (splitExpense) => ['DRAFT', 'COMPLETE'].indexOf(splitExpense.state) === -1,
      );

      this.canEditCCCMatchedSplitExpense = this.alreadyApprovedExpenses.length < 1;
    }
  }

  initSplitTxn(orgSettings$: Observable<OrgSettings>): void {
    combineLatest([orgSettings$, this.etxn$])
      .pipe(
        map(([orgSettings, etxn]) => ({ orgSettings, etxn })),
        filter(
          ({ orgSettings, etxn }) =>
            this.getCCCSettings(orgSettings) || !!etxn.tx.corporate_credit_card_expense_group_id,
        ),
        filter(({ etxn }) => etxn.tx.corporate_credit_card_expense_group_id && !!etxn.tx.spent_at),
        switchMap(({ etxn }) =>
          forkJoin({
            splitExpenses: this.expensesService.getSplitExpenses(etxn.tx.split_group_id),
            matchedTransaction:
              etxn.tx?.matched_corporate_card_transactions?.length === 0
                ? this.corporateCreditCardExpenseService.getMatchedTransactionById(
                    etxn.tx.corporate_credit_card_expense_group_id,
                  )
                : of(null),
          }).pipe(map(({ splitExpenses, matchedTransaction }) => ({ etxn, splitExpenses, matchedTransaction }))),
        ),
      )
      .subscribe(({ etxn, splitExpenses, matchedTransaction }) => {
        if (splitExpenses && splitExpenses.length > 0) {
          this.getSplitExpenses(splitExpenses);
        }
        this.handleCCCExpenses(etxn, matchedTransaction?.data[0]);
      });
  }

  getIsPolicyExpense(etxn: Expense): boolean {
    return isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001;
  }

  getCheckSpiltExpense(etxn: Partial<UnflattenedTransaction>): boolean {
    return etxn?.tx?.split_group_id !== etxn?.tx?.id;
  }

  getDebitCCCExpense(etxn: Partial<UnflattenedTransaction>): boolean {
    return !!etxn?.tx?.corporate_credit_card_expense_group_id && etxn.tx.amount > 0;
  }

  getDismissCCCExpense(etxn: Partial<UnflattenedTransaction>): boolean {
    return !!etxn?.tx?.corporate_credit_card_expense_group_id && etxn.tx.amount < 0;
  }

  getRemoveCCCExpense(etxn: Partial<UnflattenedTransaction>): boolean {
    return (
      !!etxn?.tx?.corporate_credit_card_expense_group_id &&
      ['APPROVER_PENDING', 'COMPLETE', 'DRAFT'].includes(etxn.tx.state)
    );
  }

  ionViewWillEnter(): void {
    // Clear project cache when re-entering the form
    this.recentLocalStorageItemsService.clear('recentlyUsedProjects');

    this.allCategories$ = this.categoriesService.getAll().pipe(shareReplay(1));
    this.activeCategories$ = this.allCategories$
      .pipe(map((catogories) => this.categoriesService.filterRequired(catogories)))
      .pipe(shareReplay(1));

    this.initClassObservables();

    this.newExpenseDataUrls = [];

    from(this.tokenService.getClusterDomain()).subscribe((clusterDomain) => {
      this.clusterDomain = clusterDomain;
    });

    this.navigateBack = this.activatedRoute.snapshot.params.navigate_back as boolean;
    this.fromSplitExpenseReview = this.activatedRoute.snapshot.params.fromSplitExpenseReview as boolean;
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
      tax_amount: [, this.taxAmountValidator()],
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
      custom_inputs: new UntypedFormArray([]),
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
    this.employeeSettings$ = this.platformEmployeeSettingsService.get().pipe(shareReplay(1));

    this.homeCurrency$ = this.currencyService.getHomeCurrency();
    const accounts$ = this.accountsService.getMyAccounts();

    this.isRTFEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          (orgSettings.visa_enrollment_settings.allowed && orgSettings.visa_enrollment_settings.enabled) ||
          (orgSettings.mastercard_enrollment_settings.allowed && orgSettings.mastercard_enrollment_settings.enabled),
      ),
    );

    this.isAdvancesEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          (orgSettings.advances && orgSettings.advances.enabled) ||
          (orgSettings.advance_requests && orgSettings.advance_requests.enabled),
      ),
    );

    this.isProjectCategoryRestrictionsEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.advanced_projects.allowed && orgSettings.advanced_projects.enable_category_restriction,
      ),
    );

    this.taxGroups$ = orgSettings$.pipe(
      switchMap((orgSettings) => {
        if (orgSettings && orgSettings.tax_settings && orgSettings.tax_settings.enabled) {
          return this.taxGroupService.get().pipe(shareReplay(1));
        } else {
          return of(null);
        }
      }),
    );

    this.taxGroupsOptions$ = this.taxGroups$.pipe(
      map((taxGroupsOptions) => taxGroupsOptions?.map((tg) => ({ label: tg.name, value: tg }))),
    );

    orgSettings$.subscribe((orgSettings) => {
      this.isCorporateCreditCardEnabled = this.getCCCSettings(orgSettings);

      this.isNewReportsFlowEnabled = orgSettings?.simplified_report_closure_settings?.enabled || false;

      this.isProjectEnabled = orgSettings?.projects.enabled || false;
      this.isCostCenterEnabled = orgSettings?.cost_centers.enabled || false;

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
      shareReplay(1),
    );

    this.individualProjectIds$ = this.employeeSettings$.pipe(
      map((employeeSettings: EmployeeSettings) => employeeSettings.project_ids?.map((id) => Number(id)) || []),
      shareReplay(1),
    );

    this.isIndividualProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.advanced_projects && orgSettings.advanced_projects.enable_individual_projects),
    );

    const projectCount$ = this.activeCategories$.pipe(
      switchMap((allActiveCategories) =>
        this.projectsService.getProjectCount({ categoryIds: [] }, allActiveCategories),
      ),
    );

    this.isProjectsVisible$ = forkJoin({
      individualProjectIds: this.individualProjectIds$,
      isIndividualProjectsEnabled: this.isIndividualProjectsEnabled$,
      projectsCount: projectCount$,
    }).pipe(
      map(({ individualProjectIds, isIndividualProjectsEnabled, projectsCount }) => {
        if (!isIndividualProjectsEnabled) {
          return projectsCount > 0;
        } else {
          return individualProjectIds.length > 0;
        }
      }),
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

    this.title = 'Add expense';
    this.title =
      this.activeIndex > -1 && this.reviewList && this.activeIndex < this.reviewList.length ? 'Review' : 'Edit';

    this.isProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.projects && orgSettings.projects.enabled),
    );

    this.comments$ = this.expenseCommentService.getTransformedComments(
      this.activatedRoute.snapshot.params.id as string,
    );

    this.isSplitExpenseAllowed$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.expense_settings.split_expense_settings.enabled),
    );

    this.setupBalanceFlag();

    const today = new Date();
    this.minDate = dayjs(new Date('Jan 1, 2001')).format('YYYY-MM-D');
    this.maxDate = dayjs(this.dateService.addDaysToDate(today, 1)).format('YYYY-MM-D');

    this.paymentAccount$ = accounts$.pipe(
      map((accounts) => {
        if (!this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn) {
          return accounts.find((account) => account.type === AccountType.CCC);
        } else {
          return null;
        }
      }),
    );

    this.isCCCAccountSelected$ = accounts$.pipe(
      map((accounts) => {
        if (!this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn) {
          return accounts.some((account) => account.type === AccountType.CCC);
        } else {
          return false;
        }
      }),
    );

    const newExpensePipe$ = this.getNewExpenseObservable();

    const editExpensePipe$ = this.getEditExpenseObservable();

    this.etxn$ = iif(() => this.activatedRoute.snapshot.params.id as boolean, editExpensePipe$, newExpensePipe$).pipe(
      shareReplay(1),
    );

    /**
     * Fetching the expense from platform APIs in edit case, this is required because corporate card transaction status (PENDING or POSTED) is not available in public transactions API
     */
    if (this.activatedRoute.snapshot.params.id) {
      const pendingTxnRestrictionEnabled$ = this.orgSettingsService
        .get()
        .pipe(
          map(
            (orgSetting) =>
              orgSetting.corporate_credit_card_settings?.enabled && orgSetting.pending_cct_expense_restriction?.enabled,
          ),
        );

      forkJoin({
        platformExpense: this.platformExpense$,
        pendingTxnRestrictionEnabled: pendingTxnRestrictionEnabled$,
      })
        .pipe(take(1))
        .subscribe((config) => {
          if (
            config.pendingTxnRestrictionEnabled &&
            config.platformExpense.matched_corporate_card_transactions?.length &&
            config.platformExpense.matched_corporate_card_transactions[0]?.status === ExpenseTransactionStatus.PENDING
          ) {
            this.pendingTransactionAllowedToReportAndSplit = false;
          }
        });
    }

    this.attachments$ = this.loadAttachments$.pipe(
      switchMap(() =>
        this.etxn$.pipe(
          switchMap((etxn) => (etxn.tx.id ? this.platformExpense$ : of({}))),
          switchMap((expense: PlatformExpense) =>
            expense.file_ids?.length > 0 ? this.spenderFileService.generateUrlsBulk(expense.file_ids) : of([]),
          ),
          map((response: PlatformFileGenerateUrlsResponse[]) => {
            const files = response.filter((file) => file.content_type !== 'text/html');
            const receiptObjs: FileObject[] = files.map((file) => {
              const details = this.fileService.getReceiptsDetails(file.name, file.download_url);

              const receipt: FileObject = {
                id: file.id,
                name: file.name,
                url: file.download_url,
                type: details.type,
                thumbnail: details.thumbnail,
              };

              return receipt;
            });

            return receiptObjs;
          }),
        ),
      ),
    );

    this.paymentModes$ = this.getPaymentModes();

    this.initSplitTxn(orgSettings$);

    this.setupFilteredCategories();

    this.setupExpenseFields();

    this.flightJourneyTravelClassOptions$ = this.txnFields$.pipe(
      map((txnFields) => {
        const txnFieldsOptions = txnFields?.flight_journey_travel_class?.options as string[];
        return txnFields.flight_journey_travel_class && txnFieldsOptions.map((v) => ({ label: v, value: v }));
      }),
    );

    this.taxSettings$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.tax_settings),
      map((taxSettings) => {
        const taxOptions = taxSettings.groups as TaxGroup[];
        return {
          ...taxSettings,
          groups: taxOptions && taxOptions.map((tax) => ({ label: tax.name, value: tax })),
        };
      }),
    );

    this.reports$ = this.platformReportService
      .getAllReportsByParams({ state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' })
      .pipe(
        map((reports) =>
          reports.filter((report) => !report.approvals.some((approval) => approval.state === 'APPROVAL_DONE')),
        ),
        map((reports: Report[]) => reports.map((report) => ({ label: report.purpose, value: report }))),
        shareReplay(1),
      );

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
        }) => this.recentlyUsedItemsService.getRecentCategories(filteredCategories, recentValues),
      ),
    );

    this.setupFormInit();

    this.setupCustomFields();

    this.transactionInReport$ = this.etxn$.pipe(
      map((etxn) => ['APPROVER_PENDING', 'APPROVER_INQUIRY'].indexOf(etxn.tx.state) > -1),
    );

    this.isAmountCapped$ = this.etxn$.pipe(
      map((etxn) => isNumber(etxn.tx.admin_amount) || isNumber(etxn.tx.policy_amount)),
    );

    this.isAmountDisabled$ = this.etxn$.pipe(map((etxn) => !!etxn.tx.admin_amount));

    this.isCriticalPolicyViolated$ = this.etxn$.pipe(
      map((etxn) => isNumber(etxn.tx.policy_amount) && etxn.tx.policy_amount < 0.0001),
    );

    this.etxn$.subscribe((etxn) => {
      this.isSplitExpense = this.getCheckSpiltExpense(etxn);
      this.isCccExpense = etxn?.tx?.corporate_credit_card_expense_group_id;
      // Show payment mode if it is not a CCC expense
      this.showPaymentMode = !this.isCccExpense;
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

  getExpenseAttachments(mode: string): Observable<FileObject[]> {
    if (mode === 'add') {
      return of(
        this.newExpenseDataUrls.map((fileObj: FileObject) => {
          fileObj.type = fileObj.type === 'application/pdf' || fileObj.type === 'pdf' ? 'pdf' : 'image';
          return fileObj;
        }),
      );
    } else {
      return this.platformExpense$.pipe(
        switchMap((expense: PlatformExpense) =>
          expense.file_ids?.length > 0 ? this.spenderFileService.generateUrlsBulk(expense.file_ids) : of([]),
        ),
        map((response: PlatformFileGenerateUrlsResponse[]) => {
          const files = response.filter((file) => file.content_type !== 'text/html');
          const receiptObjs: FileObject[] = files.map((file) => {
            const details = this.fileService.getReceiptsDetails(file.name, file.download_url);

            const receipt: FileObject = {
              id: file.id,
              name: file.name,
              url: file.download_url,
              type: details.type,
              thumbnail: details.thumbnail,
            };

            return receipt;
          });

          return receiptObjs;
        }),
      );
    }
  }

  getSourceAccID(): string {
    const formValue = this.getFormValues();
    const paymentMode = formValue?.paymentMode;
    // If it's an advance wallet (has id but no type property), return null for source_account_id
    if (paymentMode?.id && !paymentMode?.type) {
      return null;
    }
    return paymentMode?.id;
  }

  getAdvanceWalletId(isAdvanceWalletEnabled: boolean): string {
    const formValue = this.getFormValues();
    const paymentMode = formValue?.paymentMode;
    // If it's an advance wallet (has id but no type property), return the advance wallet id
    if (isAdvanceWalletEnabled && paymentMode?.id && !paymentMode?.type) {
      return paymentMode.id;
    }
    // For regular payment modes, return null for advance_wallet_id
    return null;
  }

  getBillable(): boolean {
    return this.getFormValues()?.billable;
  }

  getSkipRemibursement(): boolean {
    const formValue = this.getFormValues();
    const paymentMode = formValue?.paymentMode;
    // If it's an advance wallet (has id but no acc property), skip reimbursement
    if (paymentMode?.id && !paymentMode?.type) {
      return true;
    }
    // If it's a personal account that's not reimbursable, skip reimbursement
    return paymentMode?.type === AccountType.PERSONAL && !paymentMode.isReimbursable;
  }

  getSpendDate(): Date {
    const formValue = this.getFormValues();
    return !!formValue?.dateOfSpend ? this.dateService.getUTCDate(new Date(formValue.dateOfSpend)) : null;
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

  getAmount(): number {
    return this.getFormValues()?.currencyObj?.amount;
  }

  generateEtxnFromFg(
    etxn$: Observable<Partial<UnflattenedTransaction>>,
    standardisedCustomProperties$: Observable<TxnCustomProperties[]>,
  ): Observable<Partial<UnflattenedTransaction>> {
    const attachements$ = this.getExpenseAttachments(this.mode);
    return forkJoin({
      etxn: etxn$,
      customProperties: standardisedCustomProperties$,
      attachments: attachements$,
      orgSettings: this.orgSettingsService.get(),
      allCategories: this.allCategories$,
    }).pipe(
      map((res) => {
        const etxn: Partial<UnflattenedTransaction> = res.etxn;
        const isAdvanceWalletEnabled = res.orgSettings?.advances?.advance_wallets_enabled;
        let customProperties = res.customProperties;
        customProperties = customProperties.map((customProperty) => {
          if (!customProperty.value) {
            this.customFieldsService.setDefaultValue(customProperty, customProperty.type);
          }
          if (customProperty.type === 'DATE') {
            customProperty.value = customProperty.value
              ? this.dateService.getUTCDate(new Date(customProperty.value as string))
              : null;
          }
          return customProperty;
        });
        const unspecifiedCategory = res.allCategories.find(
          (category) => category.fyle_category?.toLowerCase() === 'unspecified',
        );

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

        if (this.inpageExtractedData) {
          etxn.tx.extracted_data = this.inpageExtractedData;
          this.autoCodedData = this.inpageExtractedData;
        }

        // If user has not edited the amount, then send user_amount
        let amount = this.getAmount();
        if (amount === etxn.tx.amount && etxn.tx.user_amount) {
          amount = etxn.tx.user_amount;
        }

        const category_id = this.getOrgCategoryID() || unspecifiedCategory.id;

        //TODO: Add dependent fields to custom_properties array once APIs are available
        return {
          tx: {
            ...etxn.tx,
            source: this.source || etxn.tx.source,
            source_account_id: this.getSourceAccID(),
            advance_wallet_id: this.getAdvanceWalletId(isAdvanceWalletEnabled),
            billable: this.getBillable(),
            skip_reimbursement: this.getSkipRemibursement(),
            spent_at: this.getSpendDate(),
            currency: this.getCurrency(),
            amount,
            orig_currency: this.getOriginalCurrency(),
            orig_amount: this.getOriginalAmount(),
            project_id: this.getProjectID(),
            tax_amount: this.getTaxAmount(),
            tax_group_id: this.getTaxGroupID(),
            category_id: category_id,
            fyle_category: this.getFyleCategory(),
            policy_amount: null,
            vendor: this.getDisplayName(),
            purpose: this.getPurpose(),
            locations: locations || [],
            custom_properties: customProperties || [],
            num_files: res.attachments?.length,
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
            ...costCenter,
          },
          ou: etxn.ou,
          dataUrls: [].concat(this.newExpenseDataUrls),
        };
      }),
    );
  }

  triggerNpsSurvey(): void {
    this.launchDarklyService.getVariation('nps_survey', false).subscribe((showNpsSurvey) => {
      if (showNpsSurvey) {
        this.refinerService.startSurvey({ actionName: 'Save Expense' });
      }
    });
  }

  showSaveExpenseLoader(redirectedFrom: string): void {
    this.saveExpenseLoader = redirectedFrom === 'SAVE_EXPENSE';
    this.saveAndNewExpenseLoader = redirectedFrom === 'SAVE_AND_NEW_EXPENSE';
    this.saveAndNextExpenseLoader = redirectedFrom === 'SAVE_AND_NEXT_EXPENSE';
    this.saveAndPrevExpenseLoader = redirectedFrom === 'SAVE_AND_PREV_EXPENSE';
  }

  hideSaveExpenseLoader(): void {
    this.saveExpenseLoader = false;
    this.saveAndNewExpenseLoader = false;
    this.saveAndNextExpenseLoader = false;
    this.saveAndPrevExpenseLoader = false;
  }

  checkIfReceiptIsMissingAndMandatory(redirectedFrom: string): Observable<boolean> {
    if (this.attachedReceiptsCount > 0) {
      return of(false);
    }

    this.showSaveExpenseLoader(redirectedFrom);

    return this.isConnected$.pipe(
      take(1),
      switchMap((isConnected) => {
        if (isConnected) {
          const customFields$ = this.getCustomFields();
          return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
            switchMap((etxn) =>
              // TODO: We should not use as unknown, this needs to be removed everywhere
              this.policyService.getPlatformPolicyExpense(
                etxn as unknown as { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] },
                this.selectedCCCTransaction,
              ),
            ),
            switchMap((platformPolicyExpense) => this.transactionService.checkMandatoryFields(platformPolicyExpense)),
            map((missingMandatoryFields) => !!missingMandatoryFields.missing_receipt),
            tap((isReceiptMissingAndMandatory) => {
              this.showReceiptMandatoryError = isReceiptMissingAndMandatory;
            }),
            catchError(() => of(false)),
          );
        } else {
          return of(false);
        }
      }),
      finalize(() => {
        this.hideSaveExpenseLoader();
        this.triggerNpsSurvey();
      }),
    );
  }

  checkPolicyViolation(etxn: { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] }): Observable<ExpensePolicy> {
    return this.policyService.getPlatformPolicyExpense(etxn, this.selectedCCCTransaction).pipe(
      switchMap((platformPolicyExpense) => this.transactionService.checkPolicy(platformPolicyExpense)),
      catchError((err: Error) => {
        this.trackingService.checkPolicyError({ label: err });
        return throwError(() => err);
      }),
    );
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
          ...(dependentField.id && { id: dependentField.id }),
          name: dependentField.label,
          value: dependentField.value,
        }));
        return this.customFieldsService.standardizeCustomFields(mappedDependentFields || [], customFields);
      }),
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
        },
      ),
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
    const isSameReport = this.activatedRoute.snapshot.params.rp_id === formValues.report?.id;

    forkJoin({
      invalidPaymentMode: that.checkIfInvalidPaymentMode().pipe(take(1)),
      isReceiptMissingAndMandatory: that.checkIfReceiptIsMissingAndMandatory('SAVE_EXPENSE'),
    }).subscribe(({ invalidPaymentMode, isReceiptMissingAndMandatory }) => {
      const saveIncompleteExpense = that.activatedRoute.snapshot.params.dataUrl && !formValues.report?.id;
      if (saveIncompleteExpense || (that.fg.valid && !invalidPaymentMode && !isReceiptMissingAndMandatory)) {
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
                }),
              )
              .subscribe(() => this.goBack(isSameReport));
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

    forkJoin({
      invalidPaymentMode: that.checkIfInvalidPaymentMode(),
      isReceiptMissingAndMandatory: that.checkIfReceiptIsMissingAndMandatory('SAVE_AND_NEW_EXPENSE'),
    }).subscribe(({ invalidPaymentMode, isReceiptMissingAndMandatory }) => {
      if (that.fg.valid && !invalidPaymentMode && !isReceiptMissingAndMandatory) {
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

    that.checkIfReceiptIsMissingAndMandatory('SAVE_AND_PREV_EXPENSE').subscribe((isReceiptMissingAndMandatory) => {
      if (that.fg.valid && !isReceiptMissingAndMandatory) {
        if (that.mode === 'add') {
          that.addExpense('SAVE_AND_PREV_EXPENSE').subscribe(() => {
            if (+this.activeIndex === 0) {
              that.goBack();
            } else {
              that.goToPrev(+this.activeIndex);
            }
          });
        } else {
          // to do edit
          that.editExpense('SAVE_AND_PREV_EXPENSE').subscribe(() => {
            if (+this.activeIndex === 0) {
              that.goBack();
            } else {
              that.goToPrev(+this.activeIndex);
            }
          });
        }
      } else {
        that.showFormValidationErrors();
      }
    });
  }

  saveExpenseAndGotoNext(): void {
    const that = this;
    that.checkIfReceiptIsMissingAndMandatory('SAVE_AND_NEXT_EXPENSE').subscribe((isReceiptMissingAndMandatory) => {
      if (that.fg.valid && !isReceiptMissingAndMandatory) {
        if (that.mode === 'add') {
          that.addExpense('SAVE_AND_NEXT_EXPENSE').subscribe(() => {
            if (+this.activeIndex === this.reviewList.length - 1) {
              that.goBack();
            } else {
              that.goToNext(+this.activeIndex);
            }
          });
        } else {
          // to do edit
          that.editExpense('SAVE_AND_NEXT_EXPENSE').subscribe(() => {
            if (+this.activeIndex === this.reviewList.length - 1) {
              that.goBack();
            } else {
              that.goToNext(+this.activeIndex);
            }
          });
        }
      } else {
        that.showFormValidationErrors();
      }
    });
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
    policyAction: FinalExpensePolicyState,
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
        map((policyViolationComments) => policyViolationComments.length > 0),
      )
      .subscribe((policyViolated) => {
        if (policyViolated && this.fg.dirty) {
          this.trackingService.policyCorrection({ Violation: 'Regular', Mode: 'Edit Expense' });
        }
      });
  }

  trackEditExpense(etxn: Partial<UnflattenedTransaction>): void {
    this.trackingService.editExpense({
      Type: 'Receipt',
      Amount: etxn.tx.amount,
      Currency: etxn.tx.currency,
      Category: etxn.tx.org_category,
      Time_Spent: this.getTimeSpentOnPage() + ' secs',
      Used_Autofilled_Category:
        etxn.tx.category_id && this.presetCategoryId && etxn.tx.category_id === this.presetCategoryId,
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
    this.showSaveExpenseLoader(redirectedFrom);
    this.trackPolicyCorrections();
    const customFields$ = this.getCustomFields();

    return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
      switchMap((etxn) => {
        const policyViolations$ = this.checkPolicyViolation(
          etxn as unknown as { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] },
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
          map((policyViolations: ExpensePolicy): [ExpensePolicy, string[], FinalExpensePolicyState] => [
            policyViolations,
            this.policyService.getPolicyRules(policyViolations),
            policyViolations?.data?.final_desired_state,
          ]),
          switchMap(
            ([originalPolicyViolations, policyViolations, policyAction]: [
              ExpensePolicy,
              string[],
              FinalExpensePolicyState,
            ]) => {
              // Check if expense is unreportable and show critical policy violation
              if (policyAction?.unreportable && !etxn.tx.report_id) {
                const criticalPolicyRules = this.policyService.getCriticalPolicyRules(originalPolicyViolations);
                if (criticalPolicyRules.length > 0) {
                  return throwError({
                    type: 'criticalPolicyViolations',
                    policyViolations: criticalPolicyRules,
                    etxn,
                  });
                }
              }

              if (policyViolations.length > 0) {
                return throwError({
                  type: 'policyViolations',
                  policyViolations,
                  policyAction,
                  etxn,
                });
              } else {
                return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                  map((innerEtxn) => ({ etxn: innerEtxn, comment: null })),
                );
              }
            },
          ),
        );
      }),
      catchError(
        (err: {
          status?: number;
          type: string;
          policyViolations: string[];
          policyAction: FinalExpensePolicyState;
          etxn: Partial<UnflattenedTransaction>;
          error?: {
            message?: string;
          };
        }) => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
              map((innerEtxn) => ({ etxn: innerEtxn, comment: null })),
            );
          }
          if (err.status === 400) {
            if (err.error.message.includes('project')) {
              this.checkIfProjectIsDisabled();
            }
          }
          if (err.type === 'criticalPolicyViolations') {
            return this.criticalPolicyViolationErrorHandler(err, customFields$);
          } else if (err.type === 'policyViolations') {
            return this.policyViolationErrorHandler(err, customFields$);
          } else {
            return throwError(err);
          }
        },
      ),
      switchMap(({ etxn, comment }: { etxn: Partial<UnflattenedTransaction>; comment: string }) =>
        forkJoin({
          eou: from(this.authService.getEou()),
          txnCopy: this.etxn$,
        }).pipe(
          switchMap(({ txnCopy }: { txnCopy: Partial<UnflattenedTransaction> }) => {
            if (!isEqual(etxn.tx, txnCopy)) {
              // only if the form is edited
              this.trackEditExpense(etxn);
            } else {
              // tracking expense closed without editing
              this.trackingService.viewExpense({ Type: 'Receipt' });
            }

            const reportControl = this.fg.value as {
              report: Report;
            };

            return this.transactionService.upsert(etxn.tx as Transaction).pipe(
              catchError((err: Error) => {
                this.trackingService.editExpenseError({ label: err });
                return throwError(() => err);
              }),
              switchMap((tx) => {
                const selectedReportId = reportControl.report?.id;
                const criticalPolicyViolated = this.getIsPolicyExpense(etxn as unknown as Expense);
                if (!criticalPolicyViolated) {
                  if (!txnCopy.tx.report_id && selectedReportId) {
                    return this.platformReportService.addExpenses(selectedReportId, [tx.id]).pipe(
                      tap(() => this.trackingService.addToExistingReportAddEditExpense()),
                      map(() => tx),
                    );
                  }

                  if (txnCopy.tx.report_id && selectedReportId && txnCopy.tx.report_id !== selectedReportId) {
                    return this.platformReportService.ejectExpenses(txnCopy.tx.report_id, tx.id).pipe(
                      switchMap(() => this.platformReportService.addExpenses(selectedReportId, [tx.id])),
                      tap(() => this.trackingService.addToExistingReportAddEditExpense()),
                      map(() => tx),
                    );
                  }

                  if (txnCopy.tx.report_id && !selectedReportId) {
                    return this.platformReportService.ejectExpenses(txnCopy.tx.report_id, tx.id).pipe(
                      tap(() => this.trackingService.removeFromExistingReportEditExpense()),
                      map(() => tx),
                    );
                  }
                }
                return of(null).pipe(map(() => tx));
              }),
              switchMap((txn) => {
                if (comment) {
                  return this.expenseCommentService.findLatestExpenseComment(txn.id, txn.creator_id).pipe(
                    switchMap((result) => {
                      if (result !== comment) {
                        const commentsPayload = [
                          {
                            expense_id: txn.id,
                            comment,
                            notify: true,
                          },
                        ];
                        return this.expenseCommentService.post(commentsPayload).pipe(map(() => txn));
                      } else {
                        return of(txn);
                      }
                    }),
                  );
                } else {
                  return of(txn);
                }
              }),
            );
          }),
        ),
      ),
      switchMap((transaction) => {
        this.updateRecentlySplitExpenses(transaction);
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
              .unmatchCCCExpense(this.matchedCCCTransaction.id, transaction.id)
              .pipe(
                switchMap(() =>
                  this.transactionService
                    .matchCCCExpense(this.selectedCCCTransaction.id, transaction.id)
                    .pipe(map(() => transaction)),
                ),
              );
          }
        }

        // Case is for unmatching a matched expense
        if (
          !this.selectedCCCTransaction &&
          transaction.corporate_credit_card_expense_group_id &&
          this.matchedCCCTransaction
        ) {
          return this.transactionService
            .unmatchCCCExpense(this.matchedCCCTransaction.id, transaction.id)
            .pipe(map(() => transaction));
        }

        // Case is for matching a normal(unmatched) expense for the first time(edit)
        if (this.selectedCCCTransaction && !transaction.corporate_credit_card_expense_group_id) {
          return this.transactionService
            .matchCCCExpense(this.selectedCCCTransaction.id, transaction.id)
            .pipe(map(() => transaction));
        }

        return of(transaction);
      }),
      finalize(() => {
        this.hideSaveExpenseLoader();
        this.triggerNpsSurvey();
      }),
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
          etxn.tx.category_id && this.presetCategoryId && etxn.tx.category_id === this.presetCategoryId,
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
    customFields$: Observable<TxnCustomProperties[]>,
  ): Observable<{ etxn: Partial<UnflattenedTransaction> }> {
    return from(this.loaderService.hideLoader()).pipe(
      switchMap(() => this.continueWithCriticalPolicyViolation(err.policyViolations)),
      switchMap((continueWithTransaction) => {
        if (continueWithTransaction) {
          return from(this.loaderService.showLoader()).pipe(
            switchMap(() =>
              this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                map((innerEtxn) => ({ etxn: innerEtxn, comment: null })),
              ),
            ),
          );
        } else {
          return throwError('unhandledError');
        }
      }),
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
    customFields$: Observable<TxnCustomProperties[]>,
  ): Observable<{ etxn: Partial<UnflattenedTransaction>; comment: string }> {
    return from(this.loaderService.hideLoader()).pipe(
      switchMap(() => this.continueWithPolicyViolations(err.policyViolations, err.policyAction)),
      switchMap((continueWithTransaction: { comment: string }) => {
        if (continueWithTransaction) {
          if (continueWithTransaction.comment === '' || continueWithTransaction.comment === null) {
            continueWithTransaction.comment = 'No policy violation explanation provided';
          }
          return from(this.loaderService.showLoader()).pipe(
            switchMap(() =>
              this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                map((innerEtxn) => ({ etxn: innerEtxn, comment: continueWithTransaction.comment })),
              ),
            ),
          );
        } else {
          return throwError('unhandledError');
        }
      }),
    );
  }

  trackCreateExpense(etxn: Partial<UnflattenedTransaction>, isInstaFyleExpense: boolean): void {
    this.trackingService.createExpense({
      Type: 'Receipt',
      Amount: etxn.tx.amount,
      Currency: etxn.tx.currency,
      Category: etxn.tx.org_category,
      Time_Spent: this.getTimeSpentOnPage() + ' secs',
      Used_Autofilled_Category:
        etxn.tx.category_id && this.presetCategoryId && etxn.tx.category_id === this.presetCategoryId,
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

  checkIfProjectIsDisabled(): void {
    if (this.fg && this.fg.get('project')) {
      this.selectedDisabledProject.set(this.fg.get('project').value as ProjectV2);
      this.isSelectedProjectDisabled.set(true);

      // Just clear the cache
      this.recentLocalStorageItemsService.clear('expenseProjectCache');

      // Clear recentProjects array
      this.recentProjects = [];

      // subscribe to the changes of the project control
      this.fg.get('project').valueChanges.subscribe((value) => {
        // if the project selected is not equal to the selectedDisabledProject, then make the isSelectedProjectDisabled to false or else make it true
        if (value !== this.selectedDisabledProject()) {
          this.isSelectedProjectDisabled.set(false);
        } else {
          this.isSelectedProjectDisabled.set(true);
        }
      });

      this.fg.get('project').markAsTouched();
      this.fg.get('project').markAsDirty();
    }
  }

  addExpense(redirectedFrom: string): Observable<OutboxQueue | Promise<OutboxQueue>> {
    this.showSaveExpenseLoader(redirectedFrom);

    const customFields$ = this.getCustomFields();

    this.trackAddExpense();
    return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
      switchMap((etxn) =>
        this.isConnected$.pipe(
          take(1),
          switchMap((isConnected) => {
            if (isConnected) {
              const policyViolations$ = this.checkPolicyViolation(
                etxn as unknown as { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] },
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
                map((policyViolations: ExpensePolicy): [ExpensePolicy, string[], FinalExpensePolicyState] => [
                  policyViolations,
                  this.policyService.getPolicyRules(policyViolations),
                  policyViolations?.data?.final_desired_state,
                ]),
                switchMap(
                  ([originalPolicyViolations, policyViolations, policyAction]: [
                    ExpensePolicy,
                    string[],
                    FinalExpensePolicyState,
                  ]) => {
                    // Check if expense is unreportable and show critical policy violation
                    if (policyAction?.unreportable && !etxn.tx.report_id) {
                      const criticalPolicyRules = this.policyService.getCriticalPolicyRules(originalPolicyViolations);
                      if (criticalPolicyRules.length > 0) {
                        return throwError({
                          type: 'criticalPolicyViolations',
                          policyViolations: criticalPolicyRules,
                          etxn,
                        });
                      }
                    }

                    if (policyViolations.length > 0) {
                      return throwError({
                        type: 'policyViolations',
                        policyViolations,
                        policyAction,
                        etxn,
                      });
                    } else {
                      return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                        map((innerEtxn) => ({ etxn: innerEtxn, comment: null })),
                      );
                    }
                  },
                ),
              );
            } else {
              return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                map((innerEtxn) => ({ etxn: innerEtxn, comment: null })),
              );
            }
          }),
        ),
      ),

      catchError(
        (err: {
          status?: number;
          type?: string;
          policyViolations?: string[];
          policyAction?: FinalExpensePolicyState;
          etxn?: Partial<UnflattenedTransaction>;
          error?: {
            message?: string;
          };
        }) => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(map((etxn) => ({ etxn })));
          }

          if (err.status === 400) {
            if (err.error.message.includes('project')) {
              this.checkIfProjectIsDisabled();
            }
          }

          if (err.type === 'criticalPolicyViolations') {
            return this.criticalPolicyViolationErrorHandler(err, customFields$);
          } else if (err.type === 'policyViolations') {
            return this.policyViolationErrorHandler(err, customFields$);
          } else {
            return throwError(err);
          }
        },
      ),
      switchMap(({ etxn, comment }: { etxn: Partial<UnflattenedTransaction>; comment: string }) =>
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

            const formValues = this.getFormValues();
            if (
              formValues.report &&
              (etxn.tx.policy_amount === null || (etxn.tx.policy_amount && !(etxn.tx.policy_amount < 0.0001)))
            ) {
              etxn.tx.report_id = formValues.report.id;
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
                ),
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
                      ),
                    );
                  } else {
                    this.transactionOutboxService
                      .addEntry(etxn.tx, etxn.dataUrls as { url: string; type: string }[], comments)
                      .then(noop);

                    return of(null);
                  }
                }),
              );
            }
          }),
        ),
      ),
      finalize(() => {
        this.hideSaveExpenseLoader();
        this.triggerNpsSurvey();
      }),
    );
  }

  async getParsedReceipt(base64Image: string, fileType: string): Promise<ParsedReceipt> {
    await this.loaderService.showLoader(
      'Scanning information from the receipt...',
      15000,
      'assets/images/scanning.gif',
    );

    const scanStartTime = Date.now();
    const parsedData: ParsedReceipt = await this.transactionOutboxService.parseReceipt(base64Image, fileType);
    const scanEndTime = Date.now();
    const scanDuration = (scanEndTime - scanStartTime) / 1000; // in seconds
    this.trackingService.receiptScanTime({ duration: scanDuration, fileType });

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
          parsedData.data.date ? new Date(parsedData.data.date) : new Date(),
        )
        .toPromise();
    }

    await this.loaderService.hideLoader();
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

    const instaFyleEnabled$ = this.employeeSettings$.pipe(
      map(
        (employeeSettings) =>
          employeeSettings.insta_fyle_settings?.allowed && employeeSettings.insta_fyle_settings?.enabled,
      ),
    );

    return instaFyleEnabled$
      .pipe(
        filter((instafyleEnabled) => instafyleEnabled),
        switchMap(() =>
          forkJoin({
            imageData: from(this.getParsedReceipt(base64Image, fileType as string)),
            filteredCategories: this.filteredCategories$.pipe(take(1)),
            homeCurrency: this.currencyService.getHomeCurrency(),
          }),
        ),
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
          if (this.inpageExtractedData) {
            this.autoCodedData = this.inpageExtractedData;
          }
        } else {
          this.inpageExtractedData = mergeWith(
            {},
            this.inpageExtractedData,
            imageData.data,
            (currentValue, newValue) => (isNull(currentValue) ? newValue : currentValue) as ParsedResponse,
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
          const vendor = this.filterVendor(extractedData.vendor);

          this.fg.patchValue({
            vendor_id: { display_name: vendor },
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
            (orgCategory: { value: { fyle_category: string } }) => orgCategory.value.fyle_category === categoryName,
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
              },
            );
          }
        });
      } else {
        this.platformExpense$ = this.etxn$.pipe(
          switchMap((etxn) => this.expensesService.getExpenseById(etxn.tx.id).pipe(shareReplay(1))),
        );

        const editExpenseAttachments$ = this.platformExpense$.pipe(
          map((expense: PlatformExpense) => expense.file_ids?.length || 0),
        );

        this.attachmentUploadInProgress = true;
        let attachmentType = 'image';

        if (data.type === 'application/pdf' || data.type === 'pdf') {
          attachmentType = 'pdf';
        }
        from(this.transactionOutboxService.fileUpload(data.dataUrl as string, attachmentType))
          .pipe(
            switchMap((fileObj: FileObject) => {
              const expenseId = this.activatedRoute.snapshot.params.id as string;
              this.trackingService.fileUploadComplete({
                mode: 'edit',
                'File ID': fileObj?.id,
                'Txn ID': fileObj?.transaction_id,
              });
              return this.expensesService.attachReceiptToExpense(expenseId, fileObj.id);
            }),
            switchMap((expenseObj: PlatformExpense) =>
              editExpenseAttachments$.pipe(
                withLatestFrom(this.isConnected$),
                map(([attachments, isConnected]) => ({
                  attachments,
                  isConnected,
                  expenseObj,
                })),
              ),
            ),
            finalize(() => {
              this.loadAttachments$.next();
              this.attachmentUploadInProgress = false;
            }),
          )
          .subscribe(({ attachments, isConnected, expenseObj }) => {
            this.attachedReceiptsCount = attachments;

            // checking if extraction is needed or not
            const isDataExtractionNeeded = !(
              expenseObj?.amount !== null &&
              expenseObj.currency &&
              expenseObj.spent_at &&
              expenseObj.category_id &&
              expenseObj.category.name !== 'Unspecified' &&
              expenseObj.merchant
            );

            if (isConnected && this.attachedReceiptsCount === 1 && isDataExtractionNeeded) {
              this.parseFile(
                fileInfo as {
                  type: string;
                  url: string;
                  thumbnail: string;
                },
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
        const fileRead$ = from(this.fileService.readFile(file));
        const delayedLoader$ = timer(300).pipe(
          switchMap(() => from(this.loaderService.showLoader('Please wait...', 5000))),
          switchMap(() => fileRead$), // switch to fileRead$ after showing loader
        );
        // Use race to show loader only if fileRead$ takes more than 300ms.
        fileRead$
          .pipe(
            raceWith(delayedLoader$),
            map((dataUrl) => {
              fileData = {
                type: file.type,
                dataUrl,
                actionSource: 'gallery_upload',
              };
              this.attachReceipts(fileData);
              this.trackingService.addAttachment({ type: file.type });
            }),
            finalize(() => this.loaderService.hideLoader()),
          )
          .subscribe();
      } else {
        this.showSizeLimitExceededPopover(MAX_FILE_SIZE);
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
        componentProps: {
          mode: this.mode,
        },
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
        const message = this.translocoService.translate('addEditExpense.receiptAddedToExpense');
        this.showSnackBarToast({ message }, 'success', ['msb-success-with-camera-icon']);
        this.showReceiptMandatoryError = false;

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
    const attachements$ = this.getExpenseAttachments(this.mode);

    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => attachements$),
        finalize(() => {
          this.loaderService.hideLoader();
        }),
      )
      .subscribe(async (attachments) => {
        // Get the current expense object before opening the modal
        this.etxn$.pipe(take(1)).subscribe(async (etxn) => {
          const expenseId = etxn.tx?.id;
          const attachmentsModal = await this.modalController.create({
            component: FyViewAttachmentComponent,
            componentProps: {
              attachments,
              canEdit: true,
              expenseId,
            },
            mode: 'ios',
          });

          await attachmentsModal.present();

          const { data } = (await attachmentsModal.onWillDismiss()) as {
            data: {
              attachments: FileObject[];
              action?: string;
              event?: Event;
            };
          };

          // Refresh the platform expense to get latest data
          this.platformExpense$ = this.etxn$.pipe(
            switchMap((etxn) => this.expensesService.getExpenseById(etxn.tx.id).pipe(shareReplay(1))),
          );

          if (data && data.action === 'addMoreAttachments') {
            this.addAttachments(data.event);
          } else if (this.mode === 'add') {
            if (data && data.attachments) {
              this.newExpenseDataUrls = data.attachments;
              this.attachedReceiptsCount = data.attachments.length;
            }
          } else {
            // Always trigger a refresh of attachments when modal is dismissed
            this.loadAttachments$.next();

            // Update the count if attachments were modified
            if (data && data.attachments) {
              this.attachedReceiptsCount = data.attachments.length;
            }
          }
        });
      });
  }

  getDeleteReportParams(
    config: { header: string; body: string; ctaText: string; ctaLoadingText: string },
    removeExpenseFromReport = false,
    reportId?: string,
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
            return this.platformReportService.ejectExpenses(reportId, this.activatedRoute.snapshot.params.id as string);
          }
          return this.expensesService.deleteExpenses([this.activatedRoute.snapshot.params.id as string]);
        },
      },
    };
  }

  async deleteExpense(reportId?: string): Promise<void> {
    const removeExpenseFromReport = reportId && this.isRedirectedFromReport;
    const header = removeExpenseFromReport
      ? this.translocoService.translate('addEditExpense.removeExpense')
      : this.translocoService.translate('addEditExpense.deleteExpense');
    const body = removeExpenseFromReport
      ? this.translocoService.translate('addEditExpense.removeExpenseFromReportMessage')
      : this.translocoService.translate('addEditExpense.deleteExpenseMessage');
    const ctaText = removeExpenseFromReport
      ? this.translocoService.translate('addEditExpense.remove')
      : this.translocoService.translate('addEditExpense.delete');
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
        reportId,
      ),
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
        this.expensesService.getExpenseById(this.reviewList[+this.activeIndex]).subscribe((expense) => {
          const etxn = this.transactionService.transformExpense(expense);
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
    return this.generateEtxnFromFg(this.etxn$, customFields$)
      .pipe(
        switchMap((etxn) =>
          this.isConnected$.pipe(
            take(1),
            switchMap((isConnected) => {
              if (isConnected) {
                const policyViolations$ = this.checkPolicyViolation(
                  etxn as unknown as { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] },
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
                  map((policyViolations: ExpensePolicy): [ExpensePolicy, string[], FinalExpensePolicyState] => [
                    policyViolations,
                    this.policyService.getPolicyRules(policyViolations),
                    policyViolations?.data?.final_desired_state,
                  ]),
                  switchMap(
                    ([originalPolicyViolations, policyViolations, policyAction]: [
                      ExpensePolicy,
                      string[],
                      FinalExpensePolicyState,
                    ]) => {
                      // Check if expense is unreportable and show critical policy violation
                      if (policyAction?.unreportable && !etxn.tx.report_id) {
                        const criticalPolicyRules = this.policyService.getCriticalPolicyRules(originalPolicyViolations);
                        if (criticalPolicyRules.length > 0) {
                          return throwError({
                            type: 'criticalPolicyViolations',
                            policyViolations: criticalPolicyRules,
                            etxn,
                          });
                        }
                      }

                      if (policyViolations.length > 0) {
                        return throwError({
                          type: 'policyViolations',
                          policyViolations,
                          policyAction,
                          etxn,
                        });
                      } else {
                        return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                          map((innerEtxn) => ({ etxn: innerEtxn, comment: null })),
                        );
                      }
                    },
                  ),
                );
              } else {
                return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
                  map((innerEtxn) => ({ etxn: innerEtxn, comment: null })),
                );
              }
            }),
          ),
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
          },
        ),
        switchMap(({ etxn }: { etxn: Partial<UnflattenedTransaction> }) => {
          const personalCardTxn =
            this.activatedRoute.snapshot.params.personalCardTxn &&
            (JSON.parse(this.activatedRoute.snapshot.params.personalCardTxn as string) as PlatformPersonalCardTxn);
          const externalExpenseId = personalCardTxn.id;
          return this.transactionService.upsert(etxn.tx as Transaction).pipe(
            switchMap((txn) =>
              this.personalCardsService
                .matchExpense(txn.split_group_id, externalExpenseId)
                .pipe(switchMap(() => this.uploadAttachments(txn.split_group_id))),
            ),
            finalize(() => {
              this.saveExpenseLoader = false;
            }),
          );
        }),
      )
      .subscribe(() => {
        this.showSnackBarToast({ message: 'Expense created successfully.' }, 'success', ['msb-success']);
        this.router.navigate(['/', 'enterprise', 'personal_cards'], { queryParams: { refresh: true } });
        this.trackingService.newExpenseCreatedFromPersonalCard();
      });
  }

  uploadAttachments(txnId: string): Observable<FileObject[] | unknown> {
    if (this.newExpenseDataUrls.length > 0) {
      this.newExpenseDataUrls = this.addFileType(this.newExpenseDataUrls as FileObject[]);
      const addExpenseAttachments$ = of(this.newExpenseDataUrls);
      return addExpenseAttachments$.pipe(
        switchMap((fileObjs: FileObject[]) => this.uploadMultipleFiles(fileObjs, txnId)),
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
    return forkJoin(fileObjs.map((file) => this.uploadFileAndAttachToExpense(file, txnId)));
  }

  uploadFileAndAttachToExpense(file: FileObject, txnId: string): Observable<FileObject[] | unknown> {
    return from(this.transactionOutboxService.fileUpload(file.url, file.type)).pipe(
      switchMap((fileObj: FileObject) => this.expensesService.attachReceiptToExpense(txnId, fileObj.id)),
    );
  }

  getDuplicateExpenses(): void {
    const expenseId = this.activatedRoute.snapshot.params.id as string;

    if (!expenseId) {
      return;
    }

    this.expensesService
      .getDuplicatesByExpense(expenseId)
      .pipe(
        map((platformDuplicateSets) =>
          platformDuplicateSets.map((duplicateSet) => ({ transaction_ids: duplicateSet.expense_ids })),
        ),
        switchMap((transformedDuplicateSets) => {
          const duplicateIds = transformedDuplicateSets
            .map((value) => value.transaction_ids)
            .reduce((acc, curVal) => acc.concat(curVal), []);

          if (duplicateIds.length > 0) {
            const queryParams = {
              id: `in.(${duplicateIds.join(',')})`,
            };
            return this.expensesService.getAllExpenses({ offset: 0, limit: 100, queryParams }).pipe(
              map((expenses) => {
                const expensesArray = expenses.map((expense) =>
                  this.transactionService.transformRawExpense(expense),
                ) as [];
                return transformedDuplicateSets.map((duplicateSet) =>
                  this.addExpenseDetailsToDuplicateSets(duplicateSet, expensesArray),
                );
              }),
            );
          } else {
            return of([]);
          }
        }),
        catchError(() => EMPTY), // Return an empty observable in case of an error
      )
      .subscribe((duplicateExpensesSet) => {
        this.duplicateExpenses = duplicateExpensesSet[0] as Expense[];
      });
  }

  addExpenseDetailsToDuplicateSets(duplicateSet: DuplicateSet, expensesArray: Partial<Expense>[]): Partial<Expense>[] {
    return duplicateSet.transaction_ids.map(
      (expenseId) =>
        expensesArray[expensesArray.findIndex((duplicateTxn: Expense) => expenseId === duplicateTxn.tx_id)],
    );
  }

  async showSuggestedDuplicates(duplicateExpenses: Expense[]): Promise<void> {
    this.trackingService.showSuggestedDuplicates();

    const txnIDs = duplicateExpenses.map((expense) => expense?.tx_id);

    const isAnyIdUndefined = txnIDs.some((id) => !id);

    if (isAnyIdUndefined) {
      this.showSnackBarToast({ message: 'Something went wrong. Please try after some time.' }, 'failure', [
        'msb-failure',
      ]);
      this.trackingService.eventTrack('Showing duplicate expenses failed', txnIDs);
      return;
    }

    const currencyModal = await this.modalController.create({
      component: SuggestedDuplicatesComponent,
      componentProps: {
        duplicateExpenseIDs: txnIDs,
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
    panelClass: string[],
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

  async showSizeLimitExceededPopover(maxFileSize: number): Promise<void> {
    const sizeLimitExceededPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: this.translocoService.translate<string>('addEditExpense.sizeLimitExceeded'),
        message: this.translocoService.translate<string>('addEditExpense.sizeLimitExceededMessage', {
          maxFileSize: (maxFileSize / (1024 * 1024)).toFixed(0),
        }),
        primaryCta: {
          text: this.translocoService.translate<string>('addEditExpense.ok'),
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await sizeLimitExceededPopover.present();
  }

  async openTransactionStatusInfoModal(transactionStatus: ExpenseTransactionStatus): Promise<void> {
    const popover = await this.popoverController.create({
      component: TransactionStatusInfoPopoverComponent,
      componentProps: {
        transactionStatus,
      },
      cssClass: 'fy-dialog-popover',
    });

    await popover.present();
  }

  async openCCExpenseMerchantInfoModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: CCExpenseMerchantInfoModalComponent,
      ...this.modalProperties.getModalDefaultProperties('merchant-info'),
    });

    await modal.present();
  }

  private filterVendor(vendor: string): string | null {
    if (!vendor || this.vendorOptions?.length === 0) {
      return vendor;
    }
    return this.vendorOptions?.find((option) => option.toLowerCase() === vendor.toLowerCase()) || null;
  }

  private updateRecentlySplitExpenses(updatedExpense: Partial<Transaction>): void {
    if (!this.activatedRoute.snapshot.params.fromSplitExpenseReview) {
      return;
    }

    const currentData = this.expensesService.splitExpensesData$.getValue();
    if (currentData && currentData?.expenses) {
      const updatedExpenses = currentData.expenses.map((expense) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (expense.id === updatedExpense.id) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const updatedExpenseObj = { ...expense, ...updatedExpense };
          if (updatedExpense.categoryDisplayName) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (!updatedExpenseObj.category) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              updatedExpenseObj.category = { name: updatedExpense.categoryDisplayName };
            } else {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              updatedExpenseObj.category = {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                ...updatedExpenseObj.category,
                name: updatedExpense.categoryDisplayName,
              };
            }
          }
          if (updatedExpense.vendor !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            updatedExpenseObj.merchant = updatedExpense.vendor;
          }
          if (updatedExpense.policy_flag !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            updatedExpenseObj.is_policy_flagged = updatedExpense.policy_flag;
          }
          if (updatedExpense.skip_reimbursement !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            updatedExpenseObj.is_reimbursable = !updatedExpense.skip_reimbursement;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return updatedExpenseObj;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return expense;
        }
      });
      this.expensesService.splitExpensesData$.next({
        ...currentData,
        expenses: updatedExpenses,
      });
    }
  }
}
