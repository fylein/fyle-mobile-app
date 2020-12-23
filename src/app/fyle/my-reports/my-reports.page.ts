import { Component, OnInit, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { concat, Observable, Subject, from, noop, BehaviorSubject, fromEvent, iif, of } from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import { NetworkService } from 'src/app/core/services/network.service';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { concatMap, switchMap, finalize, map, scan, shareReplay, distinctUntilChanged, tap, debounceTime } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ModalController } from '@ionic/angular';
import { MyReportsSortFilterComponent } from './my-reports-sort-filter/my-reports-sort-filter.component';
import { MyReportsSearchFilterComponent } from './my-reports-search-filter/my-reports-search-filter.component';
import { DateService } from 'src/app/core/services/date.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { TransactionService } from '../../core/services/transaction.service';

@Component({
  selector: 'app-my-reports',
  templateUrl: './my-reports.page.html',
  styleUrls: ['./my-reports.page.scss'],
})
export class MyReportsPage implements OnInit {

  isConnected$: Observable<boolean>;
  myReports$: Observable<ExtendedReport[]>;
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
  homeCurrency$: Observable<string>;
  navigateBack = false;
  searchText = '';
  expensesAmountStats$: Observable<{
    sum: number,
    count: number
  }>;

  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef;

  constructor(
    private networkService: NetworkService,
    private loaderService: LoaderService,
    private reportService: ReportService,
    private modalController: ModalController,
    private dateService: DateService,
    private router: Router,
    private currencyService: CurrencyService,
    private activatedRoute: ActivatedRoute,
    private popupService: PopupService,
    private transactionService: TransactionService
  ) { }

  ngOnInit() {
    this.setupNetworkWatcher();
  }

  clearText() {
    this.searchText = '';
    const searchInput = this.simpleSearchInput.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ionViewWillEnter() {
    this.searchText = '';
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;
    console.log(this.navigateBack);
    this.acc = [];

    this.currentPageNumber = 1;
    this.loadData$ = new BehaviorSubject({
      pageNumber: 1
    });
    this.homeCurrency$ = this.currencyService.getHomeCurrency();

    fromEvent(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.srcElement.value as string),
        tap(console.log),
        distinctUntilChanged(),
        debounceTime(1000)
      ).subscribe((searchString) => {
        const currentParams = this.loadData$.getValue();
        currentParams.searchString = searchString;
        this.currentPageNumber = 1;
        currentParams.pageNumber = this.currentPageNumber;
        this.loadData$.next(currentParams);
        const searchInput = this.simpleSearchInput.nativeElement as HTMLInputElement;
        searchInput.focus();
      });

    const paginatedPipe = this.loadData$.pipe(
      switchMap((params) => {
        const queryParams = params.queryParams || { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' };
        const orderByParams = (params.sortParam && params.sortDir) ? `${params.sortParam}.${params.sortDir}` : null;
        return from(this.loaderService.showLoader()).pipe(switchMap(() => {
          return this.reportService.getMyReports({
            offset: (params.pageNumber - 1) * 10,
            limit: 10,
            queryParams,
            order: orderByParams
          });
        }),
          finalize(() => from(this.loaderService.hideLoader()))
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
        const queryParams = params.queryParams || { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' };
        const orderByParams = (params.sortParam && params.sortDir) ? `${params.sortParam}.${params.sortDir}` : null;

        return from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.reportService.getAllExtendedReports({
              queryParams,
              order: orderByParams
            }).pipe(
              map(erpts => erpts.filter(erpt => {
                return Object.values(erpt)
                  .map(value => value && value.toString().toLowerCase())
                  .filter(value => !!value)
                  .some(value => value.toLowerCase().includes(params.searchString.toLowerCase()));
              }))
            );
          }),
          finalize(() => from(this.loaderService.hideLoader()))
        );
      })
    );

    this.myReports$ = this.loadData$.pipe(
      switchMap(params => {
        return iif(() => (params.searchString && params.searchString !== ''), simpleSearchAllDataPipe, paginatedPipe);
      }),
      shareReplay()
    );

    this.count$ = this.loadData$.pipe(
      switchMap(params => {
        return this.reportService.getMyReportsCount(params.queryParams);
      }),
      shareReplay()
    );

    const paginatedScroll$ = this.myReports$.pipe(
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

    this.loadData$.subscribe(params => {
      const queryParams: Params = { filters: JSON.stringify(this.filters) };
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams
      });
    });

    this.expensesAmountStats$ = this.transactionService.getTransactionStats('count(tx_id),sum(tx_amount)', {
      scalar: true,
      tx_report_id: 'is.null',
      tx_state: 'in.(COMPLETE)',
      or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)'
    }).pipe(
      map(stats => {
        const sum = stats &&  stats[0] && stats[0].aggregates.find(stat => stat.function_name === 'sum(tx_amount)');
        const count = stats &&  stats[0] && stats[0].aggregates.find(stat => stat.function_name === 'count(tx_id)');
        return {
          sum: sum && sum.function_value || 0,
          count: count && count.function_value || 0
        };
      })
    );

    this.myReports$.subscribe(noop);
    this.count$.subscribe(noop);
    this.isInfiniteScrollRequired$.subscribe(noop);

    if (this.activatedRoute.snapshot.queryParams.filters) {
      this.filters = Object.assign({}, this.filters, JSON.parse(this.activatedRoute.snapshot.queryParams.filters));
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
    } else if (this.activatedRoute.snapshot.params.state) {
      const filters = {
        rp_state: `in.(${this.activatedRoute.snapshot.params.state.toLowerCase()})`,
        state: this.activatedRoute.snapshot.params.state.toUpperCase()};

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
    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    });
  }

  loadData(event) {
    this.currentPageNumber = this.currentPageNumber + 1;
    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.loadData$.next(params);
    event.target.complete();
  }

  doRefresh(event?) {
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
      if (this.filters.state === 'ALL') {
        newQueryParams.rp_state =
          'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)';
      } else {
        newQueryParams.rp_state =
          `in.(${this.filters.state})`;

      }
    }

    if (this.filters.date) {
      if (this.filters.date === 'THISMONTH') {
        newQueryParams.and =
          `(rp_created_at.gte.${this.dateService.getThisMonthRange().from.toISOString()},rp_created_at.lt.${this.dateService.getThisMonthRange().to.toISOString()})`;
      } else if (this.filters.date === 'LASTMONTH') {
        newQueryParams.and =
          `(rp_created_at.gte.${this.dateService.getLastMonthRange().from.toISOString()},rp_created_at.lt.${this.dateService.getLastMonthRange().to.toISOString()})`;
      } else if (this.filters.date === 'CUSTOMDATE') {
        newQueryParams.and =
          `(rp_created_at.gte.${this.filters.customDateStart.toISOString()},rp_created_at.lt.${this.filters.customDateEnd.toISOString()})`;
      }
    }

    if (this.filters.sortParam && this.filters.sortDir) {
      currentParams.sortParam = this.filters.sortParam;
      currentParams.sortDir = this.filters.sortDir;
    } else {
      currentParams.sortParam = 'rp_created_at';
      currentParams.sortDir = 'desc';
    }

    currentParams.queryParams = newQueryParams;

    return currentParams;
  }

  async openFilters() {
    const filterModal = await this.modalController.create({
      component: MyReportsSearchFilterComponent,
      componentProps: {
        filters: this.filters
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
      component: MyReportsSortFilterComponent,
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

  onReportClick(erpt: ExtendedReport) {
    this.router.navigate(['/', 'enterprise', 'my_view_report', { id: erpt.rp_id, navigateBack: true }]);
  }

  async onDeleteReportClick(erpt: ExtendedReport) {
    if (['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'].indexOf(erpt.rp_state) === -1) {
      await this.popupService.showPopup({
        header: 'Cannot Delete Report',
        message: 'Report cannot be deleted',
        primaryCta: {
          text: 'Close'
        }
      });
    } else {
      const popupResults = await this.popupService.showPopup({
        header: 'Delete Report',
        message: `
          <p class="highlight-info">
            On deleting this report, all the associated expenses will be moved to <strong>My Expenses</strong> list.
          </p>
          <p>
            Are you sure, you want to delete this report?
          </p>
        `,
        primaryCta: {
          text: 'Delete'
        }
      });

      if (popupResults === 'primary') {
        from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.reportService.delete(erpt.rp_id);
          }),
          finalize(async () => {
            await this.loaderService.hideLoader();
            this.doRefresh();
          })
        ).subscribe(noop);
      }
    }
  }

  onViewCommentsClick(event) {
    // TODO: Add when view comments is done
  }
}
