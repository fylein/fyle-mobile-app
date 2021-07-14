import {Component, ElementRef, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, concat, EMPTY, forkJoin, from, fromEvent, iif, noop, Observable, of} from 'rxjs';
import {NetworkService} from 'src/app/core/services/network.service';
import {LoaderService} from 'src/app/core/services/loader.service';
import {ActionSheetController, ModalController, PopoverController, ToastController} from '@ionic/angular';
import {DateService} from 'src/app/core/services/date.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  shareReplay,
  switchMap,
  take,
  tap
} from 'rxjs/operators';
import {TransactionService} from 'src/app/core/services/transaction.service';
import {MyExpensesSortFilterComponent} from './my-expenses-sort-filter/my-expenses-sort-filter.component';
import {Expense} from 'src/app/core/models/expense.model';
import {CurrencyService} from 'src/app/core/services/currency.service';
import {AddExpensePopoverComponent} from './add-expense-popover/add-expense-popover.component';
import {TransactionsOutboxService} from 'src/app/core/services/transactions-outbox.service';
import {OfflineService} from 'src/app/core/services/offline.service';
import {PopupService} from 'src/app/core/services/popup.service';
import {AddTxnToReportDialogComponent} from './add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import {TrackingService} from '../../core/services/tracking.service';
import {StorageService} from '../../core/services/storage.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { ReportService } from 'src/app/core/services/report.service';
import { cloneDeep } from 'lodash';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';
import { CreateNewReportComponent } from 'src/app/shared/components/create-new-report/create-new-report.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import {TokenService} from 'src/app/core/services/token.service';
import {ApiV2Service} from 'src/app/core/services/api-v2.service';
import {environment} from 'src/environments/environment';
import {HeaderState} from '../../shared/components/fy-header/header-state.enum';
import {FyDeleteDialogComponent} from '../../shared/components/fy-delete-dialog/fy-delete-dialog.component';
import {FyFiltersComponent} from '../../shared/components/fy-filters/fy-filters.component';
import {FilterOptions} from '../../shared/components/fy-filters/filter-options.interface';
import {FilterOptionType} from '../../shared/components/fy-filters/filter-option-type.enum';
import {DateFilters} from '../../shared/components/fy-filters/date-filters.enum';
import {SelectedFilters} from '../../shared/components/fy-filters/selected-filters.interface';
import {FilterPill} from '../../shared/components/fy-filter-pills/filter-pill.interface';
import * as moment from 'moment';
import { getCurrencySymbol } from '@angular/common';

type Filters = Partial<{
  state: string[],
  date: string,
  customDateStart: Date,
  customDateEnd: Date,
  receiptsAttached: string,
  type: string[],
  sortParam: string,
  sortDir: string
}>;

@Component({
  selector: 'app-my-expenses',
  templateUrl: './my-expenses.page.html',
  styleUrls: ['./my-expenses.page.scss'],
})
export class MyExpensesPage implements OnInit {
  isConnected$: Observable<boolean>;
  myExpenses$: Observable<Expense[]>;
  count$: Observable<number>;
  isInfiniteScrollRequired$: Observable<boolean>;
  loadData$: BehaviorSubject<Partial<{
    pageNumber: number,
    queryParams: any,
    sortParam: string,
    sortDir: string,
    searchString: string
  }>>;
  currentPageNumber = 1;
  acc = [];
  filters: Filters;
  allExpensesStats$: Observable<{ count: number; amount: number }>;
  draftExpensesCount$: Observable<number>;
  homeCurrency$: Observable<string>;
  isInstaFyleEnabled$: Observable<boolean>;
  isBulkFyleEnabled$: Observable<boolean>;
  isMileageEnabled$: Observable<boolean>;
  isPerDiemEnabled$: Observable<boolean>;
  pendingTransactions = [];
  selectionMode = false;
  selectedElements: Expense[];
  syncing = false;
  simpleSearchText = '';
  allExpenseCountHeader$: Observable<number>;
  navigateBack = false;
  openAddExpenseListLoader = false;
  clusterDomain: string;
  isNewUser$: Observable<boolean>;
  isLoading = false;
  headerState: HeaderState = HeaderState.base;
  actionSheetButtons = [];
  selectAll = false;
  filterPills = [];

  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef;
  ROUTER_API_ENDPOINT: any;
  isReportableExpensesSelected = false;
  openReports$: Observable<ExtendedReport[]>;
  homeCurrencySymbol: string;
  isLoadingDataInInfiniteScroll: boolean;
  allExpensesCount: number;

  get HeaderState() {
    return HeaderState;
  }

  constructor(
    private networkService: NetworkService,
    private loaderService: LoaderService,
    private modalController: ModalController,
    private dateService: DateService,
    private transactionService: TransactionService,
    private currencyService: CurrencyService,
    private popoverController: PopoverController,
    private router: Router,
    private transactionOutboxService: TransactionsOutboxService,
    private activatedRoute: ActivatedRoute,
    private offlineService: OfflineService,
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
    private toastController: ToastController
  ) { }

  clearText() {
    this.simpleSearchText = '';
    const searchInput = this.simpleSearchInput.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ngOnInit() {
    this.setupNetworkWatcher();
  }

  formatTransactions(transactions) {
    return transactions.map(transaction => {
      const formattedTxn = {};
      Object.keys(transaction).forEach(key => {
        formattedTxn['tx_' + key] = transaction[key];
      });
      return formattedTxn;
    });
  }

  switchSelectionMode(expense?) {
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
        amount: 0
      });
    }

    if (expense) {
      this.selectExpense(expense);
    }
  }

  async sendFirstExpenseCreatedEvent() {
    // checking if the expense is first expense
    const isFirstExpenseCreated = await this.storageService.get('isFirstExpenseCreated');

    // for first expense etxnc size will be 0
    if (!isFirstExpenseCreated) {
      this.allExpensesStats$.subscribe(async (res) => {
        if (res.count === 0) {
          this.trackingService.createFirstExpense({Asset: 'Mobile'});
          await this.storageService.set('isFirstExpenseCreated', true);
        }
      });

    }
  }

  setAllExpensesCountAndAmount() {
    this.allExpensesStats$ = this.loadData$.pipe(
      switchMap(params => {
        const queryParams = params.queryParams || {};


        queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';
        queryParams.tx_state = 'in.(COMPLETE,DRAFT)';

        return this.transactionService.getTransactionStats('count(tx_id),sum(tx_amount)', {
          scalar: true,
          ...queryParams
        }).pipe(
          catchError(err => EMPTY),
          map(stats => {
            const count = stats[0].aggregates.find(stat => stat.function_name === 'count(tx_id)');
            const amount = stats[0].aggregates.find(stat => stat.function_name === 'sum(tx_amount)');
            return {
              count: count.function_value,
              amount: amount.function_value || 0
            };
          })
        );
      })
    );
  }

  setupActionSheet(orgSettings) {
    const that = this;
    const mileageEnabled = orgSettings.mileage.enabled;
    const isPerDiemEnabled = orgSettings.per_diem.enabled;
    that.actionSheetButtons = [{
      text: 'Capture Receipt',
      icon: 'assets/svg/fy-camera.svg',
      cssClass: 'capture-receipt',
      handler: () => {
        this.trackingService.myExpensesActionSheetAction({
          Asset: 'Mobile',
          Action: 'capture receipts'
        });
        that.router.navigate(['/', 'enterprise', 'camera_overlay', {
          navigate_back: true
        }]);
      }
    }, {
      text: 'Add Manually',
      icon: 'assets/svg/fy-expense.svg',
      handler: () => {
        this.trackingService.myExpensesActionSheetAction({
          Asset: 'Mobile',
          Action: 'Add Expense'
        });
        that.router.navigate(['/', 'enterprise', 'add_edit_expense', {
          navigate_back: true
        }]);
      }
    }];

    if (mileageEnabled) {
      this.actionSheetButtons.push({
        text: 'Add Mileage',
        icon: 'assets/svg/fy-mileage.svg',
        handler: () => {
          this.trackingService.myExpensesActionSheetAction({
            Asset: 'Mobile',
            Action: 'Add Mileage'
          });
          that.router.navigate(['/', 'enterprise', 'add_edit_mileage', {
            navigate_back: true
          }]);
        }
      });
    }

    if (isPerDiemEnabled) {
      that.actionSheetButtons.push({
        text: 'Add Per Diem',
        icon: 'assets/svg/fy-calendar.svg',
        handler: () => {
          this.trackingService.myExpensesActionSheetAction({
            Asset: 'Mobile',
            Action: 'Add Per Diem'
          });
          that.router.navigate(['/', 'enterprise', 'add_edit_per_diem', {
            navigate_back: true
          }]);
        }
      });
    }
  }


  ionViewWillEnter() {
    this.isInstaFyleEnabled$ = this.offlineService.getOrgUserSettings().pipe(
      map(orgUserSettings => orgUserSettings && orgUserSettings.insta_fyle_settings && orgUserSettings.insta_fyle_settings.allowed && orgUserSettings.insta_fyle_settings.enabled)
    );

    this.isBulkFyleEnabled$ = this.offlineService.getOrgUserSettings().pipe(
      map(orgUserSettings => orgUserSettings && orgUserSettings.bulk_fyle_settings && orgUserSettings.bulk_fyle_settings.enabled)
    );

    this.isMileageEnabled$ = this.offlineService.getOrgSettings().pipe(
      map(orgSettings => orgSettings.mileage.enabled)
    );
    this.isPerDiemEnabled$ = this.offlineService.getOrgSettings().pipe(
      map(orgSettings => orgSettings.per_diem.enabled)
    );

    this.offlineService.getOrgSettings().subscribe(orgSettings => {
      this.setupActionSheet(orgSettings);
    });

    this.headerState = HeaderState.base;

    this.isLoading = true;

    from(this.tokenService.getClusterDomain()).subscribe(clusterDomain => {
      this.clusterDomain = clusterDomain;
    });

    this.ROUTER_API_ENDPOINT = environment.ROUTER_API_ENDPOINT;

    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;
    this.acc = [];
    this.simpleSearchText = '';

    this.currentPageNumber = 1;
    this.loadData$ = new BehaviorSubject({
      pageNumber: 1
    });

    this.selectionMode = false;
    this.selectedElements = [];

    this.pendingTransactions = this.formatTransactions(this.transactionOutboxService.getPendingTransactions());

    this.syncing = true;
    from(this.pendingTransactions).pipe(
      switchMap(() => {
        return from(this.transactionOutboxService.sync());
      }),
      tap(() => this.sendFirstExpenseCreatedEvent()),
      finalize(() => this.syncing = false)
    ).subscribe(() => {
      this.pendingTransactions = this.formatTransactions(this.transactionOutboxService.getPendingTransactions());

      if (this.pendingTransactions.length === 0) {
        this.doRefresh();
      }
    });

    this.homeCurrency$ = this.currencyService.getHomeCurrency();

    this.offlineService.getHomeCurrency().subscribe((homeCurrency) => {
      this.homeCurrencySymbol = getCurrencySymbol(homeCurrency, 'wide');
    });

    this.simpleSearchInput.nativeElement.value = '';
    fromEvent(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.srcElement.value as string),
        distinctUntilChanged(),
        debounceTime(400)
      ).subscribe((searchString) => {
        const currentParams = this.loadData$.getValue();
        currentParams.searchString = searchString;
        this.currentPageNumber = 1;
        currentParams.pageNumber = this.currentPageNumber;
        this.loadData$.next(currentParams);
      });

    const paginatedPipe = this.loadData$.pipe(
      switchMap((params) => {
        let queryParams = params.queryParams || {};

        queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';
        queryParams.tx_state = 'in.(COMPLETE,DRAFT)';
        queryParams = this.apiV2Service.extendQueryParamsForTextSearch(queryParams, params.searchString);
        const orderByParams = (params.sortParam && params.sortDir) ? `${params.sortParam}.${params.sortDir}` : null;
        this.isLoadingDataInInfiniteScroll = true;
        return this.transactionService.getMyExpensesCount(queryParams).pipe(
          switchMap((count) => {
            if (count > ((params.pageNumber - 1) * 10)) {
              return this.transactionService.getMyExpenses({
                offset: (params.pageNumber - 1) * 10,
                limit: 10,
                queryParams,
                order: orderByParams
              });
            } else {
             return of({
               data: []
             });
            }
          })
        );
      }),
      map(res => {
        this.isLoadingDataInInfiniteScroll = false;
        if (this.currentPageNumber === 1) {
          this.acc = [];
        }
        this.acc = this.acc.concat(res.data);
        return this.acc;
      })
    );

    this.myExpenses$ = paginatedPipe.pipe(
      shareReplay(1)
    );

    this.count$ = this.loadData$.pipe(
      switchMap(params => {
        let queryParams = params.queryParams || {};

        queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';
        queryParams.tx_state =  'in.(COMPLETE,DRAFT)';
        queryParams = this.apiV2Service.extendQueryParamsForTextSearch(queryParams, params.searchString);
        return this.transactionService.getMyExpensesCount(queryParams);
      }),
      shareReplay(1)
    );

    this.isNewUser$ = this.transactionService.getPaginatedETxncCount().pipe(
      map(res => {
        return res.count === 0;
      })
    );

    const paginatedScroll$ = this.myExpenses$.pipe(
      switchMap(etxns => {
        return this.count$.pipe(
          map(count => {
            return count > etxns.length;
          })
        );
      })
    );

    this.isInfiniteScrollRequired$ = this.loadData$.pipe(
      switchMap(_ => {
        return paginatedScroll$;
      })
    );

    this.setAllExpensesCountAndAmount();

    this.allExpenseCountHeader$ = this.loadData$.pipe(
      switchMap(() => {
        return this.transactionService.getTransactionStats('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_state: 'in.(COMPLETE,DRAFT)',
          tx_report_id: 'is.null'
        });
      }),
      map(stats => {
        const count = stats &&  stats[0] && stats[0].aggregates.find(stat => stat.function_name === 'count(tx_id)');
        return count && count.function_value;
      })
    );

    this.draftExpensesCount$ = this.loadData$.pipe(
      switchMap(() => {
        return this.transactionService.getTransactionStats('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(DRAFT)'
        });
      }),
      map(stats => {
        const count = stats &&  stats[0] && stats[0].aggregates.find(stat => stat.function_name === 'count(tx_id)');
        return count && count.function_value;
      })
    );

    this.loadData$.subscribe(params => {
      const queryParams: Params = { filters: JSON.stringify(this.filters) };
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
        replaceUrl : true 
      });
    });

    this.myExpenses$.subscribe(noop);
    this.count$.subscribe(noop);
    this.isInfiniteScrollRequired$.subscribe(noop);
    if (this.activatedRoute.snapshot.queryParams.filters) {
      this.filters = Object.assign({}, this.filters, JSON.parse(this.activatedRoute.snapshot.queryParams.filters));
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
    } else if (this.activatedRoute.snapshot.params.state) {
      let filters = {};
      if (this.activatedRoute.snapshot.params.state.toLowerCase() === 'needsreceipt') {
        filters = {tx_receipt_required: 'eq.true', state: 'NEEDS_RECEIPT'};
      } else if (this.activatedRoute.snapshot.params.state.toLowerCase() === 'policyviolated') {
        filters = {tx_policy_flag: 'eq.true', or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)', state: 'POLICY_VIOLATED'};
      } else if (this.activatedRoute.snapshot.params.state.toLowerCase() === 'cannotreport') {
        filters = {tx_policy_amount: 'lt.0.0001', state: 'CANNOT_REPORT'};
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

    const queryParams = { rp_state: 'in.(DRAFT,APPROVER_PENDING)' };

    this.openReports$ = this.reportService.getAllExtendedReports({queryParams}).pipe(
      map((openReports) => {
        return openReports.filter(openReport => {
          // JSON.stringify(openReport.report_approvals).indexOf('APPROVAL_DONE') -> Filter report if any approver approved this report.
          // Converting this object to string and checking If `APPROVAL_DONE` is present in the string, removing the report from the list 
          return !openReport.report_approvals || (openReport.report_approvals && !(JSON.stringify(openReport.report_approvals).indexOf('APPROVAL_DONE') > -1))
        })
      })
    );
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
  }

  loadData(event) {
    this.currentPageNumber = this.currentPageNumber + 1;

    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.loadData$.next(params);

    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  doRefresh(event?) {
    this.pendingTransactions = this.formatTransactions(this.transactionOutboxService.getPendingTransactions());

    if (this.pendingTransactions.length) {
      this.syncing = true;
      from(this.pendingTransactions).pipe(
        switchMap(() => {
          return from(this.transactionOutboxService.sync());
        }),
        finalize(() => this.syncing = false)
      ).subscribe((a) => {
        this.pendingTransactions = this.formatTransactions(this.transactionOutboxService.getPendingTransactions());
      });
    }

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
          event.target.complete();
        }, 1000);
      }
    });
  }

  generateFilterPills(filter: Filters) {
    const filterPills: FilterPill[] = [];

    if (filter.state && filter.state.length) {
      filterPills.push({
        label: 'Type',
        type: 'state',
        value: filter.state.map(state => state.replace(/_/g, ' ').toLowerCase()).reduce((state1, state2) => `${state1}, ${state2}`)
      });
    }

    if (filter.receiptsAttached) {
      filterPills.push({
        label: 'Receipts Attached',
        type: 'receiptsAttached',
        value: filter.receiptsAttached.toLowerCase()
      });
    }

    if (filter.date) {
      if (filter.date === DateFilters.thisWeek) {
        filterPills.push({
          label: 'Date',
          type: 'date',
          value: 'this Week'
        });
      }

      if (filter.date === DateFilters.thisMonth) {
        filterPills.push({
          label: 'Date',
          type: 'date',
          value: 'this Month'
        });
      }

      if (filter.date === DateFilters.all) {
        filterPills.push({
          label: 'Date',
          type: 'date',
          value: 'All'
        });
      }

      if (filter.date === DateFilters.lastMonth) {
        filterPills.push({
          label: 'Date',
          type: 'date',
          value: 'Last Month'
        });
      }

      if (filter.date === DateFilters.custom) {
        const startDate = filter.customDateStart && moment(filter.customDateStart).format('y-MM-D');
        const endDate = filter.customDateEnd && moment(filter.customDateEnd).format('y-MM-D');

        if (startDate && endDate) {
          filterPills.push({
            label: 'Date',
            type: 'date',
            value: `${startDate} to ${endDate}`
          });
        } else if (startDate) {
          filterPills.push({
            label: 'Date',
            type: 'date',
            value: `>= ${startDate}`
          });
        } else if (endDate) {
          filterPills.push({
            label: 'Date',
            type: 'date',
            value: `<= ${endDate}`
          });
        }
      }
    }

    if (filter.type && filter.type.length) {
      const combinedValue = filter.type.map(type => {
        if (type === 'RegularExpenses') {
          return 'Regular Expenses';
        } else if (type === 'PerDiem') {
          return 'Per Diem';
        } else if (type === 'Mileage') {
          return 'Mileage';
        } else {
          return type;
        }
      }).reduce((type1, type2) => `${type1}, ${type2}`);

      filterPills.push({
        label: 'Expense Type',
        type: 'type',
        value: combinedValue
        });
      }


    if (filter.sortParam && filter.sortDir) {
      if (filter.sortParam === 'tx_txn_dt' && filter.sortDir === 'asc') {
        filterPills.push({
          label: 'Sort By',
          type: 'sort',
          value: 'date - old to new'
        });
      } else if (filter.sortParam === 'tx_txn_dt' && filter.sortDir === 'desc') {
        filterPills.push({
          label: 'Sort By',
          type: 'sort',
          value: 'date - new to old'
        });
      } else if (filter.sortParam === 'tx_amount' && filter.sortDir === 'desc') {
        filterPills.push({
          label: 'Sort By',
          type: 'sort',
          value: 'amount - high to low'
        });
      } else if (filter.sortParam === 'tx_amount' && filter.sortDir === 'asc') {
        filterPills.push({
          label: 'Sort By',
          type: 'sort',
          value: 'amount - low to high'
        });
      } else if (filter.sortParam === 'tx_org_category' && filter.sortDir === 'asc') {
        filterPills.push({
          label: 'Sort By',
          type: 'sort',
          value: 'category - a to z'
        });
      } else if (filter.sortParam === 'tx_org_category' && filter.sortDir === 'desc') {
        filterPills.push({
          label: 'Sort By',
          type: 'sort',
          value: 'category - z to a'
        });
      }
    }

    return filterPills;
  }

  addNewFiltersToParams() {
    const currentParams = this.loadData$.getValue();
    currentParams.pageNumber = 1;
    const newQueryParams: any = {
      or: []
    };

    this.generateDateParams(newQueryParams);

    this.generateReceiptAttachedParams(newQueryParams);

    this.generateStateFilters(newQueryParams);

    this.generateTypeFilters(newQueryParams);

    if (this.filters.sortParam && this.filters.sortDir) {
      currentParams.sortParam = this.filters.sortParam;
      currentParams.sortDir = this.filters.sortDir;
    } else {
      currentParams.sortParam = 'tx_txn_dt';
      currentParams.sortDir = 'desc';
    }

    currentParams.queryParams = newQueryParams;
    return currentParams;
  }

  private generateTypeFilters(newQueryParams) {
    const typeOrFilter = [];

    if (this.filters.type) {
      if (this.filters.type.includes('Mileage')) {
        typeOrFilter.push('tx_fyle_category.eq.Mileage');
      }

      if (this.filters.type.includes('PerDiem')) {
        // The space encoding is done by angular into %20 so no worries here
        typeOrFilter.push('tx_fyle_category.eq.Per Diem');
      }

      if (this.filters.type.includes('RegularExpenses')) {
        typeOrFilter.push('and(tx_fyle_category.not.eq.Mileage, tx_fyle_category.not.eq.Per Diem)');
      }
    }

    if (typeOrFilter.length > 0) {
      let combinedTypeOrFilter = typeOrFilter.reduce((param1, param2) => `${param1}, ${param2}`);
      combinedTypeOrFilter = `(${combinedTypeOrFilter})`;
      newQueryParams.or.push(combinedTypeOrFilter);
    }
  }

  private generateStateFilters(newQueryParams) {
    const stateOrFilter = [];

    if (this.filters.state) {
      newQueryParams.tx_report_id = 'is.null';
      if (this.filters.state.includes('READY_TO_REPORT')) {
        stateOrFilter.push('and(tx_state.in.(COMPLETE),or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001))');
      }

      if (this.filters.state.includes('POLICY_VIOLATED')) {
        stateOrFilter.push('and(tx_policy_flag.eq.true,or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001))');
      }

      if (this.filters.state.includes('CANNOT_REPORT')) {
        stateOrFilter.push('tx_policy_amount.lt.0.0001');
      }

      if (this.filters.state.includes('DRAFT')) {
        stateOrFilter.push('tx_state.in.(DRAFT)');
      }
    }

    if (stateOrFilter.length > 0) {
      let combinedStateOrFilter = stateOrFilter.reduce((param1, param2) => `${param1}, ${param2}`);
      combinedStateOrFilter = `(${combinedStateOrFilter})`;
      newQueryParams.or.push(combinedStateOrFilter);
    }
  }

  private generateReceiptAttachedParams(newQueryParams) {
    if (this.filters.receiptsAttached) {
      if (this.filters.receiptsAttached === 'YES') {
        newQueryParams.tx_num_files = 'gt.0';
      }

      if (this.filters.receiptsAttached === 'NO') {
        newQueryParams.tx_num_files = 'eq.0';
      }
    }
  }

  private generateDateParams(newQueryParams) {
    if (this.filters.date) {
      this.filters.customDateStart = this.filters.customDateStart && new Date(this.filters.customDateStart);
      this.filters.customDateEnd = this.filters.customDateEnd && new Date(this.filters.customDateEnd);
      if (this.filters.date === DateFilters.thisMonth) {
        newQueryParams.and =
            `(tx_txn_dt.gte.${this.dateService.getThisMonthRange().from.toISOString()},tx_txn_dt.lt.${this.dateService.getThisMonthRange().to.toISOString()})`;
      } else if (this.filters.date === DateFilters.thisWeek) {
        newQueryParams.and =
            `(tx_txn_dt.gte.${this.dateService.getThisWeekRange().from.toISOString()},tx_txn_dt.lt.${this.dateService.getThisWeekRange().to.toISOString()})`;
      } else if (this.filters.date === DateFilters.lastMonth) {
        newQueryParams.and =
            `(tx_txn_dt.gte.${this.dateService.getLastMonthRange().from.toISOString()},tx_txn_dt.lt.${this.dateService.getLastMonthRange().to.toISOString()})`;
      } else if (this.filters.date === DateFilters.custom) {
        if (this.filters.customDateStart && this.filters.customDateEnd) {
          newQueryParams.and =`(tx_txn_dt.gte.${this.filters?.customDateStart?.toISOString()},tx_txn_dt.lt.${this.filters?.customDateEnd?.toISOString()})`;
        } else if (this.filters.customDateStart) {
          newQueryParams.and =`(tx_txn_dt.gte.${this.filters.customDateStart?.toISOString()})`;
        } else if (this.filters.customDateEnd) {
          newQueryParams.and =`(tx_txn_dt.lt.${this.filters.customDateEnd?.toISOString()})`;
        }
      }
    }
  }

  generateSelectedFilters(filter: Filters): SelectedFilters<any>[] {
    const generatedFilters: SelectedFilters<any>[] = [];

    if (filter.state) {
      generatedFilters.push({
        name: 'Type',
        value: filter.state
      });
    }

    if (filter.receiptsAttached) {
      generatedFilters.push({
        name: 'Receipts Attached',
        value: filter.receiptsAttached
      });
    }

    if (filter.date) {
      generatedFilters.push({
        name: 'Date',
        value: filter.date,
        associatedData: {
          startDate: filter.customDateStart,
          endDate: filter.customDateEnd
        }
      });
    }

    if (filter.type) {
      generatedFilters.push({
        name: 'Expense Type',
        value: filter.type
      });
    }

    if (filter.sortParam && filter.sortDir) {
      if (filter.sortParam === 'tx_txn_dt' && filter.sortDir === 'asc') {
        generatedFilters.push({
          name: 'Sort By',
          value: 'dateOldToNew'
        });
      } else if (filter.sortParam === 'tx_txn_dt' && filter.sortDir === 'desc') {
        generatedFilters.push({
          name: 'Sort By',
          value: 'dateNewToOld'
        });
      } else if (filter.sortParam === 'tx_amount' && filter.sortDir === 'desc') {
        generatedFilters.push({
          name: 'Sort By',
          value: 'amountHighToLow'
        });
      } else if (filter.sortParam === 'tx_amount' && filter.sortDir === 'asc') {
        generatedFilters.push({
          name: 'Sort By',
          value: 'amountLowToHigh'
        });
      } else if (filter.sortParam === 'tx_org_category' && filter.sortDir === 'asc') {
        generatedFilters.push({
          name: 'Sort By',
          value: 'categoryAToZ'
        });
      } else if (filter.sortParam === 'tx_org_category' && filter.sortDir === 'desc') {
        generatedFilters.push({
          name: 'Sort By',
          value: 'categoryZToA'
        });
      }
    }

    return generatedFilters;
  }

  convertFilters(selectedFilters: SelectedFilters<any>[]): Filters {
    const generatedFilters: Filters = {};

    const typeFilter = selectedFilters.find(filter => filter.name === 'Type');
    if (typeFilter) {
      generatedFilters.state = typeFilter.value;
    }

    const dateFilter = selectedFilters.find(filter => filter.name === 'Date');
    if (dateFilter) {
      generatedFilters.date = dateFilter.value;
      generatedFilters.customDateStart = dateFilter.associatedData?.startDate;
      generatedFilters.customDateEnd = dateFilter.associatedData?.endDate;
    }

    const receiptAttachedFilter = selectedFilters.find(filter => filter.name === 'Receipts Attached');

    if (receiptAttachedFilter) {
      generatedFilters.receiptsAttached = receiptAttachedFilter.value;
    }

    const expenseTypeFilter = selectedFilters.find(filter => filter.name === 'Expense Type');

    if (expenseTypeFilter) {
      generatedFilters.type = expenseTypeFilter.value;
    }

    const sortBy = selectedFilters.find(filter => filter.name === 'Sort By');

    if (sortBy) {
      if (sortBy.value === 'dateNewToOld') {
        generatedFilters.sortParam = 'tx_txn_dt';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'dateOldToNew') {
        generatedFilters.sortParam = 'tx_txn_dt';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'amountHighToLow') {
        generatedFilters.sortParam = 'tx_amount';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'amountLowToHigh') {
        generatedFilters.sortParam = 'tx_amount';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'categoryAToZ') {
        generatedFilters.sortParam = 'tx_org_category';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'categoryZToA') {
        generatedFilters.sortParam = 'tx_org_category';
        generatedFilters.sortDir = 'desc';
      }
    }

    return generatedFilters;
  }

  async openFilters(activeFilterInitialName?: string) {
    const filterPopover = await this.modalController.create({
      component: FyFiltersComponent,
      componentProps: {
        filterOptions: [
          {
            name: 'Type',
            optionType: FilterOptionType.multiselect,
            options: [
              {
                label: 'Ready To Report',
                value: 'READY_TO_REPORT'
              },
              {
                label: 'Policy Violated',
                value: 'POLICY_VIOLATED'
              },
              {
                label: 'Cannot Report',
                value: 'CANNOT_REPORT'
              },
              {
                label: 'Draft',
                value: 'DRAFT'
              }
            ]
          } as FilterOptions<string>,
          {
            name: 'Date',
            optionType: FilterOptionType.date,
            options: [
              {
                label: 'All',
                value: DateFilters.all
              },
              {
                label: 'This Week',
                value: DateFilters.thisWeek
              },
              {
                label: 'This Month',
                value: DateFilters.thisMonth
              },
              {
                label: 'Last Month',
                value: DateFilters.lastMonth
              },
              {
                label: 'Custom',
                value: DateFilters.custom
              }
            ]
          } as FilterOptions<DateFilters>,
          {
            name: 'Receipts Attached',
            optionType: FilterOptionType.singleselect,
            options: [
              {
                label: 'Yes',
                value: 'YES'
              },
              {
                label: 'No',
                value: 'NO'
              }
            ]
          } as FilterOptions<string>,
          {
            name: 'Expense Type',
            optionType: FilterOptionType.multiselect,
            options: [
              {
                label: 'Mileage',
                value: 'Mileage'
              },
              {
                label: 'Per Diem',
                value: 'PerDiem'
              },
              {
                label: 'Regular Expenses',
                value: 'RegularExpenses'
              }
            ]
          } as FilterOptions<string>,
          {
            name: 'Sort By',
            optionType: FilterOptionType.singleselect,
            options: [
              {
                label: 'Date - New to Old',
                value: 'dateNewToOld'
              },
              {
                label: 'Date - Old to New',
                value: 'dateOldToNew'
              },
              {
                label: 'Amount - High to Low',
                value: 'amountHighToLow'
              },
              {
                label: 'Amount - Low to High',
                value: 'amountLowToHigh'
              },
              {
                label: 'Category - A to Z',
                value: 'categoryAToZ'
              },
              {
                label: 'Category - Z to A',
                value: 'categoryZToA'
              }
            ]
          } as FilterOptions<string>
        ],
        selectedFilterValues: this.generateSelectedFilters(this.filters),
        activeFilterInitialName
      },
      cssClass: 'dialog-popover'
    });

    await filterPopover.present();

    const { data } = await filterPopover.onWillDismiss();
    if (data) {
      console.log(data);
      // await this.loaderService.showLoader('Loading Expenses...', 1000);
      this.filters = this.convertFilters(data);
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
      this.trackingService.myExpensesFilterApplied({
        Asset: 'Mobile',
        ...this.filters
      });
    }
  }


  async openSort() {
    const sortPopover = await this.popoverController.create({
      component: MyExpensesSortFilterComponent,
      componentProps: {
        filters: this.filters
      },
      cssClass: 'dialog-popover'
    });

    await sortPopover.present();

    const { data } = await sortPopover.onWillDismiss();
    if (data) {
      await this.loaderService.showLoader('Loading Expenses...', 1000);
      this.filters = Object.assign({}, this.filters, data.sortOptions);
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
    }
  }

  clearFilters() {
    this.filters = {};
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    this.filterPills = this.generateFilterPills(this.filters);
  }

  async setState(state: string) {
    this.isLoading = true;
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  async addNewExpense() {
    this.openAddExpenseListLoader = true;
    forkJoin({
      isInstaFyleEnabled: this.isInstaFyleEnabled$,
      isMileageEnabled: this.isMileageEnabled$,
      isPerDiemEnabled: this.isPerDiemEnabled$,
      isBulkFyleEnabled: this.isBulkFyleEnabled$
    }).pipe(
      finalize(() => {
        this.openAddExpenseListLoader = false;
      })
    ).subscribe(async ({ isInstaFyleEnabled, isMileageEnabled, isPerDiemEnabled, isBulkFyleEnabled }) => {
      const addExpensePopover = await this.popoverController.create({
        component: AddExpensePopoverComponent,
        componentProps: {
          isInstaFyleEnabled,
          isMileageEnabled,
          isPerDiemEnabled,
          isBulkFyleEnabled
        },
        cssClass: 'dialog-popover'
      });

      await addExpensePopover.present();

      const {data} = await addExpensePopover.onDidDismiss();

      if (data && data.reload) {
        this.pendingTransactions = this.formatTransactions(this.transactionOutboxService.getPendingTransactions());
        this.doRefresh();
      }
    });
  }

  async onDeleteExpenseClick(etxn: Expense, index?: number) {
    const popupResults = await this.popupService.showPopup({
      header: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      primaryCta: {
        text: 'Delete'
      }
    });

    if (popupResults === 'primary') {
      from(this.loaderService.showLoader('Deleting Expense', 2500)).pipe(
        switchMap(() => {
          return iif(() => !etxn.tx_id,
            of(this.transactionOutboxService.deleteOfflineExpense(index)),
            this.transactionService.delete(etxn.tx_id)
          );
        }),
        tap(() => this.trackingService.deleteExpense({Asset: 'Mobile'})),
        finalize(async () => {
          await this.loaderService.hideLoader();
          this.doRefresh();
        })
      ).subscribe(noop);
    }
  }

  setExpenseStatsOnSelect() {
    this.allExpensesStats$ = of({
      count: this.selectedElements.length,
      amount: this.selectedElements.reduce((acc, txnObj) => acc + txnObj.tx_amount, 0)
    });
  }

  selectExpense(expense: Expense) {
    const isSelectedElementsIncludesExpense = this.selectedElements.some(txn => expense.tx_id === txn.tx_id);
    if (isSelectedElementsIncludesExpense) {
      this.selectedElements = this.selectedElements.filter(txn => txn.tx_id !== expense.tx_id);
    } else {
      this.selectedElements.push(expense);
    }
    this.isReportableExpensesSelected = this.transactionService.getReportableExpenses(this.selectedElements).length > 0;
    // setting Expenses count and amount stats on select
    if (this.allExpensesCount === this.selectedElements.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
    this.setExpenseStatsOnSelect();
  }

  async showCannotEditActivityDialog() {
    const popupResult = await this.popupService.showPopup({
      header: 'Cannot Edit Activity Expense!',
      message: `To edit this activity expense, you need to login to web version of Fyle app at <a href="${this.ROUTER_API_ENDPOINT}">${this.ROUTER_API_ENDPOINT}</a>`,
      primaryCta: {
        text: 'Close'
      },
      showCancelButton: false
    });
  }

  goToTransaction(expense) {
    let category;

    if (expense.tx_org_category) {
      category = expense.tx_org_category.toLowerCase();
    }

    if (category === 'activity') {
      this.showCannotEditActivityDialog();
      return;
    }
    if (category === 'mileage') {
      this.router.navigate(['/', 'enterprise', 'add_edit_mileage', { id: expense.tx_id, persist_filters: true }]);
    } else if (category === 'per diem') {
      this.router.navigate(['/', 'enterprise', 'add_edit_per_diem', { id: expense.tx_id, persist_filters: true }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'add_edit_expense', { id: expense.tx_id, persist_filters: true }]);
    }
  }

  onAddTransactionToNewReport(expense) {
    this.trackingService.clickAddToReport({Asset: 'Mobile'});
    const transactionIds = JSON.stringify([expense.tx_id]);
    this.router.navigate(['/', 'enterprise', 'my_create_report', { txn_ids: transactionIds }]);
  }

  async openCriticalPolicyViolationPopOver(config: { title: string, message: string, report_type: string}) {
    const criticalPolicyViolationPopOver = await this.popoverController.create({
      component: PopupAlertComponentComponent,
      componentProps: {
        title: config.title,
        message: config.message,
        primaryCta: {
          text: 'Exclude and Continue',
          action: 'continue'
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'cancel'
        }
      },
      cssClass: 'pop-up-in-center'
    });

    await criticalPolicyViolationPopOver.present();

    const {data} = await criticalPolicyViolationPopOver.onWillDismiss();

    if (data && data.action) {
      if (data.action === 'continue') {
        if (config.report_type === 'oldReport') {
          this.showOldReportsMatBottomSheet();
        } else {
          this.showNewReportModal();
        }
      }
    }
  }

  async openCreateReportWithSelectedIds(report_type: 'oldReport' | 'newReport') {
    if (!this.isReportableExpensesSelected) {
      this.matSnackBar.openFromComponent(ToastMessageComponent, {
        data: {
          message: 'You can not add draft expenses and Critical policy violated expenses to a report',
          showCloseButton: true
        },
        panelClass: ['mat-snack-bar-info']
      });
      return;
    }

    this.trackingService.addToReport({Asset: 'Mobile'});

    let selectedElements = cloneDeep(this.selectedElements);

    const expensesWithCriticalPolicyViolations = selectedElements.filter((expense) => this.transactionService.getIsCriticalPolicyViolated(expense));
    const expensesInDraftState = selectedElements.filter((expense) => this.transactionService.getIsDraft(expense));

    const totalAmountofCriticalPolicyViolationExpenses = expensesWithCriticalPolicyViolations.reduce((prev, current) => {
        const amount = current.tx_amount || current.tx_user_amount;
        return prev + amount;
    }, 0);

    const noOfExpensesWithCriticalPolicyViolations = expensesWithCriticalPolicyViolations.length;
    const noOfExpensesInDraftState = expensesInDraftState.length;
    let title = '';
    let message = '';

    if ((noOfExpensesWithCriticalPolicyViolations > 0) || (noOfExpensesInDraftState > 0)) {

      this.homeCurrency$.subscribe(homeCurrency => {
        if (noOfExpensesWithCriticalPolicyViolations > 0 && noOfExpensesInDraftState > 0) {
          title = `${noOfExpensesWithCriticalPolicyViolations} Critical Policy and ${noOfExpensesInDraftState} Draft Expenses blocking the way`;
          message = `Critical policy blocking these ${noOfExpensesWithCriticalPolicyViolations} expenses worth ${this.homeCurrencySymbol} ${totalAmountofCriticalPolicyViolationExpenses} from being submitted. Also ${noOfExpensesInDraftState} other expenses are in draft states.`;
        } else if (noOfExpensesWithCriticalPolicyViolations > 0 ) {
          title = `${noOfExpensesWithCriticalPolicyViolations} Critical Policy Expenses blocking the way`;
          message = `Critical policy blocking these ${noOfExpensesWithCriticalPolicyViolations} expenses worth ${this.homeCurrencySymbol} ${totalAmountofCriticalPolicyViolationExpenses} from being submitted.`;
        } else if (noOfExpensesInDraftState > 0) {
          title = `${noOfExpensesInDraftState} Draft Expenses blocking the way`;
          message = `${noOfExpensesInDraftState} expenses are in draft states.`;
        }
        this.openCriticalPolicyViolationPopOver({title, message, report_type});
      });

    } else {
      if (report_type === 'oldReport') {
        this.showOldReportsMatBottomSheet();
      } else {
        this.showNewReportModal();
      } 
    }
  }

  async showNewReportModal() {
    const reportAbleExpenses = this.transactionService.getReportableExpenses(this.selectedElements);
    const addExpenseToNewReportModal = await this.modalController.create({
      component: CreateNewReportComponent,
      componentProps: {
        selectedExpensesToReport: reportAbleExpenses
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties()
    });
    await addExpenseToNewReportModal.present();

    const { data } = await addExpenseToNewReportModal.onDidDismiss();

    if (data && data.report) {
      this.showAddToReportSuccessToast({report: data.report, message: data.message});
    }
  }

  openCreateReport() {
    this.trackingService.clickCreateReport({Asset: 'Mobile'});
    this.router.navigate(['/', 'enterprise', 'my_create_report']);
  }

  openReviewExpenses() {
    const allDataPipe$ = this.loadData$.pipe(
      take(1),
      switchMap(params => {
        const queryParams = params.queryParams || {};

        queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';

        queryParams.tx_state = 'in.(COMPLETE,DRAFT)';

        const orderByParams = (params.sortParam && params.sortDir) ? `${params.sortParam}.${params.sortDir}` : null;

        return this.transactionService.getAllExpenses({
          queryParams,
          order: orderByParams
        }).pipe(
          map(expenses => expenses.filter(expense => {
            if (params.searchString) {
              return Object.values(expense)
                .map(value => value && value.toString().toLowerCase())
                .filter(value => !!value)
                .some(value => value.toLowerCase().includes(params.searchString.toLowerCase()));
            } else {
              return true;
            }
          }))
        );
      }),
      map(etxns => etxns.map(etxn => etxn.tx_id))
    );
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => {
          const txnIds = this.selectedElements.map(expense => expense.tx_id);
          return iif(() => this.selectedElements.length === 0, allDataPipe$, of(txnIds));
        }),
        switchMap((selectedIds) => {
          const initial = selectedIds[0];
          const allIds = selectedIds;

          return this.transactionService.getETxn(initial).pipe(
            map((etxn) => ({
              inital: etxn,
              allIds
            }))
          );
        }),
        finalize(() => from(this.loaderService.hideLoader()))
      ).subscribe(({ inital, allIds }) => {
        let category;

        if (inital.tx.org_category) {
          category = inital.tx.org_category.toLowerCase();
        }

        if (category === 'mileage') {
          this.router.navigate(['/', 'enterprise', 'add_edit_mileage', {
            id: inital.tx.id,
            txnIds: JSON.stringify(allIds),
            activeIndex: 0
          }]);
        } else if (category === 'per diem') {
          this.router.navigate(['/', 'enterprise', 'add_edit_per_diem', {
            id: inital.tx.id,
            txnIds: JSON.stringify(allIds),
            activeIndex: 0
          }]);
        } else {
          this.router.navigate(['/', 'enterprise', 'add_edit_expense', {
            id: inital.tx.id,
            txnIds: JSON.stringify(allIds),
            activeIndex: 0
          }]);
        }
      });
  }

  uploadCameraOveralay() {
    this.router.navigate(['/', 'enterprise', 'camera_overlay', {
      from: 'my_expenses'
    }]);
  }

  async onAddTransactionToReport(event) {
    const addExpenseToReportModal = await this.modalController.create({
      component: AddTxnToReportDialogComponent,
      componentProps: {
        txId: event.tx_id
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties()
    });
    await addExpenseToReportModal.present();

    const { data } = await addExpenseToReportModal.onDidDismiss();
    if (data && data.reload) {
      this.doRefresh();
    }
  }

  showAddToReportSuccessToast(config: { message: string, report}) {
    const expensesAddedToReportSnackBar = this.matSnackBar.openFromComponent(ToastMessageComponent, {
      data: {
        icon: 'tick-square-filled',
        message: config.message,
        redirectionText: 'View Report',
        showCloseButton: true
      },
      panelClass: ['mat-snack-bar-success'],
      duration: 3000,
    });

    this.isReportableExpensesSelected = false;
    this.selectionMode = false;
    this.headerState = HeaderState.base;
    this.doRefresh();

    expensesAddedToReportSnackBar.onAction().subscribe(() => {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: config.report.rp_id || config.report.id, navigateBack: true }]);
    });
    
  }

  addTransactionsToReport(report: ExtendedReport, selectedExpensesId: string[]): Observable<ExtendedReport> {
    return from(this.loaderService.showLoader('Adding transaction to report')).pipe(
      switchMap(() => {
        return this.reportService.addTransactions(report.rp_id, selectedExpensesId).pipe(
          map(() => report)
        )
      }),
      finalize(() => this.loaderService.hideLoader())
    ) 
  }

  showOldReportsMatBottomSheet() {
    let reportAbleExpenses = this.transactionService.getReportableExpenses(this.selectedElements);
    let selectedExpensesId = reportAbleExpenses.map(expenses => expenses.tx_id);

    this.openReports$.pipe(
      switchMap((openReports) => {
        const addTxnToReportDialog = this.matBottomSheet.open(AddTxnToReportDialogComponent, {
          data: { openReports },
          panelClass: ['mat-bottom-sheet-1']
        });
        return addTxnToReportDialog.afterDismissed();
      }),
      switchMap((data) => {
        if (data && data.report) {
          return this.addTransactionsToReport(data.report, selectedExpensesId);
        } else {
          return of(null);
        }
      }),
    ).subscribe((report: ExtendedReport) => {
      if (report) {
        let message = '';
        if (report.rp_state.toLowerCase() === 'draft') {
          message = 'Expenses added to an existing draft report';
        } else {
          message = 'Expenses added to report successfully';
        }
        this.showAddToReportSuccessToast({message, report});
      }
    })

  }

  async openActionSheet() {
    const that = this;
    const actionSheet = await this.actionSheetController.create({
      header: 'ADD EXPENSE',
      mode: 'md',
      cssClass: 'fy-action-sheet',
      buttons: that.actionSheetButtons
    });
    await actionSheet.present();
  }

  async deleteSelectedExpenses() {
    const deletePopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      componentProps: {
        header: 'Delete Expense',
        body: `Are you sure you want to delete the ${this.selectedElements.length} expenses?`,
        deleteMethod: () => {
          return this.transactionService.deleteBulk(
              this.selectedElements.map(selectedExpense => selectedExpense.tx_id)
          );
        }
      }
    });

    await deletePopover.present();

    const { data } = await deletePopover.onDidDismiss();

    if (data) {
      this.trackingService.myExpensesBulkDeleteExpenses({
        Asset:'Mobile',
        count: this.selectedElements.length
      });
      if (data.status === 'success') {
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          data: {
            icon: 'tick-square-filled',
            message: `${this.selectedElements.length} Expenses have been deleted`,
            showCloseButton: true
          },
          panelClass: ['mat-snack-bar-success'],
          duration: 3000,
        });
      } else {
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          data: {
            icon: 'tick-square-filled',
            message: 'We could not delete the expenses. Please try again ',
            showCloseButton: true
          },
          panelClass: ['mat-snack-bar-error'],
          duration: 3000,
        });
      }

      this.doRefresh();
    }

  }

  onSelectAll(checked: boolean) {
    if (checked) {
      this.loadData$.pipe(
          take(1),
          map(params => {
            let queryParams = params.queryParams || {};

            queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';
            queryParams.tx_state = 'in.(COMPLETE,DRAFT)';
            queryParams = this.apiV2Service.extendQueryParamsForTextSearch(queryParams, params.searchString);
            return queryParams;
          }),
          switchMap(queryParams => this.transactionService.getAllExpenses({queryParams}))
      ).subscribe(allExpenses => {
        this.selectedElements = allExpenses;
        this.allExpensesCount = allExpenses.length;
        this.isReportableExpensesSelected = this.transactionService.getReportableExpenses(this.selectedElements).length > 0;
        this.setExpenseStatsOnSelect();
      });
    } else {
      this.selectedElements = [];
      this.isReportableExpensesSelected = this.transactionService.getReportableExpenses(this.selectedElements).length > 0;
      this.setExpenseStatsOnSelect();
    }
  }

  onSimpleSearchCancel() {
    this.headerState = HeaderState.base;
    this.clearText();
  }

  onFilterPillsClearAll() {
    this.clearFilters();
  }

  async onFilterClick(filterType: string) {
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
    }
  }

  onFilterClose(filterType: string) {
    delete this.filters[filterType];
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    this.filterPills = this.generateFilterPills(this.filters);
  }

  onHomeClicked() {
    const queryParams: Params = { state: 'home' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams
    });

  }


  onTaskClicked() {
    const queryParams: Params = { state: 'tasks' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams
    });
  }

  onCameraClicked() {
    this.router.navigate(['/', 'enterprise', 'camera_overlay', {
      navigate_back: true
    }]);
  }
  
}
