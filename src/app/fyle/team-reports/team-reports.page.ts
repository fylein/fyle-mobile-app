import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { Observable, BehaviorSubject, fromEvent, noop, concat, Subject, from } from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalController } from '@ionic/angular';
import { DateService } from 'src/app/core/services/date.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { map, distinctUntilChanged, debounceTime, switchMap, shareReplay } from 'rxjs/operators';
import { PopupService } from 'src/app/core/services/popup.service';
import { ExtendQueryParamsService } from 'src/app/core/services/extend-query-params.service';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import * as dayjs from 'dayjs';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { GetTasksQueryParamsWithFilters } from 'src/app/core/models/get-tasks-query-params-with-filters.model';
import { GetTasksQueryParams } from 'src/app/core/models/get-tasks.query-params.model';
import { TeamReportsFilters } from 'src/app/core/models/team-reports-filters.model';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';

@Component({
  selector: 'app-team-reports',
  templateUrl: './team-reports.page.html',
  styleUrls: ['./team-reports.page.scss'],
})
export class TeamReportsPage implements OnInit {
  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef<HTMLInputElement>;

  pageTitle = 'Team reports';

  isConnected$: Observable<boolean>;

  teamReports$: Observable<Report[]>;

  count$: Observable<number>;

  isInfiniteScrollRequired$: Observable<boolean>;

  isLoading = false;

  isLoadingDataInInfiniteScroll: boolean;

  filterForMultiStageApproval: boolean;

  loadData$: BehaviorSubject<Partial<GetTasksQueryParamsWithFilters>>;

  currentPageNumber = 1;

  acc: Report[] = [];

  filters: Partial<TeamReportsFilters>;

  homeCurrency$: Observable<string>;

  searchText = '';

  orgSettings$: Observable<string>;

  orgSettings: OrgSettings;

  onPageExit = new Subject();

  headerState: HeaderState = HeaderState.base;

  simpleSearchText = '';

  isSearchBarFocused = false;

  filterPills = [];

  navigateBack = false;

  teamReportsTaskCount = 0;



  eou$: Observable<ExtendedOrgUser>;

  constructor(
    private networkService: NetworkService,
    private loaderService: LoaderService,
    private modalController: ModalController,
    private dateService: DateService,
    private router: Router,
    private currencyService: CurrencyService,
    private popupService: PopupService,
    private trackingService: TrackingService,
    private activatedRoute: ActivatedRoute,
    private extendQueryParamsService: ExtendQueryParamsService,
    private tasksService: TasksService,
    private orgSettingsService: OrgSettingsService,
    private reportStatePipe: ReportState,
    private approverReportsService: ApproverReportsService,
    private authService: AuthService,
    private launchDarklyService: LaunchDarklyService
  ) {}

  get HeaderState(): typeof HeaderState {
    return HeaderState;
  }

  ngOnInit(): void {
    this.setupNetworkWatcher();
  }

  ionViewWillLeave(): void {
    this.onPageExit.next(null);
  }

  ionViewWillEnter(): void {
    this.isLoading = true;
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigate_back;

    this.eou$ = from(this.authService.getEou());
    this.tasksService.getTeamReportsTaskCount().subscribe((teamReportsTaskCount) => {
      this.teamReportsTaskCount = teamReportsTaskCount;
    });

    this.eou$.subscribe((eou: ExtendedOrgUser) => {
      this.loadData$ = new BehaviorSubject({
        pageNumber: 1,
        queryParams: {
          state: 'in.(APPROVER_PENDING)',
          next_approver_user_ids: `cs.[${eou.us.id}]`,
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
          map((event: Event) => {
            const value = (event.target as HTMLInputElement).value;
            return value;
          }),
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
          let queryParams = params.queryParams;
          queryParams = this.extendQueryParamsService.extendQueryParamsForTextSearch(queryParams, params.searchString);
          const orderByParams =
            params.sortParam && params.sortDir ? `${params.sortParam}.${params.sortDir}` : 'created_at.desc,id.desc';
          this.isLoadingDataInInfiniteScroll = true;

          return this.approverReportsService.getReportsByParams({
            offset: (params.pageNumber - 1) * 10,
            limit: 10,
            ...queryParams,
            order: orderByParams,
          });
        }),
        map((res: PlatformApiResponse<Report[]>) => {
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
          queryParams = this.extendQueryParamsService.extendQueryParamsForTextSearch(queryParams, params.searchString);
          this.isLoadingDataInInfiniteScroll = true;
          return this.approverReportsService.getReportsCount(queryParams);
        }),
        shareReplay(1)
      );

      const paginatedScroll$ = this.teamReports$.pipe(
        switchMap((reports) => this.count$.pipe(map((count) => count > reports.length)))
      );

      this.isInfiniteScrollRequired$ = this.loadData$.pipe(switchMap(() => paginatedScroll$));

      this.teamReports$.subscribe(noop);
      this.count$.subscribe(noop);
      this.isInfiniteScrollRequired$.subscribe(noop);

      this.loadData$.subscribe(() => {
        const queryParams: Params = { filters: JSON.stringify(this.filters) };
        this.router.navigate([], {
          relativeTo: this.activatedRoute,
          queryParams,
          replaceUrl: true,
        });
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      this.filters = Object.assign({}, this.filters, JSON.parse(this.activatedRoute.snapshot.queryParams.filters));
      this.currentPageNumber = 1;
      const params = this.addNewFiltersToParams(eou);
      this.loadData$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);

      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    });
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }

  loadData(event: { target: HTMLIonInfiniteScrollElement }): void {
    this.currentPageNumber = this.currentPageNumber + 1;
    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.loadData$.next(params);
    setTimeout(() => {
      event?.target?.complete?.();
    }, 1000);
  }

  doRefresh(event?: { target: HTMLIonRefresherElement }): void {
    this.currentPageNumber = 1;
    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.loadData$.next(params);
    if (event) {
      event.target?.complete();
    }
  }

  generateCustomDateParams(newQueryParams: Partial<GetTasksQueryParams>): void {
    if (this.filters.date === DateFilters.custom) {
      const startDate = this.filters.customDateStart?.toISOString();
      const endDate = this.filters.customDateEnd?.toISOString();
      if (this.filters.customDateStart && this.filters.customDateEnd) {
        newQueryParams.and = `(last_submitted_at.gte.${startDate},last_submitted_at.lt.${endDate})`;
      } else if (this.filters.customDateStart) {
        newQueryParams.and = `(last_submitted_at.gte.${startDate})`;
      } else if (this.filters.customDateEnd) {
        newQueryParams.and = `(last_submitted_at.lt.${endDate})`;
      }
    }
  }

  generateDateParams(newQueryParams: Partial<GetTasksQueryParams>): void {
    if (this.filters.date) {
      this.filters.customDateStart = this.filters.customDateStart && new Date(this.filters.customDateStart);
      this.filters.customDateEnd = this.filters.customDateEnd && new Date(this.filters.customDateEnd);
      if (this.filters.date === DateFilters.thisMonth) {
        const thisMonth = this.dateService.getThisMonthRange();
        newQueryParams.and = `(last_submitted_at.gte.${thisMonth.from.toISOString()},last_submitted_at.lt.${thisMonth.to.toISOString()})`;
      }

      if (this.filters.date === DateFilters.thisWeek) {
        const thisWeek = this.dateService.getThisWeekRange();
        newQueryParams.and = `(last_submitted_at.gte.${thisWeek.from.toISOString()},last_submitted_at.lt.${thisWeek.to.toISOString()})`;
      }

      if (this.filters.date === DateFilters.lastMonth) {
        const lastMonth = this.dateService.getLastMonthRange();
        newQueryParams.and = `(last_submitted_at.gte.${lastMonth.from.toISOString()},last_submitted_at.lt.${lastMonth.to.toISOString()})`;
      }

      this.generateCustomDateParams(newQueryParams);
    }
  }

  generateStateFilters(newQueryParams: Partial<GetTasksQueryParams>, eou: ExtendedOrgUser): void {
    const stateOrFilter = [];

    if (this.filters.state) {
      if (this.filters.state.includes('APPROVER_PENDING')) {
        stateOrFilter.push('APPROVER_PENDING');
      }

      if (this.filters.state.includes('APPROVER_INQUIRY')) {
        stateOrFilter.push('APPROVER_INQUIRY');
      }

      if (this.filters.state.includes('APPROVED')) {
        stateOrFilter.push('APPROVED');
      }

      if (this.filters.state.includes('PAID')) {
        stateOrFilter.push('PAID');
      }
    }
    if (stateOrFilter.length > 0) {
      /* By default, displays the reports in `MY` queue
       * Report state - APPROVER_PENDING
       * sequential_approval_turn - true
       * If any other state filter is applied, it will be considered as reports under `ALL` queue
       */
      if (this.filters.state.includes('APPROVER_PENDING') && this.filters.state.length === 1) {
        newQueryParams.next_approver_user_ids = `cs.[${eou.us.id}]`;
      }
      let combinedStateOrFilter = stateOrFilter.join();
      combinedStateOrFilter = `in.(${combinedStateOrFilter})`;
      newQueryParams.state = combinedStateOrFilter;
    }
  }

  setSortParams(currentParams: Partial<GetTasksQueryParamsWithFilters>): void {
    if (this.filters.sortParam && this.filters.sortDir) {
      currentParams.sortParam = this.filters.sortParam;
      currentParams.sortDir = this.filters.sortDir;
    } else {
      currentParams.sortParam = 'last_submitted_at';
      currentParams.sortDir = 'desc';
    }
  }

  addNewFiltersToParams(eou: ExtendedOrgUser): Partial<GetTasksQueryParamsWithFilters> {
    const currentParams = this.loadData$.getValue();
    currentParams.pageNumber = 1;
    const newQueryParams: Partial<GetTasksQueryParams> = {};

    this.generateDateParams(newQueryParams);

    this.setSortParams(currentParams);

    this.generateStateFilters(newQueryParams, eou);
    currentParams.queryParams = newQueryParams;

    return currentParams;
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPageNumber = 1;
    this.eou$.subscribe((eou) => {
      const params = this.addNewFiltersToParams(eou);
      this.loadData$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
    });
  }

  onReportClick(report: Report): void {
    this.router.navigate(['/', 'enterprise', 'view_team_report', { id: report.id, navigate_back: true }]);
  }

  onHomeClicked(): void {
    const queryParams: Params = { state: 'home' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });

    this.trackingService.footerHomeTabClicked({
      page: 'Team Reports',
    });
  }

  onTaskClicked(): void {
    const queryParams: Params = { state: 'tasks', tasksFilters: 'team_reports' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });
  }

  onCameraClicked(): void {
    this.router.navigate(['/', 'enterprise', 'camera_overlay', { navigate_back: true }]);
  }

  clearText(isFromCancel: string): void {
    this.simpleSearchText = '';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const searchInput = this.simpleSearchInput.nativeElement;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    searchInput.value = '';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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
      await this.openFilters('Submitted date');
    } else if (filterType === 'sort') {
      await this.openFilters('Sort by');
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
    this.eou$.subscribe((eou) => {
      const params = this.addNewFiltersToParams(eou);
      this.loadData$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
    });
  }

  searchClick(): void {
    this.headerState = HeaderState.simpleSearch;
    const searchInput = this.simpleSearchInput.nativeElement;
    setTimeout(() => {
      searchInput.focus();
    }, 300);
  }

  convertRptDtSortToSelectedFilters(
    filter: Partial<TeamReportsFilters>,
    generatedFilters: SelectedFilters<string | string[]>[]
  ): void {
    if (filter.sortParam === 'last_submitted_at' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: 'Sort by',
        value: 'dateOldToNew',
      });
    } else if (filter.sortParam === 'last_submitted_at' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: 'Sort by',
        value: 'dateNewToOld',
      });
    }
  }

  addSortToGeneratedFilters(
    filter: Partial<TeamReportsFilters>,
    generatedFilters: SelectedFilters<string | string[]>[]
  ): void {
    this.convertRptDtSortToSelectedFilters(filter, generatedFilters);

    this.convertAmountSortToSelectedFilters(filter, generatedFilters);

    this.convertNameSortToSelectedFilters(filter, generatedFilters);
  }

  generateSelectedFilters(filter: Partial<TeamReportsFilters>): SelectedFilters<string | string[]>[] {
    const generatedFilters: SelectedFilters<string | string[]>[] = [];

    if (filter.state) {
      generatedFilters.push({
        name: 'State',
        value: filter.state,
      });
    }

    if (filter.date) {
      generatedFilters.push({
        name: 'Submitted date',
        value: filter.date,
        associatedData: {
          startDate: filter.customDateStart,
          endDate: filter.customDateEnd,
        },
      });
    }

    if (filter.sortParam && filter.sortDir) {
      this.addSortToGeneratedFilters(filter, generatedFilters);
    }

    return generatedFilters;
  }

  convertNameSortToSelectedFilters(
    filter: Partial<TeamReportsFilters>,
    generatedFilters: SelectedFilters<string | string[]>[]
  ): void {
    if (filter.sortParam === 'purpose' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: 'Sort by',
        value: 'nameAToZ',
      });
    } else if (filter.sortParam === 'purpose' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: 'Sort by',
        value: 'nameZToA',
      });
    }
  }

  convertSelectedSortFiltersToFilters(
    sortBy: SelectedFilters<string>,
    generatedFilters: Partial<TeamReportsFilters>
  ): void {
    if (sortBy) {
      if (sortBy.value === 'dateNewToOld') {
        generatedFilters.sortParam = 'last_submitted_at';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'dateOldToNew') {
        generatedFilters.sortParam = 'last_submitted_at';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'amountHighToLow') {
        generatedFilters.sortParam = 'amount';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'amountLowToHigh') {
        generatedFilters.sortParam = 'amount';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'nameAToZ') {
        generatedFilters.sortParam = 'purpose';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'nameZToA') {
        generatedFilters.sortParam = 'purpose';
        generatedFilters.sortDir = 'desc';
      }
    }
  }

  convertFilters(selectedFilters: SelectedFilters<string>[]): Partial<TeamReportsFilters> {
    const generatedFilters: Partial<TeamReportsFilters> = {};

    const stateFilter = selectedFilters.find((filter) => filter.name === 'State');
    if (stateFilter) {
      generatedFilters.state = stateFilter.value;
    }

    const dateFilter = selectedFilters.find((filter) => filter.name === 'Submitted date');
    if (dateFilter) {
      generatedFilters.date = dateFilter.value;
      generatedFilters.customDateStart = dateFilter.associatedData?.startDate;
      generatedFilters.customDateEnd = dateFilter.associatedData?.endDate;
    }

    const sortBy = selectedFilters.find((filter) => filter.name === 'Sort by');

    this.convertSelectedSortFiltersToFilters(sortBy, generatedFilters);

    return generatedFilters;
  }

  generateStateFilterPills(filterPills: FilterPill[], filter: Partial<TeamReportsFilters>): void {
    filterPills.push({
      label: 'State',
      type: 'state',
      value: (<string[]>filter.state)
        .map((state) => this.reportStatePipe.transform(state))
        .reduce((state1, state2) => `${state1}, ${state2}`),
    });
  }

  generateCustomDatePill(filter: Partial<TeamReportsFilters>, filterPills: FilterPill[]): void {
    const startDate = filter.customDateStart && dayjs(filter.customDateStart).format('YYYY-MM-D');
    const endDate = filter.customDateEnd && dayjs(filter.customDateEnd).format('YYYY-MM-D');

    if (startDate && endDate) {
      filterPills.push({
        label: 'Submitted date',
        type: 'date',
        value: `${startDate} to ${endDate}`,
      });
    } else if (startDate) {
      filterPills.push({
        label: 'Submitted date',
        type: 'date',
        value: `>= ${startDate}`,
      });
    } else if (endDate) {
      filterPills.push({
        label: 'Submitted date',
        type: 'date',
        value: `<= ${endDate}`,
      });
    }
  }

  generateDateFilterPills(filter: Partial<TeamReportsFilters>, filterPills: FilterPill[]): void {
    if (filter.date === DateFilters.thisWeek) {
      filterPills.push({
        label: 'Submitted date',
        type: 'date',
        value: 'this Week',
      });
    }

    if (filter.date === DateFilters.thisMonth) {
      filterPills.push({
        label: 'Submitted date',
        type: 'date',
        value: 'this Month',
      });
    }

    if (filter.date === DateFilters.all) {
      filterPills.push({
        label: 'Submitted date',
        type: 'date',
        value: 'All',
      });
    }

    if (filter.date === DateFilters.lastMonth) {
      filterPills.push({
        label: 'Submitted date',
        type: 'date',
        value: 'Last Month',
      });
    }

    if (filter.date === DateFilters.custom) {
      this.generateCustomDatePill(filter, filterPills);
    }
  }

  generateSortRptDatePills(filter: Partial<TeamReportsFilters>, filterPills: FilterPill[]): void {
    if (filter.sortParam === 'last_submitted_at' && filter.sortDir === 'asc') {
      filterPills.push({
        label: 'Sort by',
        type: 'sort',
        value: 'Submitted date - old to new',
      });
    } else if (filter.sortParam === 'last_submitted_at' && filter.sortDir === 'desc') {
      filterPills.push({
        label: 'Sort by',
        type: 'sort',
        value: 'Submitted date - new to old',
      });
    }
  }

  generateSortAmountPills(filter: Partial<TeamReportsFilters>, filterPills: FilterPill[]): void {
    if (filter.sortParam === 'amount' && filter.sortDir === 'desc') {
      filterPills.push({
        label: 'Sort by',
        type: 'sort',
        value: 'amount - high to low',
      });
    } else if (filter.sortParam === 'amount' && filter.sortDir === 'asc') {
      filterPills.push({
        label: 'Sort by',
        type: 'sort',
        value: 'amount - low to high',
      });
    }
  }

  generateSortNamePills(filter: Partial<TeamReportsFilters>, filterPills: FilterPill[]): void {
    if (filter.sortParam === 'purpose' && filter.sortDir === 'asc') {
      filterPills.push({
        label: 'Sort by',
        type: 'sort',
        value: 'Name - a to z',
      });
    } else if (filter.sortParam === 'purpose' && filter.sortDir === 'desc') {
      filterPills.push({
        label: 'Sort by',
        type: 'sort',
        value: 'Name - z to a',
      });
    }
  }

  generateSortFilterPills(filter: Partial<TeamReportsFilters>, filterPills: FilterPill[]): void {
    this.generateSortRptDatePills(filter, filterPills);

    this.generateSortAmountPills(filter, filterPills);

    this.generateSortNamePills(filter, filterPills);
  }

  generateFilterPills(filter: Partial<TeamReportsFilters>): FilterPill[] {
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
    filter: Partial<TeamReportsFilters>,
    generatedFilters: SelectedFilters<string | string[]>[]
  ): void {
    if (filter.sortParam === 'amount' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: 'Sort by',
        value: 'amountHighToLow',
      });
    } else if (filter.sortParam === 'amount' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: 'Sort by',
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
            optionsNewFlow: [
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
            name: 'Submitted date',
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
            name: 'Sort by',
            optionType: FilterOptionType.singleselect,
            options: [
              {
                label: 'Submitted date - New to Old',
                value: 'dateNewToOld',
              },
              {
                label: 'Submitted date - Old to New',
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

    const { data } = (await filterPopover.onWillDismiss()) as { data: SelectedFilters<string>[] };
    if (data) {
      this.filters = this.convertFilters(data);
      this.currentPageNumber = 1;
      this.eou$.subscribe((eou) => {
        const params = this.addNewFiltersToParams(eou);
        this.loadData$.next(params);
        this.filterPills = this.generateFilterPills(this.filters);
        this.trackingService.TeamReportsFilterApplied({
          ...this.filters,
        });
      });
    }
  }
}
