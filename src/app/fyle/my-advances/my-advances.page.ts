import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

import { concat, range, combineLatest, iif, of, BehaviorSubject, forkJoin, noop, Observable, Subject } from 'rxjs';
import { concatMap, map, reduce, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { NetworkService } from '../../core/services/network.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FiltersHelperService } from 'src/app/core/services/filters-helper.service';

import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { AdvancesStates } from 'src/app/core/models/advances-states.model';
import { SortingValue } from 'src/app/core/models/sorting-value.model';

import { cloneDeep } from 'lodash';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { ExtendedAdvance } from 'src/app/core/models/extended_advance.model';
import { MyAdvancesFilters } from 'src/app/core/models/my-advances-filters.model';

@Component({
  selector: 'app-my-advances',
  templateUrl: './my-advances.page.html',
  styleUrls: ['./my-advances.page.scss'],
})
export class MyAdvancesPage implements AfterViewChecked {
  myAdvancerequests$: Observable<ExtendedAdvanceRequest[]>;

  myAdvances$: Observable<ExtendedAdvance[]>;

  loadData$: Subject<number> = new Subject();

  isLoading = false;

  navigateBack = false;

  totalTaskCount = 0;

  refreshAdvances$: Subject<void> = new Subject();

  advances$: Observable<(ExtendedAdvanceRequest | ExtendedAdvance)[]>;

  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  filterPills = [];

  filterParams$ = new BehaviorSubject<Partial<MyAdvancesFilters>>({});

  advancesTaskCount = 0;

  projectFieldName = 'Project';

  constructor(
    private advanceRequestService: AdvanceRequestService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private advanceService: AdvanceService,
    private networkService: NetworkService,
    private filtersHelperService: FiltersHelperService,
    private utilityService: UtilityService,
    private titleCasePipe: TitleCasePipe,
    private trackingService: TrackingService,
    private tasksService: TasksService,
    private expenseFieldsService: ExpenseFieldsService,
    private orgSettingsService: OrgSettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ionViewWillLeave(): void {
    this.onPageExit.next(null);
  }

  redirectToDashboardPage(): void {
    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit),
      shareReplay(1)
    );

    this.redirectToDashboardPage();
  }

  getAndUpdateProjectName(): void {
    this.expenseFieldsService.getAllEnabled().subscribe((expenseFields) => {
      const projectField = expenseFields.find((expenseField) => expenseField.column_name === 'project_id');
      this.projectFieldName = projectField?.field_name;
    });
  }

  ionViewWillEnter(): void {
    this.setupNetworkWatcher();

    this.tasksService.getAdvancesTaskCount().subscribe((advancesTaskCount) => {
      this.advancesTaskCount = advancesTaskCount;
    });

    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;
    this.tasksService.getTotalTaskCount().subscribe((totalTaskCount) => (this.totalTaskCount = totalTaskCount));

    const oldFilters = this.activatedRoute.snapshot.queryParams.filters as string;
    if (oldFilters) {
      this.filterParams$.next(JSON.parse(oldFilters) as Partial<MyAdvancesFilters>);
      this.filterPills = this.filtersHelperService.generateFilterPills(this.filterParams$.value);
    }

    this.isLoading = true;

    this.myAdvancerequests$ = this.advanceRequestService
      .getMyAdvanceRequestsCount({
        areq_advance_id: 'is.null',
      })
      .pipe(
        concatMap((count) => {
          count = count > 10 ? count / 10 : 1;
          return range(0, count);
        }),
        concatMap((count) =>
          this.advanceRequestService.getMyadvanceRequests({
            offset: 10 * count,
            limit: 10,
            queryParams: {
              areq_advance_id: 'is.null',
              order: 'areq_created_at.desc,areq_id.desc',
            },
          })
        ),
        map((res) => res.data),
        reduce((acc, curr) => acc.concat(curr))
      );

    this.myAdvances$ = this.advanceService.getMyAdvancesCount().pipe(
      concatMap((count) => {
        count = count > 10 ? count / 10 : 1;
        return range(0, count);
      }),
      concatMap((count) =>
        this.advanceService.getMyadvances({
          offset: 10 * count,
          limit: 10,
          queryParams: { order: 'adv_created_at.desc,adv_id.desc' },
        })
      ),
      map((res) => res.data),
      reduce((acc, curr) => acc.concat(curr))
    );

    const sortResults = map((res: (ExtendedAdvanceRequest | ExtendedAdvance)[]) =>
      res.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    );
    this.advances$ = this.refreshAdvances$.pipe(
      startWith(0),
      concatMap(() => this.orgSettingsService.get()),
      switchMap((orgSettings) =>
        combineLatest([
          iif(() => orgSettings.advance_requests.enabled, this.myAdvancerequests$, of(null)),
          iif(() => orgSettings.advances.enabled, this.myAdvances$, of(null)),
        ]).pipe(
          map((res) => {
            const [myAdvancerequestsRes, myAdvancesRes] = res;
            let myAdvancerequests = myAdvancerequestsRes || [];
            let myAdvances = myAdvancesRes || [];
            myAdvancerequests = this.updateMyAdvanceRequests(myAdvancerequests);
            myAdvances = this.updateMyAdvances(myAdvances);
            return [...myAdvances, ...myAdvancerequests];
          }),
          sortResults
        )
      ),
      switchMap((advArray: ExtendedAdvanceRequest[]) =>
        //piping through filterParams so that filtering and sorting happens whenever we call next() on filterParams
        this.filterParams$.pipe(
          map((filters) => {
            let newArr = cloneDeep(advArray);

            if (filters && filters.state && filters.state.length > 0) {
              newArr = advArray.filter((adv) => {
                const sentBackAdvance =
                  filters.state.includes(AdvancesStates.sentBack) &&
                  adv.areq_state === 'DRAFT' &&
                  adv.areq_is_sent_back;

                const plainDraft =
                  filters.state.includes(AdvancesStates.draft) &&
                  adv.areq_state === 'DRAFT' &&
                  !adv.areq_is_sent_back &&
                  !adv.areq_is_pulled_back;

                return sentBackAdvance || plainDraft;
              });
            }
            newArr = this.utilityService.sortAllAdvances(filters.sortDir, filters.sortParam, newArr);
            return newArr;
          })
        )
      ),
      tap((res) => {
        if (res && res.length >= 0) {
          this.isLoading = false;
        }
      })
    );

    this.getAndUpdateProjectName();
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  updateMyAdvances(myAdvances: ExtendedAdvance[]): ExtendedAdvance[] {
    myAdvances = myAdvances.map((data) => ({
      ...data,
      type: 'advance',
      amount: data.adv_amount,
      orig_amount: data.adv_orig_amount,
      created_at: data.adv_created_at,
      currency: data.adv_currency,
      orig_currency: data.adv_orig_currency,
      purpose: data.adv_purpose,
    }));
    return myAdvances;
  }

  updateMyAdvanceRequests(myAdvancerequests: ExtendedAdvanceRequest[]): ExtendedAdvanceRequest[] {
    myAdvancerequests = myAdvancerequests.map((data) => ({
      ...data,
      type: 'request',
      currency: data.areq_currency,
      amount: data.areq_amount,
      created_at: data.areq_created_at,
      purpose: data.areq_purpose,
      state: data.areq_state,
    }));
    return myAdvancerequests;
  }

  doRefresh(event: { target: { complete: () => void } }): void {
    forkJoin({
      destroyAdvanceRequestsCacheBuster: this.advanceRequestService.destroyAdvanceRequestsCacheBuster(),
      destroyAdvancesCacheBuster: this.advanceService.destroyAdvancesCacheBuster(),
    })
      .pipe(
        map(() => {
          this.refreshAdvances$.next();
          if (event) {
            event.target?.complete();
          }
        })
      )
      .subscribe(noop);
  }

  onAdvanceClick(clickedAdvance: { advanceRequest: ExtendedAdvance; internalState: { state: string } }): void {
    const id = clickedAdvance.advanceRequest.adv_id || clickedAdvance.advanceRequest.areq_id;
    let route = 'my_view_advance_request';
    if (
      clickedAdvance.advanceRequest.type === 'request' &&
      clickedAdvance.internalState.state.toLowerCase() === 'inquiry'
    ) {
      route = 'add_edit_advance_request';
    }

    if (clickedAdvance.advanceRequest.type === 'advance') {
      route = 'my_view_advance';
    }

    this.router.navigate(['/', 'enterprise', route, { id }]);
  }

  onHomeClicked(): void {
    const queryParams: Params = { state: 'home' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });

    this.trackingService.footerHomeTabClicked({
      page: 'Advances',
    });
  }

  onTaskClicked(): void {
    const queryParams: Params = { state: 'tasks', tasksFilters: 'advances' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });
    this.trackingService.tasksPageOpened({
      Asset: 'Mobile',
      from: 'My Advances',
    });
  }

  onCameraClicked(): void {
    this.router.navigate(['/', 'enterprise', 'camera_overlay', { navigate_back: true }]);
  }

  onFilterClose(filterType: string): void {
    const filters = this.filterParams$.value;
    if (filterType === 'sort') {
      this.filterParams$.next({
        ...filters,
        sortParam: null,
        sortDir: null,
      });
    } else if (filterType === 'state') {
      this.filterParams$.next({
        ...filters,
        state: null,
      });
    }
    this.filterPills = this.filtersHelperService.generateFilterPills(this.filterParams$.value);
  }

  async onFilterClick(filterType: 'state' | 'sort'): Promise<void> {
    const filterTypes = {
      state: 'State',
      sort: 'Sort By',
    };
    await this.openFilters(filterTypes[filterType]);
  }

  onFilterPillsClearAll(): void {
    this.filterParams$.next({});
    this.filterPills = this.filtersHelperService.generateFilterPills(this.filterParams$.value);
  }

  async openFilters(activeFilterInitialName?: string): Promise<void> {
    const filterOptions = [
      {
        name: 'State',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Draft',
            value: AdvancesStates.draft,
          },

          {
            label: 'Sent Back',
            value: AdvancesStates.sentBack,
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Sort By',
        optionType: FilterOptionType.singleselect,
        options: [
          {
            label: 'Created At - New to Old',
            value: SortingValue.creationDateAsc,
          },
          {
            label: 'Created At - Old to New',
            value: SortingValue.creationDateDesc,
          },
          {
            label: 'Approved At - New to Old',
            value: SortingValue.approvalDateAsc,
          },
          {
            label: 'Approved At - Old to New',
            value: SortingValue.approvalDateDesc,
          },
          {
            label: `${this.titleCasePipe.transform(this.projectFieldName)} - A to Z`,
            value: SortingValue.projectAsc,
          },
          {
            label: `${this.titleCasePipe.transform(this.projectFieldName)} - Z to A`,
            value: SortingValue.projectDesc,
          },
        ],
      } as FilterOptions<string>,
    ];
    const filters = await this.filtersHelperService.openFilterModal(
      this.filterParams$.value,
      filterOptions,
      activeFilterInitialName
    );
    if (filters) {
      this.filterParams$.next(filters);
      this.filterPills = this.filtersHelperService.generateFilterPills(this.filterParams$.value, this.projectFieldName);
    }
  }

  goToAddEditAdvanceRequest(): void {
    this.router.navigate(['/', 'enterprise', 'add_edit_advance_request']);
  }
}
