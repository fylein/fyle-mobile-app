import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { Observable, BehaviorSubject, fromEvent, from, iif, of, noop, concat } from 'rxjs';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { NetworkService } from 'src/app/core/services/network.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ModalController, AlertController } from '@ionic/angular';
import { DateService } from 'src/app/core/services/date.service';
import { Router } from '@angular/router';
import { map, distinctUntilChanged, debounceTime, switchMap, finalize, shareReplay } from 'rxjs/operators';
import { MyReportsSearchFilterComponent } from '../my-reports/my-reports-search-filter/my-reports-search-filter.component';
import { MyReportsSortFilterComponent } from '../my-reports/my-reports-sort-filter/my-reports-sort-filter.component';
import { TransactionService } from 'src/app/core/services/transaction.service';

@Component({
  selector: 'app-my-expenses',
  templateUrl: './my-expenses.page.html',
  styleUrls: ['./my-expenses.page.scss'],
})
export class MyExpensesPage implements OnInit {
  isConnected$: Observable<boolean>;
  myExpenses$: Observable<any[]>;
  count$: Observable<number>;
  isInfiniteScrollRequired$: Observable<boolean>;
  loadData$: BehaviorSubject<Partial<{
    pageNumber: number,
    queryParams: any,
    sortParam: string,
    sortDir: string,
    searchString: string
  }>> = new BehaviorSubject({
    pageNumber: 1,
    queryParams: {
      tx_report_id: 'is.null'
    }
  });
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

  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef;

  constructor(
    private networkService: NetworkService,
    private loaderService: LoaderService,
    private reportService: ReportService,
    private modalController: ModalController,
    private dateService: DateService,
    public alertController: AlertController,
    private transactionService: TransactionService,
    private router: Router
  ) { }

  ngOnInit() {
    this.setupNetworkWatcher();
  }

  ionViewWillEnter() {
    fromEvent(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.srcElement.value as string),
        distinctUntilChanged(),
        debounceTime(400)
      ).subscribe((searchString) => {
        const currentParams = this.loadData$.getValue();
        currentParams.searchString = searchString;
        this.currentPageNumber = 1;
        currentParams.pageNumber = this.currentPageNumber;
        this.loadData$.next(currentParams);
      });

    const paginatedPipe = this.loadData$.pipe(
      switchMap((params) => {
        const queryParams = params.queryParams || { tx_report_id: 'is.null' };
        const orderByParams = (params.sortParam && params.sortDir) ? `${params.sortParam}.${params.sortDir}` : null;
        return from(this.loaderService.showLoader()).pipe(switchMap(() => {
          return this.transactionService.getMyExpenses({
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
        const queryParams = params.queryParams || {};
        const orderByParams = (params.sortParam && params.sortDir) ? `${params.sortParam}.${params.sortDir}` : null;

        return from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.transactionService.getAllExpenses({
              queryParams,
              order: orderByParams
            }).pipe(
              map(expenses => expenses.filter(expense => {
                return Object.values(expense)
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

    this.myExpenses$ = this.loadData$.pipe(
      switchMap(params => {
        return iif(() => (params.searchString && params.searchString !== ''), simpleSearchAllDataPipe, paginatedPipe);
      }),
      shareReplay()
    );

    this.count$ = this.loadData$.pipe(
      switchMap(params => {
        return this.transactionService.getMyExpensesCount(params.queryParams);
      }),
      shareReplay()
    );

    const paginatedScroll$ = this.myExpenses$.pipe(
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
    this.myExpenses$.subscribe(noop);
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

    if (!currentParams.queryParams) {
      currentParams.queryParams = {};
    }

    if (this.filters.state) {
      if (this.filters.state === 'ALL') {
        currentParams.queryParams.rp_state =
          'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)';
      } else {
        currentParams.queryParams.rp_state =
          `in.(${this.filters.state})`;

      }
    } else {
      currentParams.queryParams.rp_state = 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)';
    }

    if (this.filters.date) {
      if (this.filters.date === 'THISMONTH') {
        currentParams.queryParams.and =
          `(rp_created_at.gte.${this.dateService.getThisMonthRange().from.toISOString()},rp_created_at.lt.${this.dateService.getThisMonthRange().to.toISOString()})`;
      } else if (this.filters.date === 'LASTMONTH') {
        currentParams.queryParams.and =
          `(rp_created_at.gte.${this.dateService.getLastMonthRange().from.toISOString()},rp_created_at.lt.${this.dateService.getLastMonthRange().to.toISOString()})`;
      } else if (this.filters.date === 'CUSTOMDATE') {
        currentParams.queryParams.and =
          `(rp_created_at.gte.${this.filters.customDateStart.toISOString()},rp_created_at.lt.${this.filters.customDateEnd.toISOString()})`;
      } else {
        delete currentParams.queryParams.and;
      }
    } else {
      delete currentParams.queryParams.and;
    }

    if (this.filters.sortParam && this.filters.sortDir) {
      currentParams.sortParam = this.filters.sortParam;
      currentParams.sortDir = this.filters.sortDir;
    } else {
      currentParams.sortParam = 'rp_created_at';
      currentParams.sortDir = 'desc';
    }

    return currentParams;
  }

  async openFilters() {
    const filterModal = await this.modalController.create({
      component: MyReportsSearchFilterComponent,
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
      component: MyReportsSortFilterComponent,
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
    this.router.navigate(['/', 'enterprise', 'my_view_report', { id: erpt.rp_id }]);
  }

  async onDeleteReportClick(erpt: ExtendedReport) {
    if (['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'].indexOf(erpt.rp_state) === -1) {
      const alert = await this.alertController.create({
        header: 'Cannot Delete Report',
        message: 'Report cannot be deleted',
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
            handler: noop
          }
        ]
      });

      await alert.present();
    } else {
      const message = `
        <p class="highlight-info">
          On deleting this report, all the associated expenses will be moved to <strong>"My Expenses"</strong> list.
        </p>
        <p class="mb-0">
          Are you sure, you want to delete this report?
        </p>
      `;

      const alert = await this.alertController.create({
        header: 'Delete Report?',
        message,
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
            handler: noop
          },
          {
            text: 'Delete',
            handler: async () => {
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
        ]
      });
      await alert.present();
    }

  }

  onViewCommentsClick(event) {
    console.log(event);
    // TODO: Add when view comments is done
  }
}
