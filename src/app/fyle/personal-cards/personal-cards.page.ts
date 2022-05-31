import { Component, EventEmitter, OnInit, AfterViewInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, concat, from, fromEvent, noop, Observable, of, Subject } from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
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
import { PersonalCardTxn } from 'src/app/core/models/personal_card_txn.model';
import { ExpensePreviewComponent } from '../personal-cards-matched-expenses/expense-preview/expense-preview.component';
import { SpinnerDialog } from '@awesome-cordova-plugins/spinner-dialog/ngx';
import { TrackingService } from 'src/app/core/services/tracking.service';

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

  scrollingDirection: string;

  scrolled = false;

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
    private platform: Platform,
    private spinnerDialog: SpinnerDialog,
    private trackingService: TrackingService
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
    this.trackingService.personalCardsViewed();
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

    this.filterPills = this.personalCardsService.generateFilterPills(this.filters);

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
        this.trackingService.newCardLinkedOnPersonalCards();
      });
  }

  onDeleted() {
    this.loadCardData$.next({});
    this.trackingService.cardDeletedOnPersonalCards();
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
          this.trackingService.transactionsFetchedOnPersonalCards();
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
          this.trackingService.transactionsHiddenOnPersonalCards();
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
        selectedFilterValues: this.personalCardsService.generateSelectedFilters(this.filters),
        activeFilterInitialName,
      },
      cssClass: 'dialog-popover',
    });

    await filterPopover.present();

    const { data } = await filterPopover.onWillDismiss();
    if (data) {
      this.currentPageNumber = 1;
      this.filters = this.personalCardsService.convertFilters(data);

      const params = this.addNewFiltersToParams();

      this.loadData$.next(params);
      this.filterPills = this.personalCardsService.generateFilterPills(this.filters);
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

  addNewFiltersToParams() {
    const currentParams = this.loadData$.getValue();

    currentParams.pageNumber = 1;
    const newQueryParams: any = {
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
    await this.openFilters(filterLabel);
  }

  onFilterClose(filterLabel: string) {
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
    this.filterPills = this.personalCardsService.generateFilterPills(this.filters);
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
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
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
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    };

    const selectionModal = await this.modalController.create({
      component: DateRangeModalComponent,
      mode: 'ios',
      ...modalProperties,
    });

    await selectionModal.present();

    const { data } = await selectionModal.onWillDismiss();

    if (data) {
      this.zone.run(() => {
        this.txnDateRange = data.range;
        if (data.range === 'Custom Range') {
          const startDate = data.startDate && moment(data.startDate).format('MMM D');
          const endDate = data.endDate && moment(data.endDate).format('MMM D');
          this.txnDateRange = `${startDate} - ${endDate}`;
        }
      });
      let currentParams = this.loadData$.getValue();
      currentParams = this.personalCardsService.generateDateParams(data, currentParams);

      this.loadData$.next(currentParams);
    }
  }

  doRefresh(event?) {
    const currentParams = this.loadData$.getValue();
    this.currentPageNumber = 1;
    currentParams.pageNumber = this.currentPageNumber;
    this.loadData$.next(currentParams);
    if (event) {
      event.target.complete();
    }
  }
}
