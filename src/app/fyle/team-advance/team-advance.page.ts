import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { Observable, Subject, from, noop } from 'rxjs';
import { concatMap, switchMap, finalize, map, scan, shareReplay, take } from 'rxjs/operators';

import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FiltersHelperService } from 'src/app/core/services/filters-helper.service';

import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { AdvancesStates } from 'src/app/core/models/advances-states.model';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';

type Filters = Partial<{
  state: AdvancesStates[];
  sortParam: string;
  sortDir: string;
}>;
@Component({
  selector: 'app-team-advance',
  templateUrl: './team-advance.page.html',
  styleUrls: ['./team-advance.page.scss'],
})
export class TeamAdvancePage {
  teamAdvancerequests$: Observable<any[]>;

  loadData$: Subject<{ pageNumber: number; state: AdvancesStates[] }> = new Subject();

  count$: Observable<number>;

  currentPageNumber = 1;

  isInfiniteScrollRequired$: Observable<boolean>;

  filters: Filters;

  filterPills = [];

  constructor(
    private advanceRequestService: AdvanceRequestService,
    private loaderService: LoaderService,
    private router: Router,
    private filtersHelperService: FiltersHelperService,
    private modalController: ModalController
  ) {}

  ionViewWillEnter() {
    this.setupDefaultFilters();

    this.currentPageNumber = 1;

    this.teamAdvancerequests$ = this.loadData$.pipe(
      concatMap(({ pageNumber, state }) =>
        from(this.loaderService.showLoader()).pipe(
          switchMap(() =>
            this.advanceRequestService.getTeamAdvanceRequests({
              offset: (pageNumber - 1) * 10,
              limit: 10,
              queryParams: {
                ...this.getExtraParams(state),
              },
              filter: state,
            })
          ),
          finalize(() => from(this.loaderService.hideLoader()))
        )
      ),
      map((res) => res.data),
      scan((acc, curr) => {
        if (this.currentPageNumber === 1) {
          return curr;
        }
        return acc.concat(curr);
      }, [] as ExtendedAdvanceRequest[]),
      shareReplay(1)
    );

    this.count$ = this.loadData$.pipe(
      switchMap(({ state }) =>
        this.advanceRequestService.getTeamAdvanceRequestsCount(
          {
            ...this.getExtraParams(state),
          },
          state
        )
      ),
      shareReplay(1)
    );

    this.isInfiniteScrollRequired$ = this.teamAdvancerequests$.pipe(
      concatMap((teamAdvancerequests) =>
        this.count$.pipe(
          take(1),
          map((count) => count > teamAdvancerequests.length)
        )
      )
    );

    this.loadData$.subscribe(noop);
    this.teamAdvancerequests$.subscribe(noop);
    this.count$.subscribe(noop);
    this.isInfiniteScrollRequired$.subscribe(noop);
    this.loadData$.next({ pageNumber: this.currentPageNumber, state: this.filters.state || [] });
  }

  onAdvanceClick(areq: ExtendedAdvanceRequest) {
    this.router.navigate(['/', 'enterprise', 'view_team_advance', { id: areq.areq_id }]);
  }

  changeState(event?: any, incrementPageNumber = false) {
    this.currentPageNumber = incrementPageNumber ? this.currentPageNumber + 1 : 1;
    this.loadData$.next({ pageNumber: this.currentPageNumber, state: this.filters.state || [] });
    if (event) {
      event.target.complete();
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
                label: 'Approval Pending',
                value: AdvancesStates.pending,
              },

              {
                label: 'Approved',
                value: AdvancesStates.approved,
              },
            ],
          } as FilterOptions<string>,
        ],
        selectedFilterValues: this.filtersHelperService.generateSelectedFilters(this.filters),
        activeFilterInitialName,
      },
      cssClass: 'dialog-popover',
    });

    await filterPopover.present();

    const { data } = await filterPopover.onWillDismiss();
    if (data) {
      this.filters = this.filtersHelperService.convertDataToFilters(data);
      this.filterPills = this.filtersHelperService.generateFilterPills(this.filters);
      this.changeState();
    }
  }

  onFilterClose(filterType: string) {
    if (filterType === 'sort') {
      this.filters = {
        ...this.filters,
        sortParam: null,
        sortDir: null,
      };
    } else if (filterType === 'state') {
      this.filters = {
        ...this.filters,
        state: null,
      };
    }
    this.filterPills = this.filtersHelperService.generateFilterPills(this.filters);
    this.changeState();
  }

  async onFilterClick(filterType: string) {
    const filterTypes = {
      state: 'State',
      sort: 'Sort By',
    };
    await this.openFilters(filterTypes[filterType]);
  }

  onFilterPillsClearAll() {
    this.filters = {};
    this.filterPills = this.filtersHelperService.generateFilterPills(this.filters);
    this.changeState();
  }

  setupDefaultFilters() {
    this.filters = {
      state: [AdvancesStates.pending],
    };
    this.filterPills = this.filtersHelperService.generateFilterPills(this.filters);
  }

  getExtraParams(state: AdvancesStates[]) {
    const isPending = state.includes(AdvancesStates.pending);
    const isApproved = state.includes(AdvancesStates.approved);
    let extraParams: any;

    if ((isPending && isApproved) || (!isPending && !isApproved)) {
      extraParams = { areq_trip_request_id: ['is.null'] };
    } else if (isPending) {
      extraParams = {
        areq_state: ['eq.APPROVAL_PENDING'],
        areq_trip_request_id: ['is.null'],
        or: ['(areq_is_sent_back.is.null,areq_is_sent_back.is.false)'],
      };
    } else if (isApproved) {
      extraParams = {
        areq_trip_request_id: ['is.null'],
        areq_approval_state: ['ov.{APPROVAL_PENDING,APPROVAL_DONE}'],
      };
    }

    return extraParams;
  }
}
