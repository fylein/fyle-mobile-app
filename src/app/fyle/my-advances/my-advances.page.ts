import { Component, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { concat, range, combineLatest, iif, of, BehaviorSubject } from 'rxjs';
import { forkJoin, from, noop, Observable, Subject } from 'rxjs';
import { concatMap, finalize, map, reduce, shareReplay, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { NetworkService } from '../../core/services/network.service';
import { ModalController } from '@ionic/angular';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';

enum AdvancesStates {
  sentBack = 'SENT_BACK',
  draft = 'DRAFT',
}

type Filters = Partial<{
  state: AdvancesStates[];
  date: string;
  sortParam: string;
  sortDir: string;
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

  navigateBack = false;

  refreshAdvances$: Subject<void> = new Subject();

  advances$: Observable<any>;

  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  filterPills = [];

  filterParams$ = new BehaviorSubject<Filters>({});

  constructor(
    private advanceRequestService: AdvanceRequestService,
    private loaderService: LoaderService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private advanceService: AdvanceService,
    private networkService: NetworkService,
    private offlineService: OfflineService,
    private modalController: ModalController
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
      this.generateFilterPills();
    }

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
      startWith([])
    );

    const sortResults = map((res: any[]) => res.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)));
    this.advances$ = this.refreshAdvances$.pipe(
      startWith(0),
      switchMap(() =>
        from(this.loaderService.showLoader('Retrieving advance...')).pipe(
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
            this.filterParams$.pipe(
              map((filters) => {
                let newArr = advArray;
                if (filters && filters.state && filters.state.length > 0) {
                  newArr = advArray.filter((adv) => filters.state.includes(adv.areq_state));
                }
                if (filters && filters.sortDir && filters.sortParam) {
                  if (filters.sortParam.includes('crDate')) {
                    newArr = newArr.sort((adv1, adv2) => {
                      if (filters.sortDir === 'asc') {
                        return Date.parse(adv1.adv_created_at) > Date.parse(adv2.adv_created_at) ? 1 : -1;
                      } else {
                        return Date.parse(adv1.adv_created_at) < Date.parse(adv2.adv_created_at) ? 1 : -1;
                      }
                    });
                  } else if (filters.sortParam.includes('appDate')) {
                    newArr = newArr.sort((adv1, adv2) => {
                      if (filters.sortDir === 'asc') {
                        return Date.parse(adv1.areq_approved_at) > Date.parse(adv2.areq_approved_at) ? 1 : -1;
                      } else {
                        return Date.parse(adv1.areq_approved_at) < Date.parse(adv2.areq_approved_at) ? 1 : -1;
                      }
                    });
                  } else if (filters.sortParam.includes('project')) {
                    newArr = newArr.sort((adv1, adv2) => {
                      if (adv1.project_name === null && adv2.project_name === null) {
                        return 0;
                      }
                      if (adv1.project_name === null) {
                        return 1;
                      }
                      if (adv2.project_name === null) {
                        return -1;
                      }
                      if (filters.sortDir === 'asc') {
                        return adv1.project_name.localeCompare(adv2.project_name) ? 1 : -1;
                      } else {
                        return adv1.project_name.localeCompare(adv2.project_name) ? -1 : 1;
                      }
                    });
                  }
                }
                return newArr;
              })
            )
          ),
          finalize(() => from(this.loaderService.hideLoader()))
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
          event.target.complete();
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

  onFilterClose(arg) {}

  onFilterClick(arg) {}

  onFilterPillsClearAll() {}

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
                value: 'crDateNewToOld',
              },
              {
                label: 'Creation Date - Old to New',
                value: 'crDateOldToNew',
              },
              {
                label: 'Approval Date - New to Old',
                value: 'appDateNewToOld',
              },
              {
                label: 'Approval Date - Old to New',
                value: 'appDateOldToNew',
              },
              {
                label: 'Project - A to Z',
                value: 'projectAToZ',
              },
              {
                label: 'Project - Z to A',
                value: 'projectZToA',
              },
            ],
          } as FilterOptions<string>,
        ],
        selectedFilterValues: this.generateSelectedFilters(this.filterParams$.value),
        activeFilterInitialName,
      },
      cssClass: 'dialog-popover',
    });

    await filterPopover.present();

    const { data } = await filterPopover.onWillDismiss();
    if (data) {
      this.filterParams$.next(this.convertDataToFilters(data));
      this.generateFilterPills();
    }
  }

  private generateSelectedFilters(filter: Filters): SelectedFilters<any>[] {
    const generatedFilters: SelectedFilters<any>[] = [];
    if (filter && filter.state) {
      generatedFilters.push({
        name: 'State',
        value: filter.state,
      });
    }
    if (filter && filter.sortParam) {
      generatedFilters.push({
        name: 'Sort By',
        value: filter.sortParam,
      });
    }
    return generatedFilters;
  }

  private convertDataToFilters(selectedFilters: SelectedFilters<any>[]): Filters {
    const generatedFilters: Filters = {};

    const stateFilter = selectedFilters.find((filter) => filter.name === 'State');
    const sortBy = selectedFilters.find((filter) => filter.name === 'Sort By');
    if (stateFilter) {
      generatedFilters.state = stateFilter.value;
    }
    if (sortBy) {
      if (sortBy.value === 'crDateNewToOld') {
        generatedFilters.sortParam = 'crDateNewToOld';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'crDateOldToNew') {
        generatedFilters.sortParam = 'crDateOldToNew';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'appDateNewToOld') {
        generatedFilters.sortParam = 'appDateNewToOld';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'appDateOldToNew') {
        generatedFilters.sortParam = 'appDateOldToNew';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'projectAToZ') {
        generatedFilters.sortParam = 'projectAToZ';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'projectZToA') {
        generatedFilters.sortParam = 'projectZToA';
        generatedFilters.sortDir = 'desc';
      }
    }
    console.log(generatedFilters);
    return generatedFilters;
  }

  // eslint-disable-next-line complexity
  private generateFilterPills() {
    const filterPills: FilterPill[] = [];
    const filters = this.filterParams$.value;

    if (filters.state && filters.state.length) {
      filterPills.push({
        label: 'State',
        type: 'state',
        value: filters.state
          .map((state) => {
            if (state === AdvancesStates.sentBack) {
              return 'Sent Back';
            } else {
              return 'Draft';
            }
          })
          .join(', '),
      });
    }

    if (filters.sortParam === 'crDateNewToOld') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'creation date - new to old',
      });
    } else if (filters.sortParam === 'crDateOldToNew') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'creation date - old to new',
      });
    } else if (filters.sortParam === 'appDateNewToOld') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'approval date - new to old',
      });
    } else if (filters.sortParam === 'appDateOldToNew') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'approval date - old to new',
      });
    } else if (filters.sortParam === 'projectAToZ') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'project - A to Z',
      });
    } else if (filters.sortParam === 'projectZToA') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'project - Z to A',
      });
    }
    this.filterPills = filterPills;
  }
}
