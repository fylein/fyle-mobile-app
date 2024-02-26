import { getCurrencySymbol } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { cloneDeep, isEqual } from 'lodash';
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
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  shareReplay,
  switchMap,
  take,
  takeUntil,
} from 'rxjs/operators';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { CardAggregateStats } from 'src/app/core/models/card-aggregate-stats.model';
import { Expense } from 'src/app/core/models/expense.model';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { ExpenseFilters } from 'src/app/core/models/platform/expense-filters.model';
import { PlatformCategory } from 'src/app/core/models/platform/platform-category.model';
import { Expense as PlatformExpense } from 'src/app/core/models/platform/v1/expense.model';
import { GetExpenseQueryParam } from 'src/app/core/models/platform/v1/get-expenses-query.model';
import { ReportV1 } from 'src/app/core/models/report-v1.model';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { UniqueCardStats } from 'src/app/core/models/unique-cards-stats.model';
import { UniqueCards } from 'src/app/core/models/unique-cards.model';
import { Transaction } from 'src/app/core/models/v1/transaction.model';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { ExpensesService as SharedExpenseService } from 'src/app/core/services/platform/v1/shared/expenses.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
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

@Component({
  selector: 'app-my-expenses',
  templateUrl: './my-expenses-v2.page.html',
  styleUrls: ['./my-expenses-v2.page.scss'],
})
export class MyExpensesV2Page implements OnInit {
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

  isBulkFyleEnabled$: Observable<boolean>;

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

  openReports$: Observable<ExtendedReport[]>;

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

  isDisabled = false;

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
    private apiV2Service: ApiV2Service,
    private modalProperties: ModalPropertiesService,
    private reportService: ReportService,
    private matBottomSheet: MatBottomSheet,
    private matSnackBar: MatSnackBar,
    private actionSheetController: ActionSheetController,
    private snackbarProperties: SnackbarPropertiesService,
    private tasksService: TasksService,
    private corporateCreditCardService: CorporateCreditCardExpenseService,
    private myExpensesService: MyExpensesService,
    private orgSettingsService: OrgSettingsService,
    private currencyService: CurrencyService,
    private orgUserSettingsService: OrgUserSettingsService,
    private platformHandlerService: PlatformHandlerService,
    private categoriesService: CategoriesService,
    private navController: NavController,
    private expenseService: ExpensesService,
    private sharedExpenseService: SharedExpenseService
  ) {}

  get HeaderState(): typeof HeaderState {
    return HeaderState;
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
  }

  switchOutboxSelectionMode(expense?: Expense): void {
    this.selectionMode = !this.selectionMode;
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
        queryParams.state = 'in.(COMPLETE,DRAFT)';

        if (queryParams['matched_corporate_card_transactions->0->corporate_card_number']) {
          const cardParamsCopy = queryParams['matched_corporate_card_transactions->0->corporate_card_number'] as string;

          queryParams.or = (queryParams.or || []) as string[];
          queryParams.or.push('(matched_corporate_card_transactions->0->corporate_card_number.' + cardParamsCopy + ')');
          delete queryParams['matched_corporate_card_transactions->0->corporate_card_number'];
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
        text: 'Capture Receipt',
        icon: 'assets/svg/camera.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('capture receipts', 'camera_overlay'),
      },
      {
        text: 'Add Manually',
        icon: 'assets/svg/list.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add Expense', 'add_edit_expense'),
      },
    ];

    if (mileageEnabled) {
      that.actionSheetButtons.push({
        text: 'Add Mileage',
        icon: 'assets/svg/mileage.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add Mileage', 'add_edit_mileage'),
      });
    }

    if (isPerDiemEnabled) {
      that.actionSheetButtons.push({
        text: 'Add Per Diem',
        icon: 'assets/svg/calendar.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add Per Diem', 'add_edit_per_diem'),
      });
    }
  }

  getCardDetail(statsResponses: CardAggregateStats[]): UniqueCardStats[] {
    const cardNames: { cardNumber: string; cardName: string }[] = [];
    statsResponses.forEach((response) => {
      const cardDetail = {
        cardNumber: response.key[1].column_value,
        cardName: response.key[0].column_value,
      };
      cardNames.push(cardDetail);
    });
    const uniqueCards = JSON.parse(JSON.stringify(cardNames)) as UniqueCards[];

    return this.corporateCreditCardService.getExpenseDetailsInCards(uniqueCards, statsResponses);
  }

  ionViewWillLeave(): void {
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

  ionViewWillEnter(): void {
    this.isNewReportsFlowEnabled = false;
    this.hardwareBackButton = this.platformHandlerService.registerBackButtonAction(
      BackButtonActionPriority.MEDIUM,
      this.backButtonAction
    );

    this.tasksService.getExpensesTaskCount().subscribe((expensesTaskCount) => {
      this.expensesTaskCount = expensesTaskCount;
    });

    const getOrgUserSettingsService$ = this.orgUserSettingsService.get().pipe(shareReplay(1));

    this.isInstaFyleEnabled$ = getOrgUserSettingsService$.pipe(
      map(
        (orgUserSettings) =>
          orgUserSettings?.insta_fyle_settings?.allowed && orgUserSettings.insta_fyle_settings.enabled
      )
    );

    this.isBulkFyleEnabled$ = getOrgUserSettingsService$.pipe(
      map((orgUserSettings) => orgUserSettings?.bulk_fyle_settings?.enabled)
    );

    this.orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));
    this.specialCategories$ = this.categoriesService.getMileageOrPerDiemCategories().pipe(shareReplay(1));

    this.isMileageEnabled$ = this.orgSettings$.pipe(map((orgSettings) => orgSettings?.mileage?.enabled));
    this.isPerDiemEnabled$ = this.orgSettings$.pipe(map((orgSettings) => orgSettings?.per_diem?.enabled));

    this.orgSettings$.subscribe((orgSettings) => {
      this.isNewReportsFlowEnabled = orgSettings?.simplified_report_closure_settings?.enabled || false;
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
        switchMap(() => this.corporateCreditCardService.getAssignedCards())
      )
      .subscribe((allCards) => {
        const cards = this.getCardDetail(allCards.cardDetails);
        cards.forEach((card) => {
          this.cardNumbers.push({ label: this.maskNumber.transform(card.cardNumber), value: card.cardNumber });
        });
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
        const queryParams = params.queryParams || {};

        queryParams.report_id = queryParams.report_id || 'is.null';
        queryParams.state = 'in.(COMPLETE,DRAFT)';

        if (params.searchString) {
          queryParams.q = params.searchString;
          queryParams.q = queryParams.q + ':*';
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

    this.myExpenses$ = paginatedPipe.pipe(shareReplay(1));

    this.count$ = this.loadExpenses$.pipe(
      switchMap((params) => {
        const queryParams = params.queryParams || {};

        queryParams.report_id = queryParams.report_id || 'is.null';
        queryParams.state = 'in.(COMPLETE,DRAFT)';
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
          state: 'in.(COMPLETE,DRAFT)',
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

    const queryParams = { rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' };

    this.openReports$ = this.reportService.getAllExtendedReports({ queryParams }).pipe(
      map((openReports) =>
        openReports.filter(
          (openReport) =>
            // JSON.stringify(openReport.report_approvals).indexOf('APPROVAL_DONE') -> Filter report if any approver approved this report.
            // Converting this object to string and checking If `APPROVAL_DONE` is present in the string, removing the report from the list
            !openReport.report_approvals ||
            (openReport.report_approvals &&
              !(JSON.stringify(openReport.report_approvals).indexOf('APPROVAL_DONE') > -1))
        )
      )
    );
    this.doRefresh();

    this.checkDeleteDisabled();
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
      event?.target?.complete();
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
    this.transactionService.clearCache().subscribe(() => {
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
    const filterMain = this.myExpensesService.getFilters();
    if (this.cardNumbers?.length > 0) {
      filterMain.push({
        name: 'Cards',
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
        ...this.filters,
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

  async setState(): Promise<void> {
    this.isLoading = true;
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadExpenses$.next(params);
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
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
      this.outboxExpensesToBeDeleted = this.transactionService.getDeletableTxns(this.selectedOutboxExpenses);

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
      this.sharedExpenseService.getReportableExpenses(this.selectedElements).length > 0;

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
          text: 'Exclude and Continue',
          action: 'continue',
        },
        secondaryCta: {
          text: 'Cancel',
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

  async openCreateReportWithSelectedIds(reportType: 'oldReport' | 'newReport'): Promise<void> {
    let selectedElements = cloneDeep(this.selectedElements);
    // Removing offline expenses from the list
    selectedElements = selectedElements.filter((expense) => expense.id);
    if (!selectedElements.length) {
      this.showNonReportableExpenseSelectedToast('Please select one or more expenses to be reported');
      return;
    }
    const expensesWithCriticalPolicyViolations = selectedElements.filter((expense) =>
      this.sharedExpenseService.isCriticalPolicyViolatedExpense(expense)
    );
    const expensesInDraftState = selectedElements.filter((expense) =>
      this.sharedExpenseService.isExpenseInDraft(expense)
    );

    const expensesWithPendingTxns = selectedElements.filter((expense) =>
      this.sharedExpenseService.isExpenseInPendingState(expense)
    );

    const noOfExpensesWithCriticalPolicyViolations = expensesWithCriticalPolicyViolations.length;
    const noOfExpensesInDraftState = expensesInDraftState.length;
    const noOfExpensesWithPendingTxns = expensesWithPendingTxns.length;

    if (noOfExpensesWithCriticalPolicyViolations === selectedElements.length) {
      this.showNonReportableExpenseSelectedToast('You cannot add critical policy violated expenses to a report');
    } else if (noOfExpensesInDraftState === selectedElements.length) {
      this.showNonReportableExpenseSelectedToast('You cannot add draft expenses to a report');
    } else if (
      noOfExpensesWithPendingTxns === selectedElements.length &&
      this.sharedExpenseService.restrictPendingTxnsEnabled
    ) {
      this.showNonReportableExpenseSelectedToast('You can’t add expenses with pending transactions to a report.');
    } else if (!this.isReportableExpensesSelected) {
      this.showNonReportableExpenseSelectedToast(
        'You cannot add draft expenses and critical policy violated expenses to a report'
      );
    } else {
      this.trackingService.addToReport();
      const totalAmountofCriticalPolicyViolationExpenses = expensesWithCriticalPolicyViolations.reduce(
        (prev, current) => {
          const amount = current.amount || current.claim_amount;
          return prev + amount;
        },
        0
      );

      let title = '';
      let message = '';

      if (noOfExpensesWithCriticalPolicyViolations > 0 || noOfExpensesInDraftState > 0) {
        this.homeCurrency$.subscribe(() => {
          if (noOfExpensesWithCriticalPolicyViolations > 0 && noOfExpensesInDraftState > 0) {
            title = `${noOfExpensesWithCriticalPolicyViolations} Critical Policy and \
              ${noOfExpensesInDraftState} Draft Expenses blocking the way`;
            message = `Critical policy blocking these ${noOfExpensesWithCriticalPolicyViolations} expenses worth \
              ${this.homeCurrencySymbol}${totalAmountofCriticalPolicyViolationExpenses} from being submitted. \
              Also ${noOfExpensesInDraftState} other expenses are in draft states.`;
          } else if (noOfExpensesWithCriticalPolicyViolations > 0) {
            title = `${noOfExpensesWithCriticalPolicyViolations} Critical Policy Expenses blocking the way`;
            message = `Critical policy blocking these ${noOfExpensesWithCriticalPolicyViolations} expenses worth \
              ${this.homeCurrencySymbol}${totalAmountofCriticalPolicyViolationExpenses} from being submitted.`;
          } else if (noOfExpensesInDraftState > 0) {
            title = `${noOfExpensesInDraftState} Draft Expenses blocking the way`;
            message = `${noOfExpensesInDraftState} expenses are in draft states.`;
          }
          this.openCriticalPolicyViolationPopOver({ title, message, reportType });
        });
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
    const reportAbleExpenses = this.sharedExpenseService.getReportableExpenses(this.selectedElements);
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
      data: { report: ExtendedReport; message: string };
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

        queryParams.state = 'in.(COMPLETE,DRAFT)';

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

  showAddToReportSuccessToast(config: { message: string; report: ExtendedReport | ReportV1 }): void {
    const toastMessageData = {
      message: config.message,
      redirectionText: 'View Report',
    };
    const expensesAddedToReportSnackBar = this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
      panelClass: ['msb-success-with-camera-icon'],
    });
    this.trackingService.showToastMessage({ ToastContent: config.message });

    this.isReportableExpensesSelected = false;
    this.selectionMode = false;
    this.headerState = HeaderState.base;
    this.doRefresh();

    expensesAddedToReportSnackBar.onAction().subscribe(() => {
      // Mixed data type as CREATE report and GET report API returns different responses
      const reportId = (config.report as ExtendedReport).rp_id || (config.report as ReportV1).id;
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: reportId, navigateBack: true }]);
    });
  }

  addTransactionsToReport(report: ExtendedReport, selectedExpensesId: string[]): Observable<ExtendedReport> {
    return from(this.loaderService.showLoader('Adding transaction to report')).pipe(
      switchMap(() => this.reportService.addTransactions(report.rp_id, selectedExpensesId).pipe(map(() => report))),
      finalize(() => this.loaderService.hideLoader())
    );
  }

  showOldReportsMatBottomSheet(): void {
    const reportAbleExpenses = this.sharedExpenseService.getReportableExpenses(this.selectedElements);
    const selectedExpensesId = reportAbleExpenses.map((expenses) => expenses.id);

    this.openReports$
      .pipe(
        switchMap((openReports) => {
          const addTxnToReportDialog = this.matBottomSheet.open(AddTxnToReportDialogComponent, {
            data: { openReports, isNewReportsFlowEnabled: this.isNewReportsFlowEnabled },
            panelClass: ['mat-bottom-sheet-1'],
          });
          return addTxnToReportDialog.afterDismissed() as Observable<{ report: ExtendedReport }>;
        }),
        switchMap((data) => {
          if (data && data.report) {
            return this.addTransactionsToReport(data.report, selectedExpensesId);
          } else {
            return of(null);
          }
        })
      )
      .subscribe((report: ExtendedReport) => {
        if (report) {
          let message = '';
          if (report.rp_state.toLowerCase() === 'draft') {
            message = 'Expenses added to an existing draft report';
          } else {
            message = 'Expenses added to report successfully';
          }
          this.showAddToReportSuccessToast({ message, report });
        }
      });
  }

  async openActionSheet(): Promise<void> {
    const that = this;
    const actionSheet = await this.actionSheetController.create({
      header: 'ADD EXPENSE',
      mode: 'md',
      cssClass: 'fy-action-sheet',
      buttons: that.actionSheetButtons,
    });
    await actionSheet.present();
  }

  deleteSelectedExpenses(offlineExpenses: Partial<Expense>[]): Observable<Transaction[]> {
    if (offlineExpenses?.length > 0) {
      this.transactionOutboxService.deleteBulkOfflineExpenses(this.pendingTransactions, offlineExpenses);
      return of(null);
    } else {
      this.selectedElements = this.expensesToBeDeleted.filter((expense) => expense.id);
      if (this.selectedElements.length > 0) {
        return this.transactionService.deleteBulk(this.selectedElements.map((selectedExpense) => selectedExpense.id));
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

    const deletePopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: 'Delete Expense',
        body: this.sharedExpenseService.getDeleteDialogBody(
          totalDeleteLength,
          this.cccExpenses,
          expenseDeletionMessage,
          cccExpensesMessage
        ),
        ctaText: totalDeleteLength > 0 && this.cccExpenses > 0 ? 'Exclude and Delete' : 'Delete',
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
            ? '1 expense has been deleted'
            : `${totalNoOfSelectedExpenses} expenses have been deleted`;
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', { message }),
          panelClass: ['msb-success-with-camera-icon'],
        });
        this.trackingService.showToastMessage({ ToastContent: message });
      } else {
        const message = 'We could not delete the expenses. Please try again';
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('failure', { message }),
          panelClass: ['msb-failure-with-camera-icon'],
        });
        this.trackingService.showToastMessage({ ToastContent: message });
      }

      this.isReportableExpensesSelected = false;
      this.selectionMode = false;
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
      } else {
        this.loadExpenses$
          .pipe(
            take(1),
            map((params) => {
              const queryParams = params.queryParams || {};

              queryParams.report_id = queryParams.report_id || 'is.null';
              queryParams.state = 'in.(COMPLETE,DRAFT)';
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
              if (this.outboxExpensesToBeDeleted?.length) {
                this.outboxExpensesToBeDeleted = this.transactionService.getDeletableTxns(
                  this.outboxExpensesToBeDeleted
                );
              }

              this.expensesToBeDeleted = this.sharedExpenseService.excludeCCCExpenses(this.selectedElements);

              this.cccExpenses = this.selectedElements.length - this.expensesToBeDeleted.length;
            }
            this.allExpensesCount = this.selectedElements.length;
            this.isReportableExpensesSelected =
              this.sharedExpenseService.getReportableExpenses(this.selectedElements).length > 0;
            this.setExpenseStatsOnSelect();
          });
      }
    } else {
      this.selectedElements = [];
      this.selectedOutboxExpenses = [];
      this.outboxExpensesToBeDeleted = [];
      this.isReportableExpensesSelected =
        this.sharedExpenseService.getReportableExpenses(this.selectedElements).length > 0;
      this.setExpenseStatsOnSelect();
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
      await this.openFilters('Sort By');
    } else if (filterType === 'splitExpense') {
      await this.openFilters('Split Expense');
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
      page: 'Expenses',
    });
  }

  onTaskClicked(): void {
    const queryParams: Params = { state: 'tasks', tasksFilters: 'expenses' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });
    this.trackingService.tasksPageOpened({
      Asset: 'Mobile',
      from: 'My Expenses',
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
          this.isDisabled =
            this.selectedElements?.length === 0 ||
            !this.expensesToBeDeleted ||
            (this.expensesToBeDeleted?.length === 0 && this.cccExpenses > 0);
        } else if (!isConnected) {
          this.isDisabled = this.selectedOutboxExpenses.length === 0 || !this.outboxExpensesToBeDeleted;
        }
      })
    );
  }
}
