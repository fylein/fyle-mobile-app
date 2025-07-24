import { getCurrencySymbol } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationStart, Params, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { cloneDeep, isEqual, isNumber } from 'lodash';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  concat,
  forkJoin,
  from,
  fromEvent,
  iif,
  noop,
  of,
  timer,
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  filter,
  finalize,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  timeout,
} from 'rxjs/operators';
import { TranslocoService } from '@jsverse/transloco';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { Expense } from 'src/app/core/models/expense.model';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { ExpenseFilters } from 'src/app/core/models/platform/expense-filters.model';
import { PlatformCategory } from 'src/app/core/models/platform/platform-category.model';
import { Expense as PlatformExpense } from 'src/app/core/models/platform/v1/expense.model';
import { GetExpenseQueryParam } from 'src/app/core/models/platform/v1/get-expenses-query.model';
import { UniqueCards } from 'src/app/core/models/unique-cards.model';
import { Transaction } from 'src/app/core/models/v1/transaction.model';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { ExpensesService as SharedExpenseService } from 'src/app/core/services/platform/v1/shared/expenses.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { WalkthroughService } from 'src/app/core/services/walkthrough.service';
import { CreateNewReportComponent } from 'src/app/shared/components/create-new-report-v2/create-new-report.component';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { environment } from 'src/environments/environment';
import { SnackbarPropertiesService } from '../../core/services/snackbar-properties.service';
import { StorageService } from '../../core/services/storage.service';
import { TrackingService } from '../../core/services/tracking.service';
import { FyDeleteDialogComponent } from '../../shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { FilterPill } from '../../shared/components/fy-filter-pills/filter-pill.interface';
import { FilterOptionType } from '../../shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from '../../shared/components/fy-filters/filter-options.interface';
import { FyFiltersComponent } from '../../shared/components/fy-filters/fy-filters.component';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { AddTxnToReportDialogComponent } from './add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import { MyExpensesService } from './my-expenses.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { PromoteOptInModalComponent } from 'src/app/shared/components/promote-opt-in-modal/promote-opt-in-modal.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FeatureConfigService } from 'src/app/core/services/platform/v1/spender/feature-config.service';
import dayjs from 'dayjs';
import { ExpensesQueryParams } from 'src/app/core/models/platform/v1/expenses-query-params.model';
import { ExtendQueryParamsService } from 'src/app/core/services/extend-query-params.service';
import { FooterState } from 'src/app/shared/components/footer/footer-state.enum';
import { FooterService } from 'src/app/core/services/footer.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { driver, DriveStep } from 'driver.js';

@Component({
  selector: 'app-my-expenses',
  templateUrl: './my-expenses.page.html',
  styleUrls: ['./my-expenses.page.scss'],
})
export class MyExpensesPage implements OnInit {
  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef<HTMLInputElement>;

  isConnected$: Observable<boolean>;

  myExpenses$: Observable<PlatformExpense[]>;

  count$: Observable<number>;

  isInfiniteScrollRequired$: Observable<boolean>;

  loadExpenses$: BehaviorSubject<Partial<GetExpenseQueryParam>>;

  currentPageNumber = 1;

  acc: PlatformExpense[] = [];

  filters: Partial<ExpenseFilters>;

  allExpensesStats$: Observable<{ count: number; amount: number }>;

  draftExpensesCount$: Observable<number>;

  homeCurrency$: Observable<string>;

  isInstaFyleEnabled$: Observable<boolean>;

  isMileageEnabled$: Observable<boolean>;

  isPerDiemEnabled$: Observable<boolean>;

  orgSettings$: Observable<OrgSettings>;

  specialCategories$: Observable<PlatformCategory[]>;

  pendingTransactions: Partial<Expense>[] = [];

  selectionMode = false;

  selectedElements: PlatformExpense[];

  selectedOutboxExpenses: Partial<Expense>[] = [];

  syncing = false;

  simpleSearchText = '';

  allExpenseCountHeader$: Observable<number>;

  navigateBack = false;

  openAddExpenseListLoader = false;

  clusterDomain: string;

  isNewUser$: Observable<boolean>;

  isLoading = false;

  headerState: HeaderState = HeaderState.base;

  actionSheetButtons: { text: string; icon: string; cssClass: string; handler: () => void }[] = [];

  selectAll = false;

  filterPills = [];

  reviewMode = false;

  ROUTER_API_ENDPOINT: string;

  isReportableExpensesSelected = false;

  isSearchBarFocused = false;

  openReports$: Observable<Report[]>;

  homeCurrencySymbol: string;

  isLoadingDataInInfiniteScroll: boolean;

  allExpensesCount: number;

  onPageExit$ = new Subject();

  expensesTaskCount = 0;

  isCameraPreviewStarted = false;

  cardNumbers: { label: string; value: string }[] = [];

  maskNumber = new MaskNumber();

  expensesToBeDeleted: PlatformExpense[];

  outboxExpensesToBeDeleted: Partial<Expense>[] = [];

  cccExpenses: number;

  isMergeAllowed: boolean;

  hardwareBackButton: Subscription;

  isNewReportsFlowEnabled = false;

  isDeleteDisabled = false;

  restrictPendingTransactionsEnabled = false;

  optInShowTimer;

  navigationSubscription: Subscription;

  constructor(
    private networkService: NetworkService,
    private loaderService: LoaderService,
    private modalController: ModalController,
    private transactionService: TransactionService,
    private popoverController: PopoverController,
    private router: Router,
    private transactionOutboxService: TransactionsOutboxService,
    private activatedRoute: ActivatedRoute,
    private popupService: PopupService,
    private trackingService: TrackingService,
    private storageService: StorageService,
    private tokenService: TokenService,
    private modalProperties: ModalPropertiesService,
    private matBottomSheet: MatBottomSheet,
    private matSnackBar: MatSnackBar,
    private actionSheetController: ActionSheetController,
    private snackbarProperties: SnackbarPropertiesService,
    private tasksService: TasksService,
    private corporateCreditCardService: CorporateCreditCardExpenseService,
    private myExpensesService: MyExpensesService,
    private orgSettingsService: OrgSettingsService,
    private currencyService: CurrencyService,
    private platformEmployeeSettingsService: PlatformEmployeeSettingsService,
    private platformHandlerService: PlatformHandlerService,
    private categoriesService: CategoriesService,
    private navController: NavController,
    private expenseService: ExpensesService,
    private sharedExpenseService: SharedExpenseService,
    private spenderReportsService: SpenderReportsService,
    private authService: AuthService,
    private utilityService: UtilityService,
    private featureConfigService: FeatureConfigService,
    private extendQueryParamsService: ExtendQueryParamsService,
    private footerService: FooterService,
    private translocoService: TranslocoService,
    private walkthroughService: WalkthroughService
  ) {}

  get HeaderState(): typeof HeaderState {
    return HeaderState;
  }

  get FooterState(): typeof FooterState {
    return FooterState;
  }

  clearText(isFromCancel: string): void {
    this.simpleSearchText = '';
    const searchInput = this.simpleSearchInput.nativeElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
    if (isFromCancel === 'onSimpleSearchCancel') {
      this.isSearchBarFocused = !this.isSearchBarFocused;
    } else {
      this.isSearchBarFocused = !!this.isSearchBarFocused;
    }
  }

  onSearchBarFocus(): void {
    this.isSearchBarFocused = true;
  }

  ngOnInit(): void {
    this.setupNetworkWatcher();
  }

  formatTransactions(transactions: Partial<Transaction>[]): Partial<Expense>[] {
    return transactions.map((transaction) => {
      const formattedTxn = <Partial<Expense>>{};
      Object.keys(transaction).forEach((key: keyof Partial<Transaction>) => {
        formattedTxn['tx_' + key] = transaction[key];
      });
      return formattedTxn;
    });
  }

  switchSelectionMode(expense?: PlatformExpense): void {
    this.selectionMode = !this.selectionMode;
    this.footerService.updateSelectionMode(this.selectionMode);
    if (!this.selectionMode) {
      if (this.loadExpenses$.getValue().searchString) {
        this.headerState = HeaderState.simpleSearch;
      } else {
        this.headerState = HeaderState.base;
      }

      this.selectedElements = [];
      this.setAllExpensesCountAndAmount();
    } else {
      this.headerState = HeaderState.multiselect;
      // setting Expense amount & count stats to zero on select init
      this.allExpensesStats$ = of({
        count: 0,
        amount: 0,
      });
    }

    if (expense) {
      this.selectExpense(expense);
    }

    this.checkDeleteDisabled().pipe(take(1)).subscribe();
  }

  switchOutboxSelectionMode(expense?: Expense): void {
    this.selectionMode = !this.selectionMode;
    this.footerService.updateSelectionMode(this.selectionMode);
    if (!this.selectionMode) {
      if (this.loadExpenses$.getValue().searchString) {
        this.headerState = HeaderState.simpleSearch;
      } else {
        this.headerState = HeaderState.base;
      }

      this.selectedOutboxExpenses = [];
      this.setOutboxExpenseStatsOnSelect();
    } else {
      this.headerState = HeaderState.multiselect;
      // setting Expense amount & count stats to zero on select init
      this.allExpensesStats$ = of({
        count: 0,
        amount: 0,
      });
    }

    if (expense) {
      this.selectOutboxExpense(expense);
    }
  }

  async sendFirstExpenseCreatedEvent(): Promise<void> {
    // checking if the expense is first expense
    const isFirstExpenseCreated = await this.storageService.get('isFirstExpenseCreated');

    // for first expense etxnc size will be 0
    if (!isFirstExpenseCreated) {
      this.allExpensesStats$.subscribe(async (res) => {
        if (res.count === 0) {
          this.trackingService.createFirstExpense();
          await this.storageService.set('isFirstExpenseCreated', true);
        }
      });
    }
  }

  setAllExpensesCountAndAmount(): void {
    this.allExpensesStats$ = this.loadExpenses$.pipe(
      switchMap((params) => {
        const queryParams = cloneDeep(params.queryParams) || {};

        queryParams.report_id = (queryParams.report_id || 'is.null') as string;
        queryParams.state = 'in.(COMPLETE,DRAFT,UNREPORTABLE)';

        if (queryParams.or) {
          const hasExpenseState =
            Array.isArray(queryParams.or) && queryParams.or.some((element) => element.includes('state'));
          if (hasExpenseState) {
            delete queryParams.state;
          }
        }

        return this.expenseService.getExpenseStats(queryParams).pipe(
          map((stats) => ({
            count: stats.data.count,
            amount: stats.data.total_amount,
          }))
        );
      })
    );
  }

  actionSheetButtonsHandler(action: string, route: string) {
    return (): void => {
      this.trackingService.myExpensesActionSheetAction({
        Action: action,
      });
      this.router.navigate([
        '/',
        'enterprise',
        route,
        {
          navigate_back: true,
        },
      ]);
    };
  }

  setupActionSheet(orgSettings: OrgSettings, allowedExpenseTypes: Record<string, boolean>): void {
    const that = this;
    const mileageEnabled = orgSettings.mileage.enabled && allowedExpenseTypes.mileage;
    const isPerDiemEnabled = orgSettings.per_diem.enabled && allowedExpenseTypes.perDiem;
    that.actionSheetButtons = [
      {
        text: this.translocoService.translate('myExpensesPage.actionSheet.captureReceipt'),
        icon: 'assets/svg/camera.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('capture receipts', 'camera_overlay'),
      },
      {
        text: this.translocoService.translate('myExpensesPage.actionSheet.addManually'),
        icon: 'assets/svg/list.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add Expense', 'add_edit_expense'),
      },
    ];

    if (mileageEnabled) {
      that.actionSheetButtons.push({
        text: this.translocoService.translate('myExpensesPage.actionSheet.addMileage'),
        icon: 'assets/svg/mileage.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add mileage', 'add_edit_mileage'),
      });
    }

    if (isPerDiemEnabled) {
      that.actionSheetButtons.push({
        text: this.translocoService.translate('myExpensesPage.actionSheet.addPerDiem'),
        icon: 'assets/svg/calendar.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add per diem', 'add_edit_per_diem'),
      });
    }
  }

  getCardDetail(): Observable<UniqueCards[]> {
    return this.corporateCreditCardService.getCorporateCards().pipe(
      map((cards) => {
        const simplifiedCards = cards.map((card) => ({
          cardNumber: card.card_number,
          cardName: card.bank_name,
          cardNickname: card.nickname,
        }));
        return simplifiedCards;
      })
    );
  }

  ionViewWillLeave(): void {
    clearTimeout(this.optInShowTimer as number);
    this.navigationSubscription?.unsubscribe();
    this.utilityService.toggleShowOptInAfterExpenseCreation(false);
    this.hardwareBackButton.unsubscribe();
    this.onPageExit$.next(null);
  }

  backButtonAction(): void {
    if (this.headerState === HeaderState.multiselect) {
      this.switchSelectionMode();
    } else if (this.headerState === HeaderState.simpleSearch) {
      this.onSimpleSearchCancel();
    } else {
      this.navController.back();
    }
  }

  initClassObservables(): void {
    const fn = (): void => {
      this.backButtonAction();
    };
    const priority = BackButtonActionPriority.MEDIUM;
    this.hardwareBackButton = this.platformHandlerService.registerBackButtonAction(priority, fn);
  }

  ionViewWillEnter(): void {
    this.isNewReportsFlowEnabled = false;
    this.initClassObservables();

    this.checkDeleteDisabled().pipe(takeUntil(this.onPageExit$)).subscribe();

    this.tasksService.getExpensesTaskCount().subscribe((expensesTaskCount) => {
      this.expensesTaskCount = expensesTaskCount;
    });

    const getEmployeeSettings$ = this.platformEmployeeSettingsService.get().pipe(shareReplay(1));

    this.isInstaFyleEnabled$ = getEmployeeSettings$.pipe(
      map(
        (employeeSettings) =>
          employeeSettings?.insta_fyle_settings?.allowed && employeeSettings?.insta_fyle_settings?.enabled
      )
    );

    this.orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));
    this.specialCategories$ = this.categoriesService.getMileageOrPerDiemCategories().pipe(shareReplay(1));

    this.isMileageEnabled$ = this.orgSettings$.pipe(map((orgSettings) => orgSettings?.mileage?.enabled));
    this.isPerDiemEnabled$ = this.orgSettings$.pipe(map((orgSettings) => orgSettings?.per_diem?.enabled));

    this.orgSettings$.subscribe((orgSettings) => {
      this.isNewReportsFlowEnabled = orgSettings?.simplified_report_closure_settings?.enabled || false;
      this.restrictPendingTransactionsEnabled =
        (orgSettings?.corporate_credit_card_settings?.enabled &&
          orgSettings.pending_cct_expense_restriction?.enabled) ||
        false;
    });

    forkJoin({
      orgSettings: this.orgSettings$,
      specialCategories: this.specialCategories$,
    }).subscribe(({ orgSettings, specialCategories }) => {
      const allowedExpenseTypes = {
        mileage: specialCategories.some((category) => category.system_category === 'Mileage'),
        perDiem: specialCategories.some((category) => category.system_category === 'Per Diem'),
      };
      this.setupActionSheet(orgSettings, allowedExpenseTypes);
    });

    forkJoin({
      isConnected: this.isConnected$.pipe(take(1)),
    })
      .pipe(
        filter(({ isConnected }) => isConnected),
        switchMap(() => this.getCardDetail())
      )
      .subscribe((cards) => {
        const cardNumbers: Array<{ label: string; value: string }> = [];
        cards.forEach((card) => {
          const cardNickname = card.cardNickname ? ` (${card.cardNickname})` : '';
          const cardDetail = {
            label: this.maskNumber.transform(card.cardNumber) + cardNickname,
            value: card.cardNumber,
          };
          cardNumbers.push(cardDetail);
        });
        this.cardNumbers = cardNumbers;
      });

    this.headerState = HeaderState.base;

    this.isLoading = true;
    this.reviewMode = false;

    from(this.tokenService.getClusterDomain()).subscribe((clusterDomain) => {
      this.clusterDomain = clusterDomain;
    });

    this.ROUTER_API_ENDPOINT = environment.ROUTER_API_ENDPOINT;

    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;
    this.acc = [];
    this.simpleSearchText = '';

    this.currentPageNumber = 1;

    this.loadExpenses$ = new BehaviorSubject({
      pageNumber: 1,
    });

    this.selectionMode = false;
    this.footerService.updateSelectionMode(this.selectionMode);
    this.selectedElements = [];

    this.syncOutboxExpenses();

    this.isConnected$.pipe(takeUntil(this.onPageExit$.asObservable())).subscribe((connected) => {
      if (connected) {
        this.syncOutboxExpenses();
      }
    });

    const getHomeCurrency$ = this.currencyService.getHomeCurrency().pipe(shareReplay(1));

    this.homeCurrency$ = getHomeCurrency$;

    getHomeCurrency$.subscribe((homeCurrency) => {
      this.homeCurrencySymbol = getCurrencySymbol(homeCurrency, 'wide');
    });

    this.simpleSearchInput.nativeElement.value = '';
    fromEvent<{ srcElement: { value: string } }>(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event) => event.srcElement.value),
        distinctUntilChanged(),
        debounceTime(400)
      )
      .subscribe((searchString) => {
        const currentParams = this.loadExpenses$.getValue();
        currentParams.searchString = searchString;
        this.currentPageNumber = 1;
        currentParams.pageNumber = this.currentPageNumber;

        this.loadExpenses$.next(currentParams);
      });

    const paginatedPipe = this.loadExpenses$.pipe(
      switchMap((params) => {
        let queryParams = params.queryParams || {};

        queryParams.report_id = queryParams.report_id || 'is.null';
        queryParams.state = 'in.(COMPLETE,DRAFT,UNREPORTABLE)';

        if (params.searchString) {
          queryParams = this.extendQueryParamsService.extendQueryParamsForTextSearch(queryParams, params.searchString);
        } else if (params.searchString === '') {
          delete queryParams.q;
        }
        const orderByParams =
          params.sortParam && params.sortDir
            ? `${params.sortParam}.${params.sortDir}`
            : 'spent_at.desc,created_at.desc,id.desc';
        this.isLoadingDataInInfiniteScroll = true;

        return this.expenseService.getExpensesCount(queryParams).pipe(
          switchMap((count) => {
            if (count > (params.pageNumber - 1) * 10) {
              return this.expenseService.getExpenses({
                offset: (params.pageNumber - 1) * 10,
                limit: 10,
                ...queryParams,
                order: orderByParams,
              });
            } else {
              return of([]);
            }
          }),
          map((res) => {
            this.isLoadingDataInInfiniteScroll = false;
            if (this.currentPageNumber === 1) {
              this.acc = [];
            }
            this.acc = this.acc.concat(res as PlatformExpense[]);
            return this.acc;
          })
        );
      })
    );

    /**
     * Observable that manages expenses, including polling for incomplete scans.
     */
    this.myExpenses$ = paginatedPipe.pipe(
      switchMap((expenses) => {
        const dEincompleteExpenseIds = this.filterDEIncompleteExpenses(expenses);

        if (dEincompleteExpenseIds.length === 0) {
          return of(expenses); // All scans are completed
        } else {
          return this.pollDEIncompleteExpenses(dEincompleteExpenseIds, expenses).pipe(
            startWith(expenses),
            timeout(30000)
          );
        }
      }),
      shareReplay(1)
    );

    this.count$ = this.loadExpenses$.pipe(
      switchMap((params) => {
        const queryParams = params.queryParams || {};

        queryParams.report_id = queryParams.report_id || 'is.null';
        queryParams.state = 'in.(COMPLETE,DRAFT,UNREPORTABLE)';
        return this.expenseService.getExpensesCount(queryParams);
      }),
      shareReplay(1)
    );

    this.isNewUser$ = this.expenseService.getExpensesCount({ offset: 0, limit: 200 }).pipe(map((res) => res === 0));

    const paginatedScroll$ = this.myExpenses$.pipe(
      switchMap((etxns) => this.count$.pipe(map((count) => count > etxns.length)))
    );

    this.isInfiniteScrollRequired$ = this.loadExpenses$.pipe(switchMap(() => paginatedScroll$));

    this.setAllExpensesCountAndAmount();

    this.allExpenseCountHeader$ = this.loadExpenses$.pipe(
      switchMap(() =>
        this.expenseService.getExpenseStats({
          state: 'in.(COMPLETE,DRAFT,UNREPORTABLE)',
          report_id: 'is.null',
        })
      ),
      map((stats) => stats.data.count)
    );

    this.draftExpensesCount$ = this.loadExpenses$.pipe(
      switchMap(() =>
        this.expenseService.getExpenseStats({
          state: 'in.(DRAFT)',
          report_id: 'is.null',
        })
      ),
      map((stats) => stats.data.count)
    );

    this.loadExpenses$.subscribe(() => {
      const queryParams: Params = { filters: JSON.stringify(this.filters) };
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
        replaceUrl: true,
      });
    });

    this.myExpenses$.subscribe(noop);
    this.count$.subscribe(noop);
    this.isInfiniteScrollRequired$.subscribe(noop);
    if (this.activatedRoute.snapshot.queryParams.filters) {
      this.filters = Object.assign(
        {},
        this.filters,
        JSON.parse(this.activatedRoute.snapshot.queryParams.filters as string) as Partial<ExpenseFilters>
      );
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();

      this.loadExpenses$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
    } else if (this.activatedRoute.snapshot.params.state) {
      let filters = {};
      if ((this.activatedRoute.snapshot.params.state as string).toLowerCase() === 'needsreceipt') {
        filters = { is_receipt_mandotary: 'eq.true', state: 'NEEDS_RECEIPT' };
      } else if ((this.activatedRoute.snapshot.params.state as string).toLowerCase() === 'policyviolated') {
        filters = {
          is_policy_flagged: 'eq.true',
          or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
          state: 'POLICY_VIOLATED',
        };
      } else if ((this.activatedRoute.snapshot.params.state as string).toLowerCase() === 'cannotreport') {
        filters = { policy_amount: 'lt.0.0001', state: 'CANNOT_REPORT' };
      }
      this.filters = Object.assign({}, this.filters, filters);
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();

      this.loadExpenses$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
    } else {
      this.clearFilters();
    }

    setTimeout(() => {
      this.isLoading = false;
    }, 500);

    const queryParams = { state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' };

    this.openReports$ = this.spenderReportsService
      .getAllReportsByParams(queryParams)
      .pipe(
        map((openReports) =>
          openReports.filter(
            (openReport) =>
              !openReport.approvals ||
              (openReport.approvals &&
                !(JSON.stringify(openReport.approvals.map((approval) => approval.state)).indexOf('APPROVAL_DONE') > -1))
          )
        )
      );
    this.doRefresh();

    const optInModalPostExpenseCreationFeatureConfig = {
      feature: 'OPT_IN_POPUP_POST_EXPENSE_CREATION',
      key: 'OPT_IN_POPUP_SHOWN_COUNT',
    };

    const isRedirectedFromAddExpense = this.activatedRoute.snapshot.queryParams.redirected_from_add_expense as string;

    this.utilityService.canShowOptInModal(optInModalPostExpenseCreationFeatureConfig).subscribe((canShowOptInModal) => {
      if (canShowOptInModal && isRedirectedFromAddExpense) {
        this.utilityService.toggleShowOptInAfterExpenseCreation(true);
        this.setModalDelay();
        this.setNavigationSubscription();
      }
    });

    // Check if status pill walkthrough should be shown
    this.checkAndShowStatusPillWalkthrough();
  }

  private checkAndShowStatusPillWalkthrough(): void {
    // Subscribe to expenses to check if there are any with status pills that need explanation
    this.myExpenses$.pipe(
      take(1),
      switchMap(expenses => {
        // Check if there are any incomplete or blocked expenses that would show status pills
        const hasStatusPills = expenses.some(expense => 
          expense.state === 'DRAFT' || 
          expense.state === 'UNREPORTABLE'
        );
        
        if (hasStatusPills) {
          // Check org settings for new critical policy violation flow
          return this.orgSettings$.pipe(
            take(1),
            switchMap(orgSettings => {
              const isNewFlowEnabled = orgSettings?.is_new_critical_policy_violation_flow_enabled;
              
              if (isNewFlowEnabled) {
                // Check if walkthrough has been shown before
                const statusPillWalkthroughConfig = {
                  feature: 'STATUS_PILL_WALKTHROUGH',
                  key: 'STATUS_PILL_WALKTHROUGH_SHOWN',
                };
                
                return this.featureConfigService.getConfiguration(statusPillWalkthroughConfig).pipe(
                  map(config => {
                    const shouldShow = !(config?.value as { isFinished?: boolean })?.isFinished;
                    return { shouldShow, expenses };
                  })
                );
              }
              
              return of({ shouldShow: false, expenses });
            })
          );
        }
        
        return of({ shouldShow: false, expenses });
      })
    ).subscribe(({ shouldShow, expenses }) => {
      if (shouldShow) {
        // Add a small delay to ensure the page is fully loaded
        setTimeout(() => {
          this.startTour();
        }, 1000);
      }
    });
  }

  onPageClick(): void {
    if (this.optInShowTimer) {
      clearTimeout(this.optInShowTimer as number);
      this.utilityService.toggleShowOptInAfterExpenseCreation(false);
    }
  }

  async showPromoteOptInModal(): Promise<void> {
    this.trackingService.showOptInModalPostExpenseCreation();

    from(this.authService.getEou()).subscribe(async (eou) => {
      const optInPromotionalModal = await this.modalController.create({
        component: PromoteOptInModalComponent,
        componentProps: {
          extendedOrgUser: eou,
        },
        mode: 'ios',
        ...this.modalProperties.getModalDefaultProperties('promote-opt-in-modal'),
      });

      await optInPromotionalModal.present();

      const optInModalPostExpenseCreationFeatureConfig = {
        feature: 'OPT_IN_POPUP_POST_EXPENSE_CREATION',
        key: 'OPT_IN_POPUP_SHOWN_COUNT',
        value: {
          count: 1,
        },
      };

      this.featureConfigService.saveConfiguration(optInModalPostExpenseCreationFeatureConfig).subscribe(noop);

      const { data } = await optInPromotionalModal.onDidDismiss<{ skipOptIn: boolean }>();

      if (data?.skipOptIn) {
        this.trackingService.skipOptInModalPostExpenseCreation();
      } else {
        this.trackingService.optInFromPostExpenseCreationModal();
      }
    });
  }

  setModalDelay(): void {
    this.optInShowTimer = setTimeout(() => {
      this.showPromoteOptInModal();
    }, 4000);
  }

  setNavigationSubscription(): void {
    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        clearTimeout(this.optInShowTimer as number);

        const optInModalPostExpenseCreationFeatureConfig = {
          feature: 'OPT_IN_POPUP_POST_EXPENSE_CREATION',
          key: 'OPT_IN_POPUP_SHOWN_COUNT',
        };

        const isRedirectedFromAddExpense = this.activatedRoute.snapshot.queryParams
          .redirected_from_add_expense as string;

        this.utilityService.canShowOptInModal(optInModalPostExpenseCreationFeatureConfig).subscribe((isAttemptLeft) => {
          const canShowOptInModal = this.utilityService.canShowOptInAfterExpenseCreation();

          if (isAttemptLeft && isRedirectedFromAddExpense && canShowOptInModal) {
            this.showPromoteOptInModal();
            this.utilityService.toggleShowOptInAfterExpenseCreation(false);
          }
        });
      }
    });
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
  }

  loadData(event: { target?: { complete?: () => void } }): void {
    this.currentPageNumber = this.currentPageNumber + 1;

    const params = this.loadExpenses$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.loadExpenses$.next(params);

    setTimeout(() => {
      event?.target?.complete?.();
    }, 1000);
  }

  syncOutboxExpenses(): void {
    this.pendingTransactions = this.formatTransactions(this.transactionOutboxService.getPendingTransactions());
    if (this.pendingTransactions.length > 0) {
      this.syncing = true;
      from(this.pendingTransactions)
        .pipe(
          switchMap(() => from(this.transactionOutboxService.sync())),
          finalize(() => {
            this.syncing = false;
            const pendingTransactions = this.formatTransactions(this.transactionOutboxService.getPendingTransactions());
            if (pendingTransactions.length === 0) {
              this.doRefresh();
              this.pendingTransactions = [];
            }
          })
        )
        .subscribe(noop);
    }
  }

  doRefresh(event?: { target?: { complete?: () => void } }): void {
    this.currentPageNumber = 1;
    this.selectedElements = [];
    if (this.selectionMode) {
      this.setExpenseStatsOnSelect();
    }
    const params = this.loadExpenses$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.transactionService.clearCache(false).subscribe(() => {
      this.loadExpenses$.next(params);
      if (event) {
        setTimeout(() => {
          event.target?.complete();
        }, 1000);
      }
    });
  }

  generateFilterPills(filter: Partial<ExpenseFilters>): FilterPill[] {
    const filterPills: FilterPill[] = [];

    if (filter.state?.length > 0) {
      this.myExpensesService.generateStateFilterPills(filterPills, filter);
    }

    if (filter.receiptsAttached) {
      this.myExpensesService.generateReceiptsAttachedFilterPills(filterPills, filter);
    }

    if (filter.potentialDuplicates) {
      this.myExpensesService.generatePotentialDuplicatesFilterPills(filterPills, filter);
    }

    if (filter.date) {
      this.myExpensesService.generateDateFilterPills(filter, filterPills);
    }

    if (filter.type?.length > 0) {
      this.myExpensesService.generateTypeFilterPills(filter, filterPills);
    }

    if (filter.sortParam && filter.sortDir) {
      this.myExpensesService.generateSortFilterPills(filter, filterPills);
    }

    if (filter.cardNumbers?.length > 0) {
      this.myExpensesService.generateCardFilterPills(filterPills, filter);
    }

    if (filter.splitExpense) {
      this.myExpensesService.generateSplitExpenseFilterPills(filterPills, filter);
    }

    return filterPills;
  }

  addNewFiltersToParams(): Partial<GetExpenseQueryParam> {
    let currentParams = this.loadExpenses$.getValue();
    currentParams.pageNumber = 1;
    let newQueryParams: Record<string, string | string[] | boolean> = {
      or: [],
    };

    newQueryParams = this.sharedExpenseService.generateCardNumberParams(newQueryParams, this.filters);

    newQueryParams = this.sharedExpenseService.generateDateParams(newQueryParams, this.filters);

    newQueryParams = this.sharedExpenseService.generateReceiptAttachedParams(newQueryParams, this.filters);

    newQueryParams = this.sharedExpenseService.generatePotentialDuplicatesParams(newQueryParams, this.filters);

    newQueryParams = this.sharedExpenseService.generateStateFilters(newQueryParams, this.filters);

    newQueryParams = this.sharedExpenseService.generateTypeFilters(newQueryParams, this.filters);

    currentParams = this.sharedExpenseService.setSortParams(currentParams, this.filters);

    newQueryParams = this.sharedExpenseService.generateSplitExpenseParams(newQueryParams, this.filters);

    currentParams.queryParams = newQueryParams;

    const onlyDraftStateFilterApplied =
      this.filters.state && this.filters.state.length === 1 && this.filters.state.includes('DRAFT');
    const onlyCriticalPolicyFilterApplied =
      this.filters.state?.length === 1 && this.filters.state.includes('CANNOT_REPORT');
    const draftAndCriticalPolicyFilterApplied =
      this.filters.state?.length === 2 &&
      this.filters.state.includes('DRAFT') &&
      this.filters.state.includes('CANNOT_REPORT');

    this.reviewMode = false;
    if (onlyDraftStateFilterApplied || onlyCriticalPolicyFilterApplied || draftAndCriticalPolicyFilterApplied) {
      this.reviewMode = true;
    }

    return currentParams;
  }

  async openFilters(activeFilterInitialName?: string): Promise<void> {
    const orgSettings = await this.orgSettings$.pipe(take(1)).toPromise();
    const filterMain = await this.myExpensesService.getFilters(orgSettings);
    if (this.cardNumbers?.length > 0) {
      filterMain.push({
        name: this.translocoService.translate('myExpensesPage.filters.cardsEndingIn'),
        optionType: FilterOptionType.multiselect,
        options: this.cardNumbers,
      } as FilterOptions<string>);
    }

    const selectedFilters = this.myExpensesService.generateSelectedFilters(this.filters);

    const filterPopover = await this.modalController.create({
      component: FyFiltersComponent,
      componentProps: {
        filterOptions: filterMain,
        selectedFilterValues: selectedFilters,
        activeFilterInitialName,
      },
      cssClass: 'dialog-popover',
    });

    await filterPopover.present();

    const { data } = (await filterPopover.onWillDismiss()) as { data: SelectedFilters<string | string[]>[] };

    if (data) {
      const filters1 = this.myExpensesService.convertSelectedOptionsToExpenseFilters(data);
      this.filters = filters1;

      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();

      this.loadExpenses$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
      this.trackingService.myExpensesFilterApplied({
        filterLabels: Object.keys(this.filters),
      });
    }
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadExpenses$.next(params);
    this.filterPills = this.generateFilterPills(this.filters);
  }

  setExpenseStatsOnSelect(): void {
    this.allExpensesStats$ = of({
      count: this.selectedElements.length,
      amount: this.selectedElements.reduce((acc, txnObj) => acc + txnObj.amount, 0),
    });
  }

  setOutboxExpenseStatsOnSelect(): void {
    this.allExpensesStats$ = of({
      count: this.selectedOutboxExpenses.length,
      amount: this.selectedOutboxExpenses.reduce((acc, txnObj) => acc + txnObj.tx_amount, 0),
    });
  }

  selectOutboxExpense(expense: Expense): void {
    let isSelectedElementsIncludesExpense = false;
    if (expense.tx_id) {
      isSelectedElementsIncludesExpense = this.selectedOutboxExpenses.some((txn) => expense.tx_id === txn.tx_id);
    } else {
      isSelectedElementsIncludesExpense = this.selectedOutboxExpenses.some((txn) => isEqual(txn, expense));
    }

    if (isSelectedElementsIncludesExpense) {
      if (expense.tx_id) {
        this.selectedOutboxExpenses = this.selectedOutboxExpenses.filter((txn) => txn.tx_id !== expense.tx_id);
      } else {
        this.selectedOutboxExpenses = this.selectedOutboxExpenses.filter((txn) => !isEqual(txn, expense));
      }
    } else {
      this.selectedOutboxExpenses.push(expense);
    }
    this.isReportableExpensesSelected =
      this.transactionService.getReportableExpenses(this.selectedOutboxExpenses).length > 0;

    if (this.selectedOutboxExpenses.length > 0) {
      this.outboxExpensesToBeDeleted = this.transactionService.excludeCCCExpenses(this.selectedOutboxExpenses);

      this.cccExpenses = this.selectedOutboxExpenses.length - this.outboxExpensesToBeDeleted.length;
    }

    // setting Expenses count and amount stats on select
    if (this.allExpensesCount === this.selectedOutboxExpenses.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
    this.setOutboxExpenseStatsOnSelect();
    this.isMergeAllowed = this.transactionService.isMergeAllowed(this.selectedOutboxExpenses);
  }

  selectExpense(expense: PlatformExpense): void {
    let isSelectedElementsIncludesExpense = false;
    if (expense.id) {
      isSelectedElementsIncludesExpense = this.selectedElements.some((txn) => expense.id === txn.id);
    } else {
      isSelectedElementsIncludesExpense = this.selectedElements.some((txn) => isEqual(txn, expense));
    }

    if (isSelectedElementsIncludesExpense) {
      if (expense.id) {
        this.selectedElements = this.selectedElements.filter((txn) => txn.id !== expense.id);
      } else {
        this.selectedElements = this.selectedElements.filter((txn) => !isEqual(txn, expense));
      }
    } else {
      this.selectedElements.push(expense);
    }
    this.isReportableExpensesSelected =
      this.sharedExpenseService.getReportableExpenses(this.selectedElements, this.restrictPendingTransactionsEnabled)
        .length > 0;

    if (this.selectedElements.length > 0) {
      this.expensesToBeDeleted = this.sharedExpenseService.excludeCCCExpenses(this.selectedElements);

      this.cccExpenses = this.selectedElements.length - this.expensesToBeDeleted.length;
    }

    // setting Expenses count and amount stats on select
    if (this.allExpensesCount === this.selectedElements.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
    this.setExpenseStatsOnSelect();
    this.isMergeAllowed = this.sharedExpenseService.isMergeAllowed(this.selectedElements);
    this.checkDeleteDisabled().pipe(take(1)).subscribe();
  }

  goToTransaction(event: { expense: PlatformExpense; expenseIndex: number }): void {
    let category: string;

    if (event.expense?.category?.name) {
      category = event.expense.category.name.toLowerCase();
    }

    if (category === 'mileage') {
      this.router.navigate(['/', 'enterprise', 'add_edit_mileage', { id: event.expense.id, persist_filters: true }]);
    } else if (category === 'per diem') {
      this.router.navigate(['/', 'enterprise', 'add_edit_per_diem', { id: event.expense.id, persist_filters: true }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'add_edit_expense', { id: event.expense.id, persist_filters: true }]);
    }
  }

  async openCriticalPolicyViolationPopOver(config: {
    title: string;
    message: string;
    reportType: string;
  }): Promise<void> {
    const criticalPolicyViolationPopOver = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: config.title,
        message: config.message,
        primaryCta: {
          text: this.translocoService.translate('myExpensesPage.criticalPolicyViolation.excludeAndContinue'),
          action: 'continue',
        },
        secondaryCta: {
          text: this.translocoService.translate('myExpensesPage.criticalPolicyViolation.cancel'),
          action: 'cancel',
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await criticalPolicyViolationPopOver.present();

    const { data } = (await criticalPolicyViolationPopOver.onWillDismiss()) as { data: { action: string } };

    if (data && data.action) {
      if (data.action === 'continue') {
        if (config.reportType === 'oldReport') {
          this.showOldReportsMatBottomSheet();
        } else {
          this.showNewReportModal();
        }
      }
    }
  }

  showNonReportableExpenseSelectedToast(message: string): void {
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('failure', { message }),
      panelClass: ['msb-failure-with-report-btn'],
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  isSelectionContainsException(
    policyViolationsCount: number,
    draftCount: number,
    pendingTransactionsCount: number
  ): boolean {
    return (
      policyViolationsCount > 0 ||
      draftCount > 0 ||
      (this.restrictPendingTransactionsEnabled && pendingTransactionsCount > 0)
    );
  }

  unreportableExpenseExceptionHandler(
    draftCount: number,
    policyViolationsCount: number,
    pendingTransactionsCount: number
  ): void {
    // This Map contains different messages based on different conditions , the first character in map key is draft, second is policy violation, third is pending transactions
    // draft, policy, pending
    const toastMessage = new Map([
      ['111', this.translocoService.translate('myExpensesPage.unreportableExpenseExceptionHandler.message111')],
      ['110', this.translocoService.translate('myExpensesPage.unreportableExpenseExceptionHandler.message110')],
      ['101', this.translocoService.translate('myExpensesPage.unreportableExpenseExceptionHandler.message101')],
      ['011', this.translocoService.translate('myExpensesPage.unreportableExpenseExceptionHandler.message011')],
      ['100', this.translocoService.translate('myExpensesPage.unreportableExpenseExceptionHandler.message100')],
      ['010', this.translocoService.translate('myExpensesPage.unreportableExpenseExceptionHandler.message010')],
      ['001', this.translocoService.translate('myExpensesPage.unreportableExpenseExceptionHandler.message001')],
    ]);
    const messageConfig = `${draftCount > 0 ? 1 : 0}${policyViolationsCount > 0 ? 1 : 0}${
      pendingTransactionsCount > 0 ? 1 : 0
    }`;

    if (toastMessage.has(messageConfig)) {
      this.showNonReportableExpenseSelectedToast(toastMessage.get(messageConfig));
    }
    if (pendingTransactionsCount > 0) {
      this.trackingService.spenderSelectedPendingTxnFromMyExpenses();
    }
  }

  reportableExpenseDialogHandler(
    draftCount: number,
    policyViolationsCount: number,
    pendingTransactionsCount: number,
    reportType: 'oldReport' | 'newReport'
  ): void {
    const title = this.translocoService.translate(
      'myExpensesPage.reportableExpenseDialogHandler.cantAddTheseExpensesTitle'
    );
    let message = '';

    if (draftCount > 0) {
      message += `${draftCount} ${
        draftCount > 1
          ? this.translocoService.translate('myExpensesPage.reportableExpenseDialogHandler.expensesAre')
          : this.translocoService.translate('myExpensesPage.reportableExpenseDialogHandler.expenseIs')
      } ${this.translocoService.translate('myExpensesPage.reportableExpenseDialogHandler.inDraftState')}.`;
    }
    if (pendingTransactionsCount > 0) {
      message += `${message.length ? '<br><br>' : ''}${pendingTransactionsCount} ${
        pendingTransactionsCount > 1
          ? this.translocoService.translate('myExpensesPage.reportableExpenseDialogHandler.expenses')
          : this.translocoService.translate('myExpensesPage.reportableExpenseDialogHandler.expense')
      } ${this.translocoService.translate('myExpensesPage.reportableExpenseDialogHandler.withPendingTransactions')}.`;
    }
    if (policyViolationsCount > 0) {
      // Get org settings and handle the policy violation text based on the setting
      this.orgSettings$.pipe(take(1)).subscribe((orgSettings) => {
        const isNewFlowEnabled = orgSettings?.is_new_critical_policy_violation_flow_enabled;
        
        let policyViolationText: string;
        if (isNewFlowEnabled) {
          // Use new blocked state translation keys
          policyViolationText = policyViolationsCount > 1
            ? this.translocoService.translate('myExpensesPage.reportableExpenseDialogHandler.areBlockedState')
            : this.translocoService.translate('myExpensesPage.reportableExpenseDialogHandler.isBlockedState');
        } else {
          // Use existing critical policy violations translation key
          policyViolationText = this.translocoService.translate(
            'myExpensesPage.reportableExpenseDialogHandler.withCriticalPolicyViolations'
          );
        }

        const finalMessage = message + `${message.length ? '<br><br>' : ''}${policyViolationsCount} ${
          policyViolationsCount > 1
            ? this.translocoService.translate('myExpensesPage.reportableExpenseDialogHandler.expenses')
            : this.translocoService.translate('myExpensesPage.reportableExpenseDialogHandler.expense')
        } ${policyViolationText}.`;

        this.openCriticalPolicyViolationPopOver({ title, message: finalMessage, reportType });
      });
      return; // Exit early since we're handling the popover in the subscription
    }

    this.openCriticalPolicyViolationPopOver({ title, message, reportType });
  }

  async openCreateReportWithSelectedIds(reportType: 'oldReport' | 'newReport'): Promise<void> {
    let selectedElements = cloneDeep(this.selectedElements);
    // Removing offline expenses from the list
    selectedElements = selectedElements.filter((expense) => expense.id);
    if (!selectedElements.length) {
      this.showNonReportableExpenseSelectedToast(
        this.translocoService.translate(
          'myExpensesPage.openCreateReportWithSelectedIds.pleaseSelectExpensesToBeReported'
        )
      );
      return;
    }
    const expensesWithCriticalPolicyViolations = selectedElements.filter(
      (expense) =>
        this.sharedExpenseService.isCriticalPolicyViolatedExpense(expense) ||
        this.sharedExpenseService.isExpenseUnreportable(expense)
    );
    const expensesInDraftState = selectedElements.filter((expense) =>
      this.sharedExpenseService.isExpenseInDraft(expense)
    );
    let expensesWithPendingTransactions = [];
    //only handle pending txns if it is enabled from settings
    if (this.restrictPendingTransactionsEnabled) {
      expensesWithPendingTransactions = selectedElements.filter((expense) =>
        this.sharedExpenseService.doesExpenseHavePendingCardTransaction(expense)
      );
    }

    const noOfExpensesWithCriticalPolicyViolations = expensesWithCriticalPolicyViolations.length;
    const noOfExpensesInDraftState = expensesInDraftState.length;
    const noOfExpensesWithPendingTransactions = expensesWithPendingTransactions.length;

    if (!this.isReportableExpensesSelected) {
      this.unreportableExpenseExceptionHandler(
        noOfExpensesInDraftState,
        noOfExpensesWithCriticalPolicyViolations,
        noOfExpensesWithPendingTransactions
      );
    } else {
      this.trackingService.addToReport();
      const totalUnreportableCount =
        noOfExpensesInDraftState + noOfExpensesWithCriticalPolicyViolations + noOfExpensesWithPendingTransactions;

      if (totalUnreportableCount > 0) {
        this.reportableExpenseDialogHandler(
          noOfExpensesInDraftState,
          noOfExpensesWithCriticalPolicyViolations,
          noOfExpensesWithPendingTransactions,
          reportType
        );
      } else {
        if (reportType === 'oldReport') {
          this.showOldReportsMatBottomSheet();
        } else {
          this.showNewReportModal();
        }
      }
    }
  }

  async showNewReportModal(): Promise<void> {
    const reportAbleExpenses = this.sharedExpenseService.getReportableExpenses(
      this.selectedElements,
      this.restrictPendingTransactionsEnabled
    );
    const addExpenseToNewReportModal = await this.modalController.create({
      component: CreateNewReportComponent,
      componentProps: {
        selectedExpensesToReport: reportAbleExpenses,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });
    await addExpenseToNewReportModal.present();

    const { data } = (await addExpenseToNewReportModal.onDidDismiss()) as {
      data: { report: Report; message: string };
    };

    if (data && data.report) {
      this.showAddToReportSuccessToast({ report: data.report, message: data.message });
    }
  }

  openCreateReport(): void {
    this.trackingService.clickCreateReport();
    this.router.navigate(['/', 'enterprise', 'my_create_report']);
  }

  openReviewExpenses(): void {
    const allDataPipe$ = this.loadExpenses$.pipe(
      take(1),
      switchMap((params) => {
        const queryParams = params.queryParams || {};

        queryParams.report_id = queryParams.report_id || 'is.null';

        queryParams.state = 'in.(COMPLETE,DRAFT,UNREPORTABLE)';

        const orderByParams =
          params.sortParam && params.sortDir
            ? `${params.sortParam}.${params.sortDir}`
            : 'spent_at.desc,created_at.desc,id.desc';

        return this.expenseService
          .getAllExpenses({
            queryParams,
            order: orderByParams,
          })
          .pipe(
            map((expenses) =>
              expenses.filter((expense) => {
                if (params.searchString) {
                  return this.filterExpensesBySearchString(expense, params.searchString);
                } else {
                  return true;
                }
              })
            )
          );
      }),
      map((etxns) => etxns.map((etxn) => etxn.id))
    );
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => {
          const txnIds = this.selectedElements.map((expense) => expense.id);
          return iif(() => this.selectedElements.length === 0, allDataPipe$, of(txnIds));
        }),
        switchMap((selectedIds) => {
          const initial = selectedIds[0];
          const allIds = selectedIds;

          return this.expenseService.getExpenseById(initial).pipe(
            map((expense) => ({
              inital: expense,
              allIds,
            }))
          );
        }),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(({ inital, allIds }) => {
        let category: string;

        if (inital.category.name) {
          category = inital.category.name.toLowerCase();
        }

        if (category.includes('mileage')) {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_mileage',
            {
              id: inital.id,
              txnIds: JSON.stringify(allIds),
              activeIndex: 0,
            },
          ]);
        } else if (category.includes('per diem')) {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_per_diem',
            {
              id: inital.id,
              txnIds: JSON.stringify(allIds),
              activeIndex: 0,
            },
          ]);
        } else {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_expense',
            {
              id: inital.id,
              txnIds: JSON.stringify(allIds),
              activeIndex: 0,
            },
          ]);
        }
      });
  }

  filterExpensesBySearchString(expense: PlatformExpense, searchString: string): boolean {
    return Object.values(expense)
      .map((value: keyof PlatformExpense) => value && value.toString().toLowerCase())
      .filter((value) => !!value)
      .some((value) => value.toLowerCase().includes(searchString.toLowerCase()));
  }

  async onAddTransactionToReport(event: { tx_id: string }): Promise<void> {
    const addExpenseToReportModal = await this.modalController.create({
      component: AddTxnToReportDialogComponent,
      componentProps: {
        txId: event.tx_id,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });
    await addExpenseToReportModal.present();

    const { data } = (await addExpenseToReportModal.onDidDismiss()) as { data: { reload: boolean } };
    if (data && data.reload) {
      this.doRefresh();
    }
  }

  showAddToReportSuccessToast(config: { message: string; report: Report }): void {
    const toastMessageData = {
      message: config.message,
      redirectionText: this.translocoService.translate('myExpensesPage.showAddToReportSuccessToast.viewReport'),
    };
    const expensesAddedToReportSnackBar = this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
      panelClass: ['msb-success-with-camera-icon'],
    });
    this.trackingService.showToastMessage({ ToastContent: config.message });

    this.isReportableExpensesSelected = false;
    this.selectionMode = false;
    this.footerService.updateSelectionMode(this.selectionMode);
    this.headerState = HeaderState.base;
    this.doRefresh();

    expensesAddedToReportSnackBar.onAction().subscribe(() => {
      // Mixed data type as CREATE report and GET report API returns different responses
      const reportId = config.report.id;
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: reportId, navigateBack: true }]);
    });
  }

  addTransactionsToReport(report: Report, selectedExpensesId: string[]): Observable<Report> {
    return from(
      this.loaderService.showLoader(this.translocoService.translate('myExpensesPage.loader.addingExpenseToReport'))
    ).pipe(
      switchMap(() => this.spenderReportsService.addExpenses(report.id, selectedExpensesId).pipe(map(() => report))),
      finalize(() => this.loaderService.hideLoader())
    );
  }

  showOldReportsMatBottomSheet(): void {
    const reportAbleExpenses = this.sharedExpenseService.getReportableExpenses(
      this.selectedElements,
      this.restrictPendingTransactionsEnabled
    );
    const selectedExpensesId = reportAbleExpenses.map((expenses) => expenses.id);

    this.openReports$
      .pipe(
        switchMap((openReports) => {
          const addTxnToReportDialog = this.matBottomSheet.open(AddTxnToReportDialogComponent, {
            data: { openReports, isNewReportsFlowEnabled: this.isNewReportsFlowEnabled },
            panelClass: ['mat-bottom-sheet-1'],
          });
          return addTxnToReportDialog.afterDismissed() as Observable<{ report: Report }>;
        }),
        switchMap((data) => {
          if (data && data.report) {
            return this.addTransactionsToReport(data.report, selectedExpensesId);
          } else {
            return of(null);
          }
        })
      )
      .subscribe((report: Report) => {
        if (report) {
          let message = '';
          if (report.state.toLowerCase() === 'draft') {
            message = this.translocoService.translate(
              'myExpensesPage.showOldReportsMatBottomSheet.expensesAddedToExistingDraftReport'
            );
          } else {
            message = this.translocoService.translate(
              'myExpensesPage.showOldReportsMatBottomSheet.expensesAddedToReportSuccess'
            );
          }
          this.showAddToReportSuccessToast({ message, report });
        }
      });
  }

  async openActionSheet(zeroState?: boolean): Promise<void> {
    const that = this;
    if (zeroState) {
      this.trackingService.clickedOnZeroStateAddExpense();
    } else {
      this.trackingService.myExpenseActionSheetAddButtonClicked({ Action: 'Add Expense' });
    }
    const actionSheet = await this.actionSheetController.create({
      header: this.translocoService.translate('myExpensesPage.actionSheet.header'),
      mode: 'md',
      cssClass: 'fy-action-sheet',
      buttons: that.actionSheetButtons,
    });
    await actionSheet.present();
  }

  deleteSelectedExpenses(offlineExpenses: Partial<Expense>[]): Observable<void> {
    if (offlineExpenses?.length > 0) {
      this.transactionOutboxService.deleteBulkOfflineExpenses(this.pendingTransactions, offlineExpenses);
      return of(null);
    } else {
      this.selectedElements = this.expensesToBeDeleted.filter((expense) => expense.id);
      if (this.selectedElements.length > 0) {
        return this.expenseService.deleteExpenses(this.selectedElements.map((selectedExpense) => selectedExpense.id));
      } else {
        return of(null);
      }
    }
  }

  async openDeleteExpensesPopover(): Promise<void> {
    const offlineExpenses = this.outboxExpensesToBeDeleted.filter((expense) => !expense.tx_id);

    let expenseDeletionMessage: string;
    let cccExpensesMessage: string;
    let totalDeleteLength = 0;

    if (offlineExpenses.length > 0) {
      expenseDeletionMessage = this.transactionService.getExpenseDeletionMessage(offlineExpenses);
      cccExpensesMessage = this.transactionService.getCCCExpenseMessage(offlineExpenses, this.cccExpenses);
      totalDeleteLength = this.outboxExpensesToBeDeleted.length;
    } else {
      expenseDeletionMessage = this.sharedExpenseService.getExpenseDeletionMessage(this.expensesToBeDeleted);
      cccExpensesMessage = this.sharedExpenseService.getCCCExpenseMessage(this.expensesToBeDeleted, this.cccExpenses);
      totalDeleteLength = this.expensesToBeDeleted?.length;
    }

    const header = this.translocoService.translate('myExpensesPage.openDeleteExpensesPopover.deleteExpense');
    const ctaText =
      totalDeleteLength > 0 && this.cccExpenses > 0
        ? this.translocoService.translate('myExpensesPage.openDeleteExpensesPopover.excludeAndDelete')
        : this.translocoService.translate('myExpensesPage.openDeleteExpensesPopover.delete');

    const deletePopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header,
        body: this.sharedExpenseService.getDeleteDialogBody(
          totalDeleteLength,
          this.cccExpenses,
          expenseDeletionMessage,
          cccExpensesMessage
        ),
        ctaText,
        disableDelete: totalDeleteLength === 0 ? true : false,
        deleteMethod: () => this.deleteSelectedExpenses(offlineExpenses),
      },
    });

    await deletePopover.present();

    const { data } = (await deletePopover.onDidDismiss()) as { data: { status: string } };

    if (data) {
      this.trackingService.myExpensesBulkDeleteExpenses({
        count: this.selectedElements.length,
      });

      if (data.status === 'success') {
        let totalNoOfSelectedExpenses = 0;
        if (offlineExpenses?.length > 0) {
          totalNoOfSelectedExpenses = offlineExpenses.length + this.selectedElements.length;
        } else {
          totalNoOfSelectedExpenses = this.selectedElements.length;
        }

        const message =
          totalNoOfSelectedExpenses === 1
            ? this.translocoService.translate('myExpensesPage.openDeleteExpensesPopover.oneExpenseDeleted')
            : this.translocoService.translate('myExpensesPage.openDeleteExpensesPopover.expensesDeleted', {
                count: totalNoOfSelectedExpenses,
              });
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', { message }),
          panelClass: ['msb-success-with-camera-icon'],
        });
        this.trackingService.showToastMessage({ ToastContent: message });
      } else {
        const message = this.translocoService.translate(
          'myExpensesPage.openDeleteExpensesPopover.couldNotDeleteExpenses'
        );
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('failure', { message }),
          panelClass: ['msb-failure-with-camera-icon'],
        });
        this.trackingService.showToastMessage({ ToastContent: message });
      }

      this.isReportableExpensesSelected = false;
      this.selectionMode = false;
      this.footerService.updateSelectionMode(this.selectionMode);
      this.headerState = HeaderState.base;

      this.doRefresh();
    }
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedElements = [];
      if (this.pendingTransactions.length > 0) {
        this.selectedOutboxExpenses = this.pendingTransactions;
        this.allExpensesCount = this.pendingTransactions.length;
        this.isReportableExpensesSelected =
          this.transactionService.getReportableExpenses(this.selectedOutboxExpenses).length > 0;
        this.outboxExpensesToBeDeleted = this.selectedOutboxExpenses;
        this.setOutboxExpenseStatsOnSelect();
        this.checkDeleteDisabled().pipe(take(1)).subscribe();
      } else {
        this.loadExpenses$
          .pipe(
            take(1),
            map((params) => {
              const queryParams = params.queryParams || {};

              queryParams.report_id = queryParams.report_id || 'is.null';
              queryParams.state = 'in.(COMPLETE,DRAFT,UNREPORTABLE)';
              if (params.searchString) {
                queryParams.q = params?.searchString + ':*';
              }
              return queryParams;
            }),
            switchMap((queryParams) => this.expenseService.getAllExpenses({ queryParams }))
          )
          .subscribe((allExpenses) => {
            this.selectedElements = this.selectedElements.concat(allExpenses);
            if (this.selectedElements.length > 0) {
              this.expensesToBeDeleted = this.sharedExpenseService.excludeCCCExpenses(this.selectedElements);

              this.cccExpenses = this.selectedElements.length - this.expensesToBeDeleted.length;
            }
            this.allExpensesCount = this.selectedElements.length;
            this.isReportableExpensesSelected =
              this.sharedExpenseService.getReportableExpenses(
                this.selectedElements,
                this.restrictPendingTransactionsEnabled
              ).length > 0;
            this.setExpenseStatsOnSelect();
            this.checkDeleteDisabled().pipe(take(1)).subscribe();
          });
      }
    } else {
      this.selectedElements = [];
      this.selectedOutboxExpenses = [];
      this.outboxExpensesToBeDeleted = [];
      this.isReportableExpensesSelected =
        this.sharedExpenseService.getReportableExpenses(this.selectedElements).length > 0;
      this.setExpenseStatsOnSelect();
      this.checkDeleteDisabled().pipe(take(1)).subscribe();
    }
  }

  onSimpleSearchCancel(): void {
    this.headerState = HeaderState.base;
    this.clearText('onSimpleSearchCancel');
  }

  onFilterPillsClearAll(): void {
    this.clearFilters();
  }

  async onFilterClick(filterType: string): Promise<void> {
    if (filterType === 'state') {
      await this.openFilters('Type');
    } else if (filterType === 'receiptsAttached') {
      await this.openFilters('Receipts Attached');
    } else if (filterType === 'type') {
      await this.openFilters('Expense Type');
    } else if (filterType === 'date') {
      await this.openFilters('Date');
    } else if (filterType === 'sort') {
      await this.openFilters('Sort by');
    } else if (filterType === 'splitExpense') {
      await this.openFilters('Split Expense');
    } else if (filterType === 'potentialDuplicates') {
      await this.openFilters('Potential duplicates');
    } else if (filterType === 'cardNumbers') {
      await this.openFilters('Cards ending in...');
    }
  }

  onFilterClose(filterType: string): void {
    if (filterType === 'sort') {
      delete this.filters.sortDir;
      delete this.filters.sortParam;
    } else {
      delete this.filters[filterType];
    }
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadExpenses$.next(params);
    this.filterPills = this.generateFilterPills(this.filters);
  }

  onHomeClicked(): void {
    const queryParams: Params = { state: 'home' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });

    this.trackingService.footerHomeTabClicked({
      page: this.translocoService.translate('myExpensesPage.onHomeClicked.page'),
    });
  }

  onTaskClicked(): void {
    const queryParams: Params = { state: 'tasks', tasksFilters: 'expenses' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });
    this.trackingService.tasksPageOpened({
      Asset: 'Mobile',
      from: this.translocoService.translate('myExpensesPage.onTaskClicked.from'),
    });
  }

  onCameraClicked(): void {
    this.router.navigate([
      '/',
      'enterprise',
      'camera_overlay',
      {
        navigate_back: true,
      },
    ]);
  }

  searchClick(): void {
    this.headerState = HeaderState.simpleSearch;
    const searchInput = this.simpleSearchInput.nativeElement;
    setTimeout(() => {
      searchInput.focus();
    }, 300);
  }

  mergeExpenses(): void {
    const expenseIDs = this.selectedElements.map((expense) => expense.id);
    this.router.navigate([
      '/',
      'enterprise',
      'merge_expense',
      {
        expenseIDs: JSON.stringify(expenseIDs),
        from: 'MY_EXPENSES',
      },
    ]);
  }

  showCamera(isCameraPreviewStarted: boolean): void {
    this.isCameraPreviewStarted = isCameraPreviewStarted;
  }

  checkDeleteDisabled(): Observable<void> {
    return this.isConnected$.pipe(
      map((isConnected) => {
        if (isConnected) {
          this.isDeleteDisabled =
            this.selectedElements?.length === 0 ||
            !this.expensesToBeDeleted ||
            (this.expensesToBeDeleted?.length === 0 && this.cccExpenses > 0);
        } else if (!isConnected) {
          this.isDeleteDisabled = this.selectedOutboxExpenses.length === 0 || !this.outboxExpensesToBeDeleted;
        }
      })
    );
  }

  startTour(): void {
    // Get the current expenses to pass to the walkthrough service
    this.myExpenses$.pipe(take(1)).subscribe(expenses => {
      const statusPillWalkthroughSteps = this.walkthroughService.newStatusPillWalkthrough(expenses);
      
      // Only start the walkthrough if there are steps to show
      if (statusPillWalkthroughSteps.length === 0) {
        return;
      }
      
      const driverInstance = driver({
        overlayOpacity: 0.5,
        allowClose: true,
        overlayClickBehavior: 'close',
        showProgress: true,
        overlayColor: '#161528',
        stageRadius: 2,
        stagePadding: 16,
        popoverClass: 'custom-popover',
        doneBtnText: 'Got it',
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        // Enable smooth scrolling
        smoothScroll: true,
        // Callback used for the cancel walkthrough button
        onCloseClick: () => {
          this.walkthroughService.setIsOverlayClicked(false);
          driverInstance.destroy();
        },
        //Callback used for registering the active index of the walkthrough
        onDeselected: () => {
          const activeIndex = driverInstance.getActiveIndex();
          if (activeIndex) {
            this.walkthroughService.setActiveWalkthroughIndex(activeIndex);
          }
        },
        // Callback used to check for the next step and finish button
        onNextClick: () => {
          driverInstance.moveNext();
          if (this.walkthroughService.getActiveWalkthroughIndex() === statusPillWalkthroughSteps.length - 1) {
            this.walkthroughService.setIsOverlayClicked(false);
          }
        },
        // Callback used for performing actions when the walkthrough is destroyed
        onDestroyStarted: () => {
          if (this.walkthroughService.getIsOverlayClicked()) {
            driverInstance.destroy();
          } else {
            driverInstance.destroy();
          }
        },
      });

      // Explicitly set the steps
      driverInstance.setSteps(statusPillWalkthroughSteps);
      
      let activeStepIndex = this.walkthroughService.getActiveWalkthroughIndex();

      driverInstance.drive(activeStepIndex);
    });
  }

  private isZeroAmountPerDiemOrMileage(expense: PlatformExpense): boolean {
    return (
      (expense.category.name?.toLowerCase() === 'per diem' || expense.category.name?.toLowerCase() === 'mileage') &&
      (expense.amount === 0 || expense.claim_amount === 0)
    );
  }

  /**
   * Checks if the scan process for an expense has been completed.
   * @param PlatformExpense expense - The expense to check.
   * @returns boolean - True if the scan is complete or if data is manually entered.
   */
  private isExpenseScanComplete(expense: PlatformExpense): boolean {
    const isZeroAmountPerDiemOrMileage = this.isZeroAmountPerDiemOrMileage(expense);

    const hasUserManuallyEnteredData =
      isZeroAmountPerDiemOrMileage ||
      ((expense.amount || expense.claim_amount) && isNumber(expense.amount || expense.claim_amount));
    const isDataExtracted = !!expense.extracted_data;

    // this is to prevent the scan failed from being shown from an indefinite amount of time.
    const hasScanExpired = expense.created_at && dayjs(expense.created_at).diff(Date.now(), 'day') < 0;
    return !!(hasUserManuallyEnteredData || isDataExtracted || hasScanExpired);
  }

  /**
   * Filters the list of expenses to get only those with incomplete scans.
   * @param PlatformExpense[] expenses - The list of expenses to check.
   * @returns string[] - Array of expense IDs that have incomplete scans.
   */
  private filterDEIncompleteExpenses(expenses: PlatformExpense[]): string[] {
    return expenses.filter((expense) => !this.isExpenseScanComplete(expense)).map((expense) => expense.id);
  }

  /**
   * Updates the expenses with polling results.
   * @param PlatformExpense[] initialExpenses - The initial list of expenses.
   * @param PlatformExpense[] updatedExpenses - The updated expenses after polling.
   * @param string[] dEincompleteExpenseIds - Array of expense IDs with incomplete scans.
   * @returns PlatformExpense[] - Updated list of expenses.
   */
  private updateExpensesList(
    initialExpenses: PlatformExpense[],
    updatedExpenses: PlatformExpense[],
    dEincompleteExpenseIds: string[]
  ): PlatformExpense[] {
    const updatedExpensesMap = new Map(updatedExpenses.map((expense) => [expense.id, expense]));

    const newExpensesList = initialExpenses.map((expense) => {
      if (dEincompleteExpenseIds.includes(expense.id)) {
        const updatedExpense = updatedExpensesMap.get(expense.id);
        if (this.isExpenseScanComplete(updatedExpense)) {
          return updatedExpense;
        }
      }
      return expense;
    });

    return newExpensesList;
  }

  /**
   * Polls for expenses that have incomplete scan data.
   * @param dEincompleteExpenseIds - Array of expense IDs with incomplete scans.
   * @param initialExpenses - The initial list of expenses.
   * @returns - Observable that emits updated expenses.
   */
  private pollDEIncompleteExpenses(
    dEincompleteExpenseIds: string[],
    expenses: PlatformExpense[]
  ): Observable<PlatformExpense[]> {
    let updatedExpensesList = expenses;
    // Create a stop signal that emits after 30 seconds
    const stopPolling$ = timer(30000);
    return timer(5000, 5000).pipe(
      exhaustMap(() => {
        const params: ExpensesQueryParams = { queryParams: { id: `in.(${dEincompleteExpenseIds.join(',')})` } };
        return this.expenseService.getExpenses({ ...params.queryParams }).pipe(
          map((updatedExpenses) => {
            updatedExpensesList = this.updateExpensesList(updatedExpensesList, updatedExpenses, dEincompleteExpenseIds);
            dEincompleteExpenseIds = this.filterDEIncompleteExpenses(updatedExpenses);
            return updatedExpensesList;
          })
        );
      }),
      takeWhile(() => dEincompleteExpenseIds.length > 0, true),
      takeUntil(stopPolling$),
      takeUntil(this.onPageExit$)
    );
  }
}
