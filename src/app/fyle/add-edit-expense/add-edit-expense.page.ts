// TODO: Very hard to fix this file without making massive changes
/* eslint-disable complexity */
import { Component, ElementRef, EventEmitter, HostListener, OnInit, ViewChild } from '@angular/core';
import {
  combineLatest,
  concat,
  EMPTY,
  forkJoin,
  from,
  iif,
  merge,
  Observable,
  of,
  BehaviorSubject,
  throwError,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  reduce,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
  timeout,
  withLatestFrom,
} from 'rxjs/operators';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { DateService } from 'src/app/core/services/date.service';
import * as moment from 'moment';
import { ReportService } from 'src/app/core/services/report.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { cloneDeep, isEqual, isNull, isNumber, mergeWith } from 'lodash';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { DataTransformService } from 'src/app/core/services/data-transform.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DuplicateDetectionService } from 'src/app/core/services/duplicate-detection.service';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { FyCriticalPolicyViolationComponent } from 'src/app/shared/components/fy-critical-policy-violation/fy-critical-policy-violation.component';
import { PolicyViolationComponent } from './policy-violation/policy-violation.component';
import { StatusService } from 'src/app/core/services/status.service';
import { FileService } from 'src/app/core/services/file.service';
import { CameraOptionsPopupComponent } from './camera-options-popup/camera-options-popup.component';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { CorporateCreditCardExpenseSuggestionsService } from '../../core/services/corporate-credit-card-expense-suggestions.service';
import { CorporateCreditCardExpenseService } from '../../core/services/corporate-credit-card-expense.service';
import { MatchTransactionComponent } from './match-transaction/match-transaction.component';
import { TrackingService } from '../../core/services/tracking.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { TokenService } from 'src/app/core/services/token.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { RecentlyUsed } from 'src/app/core/models/v1/recently_used.model';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { OrgCategory, OrgCategoryListItem } from 'src/app/core/models/v1/org-category.model';
import { ExtendedProject } from 'src/app/core/models/v2/extended-project.model';
import { CostCenter } from 'src/app/core/models/v1/cost-center.model';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { Currency } from 'src/app/core/models/currency.model';
import { DomSanitizer } from '@angular/platform-browser';
import { FileObject } from 'src/app/core/models/file_obj.model';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';
import { TaxGroupService } from 'src/app/core/services/tax_group.service';
import { TaxGroup } from 'src/app/core/models/tax_group.model';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { SuggestedDuplicatesComponent } from './suggested-duplicates/suggested-duplicates.component';
import { DuplicateSet } from 'src/app/core/models/v2/duplicate-sets.model';
import { Expense } from 'src/app/core/models/expense.model';

@Component({
  selector: 'app-add-edit-expense',
  templateUrl: './add-edit-expense.page.html',
  styleUrls: ['./add-edit-expense.page.scss'],
})
export class AddEditExpensePage implements OnInit {
  @ViewChild('duplicateInputContainer') duplicateInputContainer: ElementRef;

  @ViewChild('formContainer') formContainer: ElementRef;

  @ViewChild('comments') commentsContainer: ElementRef;

  @ViewChild('fileUpload', { static: false }) fileUpload: any;

  etxn$: Observable<any>;

  paymentModes$: Observable<any[]>;

  recentlyUsedValues$: Observable<RecentlyUsed>;

  isCreatedFromCCC = false;

  isCreatedFromPersonalCard = false;

  paymentAccount$: Observable<any>;

  isCCCAccountSelected$: Observable<boolean>;

  homeCurrency$: Observable<string>;

  mode: string;

  title: string;

  activeIndex: number;

  reviewList: string[];

  fg: FormGroup;

  filteredCategories$: Observable<any[]>;

  minDate: string;

  maxDate: string;

  txnFields$: Observable<any>;

  taxSettings$: Observable<any>;

  reports$: Observable<any>;

  isProjectsEnabled$: Observable<boolean>;

  isCostCentersEnabled$: Observable<boolean>;

  flightJourneyTravelClassOptions$: Observable<any>;

  customInputs$: Observable<any>;

  isBalanceAvailableInAnyAdvanceAccount$: Observable<boolean>;

  selectedCCCTransaction;

  canChangeMatchingCCCTransaction = true;

  transactionInReport$: Observable<boolean>;

  isCriticalPolicyViolated = false;

  showSelectedTransaction = false;

  isIndividualProjectsEnabled$: Observable<boolean>;

  individualProjectIds$: Observable<[]>;

  isNotReimbursable$: Observable<boolean>;

  costCenters$: Observable<any[]>;

  receiptsData: any;

  duplicates$: Observable<any>;

  duplicateBoxOpen = false;

  isAmountCapped$: Observable<boolean>;

  isAmountDisabled$: Observable<boolean>;

  isCriticalPolicyViolated$: Observable<boolean>;

  isSplitExpenseAllowed$: Observable<boolean>;

  attachmentUploadInProgress = false;

  attachedReceiptsCount = 0;

  instaFyleCancelled = false;

  newExpenseDataUrls = [];

  loadAttachments$ = new BehaviorSubject<void>(null);

  attachments$: Observable<FileObject[]>;

  focusState = false;

  isConnected$: Observable<boolean>;

  invalidPaymentMode = false;

  pointToDuplicates = false;

  isAdvancesEnabled$: Observable<boolean>;

  comments$: Observable<any>;

  isCCCPaymentModeSelected$: Observable<boolean>;

  isLoadingSuggestions = false;

  matchingCCCTransactions = [];

  matchedCCCTransaction;

  alreadyApprovedExpenses;

  isSplitExpensesPresent: boolean;

  showCardTransaction = true;

  canEditCCCMatchedSplitExpense: boolean;

  cardEndingDigits: string;

  selectedCCCTransactionInSuggestions: boolean;

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

  duplicateDetectionReasons = [];

  tfcDefaultValues$: Observable<any>;

  expenseStartTime;

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

  presetProjectId: number;

  recentlyUsedProjects$: Observable<ExtendedProject[]>;

  recentlyUsedCurrencies$: Observable<Currency[]>;

  recentCostCenters: { label: string; value: CostCenter; selected?: boolean }[];

  presetCostCenterId: number;

  recentlyUsedCostCenters$: Observable<{ label: string; value: CostCenter; selected?: boolean }[]>;

  presetCurrency: string;

  initialFetch;

  inpageExtractedData;

  actionSheetButtons = [];

  isExpandedView = false;

  billableDefaultValue: boolean;

  taxGroups$: Observable<TaxGroup[]>;

  taxGroupsOptions$: Observable<{ label: string; value: any }[]>;

  isRedirectedFromReport = false;

  canRemoveFromReport = false;

  isUnifyCcceExpensesSettingsEnabled: boolean;

  isCccExpense: boolean;

  cardNumber: string;

  policyDetails;

  source = 'MOBILE';

  isCameraShown = false;

  isIos = false;

  duplicateExpenses: Expense[];

  isExpenseMatchedForDebitCCCE: boolean;

  canDismissCCCE: boolean;

  corporateCreditCardExpenseGroupId: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private accountsService: AccountsService,
    private offlineService: OfflineService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private dateService: DateService,
    private projectService: ProjectsService,
    private reportService: ReportService,
    private customInputsService: CustomInputsService,
    private customFieldsService: CustomFieldsService,
    private transactionService: TransactionService,
    private dataTransformService: DataTransformService,
    private policyService: PolicyService,
    private transactionOutboxService: TransactionsOutboxService,
    private router: Router,
    private duplicateDetectionService: DuplicateDetectionService,
    private loaderService: LoaderService,
    private modalController: ModalController,
    private statusService: StatusService,
    private fileService: FileService,
    private popoverController: PopoverController,
    private currencyService: CurrencyService,
    private networkService: NetworkService,
    private popupService: PopupService,
    private navController: NavController,
    private corporateCreditCardExpenseSuggestionService: CorporateCreditCardExpenseSuggestionsService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private trackingService: TrackingService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService,
    private recentlyUsedItemsService: RecentlyUsedItemsService,
    private tokenService: TokenService,
    private expenseFieldsService: ExpenseFieldsService,
    private modalProperties: ModalPropertiesService,
    private actionSheetController: ActionSheetController,
    private taxGroupsService: TaxGroupService,
    private sanitizer: DomSanitizer,
    private personalCardsService: PersonalCardsService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    public platform: Platform,
    private titleCasePipe: TitleCasePipe,
    private handleDuplicates: HandleDuplicatesService
  ) {}

  @HostListener('keydown')
  scrollInputIntoView() {
    const el = document.activeElement;
    if (el && el instanceof HTMLInputElement) {
      el.scrollIntoView({
        block: 'center',
      });
    }
  }

  goBack() {
    const bankTxn =
      this.activatedRoute.snapshot.params.bankTxn && JSON.parse(this.activatedRoute.snapshot.params.bankTxn);
    if (this.activatedRoute.snapshot.params.persist_filters) {
      this.navController.back();
    } else {
      if (bankTxn) {
        this.router.navigate(['/', 'enterprise', 'corporate_card_expenses']);
      } else {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    }
  }

  async showClosePopup() {
    const isAutofilled =
      this.presetCategoryId || this.presetProjectId || this.presetCostCenterId || this.presetCurrency;
    if (this.fg.touched || this.activatedRoute.snapshot.params.dataUrl || isAutofilled) {
      const unsavedChangesPopOver = await this.popoverController.create({
        component: PopupAlertComponentComponent,
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

      const { data } = await unsavedChangesPopOver.onWillDismiss();

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

  merchantValidator(c: FormControl): ValidationErrors {
    if (c.value && c.value.display_name) {
      return c.value.display_name.length > 250 ? { merchantNameSize: 'Length is greater than 250' } : null;
    }
    return null;
  }

  currencyObjValidator(c: FormControl): ValidationErrors {
    if (c.value && ((c.value.amount && c.value.currency) || (c.value.orig_amount && c.value.orig_currency))) {
      return null;
    }
    return {
      required: false,
    };
  }

  setUpTaxCalculations() {
    combineLatest(this.fg.controls.currencyObj.valueChanges, this.fg.controls.tax_group.valueChanges).subscribe(() => {
      if (
        this.fg.controls.tax_group.value &&
        this.fg.controls.tax_group.value.percentage &&
        this.fg.controls.currencyObj.value
      ) {
        this.fg.controls.tax_amount.setValue(
          (
            this.fg.controls.currencyObj.value.amount -
            this.fg.controls.currencyObj.value.amount / (this.fg.controls.tax_group.value.percentage + 1)
          ).toFixed(2)
        );
      } else {
        this.fg.controls.tax_amount.setValue(null);
      }
    });
  }

  canGetDuplicates() {
    return this.offlineService.getOrgSettings().pipe(
      map((orgSettings) => {
        const isAmountCurrencyTxnDtPresent =
          isNumber(this.fg.value.currencyObj && this.fg.value.currencyObj.amount) &&
          !!this.fg.value.dateOfSpend &&
          !!(this.fg.value.currencyObj && this.fg.value.currencyObj.currency);
        return this.fg.valid && orgSettings.policies.duplicate_detection_enabled && isAmountCurrencyTxnDtPresent;
      })
    );
  }

  checkForDuplicates() {
    return this.canGetDuplicates().pipe(
      switchMap((canGetDuplicates) => {
        const customFields$ = this.getCustomFields();
        return iif(
          () => canGetDuplicates,
          this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
            switchMap((etxn) => this.duplicateDetectionService.getPossibleDuplicates(etxn.tx))
          ),
          of(null)
        );
      })
    );
  }

  getDuplicates() {
    return this.etxn$.pipe(switchMap((etxn) => this.duplicateDetectionService.getDuplicates(etxn.tx.id)));
  }

  checkIfInvalidPaymentMode() {
    return this.etxn$.pipe(
      map((etxn) => {
        const paymentAccount = this.fg.value.paymentMode;
        const originalSourceAccountId = etxn && etxn.tx && etxn.tx.source_account_id;
        let isPaymentModeInvalid = false;
        if (paymentAccount && paymentAccount.acc && paymentAccount.acc.type === 'PERSONAL_ADVANCE_ACCOUNT') {
          if (paymentAccount.acc.id !== originalSourceAccountId) {
            isPaymentModeInvalid =
              paymentAccount.acc.tentative_balance_amount <
              (this.fg.value.currencyObj && this.fg.value.currencyObj.amount);
          } else {
            isPaymentModeInvalid =
              paymentAccount.acc.tentative_balance_amount + etxn.tx.amount <
              (this.fg.value.currencyObj && this.fg.value.currencyObj.amount);
          }
        }
        return isPaymentModeInvalid;
      })
    );
  }

  async unmatchExpense(etxn) {
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

  async openMatchingTransactions() {
    this.isChangeCCCSuggestionClicked = true;
    this.isCCCTransactionAutoSelected = false;
    this.etxn$.subscribe(async (etxn) => {
      const modalProperties = {
        cssClass: 'auto-height',
        showBackdrop: true,
        swipeToClose: true,
        backdropDismiss: true,
        animated: true,
      };

      const matchExpensesModal = await this.modalController.create({
        component: MatchTransactionComponent,
        componentProps: {
          matchingCCCTransactions: this.matchingCCCTransactions,
          mode: this.mode,
          selectedCCCTransaction: this.selectedCCCTransaction,
        },
        mode: 'ios',
        presentingElement: await this.modalController.getTop(),
        ...modalProperties,
      });

      await matchExpensesModal.present();

      const { data } = await matchExpensesModal.onWillDismiss();

      if (data) {
        if (data.unMatchedExpense) {
          await this.unmatchExpense(etxn);
        } else {
          this.isDraftExpense = false;
          this.selectedCCCTransaction = data.selectedCCCExpense;
          // corporate_credit_card_account_number will not be available in the new suggestions endpoint as it is not required
          if (this.selectedCCCTransaction && this.selectedCCCTransaction.corporate_credit_card_account_number) {
            this.cardEndingDigits = (
              this.selectedCCCTransaction.corporate_credit_card_account_number
                ? this.selectedCCCTransaction.corporate_credit_card_account_number
                : this.selectedCCCTransaction.card_or_account_number
            ).slice(-4);
          }

          this.canChangeMatchingCCCTransaction = true;

          if (
            !etxn.tx.corporate_credit_card_expense_group_id ||
            this.selectedCCCTransaction.id !== etxn.tx.corporate_credit_card_expense_group_id
          ) {
            this.showSelectedTransaction = true;
          } else if (this.selectedCCCTransaction.id === etxn.tx.corporate_credit_card_expense_group_id) {
            this.showSelectedTransaction = false;
            await this.popupService.showPopup({
              header: 'Already matched!',
              message: 'The expense is already matched to this card transaction',
              primaryCta: {
                text: 'Close',
              },
            });
          }
        }
      }
    });
  }

  setupExpenseSuggestions() {
    const that = this;
    that.isCCCPaymentModeSelected$
      .pipe(
        switchMap((isCCCPaymentModeSelected) => {
          if (isCCCPaymentModeSelected) {
            return merge(that.fg.controls.currencyObj.valueChanges, that.fg.controls.dateOfSpend.valueChanges).pipe(
              map(() => ({
                currencyObj: that.fg.controls.currencyObj.value,
                txnDt: that.fg.controls.dateOfSpend.value,
              })),
              startWith({
                currencyObj: that.fg.controls.currencyObj.value,
                txnDt: that.fg.controls.dateOfSpend.value,
              })
            );
          } else {
            return EMPTY;
          }
        }),
        filter(({ currencyObj, txnDt }) => currencyObj && currencyObj.amount && txnDt),
        switchMap(({ currencyObj, txnDt }) => {
          this.isLoadingSuggestions = true;
          return that.corporateCreditCardExpenseSuggestionService.getSuggestions({
            amount: currencyObj.amount,
            txn_dt: txnDt,
          });
        })
      )
      .subscribe((matchingCCCTransactions) => {
        this.isLoadingSuggestions = false;
        if (matchingCCCTransactions.length > 0) {
          this.matchingCCCTransactions = matchingCCCTransactions;
        } else {
          this.matchingCCCTransactions = [];
        }

        if (this.selectedCCCTransaction) {
          this.selectedCCCTransactionInSuggestions = this.matchingCCCTransactions.some(
            (cccTxn) => cccTxn.id === this.selectedCCCTransaction.id
          );
        }

        this.etxn$.subscribe((etxn) => {
          if (
            typeof etxn.tx.corporate_credit_card_expense_group_id === 'undefined' ||
            etxn.tx.corporate_credit_card_expense_group_id === null
          ) {
            if (
              this.selectedCCCTransaction &&
              !this.selectedCCCTransactionInSuggestions &&
              (!this.isCCCTransactionAutoSelected || this.isChangeCCCSuggestionClicked)
            ) {
              this.matchingCCCTransactions.push(this.selectedCCCTransaction);
            }

            if (
              this.selectedCCCTransaction &&
              !this.selectedCCCTransactionInSuggestions &&
              this.isCCCTransactionAutoSelected &&
              !this.isChangeCCCSuggestionClicked
            ) {
              this.selectedCCCTransaction = null;
              this.isCCCTransactionAutoSelected = false;
            }

            if (
              !this.selectedCCCTransaction &&
              this.matchingCCCTransactions &&
              this.matchingCCCTransactions.length > 0 &&
              !this.isChangeCCCSuggestionClicked
            ) {
              this.selectedCCCTransaction = this.matchingCCCTransactions[0];
              this.isCCCTransactionAutoSelected = true;
            }
          } else if (this.selectedCCCTransaction && !this.selectedCCCTransactionInSuggestions) {
            this.matchingCCCTransactions.push(this.selectedCCCTransaction);
          }
        });
      });
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  getPossibleDuplicates() {
    return this.checkForDuplicates();
  }

  async trackDuplicatesShown(duplicates, etxn) {
    try {
      const duplicateTxnIds = duplicates.reduce((prev, cur) => prev.concat(cur.duplicate_transaction_ids), []);
      const duplicateFields = duplicates.reduce((prev, cur) => prev.concat(cur.duplicate_fields), []);

      await this.trackingService.duplicateDetectionAlertShown({
        Page: this.mode === 'add' ? 'Add Expense' : 'Edit Expense',
        ExpenseId: etxn.tx.id,
        DuplicateExpenses: duplicateTxnIds,
        DuplicateFields: duplicateFields,
      });
    } catch (err) {
      // Ignore event tracking errors
    }
  }

  setupDuplicateDetection() {
    this.duplicates$ = this.fg.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged((a, b) => isEqual(a, b)),
      switchMap(() => this.getPossibleDuplicates())
    );

    this.duplicates$
      .pipe(
        filter((duplicates) => duplicates && duplicates.length),
        take(1)
      )
      .subscribe((res) => {
        this.pointToDuplicates = true;
        setTimeout(() => {
          this.pointToDuplicates = false;
        }, 3000);

        this.etxn$.pipe(take(1)).subscribe(async (etxn) => this.trackDuplicatesShown(res, etxn));
      });
  }

  showDuplicates() {
    const duplicateInputContainer = this.duplicateInputContainer.nativeElement as HTMLElement;
    if (duplicateInputContainer) {
      duplicateInputContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });

      this.pointToDuplicates = false;
    }
  }

  openSplitExpenseModal(splitType) {
    const customFields$ = this.getCustomFields();

    forkJoin({
      generatedEtxn: this.generateEtxnFromFg(this.etxn$, customFields$),
      txnFields: this.txnFields$.pipe(take(1)),
    }).subscribe((res) => {
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
          selectedReportId: this.fg.value.report ? JSON.stringify(this.fg.value.report.rp.id) : null,
        },
      ]);
    });
  }

  markCCCAsPersonal(txnId: string) {
    return this.transactionService.delete(txnId).pipe(
      switchMap((res) => {
        if (res) {
          this.trackingService.deleteExpense({ Type: 'Marked Personal' });
          return this.corporateCreditCardExpenseService.markPersonal(this.corporateCreditCardExpenseGroupId);
        }
      })
    );
  }

  dismissCCC(txnId: string, corporateCreditCardExpenseId: string) {
    return this.transactionService.delete(txnId).pipe(
      switchMap((res) => {
        if (res) {
          this.trackingService.deleteExpense({ Type: 'Dismiss as Card Payment' });
          return this.corporateCreditCardExpenseService.dismissCreditTransaction(corporateCreditCardExpenseId);
        }
      })
    );
  }

  async markPeronsalOrDismiss(type: string) {
    const id = this.activatedRoute.snapshot.params.id;
    this.etxn$.subscribe(
      (etxn) => (this.corporateCreditCardExpenseGroupId = etxn?.tx?.corporate_credit_card_expense_group_id)
    );
    const isMarkPersonal = type === 'personal' && this.isExpenseMatchedForDebitCCCE;
    const isDismiss = type === 'dismiss' && this.canDismissCCCE;
    const header = isMarkPersonal ? 'Mark Expense as Personal' : 'Dismiss this expense?';
    const body = isMarkPersonal
      ? "This corporate card expense will be marked as personal and you won't be able to edit it.\nDo you wish to proceed?"
      : "This corporate card expense will be dismissed and you won't be able to edit it.\nDo you wish to proceed?";
    const ctaText = 'Yes';
    const ctaLoadingText = isMarkPersonal ? 'Marking' : 'Dismissing';

    const deletePopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header,
        body,
        ctaText,
        ctaLoadingText,
        deleteMethod: () => {
          if (isMarkPersonal) {
            return this.transactionService
              .unmatchCCCExpense(id, this.corporateCreditCardExpenseGroupId)
              .pipe(switchMap(() => this.markCCCAsPersonal(id)));
          } else {
            return this.transactionService
              .unmatchCCCExpense(id, this.matchedCCCTransaction.id)
              .pipe(switchMap(() => this.dismissCCC(id, this.matchedCCCTransaction.id)));
          }
        },
      },
    });

    await deletePopover.present();
    const { data } = await deletePopover.onDidDismiss();

    if (data && data.status === 'success') {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
      const toastMessage = isMarkPersonal ? 'Marked expense as Personal' : 'Dismissed expense';
      const toastMessageData = {
        message: toastMessage,
      };
      this.matSnackBar.openFromComponent(ToastMessageComponent, {
        ...this.snackbarProperties.setSnackbarProperties('information', toastMessageData),
        panelClass: ['msb-info'],
      });
      this.trackingService.showToastMessage({ ToastContent: toastMessageData.message });
    }
  }

  async moreActions() {
    if (this.fg.valid) {
      return forkJoin({
        orgSettings$: this.offlineService.getOrgSettings(),
        costCenters: this.costCenters$,
        projects: this.offlineService.getProjects(),
        txnFields: this.txnFields$.pipe(take(1)),
      }).subscribe(async (res) => {
        const orgSettings = res.orgSettings$;
        const areCostCentersAvailable = res.costCenters.length > 0;
        const areProjectsAvailable = orgSettings.projects.enabled && res.projects.length > 0;
        const projectField = res.txnFields.project_id;

        this.actionSheetButtons = [
          {
            text: 'Split Expense By Category',
            handler: () => {
              this.openSplitExpenseModal('categories');
            },
          },
        ];

        if (areProjectsAvailable) {
          this.actionSheetButtons.push({
            text: 'Split Expense By ' + this.titleCasePipe.transform(projectField?.field_name),
            handler: () => {
              this.openSplitExpenseModal('projects');
            },
          });
        }

        if (areCostCentersAvailable) {
          this.actionSheetButtons.push({
            text: 'Split Expense By Cost Center',
            handler: () => {
              this.openSplitExpenseModal('cost centers');
            },
          });
        }

        if (this.isUnifyCcceExpensesSettingsEnabled && this.isCccExpense && this.isExpenseMatchedForDebitCCCE) {
          this.actionSheetButtons.push({
            text: 'Mark as Personal',
            handler: () => {
              this.markPeronsalOrDismiss('personal');
            },
          });
        }

        if (this.isUnifyCcceExpensesSettingsEnabled && this.isCccExpense && this.canDismissCCCE) {
          this.actionSheetButtons.push({
            text: 'Dimiss as Card Payment',
            handler: () => {
              this.markPeronsalOrDismiss('dismiss');
            },
          });
        }

        const actionSheet = await this.actionSheetController.create({
          header: 'MORE ACTIONS',
          mode: 'md',
          cssClass: 'fy-action-sheet',
          buttons: this.actionSheetButtons,
        });
        await actionSheet.present();
      });
    } else {
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
  }

  ngOnInit() {
    this.isRedirectedFromReport = this.activatedRoute.snapshot.params.remove_from_report ? true : false;
    this.canRemoveFromReport = this.activatedRoute.snapshot.params.remove_from_report === 'true';
  }

  getFormValidationErrors() {
    Object.keys(this.fg.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.fg.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {});
      }
    });
  }

  setupCostCenters() {
    const orgSettings$ = this.offlineService.getOrgSettings();

    this.isCostCentersEnabled$ = orgSettings$.pipe(map((orgSettings) => orgSettings.cost_centers.enabled));

    this.costCenters$ = forkJoin({
      orgSettings: orgSettings$,
      orgUserSettings: this.orgUserSettings$,
    }).pipe(
      switchMap(({ orgSettings, orgUserSettings }) => {
        if (orgSettings.cost_centers.enabled) {
          return this.offlineService.getAllowedCostCenters(orgUserSettings);
        } else {
          return of([]);
        }
      }),
      map((costCenters) =>
        costCenters.map((costCenter) => ({
          label: costCenter.name,
          value: costCenter,
        }))
      )
    );
  }

  setupBalanceFlag() {
    const accounts$ = this.offlineService.getAccounts();

    this.isBalanceAvailableInAnyAdvanceAccount$ = this.fg.controls.paymentMode.valueChanges.pipe(
      switchMap((paymentMode) => {
        if (paymentMode && paymentMode.acc && paymentMode.acc.type === 'PERSONAL_ACCOUNT') {
          return accounts$.pipe(
            map(
              (accounts) =>
                accounts.filter(
                  (account) =>
                    account &&
                    account.acc &&
                    account.acc.type === 'PERSONAL_ADVANCE_ACCOUNT' &&
                    account.acc.tentative_balance_amount > 0
                ).length > 0
            )
          );
        }
        return of(false);
      })
    );
  }

  getPaymentModes() {
    const accounts$ = this.isConnected$.pipe(
      take(1),
      switchMap((isConnected) => {
        if (isConnected) {
          return this.accountsService.getEMyAccounts();
        } else {
          return this.offlineService.getAccounts();
        }
      })
    );
    const orgSettings$ = this.offlineService.getOrgSettings();

    return forkJoin({
      accounts: accounts$,
      orgSettings: orgSettings$,
      etxn: this.etxn$,
    }).pipe(
      map(({ accounts, orgSettings, etxn }) => {
        const isAdvanceEnabled =
          (orgSettings.advances && orgSettings.advances.enabled) ||
          (orgSettings.advance_requests && orgSettings.advance_requests.enabled);
        const isMultipleAdvanceEnabled =
          orgSettings && orgSettings.advance_account_settings && orgSettings.advance_account_settings.multiple_accounts;
        const isCCCEnabled =
          orgSettings &&
          orgSettings.corporate_credit_card_settings.allowed &&
          orgSettings.corporate_credit_card_settings.enabled;
        /**
         * When CCC settings is disabled then we shouldn't show CCC as payment mode on add expense form
         * But if already an expense is created as CCC payment mode then on edit of that expense it should be visible
         */
        if (
          !isCCCEnabled &&
          !etxn.tx.corporate_credit_card_expense_group_id &&
          etxn.source?.account_type !== 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT'
        ) {
          accounts = accounts.filter((account) => account.acc.type !== 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
        }
        if (!isCCCEnabled && !etxn.tx.corporate_credit_card_expense_group_id) {
          this.showCardTransaction = false;
        }
        const userAccounts = this.accountsService.filterAccountsWithSufficientBalance(accounts, isAdvanceEnabled);
        return this.accountsService.constructPaymentModes(userAccounts, isMultipleAdvanceEnabled);
      }),
      map((paymentModes) =>
        paymentModes.map((paymentMode: any) => ({ label: paymentMode.acc.displayName, value: paymentMode }))
      )
    );
  }

  getActiveCategories() {
    const allCategories$ = this.offlineService.getAllEnabledCategories();

    return allCategories$.pipe(map((catogories) => this.categoriesService.filterRequired(catogories)));
  }

  getInstaFyleImageData() {
    if (this.activatedRoute.snapshot.params.dataUrl && this.activatedRoute.snapshot.params.canExtractData !== 'false') {
      const dataUrl = this.activatedRoute.snapshot.params.dataUrl;
      const b64Image = dataUrl.replace('data:image/jpeg;base64,', '');
      return from(this.transactionOutboxService.parseReceipt(b64Image)).pipe(
        timeout(15000),
        map((parsedResponse) => ({
          parsedResponse: parsedResponse.data,
        })),
        catchError((err) =>
          of({
            error: true,
            parsedResponse: {
              source: 'MOBILE_INSTA',
            },
          })
        ),
        switchMap((extractedDetails: any) => {
          const instaFyleImageData = {
            thumbnail: this.activatedRoute.snapshot.params.dataUrl,
            type: 'image',
            url: this.activatedRoute.snapshot.params.dataUrl,
            ...extractedDetails,
          };

          if (extractedDetails.parsedResponse) {
            return this.offlineService.getHomeCurrency().pipe(
              switchMap((homeCurrency) => {
                if (homeCurrency !== extractedDetails.parsedResponse.currency) {
                  return this.currencyService
                    .getExchangeRate(
                      extractedDetails.parsedResponse.currency,
                      homeCurrency,
                      extractedDetails.parsedResponse.date ? new Date(extractedDetails.parsedResponse.date) : new Date()
                    )
                    .pipe(
                      catchError((err) => of(null)),
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
        thumbnail: this.activatedRoute.snapshot.params.dataUrl,
        type: 'image',
        url: this.activatedRoute.snapshot.params.dataUrl,
      };
      return of(instaFyleImageData);
    } else {
      return of(null);
    }
  }

  getNewExpenseObservable() {
    const orgSettings$ = this.offlineService.getOrgSettings();
    const accounts$ = this.offlineService.getAccounts();
    const eou$ = from(this.authService.getEou());

    return forkJoin({
      orgSettings: orgSettings$,
      orgUserSettings: this.orgUserSettings$,
      categories: this.offlineService.getAllEnabledCategories(),
      homeCurrency: this.homeCurrency$,
      accounts: accounts$,
      eou: eou$,
      imageData: this.getInstaFyleImageData(),
      recentCurrency: from(this.recentLocalStorageItemsService.get('recent-currency-cache')),
      recentValue: this.recentlyUsedValues$,
    }).pipe(
      map((dependencies) => {
        const {
          orgSettings,
          orgUserSettings,
          categories,
          homeCurrency,
          accounts,
          eou,
          imageData,
          recentCurrency,
          recentValue,
        } = dependencies;
        const bankTxn =
          this.activatedRoute.snapshot.params.bankTxn && JSON.parse(this.activatedRoute.snapshot.params.bankTxn);
        const personalCardTxn =
          this.activatedRoute.snapshot.params.personalCardTxn &&
          JSON.parse(this.activatedRoute.snapshot.params.personalCardTxn);
        this.isExpenseBankTxn = !!bankTxn;
        const projectEnabled = orgSettings.projects && orgSettings.projects.enabled;
        let etxn;
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
            etxn.tx.currency = (recentCurrency && recentCurrency[0] && recentCurrency[0].shortCode) || etxn.tx.currency;
          }

          const receiptsData = this.activatedRoute.snapshot.params.receiptsData;

          if (receiptsData) {
            if (receiptsData.amount) {
              etxn.tx.amount = receiptsData.amount;
              etxn.tx.orig_amount = receiptsData.amount;
            }
            if (receiptsData.dataUrls) {
              etxn.dataUrls = receiptsData.dataUrls;
              etxn.tx.num_files = etxn.dataUrls ? 1 : 0;
            }
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
            const categoryName = extractedData.category || 'unspecified';
            const category = categories.find((orgCategory) => orgCategory.name === categoryName);
            etxn.tx.org_category_id = category && category.id;
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
      }),
      shareReplay(1)
    );
  }

  setupFormInit(allCategories$: Observable<any>) {
    const selectedProject$ = this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.project_id) {
          return of(etxn.tx.project_id);
        } else {
          return forkJoin({
            orgSettings: this.offlineService.getOrgSettings(),
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
          return this.projectService.getbyId(projectId);
        } else {
          return of(null);
        }
      })
    );

    const selectedCategory$ = this.etxn$.pipe(
      switchMap((etxn) =>
        iif(
          () => etxn.tx.org_category_id,
          allCategories$.pipe(
            map((categories) =>
              categories
                .filter((category) => {
                  if (!category.fyle_category) {
                    return true;
                  } else {
                    return (
                      ['activity', 'mileage', 'per diem', 'unspecified'].indexOf(
                        category.fyle_category.toLowerCase()
                      ) === -1
                    );
                  }
                })
                .find((category) => category.id === etxn.tx.org_category_id)
            )
          ),
          of(null)
        )
      )
    );
    const selectedReport$ = this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.report_id) {
          return this.reports$.pipe(
            map((reportOptions) =>
              reportOptions.map((res) => res.value).find((reportOption) => reportOption.rp.id === etxn.tx.report_id)
            )
          );
        } else if (!etxn.tx.report_id && this.activatedRoute.snapshot.params.rp_id) {
          return this.reports$.pipe(
            map((reportOptions) =>
              reportOptions
                .map((res) => res.value)
                .find((reportOption) => reportOption.rp.id === this.activatedRoute.snapshot.params.rp_id)
            )
          );
        } else {
          return of(null);
        }
      })
    );

    const selectedPaymentMode$ = this.etxn$.pipe(
      switchMap((etxn) =>
        iif(
          () => etxn.tx.source_account_id,
          this.paymentModes$.pipe(
            map((paymentModes) =>
              paymentModes
                .map((res) => res.value)
                .find((paymentMode) => {
                  if (paymentMode.acc.displayName === 'Personal Card/Cash') {
                    return paymentMode.acc.id === etxn.tx.source_account_id && !etxn.tx.skip_reimbursement;
                  } else {
                    return paymentMode.acc.id === etxn.tx.source_account_id;
                  }
                })
            )
          ),
          of(null)
        )
      )
    );

    this.recentlyUsedCostCenters$ = forkJoin({
      costCenters: this.costCenters$,
      recentValue: this.recentlyUsedValues$,
    }).pipe(
      concatMap(({ costCenters, recentValue }) =>
        this.recentlyUsedItemsService.getRecentCostCenters(costCenters, recentValue)
      )
    );

    const defaultPaymentMode$ = forkJoin({
      orgUserSettings: this.orgUserSettings$,
      paymentModes: this.paymentModes$,
    }).pipe(
      map(({ paymentModes, orgUserSettings }) => {
        const hasCCCAccount = paymentModes
          .map((res) => res.value)
          .some((paymentMode) => paymentMode.acc.type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
        if (
          hasCCCAccount &&
          orgUserSettings.preferences &&
          orgUserSettings.preferences.default_payment_mode &&
          orgUserSettings.preferences.default_payment_mode === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT'
        ) {
          return paymentModes
            .map((res) => res.value)
            .find((paymentMode) => paymentMode.acc.type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
        } else if (
          orgUserSettings.preferences &&
          orgUserSettings.preferences.default_payment_mode === 'COMPANY_ACCOUNT'
        ) {
          return paymentModes
            .map((res) => res.value)
            .find((paymentMode) => paymentMode.acc.displayName === 'Paid by Company');
        } else if (this.isCreatedFromCCC) {
          return paymentModes
            .map((res) => res.value)
            .find((paymentMode) => paymentMode.acc.type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
        } else {
          return paymentModes
            .map((res) => res.value)
            .find((paymentMode) => paymentMode.acc.displayName === 'Personal Card/Cash');
        }
      })
    );

    this.recentlyUsedProjects$ = forkJoin({
      recentValues: this.recentlyUsedValues$,
      eou: this.authService.getEou(),
    }).pipe(
      switchMap(({ recentValues, eou }) => {
        const categoryId = this.fg.controls.category.value && this.fg.controls.category.value.id;
        return this.recentlyUsedItemsService.getRecentlyUsedProjects({
          recentValues,
          eou,
          categoryIds: categoryId,
        });
      })
    );

    this.recentlyUsedCurrencies$ = forkJoin({
      recentValues: this.recentlyUsedValues$,
      currencies: this.offlineService.getCurrencies(),
    }).pipe(
      switchMap(({ recentValues, currencies }) =>
        this.recentlyUsedItemsService.getRecentCurrencies(currencies, recentValues)
      )
    );

    const selectedCostCenter$ = this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.cost_center_id) {
          return of(etxn.tx.cost_center_id);
        } else {
          return forkJoin({
            orgSettings: this.offlineService.getOrgSettings(),
            costCenters: this.costCenters$,
          }).pipe(
            map(({ orgSettings, costCenters }) => {
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
              costCenters.map((res) => res.value).find((costCenter) => costCenter.id === costCenterId)
            )
          );
        } else {
          return of(null);
        }
      })
    );

    const selectedCustomInputs$ = this.etxn$.pipe(
      switchMap((etxn) =>
        this.offlineService
          .getCustomInputs()
          .pipe(
            map((customFields) =>
              this.customFieldsService.standardizeCustomFields(
                [],
                this.customInputsService.filterByCategory(customFields, etxn.tx.org_category_id)
              )
            )
          )
      )
    );

    const txnReceiptsCount$ = this.etxn$.pipe(
      switchMap((etxn) => this.fileService.findByTransactionId(etxn.tx.id)),
      map((fileObjs) => (fileObjs && fileObjs.length) || 0)
    );

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
            customInputs: selectedCustomInputs$,
            txnReceiptsCount: txnReceiptsCount$,
            homeCurrency: this.offlineService.getHomeCurrency(),
            orgSettings: this.offlineService.getOrgSettings(),
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
          customInputs,
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
          const customInputValues = customInputs.map((customInput) => {
            const cpor =
              etxn.tx.custom_properties &&
              etxn.tx.custom_properties.find((customProp) => customProp.name === customInput.name);
            if (customInput.type === 'DATE') {
              return {
                name: customInput.name,
                value: (cpor && cpor.value && moment(new Date(cpor.value)).format('y-MM-DD')) || null,
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

          // Check if recent categories exist
          category = this.getAutofillCategory({
            isAutofillsEnabled,
            recentValue,
            recentCategories,
            etxn,
            category,
          });

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

          /* Autofill project during these cases:
           * 1. Autofills is allowed and enabled
           * 2. During add expense - When project field is empty
           * 3. During edit expense - When the expense is in draft state and there is no project already added
           * 4. When there exists recently used project ids to auto-fill
           */
          if (
            doRecentProjectIdsExist &&
            (!etxn.tx.id || (etxn.tx.id && etxn.tx.state === 'DRAFT' && !etxn.tx.project_id))
          ) {
            const autoFillProject = recentProjects && recentProjects.length > 0 && recentProjects[0];

            if (autoFillProject) {
              project = autoFillProject;
              this.presetProjectId = project.project_id;
            }
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
            }
          }

          this.fg.patchValue(
            {
              project,
              category,
              dateOfSpend: etxn.tx.txn_dt && moment(etxn.tx.txn_dt).format('y-MM-DD'),
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
              from_dt: etxn.tx.from_dt && moment(etxn.tx.from_dt).format('y-MM-DD'),
              to_dt: etxn.tx.to_dt && moment(etxn.tx.to_dt).format('y-MM-DD'),
              flight_journey_travel_class: etxn.tx.flight_journey_travel_class,
              flight_return_travel_class: etxn.tx.flight_return_travel_class,
              train_travel_class: etxn.tx.train_travel_class,
              bus_travel_class: etxn.tx.bus_travel_class,
              distance: etxn.tx.distance,
              distance_unit: etxn.tx.distance_unit,
              duplicate_detection_reason: etxn.tx.user_reason_for_duplicate_expenses,
              billable: etxn.tx.billable,
              custom_inputs: customInputValues,
              costCenter,
              hotel_is_breakfast_provided: etxn.tx.hotel_is_breakfast_provided,
            },
            {
              emitEvent: false,
            }
          );

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

          this.fg.controls.vendor_id.valueChanges.subscribe((vendor) => {
            if (
              this.fg.controls.category.pristine &&
              !this.fg.controls.category.value &&
              vendor &&
              vendor.default_category
            ) {
              this.setCategoryFromVendor(vendor.default_category);
            }
          });

          if (this.activatedRoute.snapshot.params.extractData && this.activatedRoute.snapshot.params.image) {
            this.parseFile(JSON.parse(this.activatedRoute.snapshot.params.image));
          }
        }
      );
  }

  getAutofillCategory(config: {
    isAutofillsEnabled: boolean;
    recentValue: RecentlyUsed;
    recentCategories: OrgCategoryListItem[];
    etxn: any;
    category: OrgCategory;
  }) {
    const { isAutofillsEnabled, recentValue, recentCategories, etxn } = config;

    let category = config.category;

    const doRecentOrgCategoryIdsExist =
      isAutofillsEnabled &&
      recentValue &&
      recentValue.recent_org_category_ids &&
      recentValue.recent_org_category_ids.length > 0;

    if (recentCategories && recentCategories.length > 0) {
      this.recentCategories = recentCategories;
    }

    // Check if category is extracted from instaFyle/autoFyle
    const isCategoryExtracted = etxn.tx && etxn.tx.extracted_data && etxn.tx.extracted_data.category;

    /* Autofill category during these cases:
     * 1. vm.canAutofill - Autofills is allowed and enabled - mandatory
     * 2. When there exists recently used category ids to auto-fill - mandatory
     * 3. During add expense - When category field is empty - optional
     * 4. During edit expense - When the expense is in draft state and
     * there is no category extracted or no category already added - optional
     */
    if (
      doRecentOrgCategoryIdsExist &&
      !isCategoryExtracted &&
      (!etxn.tx.id ||
        (etxn.tx.id &&
          etxn.tx.state === 'DRAFT' &&
          (!etxn.tx.org_category_id ||
            (etxn.tx.fyle_category && etxn.tx.fyle_category.toLowerCase() === 'unspecified'))))
    ) {
      const autoFillCategory = recentCategories && recentCategories.length > 0 && recentCategories[0];

      if (autoFillCategory) {
        category = autoFillCategory.value;
        this.presetCategoryId = autoFillCategory.value.id;
      }
    }
    return category;
  }

  setCategoryFromVendor(defaultCategory) {
    this.getActiveCategories().subscribe((categories) => {
      const category = categories.find((innerCategory) => innerCategory.fyle_category === defaultCategory);
      this.fg.controls.category.patchValue(category);
    });
  }

  getCategoryOnEdit(category) {
    return forkJoin({
      orgUserSettings: this.offlineService.getOrgUserSettings(),
      orgSettings: this.offlineService.getOrgSettings(),
      recentValues: this.recentlyUsedValues$,
      recentCategories: this.recentlyUsedCategories$,
      etxn: this.etxn$,
      categories: this.offlineService.getAllEnabledCategories(),
    }).pipe(
      map(({ orgUserSettings, orgSettings, recentValues, recentCategories, etxn, categories }) => {
        const isAutofillsEnabled =
          orgSettings.org_expense_form_autofills &&
          orgSettings.org_expense_form_autofills.allowed &&
          orgSettings.org_expense_form_autofills.enabled &&
          orgUserSettings.expense_form_autofills &&
          orgUserSettings.expense_form_autofills.allowed &&
          orgUserSettings.expense_form_autofills.enabled;
        const isCategoryExtracted = etxn.tx && etxn.tx.extracted_data && etxn.tx.extracted_data.category;
        if (this.initialFetch) {
          if (etxn.tx.org_category_id) {
            if (
              etxn.tx.state === 'DRAFT' &&
              etxn.tx.fyle_category &&
              etxn.tx.fyle_category.toLowerCase() === 'unspecified'
            ) {
              return this.getAutofillCategory({
                isAutofillsEnabled,
                recentValue: recentValues,
                recentCategories,
                etxn,
                category,
              });
            } else {
              return categories.find((innerCategory) => innerCategory.id === etxn.tx.org_category_id);
            }
          } else if (
            etxn.tx.state === 'DRAFT' &&
            !isCategoryExtracted &&
            (!etxn.tx.org_category_id ||
              (etxn.tx.fyle_category && etxn.tx.fyle_category.toLowerCase() === 'unspecified'))
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

  getCategoryOnAdd(category) {
    if (category) {
      return of(category);
    } else {
      return forkJoin({
        orgUserSettings: this.offlineService.getOrgUserSettings(),
        orgSettings: this.offlineService.getOrgSettings(),
        recentValues: this.recentlyUsedValues$,
        recentCategories: this.recentlyUsedCategories$,
        etxn: this.etxn$,
        categories: this.offlineService.getAllEnabledCategories(),
      }).pipe(
        map(({ orgUserSettings, orgSettings, recentValues, recentCategories, etxn, categories }) => {
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
              category: categories,
            });
          } else {
            return null;
          }
        })
      );
    }
  }

  setupCustomFields() {
    this.initialFetch = true;
    this.customInputs$ = this.fg.controls.category.valueChanges.pipe(
      startWith({}),
      switchMap((category) =>
        iif(() => this.mode === 'add', this.getCategoryOnAdd(category), this.getCategoryOnEdit(category))
      ),
      switchMap((category) => {
        const formValue = this.fg.value;
        return this.offlineService
          .getCustomInputs()
          .pipe(
            map((customFields) =>
              this.customFieldsService.standardizeCustomFields(
                formValue.custom_inputs || [],
                this.customInputsService.filterByCategory(customFields, category && category.id)
              )
            )
          );
      }),
      map((customFields) =>
        customFields.map((customField) => {
          if (customField.options) {
            customField.options = customField.options.map((option) => ({ label: option, value: option }));
          }
          return customField;
        })
      ),

      switchMap((customFields: any[]) =>
        this.isConnected$.pipe(
          take(1),
          map((isConnected) => {
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
                      : customField.value && moment(customField.value).format('y-MM-DD'),
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
  }

  setupTfc() {
    const txnFieldsMap$ = this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue) =>
        this.offlineService.getExpenseFieldsMap().pipe(
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

    this.txnFields$ = txnFieldsMap$.pipe(
      map((expenseFieldsMap: any) => {
        if (expenseFieldsMap) {
          for (const tfc of Object.keys(expenseFieldsMap)) {
            if (expenseFieldsMap[tfc].options && expenseFieldsMap[tfc].options.length > 0) {
              if (tfc === 'vendor_id') {
                expenseFieldsMap[tfc].options = expenseFieldsMap[tfc].options.map((value) => ({
                  label: value,
                  value: {
                    display_name: value,
                  },
                }));
              } else {
                expenseFieldsMap[tfc].options = expenseFieldsMap[tfc].options.map((value) => ({ label: value, value }));
              }
            }
          }
        }
        return expenseFieldsMap;
      }),
      shareReplay(1)
    );

    this.txnFields$
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        switchMap((txnFields) =>
          forkJoin({
            isConnected: this.isConnected$.pipe(take(1)),
            orgSettings: this.offlineService.getOrgSettings(),
            costCenters: this.costCenters$,
            taxGroups: this.taxGroups$,
            isIndividualProjectsEnabled: this.isIndividualProjectsEnabled$,
            individualProjectIds: this.individualProjectIds$,
            filteredCategories: this.filteredCategories$.pipe(take(1)),
          }).pipe(
            map(
              ({
                isConnected,
                orgSettings,
                costCenters,
                taxGroups,
                isIndividualProjectsEnabled,
                individualProjectIds,
                filteredCategories,
              }) => ({
                isConnected,
                txnFields,
                orgSettings,
                costCenters,
                taxGroups,
                isIndividualProjectsEnabled,
                individualProjectIds,
                filteredCategories,
              })
            )
          )
        )
      )
      .subscribe(
        ({
          isConnected,
          txnFields,
          orgSettings,
          costCenters,
          taxGroups,
          individualProjectIds,
          isIndividualProjectsEnabled,
          filteredCategories,
        }) => {
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
            project_id: this.fg.controls.project,
            billable: this.fg.controls.billable,
            tax_group_id: this.fg.controls.tax_group,
            org_category_id: this.fg.controls.category,
          };
          for (const control of Object.values(keyToControlMap)) {
            control.clearValidators();
            control.updateValueAndValidity();
          }
          // setup validations
          for (const txnFieldKey of Object.keys(txnFields)) {
            const control = keyToControlMap[txnFieldKey];
            if (txnFields[txnFieldKey].is_mandatory) {
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
                  this.fg.value.category &&
                  this.fg.value.category.fyle_category &&
                  ['Bus', 'Flight', 'Hotel', 'Train'].includes(this.fg.value.category.fyle_category) &&
                  isConnected
                ) {
                  control.setValidators(Validators.required);
                }
              } else if (['distance', 'distance_unit'].includes(txnFieldKey)) {
                if (
                  this.fg.value.category &&
                  this.fg.value.category.fyle_category &&
                  ['Taxi'].includes(this.fg.value.category.fyle_category) &&
                  isConnected
                ) {
                  control.setValidators(Validators.required);
                }
              } else if (txnFieldKey === 'txn_dt') {
                control.setValidators(
                  isConnected ? Validators.compose([Validators.required, this.customDateValidator]) : null
                );
              } else if (txnFieldKey === 'cost_center_id') {
                control.setValidators(
                  isConnected && costCenters && costCenters.length > 0 ? Validators.required : null
                );
              } else if (txnFieldKey === 'tax_group_id') {
                control.setValidators(isConnected && taxGroups && taxGroups.length > 0 ? Validators.required : null);
              } else if (txnFieldKey === 'project_id') {
                control.setValidators(
                  orgSettings.projects.enabled && isIndividualProjectsEnabled && individualProjectIds.length === 0
                    ? null
                    : Validators.required
                );
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
        }
      );

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

  setupFilteredCategories(activeCategories$: Observable<any>) {
    this.filteredCategories$ = this.etxn$.pipe(
      switchMap((etxn) => {
        if (etxn.tx.project_id) {
          return this.projectService.getbyId(etxn.tx.project_id);
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
          concatMap((project) =>
            activeCategories$.pipe(
              map((activeCategories) => this.projectService.getAllowedOrgCategoryIds(project, activeCategories))
            )
          ),
          map((categories) => categories.map((category) => ({ label: category.displayName, value: category })))
        )
      ),
      shareReplay(1)
    );

    this.filteredCategories$.subscribe((categories) => {
      if (
        this.fg.value.category &&
        this.fg.value.category.id &&
        !categories.some((category) => this.fg.value.category && this.fg.value.category.id === category.value.id)
      ) {
        this.fg.controls.category.reset();
      }
    });
  }

  getEditExpenseObservable() {
    return this.transactionService.getETxn(this.activatedRoute.snapshot.params.id).pipe(
      switchMap((etxn) => {
        this.source = etxn.tx.source || 'MOBILE';
        if (etxn.tx.state === 'DRAFT' && etxn.tx.extracted_data) {
          return forkJoin({
            allCategories: this.offlineService.getAllEnabledCategories(),
          }).pipe(
            switchMap(({ allCategories }) => {
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
                const category = allCategories.find(
                  (innerCategory) =>
                    innerCategory.name && innerCategory.name.toLowerCase() === categoryName.toLowerCase()
                );
                etxn.tx.org_category_id = category && category.id;
              }
              return of(etxn);
            })
          );
        }
        return of(etxn);
      }),
      shareReplay(1)
    );
  }

  goToPrev() {
    this.activeIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex, 10);
    if (this.reviewList[+this.activeIndex - 1]) {
      this.transactionService.getETxn(this.reviewList[+this.activeIndex - 1]).subscribe((etxn) => {
        this.goToTransaction(etxn, this.reviewList, +this.activeIndex - 1);
      });
    }
  }

  goToNext() {
    this.activeIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex, 10);
    if (this.reviewList[+this.activeIndex + 1]) {
      this.transactionService.getETxn(this.reviewList[+this.activeIndex + 1]).subscribe((etxn) => {
        this.goToTransaction(etxn, this.reviewList, +this.activeIndex + 1);
      });
    }
  }

  async showCannotEditActivityDialog() {
    const popupResult = await this.popupService.showPopup({
      header: 'Cannot Edit Activity Expense!',
      // eslint-disable-next-line max-len
      message: `To edit this activity expense, you need to login to web version of Fyle app at <a href="${this.clusterDomain}">${this.clusterDomain}</a>`,
      primaryCta: {
        text: 'Close',
      },
      showCancelButton: false,
    });
  }

  goToTransaction(expense, reviewList, activeIndex) {
    let category;

    if (expense.tx.org_category) {
      category = expense.tx.org_category.toLowerCase();
    }

    if (category === 'activity') {
      this.showCannotEditActivityDialog();
      return;
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

  customDateValidator(control: AbstractControl) {
    const today = new Date();
    const minDate = moment(new Date('Jan 1, 2001'));
    const maxDate = moment(new Date(today)).add(1, 'day');
    const passedInDate = control.value && moment(new Date(control.value));
    if (passedInDate) {
      return passedInDate.isBetween(minDate, maxDate)
        ? null
        : {
            invalidDateSelection: true,
          };
    }
  }

  ionViewWillEnter() {
    this.newExpenseDataUrls = [];

    from(this.tokenService.getClusterDomain()).subscribe((clusterDomain) => {
      this.clusterDomain = clusterDomain;
    });

    this.navigateBack = this.activatedRoute.snapshot.params.navigate_back;
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
      add_to_new_report: [],
      duplicate_detection_reason: [],
      billable: [],
      costCenter: [],
      hotel_is_breakfast_provided: [],
    });

    this.duplicateDetectionReasons = [
      { label: 'Different expense', value: 'Different expense' },
      { label: 'Other', value: 'Other' },
    ];

    if (this.activatedRoute.snapshot.params.bankTxn) {
      const bankTxn =
        this.activatedRoute.snapshot.params.bankTxn && JSON.parse(this.activatedRoute.snapshot.params.bankTxn);
      this.showSelectedTransaction = true;
      this.selectedCCCTransaction = bankTxn.ccce;
      let cccAccountNumber;
      if (bankTxn.flow && bankTxn.flow === 'newCCCFlow') {
        cccAccountNumber = this.selectedCCCTransaction.corporate_credit_card_account_number;
      }
      this.cardEndingDigits = cccAccountNumber && cccAccountNumber.slice(-4);
      this.selectedCCCTransaction.corporate_credit_card_account_number = cccAccountNumber;
      this.isCreatedFromCCC = true;
    }

    this.isCCCPaymentModeSelected$ = this.fg.controls.paymentMode.valueChanges.pipe(
      map(
        (paymentMode: any) =>
          paymentMode && paymentMode.acc && paymentMode.acc.type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT'
      )
    );

    this.isCreatedFromCCC = !this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn;

    this.isCreatedFromPersonalCard =
      !this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.personalCardTxn;

    this.setupExpenseSuggestions();

    this.setupDuplicateDetection();
    this.setUpTaxCalculations();

    const orgSettings$ = this.offlineService.getOrgSettings();
    this.orgUserSettings$ = this.offlineService.getOrgUserSettings();
    const allCategories$ = this.offlineService.getAllEnabledCategories();
    this.homeCurrency$ = this.offlineService.getHomeCurrency();
    const accounts$ = this.offlineService.getAccounts();

    this.isAdvancesEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          (orgSettings.advances && orgSettings.advances.enabled) ||
          (orgSettings.advance_requests && orgSettings.advance_requests.enabled)
      )
    );

    orgSettings$.subscribe((orgSettings) => {
      this.isUnifyCcceExpensesSettingsEnabled =
        orgSettings.unify_ccce_expenses_settings &&
        orgSettings.unify_ccce_expenses_settings.allowed &&
        orgSettings.unify_ccce_expenses_settings.enabled;

      this.isDraftExpenseEnabled =
        orgSettings.ccc_draft_expense_settings &&
        orgSettings.ccc_draft_expense_settings.allowed &&
        orgSettings.ccc_draft_expense_settings.enabled;

      if (orgSettings && orgSettings.tax_settings && orgSettings.tax_settings.enabled) {
        this.taxGroups$ = this.offlineService.getEnabledTaxGroups().pipe(shareReplay(1));
        this.taxGroupsOptions$ = this.taxGroups$.pipe(
          map((taxGroupsOptions) => taxGroupsOptions.map((tg) => ({ label: tg.name, value: tg })))
        );
      } else {
        this.taxGroups$ = of(null);
        this.taxGroupsOptions$ = of(null);
      }
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

    this.receiptsData = this.activatedRoute.snapshot.params.receiptsData;

    this.individualProjectIds$ = this.orgUserSettings$.pipe(
      map((orgUserSettings: any) => orgUserSettings.project_ids || []),
      shareReplay(1)
    );

    this.isIndividualProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.advanced_projects && orgSettings.advanced_projects.enable_individual_projects)
    );

    this.isProjectsVisible$ = forkJoin({
      individualProjectIds: this.individualProjectIds$,
      isIndividualProjectsEnabled: this.isIndividualProjectsEnabled$,
      projectsCount: this.offlineService.getProjectCount(),
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

    this.isExpandedView = this.mode !== 'add';

    this.activeIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex, 10);
    this.reviewList =
      this.activatedRoute.snapshot.params.txnIds && JSON.parse(this.activatedRoute.snapshot.params.txnIds);

    this.title = 'Add Expense';
    this.title =
      this.activeIndex > -1 && this.reviewList && this.activeIndex < this.reviewList.length ? 'Review' : 'Edit';
    this.duplicateBoxOpen = false;

    this.isProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.projects && orgSettings.projects.enabled)
    );

    this.comments$ = this.statusService.find('transactions', this.activatedRoute.snapshot.params.id);

    this.isSplitExpenseAllowed$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.expense_settings.split_expense_settings.enabled)
    );

    this.setupBalanceFlag();

    const today = new Date();
    this.minDate = moment(new Date('Jan 1, 2001')).format('y-MM-D');
    this.maxDate = moment(this.dateService.addDaysToDate(today, 1)).format('y-MM-D');

    const activeCategories$ = this.getActiveCategories();

    this.paymentAccount$ = accounts$.pipe(
      map((accounts) => {
        if (!this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn) {
          return accounts.find((account) => account.acc.type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
        } else {
          return null;
        }
      })
    );

    this.isCCCAccountSelected$ = accounts$.pipe(
      map((accounts) => {
        if (!this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn) {
          return accounts.find((account) => account.acc.type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT').length > 0;
        } else {
          return false;
        }
      })
    );

    const newExpensePipe$ = this.getNewExpenseObservable();

    const editExpensePipe$ = this.getEditExpenseObservable();

    this.attachments$ = this.loadAttachments$.pipe(
      switchMap(() =>
        this.etxn$.pipe(
          switchMap((etxn) => this.fileService.findByTransactionId(etxn.tx.id)),
          switchMap((fileObjs) => from(fileObjs)),
          concatMap((fileObj: any) =>
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
          reduce((acc, curr) => acc.concat(curr), [])
        )
      )
    );

    this.etxn$ = iif(() => this.activatedRoute.snapshot.params.id, editExpensePipe$, newExpensePipe$).pipe(
      shareReplay(1)
    );

    this.paymentModes$ = this.getPaymentModes();

    orgSettings$
      .pipe(
        switchMap((orgSettings) => this.etxn$.pipe(map((etxn) => ({ etxn, orgSettings })))),
        filter(
          ({ orgSettings, etxn }) =>
            (orgSettings.corporate_credit_card_settings.allowed &&
              orgSettings.corporate_credit_card_settings.enabled) ||
            etxn.tx.corporate_credit_card_expense_group_id
        ),
        filter(({ etxn }) => etxn.tx.corporate_credit_card_expense_group_id && etxn.tx.txn_dt),
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
          this.isSplitExpensesPresent = splitExpenses.length > 1;
          if (this.isSplitExpensesPresent) {
            this.alreadyApprovedExpenses = splitExpenses.filter(
              (txn) => ['DRAFT', 'COMPLETE'].indexOf(txn.tx_state) === -1
            );

            this.canEditCCCMatchedSplitExpense = this.alreadyApprovedExpenses.length < 1;
          }
        }

        forkJoin({
          matchedExpense: this.corporateCreditCardExpenseService.getEccceByGroupId(
            etxn.tx.corporate_credit_card_expense_group_id
          ),
          matchingTransactions: this.corporateCreditCardExpenseSuggestionService.getSuggestions({
            amount: etxn.tx.amount,
            txn_dt: etxn.tx.txn_dt,
          }),
        }).subscribe(({ matchedExpense, matchingTransactions }) => {
          this.matchedCCCTransaction = matchedExpense[0].ccce;
          this.matchingCCCTransactions = matchingTransactions;
          this.selectedCCCTransaction = this.matchedCCCTransaction;
          this.cardEndingDigits = (
            this.selectedCCCTransaction.cxorporate_credit_card_account_number
              ? this.selectedCCCTransaction.corporate_credit_card_account_number
              : this.selectedCCCTransaction.card_or_account_number
          ).slice(-4);

          etxn.tx.matchCCCId = this.selectedCCCTransaction.id;

          const txnDt = moment(this.selectedCCCTransaction.txn_dt).format('MMM d, y');

          this.selectedCCCTransaction.displayObject =
            txnDt +
            ' - ' +
            (this.selectedCCCTransaction.vendor
              ? this.selectedCCCTransaction.vendor
              : this.selectedCCCTransaction.description) +
            this.selectedCCCTransaction.amount;

          if (this.selectedCCCTransaction) {
            this.cardNumber = this.selectedCCCTransaction.card_or_account_number;
            this.selectedCCCTransactionInSuggestions = this.matchingCCCTransactions.some(
              (cccExpense) => cccExpense.id === this.matchedCCCTransaction.id
            );
          }

          if (!this.selectedCCCTransactionInSuggestions) {
            this.matchingCCCTransactions.push(this.matchedCCCTransaction);
          }
        });
      });

    this.setupFilteredCategories(activeCategories$);

    this.setupTfc();

    this.flightJourneyTravelClassOptions$ = this.txnFields$.pipe(
      map(
        (txnFields) =>
          txnFields.flight_journey_travel_class &&
          txnFields.flight_journey_travel_class.options.map((v) => ({ label: v, value: v }))
      )
    );

    this.taxSettings$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.tax_settings),
      map((taxSettings) => ({
        ...taxSettings,
        groups: taxSettings.groups && taxSettings.groups.map((tax) => ({ label: tax.name, value: tax })),
      }))
    );

    this.reports$ = this.reportService
      .getFilteredPendingReports({ state: 'edit' })
      .pipe(map((reports) => reports.map((report) => ({ label: report.rp.purpose, value: report }))));

    this.recentlyUsedCategories$ = forkJoin({
      filteredCategories: this.filteredCategories$.pipe(take(1)),
      recentValues: this.recentlyUsedValues$,
    }).pipe(
      concatMap(({ filteredCategories, recentValues }) =>
        this.recentlyUsedItemsService.getRecentCategories(filteredCategories, recentValues)
      )
    );

    this.setupCustomFields();

    this.setupFormInit(allCategories$);

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
      this.isCccExpense = etxn?.tx?.corporate_credit_card_expense_group_id;
      this.isExpenseMatchedForDebitCCCE = !!etxn?.tx?.corporate_credit_card_expense_group_id && etxn.tx.amount > 0;
      this.canDismissCCCE = !!etxn?.tx?.corporate_credit_card_expense_group_id && etxn.tx.amount < 0;
    });

    this.getPolicyDetails();
    this.getDuplicateExpenses();
    this.isIos = this.platform.is('ios');
  }

  generateEtxnFromFg(etxn$, standardisedCustomProperties$, isPolicyEtxn = false) {
    const editExpenseAttachments = etxn$.pipe(
      switchMap((etxn: any) => this.fileService.findByTransactionId(etxn.tx.id)),
      switchMap((fileObjs: any) => from(fileObjs)),
      concatMap((fileObj: any) =>
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
      reduce((acc, curr) => acc.concat(curr), [])
    );

    const addExpenseAttachments = of(
      this.newExpenseDataUrls.map((fileObj) => {
        fileObj.type = fileObj.type === 'application/pdf' || fileObj.type === 'pdf' ? 'pdf' : 'image';
        return fileObj;
      })
    );
    const attachements$ = iif(() => this.mode === 'add', addExpenseAttachments, editExpenseAttachments);
    return forkJoin({
      etxn: etxn$,
      customProperties: standardisedCustomProperties$,
      attachments: attachements$,
    }).pipe(
      map((res) => {
        const etxn: any = res.etxn;
        let customProperties: any = res.customProperties;
        customProperties = customProperties.map((customProperty) => {
          if (customProperty.type === 'DATE') {
            customProperty.value = customProperty.value && this.dateService.getUTCDate(new Date(customProperty.value));
          }
          return customProperty;
        });

        let locations;
        if (this.fg.value.location_1 && this.fg.value.location_2) {
          locations = [this.fg.value.location_1, this.fg.value.location_2];
        } else if (this.fg.value.location_1) {
          locations = [this.fg.value.location_1];
        }

        const costCenter: any = {};

        if (this.fg.value.costCenter) {
          costCenter.cost_center_id = this.fg.value.costCenter.id;
          costCenter.cost_center_name = this.fg.value.costCenter.name;
          costCenter.cost_center_code = this.fg.value.costCenter.code;
        }

        const policyProps: any = {};

        if (isPolicyEtxn) {
          policyProps.org_category = this.fg.value.category && this.fg.value.category.name;
          policyProps.sub_category = this.fg.value.category && this.fg.value.category.sub_category;
        }

        if (this.inpageExtractedData) {
          etxn.tx.extracted_data = this.inpageExtractedData;
        }

        return {
          tx: {
            ...etxn.tx,
            source: this.source || etxn.tx.source,
            source_account_id: this.fg.value.paymentMode.acc.id,
            billable: this.fg.value.billable,
            skip_reimbursement:
              this.fg.value.paymentMode &&
              this.fg.value.paymentMode.acc.type === 'PERSONAL_ACCOUNT' &&
              !this.fg.value.paymentMode.acc.isReimbursable,
            txn_dt: this.fg.value.dateOfSpend && this.dateService.getUTCDate(new Date(this.fg.value.dateOfSpend)),
            currency: this.fg.value.currencyObj && this.fg.value.currencyObj.currency,
            amount: this.fg.value.currencyObj && this.fg.value.currencyObj.amount,
            orig_currency: this.fg.value.currencyObj && this.fg.value.currencyObj.orig_currency,
            orig_amount: this.fg.value.currencyObj && this.fg.value.currencyObj.orig_amount,
            project_id: this.fg.value.project && this.fg.value.project.project_id,
            tax_amount: this.fg.value.tax_amount,
            tax_group_id: this.fg.value.tax_group && this.fg.value.tax_group.id,
            org_category_id: this.fg.value.category && this.fg.value.category.id,
            fyle_category: this.fg.value.category && this.fg.value.category.fyle_category,
            policy_amount: null,
            vendor: this.fg.value.vendor_id && this.fg.value.vendor_id.display_name,
            purpose: this.fg.value.purpose,
            locations: locations || [],
            custom_properties: customProperties || [],
            num_files: isPolicyEtxn
              ? res.attachments && res.attachments.length
              : this.activatedRoute.snapshot.params.dataUrl
              ? 1
              : 0,
            ...policyProps,
            org_user_id: etxn.tx.org_user_id,
            from_dt: this.fg.value.from_dt && this.dateService.getUTCDate(new Date(this.fg.value.from_dt)),
            to_dt: this.fg.value.to_dt && this.dateService.getUTCDate(new Date(this.fg.value.to_dt)),
            flight_journey_travel_class: this.fg.value.flight_journey_travel_class,
            flight_return_travel_class: this.fg.value.flight_return_travel_class,
            train_travel_class: this.fg.value.train_travel_class,
            bus_travel_class: this.fg.value.bus_travel_class,
            distance: this.fg.value.distance,
            distance_unit: this.fg.value.distance_unit,
            hotel_is_breakfast_provided: this.fg.value.hotel_is_breakfast_provided,
            user_reason_for_duplicate_expenses: this.fg.value.duplicate_detection_reason,
            ...costCenter,
          },
          ou: etxn.ou,
          dataUrls: [].concat(this.newExpenseDataUrls),
        };
      })
    );
  }

  checkPolicyViolation(etxn) {
    // Prepare etxn object with just tx and ou object required for test call
    return from(this.authService.getEou()).pipe(
      switchMap((currentEou) => {
        const policyETxn = {
          tx: cloneDeep(etxn.tx),
          ou: cloneDeep(etxn.ou),
        };

        if (!etxn.tx.id) {
          policyETxn.ou = currentEou.ou;
        }
        /* Adding number of attachements and sending in test call as tx_num_files
         * If editing an expense with receipts, check for already uploaded receipts
         */
        if (etxn.tx) {
          policyETxn.tx.num_files = etxn.tx.num_files;

          // Check for receipts uploaded from mobile
          if (etxn.dataUrls && etxn.dataUrls.length > 0) {
            policyETxn.tx.num_files = etxn.tx.num_files + etxn.dataUrls.length;
          }
        }

        policyETxn.tx.is_matching_ccc_expense = !!this.selectedCCCTransaction;

        return this.offlineService.getAllEnabledCategories().pipe(
          map((categories: any[]) => {
            // policy engine expects org_category and sub_category fields
            if (policyETxn.tx.org_category_id) {
              const orgCategory = categories.find((cat) => cat.id === policyETxn.tx.org_category_id);
              policyETxn.tx.org_category = orgCategory && orgCategory.name;
              policyETxn.tx.sub_category = orgCategory && orgCategory.sub_category;
            } else {
              policyETxn.tx.org_category_id = null;
              policyETxn.tx.sub_category = null;
              policyETxn.tx.org_category = null;
            }

            // Flatten the etxn obj
            return this.dataTransformService.etxnRaw(policyETxn);
          })
        );
      }),
      switchMap((policyETxn) => this.transactionService.testPolicy(policyETxn))
    );
  }

  getCustomFields() {
    return this.customInputs$.pipe(
      take(1),
      map((customInputs) =>
        customInputs.map((customInput, i) => ({
          id: customInput.id,
          mandatory: customInput.mandatory,
          name: customInput.name,
          options: customInput.options,
          placeholder: customInput.placeholder,
          prefix: customInput.prefix,
          type: customInput.type,
          value: this.fg.value.custom_inputs[i].value,
        }))
      )
    );
  }

  // public findInvalidControlsRecursive(formToInvestigate:FormGroup|FormArray):string[] {
  //   var invalidControls:string[] = [];
  //   let recursiveFunc = (form:FormGroup|FormArray) => {
  //     Object.keys(form.controls).forEach(field => {
  //       const control = form.get(field);
  //       if (control.invalid) invalidControls.push(field);
  //       if (control instanceof FormGroup) {
  //         recursiveFunc(control);
  //       } else if (control instanceof FormArray) {
  //         recursiveFunc(control);
  //       }
  //     });
  //   }
  //   recursiveFunc(formToInvestigate);
  //   return invalidControls;
  // }

  async reloadCurrentRoute() {
    await this.router.navigateByUrl('/enterprise/my_expenses', { skipLocationChange: true });
    await this.router.navigate(['/', 'enterprise', 'add_edit_expense']);
  }

  addToNewReport(txnId: string) {
    const that = this;
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.transactionService.getEtxn(txnId)),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe((etxn) => {
        const criticalPolicyViolated = isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001;
        if (!criticalPolicyViolated) {
          that.router.navigate(['/', 'enterprise', 'my_create_report', { txn_ids: JSON.stringify([txnId]) }]);
        } else {
          that.goBack();
        }
      });
  }

  showAddToReportSuccessToast(reportId: string) {
    const toastMessageData = {
      message: 'Expense added to report successfully',
      redirectionText: 'View Report',
    };
    const expensesAddedToReportSnackBar = this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
      panelClass: ['msb-success-with-camera-icon'],
    });
    this.trackingService.showToastMessage({ ToastContent: toastMessageData.message });

    expensesAddedToReportSnackBar.onAction().subscribe(() => {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: reportId, navigateBack: true }]);
    });
  }

  saveExpense() {
    const that = this;

    that
      .checkIfInvalidPaymentMode()
      .pipe(take(1))
      .subscribe((invalidPaymentMode) => {
        const saveIncompleteExpense =
          that.activatedRoute.snapshot.params.dataUrl &&
          !that.fg.controls.add_to_new_report.value &&
          !that.fg.value.report?.rp?.id;
        if (saveIncompleteExpense || (that.fg.valid && !invalidPaymentMode)) {
          if (that.mode === 'add') {
            if (that.isCreatedFromPersonalCard) {
              that.saveAndMatchWithPersonalCardTxn();
            } else {
              if (saveIncompleteExpense && !that.fg.valid) {
                this.trackingService.saveReceiptWithInvalidForm();
              }

              that.addExpense('SAVE_EXPENSE').subscribe((res: any) => {
                if (that.fg.controls.add_to_new_report.value && res && res.transaction) {
                  this.addToNewReport(res.transaction.id);
                } else if (that.fg.value.report && that.fg.value.report.rp && that.fg.value.report.rp.id) {
                  that.goBack();
                  this.showAddToReportSuccessToast(that.fg.value.report.rp.id);
                } else {
                  that.goBack();
                }
              });
            }
          } else {
            // to do edit
            that.editExpense('SAVE_EXPENSE').subscribe((res) => {
              if (that.fg.controls.add_to_new_report.value && res && res.id) {
                this.addToNewReport(res.id);
              } else if (that.fg.value.report && that.fg.value.report.rp && that.fg.value.report.rp.id) {
                that.goBack();
                this.showAddToReportSuccessToast(that.fg.value.report.rp.id);
              } else {
                that.goBack();
              }
            });
          }
        } else {
          that.fg.markAllAsTouched();
          const formContainer = that.formContainer.nativeElement as HTMLElement;
          if (formContainer) {
            const invalidElement = formContainer.querySelector('.ng-invalid');
            if (invalidElement) {
              invalidElement.scrollIntoView({
                behavior: 'smooth',
              });
            }
          }

          if (invalidPaymentMode) {
            that.invalidPaymentMode = true;
            setTimeout(() => {
              that.invalidPaymentMode = false;
            }, 3000);
          }
        }
      });
  }

  saveAndNewExpense() {
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
          that.fg.markAllAsTouched();
          const formContainer = that.formContainer.nativeElement as HTMLElement;
          if (formContainer) {
            const invalidElement = formContainer.querySelector('.ng-invalid');
            if (invalidElement) {
              invalidElement.scrollIntoView({
                behavior: 'smooth',
              });
            }
          }
          if (invalidPaymentMode) {
            that.invalidPaymentMode = true;
            setTimeout(() => {
              that.invalidPaymentMode = false;
            }, 3000);
          }
        }
      });
  }

  saveExpenseAndGotoPrev() {
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
      that.fg.markAllAsTouched();
      const formContainer = that.formContainer.nativeElement as HTMLElement;
      if (formContainer) {
        const invalidElement = formContainer.querySelector('.ng-invalid');
        if (invalidElement) {
          invalidElement.scrollIntoView({
            behavior: 'smooth',
          });
        }
      }
    }
  }

  saveExpenseAndGotoNext() {
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
      that.fg.markAllAsTouched();
      const formContainer = that.formContainer.nativeElement as HTMLElement;
      if (formContainer) {
        const invalidElement = formContainer.querySelector('.ng-invalid');
        if (invalidElement) {
          invalidElement.scrollIntoView({
            behavior: 'smooth',
          });
        }
      }
    }
  }

  async continueWithCriticalPolicyViolation(criticalPolicyViolations: string[]) {
    const fyCriticalPolicyViolationPopOver = await this.popoverController.create({
      component: FyCriticalPolicyViolationComponent,
      componentProps: {
        criticalViolationMessages: criticalPolicyViolations,
      },
      cssClass: 'pop-up-in-center',
    });

    await fyCriticalPolicyViolationPopOver.present();

    const { data } = await fyCriticalPolicyViolationPopOver.onWillDismiss();
    return !!data;
  }

  async continueWithPolicyViolations(policyViolations: string[], policyActionDescription: string) {
    const currencyModal = await this.modalController.create({
      component: PolicyViolationComponent,
      componentProps: {
        policyViolationMessages: policyViolations,
        policyActionDescription,
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await currencyModal.present();

    const { data } = await currencyModal.onWillDismiss();
    return data;
  }

  trackPolicyCorrections() {
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

  editExpense(redirectedFrom) {
    this.saveExpenseLoader = redirectedFrom === 'SAVE_EXPENSE';
    this.saveAndNewExpenseLoader = redirectedFrom === 'SAVE_AND_NEW_EXPENSE';
    this.saveAndNextExpenseLoader = redirectedFrom === 'SAVE_AND_NEXT_EXPENSE';
    this.saveAndPrevExpenseLoader = redirectedFrom === 'SAVE_AND_PREV_EXPENSE';

    this.trackPolicyCorrections();

    const customFields$ = this.getCustomFields();

    return this.generateEtxnFromFg(this.etxn$, customFields$, true).pipe(
      switchMap((etxn) => {
        const policyViolations$ = this.checkPolicyViolation(etxn).pipe(shareReplay(1));
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
          map((policyViolations: any) => [
            this.policyService.getPolicyRules(policyViolations),
            policyViolations &&
              policyViolations.transaction_desired_state &&
              policyViolations.transaction_desired_state.action_description,
          ]),
          switchMap(([policyViolations, policyActionDescription]) => {
            if (policyViolations.length > 0) {
              return throwError({
                type: 'policyViolations',
                policyViolations,
                policyActionDescription,
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
      catchError((err) => {
        if (err.status === 500) {
          return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
            map((innerEtxn) => ({ etxn: innerEtxn, comment: null }))
          );
        }
        if (err.type === 'criticalPolicyViolations') {
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
        } else if (err.type === 'policyViolations') {
          return from(this.loaderService.hideLoader()).pipe(
            switchMap(() => this.continueWithPolicyViolations(err.policyViolations, err.policyActionDescription)),
            switchMap((continueWithTransaction) => {
              if (continueWithTransaction) {
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
        } else {
          return throwError(err);
        }
      }),
      switchMap(({ etxn, comment }: any) =>
        forkJoin({
          eou: from(this.authService.getEou()),
          txnCopy: this.etxn$,
        }).pipe(
          switchMap(({ eou, txnCopy }) => {
            if (!isEqual(etxn.tx, txnCopy)) {
              // only if the form is edited
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
                  etxn.tx.cost_center_id &&
                  this.presetCostCenterId &&
                  etxn.tx.cost_center_id === this.presetCostCenterId,
                Used_Autofilled_Currency:
                  (etxn.tx.currency || etxn.tx.orig_currency) &&
                  this.presetCurrency &&
                  (etxn.tx.currency === this.presetCurrency || etxn.tx.orig_currency === this.presetCurrency),
              });
            } else {
              // tracking expense closed without editing
              this.trackingService.viewExpense({ Type: 'Receipt' });
            }

            // NOTE: This double call is done as certain fields will not be present in return of upsert call. policy_amount in this case.
            return this.transactionService.upsert(etxn.tx).pipe(
              switchMap((txn) => this.transactionService.getETxn(txn.id)),
              map((savedEtxn) => savedEtxn && savedEtxn.tx),
              switchMap((tx) => {
                const selectedReportId = this.fg.value.report && this.fg.value.report.rp && this.fg.value.report.rp.id;
                const criticalPolicyViolated = isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001;
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
                const criticalPolicyViolated = isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001;
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
          if (transaction.corporate_credit_card_expense_group_id !== this.selectedCCCTransaction.id) {
            return this.transactionService
              .unmatchCCCExpense(transaction.id, this.matchedCCCTransaction.id)
              .pipe(
                switchMap(() => this.transactionService.matchCCCExpense(transaction.id, this.selectedCCCTransaction.id))
              );
          }
        }

        // Case is for unmatching a matched expense
        if (!this.selectedCCCTransaction && transaction.corporate_credit_card_expense_group_id) {
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

  getTimeSpentOnPage() {
    const expenseEndTime = new Date().getTime();
    // Get time spent on page in seconds
    return (expenseEndTime - this.expenseStartTime) / 1000;
  }

  trackAddExpense() {
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

  addExpense(redirectedFrom) {
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
              const policyViolations$ = this.checkPolicyViolation(etxn).pipe(shareReplay(1));
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
                map((policyViolations: any) => [
                  this.policyService.getPolicyRules(policyViolations),
                  policyViolations &&
                    policyViolations.transaction_desired_state &&
                    policyViolations.transaction_desired_state.action_description,
                ]),
                switchMap(([policyViolations, policyActionDescription]) => {
                  if (policyViolations.length > 0) {
                    return throwError({
                      type: 'policyViolations',
                      policyViolations,
                      policyActionDescription,
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
      catchError((err) => {
        if (err.status === 500) {
          return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(map((etxn) => ({ etxn })));
        }

        if (err.type === 'criticalPolicyViolations') {
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
        } else if (err.type === 'policyViolations') {
          return from(this.loaderService.hideLoader()).pipe(
            switchMap(() => this.continueWithPolicyViolations(err.policyViolations, err.policyActionDescription)),
            switchMap((continueWithTransaction) => {
              if (continueWithTransaction) {
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
        } else {
          return throwError(err);
        }
      }),
      switchMap(({ etxn, comment }: any) =>
        from(this.authService.getEou()).pipe(
          switchMap((eou) => {
            const comments = [];
            const isInstaFyleExpense = !!this.activatedRoute.snapshot.params.dataUrl;
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

            if (comment) {
              comments.push(comment);
            }
            if (this.selectedCCCTransaction) {
              etxn.tx.matchCCCId = this.selectedCCCTransaction.id;
            }

            let reportId;
            if (
              this.fg.value.report &&
              (etxn.tx.policy_amount === null || (etxn.tx.policy_amount && !(etxn.tx.policy_amount < 0.0001)))
            ) {
              reportId = this.fg.value.report.rp.id;
            }
            let entry;
            if (this.fg.value.add_to_new_report) {
              entry = {
                comments,
                reportId,
              };
            }

            etxn.dataUrls = etxn.dataUrls.map((data) => {
              let attachmentType = 'image';

              if (data.type === 'application/pdf' || data.type === 'pdf') {
                attachmentType = 'pdf';
              }

              data.type = attachmentType;

              return data;
            });

            /**
             * NOTE: expense will be sync only if we are redirected to expense page, or else it will be in the outbox (storage service)
             * if (this.fg.value.add_to_new_report i.e entry) is present we will sync to the expense page list
             * else if (if the expense is created from ccc page) we need to sync expense than only
             *        the count on ccc page for classified and unclassified expense will be updated
             * else (this will be the case of normal expense) we are adding entry but not syncing as it will be
             *        redirected to expense page at the end and sync will take place
             */
            if (entry) {
              return from(
                this.transactionOutboxService.addEntryAndSync(etxn.tx, etxn.dataUrls, entry.comments, entry.reportId)
              );
            } else if (this.activatedRoute.snapshot.params.bankTxn) {
              return from(this.transactionOutboxService.addEntryAndSync(etxn.tx, etxn.dataUrls, comments, reportId));
            } else {
              let receiptsData = null;
              if (this.receiptsData) {
                receiptsData = {
                  linked_by: eou.ou.id,
                  receipt_id: this.receiptsData.receiptId,
                  fileId: this.receiptsData.fileId,
                };
              }
              return this.isConnected$.pipe(
                take(1),
                switchMap((isConnected) => {
                  if (!isConnected) {
                    etxn.tx.source += '_OFFLINE';
                  }

                  return of(
                    this.transactionOutboxService.addEntry(
                      etxn.tx,
                      etxn.dataUrls,
                      comments,
                      reportId,
                      null,
                      receiptsData
                    )
                  );
                })
              );
            }
          })
        )
      ),
      finalize(() => {
        this.saveExpenseLoader = false;
        this.saveAndNewExpenseLoader = false;
        this.saveAndNextExpenseLoader = false;
        this.saveAndPrevExpenseLoader = false;
      })
    );
  }

  closeAddEditExpenses() {
    this.router.navigate(['/', 'enterprise', 'my_expenses']);
  }

  async getParsedReceipt(base64Image, fileType) {
    const parsedData: any = await this.transactionOutboxService.parseReceipt(base64Image, fileType);
    const homeCurrency = await this.offlineService.getHomeCurrency().toPromise();

    if (parsedData && parsedData.data && parsedData.data.currency && homeCurrency !== parsedData.data.currency) {
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

  parseFile(fileInfo) {
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
            imageData: from(this.getParsedReceipt(base64Image, fileType)),
            filteredCategories: this.filteredCategories$.pipe(take(1)),
            homeCurrency: this.offlineService.getHomeCurrency(),
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
          this.inpageExtractedData = mergeWith({}, this.inpageExtractedData, imageData.data, (currentValue, newValue) =>
            isNull(currentValue) ? newValue : currentValue
          );
        }

        if (!this.fg.controls.currencyObj.value.amount && extractedData.amount && extractedData.currency) {
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

        if (extractedData.date && this.dateService.isSameDate(this.fg.controls.dateOfSpend.value, new Date())) {
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
        if ((!this.fg.controls.category.value || this.presetCategoryId) && extractedData.category) {
          const categoryName = extractedData.category || 'Unspecified';
          const category = filteredCategories.find((orgCategory) => orgCategory.value.fyle_category === categoryName);
          this.fg.patchValue({
            category: category && category.value,
          });
        }
      });
  }

  attachReceipts(data) {
    if (data) {
      const fileInfo = {
        type: data.type,
        url: data.dataUrl,
        thumbnail: data.dataUrl,
      };
      if (this.mode === 'add') {
        const fileInfo = {
          type: data.type,
          url: data.dataUrl,
          thumbnail: data.dataUrl,
        };
        this.newExpenseDataUrls.push(fileInfo);
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
            this.parseFile(fileInfo);
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
        from(this.transactionOutboxService.fileUpload(data.dataUrl, attachmentType))
          .pipe(
            switchMap((fileObj: any) => {
              fileObj.transaction_id = this.activatedRoute.snapshot.params.id;
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
              this.parseFile(fileInfo);
            }
          });
      }
    }
  }

  async addAttachments(event) {
    event.stopPropagation();
    let fileData;

    if (this.platform.is('ios')) {
      const nativeElement = this.fileUpload.nativeElement as HTMLInputElement;
      nativeElement.onchange = async () => {
        const file = nativeElement.files[0];
        if (file) {
          const dataUrl = await this.fileService.readFile(file);
          fileData = {
            type: file.type,
            dataUrl,
            actionSource: 'gallery_upload',
          };
          this.attachReceipts(fileData);
        }
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
        this.isCameraShown = true;

        const { data } = await captureReceiptModal.onWillDismiss();
        this.isCameraShown = false;

        if (data && data.dataUrl) {
          receiptDetails = {
            type: this.fileService.getImageTypeFromDataUrl(data.dataUrl),
            dataUrl: data.dataUrl,
            actionSource: 'camera',
          };
        }
      }
      if (receiptDetails && receiptDetails.dataUrl) {
        this.attachReceipts(receiptDetails);
        const message = 'Receipt added to Expense successfully';
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', { message }),
          panelClass: ['msb-success-with-camera-icon'],
        });
        this.trackingService.showToastMessage({ ToastContent: message });
      }
    }
  }

  getReceiptExtension(name) {
    let res = null;

    if (name) {
      const filename = name.toLowerCase();
      const idx = filename.lastIndexOf('.');

      if (idx > -1) {
        res = filename.substring(idx + 1, filename.length);
      }
    }

    return res;
  }

  getReceiptDetails(file) {
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

  viewAttachments() {
    const editExpenseAttachments = this.etxn$.pipe(
      switchMap((etxn) => this.fileService.findByTransactionId(etxn.tx.id)),
      switchMap((fileObjs) => from(fileObjs)),
      concatMap((fileObj: any) =>
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
      reduce((acc, curr) => acc.concat(curr), [])
    );

    const addExpenseAttachments = of(
      this.newExpenseDataUrls.map((fileObj) => {
        fileObj.type = fileObj.type === 'application/pdf' || fileObj.type === 'pdf' ? 'pdf' : 'image';
        return fileObj;
      })
    );

    const attachements$ = iif(() => this.mode === 'add', addExpenseAttachments, editExpenseAttachments);

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
          presentingElement: await this.modalController.getTop(),
        });

        await attachmentsModal.present();

        const { data } = await attachmentsModal.onWillDismiss();

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

  async deleteExpense(reportId?: string) {
    const id = this.activatedRoute.snapshot.params.id;
    const header = reportId && this.isRedirectedFromReport ? 'Remove Expense' : 'Delete Expense';
    const body =
      reportId && this.isRedirectedFromReport
        ? 'Are you sure you want to remove this expense from this report?'
        : 'Are you sure you want to delete this expense?';
    const ctaText = reportId && this.isRedirectedFromReport ? 'Remove' : 'Delete';
    const ctaLoadingText = reportId && this.isRedirectedFromReport ? 'Removing' : 'Deleting';

    const deletePopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header,
        body,
        ctaText,
        ctaLoadingText,
        deleteMethod: () => {
          if (reportId && this.isRedirectedFromReport) {
            return this.reportService.removeTransaction(reportId, id);
          }
          return this.transactionService.delete(id);
        },
      },
    });

    await deletePopover.present();
    const { data } = await deletePopover.onDidDismiss();

    if (data && data.status === 'success') {
      if (this.reviewList && this.reviewList.length && +this.activeIndex < this.reviewList.length - 1) {
        this.reviewList.splice(+this.activeIndex, 1);
        this.transactionService.getETxn(this.reviewList[+this.activeIndex]).subscribe((etxn) => {
          this.goToTransaction(etxn, this.reviewList, +this.activeIndex);
        });
      } else {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    }
  }

  async openCommentsModal() {
    const etxn = await this.etxn$.toPromise();

    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'transactions',
        objectId: etxn.tx.id,
      },
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data && data.updated) {
      this.trackingService.addComment();
    } else {
      this.trackingService.viewComment();
    }
  }

  async setDuplicateBoxOpen(value) {
    this.duplicateBoxOpen = value;

    if (value) {
      await this.trackingService.duplicateDetectionUserActionExpand({
        Page: this.mode === 'add' ? 'Add Expense' : 'Edit Expense',
      });
    } else {
      await this.trackingService.duplicateDetectionUserActionCollapse({
        Page: this.mode === 'add' ? 'Add Expense' : 'Edit Expense',
      });
    }
  }

  hideFields() {
    this.trackingService.hideMoreClicked({
      source: 'Add Edit Expenses page',
    });

    this.isExpandedView = false;
  }

  showFields() {
    this.trackingService.showMoreClicked({
      source: 'Add Edit Expenses page',
    });

    this.isExpandedView = true;
  }

  getPolicyDetails() {
    const txnId = this.activatedRoute.snapshot.params.id;
    if (txnId) {
      from(this.policyService.getPolicyViolationRules(txnId))
        .pipe()
        .subscribe((details) => {
          this.policyDetails = details;
        });
    }
  }

  saveAndMatchWithPersonalCardTxn() {
    this.saveExpenseLoader = true;
    const customFields$ = this.getCustomFields();
    return this.generateEtxnFromFg(this.etxn$, customFields$, true)
      .pipe(
        switchMap((etxn) =>
          this.isConnected$.pipe(
            take(1),
            switchMap((isConnected) => {
              if (isConnected) {
                const policyViolations$ = this.checkPolicyViolation(etxn).pipe(shareReplay(1));
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
                  map((policyViolations: any) => [
                    this.policyService.getPolicyRules(policyViolations),
                    policyViolations &&
                      policyViolations.transaction_desired_state &&
                      policyViolations.transaction_desired_state.action_description,
                  ]),
                  switchMap(([policyViolations, policyActionDescription]) => {
                    if (policyViolations.length > 0) {
                      return throwError({
                        type: 'policyViolations',
                        policyViolations,
                        policyActionDescription,
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
        catchError((err) => {
          if (err.status === 500) {
            return this.generateEtxnFromFg(this.etxn$, customFields$).pipe(map((etxn) => ({ etxn })));
          }

          if (err.type === 'criticalPolicyViolations') {
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
          } else if (err.type === 'policyViolations') {
            return from(this.loaderService.hideLoader()).pipe(
              switchMap(() => this.continueWithPolicyViolations(err.policyViolations, err.policyActionDescription)),
              switchMap((continueWithTransaction) => {
                if (continueWithTransaction) {
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
          } else {
            return throwError(err);
          }
        }),
        switchMap(({ etxn }: any) => {
          const personalCardTxn =
            this.activatedRoute.snapshot.params.personalCardTxn &&
            JSON.parse(this.activatedRoute.snapshot.params.personalCardTxn);
          const externalExpenseId = personalCardTxn.btxn_id;
          return this.transactionService.upsert(etxn.tx).pipe(
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
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', { message: 'Expense created successfully.' }),
          panelClass: ['msb-success'],
        });
        this.router.navigate(['/', 'enterprise', 'personal_cards']);
        this.trackingService.newExpenseCreatedFromPersonalCard();
      });
  }

  uploadAttachments(txnId: string) {
    if (this.newExpenseDataUrls.length > 0) {
      this.newExpenseDataUrls = this.addFileType(this.newExpenseDataUrls);
      const addExpenseAttachments$ = of(this.newExpenseDataUrls);
      return addExpenseAttachments$.pipe(switchMap((fileObjs) => this.uploadMultipleFiles(fileObjs, txnId)));
    } else {
      return of([]);
    }
  }

  addFileType(dataUrls: FileObject[]) {
    const dataUrlsCopy = cloneDeep(dataUrls);
    dataUrlsCopy.map((dataUrl) => {
      dataUrl.type = this.transactionOutboxService.isPDF(dataUrl.type) ? 'pdf' : 'image';
    });

    return dataUrlsCopy;
  }

  uploadMultipleFiles(fileObjs: FileObject[], txnId: string) {
    return forkJoin(fileObjs.map((file) => this.uploadFileAndPostToFileService(file, txnId)));
  }

  postToFileService(fileObj: FileObject, txnId: string) {
    const fileObjCopy = cloneDeep(fileObj);
    fileObjCopy.transaction_id = txnId;
    return this.fileService.post(fileObjCopy);
  }

  uploadFileAndPostToFileService(file: FileObject, txnId: string) {
    return from(this.transactionOutboxService.fileUpload(file.url, file.type)).pipe(
      switchMap((fileObj: any) => this.postToFileService(fileObj, txnId))
    );
  }

  getDuplicateExpenses() {
    if (this.activatedRoute.snapshot.params.id) {
      this.handleDuplicates
        .getDuplicatesByExpense(this.activatedRoute.snapshot.params.id)
        .pipe(
          switchMap((duplicateSets) => {
            const duplicateIds = duplicateSets
              .map((value) => value.transaction_ids)
              .reduce((acc, curVal) => acc.concat(curVal), []);
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
          })
        )
        .subscribe((duplicateExpensesSet) => {
          this.duplicateExpenses = duplicateExpensesSet[0];
        });
    }
  }

  addExpenseDetailsToDuplicateSets(duplicateSet: DuplicateSet, expensesArray: Expense[]) {
    return duplicateSet.transaction_ids.map(
      (expenseId) => expensesArray[expensesArray.findIndex((duplicateTxn: any) => expenseId === duplicateTxn.tx_id)]
    );
  }

  async showSuggestedDuplicates(duplicateExpenses: Expense[]) {
    const currencyModal = await this.modalController.create({
      component: SuggestedDuplicatesComponent,
      componentProps: {
        duplicateExpenses,
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await currencyModal.present();

    const { data } = await currencyModal.onWillDismiss();

    if (data?.action === 'dismissed') {
      this.getDuplicateExpenses();
    }
  }
}
