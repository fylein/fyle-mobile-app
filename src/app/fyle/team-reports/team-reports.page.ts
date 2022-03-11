import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { Observable, BehaviorSubject, fromEvent, from, iif, of, noop, concat, forkJoin, Subject } from 'rxjs';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { NetworkService } from 'src/app/core/services/network.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { DateService } from 'src/app/core/services/date.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { map, distinctUntilChanged, debounceTime, switchMap, finalize, shareReplay } from 'rxjs/operators';
import { PopupService } from 'src/app/core/services/popup.service';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import * as moment from 'moment';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TasksService } from 'src/app/core/services/tasks.service';

type Filters = Partial<{
  state: string[];
  date: string;
  customDateStart: Date;
  customDateEnd: Date;
  sortParam: string;
  sortDir: string;
}>;
@Component({
  selector: 'app-team-reports',
  templateUrl: './team-reports.page.html',
  styleUrls: ['./team-reports.page.scss'],
})
export class TeamReportsPage implements OnInit {
  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef;

  pageTitle = 'Team Reports';

  isConnected$: Observable<boolean>;

  teamReports$: Observable<ExtendedReport[]>;

  count$: Observable<number>;

  isInfiniteScrollRequired$: Observable<boolean>;

  isLoading = false;

  isLoadingDataInInfiniteScroll: boolean;

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

  homeCurrency$: Observable<string>;

  searchText = '';

  orgSettings$: Observable<string>;

  orgSettings: any;

  onPageExit = new Subject();

  headerState: HeaderState = HeaderState.base;

  simpleSearchText = '';

  isSearchBarFocused = false;

  filterPills = [];

  navigateBack = false;

  teamReportsTaskCount = 0;

  get HeaderState() {
    return HeaderState;
  }

  constructor(
    private networkService: NetworkService,
    private loaderService: LoaderService,
    private reportService: ReportService,
    private modalController: ModalController,
    private dateService: DateService,
    private router: Router,
    private currencyService: CurrencyService,
    private popupService: PopupService,
    private trackingService: TrackingService,
    private activatedRoute: ActivatedRoute,
    private apiV2Service: ApiV2Service,
    private tasksService: TasksService
  ) {}

  ngOnInit() {
    this.setupNetworkWatcher();
  }

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigate_back;

    this.tasksService.getTeamReportsTaskCount().subscribe((teamReportsTaskCount) => {
      this.teamReportsTaskCount = teamReportsTaskCount;
    });

    this.loadData$ = new BehaviorSubject({
      pageNumber: 1,
      queryParams: {
        rp_approval_state: 'in.(APPROVAL_PENDING)',
        rp_state: 'in.(APPROVER_PENDING)',
        sequential_approval_turn: 'in.(true)',
      },
    });

    // Applying default filter for approvers to view approver pending reports by default
    if (!this.activatedRoute.snapshot.queryParams.filters) {
      this.activatedRoute.snapshot.queryParams = {
        filters: JSON.stringify({ state: ['APPROVER_PENDING'] }),
      };
    }

    this.homeCurrency$ = this.currencyService.getHomeCurrency();

    this.simpleSearchInput.nativeElement.value = '';
    fromEvent(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.srcElement.value as string),
        debounceTime(1000),
        distinctUntilChanged()
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
        let queryParams = params.queryParams;
        const orderByParams = params.sortParam && params.sortDir ? `${params.sortParam}.${params.sortDir}` : null;
        queryParams = this.apiV2Service.extendQueryParamsForTextSearch(queryParams, params.searchString);
        this.isLoadingDataInInfiniteScroll = true;
        return this.reportService.getTeamReports({
          offset: (params.pageNumber - 1) * 10,
          limit: 10,
          queryParams,
          order: orderByParams,
        });
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

    this.teamReports$ = paginatedPipe.pipe(shareReplay(1));

    this.count$ = this.loadData$.pipe(
      switchMap((params) => {
        let queryParams = params.queryParams;
        queryParams = this.apiV2Service.extendQueryParamsForTextSearch(queryParams, params.searchString);
        return this.reportService.getTeamReportsCount(queryParams);
      }),
      shareReplay(1)
    );

    const paginatedScroll$ = this.teamReports$.pipe(
      switchMap((erpts) => this.count$.pipe(map((count) => count > erpts.length)))
    );

    this.isInfiniteScrollRequired$ = this.loadData$.pipe(
      switchMap((params) => iif(() => params.searchString && params.searchString !== '', of(false), paginatedScroll$))
    );

    this.loadData$.subscribe(noop);
    this.teamReports$.subscribe(noop);
    this.count$.subscribe(noop);
    this.isInfiniteScrollRequired$.subscribe(noop);

    this.loadData$.subscribe((params) => {
      const queryParams: Params = { filters: JSON.stringify(this.filters) };
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
        replaceUrl: true,
      });
    });

    if (this.activatedRoute.snapshot.queryParams.filters) {
      this.filters = Object.assign({}, this.filters, JSON.parse(this.activatedRoute.snapshot.queryParams.filters));
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams();
      this.loadData$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
    } else if (this.activatedRoute.snapshot.params.state) {
      const filters = {
        rp_state: `in.(${this.activatedRoute.snapshot.params.state.toLowerCase()})`,
        state: this.activatedRoute.snapshot.params.state.toUpperCase(),
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

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
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
    this.loadData$.next(params);
    if (event) {
      event.target.complete();
    }
  }

  generateCustomDateParams(newQueryParams: any) {
    if (this.filters.date === DateFilters.custom) {
      const startDate = this.filters?.customDateStart?.toISOString();
      const endDate = this.filters?.customDateEnd?.toISOString();
      if (this.filters.customDateStart && this.filters.customDateEnd) {
        newQueryParams.and = `(rp_submitted_at.gte.${startDate},rp_submitted_at.lt.${endDate})`;
      } else if (this.filters.customDateStart) {
        newQueryParams.and = `(rp_submitted_at.gte.${startDate})`;
      } else if (this.filters.customDateEnd) {
        newQueryParams.and = `(rp_submitted_at.lt.${endDate})`;
      }
    }
  }

  generateDateParams(newQueryParams) {
    if (this.filters.date) {
      this.filters.customDateStart = this.filters.customDateStart && new Date(this.filters.customDateStart);
      this.filters.customDateEnd = this.filters.customDateEnd && new Date(this.filters.customDateEnd);
      if (this.filters.date === DateFilters.thisMonth) {
        const thisMonth = this.dateService.getThisMonthRange();
        newQueryParams.and = `(rp_submitted_at.gte.${thisMonth.from.toISOString()},rp_submitted_at.lt.${thisMonth.to.toISOString()})`;
      }

      if (this.filters.date === DateFilters.thisWeek) {
        const thisWeek = this.dateService.getThisWeekRange();
        newQueryParams.and = `(rp_submitted_at.gte.${thisWeek.from.toISOString()},rp_submitted_at.lt.${thisWeek.to.toISOString()})`;
      }

      if (this.filters.date === DateFilters.lastMonth) {
        const lastMonth = this.dateService.getLastMonthRange();
        newQueryParams.and = `(rp_submitted_at.gte.${lastMonth.from.toISOString()},rp_submitted_at.lt.${lastMonth.to.toISOString()})`;
      }

      this.generateCustomDateParams(newQueryParams);
    }
  }

  generateStateFilters(newQueryParams) {
    const stateOrFilter = [];

    if (this.filters.state) {
      if (this.filters.state.includes('APPROVER_PENDING')) {
        stateOrFilter.push('rp_state.in.(APPROVER_PENDING)');
      }

      if (this.filters.state.includes('APPROVER_INQUIRY')) {
        stateOrFilter.push('rp_state.in.(APPROVER_INQUIRY)');
      }

      if (this.filters.state.includes('APPROVED')) {
        stateOrFilter.push('rp_state.in.(APPROVED)');
      }

      if (this.filters.state.includes('PAID')) {
        stateOrFilter.push('rp_state.in.(PAID)');
      }
    }

    if (stateOrFilter.length > 0) {
      /* By default, displays the reports in `MY` queue
       * Report state - APPROVER_PENDING
       * sequential_approval_turn - true
       * If any other state filter is applied, it will be considered as reports under `ALL` queue
       */
      if (this.filters.state.includes('APPROVER_PENDING') && this.filters.state.length === 1) {
        newQueryParams.sequential_approval_turn = 'in.(true)';
      }
      let combinedStateOrFilter = stateOrFilter.reduce((param1, param2) => `${param1}, ${param2}`);
      combinedStateOrFilter = `(${combinedStateOrFilter})`;
      newQueryParams.or.push(combinedStateOrFilter);
    }
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
      currentParams.sortParam = 'rp_submitted_at';
      currentParams.sortDir = 'desc';
    }
  }

  addNewFiltersToParams() {
    const currentParams = this.loadData$.getValue();
    currentParams.pageNumber = 1;
    const newQueryParams: any = {
      or: [],
    };

    this.generateDateParams(newQueryParams);

    this.generateStateFilters(newQueryParams);

    this.setSortParams(currentParams);

    currentParams.queryParams = newQueryParams;

    return currentParams;
  }

  clearFilters() {
    this.filters = {};
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    this.filterPills = this.generateFilterPills(this.filters);
  }

  onReportClick(erpt: ExtendedReport) {
    this.router.navigate(['/', 'enterprise', 'view_team_report', { id: erpt.rp_id, navigate_back: true }]);
  }

  async onDeleteReportClick(erpt: ExtendedReport) {
    if (['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'].indexOf(erpt.rp_state) === -1) {
      await this.popupService.showPopup({
        header: 'Cannot Delete Report',
        message: 'Report cannot be deleted',
        primaryCta: {
          text: 'Close',
        },
      });
    } else {
      const popupResult = await this.popupService.showPopup({
        header: 'Delete Report?',
        message: `
          <p class="highlight-info">
            On deleting this report, all the associated expenses will be moved to <strong>"My Expenses"</strong> list.
          </p>
          <p class="mb-0">
            Are you sure, you want to delete this report?
          </p>
        `,
        primaryCta: {
          text: 'Delete',
        },
      });

      if (popupResult === 'primary') {
        from(this.loaderService.showLoader())
          .pipe(
            switchMap(() => this.reportService.delete(erpt.rp_id)),
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
    const queryParams: Params = { state: 'tasks', tasksFilters: 'team_reports' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });
  }

  onCameraClicked() {
    this.router.navigate(['/', 'enterprise', 'camera_overlay', { navigate_back: true }]);
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

  onSimpleSearchCancel() {
    this.headerState = HeaderState.base;
    this.clearText('onSimpleSearchCancel');
  }

  onSearchBarFocus() {
    this.isSearchBarFocused = true;
  }

  onFilterPillsClearAll() {
    this.clearFilters();
  }

  async onFilterClick(filterType: string) {
    if (filterType === 'state') {
      await this.openFilters('State');
    } else if (filterType === 'date') {
      await this.openFilters('Submitted Date');
    } else if (filterType === 'sort') {
      await this.openFilters('Sort By');
    }
  }

  onFilterClose(filterType: string) {
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

  searchClick() {
    this.headerState = HeaderState.simpleSearch;
    const searchInput = this.simpleSearchInput.nativeElement as HTMLInputElement;
    setTimeout(() => {
      searchInput.focus();
    }, 300);
  }

  convertRptDtSortToSelectedFilters(
    filter: Partial<{
      state: string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      sortParam: string;
      sortDir: string;
    }>,
    generatedFilters: SelectedFilters<any>[]
  ) {
    if (filter.sortParam === 'rp_submitted_at' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'dateOldToNew',
      });
    } else if (filter.sortParam === 'rp_submitted_at' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'dateNewToOld',
      });
    }
  }

  addSortToGeneatedFilters(
    filter: Partial<{
      state: string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      sortParam: string;
      sortDir: string;
    }>,
    generatedFilters: SelectedFilters<any>[]
  ) {
    this.convertRptDtSortToSelectedFilters(filter, generatedFilters);

    this.convertAmountSortToSelectedFilters(filter, generatedFilters);

    this.convertNameSortToSelectedFilters(filter, generatedFilters);
  }

  generateSelectedFilters(filter: Filters): SelectedFilters<any>[] {
    const generatedFilters: SelectedFilters<any>[] = [];

    if (filter.state) {
      generatedFilters.push({
        name: 'State',
        value: filter.state,
      });
    }

    if (filter.date) {
      generatedFilters.push({
        name: 'Submitted Date',
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
      state: string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      sortParam: string;
      sortDir: string;
    }>,
    generatedFilters: SelectedFilters<any>[]
  ) {
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
    sortBy: SelectedFilters<any>,
    generatedFilters: Partial<{
      state: string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      sortParam: string;
      sortDir: string;
    }>
  ) {
    if (sortBy) {
      if (sortBy.value === 'dateNewToOld') {
        generatedFilters.sortParam = 'rp_submitted_at';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'dateOldToNew') {
        generatedFilters.sortParam = 'rp_submitted_at';
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

  convertFilters(selectedFilters: SelectedFilters<any>[]): Filters {
    const generatedFilters: Filters = {};

    const stateFilter = selectedFilters.find((filter) => filter.name === 'State');
    if (stateFilter) {
      generatedFilters.state = stateFilter.value;
    }

    const dateFilter = selectedFilters.find((filter) => filter.name === 'Submitted Date');
    if (dateFilter) {
      generatedFilters.date = dateFilter.value;
      generatedFilters.customDateStart = dateFilter.associatedData?.startDate;
      generatedFilters.customDateEnd = dateFilter.associatedData?.endDate;
    }

    const sortBy = selectedFilters.find((filter) => filter.name === 'Sort By');

    this.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

    return generatedFilters;
  }

  generateStateFilterPills(filterPills: FilterPill[], filter) {
    filterPills.push({
      label: 'State',
      type: 'state',
      value: filter.state
        .map((state) => {
          if (state === 'APPROVER_INQUIRY') {
            return 'Sent Back';
          }

          if (state === 'APPROVER_PENDING') {
            return 'Reported';
          }

          return state.replace(/_/g, ' ').toLowerCase();
        })
        .reduce((state1, state2) => `${state1}, ${state2}`),
    });
  }

  generateCustomDatePill(filter: any, filterPills: FilterPill[]) {
    const startDate = filter.customDateStart && moment(filter.customDateStart).format('y-MM-D');
    const endDate = filter.customDateEnd && moment(filter.customDateEnd).format('y-MM-D');

    if (startDate && endDate) {
      filterPills.push({
        label: 'Submitted Date',
        type: 'date',
        value: `${startDate} to ${endDate}`,
      });
    } else if (startDate) {
      filterPills.push({
        label: 'Submitted Date',
        type: 'date',
        value: `>= ${startDate}`,
      });
    } else if (endDate) {
      filterPills.push({
        label: 'Submitted Date',
        type: 'date',
        value: `<= ${endDate}`,
      });
    }
  }

  generateDateFilterPills(filter, filterPills: FilterPill[]) {
    if (filter.date === DateFilters.thisWeek) {
      filterPills.push({
        label: 'Submitted Date',
        type: 'date',
        value: 'this Week',
      });
    }

    if (filter.date === DateFilters.thisMonth) {
      filterPills.push({
        label: 'Submitted Date',
        type: 'date',
        value: 'this Month',
      });
    }

    if (filter.date === DateFilters.all) {
      filterPills.push({
        label: 'Submitted Date',
        type: 'date',
        value: 'All',
      });
    }

    if (filter.date === DateFilters.lastMonth) {
      filterPills.push({
        label: 'Submitted Date',
        type: 'date',
        value: 'Last Month',
      });
    }

    if (filter.date === DateFilters.custom) {
      this.generateCustomDatePill(filter, filterPills);
    }
  }

  generateSortRptDatePills(filter: any, filterPills: FilterPill[]) {
    if (filter.sortParam === 'rp_submitted_at' && filter.sortDir === 'asc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'Submitted date - old to new',
      });
    } else if (filter.sortParam === 'rp_submitted_at' && filter.sortDir === 'desc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'Submitted date - new to old',
      });
    }
  }

  generateSortAmountPills(filter: any, filterPills: FilterPill[]) {
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

  generateSortNamePills(filter: any, filterPills: FilterPill[]) {
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

  generateSortFilterPills(filter, filterPills: FilterPill[]) {
    this.generateSortRptDatePills(filter, filterPills);

    this.generateSortAmountPills(filter, filterPills);

    this.generateSortNamePills(filter, filterPills);
  }

  generateFilterPills(filter: Filters) {
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
      state: string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      sortParam: string;
      sortDir: string;
    }>,
    generatedFilters: SelectedFilters<any>[]
  ) {
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

  async openFilters(activeFilterInitialName?: string) {
    const filterPopover = await this.modalController.create({
      component: FyFiltersComponent,
      componentProps: {
        filterOptions: [
          {
            name: 'State',
            optionType: FilterOptionType.multiselect,
            options: [
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
                label: 'Paid',
                value: 'PAID',
              },
            ],
          } as FilterOptions<string>,
          {
            name: 'Submitted Date',
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
                label: 'Submitted Date - New to Old',
                value: 'dateNewToOld',
              },
              {
                label: 'Submitted Date - Old to New',
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
      this.trackingService.TeamReportsFilterApplied({
        ...this.filters,
      });
    }
  }
}
