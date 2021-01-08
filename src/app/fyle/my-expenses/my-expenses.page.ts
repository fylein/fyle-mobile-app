import {Component, ElementRef, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, concat, EMPTY, forkJoin, from, fromEvent, iif, noop, Observable, of} from 'rxjs';
import {NetworkService} from 'src/app/core/services/network.service';
import {LoaderService} from 'src/app/core/services/loader.service';
import {ModalController, PopoverController} from '@ionic/angular';
import {DateService} from 'src/app/core/services/date.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {catchError, debounceTime, distinctUntilChanged, finalize, map, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {TransactionService} from 'src/app/core/services/transaction.service';
import {MyExpensesSearchFilterComponent} from './my-expenses-search-filter/my-expenses-search-filter.component';
import {MyExpensesSortFilterComponent} from './my-expenses-sort-filter/my-expenses-sort-filter.component';
import {Expense} from 'src/app/core/models/expense.model';
import {CurrencyService} from 'src/app/core/services/currency.service';
import {AddExpensePopoverComponent} from './add-expense-popover/add-expense-popover.component';
import {TransactionsOutboxService} from 'src/app/core/services/transactions-outbox.service';
import {OfflineService} from 'src/app/core/services/offline.service';
import {PopupService} from 'src/app/core/services/popup.service';
import {AddTxnToReportDialogComponent} from './add-txn-to-report-dialog/add-txn-to-report-dialog.component';

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
  filters: Partial<{
    state: string;
    date: string;
    customDateStart: Date;
    customDateEnd: Date;
    sortParam: string;
    sortDir: string;
  }>;
  baseState: string;
  allExpensesCount$: Observable<number>;
  draftExpensesCount$: Observable<number>;
  expensesAmountStats$: Observable<number>;
  homeCurrency$: Observable<string>;
  isInstaFyleEnabled$: Observable<boolean>;
  isMileageEnabled$: Observable<boolean>;
  isPerDiemEnabled$: Observable<boolean>;
  pendingTransactions = [];
  selectionMode = false;
  selectedElements: string[];
  syncing = false;
  simpleSearchText = '';
  allExpenseCountHeader$: Observable<number>;
  navigateBack = false;

  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef;

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
    private popupService: PopupService
  ) { }

  clearText() {
    this.simpleSearchText = '';
    const searchInput = this.simpleSearchInput.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ngOnInit() {
    this.setupNetworkWatcher();
    this.isInstaFyleEnabled$ = this.offlineService.getOrgUserSettings().pipe(
      map(orgUserSettings => orgUserSettings && orgUserSettings.insta_fyle_settings && orgUserSettings.insta_fyle_settings.enabled)
    );

    this.isMileageEnabled$ = this.offlineService.getOrgSettings().pipe(
      map(orgSettings => orgSettings.mileage.enabled)
    );
    this.isPerDiemEnabled$ = this.offlineService.getOrgSettings().pipe(
      map(orgSettings => orgSettings.per_diem.enabled)
    );
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

  switchSelectionMode() {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) {
      this.selectedElements = [];
    }
  }

  ionViewWillEnter() {
    this.loaderService.showLoader('Loading Expenses...', 1000);
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
      finalize(() => this.syncing = false)
    ).subscribe(() => {
      this.pendingTransactions = this.formatTransactions(this.transactionOutboxService.getPendingTransactions());

      if (this.pendingTransactions.length === 0) {
        this.doRefresh();
      }
    });

    this.baseState = 'all';
    if (this.activatedRoute.snapshot.params.state === 'needsReview') {
      this.baseState = 'draft';
    }
    this.homeCurrency$ = this.currencyService.getHomeCurrency();

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
      tap(console.log),
      switchMap((params) => {
        let defaultState;
        if (this.baseState === 'all') {
          defaultState = 'in.(COMPLETE,DRAFT)';
        } else if (this.baseState === 'draft') {
          defaultState = 'in.(DRAFT)';
        }

        const queryParams = params.queryParams || {};
        queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';
        queryParams.tx_state = queryParams.tx_state || defaultState;

        const orderByParams = (params.sortParam && params.sortDir) ? `${params.sortParam}.${params.sortDir}` : null;
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
        if (this.currentPageNumber === 1) {
          this.acc = [];
        }
        this.acc = this.acc.concat(res.data);
        return this.acc;
      })
    );

    const simpleSearchAllDataPipe = this.loadData$.pipe(
      switchMap(params => {
        const queryParams = params.queryParams || {};

        let defaultState;
        if (this.baseState === 'all') {
          defaultState = 'in.(COMPLETE,DRAFT)';
        } else if (this.baseState === 'draft') {
          defaultState = 'in.(DRAFT)';
        }

        queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';

        if (this.baseState === 'draft') {
          queryParams.tx_state = defaultState;
        } else {
          queryParams.tx_state = queryParams.tx_state || defaultState;
        }

        const orderByParams = (params.sortParam && params.sortDir) ? `${params.sortParam}.${params.sortDir}` : null;

        return this.transactionService.getAllExpenses({
          queryParams,
          order: orderByParams
        }).pipe(
          map(expenses => expenses.filter(expense => {
            return Object.values(expense)
              .map(value => value && value.toString().toLowerCase())
              .filter(value => !!value)
              .some(value => value.toLowerCase().includes(params.searchString.toLowerCase()));
          }))
        );
      })
    );

    this.myExpenses$ = this.loadData$.pipe(
      switchMap(params => {
        return iif(() => (params.searchString && params.searchString !== ''), simpleSearchAllDataPipe, paginatedPipe);
      }),
      shareReplay()
    );

    this.count$ = this.loadData$.pipe(
      switchMap(params => {
        const queryParams = params.queryParams || {};

        let defaultState;
        if (this.baseState === 'all') {
          defaultState = 'in.(COMPLETE,DRAFT)';
        } else if (this.baseState === 'draft') {
          defaultState = 'in.(DRAFT)';
        }

        queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';
        queryParams.tx_state = queryParams.tx_state || defaultState;

        return this.transactionService.getMyExpensesCount(queryParams);
      }),
      tap(count => console.log({ count })),
      shareReplay()
    );

    const paginatedScroll$ = this.myExpenses$.pipe(
      switchMap(erpts => {
        return this.count$.pipe(
          map(count => {
            return count > erpts.length;
          }));
      })
    );

    this.isInfiniteScrollRequired$ = this.loadData$.pipe(
      switchMap(params => {
        return iif(() => (params.searchString && params.searchString !== ''), of(false), paginatedScroll$);
      })
    );

    this.allExpensesCount$ = this.loadData$.pipe(
      switchMap((params) => {
        const queryParams = params.queryParams || {};

        let defaultState;
        if (this.baseState === 'all') {
          defaultState = 'in.(COMPLETE,DRAFT)';
        } else if (this.baseState === 'draft') {
          defaultState = 'in.(DRAFT)';
        }

        queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';
        queryParams.tx_state = queryParams.tx_state || defaultState;

        return this.transactionService.getTransactionStats('count(tx_id),sum(tx_amount)', {
          scalar: true,
          ...queryParams
        }).pipe(
          catchError(err => EMPTY),
          map(stats => {
            const count = stats &&  stats[0] && stats[0].aggregates.find(stat => stat.function_name === 'count(tx_id)');
            return count && count.function_value;
          })
        );
      })
    );

    this.allExpenseCountHeader$ = this.transactionService.getTransactionStats('count(tx_id),sum(tx_amount)', {
      scalar: true,
      tx_state: 'in.(COMPLETE,DRAFT)',
      tx_report_id: 'is.null'
    }).pipe(
      map(stats => {
        const count = stats &&  stats[0] && stats[0].aggregates.find(stat => stat.function_name === 'count(tx_id)');
        return count && count.function_value;
      })
    );

    this.draftExpensesCount$ = this.transactionService.getTransactionStats('count(tx_id),sum(tx_amount)', {
      scalar: true,
      tx_report_id: 'is.null',
      tx_state: 'in.(DRAFT)'
    }).pipe(
      map(stats => {
        const count = stats &&  stats[0] && stats[0].aggregates.find(stat => stat.function_name === 'count(tx_id)');
        return count && count.function_value;
      })
    );

    this.expensesAmountStats$ = this.loadData$.pipe(
      switchMap(params => {
        const queryParams = params.queryParams || {};

        let defaultState;
        if (this.baseState === 'all') {
          defaultState = 'in.(COMPLETE,DRAFT)';
        } else if (this.baseState === 'draft') {
          defaultState = 'in.(DRAFT)';
        }

        queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';
        queryParams.tx_state = queryParams.tx_state || defaultState;

        return this.transactionService.getTransactionStats('count(tx_id),sum(tx_amount)', {
          scalar: true,
          ...queryParams
        });
      }),
      map(stats => {
        const sum = stats &&  stats[0] && stats[0].aggregates.find(stat => stat.function_name === 'sum(tx_amount)');
        return (sum && sum.function_value) || 0;
      })
    );

    this.loadData$.subscribe(params => {
      console.log(params);
      const queryParams: Params = { filters: JSON.stringify(this.filters) };
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams
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
    } else {
      this.clearFilters();
    }
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
    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.loadData$.next(params);
    if (event) {
      event.target.complete();
    }
  }

  addNewFiltersToParams() {
    const currentParams = this.loadData$.getValue();
    currentParams.pageNumber = 1;
    const newQueryParams: any = {};

    if (this.filters.state) {
      newQueryParams.tx_report_id = 'is.null';
      if (this.filters.state === 'READY_TO_REPORT') {
        newQueryParams.tx_state = 'in.(COMPLETE)';
        newQueryParams.or = '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)';
      } else if (this.filters.state === 'POLICY_VIOLATED') {
        newQueryParams.tx_policy_flag = 'eq.true';
        newQueryParams.or = '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)';
      } else if (this.filters.state === 'CANNOT_REPORT') {
        newQueryParams.tx_policy_amount = 'lt.0.0001';
      } else if (this.filters.state === 'NEEDS_RECEIPT') {
        newQueryParams.tx_receipt_required = 'eq.true';
      }
    }

    if (this.filters.date) {
      if (this.filters.date === 'THISMONTH') {
        newQueryParams.and =
          `(tx_txn_dt.gte.${this.dateService.getThisMonthRange().from.toISOString()},tx_txn_dt.lt.${this.dateService.getThisMonthRange().to.toISOString()})`;
      } else if (this.filters.date === 'LASTMONTH') {
        newQueryParams.and =
          `(tx_txn_dt.gte.${this.dateService.getLastMonthRange().from.toISOString()},tx_txn_dt.lt.${this.dateService.getLastMonthRange().to.toISOString()})`;
      } else if (this.filters.date === 'CUSTOMDATE') {
        newQueryParams.and =
          `(tx_txn_dt.gte.${this.filters.customDateStart.toISOString()},tx_txn_dt.lt.${this.filters.customDateEnd.toISOString()})`;
      }
    }

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

  async openFilters() {
    const filterModal = await this.modalController.create({
      component: MyExpensesSearchFilterComponent,
      componentProps: {
        filters: this.filters,
        draftMode: this.baseState === 'draft'
      }
    });

    await filterModal.present();

    const { data } = await filterModal.onWillDismiss();
    if (data) {
      this.filters = Object.assign({}, this.filters, data.filters);
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
    }
  }


  async openSort() {
    const sortModal = await this.modalController.create({
      component: MyExpensesSortFilterComponent,
      componentProps: {
        filters: this.filters
      }
    });

    await sortModal.present();

    const { data } = await sortModal.onWillDismiss();
    if (data) {
      this.filters = Object.assign({}, this.filters, data.sortOptions);
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
    }
  }

  clearFilters() {
    this.filters = {};
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
  }

  setState(state: string) {
    this.baseState = state;
    this.clearFilters();
  }

  async addNewExpense() {
    forkJoin({
      isInstaFyleEnabled: this.isInstaFyleEnabled$,
      isMileageEnabled: this.isMileageEnabled$,
      isPerDiemEnabled: this.isPerDiemEnabled$
    }).subscribe(async ({ isInstaFyleEnabled, isMileageEnabled, isPerDiemEnabled }) => {
      if (!(isInstaFyleEnabled || isMileageEnabled || isPerDiemEnabled)) {
        this.router.navigate(['/', 'enterprise', 'add_edit_expense']);
      } else {

        const addExpensePopover = await this.popoverController.create({
          component: AddExpensePopoverComponent,
          componentProps: {
            isInstaFyleEnabled,
            isMileageEnabled,
            isPerDiemEnabled
          },
          cssClass: 'dialog-popover'
        });

        await addExpensePopover.present();
      }
    });
  }

  async onDeleteExpenseClick(etxn: Expense) {
    const popupResults = await this.popupService.showPopup({
      header: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      primaryCta: {
        text: 'Delete'
      }
    });

    if (popupResults === 'primary') {
      from(this.loaderService.showLoader()).pipe(
        switchMap(() => {
          return this.transactionService.delete(etxn.tx_id);
        }),
        finalize(async () => {
          await this.loaderService.hideLoader();
          this.doRefresh();
        })
      ).subscribe(noop);
    }
  }

  selectExpense(expense: Expense) {
    if (this.selectedElements.includes(expense.tx_id)) {
      this.selectedElements = this.selectedElements.filter(id => id !== expense.tx_id);
    } else {
      this.selectedElements.push(expense.tx_id);
    }
  }

  async showCannotEditActivityDialog() {
    const popupResult = await this.popupService.showPopup({
      header: 'Cannot Edit Activity Expense!',
      message: 'To edit this activity expense, you need to login to web version of Fyle app at <a href=""https://in1.fylehq.com>https://in1.fylehq.com</a>',
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
    // TODO: Leave for later
    if (category === 'activity') {
      this.showCannotEditActivityDialog();
      return;
    }
    if (category === 'mileage') {
      this.router.navigate(['/', 'enterprise', 'add_edit_mileage', { id: expense.tx_id }]);
    } else if (category === 'per diem') {
      this.router.navigate(['/', 'enterprise', 'add_edit_per_diem', { id: expense.tx_id }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'add_edit_expense', { id: expense.tx_id }]);
    }
  }

  onAddTransactionToNewReport(expense) {
    const transactionIds = JSON.stringify([expense.tx_id]);
    this.router.navigate(['/', 'enterprise', 'my_create_report', { txn_ids: transactionIds }]);
  }

  openCreateReportWithSelectedIds() {
    this.router.navigate(['/', 'enterprise', 'my_create_report', { txn_ids: JSON.stringify(this.selectedElements) }]);
  }

  openCreateReport() {
    this.router.navigate(['/', 'enterprise', 'my_create_report']);
  }

  openReviewExpenses() {
    const allDataPipe$ = this.loadData$.pipe(
      take(1),
      switchMap(params => {
        const queryParams = params.queryParams || {};

        let defaultState;
        if (this.baseState === 'all') {
          defaultState = 'in.(COMPLETE,DRAFT)';
        } else if (this.baseState === 'draft') {
          defaultState = 'in.(DRAFT)';
        }

        queryParams.tx_report_id = queryParams.tx_report_id || 'is.null';

        queryParams.tx_state = queryParams.tx_state || defaultState;

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
          return iif(() => this.selectedElements.length === 0, allDataPipe$, of(this.selectedElements));
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

  async onAddTransactionToReport(event) {
    const addExpenseToReportModal = await this.modalController.create({
      component: AddTxnToReportDialogComponent,
      componentProps: {
        txId: event.tx_id
      }
    });
    await addExpenseToReportModal.present();

    const { data } = await addExpenseToReportModal.onDidDismiss();
    if (data && data.reload) {
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
    }
  }
}
