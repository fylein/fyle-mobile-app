import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { NetworkService } from '../../core/services/network.service';
import { LoaderService } from '../../core/services/loader.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { DateService } from '../../core/services/date.service';
import { CurrencyService } from '../../core/services/currency.service';
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router';
import { TransactionsOutboxService } from '../../core/services/transactions-outbox.service';
import { OfflineService } from '../../core/services/offline.service';
import { PopupService } from '../../core/services/popup.service';
import {
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
import { BehaviorSubject, concat, forkJoin, from, fromEvent, iif, noop, Observable, of, Subject } from 'rxjs';
import { CorporateCreditCardExpenseService } from '../../core/services/corporate-credit-card-expense.service';
import { CorporateCardExpense } from '../../core/models/v2/corporate-card-expense.model';
import { CorporateCardExpensesSortFilterComponent } from './corporate-card-expenses-sort-filter/corporate-card-expenses-sort-filter.component';
import { CorporateCardExpensesSearchFilterComponent } from './corporate-card-expenses-search-filter/corporate-card-expenses-search-filter.component';

@Component({
  selector: 'app-corporate-card-expenses',
  templateUrl: './corporate-card-expenses.page.html',
  styleUrls: ['./corporate-card-expenses.page.scss'],
})
export class CorporateCardExpensesPage implements OnInit {
  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef;

  cardTransactions$: Observable<CorporateCardExpense[]>;

  count$: Observable<number>;

  isInfiniteScrollRequired$: Observable<boolean>;

  loadData$: BehaviorSubject<
    Partial<{
      pageNumber: number;
      queryParams: any;
      sortParam: string;
      sortDir: string;
      searchString: string;
    }>
  >;

  currentPageNumber = 1;

  acc = [];

  homeCurrency$: Observable<string>;

  filters: Partial<{
    state: string;
    date: string;
    customDateStart: Date;
    customDateEnd: Date;
    sortParam: string;
    sortDir: string;
  }>;

  isConnected$: Observable<boolean>;

  unclassifiedExpensesCountHeader$: Observable<number>;

  classifiedExpensesCountHeader$: Observable<number>;

  navigateBack = false;

  baseState = 'unclassified';

  simpleSearchText = '';

  onPageExit = new Subject();

  constructor(
    private networkService: NetworkService,
    private loaderService: LoaderService,
    private dateService: DateService,
    private currencyService: CurrencyService,
    private popoverController: PopoverController,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  clearText() {
    this.simpleSearchText = '';
    const searchInput = this.simpleSearchInput.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;
    this.acc = [];
    this.simpleSearchText = '';

    this.currentPageNumber = 1;
    this.loadData$ = new BehaviorSubject({
      pageNumber: 1,
    });

    this.baseState = 'unclassified';

    this.homeCurrency$ = this.currencyService.getHomeCurrency();

    this.simpleSearchInput.nativeElement.value = '';

    fromEvent(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.srcElement.value as string),
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

    const paginatedPipe = this.loadData$.pipe(
      switchMap((params) => {
        let defaultState;
        if (this.baseState === 'unclassified') {
          defaultState = 'in.(INITIALIZED)';
        } else if (this.baseState === 'classified') {
          defaultState = 'in.(IN_PROGRESS,SETTLED)';
        }

        const queryParams = params.queryParams || {};
        queryParams.state = queryParams.state || defaultState;

        const orderByParams = params.sortParam && params.sortDir ? `${params.sortParam}.${params.sortDir}` : null;
        return this.corporateCreditCardExpenseService.getv2CardTransactions({
          offset: (params.pageNumber - 1) * 10,
          limit: 10,
          queryParams,
          order: orderByParams,
        });
      }),
      map((res) => {
        if (this.currentPageNumber === 1) {
          this.acc = [];
        }
        this.acc = this.acc.concat(res.data);
        return this.acc;
      })
    );

    const simpleSearchAllDataPipe = this.loadData$.pipe(
      switchMap((params) => {
        let defaultState;
        if (this.baseState === 'unclassified') {
          defaultState = 'in.(INITIALIZED)';
        } else if (this.baseState === 'classified') {
          defaultState = 'in.(IN_PROGRESS,SETTLED)';
        }

        const queryParams = params.queryParams || {};
        queryParams.state = queryParams.state || defaultState;

        const orderByParams = params.sortParam && params.sortDir ? `${params.sortParam}.${params.sortDir}` : null;

        return from(this.loaderService.showLoader()).pipe(
          switchMap(() =>
            this.corporateCreditCardExpenseService
              .getAllv2CardTransactions({
                queryParams,
                order: orderByParams,
              })
              .pipe(
                map((expenses) =>
                  expenses.filter((expense) =>
                    Object.values(expense)
                      .map((value) => value && value.toString().toLowerCase())
                      .filter((value) => !!value)
                      .some((value) => value.toLowerCase().includes(params.searchString.toLowerCase()))
                  )
                )
              )
          ),
          finalize(() => from(this.loaderService.hideLoader()))
        );
      })
    );

    this.baseState = this.activatedRoute.snapshot.params.pageState || 'unclassified';

    this.cardTransactions$ = this.loadData$.pipe(
      switchMap((params) =>
        iif(() => params.searchString && params.searchString !== '', simpleSearchAllDataPipe, paginatedPipe)
      ),
      shareReplay(1)
    );

    this.count$ = this.loadData$.pipe(
      switchMap((params) => {
        let defaultState;
        if (this.baseState === 'unclassified') {
          defaultState = 'in.(INITIALIZED)';
        } else if (this.baseState === 'classified') {
          defaultState = 'in.(IN_PROGRESS,SETTLED)';
        }

        const queryParams = params.queryParams || {};
        queryParams.state = queryParams.state || defaultState;
        return this.corporateCreditCardExpenseService.getv2CardTransactionsCount(queryParams);
      }),
      shareReplay(1)
    );

    this.unclassifiedExpensesCountHeader$ = this.corporateCreditCardExpenseService.getv2CardTransactionsCount({
      state: 'in.(INITIALIZED)',
    });

    this.classifiedExpensesCountHeader$ = this.corporateCreditCardExpenseService.getv2CardTransactionsCount({
      state: 'in.(IN_PROGRESS,SETTLED)',
    });

    const paginatedScroll$ = this.cardTransactions$.pipe(
      switchMap((cardTxns) => this.count$.pipe(map((count) => count > cardTxns.length)))
    );

    this.isInfiniteScrollRequired$ = this.loadData$.pipe(
      switchMap((params) => iif(() => params.searchString && params.searchString !== '', of(false), paginatedScroll$))
    );

    this.loadData$.subscribe((params) => {
      const queryParams: Params = { filters: JSON.stringify(this.filters) };
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
        replaceUrl: true,
      });
    });

    this.cardTransactions$.subscribe(noop);
    this.count$.subscribe(noop);
    this.isInfiniteScrollRequired$.subscribe(noop);

    if (this.activatedRoute.snapshot.queryParams.filters) {
      this.filters = Object.assign({}, this.filters, JSON.parse(this.activatedRoute.snapshot.queryParams.filters));
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
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit),
      shareReplay(1)
    );

    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }

  loadData(event) {
    this.currentPageNumber = this.currentPageNumber + 1;
    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.loadData$.next(params);
    setTimeout(() => {
      event?.target?.complete();
    }, 1000);
  }

  doRefresh(event?) {
    this.currentPageNumber = 1;
    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.loadData$.next(params);
    if (event) {
      event?.target?.complete();
    }
  }

  addNewFiltersToParams() {
    const currentParams = this.loadData$.getValue();
    currentParams.pageNumber = 1;
    const newQueryParams: any = {};

    if (this.filters.date) {
      if (this.filters.date === 'THISMONTH') {
        const thisMonth = this.dateService.getThisMonthRange();
        newQueryParams.and = `(txn_dt.gte.${thisMonth.from.toISOString()},txn_dt.lt.${thisMonth.to.toISOString()})`;
      } else if (this.filters.date === 'LASTMONTH') {
        const lastMonth = this.dateService.getLastMonthRange();
        newQueryParams.and = `(txn_dt.gte.${lastMonth.from.toISOString()},txn_dt.lt.${lastMonth.to.toISOString()})`;
      } else if (this.filters.date === 'CUSTOMDATE') {
        newQueryParams.and = `(txn_dt.gte.${this.filters.customDateStart.toISOString()},txn_dt.lt.${this.filters.customDateEnd.toISOString()})`;
      }
    }

    if (this.filters.sortParam && this.filters.sortDir) {
      currentParams.sortParam = this.filters.sortParam;
      currentParams.sortDir = this.filters.sortDir;
    } else {
      currentParams.sortParam = 'txn_dt';
      currentParams.sortDir = 'desc';
    }

    currentParams.queryParams = newQueryParams;
    return currentParams;
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

  async openFilters() {
    const filterModal = await this.popoverController.create({
      component: CorporateCardExpensesSearchFilterComponent,
      componentProps: {
        filters: this.filters,
      },
      cssClass: 'dialog-popover',
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
    const sortModal = await this.popoverController.create({
      component: CorporateCardExpensesSortFilterComponent,
      componentProps: {
        filters: this.filters,
      },
      cssClass: 'dialog-popover',
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

  goToTransaction(cccTxn) {
    if (this.baseState === 'unclassified') {
      this.router.navigate([
        '/',
        'enterprise',
        'ccc_classify_actions',
        { cccTransactionId: cccTxn.id, pageState: this.baseState },
      ]);
    } else {
      this.router.navigate([
        '/',
        'enterprise',
        'ccc_classified_actions',
        { cccTransactionId: cccTxn.id, pageState: this.baseState },
      ]);
    }
  }
}
