import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { InfiniteScrollCustomEvent, SegmentCustomEvent } from '@ionic/core';
import {
  Observable,
  BehaviorSubject,
  finalize,
  noop,
  tap,
  from,
  switchMap,
  concat,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  of,
  shareReplay,
} from 'rxjs';
import { PersonalCard } from 'src/app/core/models/personal_card.model';
import { PersonalCardTxn } from 'src/app/core/models/personal_card_txn.model';
import { HeaderState } from 'src/app/shared/components/fy-header/header-state.enum';

import * as dayjs from 'dayjs';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';
import { DateRangeModalComponent } from './date-range-modal/date-range-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SpinnerDialog } from '@awesome-cordova-plugins/spinner-dialog/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpensePreviewComponent } from '../personal-cards-matched-expenses/expense-preview/expense-preview.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { GetTasksQueryParamsWithFilters } from 'src/app/core/models/get-tasks-query-params-with-filters.model';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { Expense } from 'src/app/core/models/expense.model';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';

type Filters = Partial<{
  amount: number;
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
  transactionType: string;
}>;

@Component({
  selector: 'app-personal-cards',
  templateUrl: './personal-cards.page.html',
  styleUrls: ['./personal-cards.page.scss'],
})
export class PersonalCardsPage implements OnInit, AfterViewInit {
  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef<HTMLInputElement>;

  headerState: HeaderState = HeaderState.base;

  isConnected$: Observable<boolean>;

  linkedAccountsCount$: Observable<number>;

  linkedAccounts$: Observable<PersonalCard[]>;

  loadCardData$: BehaviorSubject<{}> = new BehaviorSubject({});

  loadData$: BehaviorSubject<
    Partial<{
      pageNumber: number;
      queryParams: Record<string, string | string[]>;
      sortParam: string;
      sortDir: string;
      searchString: string;
    }>
  > = new BehaviorSubject({
    pageNumber: 1,
  });

  transactions$: Observable<PersonalCardTxn[]>;

  transactionsCount$: Observable<number>;

  navigateBack = false;

  isLoading = true;

  isCardsLoaded = false;

  isTrasactionsLoading = true;

  isHiding = false;

  isLoadingDataInfiniteScroll = false;

  acc: PersonalCardTxn[] = [];

  currentPageNumber = 1;

  isInfiniteScrollRequired$: Observable<boolean>;

  selectedTrasactionType = 'INITIALIZED';

  selectedAccount: string;

  isfetching = false;

  selectionMode = false;

  selectedElements: string[];

  selectAll;

  filters: Filters;

  filterPills = [];

  isSearchBarFocused = false;

  simpleSearchText = '';

  txnDateRange = 'Date Range';

  mode: string;

  loadingMatchedExpenseCount = false;

  loadingTxnId: string;

  scrollingDirection: string;

  scrolled = false;

  constructor(
    private personalCardsService: PersonalCardsService,
    private networkService: NetworkService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private inAppBrowserService: InAppBrowserService,
    private loaderService: LoaderService,
    private zone: NgZone,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private modalController: ModalController,
    private apiV2Service: ApiV2Service,
    private platform: Platform,
    private spinnerDialog: SpinnerDialog,
    private trackingService: TrackingService,
    private modalProperties: ModalPropertiesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.setupNetworkWatcher();
    const isIos = this.platform.is('ios');
    if (isIos) {
      this.mode = 'ios';
    } else {
      this.mode = 'md';
    }
  }

  ionViewWillEnter(): void {
    if (this.isCardsLoaded) {
      const currentParams = this.loadData$.getValue();
      this.loadData$.next(currentParams);
    }
    this.trackingService.personalCardsViewed();
  }

  loadLinkedAccounts(): void {
    this.linkedAccounts$ = this.loadCardData$.pipe(
      tap(() => (this.isLoading = true)),
      switchMap(() =>
        this.personalCardsService.getLinkedAccounts().pipe(
          tap(() => {
            this.isCardsLoaded = true;
          }),
          finalize(() => {
            this.isLoading = false;
          }),
        ),
      ),
      shareReplay(1),
    );
  }

  loadTransactionCount(): void {
    this.transactionsCount$ = this.loadData$.pipe(
      switchMap((params) => {
        const queryParams = this.apiV2Service.extendQueryParamsForTextSearch(params.queryParams, params.searchString);
        return this.personalCardsService.getBankTransactionsCount(queryParams);
      }),
      shareReplay(1),
    );
  }

  loadInfinitScroll(): void {
    const paginatedScroll$ = this.transactions$.pipe(
      switchMap((txns) => this.transactionsCount$.pipe(map((count) => count > txns.length))),
    );
    this.isInfiniteScrollRequired$ = this.loadData$.pipe(switchMap(() => paginatedScroll$));
  }

  loadAccountCount(): void {
    this.linkedAccountsCount$ = this.loadCardData$.pipe(
      switchMap(() => this.personalCardsService.getLinkedAccountsCount()),
      tap((count) => {
        if (count === 0) {
          this.clearFilters();
        }
      }),
      shareReplay(1),
    );
  }

  loadPersonalTxns(): Observable<PersonalCardTxn[]> {
    return this.loadData$.pipe(
      switchMap((params) => {
        let queryParams: Record<string, string>;
        if (this.activatedRoute.snapshot.queryParams.filters) {
          const route_filters = JSON.parse(this.activatedRoute.snapshot.queryParams.filters as string) as Record<
            string,
            string | string[]
          >;
          this.filters = Object.assign({}, this.filters, route_filters);
          this.currentPageNumber = 1;
          queryParams = this.addNewFiltersToParams() as Record<string, string>;
        } else {
          queryParams = params.queryParams as Record<string, string>;
        }
        queryParams = this.apiV2Service.extendQueryParamsForTextSearch(queryParams as {}, params.searchString);
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
                  }),
                );
            } else {
              this.isTrasactionsLoading = false;
              return of({
                data: [],
              });
            }
          }),
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
      }),
    );
  }

  ngAfterViewInit(): void {
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;
    this.loadCardData$ = new BehaviorSubject({});

    this.loadAccountCount();

    this.loadLinkedAccounts();

    this.loadData$ = new BehaviorSubject({
      pageNumber: 1,
    });

    const paginatedPipe = this.loadPersonalTxns();

    this.transactions$ = paginatedPipe.pipe(shareReplay(1));
    this.filterPills = this.personalCardsService.generateFilterPills(this.filters);

    this.loadTransactionCount();

    this.loadInfinitScroll();

    this.simpleSearchInput.nativeElement.value = '';
    fromEvent<{ srcElement: { value: string } }>(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event) => event.srcElement.value),
        distinctUntilChanged(),
        debounceTime(400),
      )
      .subscribe((searchString) => {
        const currentParams = this.loadData$.getValue();
        currentParams.searchString = searchString;
        this.currentPageNumber = 1;
        currentParams.pageNumber = this.currentPageNumber;
        this.loadData$.next(currentParams);
      });
    this.cdr.detectChanges();
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());

    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }

  linkAccount(): void {
    from(this.loaderService.showLoader('Redirecting you to our banking partner...', 10000))
      .pipe(
        switchMap(() => this.personalCardsService.getToken()),
        finalize(async () => {
          await this.loaderService.hideLoader();
        }),
      )
      .subscribe((yodleeConfig) => {
        this.openYoodle(yodleeConfig.fast_link_url, yodleeConfig.access_token);
      });
  }

  openYoodle(url: string, access_token: string): void {
    const pageContentUrl = this.personalCardsService.htmlFormUrl(url, access_token);
    const browser = this.inAppBrowserService.create(pageContentUrl, '_blank', 'location=no');
    this.spinnerDialog.show();
    /* added this for failsafe */
    setTimeout(() => {
      this.spinnerDialog.hide();
    }, 15000);
    browser.on('loadstop').subscribe(() => {
      this.spinnerDialog.hide();
    });
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
          const uri = decodeURIComponent(event.url.slice(43));
          const decodedData = JSON.parse(uri) as {
            requestId: string;
          }[];
          if (decodedData && decodedData[0]) {
            this.postAccounts([decodedData[0].requestId]);
          }
        });
      }
    });
  }

  postAccounts(requestIds: string[]): void {
    from(this.loaderService.showLoader('Linking your card with Fyle...', 30000))
      .pipe(
        switchMap(() => this.personalCardsService.postBankAccounts(requestIds)),
        finalize(async () => {
          await this.loaderService.hideLoader();
        }),
      )
      .subscribe((data) => {
        const message =
          data.length === 1 ? '1 card successfully added to Fyle!' : `${data.length} cards successfully added to Fyle!`;
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', { message }),
          panelClass: ['msb-success'],
        });
        this.loadCardData$.next({});
        this.trackingService.newCardLinkedOnPersonalCards();
      });
  }

  onDeleted(): void {
    this.loadCardData$.next({});
    this.trackingService.cardDeletedOnPersonalCards();
  }

  onCardChanged(event: string): void {
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

  loadData(event: InfiniteScrollCustomEvent): void {
    this.currentPageNumber = this.currentPageNumber + 1;
    this.isLoadingDataInfiniteScroll = true;

    const params = this.loadData$.getValue();
    params.pageNumber = this.currentPageNumber;
    this.loadData$.next(params);

    setTimeout(() => {
      event?.target?.complete();
    }, 1000);
  }

  onHomeClicked(): void {
    const queryParams: Params = { state: 'home' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });

    this.trackingService.footerHomeTabClicked({
      page: 'Personal Cards',
    });
  }

  onTaskClicked(): void {
    const queryParams: Params = { state: 'tasks', tasksFilters: 'none' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });
  }

  onCameraClicked(): void {
    this.router.navigate([
      '/',
      'enterprise',
      'camera_overlay',
      {
        navigate_back: true,
      },
    ]);
  }

  segmentChanged(event: SegmentCustomEvent): void {
    if (this.selectionMode) {
      this.switchSelectionMode();
    }
    this.selectedTrasactionType = event.detail.value as string;
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

  fetchNewTransactions(): void {
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
          this.trackingService.transactionsFetchedOnPersonalCards();
        }),
      )
      .subscribe(noop);
  }

  hideSelectedTransactions(): void {
    this.isHiding = true;
    this.personalCardsService
      .hideTransactions(this.selectedElements)
      .pipe(
        tap((data: Expense[]) => {
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
          this.trackingService.transactionsHiddenOnPersonalCards();
        }),
      )
      .subscribe(noop);
  }

  switchSelectionMode(txnId?: string): void {
    if (this.selectedTrasactionType === 'INITIALIZED') {
      this.selectionMode = !this.selectionMode;
      this.selectedElements = [];
      if (txnId) {
        this.selectExpense(txnId);
      }
    }
  }

  selectExpense(txnId: string): void {
    const itemIndex = this.selectedElements.indexOf(txnId);
    if (itemIndex >= 0) {
      this.selectedElements.splice(itemIndex, 1);
    } else {
      this.selectedElements.push(txnId);
    }
  }

  onSelectAll(event: MatCheckboxChange): void {
    this.selectAll = event;
    this.selectedElements = [];
    if (this.selectAll) {
      this.selectedElements = this.acc.map((txn) => txn.btxn_id);
    }
  }

  async openFilters(activeFilterInitialName?: string): Promise<void> {
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
        selectedFilterValues: this.personalCardsService.generateSelectedFilters(this.filters),
        activeFilterInitialName,
      },
      cssClass: 'dialog-popover',
    });

    await filterPopover.present();

    const { data } = (await filterPopover.onWillDismiss()) as OverlayResponse<SelectedFilters<string>[]>;

    if (data) {
      this.currentPageNumber = 1;
      this.filters = this.personalCardsService.convertFilters(data);

      const params = this.addNewFiltersToParams();

      this.loadData$.next(params);
      this.filterPills = this.personalCardsService.generateFilterPills(this.filters);
    }
  }

  async setState(): Promise<void> {
    this.isLoading = true;
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  addNewFiltersToParams(): Partial<GetTasksQueryParamsWithFilters> {
    const currentParams = this.loadData$.getValue();

    currentParams.pageNumber = 1;
    const newQueryParams: Record<string, string | string[]> = {
      or: [],
    };
    newQueryParams.btxn_status = `in.(${this.selectedTrasactionType})`;
    newQueryParams.ba_id = 'eq.' + this.selectedAccount;
    const filters = this.filters;
    this.personalCardsService.generateTxnDateParams(newQueryParams, filters, 'createdOn');
    this.personalCardsService.generateTxnDateParams(newQueryParams, filters, 'updatedOn');
    this.personalCardsService.generateCreditParams(newQueryParams, filters);
    currentParams.queryParams = newQueryParams;
    this.filters = filters;
    return currentParams;
  }

  searchClick(): void {
    this.headerState = HeaderState.simpleSearch;
    const searchInput = this.simpleSearchInput.nativeElement;
    setTimeout(() => {
      searchInput.focus();
    }, 300);
  }

  onSearchBarFocus(): void {
    this.isSearchBarFocused = true;
  }

  onSimpleSearchCancel(): void {
    this.headerState = HeaderState.base;
    this.clearText('onSimpleSearchCancel');
  }

  onFilterPillsClearAll(): void {
    this.clearFilters();
  }

  async onFilterClick(filterLabel: string): Promise<void> {
    await this.openFilters(filterLabel);
  }

  onFilterClose(filterLabel: string): void {
    if (filterLabel === 'Created On') {
      delete this.filters.createdOn;
    }

    if (filterLabel === 'Updated On') {
      delete this.filters.updatedOn;
    }

    if (filterLabel === 'Transactions Type') {
      delete this.filters.transactionType;
    }

    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    this.filterPills = this.personalCardsService.generateFilterPills(this.filters);
  }

  clearText(isFromCancel: string): void {
    this.simpleSearchText = '';
    const searchInput = this.simpleSearchInput.nativeElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
    if (isFromCancel === 'onSimpleSearchCancel') {
      this.isSearchBarFocused = !this.isSearchBarFocused;
    } else {
      this.isSearchBarFocused = !!this.isSearchBarFocused;
    }
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    this.filterPills = this.personalCardsService.generateFilterPills(this.filters);
  }

  createExpense(txnDetails: PersonalCardTxn): void {
    if (this.selectionMode || this.loadingMatchedExpenseCount) {
      return;
    }
    if (txnDetails.btxn_status === 'MATCHED') {
      this.openExpensePreview(txnDetails);
      return;
    }

    const txnDate = dayjs(txnDetails.btxn_transaction_dt).format('YYYY-MM-DD');

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

  async openExpensePreview(txnDetails: PersonalCardTxn): Promise<void> {
    const txn_details = txnDetails?.txn_details;
    const expenseDetailsModal = await this.modalController.create({
      component: ExpensePreviewComponent,
      componentProps: {
        expenseId: txn_details[0]?.id,
        card: txnDetails.ba_account_number,
        cardTxnId: txnDetails.btxn_id,
        type: 'unmatch',
      },
      ...this.modalProperties.getModalDefaultProperties('expense-preview-modal'),
    });

    await expenseDetailsModal.present();

    const currentParams = this.loadData$.getValue();
    this.loadData$.next(currentParams);
  }

  async openDateRangeModal(): Promise<void> {
    const selectionModal = await this.modalController.create({
      component: DateRangeModalComponent,
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties('personal-cards-range-modal'),
    });

    await selectionModal.present();

    const { data } = (await selectionModal.onWillDismiss()) as OverlayResponse<{
      range: string;
      startDate: string;
      endDate: string;
    }>;
    if (data) {
      this.zone.run(() => {
        this.txnDateRange = data.range;
        if (data.range === 'Custom Range') {
          const startDate = data.startDate && dayjs(data.startDate).format('MMM D');
          const endDate = data.endDate && dayjs(data.endDate).format('MMM D');
          this.txnDateRange = `${startDate} - ${endDate}`;
        }
      });
      let currentParams = this.loadData$.getValue();
      currentParams = this.personalCardsService.generateDateParams(data, currentParams);

      this.loadData$.next(currentParams);
    }
  }

  doRefresh(event?: InfiniteScrollCustomEvent): void {
    const currentParams = this.loadData$.getValue();
    this.currentPageNumber = 1;
    currentParams.pageNumber = this.currentPageNumber;
    this.loadData$.next(currentParams);
    if (event) {
      event?.target?.complete();
    }
  }
}
