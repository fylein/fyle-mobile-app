import { AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { Params, Router } from '@angular/router';
import { TasksService } from 'src/app/core/services/tasks.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Observable, Subject, noop } from 'rxjs';
import { concatMap, switchMap, finalize, map, scan, shareReplay, take } from 'rxjs/operators';
import { FiltersHelperService } from 'src/app/core/services/filters-helper.service';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { AdvancesStates } from 'src/app/core/models/advances-states.model';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { SortingParam } from 'src/app/core/models/sorting-param.model';
import { SortingDirection } from 'src/app/core/models/sorting-direction.model';
import { SortingValue } from 'src/app/core/models/sorting-value.model';
import { TitleCasePipe } from '@angular/common';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';

type Filters = Partial<{
  state: AdvancesStates[];
  sortParam: SortingParam;
  sortDir: SortingDirection;
}>;
@Component({
  selector: 'app-team-advance',
  templateUrl: './team-advance.page.html',
  styleUrls: ['./team-advance.page.scss'],
})
export class TeamAdvancePage implements AfterViewChecked {
  teamAdvancerequests$: Observable<ExtendedAdvanceRequest[]>;

  loadData$: Subject<{
    pageNumber: number;
    state: AdvancesStates[];
    sortParam: SortingParam;
    sortDir: SortingDirection;
  }> = new Subject();

  count$: Observable<number>;

  totalTaskCount = 0;

  currentPageNumber = 1;

  isInfiniteScrollRequired$: Observable<boolean>;

  filters: Filters;

  filterPills = [];

  isLoading = false;

  projectFieldName = 'Project';

  constructor(
    private advanceRequestService: AdvanceRequestService,
    private tasksService: TasksService,
    private trackingService: TrackingService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private filtersHelperService: FiltersHelperService,
    private expenseFieldsService: ExpenseFieldsService,
    private titleCasePipe: TitleCasePipe
  ) {}

  ionViewWillEnter(): void {
    this.tasksService.getTotalTaskCount().subscribe((totalTaskCount) => (this.totalTaskCount = totalTaskCount));

    this.setupDefaultFilters();
    this.currentPageNumber = 1;
    this.isLoading = true;

    this.teamAdvancerequests$ = this.loadData$.pipe(
      concatMap(({ pageNumber, state, sortParam, sortDir }) =>
        this.advanceRequestService.getTeamAdvanceRequests({
          offset: (pageNumber - 1) * 10,
          limit: 10,
          queryParams: {
            ...this.getExtraParams(state),
          },
          filter: {
            state,
            sortParam,
            sortDir,
          },
        })
      ),
      map((res) => res.data),
      scan((acc, curr) => {
        if (this.currentPageNumber === 1) {
          return curr;
        }
        return acc.concat(curr);
      }, [] as ExtendedAdvanceRequest[]),
      shareReplay(1),
      finalize(() => (this.isLoading = false))
    );

    this.count$ = this.loadData$.pipe(
      switchMap(({ state, sortParam, sortDir }) =>
        this.advanceRequestService.getTeamAdvanceRequestsCount(
          {
            ...this.getExtraParams(state),
          },
          {
            state,
            sortParam,
            sortDir,
          }
        )
      ),
      shareReplay(1),
      finalize(() => (this.isLoading = false))
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
    this.loadData$.next({
      pageNumber: this.currentPageNumber,
      state: this.filters.state || [],
      sortParam: this.filters.sortParam,
      sortDir: this.filters.sortDir,
    });

    this.getAndUpdateProjectName();
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  onAdvanceClick(areq: ExtendedAdvanceRequest): void {
    this.router.navigate(['/', 'enterprise', 'view_team_advance', { id: areq.areq_id }]);
  }

  changeState(event?: { target?: { complete: () => void } }, incrementPageNumber = false): void {
    this.currentPageNumber = incrementPageNumber ? this.currentPageNumber + 1 : 1;
    this.advanceRequestService.destroyAdvanceRequestsCacheBuster().subscribe(() => {
      this.loadData$.next({
        pageNumber: this.currentPageNumber,
        state: this.filters.state || [],
        sortParam: this.filters.sortParam,
        sortDir: this.filters.sortDir,
      });
    });
    if (event) {
      event.target?.complete();
    }
  }

  getAndUpdateProjectName(): void {
    this.expenseFieldsService.getAllEnabled().subscribe((expenseFields) => {
      const projectField = expenseFields.find((expenseField) => expenseField.column_name === 'project_id');
      this.projectFieldName = projectField?.field_name;
    });
  }

  async openFilters(activeFilterInitialName?: string): Promise<void> {
    const filterOptions = [
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
      {
        name: 'Sort By',
        optionType: FilterOptionType.singleselect,
        options: [
          {
            label: 'Requested On - New to Old',
            value: SortingValue.creationDateAsc,
          },
          {
            label: 'Requested On - Old to New',
            value: SortingValue.creationDateDesc,
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
      this.filters,
      filterOptions,
      activeFilterInitialName
    );

    if (filters) {
      this.filters = filters;
      this.filterPills = this.filtersHelperService.generateFilterPills(this.filters, this.projectFieldName);
      this.changeState();
    }
  }

  onFilterClose(filterType: string): void {
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

  async onFilterClick(filterType: string): Promise<void> {
    const filterTypes: Record<string, string> = {
      state: 'State',
      sort: 'Sort By',
    };
    await this.openFilters(filterTypes[filterType]);
  }

  onFilterPillsClearAll(): void {
    this.filters = {};
    this.filterPills = this.filtersHelperService.generateFilterPills(this.filters);
    this.changeState();
  }

  setupDefaultFilters(): void {
    this.filters = {
      state: [AdvancesStates.pending],
    };
    this.filterPills = this.filtersHelperService.generateFilterPills(this.filters);
  }

  getExtraParams(state: AdvancesStates[]): Record<string, string[]> {
    const isPending = state.includes(AdvancesStates.pending);
    const isApproved = state.includes(AdvancesStates.approved);
    let extraParams = {};

    if (isPending && isApproved) {
      extraParams = {
        areq_state: ['not.eq.DRAFT'],
        areq_approval_state: ['ov.{APPROVAL_PENDING,APPROVAL_DONE}'],
        or: ['(areq_is_sent_back.is.null,areq_is_sent_back.is.false)'],
      };
    } else if (isPending) {
      extraParams = {
        areq_state: ['eq.APPROVAL_PENDING'],
        or: ['(areq_is_sent_back.is.null,areq_is_sent_back.is.false)'],
      };
    } else if (isApproved) {
      extraParams = {
        areq_approval_state: ['ov.{APPROVAL_PENDING,APPROVAL_DONE}'],
      };
    } else {
      extraParams = {
        areq_approval_state: ['ov.{APPROVAL_PENDING,APPROVAL_DONE,APPROVAL_REJECTED}'],
      };
    }

    return extraParams;
  }

  onHomeClicked(): void {
    const queryParams: Params = { state: 'home' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });

    this.trackingService.footerHomeTabClicked({
      page: 'Team Advances',
    });
  }

  onTaskClicked(): void {
    const queryParams: Params = { state: 'tasks', tasksFilters: 'none' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });
    this.trackingService.tasksPageOpened({
      Asset: 'Mobile',
      from: 'Team Advances',
    });
  }

  onCameraClicked(): void {
    this.router.navigate(['/', 'enterprise', 'camera_overlay', { navigate_back: true }]);
  }
}
