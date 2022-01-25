import { Component, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import {
  concat,
  range,
  combineLatest,
  iif,
  of,
  BehaviorSubject,
  forkJoin,
  from,
  noop,
  Observable,
  Subject,
} from 'rxjs';
import { concatMap, map, reduce, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { NetworkService } from '../../core/services/network.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FiltersHelperService } from 'src/app/core/services/filters-helper.service';

import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { AdvancesStates } from 'src/app/core/models/advances-states.model';
import { SortingParam } from 'src/app/core/models/sorting-param.model';
import { SortingDirection } from 'src/app/core/models/sorting-direction.model';
import { SortingValue } from 'src/app/core/models/sorting-value.model';

import { cloneDeep } from 'lodash';

type Filters = Partial<{
  state: AdvancesStates[];
  sortParam: SortingParam;
  sortDir: SortingDirection;
}>;

@Component({
  selector: 'app-my-advances',
  templateUrl: './my-advances.page.html',
  styleUrls: ['./my-advances.page.scss'],
})
export class MyAdvancesPage {
  myAdvancerequests$: Observable<any[]>;

  myAdvances$: Observable<any>;

  loadData$: Subject<number> = new Subject();

  isLoading = false;

  navigateBack = false;

  refreshAdvances$: Subject<void> = new Subject();

  advances$: Observable<any>;

  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  filterPills = [];

  filterParams$ = new BehaviorSubject<Filters>({});

  constructor(
    private advanceRequestService: AdvanceRequestService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private advanceService: AdvanceService,
    private networkService: NetworkService,
    private offlineService: OfflineService,
    private filtersHelperService: FiltersHelperService,
    private utilityService: UtilityService
  ) {}

  ionViewWillLeave() {
    this.onPageExit.next();
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

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;

    const oldFilters = this.activatedRoute.snapshot.queryParams.filters;
    if (oldFilters) {
      this.filterParams$.next(JSON.parse(oldFilters));
      this.filterPills = this.filtersHelperService.generateFilterPills(this.filterParams$.value);
    }

    this.isLoading = true;

    this.myAdvancerequests$ = this.advanceRequestService
      .getMyAdvanceRequestsCount({
        areq_trip_request_id: 'is.null',
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
              areq_trip_request_id: 'is.null',
              areq_advance_id: 'is.null',
              order: 'areq_created_at.desc,areq_id.desc',
            },
          })
        ),
        map((res) => res.data),
        reduce((acc, curr) => acc.concat(curr)),
        tap(() => (this.isLoading = false)),
        startWith([])
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
      reduce((acc, curr) => acc.concat(curr)),
      tap(() => (this.isLoading = false)),
      startWith([])
    );

    const sortResults = map((res: any[]) => res.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)));
    this.advances$ = this.refreshAdvances$.pipe(
      startWith(0),
      concatMap(() => this.offlineService.getOrgSettings()),
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
            return myAdvances.concat(myAdvancerequests);
          }),
          sortResults
        )
      ),
      switchMap((advArray) =>
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
      )
    );
  }

  updateMyAdvances(myAdvances: any) {
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

  updateMyAdvanceRequests(myAdvancerequests: any) {
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

  doRefresh(event) {
    forkJoin({
      destroyAdvanceRequestsCacheBuster: this.advanceRequestService.destroyAdvanceRequestsCacheBuster(),
      destroyAdvancesCacheBuster: this.advanceService.destroyAdvancesCacheBuster(),
    })
      .pipe(
        map(() => {
          this.refreshAdvances$.next();
          if (event) {
            event.target.complete();
          }
        })
      )
      .subscribe(noop);
  }

  onAdvanceClick(clickedAdvance: any) {
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

  onFilterClose(filterType: string) {
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

  async onFilterClick(filterType: string) {
    const filterTypes = {
      state: 'State',
      sort: 'Sort By',
    };
    await this.openFilters(filterTypes[filterType]);
  }

  onFilterPillsClearAll() {
    this.filterParams$.next({});
    this.filterPills = this.filtersHelperService.generateFilterPills(this.filterParams$.value);
  }

  async openFilters(activeFilterInitialName?: string) {
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
            label: 'Creation Date - New to Old',
            value: SortingValue.creationDateAsc,
          },
          {
            label: 'Creation Date - Old to New',
            value: SortingValue.creationDateDesc,
          },
          {
            label: 'Approval Date - New to Old',
            value: SortingValue.approvalDateAsc,
          },
          {
            label: 'Approval Date - Old to New',
            value: SortingValue.approvalDateDesc,
          },
          {
            label: 'Project - A to Z',
            value: SortingValue.projectAsc,
          },
          {
            label: 'Project - Z to A',
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
      this.filterPills = this.filtersHelperService.generateFilterPills(this.filterParams$.value);
    }
  }
}
