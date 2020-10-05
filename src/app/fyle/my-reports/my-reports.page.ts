import { Component, OnInit, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { concat, Observable, Subject, from, noop, BehaviorSubject, fromEvent, iif, of } from 'rxjs';
import { Router } from '@angular/router';
import { NetworkService } from 'src/app/core/services/network.service';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { concatMap, switchMap, finalize, map, scan, shareReplay, distinctUntilChanged, tap, debounceTime } from 'rxjs/operators';
import { ExtendedTripRequest } from 'src/app/core/models/extended_trip_request.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ReportService } from 'src/app/core/services/report.service';
import { PopoverController } from '@ionic/angular';
import { MyReportsSortFilterComponent } from './my-reports-sort-filter/my-reports-sort-filter.component';
import { MyReportsSearchFilterComponent } from './my-reports-search-filter/my-reports-search-filter.component';

@Component({
  selector: 'app-my-reports',
  templateUrl: './my-reports.page.html',
  styleUrls: ['./my-reports.page.scss'],
})
export class MyReportsPage implements OnInit, AfterViewInit {

  isConnected$: Observable<boolean>;
  myReports$: Observable<ExtendedReport[]>;
  count$: Observable<number>;
  isInfiniteScrollRequired$: Observable<boolean>;
  loadData$: BehaviorSubject<Partial<{
    pageNumber: number,
    queryParams: any,
    sortParam: string,
    sortDir: string,
    searchString: string
  }>> = new BehaviorSubject({
    pageNumber: 1
  });
  currentPageNumber = 1;
  acc = [];
  filters = [];

  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef;

  constructor(
    private networkService: NetworkService,
    private loaderService: LoaderService,
    private reportService: ReportService,
    private popoverController: PopoverController,
    private router: Router
  ) { }

  ngOnInit() {
    this.setupNetworkWatcher();
  }

  ngAfterViewInit() {
    fromEvent(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.srcElement.value as string),
        distinctUntilChanged(),
        debounceTime(200)
      ).subscribe((searchString) => {
        const currentParams = this.loadData$.getValue();
        currentParams.searchString = searchString;
        this.currentPageNumber = 1;
        currentParams.pageNumber = this.currentPageNumber;
        this.loadData$.next(currentParams);
      });

    const paginatedPipe = this.loadData$.pipe(
      switchMap((params) => {
        const queryParams = params.queryParams || { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' };
        const orderByParams = (params.sortParam && params.sortDir) ? `${params.sortParam},${params.sortDir}` : null;
        return from(this.loaderService.showLoader()).pipe(switchMap(() => {
          return this.reportService.getMyReports({
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
        const queryParams = params.queryParams || { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' };
        const orderByParams = (params.sortParam && params.sortDir) ? `${params.sortParam},${params.sortDir}` : null;

        return from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.reportService.getAllExtendedReports({
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

    this.myReports$ = this.loadData$.pipe(
      switchMap(params => {
        return iif(() => (params.searchString && params.searchString !== ''), simpleSearchAllDataPipe, paginatedPipe);
      }),
      shareReplay()
    );

    this.count$ = this.reportService.getMyReportsCount().pipe(
      shareReplay()
    );

    const paginatedScroll$ = this.myReports$.pipe(
      concatMap(erpts => {
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
    this.myReports$.subscribe(noop);
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
    this.loadData$.next({ pageNumber: this.currentPageNumber });
    event.target.complete();
  }

  doRefresh(event) {
    this.currentPageNumber = 1;
    this.loadData$.next({ pageNumber: this.currentPageNumber });
    event.target.complete();
  }

  simpleSearchHandler(event) {
    console.log(event);
  }

  async openFilters() {
    const filterPopover = await this.popoverController.create({
      component: MyReportsSearchFilterComponent,
      componentProps: {
        filters: this.filters
      },
      cssClass: 'search-sort-popover'
    });

    await filterPopover.present();
  }


  async openSort() {
    const sortPopover = await this.popoverController.create({
      component: MyReportsSortFilterComponent,
      componentProps: {
        sortDir: this.loadData$.value.sortDir,
        sortParam: this.loadData$.value.sortParam
      },
      cssClass: 'search-sort-popover'
    });

    await sortPopover.present();
  }

  onReportClick(event) {

  }
}
