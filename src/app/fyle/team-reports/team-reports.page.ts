import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import {Observable, BehaviorSubject, fromEvent, from, iif, of, noop, concat, forkJoin, Subject} from 'rxjs';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { NetworkService } from 'src/app/core/services/network.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ModalController } from '@ionic/angular';
import { DateService } from 'src/app/core/services/date.service';
import { Router } from '@angular/router';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { map, distinctUntilChanged, debounceTime, switchMap, finalize, shareReplay } from 'rxjs/operators';
import { TeamReportsSearchFilterComponent } from './team-reports-search-filter/team-reports-search-filter.component';
import { TeamReportsSortFilterComponent } from './team-reports-sort-filter/team-reports-sort-filter.component';
import { PopupService } from 'src/app/core/services/popup.service';

@Component({
  selector: 'app-team-reports',
  templateUrl: './team-reports.page.html',
  styleUrls: ['./team-reports.page.scss'],
})
export class TeamReportsPage implements OnInit {
  pageTitle = 'Team Reports';
  isConnected$: Observable<boolean>;
  teamReports$: Observable<ExtendedReport[]>;
  count$: Observable<number>;
  isInfiniteScrollRequired$: Observable<boolean>;
  loadData$: BehaviorSubject<Partial<{
    pageNumber: number,
    queryParams: any,
    sortParam: string,
    sortDir: string,
    searchString: string
  }>>;
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
  orgSettings$: Observable<string>;
  orgSettings: any;
  onPageExit = new Subject();

  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef;

  constructor(
    private networkService: NetworkService,
    private loaderService: LoaderService,
    private reportService: ReportService,
    private modalController: ModalController,
    private dateService: DateService,
    private router: Router,
    private currencyService: CurrencyService,
    private popupService: PopupService
  ) { }

  ngOnInit() {
    this.setupNetworkWatcher();
  }

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  ionViewWillEnter() {
    this.loadData$ = new BehaviorSubject({
      pageNumber: 1,
      queryParams: {
        rp_approval_state: 'in.(APPROVAL_PENDING)',
        rp_state: 'in.(APPROVER_PENDING)',
        sequential_approval_turn: 'in.(true)',
      }
    });

    this.homeCurrency$ = this.currencyService.getHomeCurrency();

    fromEvent(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.srcElement.value as string),
        debounceTime(1000),
        distinctUntilChanged()
      ).subscribe((searchString) => {
        const currentParams = this.loadData$.getValue();
        currentParams.searchString = searchString;
        this.currentPageNumber = 1;
        currentParams.pageNumber = this.currentPageNumber;
        this.loadData$.next(currentParams);
      });

    const paginatedPipe = this.loadData$.pipe(
      switchMap((params) => {
        const queryParams = params.queryParams;
        const orderByParams = (params.sortParam && params.sortDir) ? `${params.sortParam}.${params.sortDir}` : null;
        return from(this.loaderService.showLoader()).pipe(switchMap(() => {
          return this.reportService.getTeamReports({
            offset: (params.pageNumber - 1) * 10,
            limit: 10,
            queryParams,
            order: orderByParams
          });
        }),
          finalize(() => from(this.loaderService.hideLoader()))
        );
      }),
      map(res => {
        if (this.currentPageNumber === 1) {
          this.acc = [];
        }
        this.acc = this.acc.concat(res.data);
        return this.acc;
      })
    );

    const simpleSearchAllDataPipe = this.loadData$.pipe(
      switchMap(params => {
        const queryParams = params.queryParams;
        const orderByParams = (params.sortParam && params.sortDir) ? `${params.sortParam}.${params.sortDir}` : null;

        return from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.reportService.getAllTeamExtendedReports({
              queryParams,
              order: orderByParams
            }).pipe(
              map(erpts => erpts.filter(erpt => {
                return Object.values(erpt)
                  .map(value => value && value.toString().toLowerCase())
                  .filter(value => !!value)
                  .some(value => value.toLowerCase().includes(params.searchString.toLowerCase()));
              }))
            );
          }),
          finalize(() => from(this.loaderService.hideLoader()))
        );
      })
    );

    this.teamReports$ = this.loadData$.pipe(
      switchMap(params => {
        return iif(() => (params.searchString && params.searchString !== ''), simpleSearchAllDataPipe, paginatedPipe);
      }),
      shareReplay()
    );

    this.count$ = this.loadData$.pipe(
      switchMap(params => {
        const queryParams = params.queryParams;
        return this.reportService.getTeamReportsCount(queryParams);
      }),
      shareReplay()
    );

    const paginatedScroll$ = this.teamReports$.pipe(
      switchMap(erpts => {
        return this.count$.pipe(
          map(count => {
            return count > erpts.length;
          }));
      })
    );

    this.isInfiniteScrollRequired$ = this.loadData$.pipe(
      switchMap(params => {
        return iif(() => (params.searchString && params.searchString !== ''), of(false), paginatedScroll$);
      })
    );

    this.loadData$.subscribe(noop);
    this.teamReports$.subscribe(noop);
    this.count$.subscribe(noop);
    this.isInfiniteScrollRequired$.subscribe(noop);

  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    });
  }

  loadData(event) {
    this.currentPageNumber = this.currentPageNumber + 1;
    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.loadData$.next(params);
    event.target.complete();
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
        if (this.filters.state === 'ALL') {
          newQueryParams.rp_state = 'in.(APPROVER_PENDING,APPROVER_INQUIRY,APPROVAL_DONE,COMPLETE,APPROVED,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)';
          newQueryParams.rp_approval_state = 'in.(APPROVAL_PENDING,APPROVAL_DONE)';
        } else if (this.filters.state === 'MYQUEUE') {
          newQueryParams.rp_approval_state = 'in.(APPROVAL_PENDING)';
          newQueryParams.rp_state = 'in.(APPROVER_PENDING)';
          newQueryParams.sequential_approval_turn = 'in.(true)';
        }
      } else {
        newQueryParams.rp_approval_state = 'in.(APPROVAL_PENDING)';
        newQueryParams.rp_state = 'in.(APPROVER_PENDING)';
        newQueryParams.sequential_approval_turn = 'in.(true)';
      }

      if (this.filters.date) {
        if (this.filters.date === 'THISMONTH') {
          newQueryParams.and =
            `(rp_created_at.gte.${this.dateService.getThisMonthRange().from.toISOString()},rp_created_at.lt.${this.dateService.getThisMonthRange().to.toISOString()})`;
        } else if (this.filters.date === 'LASTMONTH') {
          newQueryParams.and =
            `(rp_created_at.gte.${this.dateService.getLastMonthRange().from.toISOString()},rp_created_at.lt.${this.dateService.getLastMonthRange().to.toISOString()})`;
        } else if (this.filters.date === 'CUSTOMDATE') {
          newQueryParams.and =
            `(rp_created_at.gte.${this.filters.customDateStart.toISOString()},rp_created_at.lt.${this.filters.customDateEnd.toISOString()})`;
        }
      }

      if (this.filters.sortParam && this.filters.sortDir) {
        currentParams.sortParam = this.filters.sortParam;
        currentParams.sortDir = this.filters.sortDir;
      } else {
        currentParams.sortParam = 'rp_created_at';
        currentParams.sortDir = 'desc';
      }
    } else {
      newQueryParams.rp_approval_state = 'in.(APPROVAL_PENDING)';
      newQueryParams.rp_state = 'in.(APPROVER_PENDING)';
      // TODO verify with Vaishnavi to check wether to send true in both condition
      // newQueryParams.sequential_approval_turn = res.orgSettings$.approval_settings.enable_sequential_approvers ? 'in.(true)' : 'in.(true)';
      newQueryParams.sequential_approval_turn = 'in.(true)';
    }

    currentParams.queryParams = newQueryParams;
    return currentParams;
  }

  async openFilters() {
    const filterModal = await this.modalController.create({
      component: TeamReportsSearchFilterComponent,
      componentProps: {
        filters: this.filters
      }
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
    const sortModal = await this.modalController.create({
      component: TeamReportsSortFilterComponent,
      componentProps: {
        filters: this.filters
      }
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
    this.router.navigate(['/', 'enterprise', 'view_team_report', { id: erpt.rp_id }]);
  }

  async onDeleteReportClick(erpt: ExtendedReport) {
    if (['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'].indexOf(erpt.rp_state) === -1) {
      await this.popupService.showPopup({
        header: 'Cannot Delete Report',
        message: 'Report cannot be deleted',
        primaryCta: {
          text: 'Close'
        }
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
          text: 'Delete'
        }
      });

      if (popupResult === 'primary') {
        from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.reportService.delete(erpt.rp_id);
          }),
          finalize(async () => {
            await this.loaderService.hideLoader();
            this.doRefresh();
          })
        ).subscribe(noop);
      }
    }
  }

  onViewCommentsClick(event) {
    // TODO: Add when view comments is done
  }

}
