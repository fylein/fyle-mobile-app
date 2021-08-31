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
import { TeamReportsSearchFilterComponent } from './team-reports-search-filter/team-reports-search-filter.component';
import { TeamReportsSortFilterComponent } from './team-reports-sort-filter/team-reports-sort-filter.component';
import { PopupService } from 'src/app/core/services/popup.service';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';

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

  filters: Partial<{
    state: string;
    date: string;
    customDateStart: Date;
    customDateEnd: Date;
    sortParam: string;
    sortDir: string;
  }>;

  homeCurrency$: Observable<string>;

  searchText = '';

  orgSettings$: Observable<string>;

  orgSettings: any;

  onPageExit = new Subject();

  constructor(
    private networkService: NetworkService,
    private loaderService: LoaderService,
    private reportService: ReportService,
    private modalController: ModalController,
    private dateService: DateService,
    private router: Router,
    private currencyService: CurrencyService,
    private popupService: PopupService,
    private popoverConroller: PopoverController,
    private activatedRoute: ActivatedRoute,
    private apiV2Service: ApiV2Service
  ) {}

  ngOnInit() {
    this.setupNetworkWatcher();
  }

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  clearText() {
    this.searchText = '';
    const searchInput = this.simpleSearchInput.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ionViewWillEnter() {
    this.loadData$ = new BehaviorSubject({
      pageNumber: 1,
      queryParams: {
        rp_approval_state: 'in.(APPROVAL_PENDING)',
        rp_state: 'in.(APPROVER_PENDING)',
        sequential_approval_turn: 'in.(true)',
      },
    });

    this.homeCurrency$ = this.currencyService.getHomeCurrency();

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
        return this.reportService.getTeamReports({
          offset: (params.pageNumber - 1) * 10,
          limit: 10,
          queryParams,
          order: orderByParams,
        });
      }),
      map((res) => {
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

  addNewFiltersToParams() {
    const currentParams = this.loadData$.getValue();
    currentParams.pageNumber = 1;
    const newQueryParams: any = {};

    if (this.filters) {
      if (this.filters.state) {
        this.setStateFilters(newQueryParams);
      } else {
        this.setDefaultStateFilters(newQueryParams);
      }

      if (this.filters.date) {
        this.setDateFilters(newQueryParams);
      }

      this.setSortFilters(currentParams);
    } else {
      this.setNewFiltersDefault(newQueryParams);
    }

    currentParams.queryParams = newQueryParams;
    return currentParams;
  }

  setSortFilters(
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
      currentParams.sortParam = 'rp_created_at';
      currentParams.sortDir = 'desc';
    }
  }

  setDateFilters(newQueryParams: any) {
    if (this.filters.date === 'THISMONTH') {
      const monthRange = this.dateService.getThisMonthRange();
      newQueryParams.and = `(rp_created_at.gte.${monthRange.from.toISOString()},rp_created_at.lt.${monthRange.to.toISOString()})`;
    } else if (this.filters.date === 'LASTMONTH') {
      const monthRange = this.dateService.getLastMonthRange();
      newQueryParams.and = `(rp_created_at.gte.${monthRange.from.toISOString()},rp_created_at.lt.${monthRange.to.toISOString()})`;
    } else if (this.filters.date === 'CUSTOMDATE') {
      const startDate = this.filters.customDateStart.toISOString();
      const endDate = this.filters.customDateEnd.toISOString();
      newQueryParams.and = `(rp_created_at.gte.${startDate},rp_created_at.lt.${endDate})`;
    }
  }

  setDefaultStateFilters(newQueryParams: any) {
    newQueryParams.rp_approval_state = 'in.(APPROVAL_PENDING)';
    newQueryParams.rp_state = 'in.(APPROVER_PENDING)';
    newQueryParams.sequential_approval_turn = 'in.(true)';
  }

  setStateFilters(newQueryParams: any) {
    if (this.filters.state === 'ALL') {
      // since this is a string can break it down furthur
      // eslint-disable-next-line max-len
      newQueryParams.rp_state =
        'in.(APPROVER_PENDING,APPROVER_INQUIRY,APPROVAL_DONE,COMPLETE,APPROVED,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)';
      newQueryParams.rp_approval_state = 'in.(APPROVAL_PENDING,APPROVAL_DONE)';
    } else if (this.filters.state === 'MYQUEUE') {
      newQueryParams.rp_approval_state = 'in.(APPROVAL_PENDING)';
      newQueryParams.rp_state = 'in.(APPROVER_PENDING)';
      newQueryParams.sequential_approval_turn = 'in.(true)';
    }
  }

  setNewFiltersDefault(newQueryParams: any) {
    newQueryParams.rp_approval_state = 'in.(APPROVAL_PENDING)';
    newQueryParams.rp_state = 'in.(APPROVER_PENDING)';
    newQueryParams.sequential_approval_turn = 'in.(true)';
  }

  async openFilters() {
    const filterModal = await this.popoverConroller.create({
      component: TeamReportsSearchFilterComponent,
      componentProps: {
        filters: this.filters,
      },
      cssClass: 'dialog-popover',
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
    const sortModal = await this.popoverConroller.create({
      component: TeamReportsSortFilterComponent,
      componentProps: {
        filters: this.filters,
      },
      cssClass: 'dialog-popover',
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
}
