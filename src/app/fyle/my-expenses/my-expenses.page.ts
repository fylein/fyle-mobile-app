import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import {
  BehaviorSubject,
  concat,
  EMPTY,
  forkJoin,
  from,
  fromEvent,
  iif,
  noop,
  Observable,
  of,
  Subject,
  Subscription,
} from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ActionSheetController, ModalController, PopoverController, NavController } from '@ionic/angular';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  shareReplay,
  switchMap,
  take,
  takeUntil,
  filter,
} from 'rxjs/operators';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { Expense } from 'src/app/core/models/expense.model';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { AddTxnToReportDialogComponent } from './add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import { TrackingService } from '../../core/services/tracking.service';
import { StorageService } from '../../core/services/storage.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { ReportService } from 'src/app/core/services/report.service';
import { cloneDeep, isEqual } from 'lodash';
import { CreateNewReportComponent } from 'src/app/shared/components/create-new-report/create-new-report.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { TokenService } from 'src/app/core/services/token.service';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { environment } from 'src/environments/environment';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { FyDeleteDialogComponent } from '../../shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { FyFiltersComponent } from '../../shared/components/fy-filters/fy-filters.component';
import { FilterOptions } from '../../shared/components/fy-filters/filter-options.interface';
import { FilterOptionType } from '../../shared/components/fy-filters/filter-option-type.enum';
import { FilterPill } from '../../shared/components/fy-filter-pills/filter-pill.interface';
import { getCurrencySymbol } from '@angular/common';
import { SnackbarPropertiesService } from '../../core/services/snackbar-properties.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { MyExpensesService } from './my-expenses.service';
import { ExpenseFilters } from './expense-filters.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { GetExpensesQueryParamsWithFilters } from 'src/app/core/models/get-expenses-query-params-with-filters.model';
import { Transaction } from 'src/app/core/models/v1/transaction.model';
import { Datum } from 'src/app/core/models/v2/stats-response.model';
import { CardAggregateStats } from 'src/app/core/models/card-aggregate-stats.model';
import { UniqueCardStats } from 'src/app/core/models/unique-cards-stats.model';
import { FilterQueryParams } from 'src/app/core/models/filter-query-params.model';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { UniqueCards } from 'src/app/core/models/unique-cards.model';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { PlatformCategory } from 'src/app/core/models/platform/platform-category.model';
import { ReportV1 } from 'src/app/core/models/report-v1.model';
import { GetExpenseQueryParam } from 'src/app/core/models/platform/v1/get-expenses-query.model';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { Expense as PlatformExpense } from 'src/app/core/models/platform/v1/expense.model';

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

  loadData$: BehaviorSubject<Partial<GetExpensesQueryParamsWithFilters>>;

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

  selectedElements: Partial<Expense>[];

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

  expensesToBeDeleted: Partial<Expense>[];

  cccExpenses: number;

  isMergeAllowed: boolean;

  hardwareBackButton: Subscription;

  isNewReportsFlowEnabled = false;

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
    private expenseService: ExpensesService
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

  switchSelectionMode(expense?: Expense): void {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) {
      if (this.loadData$.getValue().searchString) {
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
    this.allExpensesStats$ = this.loadData$.pipe(
      switchMap((params) => {
        const queryParams: FilterQueryParams =
          (JSON.parse(JSON.stringify(params.queryParams)) as FilterQueryParams) || {};

        queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';
        queryParams.tx_state = 'in.(COMPLETE,DRAFT)';

        if (queryParams.corporate_credit_card_account_number) {
          const cardParamsCopy = JSON.parse(JSON.stringify(queryParams.corporate_credit_card_account_number)) as string;
          queryParams.or = queryParams.or || [];
          queryParams.or.push('(corporate_credit_card_account_number.' + cardParamsCopy + ')');
          delete queryParams.corporate_credit_card_account_number;
        }

        return this.transactionService
          .getTransactionStats('count(tx_id),sum(tx_amount)', {
            scalar: true,
            ...queryParams,
          })
          .pipe(
            catchError(() => EMPTY),
            map((stats: Datum[]) => {
              const count = stats[0].aggregates.find((stat) => stat.function_name === 'count(tx_id)');
              const amount = stats[0].aggregates.find((stat) => stat.function_name === 'sum(tx_amount)');
              return {
                count: count.function_value,
                amount: amount.function_value || 0,
              };
            })
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
        icon: 'assets/svg/fy-camera.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('capture receipts', 'camera_overlay'),
      },
      {
        text: 'Add Manually',
        icon: 'assets/svg/fy-expense.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add Expense', 'add_edit_expense'),
      },
    ];

    if (mileageEnabled) {
      that.actionSheetButtons.push({
        text: 'Add Mileage',
        icon: 'assets/svg/fy-mileage.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add Mileage', 'add_edit_mileage'),
      });
    }

    if (isPerDiemEnabled) {
      that.actionSheetButtons.push({
        text: 'Add Per Diem',
        icon: 'assets/svg/fy-calendar.svg',
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
    this.loadData$ = new BehaviorSubject({
      pageNumber: 1,
    });

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
        const currentParams = this.loadData$.getValue();
        currentParams.searchString = searchString;
        this.currentPageNumber = 1;
        currentParams.pageNumber = this.currentPageNumber;
        this.loadData$.next(currentParams);
      });

    const paginatedPipe = this.loadExpenses$.pipe(
      switchMap((params) => {
        const queryParams = params.queryParams || {};

        queryParams.report_id = queryParams.report_id || 'is.null';
        queryParams.state = 'in.(COMPLETE,DRAFT)';
        const orderByParams = params.sortParam && params.sortDir ? `${params.sortParam}.${params.sortDir}` : null;
        this.isLoadingDataInInfiniteScroll = true;

        return this.expenseService.getExpensesCount(queryParams).pipe(
          switchMap((count) => {
            if (count > (params.pageNumber - 1) * 10) {
              return this.expenseService.getExpenses({
                offset: (params.pageNumber - 1) * 10,
                limit: 10,
                queryParams,
                order: orderByParams,
              });
            } else {
              return of({
                data: [],
              });
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

    this.isNewUser$ = this.transactionService.getPaginatedETxncCount().pipe(map((res) => res.count === 0));

    const paginatedScroll$ = this.myExpenses$.pipe(
      switchMap((etxns) => this.count$.pipe(map((count) => count > etxns.length)))
    );

    this.isInfiniteScrollRequired$ = this.loadExpenses$.pipe(switchMap(() => paginatedScroll$));

    this.setAllExpensesCountAndAmount();

    this.allExpenseCountHeader$ = this.loadData$.pipe(
      switchMap(() =>
        this.transactionService.getTransactionStats('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_state: 'in.(COMPLETE,DRAFT)',
          tx_report_id: 'is.null',
        })
      ),
      map((stats) => {
        const count = stats && stats[0] && stats[0].aggregates.find((stat) => stat.function_name === 'count(tx_id)');
        return count && count.function_value;
      })
    );

    this.draftExpensesCount$ = this.loadData$.pipe(
      switchMap(() =>
        this.transactionService.getTransactionStats('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(DRAFT)',
        })
      ),
      map((stats) => {
        const count = stats && stats[0] && stats[0].aggregates.find((stat) => stat.function_name === 'count(tx_id)');
        return count && count.function_value;
      })
    );

    this.loadData$.subscribe(() => {
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
      this.loadData$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
    } else if (this.activatedRoute.snapshot.params.state) {
      let filters = {};
      if ((this.activatedRoute.snapshot.params.state as string).toLowerCase() === 'needsreceipt') {
        filters = { tx_receipt_required: 'eq.true', state: 'NEEDS_RECEIPT' };
      } else if ((this.activatedRoute.snapshot.params.state as string).toLowerCase() === 'policyviolated') {
        filters = {
          tx_policy_flag: 'eq.true',
          or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
          state: 'POLICY_VIOLATED',
        };
      } else if ((this.activatedRoute.snapshot.params.state as string).toLowerCase() === 'cannotreport') {
        filters = { tx_policy_amount: 'lt.0.0001', state: 'CANNOT_REPORT' };
      }
      this.filters = Object.assign({}, this.filters, filters);
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
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
    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.transactionService.clearCache().subscribe(() => {
      this.loadData$.next(params);
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

  addNewFiltersToParams(): Partial<GetExpensesQueryParamsWithFilters> {
    let currentParams = this.loadData$.getValue();
    currentParams.pageNumber = 1;
    let newQueryParams: FilterQueryParams = {
      or: [],
    };

    newQueryParams = this.transactionService.generateCardNumberParams(newQueryParams, this.filters);

    newQueryParams = this.transactionService.generateDateParams(newQueryParams, this.filters);

    newQueryParams = this.transactionService.generateReceiptAttachedParams(newQueryParams, this.filters);

    newQueryParams = this.transactionService.generateStateFilters(newQueryParams, this.filters);

    newQueryParams = this.transactionService.generateTypeFilters(newQueryParams, this.filters);

    currentParams = this.transactionService.setSortParams(currentParams, this.filters);

    newQueryParams = this.transactionService.generateSplitExpenseParams(newQueryParams, this.filters);

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

    const filterPopover = await this.modalController.create({
      component: FyFiltersComponent,
      componentProps: {
        filterOptions: filterMain,
        selectedFilterValues: this.myExpensesService.generateSelectedFilters(this.filters),
        activeFilterInitialName,
      },
      cssClass: 'dialog-popover',
    });

    await filterPopover.present();

    const { data } = (await filterPopover.onWillDismiss()) as { data: SelectedFilters<string | string[]>[] };
    if (data) {
      this.filters = this.myExpensesService.convertFilters(data);
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
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
    this.loadData$.next(params);
    this.filterPills = this.generateFilterPills(this.filters);
  }

  async setState(): Promise<void> {
    this.isLoading = true;
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  setExpenseStatsOnSelect(): void {
    this.allExpensesStats$ = of({
      count: this.selectedElements.length,
      amount: this.selectedElements.reduce((acc, txnObj) => acc + txnObj.tx_amount, 0),
    });
  }

  selectExpense(expense: Expense): void {
    let isSelectedElementsIncludesExpense = false;
    if (expense.tx_id) {
      isSelectedElementsIncludesExpense = this.selectedElements.some((txn) => expense.tx_id === txn.tx_id);
    } else {
      isSelectedElementsIncludesExpense = this.selectedElements.some((txn) => isEqual(txn, expense));
    }

    if (isSelectedElementsIncludesExpense) {
      if (expense.tx_id) {
        this.selectedElements = this.selectedElements.filter((txn) => txn.tx_id !== expense.tx_id);
      } else {
        this.selectedElements = this.selectedElements.filter((txn) => !isEqual(txn, expense));
      }
    } else {
      this.selectedElements.push(expense);
    }
    this.isReportableExpensesSelected = this.transactionService.getReportableExpenses(this.selectedElements).length > 0;

    if (this.selectedElements.length > 0) {
      this.expensesToBeDeleted = this.transactionService.getDeletableTxns(this.selectedElements);

      this.expensesToBeDeleted = this.transactionService.excludeCCCExpenses(this.selectedElements);

      this.cccExpenses = this.selectedElements.length - this.expensesToBeDeleted.length;
    }

    // setting Expenses count and amount stats on select
    if (this.allExpensesCount === this.selectedElements.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
    this.setExpenseStatsOnSelect();
    this.isMergeAllowed = this.transactionService.isMergeAllowed(this.selectedElements);
  }

  goToTransaction({ etxn: expense }: { etxn: Expense; etxnIndex: number }): void {
    let category: string;

    if (expense.tx_org_category) {
      category = expense.tx_org_category.toLowerCase();
    }

    if (category === 'mileage') {
      this.router.navigate(['/', 'enterprise', 'add_edit_mileage', { id: expense.tx_id, persist_filters: true }]);
    } else if (category === 'per diem') {
      this.router.navigate(['/', 'enterprise', 'add_edit_per_diem', { id: expense.tx_id, persist_filters: true }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'add_edit_expense', { id: expense.tx_id, persist_filters: true }]);
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
    selectedElements = selectedElements.filter((expense) => expense.tx_id);
    if (!selectedElements.length) {
      this.showNonReportableExpenseSelectedToast('Please select one or more expenses to be reported');
      return;
    }
    const expensesWithCriticalPolicyViolations = selectedElements.filter((expense) =>
      this.transactionService.getIsCriticalPolicyViolated(expense)
    );
    const expensesInDraftState = selectedElements.filter((expense) => this.transactionService.getIsDraft(expense));

    const noOfExpensesWithCriticalPolicyViolations = expensesWithCriticalPolicyViolations.length;
    const noOfExpensesInDraftState = expensesInDraftState.length;

    if (noOfExpensesWithCriticalPolicyViolations === selectedElements.length) {
      this.showNonReportableExpenseSelectedToast('You cannot add critical policy violated expenses to a report');
    } else if (noOfExpensesInDraftState === selectedElements.length) {
      this.showNonReportableExpenseSelectedToast('You cannot add draft expenses to a report');
    } else if (!this.isReportableExpensesSelected) {
      this.showNonReportableExpenseSelectedToast(
        'You cannot add draft expenses and critical policy violated expenses to a report'
      );
    } else {
      this.trackingService.addToReport();
      const totalAmountofCriticalPolicyViolationExpenses = expensesWithCriticalPolicyViolations.reduce(
        (prev, current) => {
          const amount = current.tx_amount || current.tx_user_amount;
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
    const reportAbleExpenses = this.transactionService.getReportableExpenses(this.selectedElements);
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
    const allDataPipe$ = this.loadData$.pipe(
      take(1),
      switchMap((params) => {
        const queryParams = params.queryParams || {};

        queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';

        queryParams.tx_state = 'in.(COMPLETE,DRAFT)';

        const orderByParams = params.sortParam && params.sortDir ? `${params.sortParam}.${params.sortDir}` : null;

        return this.transactionService
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
      map((etxns) => etxns.map((etxn) => etxn.tx_id))
    );
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => {
          const txnIds = this.selectedElements.map((expense) => expense.tx_id);
          return iif(() => this.selectedElements.length === 0, allDataPipe$, of(txnIds));
        }),
        switchMap((selectedIds) => {
          const initial = selectedIds[0];
          const allIds = selectedIds;

          return this.transactionService.getETxnUnflattened(initial).pipe(
            map((etxn) => ({
              inital: etxn,
              allIds,
            }))
          );
        }),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(({ inital, allIds }) => {
        let category: string;

        if (inital.tx.org_category) {
          category = inital.tx.org_category.toLowerCase();
        }

        if (category === 'mileage') {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_mileage',
            {
              id: inital.tx.id,
              txnIds: JSON.stringify(allIds),
              activeIndex: 0,
            },
          ]);
        } else if (category === 'per diem') {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_per_diem',
            {
              id: inital.tx.id,
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
              id: inital.tx.id,
              txnIds: JSON.stringify(allIds),
              activeIndex: 0,
            },
          ]);
        }
      });
  }

  filterExpensesBySearchString(expense: Expense, searchString: string): boolean {
    return Object.values(expense)
      .map((value: keyof Expense) => value && value.toString().toLowerCase())
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
    const reportAbleExpenses = this.transactionService.getReportableExpenses(this.selectedElements);
    const selectedExpensesId = reportAbleExpenses.map((expenses) => expenses.tx_id);

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
    this.transactionOutboxService.deleteBulkOfflineExpenses(this.pendingTransactions, offlineExpenses);

    this.selectedElements = this.expensesToBeDeleted.filter((expense) => expense.tx_id);
    if (this.selectedElements.length > 0) {
      return this.transactionService.deleteBulk(this.selectedElements.map((selectedExpense) => selectedExpense.tx_id));
    } else {
      return of(null);
    }
  }

  async openDeleteExpensesPopover(): Promise<void> {
    const offlineExpenses = this.expensesToBeDeleted.filter((expense) => !expense.tx_id);

    const expenseDeletionMessage = this.transactionService.getExpenseDeletionMessage(this.expensesToBeDeleted);

    const cccExpensesMessage = this.transactionService.getCCCExpenseMessage(this.expensesToBeDeleted, this.cccExpenses);

    const deletePopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: 'Delete Expense',
        body: this.transactionService.getDeleteDialogBody(
          this.expensesToBeDeleted,
          this.cccExpenses,
          expenseDeletionMessage,
          cccExpensesMessage
        ),
        ctaText: this.expensesToBeDeleted.length > 0 && this.cccExpenses > 0 ? 'Exclude and Delete' : 'Delete',
        disableDelete: this.expensesToBeDeleted.length > 0 ? false : true,
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
        const totalNoOfSelectedExpenses = offlineExpenses.length + this.selectedElements.length;
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
        this.selectedElements = this.pendingTransactions;
        this.allExpensesCount = this.selectedElements.length;
        this.isReportableExpensesSelected =
          this.transactionService.getReportableExpenses(this.selectedElements).length > 0;
        this.setExpenseStatsOnSelect();
      }

      this.loadData$
        .pipe(
          take(1),
          map((params) => {
            let queryParams = params.queryParams || {};

            queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';
            queryParams.tx_state = 'in.(COMPLETE,DRAFT)';
            queryParams = this.apiV2Service.extendQueryParamsForTextSearch(queryParams, params.searchString);
            return queryParams;
          }),
          switchMap((queryParams) => this.transactionService.getAllExpenses({ queryParams }))
        )
        .subscribe((allExpenses) => {
          this.selectedElements = this.selectedElements.concat(allExpenses);
          if (this.selectedElements.length > 0) {
            this.expensesToBeDeleted = this.transactionService.getDeletableTxns(this.selectedElements);

            this.expensesToBeDeleted = this.transactionService.excludeCCCExpenses(this.selectedElements);

            this.cccExpenses = this.selectedElements.length - this.expensesToBeDeleted.length;
          }
          this.allExpensesCount = this.selectedElements.length;
          this.isReportableExpensesSelected =
            this.transactionService.getReportableExpenses(this.selectedElements).length > 0;
          this.setExpenseStatsOnSelect();
        });
    } else {
      this.selectedElements = [];
      this.isReportableExpensesSelected =
        this.transactionService.getReportableExpenses(this.selectedElements).length > 0;
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
    this.loadData$.next(params);
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
    this.router.navigate([
      '/',
      'enterprise',
      'merge_expense',
      {
        selectedElements: JSON.stringify(this.selectedElements),
        from: 'MY_EXPENSES',
      },
    ]);
  }

  showCamera(isCameraPreviewStarted: boolean): void {
    this.isCameraPreviewStarted = isCameraPreviewStarted;
  }
}
