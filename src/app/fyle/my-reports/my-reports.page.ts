import { Component, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { concat, Observable, Subject, from, noop, BehaviorSubject, fromEvent, of } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NetworkService } from 'src/app/core/services/network.service';
import { ExtendedReport } from 'src/app/core/models/report.model';
import {
  switchMap,
  finalize,
  map,
  shareReplay,
  distinctUntilChanged,
  tap,
  debounceTime,
  takeUntil,
} from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { DateService } from 'src/app/core/services/date.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { TransactionService } from '../../core/services/transaction.service';
import { capitalize, replace } from 'lodash';
import { TrackingService } from '../../core/services/tracking.service';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { TasksService } from 'src/app/core/services/tasks.service';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import * as dayjs from 'dayjs';
import { AllowedPaymentModes } from 'src/app/core/models/allowed-payment-modes.enum';
import { DeletePopoverParams } from 'src/app/core/models/delete-popover-params.model';

type Filters = Partial<{
  state: string | string[];
  date: string;
  customDateStart: Date;
  customDateEnd: Date;
  sortParam: string;
  sortDir: string;
  rp_state: string;
}>;
@Component({
  selector: 'app-my-reports',
  templateUrl: './my-reports.page.html',
  styleUrls: ['./my-reports.page.scss'],
})
export class MyReportsPage {
  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef<HTMLInputElement>;

  isConnected$: Observable<boolean>;

  myReports$: Observable<ExtendedReport[]>;

  count$: Observable<number>;

  isInfiniteScrollRequired$: Observable<boolean>;

  loadData$: BehaviorSubject<
    Partial<{
      pageNumber: number;
      queryParams: Partial<{ or: string[]; and: string }>;
      sortParam: string;
      sortDir: string;
      searchString: string;
    }>
  >;

  currentPageNumber = 1;

  acc: ExtendedReport[] = [];

  filters: Filters;

  homeCurrency$: Observable<string>;

  navigateBack = false;

  searchText = '';

  expensesAmountStats$: Observable<{
    sum: number;
    count: number;
  }>;

  isLoading = false;

  isLoadingDataInInfiniteScroll: boolean;

  onPageExit = new Subject();

  reportsTaskCount = 0;

  headerState: HeaderState = HeaderState.base;

  simpleSearchText = '';

  isSearchBarFocused = false;

  filterPills = [];

  simplifyReportsSettings$: Observable<{ enabled: boolean }>;

  nonReimbursableOrg$: Observable<boolean>;

  constructor(
    private networkService: NetworkService,
    private loaderService: LoaderService,
    private reportService: ReportService,
    private dateService: DateService,
    private router: Router,
    private currencyService: CurrencyService,
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
    private popoverController: PopoverController,
    private trackingService: TrackingService,
    private apiV2Service: ApiV2Service,
    private tasksService: TasksService,
    private modalController: ModalController,
    private orgSettingsService: OrgSettingsService,
    private reportStatePipe: ReportState
  ) {}

  get HeaderState(): typeof HeaderState {
    return HeaderState;
  }

  ionViewWillLeave(): void {
    this.onPageExit.next(null);
  }

  ionViewWillEnter(): void {
    this.tasksService.getReportsTaskCount().subscribe((reportsTaskCount) => {
      this.reportsTaskCount = reportsTaskCount;
    });

    this.isLoading = true;
    this.setupNetworkWatcher();

    this.searchText = '';
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;
    this.acc = [];

    this.currentPageNumber = 1;
    this.loadData$ = new BehaviorSubject({
      pageNumber: 1,
    });
    this.homeCurrency$ = this.currencyService.getHomeCurrency();

    this.simpleSearchInput.nativeElement.value = '';
    fromEvent<{ srcElement: { value: string } }>(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event) => event.srcElement.value),
        distinctUntilChanged(),
        debounceTime(1000)
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

    this.isInfiniteScrollRequired$ = this.loadData$.pipe(switchMap(() => paginatedScroll$));

    this.loadData$.subscribe(() => {
      const queryParams: Params = { filters: JSON.stringify(this.filters) };
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
        replaceUrl: true,
      });
    });

    this.expensesAmountStats$ = this.loadData$.pipe(
      switchMap(() =>
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

    const orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));
    this.simplifyReportsSettings$ = orgSettings$.pipe(
      map((orgSettings) => ({
        enabled: orgSettings?.simplified_report_closure_settings?.enabled,
      }))
    );
    this.nonReimbursableOrg$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings?.payment_mode_settings?.allowed &&
          orgSettings.payment_mode_settings.enabled &&
          orgSettings.payment_mode_settings.payment_modes_order?.length === 1 &&
          orgSettings.payment_mode_settings.payment_modes_order[0] ===
            AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT
      )
    );

    this.myReports$.subscribe(noop);
    this.count$.subscribe(noop);
    this.isInfiniteScrollRequired$.subscribe(noop);

    if (this.activatedRoute.snapshot.queryParams.filters) {
      this.filters = Object.assign(
        {},
        this.filters,
        JSON.parse(this.activatedRoute.snapshot.queryParams.filters as string) as Filters
      );
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
    } else if (this.activatedRoute.snapshot.params.state) {
      const filters = {
        rp_state: `in.(${(this.activatedRoute.snapshot.params.state as string).toLowerCase()})`,
        state: (this.activatedRoute.snapshot.params.state as string).toUpperCase(),
      };

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
  }

  setupNetworkWatcher(): void {
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

  loadData(event: { target?: { complete?: () => void } }): void {
    this.currentPageNumber = this.currentPageNumber + 1;
    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.loadData$.next(params);
    setTimeout(() => {
      event?.target?.complete();
    }, 1000);
  }

  doRefresh(event?: { target?: { complete?: () => void } }): void {
    this.currentPageNumber = 1;
    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.reportService.clearTransactionCache().subscribe(() => {
      this.loadData$.next(params);
      if (event) {
        event.target?.complete();
      }
    });
  }

  generateCustomDateParams(newQueryParams: { or: string[]; and?: string }): void {
    if (this.filters.date === DateFilters.custom) {
      const startDate = this.filters.customDateStart?.toISOString();
      const endDate = this.filters.customDateEnd?.toISOString();
      if (this.filters.customDateStart && this.filters.customDateEnd) {
        newQueryParams.and = `(rp_created_at.gte.${startDate},rp_created_at.lt.${endDate})`;
      } else if (this.filters.customDateStart) {
        newQueryParams.and = `(rp_created_at.gte.${startDate})`;
      } else if (this.filters.customDateEnd) {
        newQueryParams.and = `(rp_created_at.lt.${endDate})`;
      }
    }
  }

  generateDateParams(newQueryParams: { or: string[]; and?: string }): void {
    if (this.filters.date) {
      this.filters.customDateStart = this.filters.customDateStart && new Date(this.filters.customDateStart);
      this.filters.customDateEnd = this.filters.customDateEnd && new Date(this.filters.customDateEnd);
      if (this.filters.date === DateFilters.thisMonth) {
        const thisMonth = this.dateService.getThisMonthRange();
        newQueryParams.and = `(rp_created_at.gte.${thisMonth.from.toISOString()},rp_created_at.lt.${thisMonth.to.toISOString()})`;
      }

      if (this.filters.date === DateFilters.thisWeek) {
        const thisWeek = this.dateService.getThisWeekRange();
        newQueryParams.and = `(rp_created_at.gte.${thisWeek.from.toISOString()},rp_created_at.lt.${thisWeek.to.toISOString()})`;
      }

      if (this.filters.date === DateFilters.lastMonth) {
        const lastMonth = this.dateService.getLastMonthRange();
        newQueryParams.and = `(rp_created_at.gte.${lastMonth.from.toISOString()},rp_created_at.lt.${lastMonth.to.toISOString()})`;
      }

      this.generateCustomDateParams(newQueryParams);
    }
  }

  generateStateFilters(newQueryParams: { or: string[]; and?: string }): void {
    const stateOrFilter: string[] = [];

    if (this.filters.state) {
      if (this.filters.state.includes('DRAFT')) {
        stateOrFilter.push('rp_state.in.(DRAFT)');
      }

      if (this.filters.state.includes('APPROVER_PENDING')) {
        stateOrFilter.push('rp_state.in.(APPROVER_PENDING)');
      }

      if (this.filters.state.includes('APPROVER_INQUIRY')) {
        stateOrFilter.push('rp_state.in.(APPROVER_INQUIRY)');
      }

      if (this.filters.state.includes('APPROVED')) {
        stateOrFilter.push('rp_state.in.(APPROVED)');
      }

      if (this.filters.state.includes('PAYMENT_PENDING')) {
        stateOrFilter.push('rp_state.in.(PAYMENT_PENDING)');
      }

      if (this.filters.state.includes('PAYMENT_PROCESSING')) {
        stateOrFilter.push('rp_state.in.(PAYMENT_PROCESSING)');
      }

      if (this.filters.state.includes('PAID')) {
        stateOrFilter.push('rp_state.in.(PAID)');
      }
    }

    if (stateOrFilter.length > 0) {
      let combinedStateOrFilter = stateOrFilter.reduce((param1, param2) => `${param1}, ${param2}`);
      combinedStateOrFilter = `(${combinedStateOrFilter})`;
      newQueryParams.or.push(combinedStateOrFilter);
    }
  }

  setSortParams(
    currentParams: Partial<{
      pageNumber: number;
      queryParams: Partial<{ or: string[]; and: string }>;
      sortParam: string;
      sortDir: string;
      searchString: string;
    }>
  ): void {
    if (this.filters.sortParam && this.filters.sortDir) {
      currentParams.sortParam = this.filters.sortParam;
      currentParams.sortDir = this.filters.sortDir;
    } else {
      currentParams.sortParam = 'rp_created_at';
      currentParams.sortDir = 'desc';
    }
  }

  addNewFiltersToParams(): Partial<{
    pageNumber: number;
    queryParams: Partial<{
      or: string[];
      and: string;
    }>;
    sortParam: string;
    sortDir: string;
    searchString: string;
  }> {
    const currentParams = this.loadData$.getValue();
    currentParams.pageNumber = 1;
    const newQueryParams: { or: string[]; and?: string } = {
      or: [],
    };

    this.generateDateParams(newQueryParams);

    this.generateStateFilters(newQueryParams);

    this.setSortParams(currentParams);

    currentParams.queryParams = newQueryParams;

    return currentParams;
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    this.filterPills = this.generateFilterPills(this.filters);
  }

  onReportClick(erpt: ExtendedReport): void {
    this.router.navigate(['/', 'enterprise', 'my_view_report', { id: erpt.rp_id, navigateBack: true }]);
  }

  getDeleteReportPopoverParams(erpt: ExtendedReport): DeletePopoverParams {
    return {
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: 'Delete Report',
        body: 'Are you sure you want to delete this report?',
        infoMessage: 'Deleting the report will not delete any of the expenses.',
        deleteMethod: (): Observable<void> => this.reportService.delete(erpt.rp_id),
      },
    };
  }

  async onDeleteReportClick(erpt: ExtendedReport): Promise<void> {
    if (['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'].indexOf(erpt.rp_state) === -1) {
      const cannotDeleteReportPopOver = await this.popoverController.create({
        component: PopupAlertComponent,
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
      const deleteReportPopover = await this.popoverController.create(this.getDeleteReportPopoverParams(erpt));

      await deleteReportPopover.present();
      const { data } = (await deleteReportPopover.onDidDismiss()) as { data: { status: string } };

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

  onHomeClicked(): void {
    const queryParams: Params = { state: 'home' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });

    this.trackingService.footerHomeTabClicked({
      page: 'Reports',
    });
  }

  onTaskClicked(): void {
    const queryParams: Params = { state: 'tasks', tasksFilters: 'reports' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });
    this.trackingService.tasksPageOpened({
      Asset: 'Mobile',
      from: 'My Reports',
    });
  }

  onCameraClicked(): void {
    this.router.navigate(['/', 'enterprise', 'camera_overlay', { navigate_back: true }]);
  }

  onViewCommentsClick(): void {
    // TODO: Add when view comments is done
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

  onSimpleSearchCancel(): void {
    this.headerState = HeaderState.base;
    this.clearText('onSimpleSearchCancel');
  }

  onSearchBarFocus(): void {
    this.isSearchBarFocused = true;
  }

  onFilterPillsClearAll(): void {
    this.clearFilters();
  }

  async onFilterClick(filterType: string): Promise<void> {
    if (filterType === 'state') {
      await this.openFilters('State');
    } else if (filterType === 'date') {
      await this.openFilters('Date');
    } else if (filterType === 'sort') {
      await this.openFilters('Sort By');
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

  searchClick(): void {
    this.headerState = HeaderState.simpleSearch;
    const searchInput = this.simpleSearchInput.nativeElement;
    setTimeout(() => {
      searchInput.focus();
    }, 300);
  }

  convertRptDtSortToSelectedFilters(
    filter: Partial<{
      state: string | string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      sortParam: string;
      sortDir: string;
    }>,
    generatedFilters: SelectedFilters<string>[]
  ): void {
    if (filter.sortParam === 'rp_created_at' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'dateOldToNew',
      });
    } else if (filter.sortParam === 'rp_created_at' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'dateNewToOld',
      });
    }
  }

  addSortToGeneatedFilters(
    filter: Partial<{
      state: string | string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      sortParam: string;
      sortDir: string;
    }>,
    generatedFilters: SelectedFilters<string>[]
  ): void {
    this.convertRptDtSortToSelectedFilters(filter, generatedFilters);

    this.convertAmountSortToSelectedFilters(filter, generatedFilters);

    this.convertNameSortToSelectedFilters(filter, generatedFilters);
  }

  generateSelectedFilters(filter: Filters): SelectedFilters<string>[] {
    const generatedFilters: SelectedFilters<string>[] = [];

    if (filter.state) {
      generatedFilters.push({
        name: 'State',
        value: <string>filter.state,
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

    if (filter.sortParam && filter.sortDir) {
      this.addSortToGeneatedFilters(filter, generatedFilters);
    }

    return generatedFilters;
  }

  convertNameSortToSelectedFilters(
    filter: Partial<{
      state: string | string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      sortParam: string;
      sortDir: string;
    }>,
    generatedFilters: SelectedFilters<string>[]
  ): void {
    if (filter.sortParam === 'rp_purpose' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'nameAToZ',
      });
    } else if (filter.sortParam === 'rp_purpose' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'nameZToA',
      });
    }
  }

  convertSelectedSortFitlersToFilters(
    sortBy: SelectedFilters<string>,
    generatedFilters: Partial<{
      state: string | string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      sortParam: string;
      sortDir: string;
    }>
  ): void {
    if (sortBy) {
      if (sortBy.value === 'dateNewToOld') {
        generatedFilters.sortParam = 'rp_created_at';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'dateOldToNew') {
        generatedFilters.sortParam = 'rp_created_at';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'amountHighToLow') {
        generatedFilters.sortParam = 'rp_amount';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'amountLowToHigh') {
        generatedFilters.sortParam = 'rp_amount';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'nameAToZ') {
        generatedFilters.sortParam = 'rp_purpose';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'nameZToA') {
        generatedFilters.sortParam = 'rp_purpose';
        generatedFilters.sortDir = 'desc';
      }
    }
  }

  convertFilters(selectedFilters: SelectedFilters<string>[]): Filters {
    const generatedFilters: Filters = {};

    const stateFilter = selectedFilters.find((filter) => filter.name === 'State');
    if (stateFilter) {
      generatedFilters.state = stateFilter.value;
    }

    const dateFilter = selectedFilters.find((filter) => filter.name === 'Date');
    if (dateFilter) {
      generatedFilters.date = dateFilter.value;
      generatedFilters.customDateStart = dateFilter.associatedData?.startDate;
      generatedFilters.customDateEnd = dateFilter.associatedData?.endDate;
    }

    const sortBy = selectedFilters.find((filter) => filter.name === 'Sort By');

    this.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

    return generatedFilters;
  }

  generateStateFilterPills(filterPills: FilterPill[], filter: Filters): void {
    this.simplifyReportsSettings$.subscribe((simplifyReportsSettings) => {
      filterPills.push({
        label: 'State',
        type: 'state',
        value: (<string[]>filter.state)
          .map((state) => this.reportStatePipe.transform(state, simplifyReportsSettings.enabled))
          .reduce((state1, state2) => `${state1}, ${state2}`),
      });
    });
  }

  generateCustomDatePill(filter: Filters, filterPills: FilterPill[]): void {
    const startDate = filter.customDateStart && dayjs(filter.customDateStart).format('YYYY-MM-D');
    const endDate = filter.customDateEnd && dayjs(filter.customDateEnd).format('YYYY-MM-D');

    if (startDate && endDate) {
      filterPills.push({
        label: 'Date',
        type: 'date',
        value: `${startDate} to ${endDate}`,
      });
    } else if (startDate) {
      filterPills.push({
        label: 'Date',
        type: 'date',
        value: `>= ${startDate}`,
      });
    } else if (endDate) {
      filterPills.push({
        label: 'Date',
        type: 'date',
        value: `<= ${endDate}`,
      });
    }
  }

  generateDateFilterPills(filter: Filters, filterPills: FilterPill[]): void {
    if (filter.date === DateFilters.thisWeek) {
      filterPills.push({
        label: 'Date',
        type: 'date',
        value: 'this Week',
      });
    }

    if (filter.date === DateFilters.thisMonth) {
      filterPills.push({
        label: 'Date',
        type: 'date',
        value: 'this Month',
      });
    }

    if (filter.date === DateFilters.all) {
      filterPills.push({
        label: 'Date',
        type: 'date',
        value: 'All',
      });
    }

    if (filter.date === DateFilters.lastMonth) {
      filterPills.push({
        label: 'Date',
        type: 'date',
        value: 'Last Month',
      });
    }

    if (filter.date === DateFilters.custom) {
      this.generateCustomDatePill(filter, filterPills);
    }
  }

  generateSortRptDatePills(filter: Filters, filterPills: FilterPill[]): void {
    if (filter.sortParam === 'rp_created_at' && filter.sortDir === 'asc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'date - old to new',
      });
    } else if (filter.sortParam === 'rp_created_at' && filter.sortDir === 'desc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'date - new to old',
      });
    }
  }

  generateSortAmountPills(filter: Filters, filterPills: FilterPill[]): void {
    if (filter.sortParam === 'rp_amount' && filter.sortDir === 'desc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'amount - high to low',
      });
    } else if (filter.sortParam === 'rp_amount' && filter.sortDir === 'asc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'amount - low to high',
      });
    }
  }

  generateSortNamePills(filter: Filters, filterPills: FilterPill[]): void {
    if (filter.sortParam === 'rp_purpose' && filter.sortDir === 'asc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'Name - a to z',
      });
    } else if (filter.sortParam === 'rp_purpose' && filter.sortDir === 'desc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'Name - z to a',
      });
    }
  }

  generateSortFilterPills(filter: Filters, filterPills: FilterPill[]): void {
    this.generateSortRptDatePills(filter, filterPills);

    this.generateSortAmountPills(filter, filterPills);

    this.generateSortNamePills(filter, filterPills);
  }

  generateFilterPills(filter: Filters): FilterPill[] {
    const filterPills: FilterPill[] = [];

    if (filter.state && filter.state.length) {
      this.generateStateFilterPills(filterPills, filter);
    }

    if (filter.date) {
      this.generateDateFilterPills(filter, filterPills);
    }

    if (filter.sortParam && filter.sortDir) {
      this.generateSortFilterPills(filter, filterPills);
    }

    return filterPills;
  }

  convertAmountSortToSelectedFilters(
    filter: Partial<{
      state: string | string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      sortParam: string;
      sortDir: string;
    }>,
    generatedFilters: SelectedFilters<string>[]
  ): void {
    if (filter.sortParam === 'rp_amount' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'amountHighToLow',
      });
    } else if (filter.sortParam === 'rp_amount' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'amountLowToHigh',
      });
    }
  }

  async openFilters(activeFilterInitialName?: string): Promise<void> {
    const filterPopover = await this.modalController.create({
      component: FyFiltersComponent,
      componentProps: {
        filterOptions: [
          {
            name: 'State',
            optionType: FilterOptionType.multiselect,
            options: [
              {
                label: 'Draft',
                value: 'DRAFT',
              },
              {
                label: 'Reported',
                value: 'APPROVER_PENDING',
              },
              {
                label: 'Sent Back',
                value: 'APPROVER_INQUIRY',
              },
              {
                label: 'Approved',
                value: 'APPROVED',
              },
              {
                label: 'Payment Pending',
                value: 'PAYMENT_PENDING',
              },
              {
                label: 'Payment Processing',
                value: 'PAYMENT_PROCESSING',
              },
              {
                label: 'Paid',
                value: 'PAID',
              },
            ],
            optionsNewFlow: [
              {
                label: 'Draft',
                value: 'DRAFT',
              },
              {
                label: 'Submitted',
                value: 'APPROVER_PENDING',
              },
              {
                label: 'Sent Back',
                value: 'APPROVER_INQUIRY',
              },
              {
                label: 'Approved',
                value: 'APPROVED',
              },
              {
                label: 'Processing',
                value: 'PAYMENT_PROCESSING',
              },
              {
                label: 'Closed',
                value: 'PAID',
              },
            ],
            optionsNewFlowCCCOnly: [
              {
                label: 'Draft',
                value: 'DRAFT',
              },
              {
                label: 'Submitted',
                value: 'APPROVER_PENDING',
              },
              {
                label: 'Sent Back',
                value: 'APPROVER_INQUIRY',
              },
              {
                label: 'Approved',
                value: 'APPROVED',
              },
              {
                label: 'Closed',
                value: 'PAID',
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
                label: 'Name - A to Z',
                value: 'nameAToZ',
              },
              {
                label: 'Name - Z to A',
                value: 'nameZToA',
              },
            ],
          } as FilterOptions<string>,
        ],
        simplifyReportsSettings$: this.simplifyReportsSettings$,
        nonReimbursableOrg$: this.nonReimbursableOrg$,
        selectedFilterValues: this.generateSelectedFilters(this.filters),
        activeFilterInitialName,
      },
      cssClass: 'dialog-popover',
    });

    await filterPopover.present();

    const { data } = (await filterPopover.onWillDismiss()) as { data: SelectedFilters<string>[] };
    if (data) {
      this.filters = this.convertFilters(data);
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
      this.trackingService.myReportsFilterApplied({
        ...this.filters,
      });
    }
  }
}
