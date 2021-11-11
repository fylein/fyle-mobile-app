import { Component, EventEmitter, OnInit, AfterViewInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, concat, from, fromEvent, noop, Observable, of, Subject } from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { LoaderService } from 'src/app/core/services/loader.service';
import { debounceTime, distinctUntilChanged, finalize, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { PersonalCard } from 'src/app/core/models/personal_card.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from '../../core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { ModalController, Platform } from '@ionic/angular';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { DateService } from 'src/app/core/services/date.service';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import * as moment from 'moment';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { DateRangeModalComponent } from './date-range-modal/date-range-modal.component';

type Filters = Partial<{
  amount: string;
  createdOn: Partial<{
    name?: string;
    customDateStart?: Date;
    customDateEnd?: Date;
  }>;
  updatedOn: Partial<{
    name?: string;
    customDateStart?: Date;
    customDateEnd?: Date;
  }>;
  showCredited: string;
}>;
import { PersonalCardTxn } from 'src/app/core/models/personal_card_txn.model';
import { ExpensePreviewComponent } from '../personal-cards-matched-expenses/expense-preview/expense-preview.component';
@Component({
  selector: 'app-personal-cards',
  templateUrl: './personal-cards.page.html',
  styleUrls: ['./personal-cards.page.scss'],
})
export class PersonalCardsPage implements OnInit, AfterViewInit {
  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef;

  headerState: HeaderState = HeaderState.base;

  isConnected$: Observable<boolean>;

  linkedAccountsCount$: Observable<number>;

  linkedAccounts$: Observable<PersonalCard[]>;

  loadCardData$: BehaviorSubject<any>;

  loadData$: BehaviorSubject<
    Partial<{
      pageNumber: number;
      queryParams: any;
      sortParam: string;
      sortDir: string;
      searchString: string;
    }>
  >;

  transactions$: Observable<PersonalCardTxn[]>;

  transactionsCount$: Observable<number>;

  navigateBack = false;

  isLoading = true;

  isCardsLoaded = false;

  isTrasactionsLoading = true;

  isHiding = false;

  isLoadingDataInfiniteScroll = false;

  acc = [];

  currentPageNumber = 1;

  isInfiniteScrollRequired$: Observable<boolean>;

  selectedTrasactionType = 'INITIALIZED';

  selectedAccount: string;

  isfetching = false;

  selectionMode = false;

  selectedElements: any[];

  selectAll = false;

  filters: Filters;

  filterPills = [];

  isSearchBarFocused = false;

  simpleSearchText = '';

  txnDateRange = 'Date Range';

  mode: string;

  loadingMatchedExpenseCount = false;

  loadingTxnId: string;

  constructor(
    private personalCardsService: PersonalCardsService,
    private networkService: NetworkService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private inAppBrowser: InAppBrowser,
    private loaderService: LoaderService,
    private zone: NgZone,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private modalController: ModalController,
    private dateService: DateService,
    private apiV2Service: ApiV2Service,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.setupNetworkWatcher();
    const isIos = this.platform.is('ios');
    if (isIos) {
      this.mode = 'ios';
    } else {
      this.mode = 'md';
    }
  }

  ionViewWillEnter() {
    if (this.isCardsLoaded) {
      const currentParams = this.loadData$.getValue();
      this.loadData$.next(currentParams);
    }
  }

  ngAfterViewInit() {
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;

    this.loadCardData$ = new BehaviorSubject({});
    this.linkedAccountsCount$ = this.loadCardData$.pipe(
      switchMap(() => this.personalCardsService.getLinkedAccountsCount()),
      tap((count) => {
        if (count === 0) {
          this.clearFilters();
        }
      }),
      shareReplay(1)
    );
    this.linkedAccounts$ = this.loadCardData$.pipe(
      tap(() => (this.isLoading = true)),
      switchMap(() =>
        this.personalCardsService.getLinkedAccounts().pipe(
          tap((bankAccounts) => {
            this.isCardsLoaded = true;
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
      ),
      shareReplay(1)
    );

    this.loadData$ = new BehaviorSubject({});

    const paginatedPipe = this.loadData$.pipe(
      switchMap((params) => {
        let queryParams;
        if (this.activatedRoute.snapshot.queryParams.filters) {
          this.filters = Object.assign({}, this.filters, JSON.parse(this.activatedRoute.snapshot.queryParams.filters));
          this.currentPageNumber = 1;
          queryParams = this.addNewFiltersToParams();
        } else {
          queryParams = params.queryParams;
        }
        queryParams = this.apiV2Service.extendQueryParamsForTextSearch(queryParams, params.searchString);
        return this.personalCardsService.getBankTransactionsCount(queryParams).pipe(
          switchMap((count) => {
            if (count > (params.pageNumber - 1) * 10) {
              return this.personalCardsService
                .getBankTransactions({
                  offset: (params.pageNumber - 1) * 10,
                  limit: 10,
                  queryParams,
                })
                .pipe(
                  finalize(() => {
                    this.isTrasactionsLoading = false;
                    this.isLoadingDataInfiniteScroll = false;
                  })
                );
            } else {
              this.isTrasactionsLoading = false;
              return of({
                data: [],
              });
            }
          })
        );
      }),
      map((res) => {
        this.isTrasactionsLoading = false;
        this.isLoadingDataInfiniteScroll = false;
        if (this.currentPageNumber === 1) {
          this.acc = [];
        }
        this.acc = this.acc.concat(res.data);
        return this.acc;
      })
    );

    this.transactions$ = paginatedPipe.pipe(shareReplay(1));

    this.filterPills = this.generateFilterPills(this.filters);

    this.transactionsCount$ = this.loadData$.pipe(
      switchMap((params) => {
        const queryParams = this.apiV2Service.extendQueryParamsForTextSearch(params.queryParams, params.searchString);
        return this.personalCardsService.getBankTransactionsCount(queryParams);
      }),
      shareReplay(1)
    );
    const paginatedScroll$ = this.transactions$.pipe(
      switchMap((txns) => this.transactionsCount$.pipe(map((count) => count > txns.length)))
    );
    this.isInfiniteScrollRequired$ = this.loadData$.pipe(switchMap((_) => paginatedScroll$));

    this.simpleSearchInput.nativeElement.value = '';
    fromEvent(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.srcElement.value as string),
        distinctUntilChanged(),
        debounceTime(400)
      )
      .subscribe((searchString) => {
        const currentParams = this.loadData$.getValue();
        currentParams.searchString = searchString;
        this.currentPageNumber = 1;
        currentParams.pageNumber = this.currentPageNumber;
        this.loadData$.next(currentParams);
      });
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

  linkAccount() {
    from(this.loaderService.showLoader('Redirecting you to our banking partner...', 10000))
      .pipe(
        switchMap(() => this.personalCardsService.getToken()),
        finalize(async () => {
          await this.loaderService.hideLoader();
        })
      )
      .subscribe((yodleeConfig) => {
        this.openYoodle(yodleeConfig.fast_link_url, yodleeConfig.access_token);
      });
  }

  openYoodle(url, access_token) {
    const pageContentUrl = this.personalCardsService.htmlFormUrl(url, access_token);
    const browser = this.inAppBrowser.create(pageContentUrl, '_blank', 'location=no');
    browser.on('loadstart').subscribe((event) => {
      /* As of now yodlee not supported for postmessage for cordova
         So now added callback url as https://www.fylehq.com ,
         after success yodlee will redirect to the url with success message on params,
         while start loading this url below code will parse the success message and
         close the inappborwser. this url will not visible to users.
      */
      if (event.url.substring(0, 22) === 'https://www.fylehq.com') {
        browser.close();
        this.zone.run(() => {
          const decodedData = JSON.parse(decodeURIComponent(event.url.slice(43)));
          this.postAccounts([decodedData[0].requestId]);
        });
      }
    });
  }

  postAccounts(requestIds) {
    from(this.loaderService.showLoader('Linking your card with Fyle...', 30000))
      .pipe(
        switchMap(() => this.personalCardsService.postBankAccounts(requestIds)),
        finalize(async () => {
          await this.loaderService.hideLoader();
        })
      )
      .subscribe((data) => {
        const message =
          data.length === 1 ? '1 card successfully added to Fyle!' : `${data.length} cards successfully added to Fyle!`;
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', { message }),
          panelClass: ['msb-success'],
        });
        this.loadCardData$.next({});
      });
  }

  onDeleted() {
    this.loadCardData$.next({});
  }

  onCardChanged(event) {
    this.selectedAccount = event;
    this.acc = [];
    const params = this.loadData$.getValue();
    const queryParams = params.queryParams || {};
    queryParams.btxn_status = `in.(${this.selectedTrasactionType})`;
    queryParams.ba_id = 'eq.' + this.selectedAccount;
    params.queryParams = queryParams;
    params.pageNumber = 1;
    this.zone.run(() => {
      this.isTrasactionsLoading = true;
      this.loadData$.next(params);
    });
  }

  loadData(event) {
    this.currentPageNumber = this.currentPageNumber + 1;
    this.isLoadingDataInfiniteScroll = true;

    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.loadData$.next(params);

    setTimeout(() => {
      event.target.complete();
    }, 1000);
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
    this.router.navigate([
      '/',
      'enterprise',
      'camera_overlay',
      {
        navigate_back: true,
      },
    ]);
  }

  segmentChanged(event) {
    if (this.selectionMode) {
      this.switchSelectionMode();
    }
    this.selectedTrasactionType = event.detail.value;
    this.acc = [];
    const params = this.loadData$.getValue();
    const queryParams = params.queryParams || {};
    queryParams.btxn_status = `in.(${this.selectedTrasactionType})`;
    params.queryParams = queryParams;
    params.pageNumber = 1;
    this.zone.run(() => {
      this.isTrasactionsLoading = true;
      this.loadData$.next(params);
    });
  }

  fetchNewTransactions() {
    this.isfetching = true;
    this.isTrasactionsLoading = true;
    if (this.selectionMode) {
      this.switchSelectionMode();
    }
    this.personalCardsService
      .fetchTransactions(this.selectedAccount)
      .pipe(
        finalize(() => {
          this.acc = [];
          this.isfetching = false;
          const params = this.loadData$.getValue();
          params.pageNumber = 1;
          this.loadData$.next(params);
        })
      )
      .subscribe(noop);
  }

  hideSelectedTransactions() {
    this.isHiding = true;
    this.personalCardsService
      .hideTransactions(this.selectedElements)
      .pipe(
        tap((data: any) => {
          const message =
            data.length === 1
              ? '1 Transaction successfully hidden!'
              : `${data.length} Transactions successfully hidden!`;
          this.matSnackBar.openFromComponent(ToastMessageComponent, {
            ...this.snackbarProperties.setSnackbarProperties('success', { message }),
            panelClass: ['msb-success'],
          });
        }),
        finalize(() => {
          this.isHiding = false;
          this.acc = [];
          const params = this.loadData$.getValue();
          params.pageNumber = 1;
          if (this.selectionMode) {
            this.switchSelectionMode();
          }
          this.loadData$.next(params);
        })
      )
      .subscribe(noop);
  }

  switchSelectionMode(txnId?) {
    if (this.selectedTrasactionType === 'INITIALIZED') {
      this.selectionMode = !this.selectionMode;
      this.selectedElements = [];
      if (txnId) {
        this.selectExpense(txnId);
      }
    }
  }

  selectExpense(txnId: string) {
    const itemIndex = this.selectedElements.indexOf(txnId);
    if (itemIndex >= 0) {
      this.selectedElements.splice(itemIndex, 1);
    } else {
      this.selectedElements.push(txnId);
    }
  }

  onSelectAll(event) {
    this.selectAll = event;
    this.selectedElements = [];
    if (this.selectAll) {
      this.selectedElements = this.acc.map((txn) => txn.btxn_id);
    }
  }

  async openFilters(activeFilterInitialName?: string) {
    const filterPopover = await this.modalController.create({
      component: FyFiltersComponent,
      componentProps: {
        filterOptions: [
          {
            name: 'Created On',
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
            name: 'Updated On',
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
            name: 'Transactions Type',
            optionType: FilterOptionType.singleselect,
            options: [
              {
                label: 'Credit',
                value: 'Credit',
              },
              {
                label: 'Debit',
                value: 'Debit',
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

    const { data } = await filterPopover.onWillDismiss();
    if (data) {
      this.currentPageNumber = 1;
      this.filters = this.convertFilters(data);

      const params = this.addNewFiltersToParams();

      this.loadData$.next(params);
      this.filterPills = this.generateFilterPills(this.filters);
    }
  }

  async setState(state: string) {
    this.isLoading = true;
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  convertFilters(selectedFilters: SelectedFilters<any>[]): Filters {
    const generatedFilters: Filters = {};
    const createdOnDateFilter = selectedFilters.find((filter) => filter.name === 'Created On');
    if (createdOnDateFilter) {
      generatedFilters.createdOn = { name: createdOnDateFilter?.value };
      if (createdOnDateFilter.associatedData) {
        generatedFilters.createdOn.customDateStart = createdOnDateFilter.associatedData?.startDate;
        generatedFilters.createdOn.customDateEnd = createdOnDateFilter.associatedData?.endDate;
      }
    }

    const updatedOnDateFilter = selectedFilters.find((filter) => filter.name === 'Updated On');
    if (updatedOnDateFilter) {
      generatedFilters.updatedOn = { name: updatedOnDateFilter?.value };
      if (updatedOnDateFilter.associatedData) {
        generatedFilters.updatedOn.customDateStart = updatedOnDateFilter.associatedData?.startDate;
        generatedFilters.updatedOn.customDateEnd = updatedOnDateFilter.associatedData?.endDate;
      }
    }

    const showCreditedFilter = selectedFilters.find((filter) => filter.name === 'Transactions Type');

    if (showCreditedFilter) {
      generatedFilters.showCredited = showCreditedFilter.value;
    }

    return generatedFilters;
  }

  addNewFiltersToParams() {
    const currentParams = this.loadData$.getValue();

    currentParams.pageNumber = 1;
    const newQueryParams: any = {
      or: [],
    };
    newQueryParams.btxn_status = `in.(${this.selectedTrasactionType})`;
    newQueryParams.ba_id = 'eq.' + this.selectedAccount;
    this.generateCreatedOnDateParams(newQueryParams);
    this.generateUpdatedOnDateParams(newQueryParams);
    this.generateCreditParams(newQueryParams);
    currentParams.queryParams = newQueryParams;

    return currentParams;
  }

  generateCreatedOnDateParams(newQueryParams) {
    if (this.filters.createdOn) {
      this.filters.createdOn.customDateStart =
        this.filters.createdOn.customDateStart && new Date(this.filters.createdOn.customDateStart);
      this.filters.createdOn.customDateEnd =
        this.filters.createdOn.customDateEnd && new Date(this.filters.createdOn.customDateEnd);
      if (this.filters.createdOn.name === DateFilters.thisMonth) {
        const thisMonth = this.dateService.getThisMonthRange();
        newQueryParams.and = `(btxn_created_at.gte.${thisMonth.from.toISOString()},btxn_created_at.lt.${thisMonth.to.toISOString()})`;
      }

      if (this.filters.createdOn.name === DateFilters.thisWeek) {
        const thisWeek = this.dateService.getThisWeekRange();
        newQueryParams.and = `(btxn_created_at.gte.${thisWeek.from.toISOString()},btxn_created_at.lt.${thisWeek.to.toISOString()})`;
      }

      if (this.filters.createdOn.name === DateFilters.lastMonth) {
        const lastMonth = this.dateService.getLastMonthRange();
        newQueryParams.and = `(btxn_created_at.gte.${lastMonth.from.toISOString()},btxn_created_at.lt.${lastMonth.to.toISOString()})`;
      }

      this.generateCreatedOnCustomDateParams(newQueryParams);
    }
  }

  generateCreatedOnCustomDateParams(newQueryParams: any) {
    if (this.filters.createdOn?.name === DateFilters.custom) {
      const startDate = this.filters?.createdOn?.customDateStart?.toISOString();
      const endDate = this.filters?.createdOn?.customDateEnd?.toISOString();
      if (this.filters.createdOn?.customDateStart && this.filters.createdOn?.customDateEnd) {
        newQueryParams.and = `(btxn_created_at.gte.${startDate},btxn_created_at.lt.${endDate})`;
      } else if (this.filters.createdOn?.customDateStart) {
        newQueryParams.and = `(btxn_created_at.gte.${startDate})`;
      } else if (this.filters.createdOn?.customDateEnd) {
        newQueryParams.and = `(btxn_created_at.lt.${endDate})`;
      }
    }
  }

  generateUpdatedOnDateParams(newQueryParams) {
    if (this.filters.updatedOn) {
      this.filters.updatedOn.customDateStart =
        this.filters.updatedOn.customDateStart && new Date(this.filters.updatedOn.customDateStart);
      this.filters.updatedOn.customDateEnd =
        this.filters.updatedOn.customDateEnd && new Date(this.filters.updatedOn.customDateEnd);
      if (this.filters.updatedOn.name === DateFilters.thisMonth) {
        const thisMonth = this.dateService.getThisMonthRange();
        newQueryParams.and = `(btxn_updated_at.gte.${thisMonth.from.toISOString()},btxn_updated_at.lt.${thisMonth.to.toISOString()})`;
      }

      if (this.filters.updatedOn.name === DateFilters.thisWeek) {
        const thisWeek = this.dateService.getThisWeekRange();
        newQueryParams.and = `(btxn_updated_at.gte.${thisWeek.from.toISOString()},btxn_updated_at.lt.${thisWeek.to.toISOString()})`;
      }

      if (this.filters.updatedOn.name === DateFilters.lastMonth) {
        const lastMonth = this.dateService.getLastMonthRange();
        newQueryParams.and = `(btxn_updated_at.gte.${lastMonth.from.toISOString()},btxn_updated_at.lt.${lastMonth.to.toISOString()})`;
      }

      this.generateCreatedOnCustomDateParams(newQueryParams);
    }
  }

  generateUpdatedOnCustomDateParams(newQueryParams: any) {
    if (this.filters.updatedOn?.name === DateFilters.custom) {
      const startDate = this.filters?.updatedOn?.customDateStart?.toISOString();
      const endDate = this.filters?.updatedOn?.customDateEnd?.toISOString();
      if (this.filters.updatedOn?.customDateStart && this.filters.updatedOn?.customDateEnd) {
        newQueryParams.and = `(btxn_updated_at.gte.${startDate},btxn_updated_at.lt.${endDate})`;
      } else if (this.filters.updatedOn?.customDateStart) {
        newQueryParams.and = `(btxn_updated_at.gte.${startDate})`;
      } else if (this.filters.updatedOn?.customDateEnd) {
        newQueryParams.and = `(btxn_updated_at.lt.${endDate})`;
      }
    }
  }

  generateCreditParams(newQueryParams) {
    if (this.filters.showCredited) {
      if (this.filters.showCredited === 'Credit') {
        newQueryParams.or = `(btxn_transaction_type.in.(credit))`;
      }
      if (this.filters.showCredited === 'Debit') {
        newQueryParams.or = `(btxn_transaction_type.in.(debit))`;
      }
    }
  }

  generateSelectedFilters(filter: Filters): SelectedFilters<any>[] {
    const generatedFilters: SelectedFilters<any>[] = [];

    if (filter?.updatedOn) {
      generatedFilters.push({
        name: 'Updated On',
        value: filter.updatedOn.name,
        associatedData: {
          startDate: filter.updatedOn.customDateStart,
          endDate: filter.updatedOn.customDateEnd,
        },
      });
    }

    if (filter?.createdOn) {
      generatedFilters.push({
        name: 'Created On',
        value: filter.createdOn.name,
        associatedData: {
          startDate: filter.createdOn.customDateStart,
          endDate: filter.createdOn.customDateEnd,
        },
      });
    }

    if (filter?.showCredited) {
      generatedFilters.push({
        name: 'Transactions Type',
        value: filter.showCredited,
      });
    }

    return generatedFilters;
  }

  generateFilterPills(filter: Filters) {
    const filterPills: FilterPill[] = [];

    if (filter?.createdOn) {
      this.generateCreatedOnDateFilterPills(filter, filterPills);
    }

    if (filter?.updatedOn) {
      this.generateUpdatedOnDateFilterPills(filter, filterPills);
    }

    if (filter?.showCredited) {
      this.generateCreditTrasactionsFilterPills(filter, filterPills);
    }

    return filterPills;
  }

  generateCreatedOnDateFilterPills(filter, filterPills: FilterPill[]) {
    if (filter.createdOn?.name === DateFilters.thisWeek) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: 'this Week',
      });
    }

    if (filter.createdOn?.name === DateFilters.thisMonth) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: 'this Month',
      });
    }

    if (filter.createdOn?.name === DateFilters.all) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: 'All',
      });
    }

    if (filter.createdOn?.name === DateFilters.lastMonth) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: 'Last Month',
      });
    }

    if (filter.createdOn?.name === DateFilters.custom) {
      this.generateCreatedOnCustomDatePill(filter, filterPills);
    }
  }

  generateCreatedOnCustomDatePill(filter: any, filterPills: FilterPill[]) {
    const startDate = filter.createdOn.customDateStart && moment(filter.createdOn.customDateStart).format('y-MM-D');
    const endDate = filter.createdOn.customDateEnd && moment(filter.createdOn.customDateEnd).format('y-MM-D');

    if (startDate && endDate) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: `${startDate} to ${endDate}`,
      });
    } else if (startDate) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: `>= ${startDate}`,
      });
    } else if (endDate) {
      filterPills.push({
        label: 'Created On',
        type: 'date',
        value: `<= ${endDate}`,
      });
    }
  }

  generateUpdatedOnDateFilterPills(filter, filterPills: FilterPill[]) {
    if (filter.updatedOn?.name === DateFilters.thisWeek) {
      filterPills.push({
        label: 'Updated On',
        type: 'date',
        value: 'this Week',
      });
    }

    if (filter.updatedOn?.name === DateFilters.thisMonth) {
      filterPills.push({
        label: 'Updated On',
        type: 'date',
        value: 'this Month',
      });
    }

    if (filter.updatedOn?.name === DateFilters.all) {
      filterPills.push({
        label: 'Updated On',
        type: 'date',
        value: 'All',
      });
    }

    if (filter.updatedOn?.name === DateFilters.lastMonth) {
      filterPills.push({
        label: 'Updated On',
        type: 'date',
        value: 'Last Month',
      });
    }

    if (filter.updatedOn?.name === DateFilters.custom) {
      this.generateUpdatedOnCustomDatePill(filter, filterPills);
    }
  }

  generateUpdatedOnCustomDatePill(filter: any, filterPills: FilterPill[]) {
    const startDate = filter.updatedOn.customDateStart && moment(filter.updatedOn.customDateStart).format('y-MM-D');
    const endDate = filter.updatedOn.customDateEnd && moment(filter.updatedOn.customDateEnd).format('y-MM-D');

    if (startDate && endDate) {
      filterPills.push({
        label: 'Updated On',
        type: 'date',
        value: `${startDate} to ${endDate}`,
      });
    } else if (startDate) {
      filterPills.push({
        label: 'Updated On',
        type: 'date',
        value: `>= ${startDate}`,
      });
    } else if (endDate) {
      filterPills.push({
        label: 'Updated On',
        type: 'date',
        value: `<= ${endDate}`,
      });
    }
  }

  generateCreditTrasactionsFilterPills(filter, filterPills: FilterPill[]) {
    if (filter.showCredited === 'Credit') {
      filterPills.push({
        label: 'Transactions Type',
        type: 'string',
        value: 'Credit',
      });
    }

    if (filter.showCredited === 'Debit') {
      filterPills.push({
        label: 'Transactions Type',
        type: 'string',
        value: 'Debit',
      });
    }
  }

  searchClick() {
    this.headerState = HeaderState.simpleSearch;
    const searchInput = this.simpleSearchInput.nativeElement as HTMLInputElement;
    setTimeout(() => {
      searchInput.focus();
    }, 300);
  }

  onSearchBarFocus() {
    this.isSearchBarFocused = true;
  }

  onSimpleSearchCancel() {
    this.headerState = HeaderState.base;
    this.clearText('onSimpleSearchCancel');
  }

  onFilterPillsClearAll() {
    this.clearFilters();
  }

  async onFilterClick(filterLabel: string) {
    if (filterLabel === 'Created On') {
      await this.openFilters('Created On');
    }

    if (filterLabel === 'Updated On') {
      await this.openFilters('Updated On');
    }

    if (filterLabel === 'Transactions Type') {
      await this.openFilters('Transactions Type');
    }
  }

  onFilterClose(filterLabel: string) {
    if (filterLabel === 'Created On') {
      delete this.filters.createdOn;
    }

    if (filterLabel === 'Updated On') {
      delete this.filters.updatedOn;
    }

    if (filterLabel === 'Transactions Type') {
      delete this.filters.showCredited;
    }
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    this.filterPills = this.generateFilterPills(this.filters);
  }

  clearText(isFromCancel) {
    this.simpleSearchText = '';
    const searchInput = this.simpleSearchInput.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
    if (isFromCancel === 'onSimpleSearchCancel') {
      this.isSearchBarFocused = !this.isSearchBarFocused;
    } else {
      this.isSearchBarFocused = !!this.isSearchBarFocused;
    }
  }

  clearFilters() {
    this.filters = {};
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    this.filterPills = this.generateFilterPills(this.filters);
  }

  createExpense(txnDetails) {
    if (this.selectionMode || this.loadingMatchedExpenseCount) {
      return;
    }
    if (txnDetails.btxn_status === 'MATCHED') {
      this.openExpensePreview(txnDetails);
      return;
    }

    const txnDate = moment(txnDetails.btxn_transaction_dt).format('yyyy-MM-DD');

    this.loadingMatchedExpenseCount = true;
    this.loadingTxnId = txnDetails.btxn_id;
    this.personalCardsService.getMatchedExpensesCount(txnDetails.btxn_amount, txnDate).subscribe((count) => {
      this.loadingMatchedExpenseCount = false;
      this.loadingTxnId = null;
      if (count === 0) {
        this.router.navigate([
          '/',
          'enterprise',
          'add_edit_expense',
          { personalCardTxn: JSON.stringify(txnDetails), navigate_back: true },
        ]);
      } else {
        this.router.navigate(['/', 'enterprise', 'personal_cards_matched_expenses'], { state: { txnDetails } });
      }
    });
  }

  async openExpensePreview(txnDetails) {
    const expenseDetailsModal = await this.modalController.create({
      component: ExpensePreviewComponent,
      componentProps: {
        expenseId: txnDetails.txn_details[0].id,
        card: txnDetails.ba_account_number,
        cardTxnId: txnDetails.btxn_id,
        type: 'unmatch',
      },
      cssClass: 'expense-preview-modal',
      showBackdrop: true,
      swipeToClose: true,
      backdropDismiss: true,
      animated: true,
    });

    await expenseDetailsModal.present();

    const { data } = await expenseDetailsModal.onWillDismiss();

    const currentParams = this.loadData$.getValue();
    this.loadData$.next(currentParams);
  }

  async openDateRangeModal() {
    const modalProperties = {
      cssClass: 'personal-cards-range-modal',
      showBackdrop: true,
      swipeToClose: true,
      backdropDismiss: true,
      animated: true,
    };

    const selectionModal = await this.modalController.create({
      component: DateRangeModalComponent,
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...modalProperties,
    });

    await selectionModal.present();

    const { data } = await selectionModal.onWillDismiss();

    if (data) {
      this.zone.run(() => {
        this.txnDateRange = data.range;
      });
      const currentParams = this.loadData$.getValue();

      if (data.range === 'This Month') {
        const thisMonth = this.dateService.getThisMonthRange();
        currentParams.queryParams.or = `(and(btxn_transaction_dt.gte.${thisMonth.from.toISOString()},btxn_transaction_dt.lt.${thisMonth.to.toISOString()}))`;
      }

      if (data.range === 'Last Month') {
        const lastMonth = this.dateService.getLastMonthRange();
        currentParams.queryParams.or = `(and(btxn_transaction_dt.gte.${lastMonth.from.toISOString()},btxn_transaction_dt.lt.${lastMonth.to.toISOString()}))`;
      }

      if (data.range === 'Last 30 Days') {
        const last30Days = this.dateService.getLastDaysRange(30);
        currentParams.queryParams.or = `(and(btxn_transaction_dt.gte.${last30Days.from.toISOString()},btxn_transaction_dt.lt.${last30Days.to.toISOString()}))`;
      }

      if (data.range === 'Last 60 Days') {
        const last60Days = this.dateService.getLastDaysRange(60);
        currentParams.queryParams.or = `(and(btxn_transaction_dt.gte.${last60Days.from.toISOString()},btxn_transaction_dt.lt.${last60Days.to.toISOString()}))`;
      }

      if (data.range === 'All Time') {
        const last90Days = this.dateService.getLastDaysRange(90);
        currentParams.queryParams.or = `(and(btxn_transaction_dt.gte.${last90Days.from.toISOString()},btxn_transaction_dt.lt.${last90Days.to.toISOString()}))`;
      }

      this.loadData$.next(currentParams);
    }
  }

  doRefresh(event?) {
    const params = this.loadCardData$.getValue();
    this.loadCardData$.next(params);
    if (event) {
      event.target.complete();
    }
  }
}
