import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
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
  Subject,
  takeUntil,
} from 'rxjs';
import { PlatformPersonalCard } from 'src/app/core/models/platform/platform-personal-card.model';
import { PlatformPersonalCardTxn } from 'src/app/core/models/platform/platform-personal-card-txn.model';
import { HeaderState } from 'src/app/shared/components/fy-header/header-state.enum';

import dayjs from 'dayjs';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';
import { DateRangeModalComponent } from './date-range-modal/date-range-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SpinnerDialog } from '@awesome-cordova-plugins/spinner-dialog/ngx';
import { ModalController, Platform, IonicModule } from '@ionic/angular';
import { ExtendQueryParamsService } from 'src/app/core/services/extend-query-params.service';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpensePreviewComponent } from '../personal-cards-matched-expenses/expense-preview/expense-preview.component';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { PersonalCardFilter } from 'src/app/core/models/personal-card-filters.model';
import { PlatformPersonalCardFilterParams } from 'src/app/core/models/platform/platform-personal-card-filter-params.model';
import { PlatformPersonalCardTxnState } from 'src/app/core/models/platform/platform-personal-card-txn-state.enum';
import { PlatformPersonalCardQueryParams } from 'src/app/core/models/platform/platform-personal-card-query-params.model';
import { FyHeaderComponent } from '../../shared/components/fy-header/fy-header.component';
import { MatFormField, MatPrefix, MatInput, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { BankAccountCardsComponent } from '../../shared/components/bank-account-cards/bank-account-cards.component';
import { FyFilterPillsComponent } from '../../shared/components/fy-filter-pills/fy-filter-pills.component';
import { FyZeroStateComponent } from '../../shared/components/fy-zero-state/fy-zero-state.component';
import { PersonalCardTransactionComponent } from '../../shared/components/personal-card-transaction/personal-card-transaction.component';
import { TransactionsShimmerComponent } from './transactions-shimmer/transactions-shimmer.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FormButtonValidationDirective } from '../../shared/directive/form-button-validation.directive';
import { AsyncPipe } from '@angular/common';

// eslint-disable-next-line custom-rules/prefer-semantic-extension-name
type Filters = Partial<PersonalCardFilter>;

@Component({
    selector: 'app-personal-cards',
    templateUrl: './personal-cards.page.html',
    styleUrls: ['./personal-cards.page.scss'],
    imports: [
        FyHeaderComponent,
        IonicModule,
        MatFormField,
        MatIcon,
        MatPrefix,
        MatInput,
        FormsModule,
        MatSuffix,
        BankAccountCardsComponent,
        FyFilterPillsComponent,
        FyZeroStateComponent,
        MatCheckbox,
        PersonalCardTransactionComponent,
        TransactionsShimmerComponent,
        FooterComponent,
        FormButtonValidationDirective,
        AsyncPipe,
    ],
})
export class PersonalCardsPage implements OnInit, AfterViewInit, OnDestroy {
  private personalCardsService = inject(PersonalCardsService);

  private networkService = inject(NetworkService);

  private router = inject(Router);

  private activatedRoute = inject(ActivatedRoute);

  private inAppBrowserService = inject(InAppBrowserService);

  private loaderService = inject(LoaderService);

  private zone = inject(NgZone);

  private matSnackBar = inject(MatSnackBar);

  private snackbarProperties = inject(SnackbarPropertiesService);

  private modalController = inject(ModalController);

  private extendQueryParamsService = inject(ExtendQueryParamsService);

  private platform = inject(Platform);

  private spinnerDialog = inject(SpinnerDialog);

  private trackingService = inject(TrackingService);

  private modalProperties = inject(ModalPropertiesService);

  private cdr = inject(ChangeDetectorRef);

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('simpleSearchInput') simpleSearchInput: ElementRef<HTMLInputElement>;

  headerState: HeaderState = HeaderState.base;

  isConnected$: Observable<boolean>;

  linkedAccountsCount$: Observable<number>;

  linkedAccounts$: Observable<PlatformPersonalCard[]>;

  loadCardData$: BehaviorSubject<{}> = new BehaviorSubject({});

  loadData$: BehaviorSubject<Partial<PlatformPersonalCardFilterParams>> = new BehaviorSubject({
    pageNumber: 1,
  });

  transactions$: Observable<PlatformPersonalCardTxn[]>;

  transactionsCount$: Observable<number>;

  navigateBack = false;

  isLoading = true;

  isCardsLoaded = false;

  isTransactionsLoading = true;

  isHiding = false;

  isLoadingDataInfiniteScroll = false;

  acc: PlatformPersonalCardTxn[] = [];

  currentPageNumber = 1;

  isInfiniteScrollRequired$: Observable<boolean>;

  selectedTransactionType = PlatformPersonalCardTxnState.INITIALIZED;

  selectedAccount: PlatformPersonalCard;

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

  onComponentDestroy$ = new Subject();

  ngOnInit(): void {
    this.setupNetworkWatcher();
    this.trackingService.personalCardsViewed();
    const isIos = this.platform.is('ios');
    if (isIos) {
      this.mode = 'ios';
    } else {
      this.mode = 'md';
    }
  }

  ionViewWillEnter(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params?.refresh) {
        const currentParams = this.loadData$.getValue();
        this.currentPageNumber = 1;
        currentParams.pageNumber = this.currentPageNumber;
        this.loadData$.next(currentParams);
      }
    });
  }

  loadLinkedAccounts(): void {
    this.linkedAccounts$ = this.loadCardData$.pipe(
      tap(() => (this.isLoading = true)),
      switchMap(() =>
        this.personalCardsService.getPersonalCards().pipe(
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
        const queryParams: Partial<PlatformPersonalCardQueryParams> =
          this.extendQueryParamsService.extendQueryParamsForTextSearch(params.queryParams, params.searchString);
        return this.personalCardsService.getBankTransactionsCount(queryParams);
      }),
      shareReplay(1),
    );
  }

  loadInfiniteScroll(): void {
    const paginatedScroll$ = this.transactions$.pipe(
      switchMap((txns) => this.transactionsCount$.pipe(map((count) => count > txns.length))),
    );
    this.isInfiniteScrollRequired$ = this.loadData$.pipe(switchMap(() => paginatedScroll$));
  }

  loadAccountCount(): void {
    this.linkedAccountsCount$ = this.loadCardData$.pipe(
      switchMap(() => this.personalCardsService.getPersonalCardsCount()),
      shareReplay(1),
    );
  }

  loadPersonalTxns(): Observable<PlatformPersonalCardTxn[]> {
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
        queryParams = this.extendQueryParamsService.extendQueryParamsForTextSearch(
          queryParams as {},
          params.searchString,
        );
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
                    this.isTransactionsLoading = false;
                    this.isLoadingDataInfiniteScroll = false;
                  }),
                );
            } else {
              this.isTransactionsLoading = false;
              return of({
                data: [] as PlatformPersonalCardTxn[],
              });
            }
          }),
        );
      }),
      map((res) => {
        this.isTransactionsLoading = false;
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

    const paginatedPipe = this.loadPersonalTxns();
    this.transactions$ = paginatedPipe.pipe(shareReplay(1));
    this.filterPills = this.personalCardsService.generateFilterPills(this.filters);

    this.loadTransactionCount();
    this.loadInfiniteScroll();

    this.simpleSearchInput.nativeElement.value = '';
    fromEvent<{ srcElement: { value: string } }>(this.simpleSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event) => event.srcElement.value),
        distinctUntilChanged(),
        debounceTime(400),
        takeUntil(this.onComponentDestroy$),
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

  ngOnDestroy(): void {
    this.onComponentDestroy$.next(null);
    this.onComponentDestroy$.complete();
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onComponentDestroy$),
      shareReplay(1),
    );

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
        this.openYoodle(yodleeConfig.fast_link_url, yodleeConfig.access_token, false);
      });
  }

  openYoodle(url: string, access_token: string, isMfaFlow: boolean): void {
    const pageContentUrl = this.personalCardsService.htmlFormUrl(
      url,
      access_token,
      isMfaFlow,
      this.selectedAccount?.yodlee_provider_account_id,
    );
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
            if (isMfaFlow) {
              this.syncTransactions();
            } else {
              this.postAccounts();
            }
          }
        });
      }
    });
  }

  postAccounts(): void {
    from(this.loaderService.showLoader('Linking your card with Fyle...', 30000))
      .pipe(
        switchMap(() => this.personalCardsService.postBankAccounts()),
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

  onCardChanged(card: PlatformPersonalCard): void {
    this.selectedAccount = card;
    this.acc = [];
    const params = this.loadData$.getValue();
    const queryParams = params.queryParams || {};
    queryParams.state = `in.(${this.selectedTransactionType})`;
    queryParams.personal_card_id = `eq.${this.selectedAccount.id}`;
    params.queryParams = queryParams;
    params.pageNumber = 1;
    this.zone.run(() => {
      this.isTransactionsLoading = true;
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
      event.target?.complete();
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
    this.selectedTransactionType = event.detail.value as PlatformPersonalCardTxnState;
    this.acc = [];
    const params = this.loadData$.getValue();
    const queryParams = params.queryParams || {};
    queryParams.state = `in.(${this.selectedTransactionType})`;
    params.queryParams = queryParams;
    params.pageNumber = 1;
    this.zone.run(() => {
      this.isTransactionsLoading = true;
      this.loadData$.next(params);
    });
  }

  fetchNewTransactionsWithMfa(): void {
    from(this.loaderService.showLoader('Redirecting you to our banking partner...', 10000))
      .pipe(
        switchMap(() => this.personalCardsService.getToken()),
        finalize(async () => {
          await this.loaderService.hideLoader();
        }),
      )
      .subscribe((yodleeConfig) => {
        this.openYoodle(yodleeConfig.fast_link_url, yodleeConfig.access_token, true);
      });
  }

  fetchNewTransactions(): void {
    this.isfetching = true;
    this.isTransactionsLoading = true;
    if (this.selectionMode) {
      this.switchSelectionMode();
    }
    this.personalCardsService.isMfaEnabled(this.selectedAccount.id).subscribe((isMfaEnabled) => {
      if (isMfaEnabled) {
        this.fetchNewTransactionsWithMfa();
      } else {
        this.syncTransactions();
      }
    });
  }

  syncTransactions(): void {
    this.personalCardsService.syncTransactions(this.selectedAccount.id).subscribe(() => {
      this.acc = [];
      this.isfetching = false;
      const params = this.loadData$.getValue();
      params.pageNumber = 1;
      this.loadData$.next(params);
      this.trackingService.transactionsFetchedOnPersonalCards();
    });
  }

  hideSelectedTransactions(): void {
    this.isHiding = true;
    this.personalCardsService
      .hideTransactions(this.selectedElements)
      .pipe(
        tap((txnsHiddenCount: number) => {
          const message =
            txnsHiddenCount === 1
              ? '1 Transaction successfully hidden!'
              : `${txnsHiddenCount} Transactions successfully hidden!`;
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
    if (this.selectedTransactionType === 'INITIALIZED') {
      this.selectionMode = !this.selectionMode;
      this.selectedElements = [];
      if (txnId) {
        this.toggleExpense(txnId);
      }
    }
  }

  toggleExpense(txnId: string): void {
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
      this.selectedElements = this.acc.map((txn) => txn.id);
    }
  }

  async openFilters(activeFilterInitialName?: string): Promise<void> {
    const filterPopover = await this.modalController.create({
      component: FyFiltersComponent,
      componentProps: {
        filterOptions: [
          {
            name: 'Created date',
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
            name: 'Updated date',
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

  addNewFiltersToParams(): Partial<PlatformPersonalCardFilterParams> {
    const currentParams = this.loadData$.getValue();

    currentParams.pageNumber = 1;
    const newQueryParams: Partial<PlatformPersonalCardQueryParams> = {
      or: [],
    };
    newQueryParams.state = `in.(${this.selectedTransactionType})`;
    newQueryParams.personal_card_id = `eq.${this.selectedAccount.id}`;
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
    if (filterLabel === 'Created date') {
      delete this.filters.createdOn;
    }

    if (filterLabel === 'Updated date') {
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
    this.filters = {} as PersonalCardFilter;
    this.currentPageNumber = 1;
    const params = this.addNewFiltersToParams();
    this.loadData$.next(params);
    this.filterPills = this.personalCardsService.generateFilterPills(this.filters);
  }

  createExpense(txnDetails: PlatformPersonalCardTxn): void {
    if (this.selectionMode || this.loadingMatchedExpenseCount) {
      return;
    }
    if (txnDetails.state === PlatformPersonalCardTxnState.MATCHED) {
      this.openExpensePreview(txnDetails);
      return;
    }

    const txnDate = dayjs(txnDetails.spent_at).format('YYYY-MM-DD');

    this.loadingMatchedExpenseCount = true;
    this.loadingTxnId = txnDetails.id;
    this.personalCardsService
      .getMatchedExpensesSuggestions(txnDetails.amount, txnDate)
      .subscribe((expenseSuggestions) => {
        this.loadingMatchedExpenseCount = false;
        this.loadingTxnId = null;
        if (expenseSuggestions.length === 0) {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_expense',
            { personalCardTxn: JSON.stringify(txnDetails), navigate_back: true },
          ]);
        } else {
          this.router.navigate(['/', 'enterprise', 'personal_cards_matched_expenses'], {
            state: {
              personalCard: this.selectedAccount,
              txnDetails,
              expenseSuggestions,
            },
          });
        }
      });
  }

  async openExpensePreview(txnDetails: PlatformPersonalCardTxn): Promise<void> {
    const txn_details = txnDetails.matched_expenses;
    const expenseDetailsModal = await this.modalController.create({
      component: ExpensePreviewComponent,
      componentProps: {
        expenseId: txn_details[0].id,
        card: this.selectedAccount.card_number,
        cardTxnId: txnDetails.id,
        type: 'edit',
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

  doRefresh(event: InfiniteScrollCustomEvent): void {
    const currentParams = this.loadData$.getValue();
    this.currentPageNumber = 1;
    currentParams.pageNumber = this.currentPageNumber;
    this.loadData$.next(currentParams);
    if (event) {
      event.target?.complete();
    }
  }
}
