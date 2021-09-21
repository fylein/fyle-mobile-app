import { Component, OnInit, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { concat, Observable, Subject, from, noop, BehaviorSubject, fromEvent, iif, of } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NetworkService } from 'src/app/core/services/network.service';
import { ExtendedReport } from 'src/app/core/models/report.model';
import {
  concatMap,
  switchMap,
  finalize,
  map,
  scan,
  shareReplay,
  distinctUntilChanged,
  tap,
  debounceTime,
  takeUntil,
} from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { MyReportsSortFilterComponent } from './my-reports-sort-filter/my-reports-sort-filter.component';
import { MyReportsSearchFilterComponent } from './my-reports-search-filter/my-reports-search-filter.component';
import { DateService } from 'src/app/core/services/date.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { TransactionService } from '../../core/services/transaction.service';
import { capitalize, replace } from 'lodash';
import { TrackingService } from '../../core/services/tracking.service';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { FilterOptions } from '../../shared/components/fy-filters/filter-options.interface';
import { FilterOptionType } from '../../shared/components/fy-filters/filter-option-type.enum';
import { DateFilters } from '../../shared/components/fy-filters/date-filters.enum';
import { SelectedFilters } from '../../shared/components/fy-filters/selected-filters.interface';
import { FilterPill } from '../../shared/components/fy-filter-pills/filter-pill.interface';

type Filters = Partial<{
  state: string[];
  date: string;
  customDateStart: Date;
  customDateEnd: Date;
  receiptsAttached: string;
  type: string[];
  sortParam: string;
  sortDir: string;
}>;
@Component({
  selector: 'app-my-reports',
  templateUrl: './my-reports.page.html',
  styleUrls: ['./my-reports.page.scss'],
})
export class MyReportsPage implements OnInit {
  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef;

  isConnected$: Observable<boolean>;

  myReports$: Observable<ExtendedReport[]>;

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

  filters: Filters;

  filterPills = [];

  homeCurrency$: Observable<string>;

  navigateBack = false;

  searchText = '';

  expensesAmountStats$: Observable<{
    sum: number;
    count: number;
  }>;

  isLoading = false;

  isSearchBarFocused = false;

  simpleSearchText = '';

  isLoadingDataInInfiniteScroll: boolean;

  onPageExit = new Subject();

  headerState: HeaderState = HeaderState.base;

  get HeaderState() {
    return HeaderState;
  }

  constructor(
    private networkService: NetworkService,
    private loaderService: LoaderService,
    private reportService: ReportService,
    private dateService: DateService,
    private router: Router,
    private currencyService: CurrencyService,
    private activatedRoute: ActivatedRoute,
    private popupService: PopupService,
    private transactionService: TransactionService,
    private popoverController: PopoverController,
    private trackingService: TrackingService,
    private apiV2Service: ApiV2Service,
    private modalController: ModalController
  ) {}

  ngOnInit() {}

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  clearText(isFromCancel) {
    this.simpleSearchText = '';
    const searchInput = this.simpleSearchInput.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
    if (isFromCancel === 'onSimpleSearchCancel') {
      this.isSearchBarFocused = !this.isSearchBarFocused;
    } else {
      this.isSearchBarFocused = !!this.isSearchBarFocused;
    }
  }

  onSearchBarFocus() {
    this.isSearchBarFocused = true;
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.setupNetworkWatcher();
    this.headerState = HeaderState.base;

    this.searchText = '';
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;
    this.acc = [];

    this.currentPageNumber = 1;
    this.loadData$ = new BehaviorSubject({
      pageNumber: 1,
    });
    this.homeCurrency$ = this.currencyService.getHomeCurrency();

    fromEvent(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.srcElement.value as string),
        distinctUntilChanged(),
        debounceTime(1000)
      )
      .subscribe((searchString) => {
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
        let queryParams = params.queryParams || {
          rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        };
        const orderByParams = params.sortParam && params.sortDir ? `${params.sortParam}.${params.sortDir}` : null;
        queryParams = this.apiV2Service.extendQueryParamsForTextSearch(queryParams, params.searchString);
        this.isLoadingDataInInfiniteScroll = true;
        return this.reportService.getMyReportsCount(queryParams).pipe(
          switchMap((count) => {
            if (count > (params.pageNumber - 1) * 10) {
              return this.reportService.getMyReports({
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
          })
        );
      }),
      map((res) => {
        this.isLoadingDataInInfiniteScroll = false;
        if (this.currentPageNumber === 1) {
          this.acc = [];
        }
        this.acc = this.acc.concat(res.data);
        return this.acc;
      })
    );

    this.myReports$ = paginatedPipe.pipe(shareReplay(1));

    this.count$ = this.loadData$.pipe(
      switchMap((params) => {
        let queryParams = params.queryParams || {
          rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        };
        queryParams = this.apiV2Service.extendQueryParamsForTextSearch(queryParams, params.searchString);
        return this.reportService.getMyReportsCount(queryParams);
      }),
      shareReplay(1)
    );

    const paginatedScroll$ = this.myReports$.pipe(
      switchMap((erpts) => this.count$.pipe(map((count) => count > erpts.length)))
    );

    this.isInfiniteScrollRequired$ = this.loadData$.pipe(switchMap((_) => paginatedScroll$));

    this.loadData$.subscribe((params) => {
      const queryParams: Params = { filters: JSON.stringify(this.filters) };
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
        replaceUrl: true,
      });
    });

    this.expensesAmountStats$ = this.loadData$.pipe(
      switchMap((_) =>
        this.transactionService
          .getTransactionStats('count(tx_id),sum(tx_amount)', {
            scalar: true,
            tx_report_id: 'is.null',
            tx_state: 'in.(COMPLETE)',
            or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
          })
          .pipe(
            map((stats) => {
              const sum =
                stats && stats[0] && stats[0].aggregates.find((stat) => stat.function_name === 'sum(tx_amount)');
              const count =
                stats && stats[0] && stats[0].aggregates.find((stat) => stat.function_name === 'count(tx_id)');
              return {
                sum: (sum && sum.function_value) || 0,
                count: (count && count.function_value) || 0,
              };
            })
          )
      )
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
        state: this.activatedRoute.snapshot.params.state.toUpperCase(),
      };

      this.filters = Object.assign({}, this.filters, filters);
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
    } else {
      this.clearFilters();
    }

    setTimeout(() => {
      this.isLoading = false;
    }, 500);
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
      event.target.complete();
    }, 1000);
  }

  doRefresh(event?) {
    this.currentPageNumber = 1;
    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.reportService.clearTransactionCache().subscribe(() => {
      this.loadData$.next(params);
      if (event) {
        event.target.complete();
      }
    });
  }

  addNewFiltersToParams() {
    const currentParams = this.loadData$.getValue();
    currentParams.pageNumber = 1;
    const newQueryParams: any = {
      or: [],
    };

    this.generateDateParams(newQueryParams);

    this.generateReceiptAttachedParams(newQueryParams);

    this.generateStateFilters(newQueryParams);

    this.generateTypeFilters(newQueryParams);

    this.setSortParams(currentParams);

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

  setSortParams(
    currentParams: Partial<{
      pageNumber: number;
      queryParams: any;
      sortParam: string;
      sortDir: string;
      searchString: string;
    }>
  ) {
    if (this.filters.sortParam && this.filters.sortDir) {
      currentParams.sortParam = this.filters.sortParam;
      currentParams.sortDir = this.filters.sortDir;
    } else {
      currentParams.sortParam = 'tx_txn_dt';
      currentParams.sortDir = 'desc';
    }
  }

  generateSelectedFilters(filter: Filters): SelectedFilters<any>[] {
    const generatedFilters: SelectedFilters<any>[] = [];

    if (filter.state) {
      generatedFilters.push({
        name: 'Type',
        value: filter.state,
      });
    }

    if (filter.receiptsAttached) {
      generatedFilters.push({
        name: 'Receipts Attached',
        value: filter.receiptsAttached,
      });
    }

    if (filter.date) {
      generatedFilters.push({
        name: 'Date',
        value: filter.date,
        associatedData: {
          startDate: filter.customDateStart,
          endDate: filter.customDateEnd,
        },
      });
    }

    if (filter.type) {
      generatedFilters.push({
        name: 'Expense Type',
        value: filter.type,
      });
    }

    if (filter.sortParam && filter.sortDir) {
      this.addSortToGeneratedFilters(filter, generatedFilters);
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
                value: 'READY_TO_REPORT',
              },
              {
                label: 'Policy Violated',
                value: 'POLICY_VIOLATED',
              },
              {
                label: 'Cannot Report',
                value: 'CANNOT_REPORT',
              },
              {
                label: 'Draft',
                value: 'DRAFT',
              },
            ],
          } as FilterOptions<string>,
          {
            name: 'Date',
            optionType: FilterOptionType.date,
            options: [
              {
                label: 'All',
                value: DateFilters.all,
              },
              {
                label: 'This Week',
                value: DateFilters.thisWeek,
              },
              {
                label: 'This Month',
                value: DateFilters.thisMonth,
              },
              {
                label: 'Last Month',
                value: DateFilters.lastMonth,
              },
              {
                label: 'Custom',
                value: DateFilters.custom,
              },
            ],
          } as FilterOptions<DateFilters>,
          {
            name: 'Receipts Attached',
            optionType: FilterOptionType.singleselect,
            options: [
              {
                label: 'Yes',
                value: 'YES',
              },
              {
                label: 'No',
                value: 'NO',
              },
            ],
          } as FilterOptions<string>,
          {
            name: 'Expense Type',
            optionType: FilterOptionType.multiselect,
            options: [
              {
                label: 'Mileage',
                value: 'Mileage',
              },
              {
                label: 'Per Diem',
                value: 'PerDiem',
              },
              {
                label: 'Regular Expenses',
                value: 'RegularExpenses',
              },
            ],
          } as FilterOptions<string>,
          {
            name: 'Sort By',
            optionType: FilterOptionType.singleselect,
            options: [
              {
                label: 'Date - New to Old',
                value: 'dateNewToOld',
              },
              {
                label: 'Date - Old to New',
                value: 'dateOldToNew',
              },
              {
                label: 'Amount - High to Low',
                value: 'amountHighToLow',
              },
              {
                label: 'Amount - Low to High',
                value: 'amountLowToHigh',
              },
              {
                label: 'Category - A to Z',
                value: 'categoryAToZ',
              },
              {
                label: 'Category - Z to A',
                value: 'categoryZToA',
              },
            ],
          } as FilterOptions<string>,
        ],
        selectedFilterValues: this.generateSelectedFilters(this.filters),
        activeFilterInitialName,
      },
      cssClass: 'dialog-popover',
    });

    await filterPopover.present();

    const { data } = await filterPopover.onWillDismiss();
    if (data) {
      this.filters = this.convertFilters(data);
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
      this.trackingService.myExpensesFilterApplied({
        ...this.filters,
      });
    }
  }

  async openSort() {
    const sortPopover = await this.popoverController.create({
      component: MyReportsSortFilterComponent,
      componentProps: {
        filters: this.filters,
      },
      cssClass: 'dialog-popover',
    });

    await sortPopover.present();
    const { data } = await sortPopover.onWillDismiss();
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
      const cannotDeleteReportPopOver = await this.popoverController.create({
        component: PopupAlertComponentComponent,
        componentProps: {
          title: 'Cannot Delete Report',
          message: `${capitalize(replace(erpt.rp_state, '_', ' '))} report cannot be deleted.`,
          primaryCta: {
            text: 'Close',
            action: 'continue',
          },
        },
        cssClass: 'pop-up-in-center',
      });

      await cannotDeleteReportPopOver.present();
    } else {
      const deleteReportPopover = await this.popoverController.create({
        component: FyDeleteDialogComponent,
        cssClass: 'delete-dialog',
        backdropDismiss: false,
        componentProps: {
          header: 'Delete Report',
          body: 'Are you sure you want to delete this report?',
          infoMessage: 'Deleting the report will not delete any of the expenses.',
          deleteMethod: () => this.reportService.delete(erpt.rp_id),
        },
      });

      await deleteReportPopover.present();
      const { data } = await deleteReportPopover.onDidDismiss();

      if (data && data.status === 'success') {
        from(this.loaderService.showLoader())
          .pipe(
            tap(() => this.trackingService.deleteReport()),
            finalize(async () => {
              await this.loaderService.hideLoader();
              this.doRefresh();
            })
          )
          .subscribe(noop);
      }
    }
  }

  onHomeClicked() {
    const queryParams: Params = { state: 'home' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });
  }

  onTaskClicked() {
    const queryParams: Params = { state: 'tasks' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });
  }

  onCameraClicked() {
    this.router.navigate(['/', 'enterprise', 'camera_overlay', { navigate_back: true }]);
  }

  onSimpleSearchCancel() {
    this.headerState = HeaderState.base;
    this.clearText('onSimpleSearchCancel');
  }

  searchClick() {
    this.headerState = HeaderState.simpleSearch;
    const searchInput = this.simpleSearchInput.nativeElement as HTMLInputElement;
    setTimeout(() => {
      searchInput.focus();
    }, 300);
  }
}
