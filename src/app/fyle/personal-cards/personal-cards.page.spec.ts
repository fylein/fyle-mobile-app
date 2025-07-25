import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SpinnerDialog } from '@awesome-cordova-plugins/spinner-dialog/ngx';
import { InfiniteScrollCustomEvent, IonicModule, ModalController, Platform, SegmentCustomEvent } from '@ionic/angular';
import { IonInfiniteScrollCustomEvent } from '@ionic/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { getElementRef } from 'src/app/core/dom-helpers';
import { apiExpenseRes, expenseList2 } from 'src/app/core/mock-data/expense.data';
import { allFilterPills, creditTxnFilterPill } from 'src/app/core/mock-data/filter-pills.data';
import {
  personalCardQueryParamFiltersData,
  tasksQueryParamsWithFiltersData,
  tasksQueryParamsWithFiltersData3,
} from 'src/app/core/mock-data/get-tasks-query-params-with-filters.data';
import { properties } from 'src/app/core/mock-data/modal-properties.data';
import { platformPersonalCardTxns } from 'src/app/core/mock-data/personal-card-txns.data';
import { linkedAccounts } from 'src/app/core/mock-data/personal-cards.data';
import { selectedFilters1, selectedFilters2 } from 'src/app/core/mock-data/selected-filters.data';
import { snackbarPropertiesRes6, snackbarPropertiesRes7 } from 'src/app/core/mock-data/snackbar-properties.data';
import { apiToken } from 'src/app/core/mock-data/yoodle-token.data';
import { ExtendQueryParamsService } from 'src/app/core/services/extend-query-params.service';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { HeaderState } from 'src/app/shared/components/fy-header/header-state.enum';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from '../../core/services/snackbar-properties.service';
import { ExpensePreviewComponent } from '../personal-cards-matched-expenses/expense-preview/expense-preview.component';
import { DateRangeModalComponent } from './date-range-modal/date-range-modal.component';
import { PersonalCardsPage } from './personal-cards.page';
import { PersonalCardFilter } from 'src/app/core/models/personal-card-filters.model';
import { platformPersonalCardTxnExpenseSuggestionsRes } from 'src/app/core/mock-data/personal-card-txn-expense-suggestions.data';
import { PlatformPersonalCardTxnState } from 'src/app/core/models/platform/platform-personal-card-txn-state.enum';

describe('PersonalCardsPage', () => {
  let component: PersonalCardsPage;
  let fixture: ComponentFixture<PersonalCardsPage>;
  let personalCardsService: jasmine.SpyObj<PersonalCardsService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let inAppBrowserService: jasmine.SpyObj<InAppBrowserService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let extendQueryParamsService: jasmine.SpyObj<ExtendQueryParamsService>;
  let platform: jasmine.SpyObj<Platform>;
  let spinnerDialog: jasmine.SpyObj<SpinnerDialog>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const personalCardsServiceSpy = jasmine.createSpyObj('PersonalCardsService', [
      'getPersonalCardsCount',
      'getPersonalCards',
      'getBankTransactionsCount',
      'getBankTransactions',
      'generateFilterPills',
      'getToken',
      'htmlFormUrl',
      'postBankAccounts',
      'syncTransactions',
      'hideTransactions',
      'generateSelectedFilters',
      'convertFilters',
      'generateTxnDateParams',
      'generateCreditParams',
      'generateDateParams',
      'getMatchedExpensesSuggestions',
      'isMfaEnabled',
    ]);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const inAppBrowserServiceSpy = jasmine.createSpyObj('InAppBrowserService', ['create']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const extendQueryParamsServiceSpy = jasmine.createSpyObj('ExtendQueryParamsService', [
      'extendQueryParamsForTextSearch',
    ]);
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);
    const spinnerDialogSpy = jasmine.createSpyObj('SpinnerDialog', ['show', 'hide']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'personalCardsViewed',
      'newCardLinkedOnPersonalCards',
      'cardDeletedOnPersonalCards',
      'footerHomeTabClicked',
      'transactionsFetchedOnPersonalCards',
      'transactionsHiddenOnPersonalCards',
    ]);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);

    TestBed.configureTestingModule({
      declarations: [PersonalCardsPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
      ],
      providers: [
        ChangeDetectorRef,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                navigateBack: true,
              },
              queryParams: {
                filters: {
                  amount: 10,
                },
              },
            },
          },
        },
        {
          provide: PersonalCardsService,
          useValue: personalCardsServiceSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: InAppBrowserService,
          useValue: inAppBrowserServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ExtendQueryParamsService,
          useValue: extendQueryParamsServiceSpy,
        },
        {
          provide: Platform,
          useValue: platformSpy,
        },
        {
          provide: SpinnerDialog,
          useValue: spinnerDialogSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(PersonalCardsPage);
    component = fixture.componentInstance;

    personalCardsService = TestBed.inject(PersonalCardsService) as jasmine.SpyObj<PersonalCardsService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    inAppBrowserService = TestBed.inject(InAppBrowserService) as jasmine.SpyObj<InAppBrowserService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    extendQueryParamsService = TestBed.inject(ExtendQueryParamsService) as jasmine.SpyObj<ExtendQueryParamsService>;
    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    spinnerDialog = TestBed.inject(SpinnerDialog) as jasmine.SpyObj<SpinnerDialog>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;

    personalCardsService.getPersonalCardsCount.and.returnValue(of(2));
    personalCardsService.getPersonalCards.and.returnValue(of(linkedAccounts));
    personalCardsService.isMfaEnabled.and.returnValue(of(false));
    component.loadData$ = new BehaviorSubject({
      pageNumber: 1,
    });
    component.loadCardData$ = new BehaviorSubject({});
    component.linkedAccountsCount$ = of(1);
    component.isConnected$ = of(true);
    component.linkedAccounts$ = of(linkedAccounts);
    component.transactionsCount$ = of(2);
    component.transactions$ = of([platformPersonalCardTxns.data[0]]);
    component.isInfiniteScrollRequired$ = of(true);
    component.simpleSearchInput = getElementRef(fixture, '.personal-cards--simple-search-input');
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * NOTE: Due to how the component is written, the lifecycle methods are throwing random observable
   * errors while trying to run the test. It usually shows an undefined error while initializing the fixture.
   * Disabling the lifecycle methods and then testing the rest, seems to work hence keeping it that way.
   */

  describe('mocked lifecycle', () => {
    beforeEach(() => {
      spyOn(component, 'ngOnInit');
      spyOn(component, 'ngAfterViewInit');
    });

    it('setupNetworkWatcher(): should setup network watcher', () => {
      networkService.isOnline.and.returnValue(of(false));

      component.setupNetworkWatcher();

      expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
      expect(networkService.isOnline).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
    });

    it('linkAccount(): should link account', fakeAsync(() => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      personalCardsService.getToken.and.returnValue(of(apiToken));
      spyOn(component, 'openYoodle');

      component.linkAccount();
      tick(500);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(personalCardsService.getToken).toHaveBeenCalledTimes(1);
      expect(component.openYoodle).toHaveBeenCalledOnceWith(apiToken.fast_link_url, apiToken.access_token, false);
    }));

    describe('postAccounts():', () => {
      it('should post account data with 1 card', fakeAsync(() => {
        const message = '1 card successfully added to Fyle!';
        const props = {
          data: {
            icon: 'check-square-fill',
            showCloseButton: false,
            message,
          },
          duration: 3000,
        };
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        personalCardsService.postBankAccounts.and.returnValue(of(linkedAccounts));
        spyOn(component.loadCardData$, 'next');
        snackbarProperties.setSnackbarProperties.and.returnValue(props);

        component.postAccounts();
        tick(500);

        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(personalCardsService.postBankAccounts).toHaveBeenCalledTimes(1);
        expect(component.loadCardData$.next).toHaveBeenCalledOnceWith({});
        expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
          ...props,
          panelClass: ['msb-success'],
        });
        expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledTimes(1);
        expect(trackingService.newCardLinkedOnPersonalCards).toHaveBeenCalledTimes(1);
      }));

      it('should post account data for multiple cards', fakeAsync(() => {
        const message = '2 cards successfully added to Fyle!';
        const props = {
          data: {
            icon: 'check-square-fill',
            showCloseButton: false,
            message,
          },
          duration: 3000,
        };
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        personalCardsService.postBankAccounts.and.returnValue(of(linkedAccounts));
        spyOn(component.loadCardData$, 'next');
        snackbarProperties.setSnackbarProperties.and.returnValue(props);

        component.postAccounts();
        tick(500);

        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(personalCardsService.postBankAccounts).toHaveBeenCalledTimes(1);
        expect(component.loadCardData$.next).toHaveBeenCalledOnceWith({});
        expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
          ...props,
          panelClass: ['msb-success'],
        });
        expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledTimes(1);
        expect(trackingService.newCardLinkedOnPersonalCards).toHaveBeenCalledTimes(1);
      }));
    });

    it('onDeleted(): should track delete card event', () => {
      spyOn(component.loadCardData$, 'next');

      component.onDeleted();
      expect(component.loadCardData$.next).toHaveBeenCalledOnceWith({});
      expect(trackingService.cardDeletedOnPersonalCards).toHaveBeenCalledTimes(1);
    });

    describe('onCardChanged(): ', () => {
      it('should fetch new txns when card changes', () => {
        spyOn(component.loadData$, 'getValue').and.returnValue({
          queryParams: {},
        });
        spyOn(component.loadData$, 'next');

        component.onCardChanged(linkedAccounts[0]);

        expect(component.loadData$.next).toHaveBeenCalledOnceWith({
          queryParams: { state: 'in.(INITIALIZED)', personal_card_id: 'eq.baccY70V3Mz048' },
          pageNumber: 1,
        });
        expect(component.loadData$.getValue).toHaveBeenCalledTimes(1);
      });

      it('should fetch new txns without params', () => {
        spyOn(component.loadData$, 'getValue').and.returnValue({
          queryParams: null,
        });
        spyOn(component.loadData$, 'next');

        component.onCardChanged(linkedAccounts[0]);

        expect(component.loadData$.next).toHaveBeenCalledOnceWith({
          queryParams: { state: 'in.(INITIALIZED)', personal_card_id: 'eq.baccY70V3Mz048' },
          pageNumber: 1,
        });
        expect(component.loadData$.getValue).toHaveBeenCalledTimes(1);
      });
    });

    describe('loadData()', () => {
      let mockEvent: InfiniteScrollCustomEvent;

      beforeEach(() => {
        mockEvent = {
          target: {
            complete: jasmine.createSpy('complete'),
          },
        } as unknown as InfiniteScrollCustomEvent;

        spyOn(component.loadData$, 'getValue').and.returnValue({ pageNumber: 1 });
        spyOn(component.loadData$, 'next');
      });

      it('should increment currentPageNumber, update loadData$, and call complete when event.target exists', fakeAsync(() => {
        component.loadData(mockEvent);

        expect(component.currentPageNumber).toBe(2);
        expect(component.isLoadingDataInfiniteScroll).toBeTrue();
        expect(component.loadData$.next).toHaveBeenCalledWith({
          pageNumber: 2,
        });

        tick(1000);
        expect(mockEvent.target.complete).toHaveBeenCalledTimes(1);
      }));

      it('should increment currentPageNumber and update loadData$ without errors when event.target is undefined', fakeAsync(() => {
        mockEvent = {
          target: undefined,
        } as unknown as InfiniteScrollCustomEvent;

        component.loadData(mockEvent);

        expect(component.currentPageNumber).toBe(2);
        expect(component.isLoadingDataInfiniteScroll).toBeTrue();
        expect(component.loadData$.next).toHaveBeenCalledWith({
          pageNumber: 2,
        });

        tick(1000);
        expect(mockEvent.target?.complete).toBeUndefined();
      }));
    });

    it('segmentChanged(): should change segment', () => {
      component.selectedTransactionType = PlatformPersonalCardTxnState.INITIALIZED;
      component.selectionMode = true;
      spyOn(component.loadData$, 'getValue').and.returnValue({});
      spyOn(component.loadData$, 'next');
      spyOn(component, 'switchSelectionMode');

      const event = new CustomEvent('click', {
        detail: {
          value: 'INITIALIZED',
        },
      }) as SegmentCustomEvent;

      component.segmentChanged(event);

      expect(component.loadData$.getValue).toHaveBeenCalledTimes(1);
      expect(component.switchSelectionMode).toHaveBeenCalledTimes(1);
      expect(component.loadData$.next).toHaveBeenCalledOnceWith({
        queryParams: {
          state: 'in.(INITIALIZED)',
        },
        pageNumber: 1,
      });
      expect(component.acc).toEqual([]);
    });

    it('onHomeClicked(): should go to dashboard page', () => {
      component.onHomeClicked();

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
        queryParams: { state: 'home' },
      });
      expect(trackingService.footerHomeTabClicked).toHaveBeenCalledOnceWith({
        page: 'Personal Cards',
      });
    });

    it('onTaskClicked(): should go to dashboard page and apply task filter', () => {
      component.onTaskClicked();

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
        queryParams: { state: 'tasks', tasksFilters: 'none' },
      });
    });

    it('onCameraClicked(): should open camera', () => {
      component.onCameraClicked();

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'camera_overlay',
        {
          navigate_back: true,
        },
      ]);
    });

    it('fetchNewTransactions(): should fetch new transactions', () => {
      component.selectionMode = true;
      component.selectedAccount = linkedAccounts[0];
      spyOn(component, 'switchSelectionMode');
      personalCardsService.syncTransactions.and.returnValue(of({ data: {} }));

      component.fetchNewTransactions();

      expect(component.switchSelectionMode).toHaveBeenCalledTimes(1);
      expect(personalCardsService.syncTransactions).toHaveBeenCalledTimes(1);
      expect(trackingService.transactionsFetchedOnPersonalCards).toHaveBeenCalledTimes(1);
    });

    describe('hideSelectedTransactions():', () => {
      it('should hide selected transactions in selection mode for multiple expenses', () => {
        component.selectionMode = true;
        personalCardsService.hideTransactions.and.returnValue(of(apiExpenseRes.length));
        spyOn(component, 'switchSelectionMode');
        snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes6);

        component.hideSelectedTransactions();

        expect(component.switchSelectionMode).toHaveBeenCalledTimes(1);
        expect(personalCardsService.hideTransactions).toHaveBeenCalledTimes(1);
        expect(trackingService.transactionsHiddenOnPersonalCards).toHaveBeenCalledTimes(1);
        expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
          ...snackbarPropertiesRes6,
          panelClass: ['msb-success'],
        });
        expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
          message: '1 Transaction successfully hidden!',
        });
      });

      it('should hide selected transactions for multiple expenses', () => {
        component.selectionMode = false;
        personalCardsService.hideTransactions.and.returnValue(of(expenseList2.length));
        spyOn(component, 'switchSelectionMode');
        snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes7);

        component.hideSelectedTransactions();

        expect(component.switchSelectionMode).not.toHaveBeenCalled();
        expect(personalCardsService.hideTransactions).toHaveBeenCalledTimes(1);
        expect(trackingService.transactionsHiddenOnPersonalCards).toHaveBeenCalledTimes(1);
        expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
          ...snackbarPropertiesRes7,
          panelClass: ['msb-success'],
        });
        expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
          message: '2 Transactions successfully hidden!',
        });
      });
    });

    describe('switchSelectionMode():', () => {
      it('should switch mode if expense is of type INITIALIZED', () => {
        component.selectedTransactionType = PlatformPersonalCardTxnState.INITIALIZED;
        component.selectionMode = true;
        spyOn(component, 'toggleExpense');

        component.switchSelectionMode();

        expect(component.selectionMode).toBeFalse();
        expect(component.selectedElements).toEqual([]);
        expect(component.toggleExpense).not.toHaveBeenCalled();
      });

      it('should switch mode and select an expense if provided', () => {
        component.selectedTransactionType = PlatformPersonalCardTxnState.INITIALIZED;
        component.selectionMode = false;
        spyOn(component, 'toggleExpense');

        component.switchSelectionMode('btxnMy43OZokde');

        expect(component.selectionMode).toBeTrue();
        expect(component.selectedElements).toEqual([]);
        expect(component.toggleExpense).toHaveBeenCalledOnceWith('btxnMy43OZokde');
      });
    });

    describe('toggleExpense():', () => {
      it('should add an expense to list', () => {
        component.selectedElements = [];

        component.toggleExpense('btxnMy43OZokde');
        expect(component.selectedElements).toEqual(['btxnMy43OZokde']);
      });

      it('should remove an expense from the list list', () => {
        component.selectedElements = ['btxnMy43OZokde'];

        component.toggleExpense('btxnMy43OZokde');
        expect(component.selectedElements).toEqual([]);
      });
    });

    it('onSelectAll(): should select all expenses', () => {
      component.acc = [platformPersonalCardTxns.data[0]];
      const event = new MatCheckboxChange();

      component.onSelectAll(event);

      expect(component.selectedElements).toEqual([platformPersonalCardTxns.data[0].id]);
    });

    it('onSearchBarFocus(): should set focus on bar', () => {
      component.onSearchBarFocus();

      expect(component.isSearchBarFocused).toBeTrue();
    });

    it('onSimpleSearchCancel(): should cancel search', () => {
      spyOn(component, 'clearText');
      component.onSimpleSearchCancel();

      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.clearText).toHaveBeenCalledOnceWith('onSimpleSearchCancel');
    });

    it('onFilterPillsClearAll(): should clear all filter pills', () => {
      spyOn(component, 'clearFilters');

      component.onFilterPillsClearAll();

      expect(component.clearFilters).toHaveBeenCalledTimes(1);
    });

    it('onFilterClick(): should open filter', fakeAsync(() => {
      spyOn(component, 'openFilters');

      component.onFilterClick('filters');
      tick(500);

      expect(component.openFilters).toHaveBeenCalledOnceWith('filters');
    }));

    it('clearFilters(): should clear filters', () => {
      personalCardsService.generateFilterPills.and.returnValue(creditTxnFilterPill);
      spyOn(component, 'addNewFiltersToParams').and.returnValue({});
      spyOn(component.loadData$, 'next');

      component.clearFilters();

      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      expect(personalCardsService.generateFilterPills).toHaveBeenCalledOnceWith({});
      expect(component.loadData$.next).toHaveBeenCalledOnceWith({});
    });

    it('searchClick(): should open search', fakeAsync(() => {
      spyOn(component.simpleSearchInput.nativeElement, 'focus');

      component.searchClick();
      tick(500);

      expect(component.headerState).toEqual(HeaderState.simpleSearch);
      expect(component.simpleSearchInput.nativeElement.focus).toHaveBeenCalledTimes(1);
    }));

    describe('onFilterClose():', () => {
      it('should delete created on filter', () => {
        personalCardsService.generateFilterPills.and.returnValue([]);
        spyOn(component, 'addNewFiltersToParams').and.returnValue({});
        component.filters = {
          createdOn: {},
        };

        component.onFilterClose('Created date');
        expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
        expect(personalCardsService.generateFilterPills).toHaveBeenCalledTimes(1);
      });

      it('should delete updated on filter', () => {
        personalCardsService.generateFilterPills.and.returnValue([]);
        spyOn(component, 'addNewFiltersToParams').and.returnValue({});
        component.filters = {
          updatedOn: {},
        };

        component.onFilterClose('Updated date');
        expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
        expect(personalCardsService.generateFilterPills).toHaveBeenCalledTimes(1);
      });

      it('should delete transaction type filter', () => {
        personalCardsService.generateFilterPills.and.returnValue([]);
        spyOn(component, 'addNewFiltersToParams').and.returnValue({});
        component.filters = {
          transactionType: 'DEBIT',
        };

        component.onFilterClose('Transactions Type');
        expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
        expect(personalCardsService.generateFilterPills).toHaveBeenCalledTimes(1);
      });
    });

    describe('clearText():', () => {
      it('should set search bar if not redirected from cancel', () => {
        component.clearText('onSimpleSearchCancel');

        expect(component.simpleSearchText).toEqual('');
        expect(component.isSearchBarFocused).toBeTrue();
      });

      it('should clear text and remove focus from search bar', () => {
        component.clearText('notFromCancel');

        expect(component.simpleSearchText).toEqual('');
        expect(component.isSearchBarFocused).toBeFalse();
      });
    });

    describe('createExpense():', () => {
      it('should create an expense and navigate to add edit expense if count is 0', () => {
        component.selectionMode = false;
        component.loadingMatchedExpenseCount = false;
        const usePlatformApi = false;
        personalCardsService.getMatchedExpensesSuggestions.and.returnValue(of([]));

        component.createExpense(platformPersonalCardTxns.data[0]);

        expect(personalCardsService.getMatchedExpensesSuggestions).toHaveBeenCalledOnceWith(
          platformPersonalCardTxns.data[0].amount,
          '2024-09-22'
        );
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_expense',
          { personalCardTxn: JSON.stringify(platformPersonalCardTxns.data[0]), navigate_back: true },
        ]);
      });

      it('should create an expense and navigate to personal cards page if count is more than 0', () => {
        component.selectedAccount = linkedAccounts[0];
        component.selectionMode = false;
        component.loadingMatchedExpenseCount = false;
        personalCardsService.getMatchedExpensesSuggestions.and.returnValue(
          of(platformPersonalCardTxnExpenseSuggestionsRes.data)
        );

        component.createExpense(platformPersonalCardTxns.data[0]);

        expect(personalCardsService.getMatchedExpensesSuggestions).toHaveBeenCalledOnceWith(
          platformPersonalCardTxns.data[0].amount,
          '2024-09-22'
        );
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'personal_cards_matched_expenses'], {
          state: {
            personalCard: linkedAccounts[0],
            txnDetails: platformPersonalCardTxns.data[0],
            expenseSuggestions: platformPersonalCardTxnExpenseSuggestionsRes.data,
          },
        });
      });

      it('should exit and not create an expense if the page is in loading state', () => {
        component.selectionMode = true;
        component.loadingMatchedExpenseCount = true;

        component.createExpense(platformPersonalCardTxns.data[0]);

        expect(personalCardsService.getMatchedExpensesSuggestions).not.toHaveBeenCalled();
      });

      it('should open expense if the expense has been matched', () => {
        component.selectionMode = false;
        component.loadingMatchedExpenseCount = false;
        spyOn(component, 'openExpensePreview');

        component.createExpense(platformPersonalCardTxns.data[1]);

        expect(component.openExpensePreview).toHaveBeenCalledOnceWith(platformPersonalCardTxns.data[1]);
      });
    });

    it('openExpensePreview(): should open expense preview', fakeAsync(() => {
      component.selectedAccount = linkedAccounts[0];
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
      spyOn(component.loadData$, 'getValue').and.returnValue({});
      spyOn(component.loadData$, 'next');

      const modalSpy = jasmine.createSpyObj('expenseDetailsModal', ['present']);

      modalController.create.and.resolveTo(modalSpy);

      component.openExpensePreview(platformPersonalCardTxns.data[0]);
      tick(500);

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: ExpensePreviewComponent,
        componentProps: {
          expenseId: platformPersonalCardTxns.data[0].matched_expenses[0]?.id,
          card: component.selectedAccount.card_number,
          cardTxnId: platformPersonalCardTxns.data[0].id,
          type: 'edit',
        },
        ...properties,
      });
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledOnceWith('expense-preview-modal');
      expect(component.loadData$.getValue).toHaveBeenCalledTimes(1);
      expect(component.loadData$.next).toHaveBeenCalledTimes(1);
    }));

    it('openDateRangeModal(): should open date range modal', fakeAsync(() => {
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
      spyOn(component.loadData$, 'getValue').and.returnValue({});
      spyOn(component.loadData$, 'next');

      const modalSpy = jasmine.createSpyObj('expenseDetailsModal', ['present', 'onWillDismiss']);
      modalSpy.onWillDismiss.and.resolveTo({
        data: {
          range: 'Custom Range',
          startDate: '2023-02-20T00:00:00.000Z',
          endDate: '2023-02-24T00:00:00.000Z',
        },
      });

      modalController.create.and.resolveTo(modalSpy);
      personalCardsService.generateDateParams.and.returnValue({
        queryParams: {
          or: ['(and(spent_at.gte.2023-02-28T18:30:00.000Z,spent_at.lt.2023-03-31T18:29:00.000Z))'],
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });

      component.openDateRangeModal();
      tick(500);

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: DateRangeModalComponent,
        mode: 'ios',
        ...properties,
      });
      expect(component.loadData$.getValue).toHaveBeenCalledTimes(1);
      expect(component.loadData$.next).toHaveBeenCalledTimes(1);
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledOnceWith('personal-cards-range-modal');
      expect(personalCardsService.generateDateParams).toHaveBeenCalledOnceWith(
        {
          range: 'Custom Range',
          startDate: '2023-02-20T00:00:00.000Z',
          endDate: '2023-02-24T00:00:00.000Z',
        },
        {}
      );
    }));

    it('doRefresh(): refresh page content', () => {
      spyOn(component.loadData$, 'getValue').and.returnValue({});
      spyOn(component.loadData$, 'next');

      const event = new CustomEvent('click') as IonInfiniteScrollCustomEvent<any>;

      component.doRefresh(event);

      expect(component.loadData$.getValue).toHaveBeenCalledTimes(1);
      expect(component.loadData$.next).toHaveBeenCalledTimes(1);
      expect(component.currentPageNumber).toEqual(1);
    });

    it('addNewFiltersToParams(): should new filters to params', () => {
      spyOn(component.loadData$, 'getValue').and.returnValue({});
      component.selectedTransactionType = PlatformPersonalCardTxnState.INITIALIZED;
      component.selectedAccount = linkedAccounts[0];

      const result = component.addNewFiltersToParams();
      expect(result).toEqual(personalCardQueryParamFiltersData);
      expect(personalCardsService.generateTxnDateParams).toHaveBeenCalledTimes(2);
      expect(personalCardsService.generateCreditParams).toHaveBeenCalledTimes(1);
      expect(component.loadData$.getValue).toHaveBeenCalledTimes(1);
    });

    it('openFilters(): should open filters', fakeAsync(() => {
      const modalSpy = jasmine.createSpyObj('filterPopover', ['present', 'onWillDismiss']);
      modalSpy.onWillDismiss.and.resolveTo({
        data: selectedFilters2,
      });
      modalController.create.and.resolveTo(modalSpy);
      personalCardsService.generateSelectedFilters.and.returnValue(selectedFilters1);
      personalCardsService.convertFilters.and.returnValue({} as PersonalCardFilter);
      spyOn(component, 'addNewFiltersToParams').and.returnValue(tasksQueryParamsWithFiltersData3);
      personalCardsService.generateFilterPills.and.returnValue(creditTxnFilterPill);
      spyOn(component.loadData$, 'next');

      component.openFilters();
      tick(1000);

      expect(modalController.create).toHaveBeenCalledTimes(1);
      expect(personalCardsService.generateSelectedFilters).toHaveBeenCalledTimes(1);
      expect(personalCardsService.convertFilters).toHaveBeenCalledOnceWith(selectedFilters2);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      expect(component.loadData$.next).toHaveBeenCalledOnceWith(tasksQueryParamsWithFiltersData3);
      expect(personalCardsService.generateFilterPills).toHaveBeenCalledOnceWith({});
    }));

    describe('openYoodle()', () => {
      let inappbrowserSpy: any;

      beforeEach(() => {
        component.selectedAccount = linkedAccounts[0];
        inappbrowserSpy = jasmine.createSpyObj('InAppBrowserObject', ['on', 'close']);
      });

      it('should open Yoodle with normal flow and handle success callback', fakeAsync(() => {
        const mockUrl = 'https://mock-url.com';
        const mockAccessToken = 'mock_access_token';
        const mockHtmlContent = '<h1></h1>';
        const mockDecodedData = JSON.stringify([{ requestId: 'tx3qHxFNgRcZ' }]);

        personalCardsService.htmlFormUrl.and.returnValue(mockHtmlContent);
        spyOn(window, 'decodeURIComponent').and.returnValue(mockDecodedData);
        inappbrowserSpy.on.withArgs('loadstop').and.returnValue(of(null));
        inappbrowserSpy.on.withArgs('loadstart').and.returnValue(
          of({
            url: 'https://www.fylehq.com',
          })
        );
        inAppBrowserService.create.and.returnValue(inappbrowserSpy);
        spyOn(component, 'postAccounts');

        component.openYoodle(mockUrl, mockAccessToken, false);
        tick(20000);

        expect(personalCardsService.htmlFormUrl).toHaveBeenCalledOnceWith(mockUrl, mockAccessToken, false, '10287109');
        expect(inAppBrowserService.create).toHaveBeenCalledOnceWith(mockHtmlContent, '_blank', 'location=no');
        expect(inappbrowserSpy.on).toHaveBeenCalledTimes(2);
        expect(window.decodeURIComponent).toHaveBeenCalledTimes(1);
        expect(component.postAccounts).toHaveBeenCalledOnceWith();
        expect(inappbrowserSpy.close).toHaveBeenCalled();
      }));

      it('should handle MFA flow and sync transactions on success', fakeAsync(() => {
        const mockUrl = 'https://mock-url.com';
        const mockAccessToken = 'mock_access_token';
        const mockHtmlContent = '<h1></h1>';
        const mockDecodedData = JSON.stringify([{ requestId: 'tx3qHxFNgRcZ' }]);

        personalCardsService.htmlFormUrl.and.returnValue(mockHtmlContent);
        spyOn(window, 'decodeURIComponent').and.returnValue(mockDecodedData);
        inappbrowserSpy.on.withArgs('loadstop').and.returnValue(of(null));
        inappbrowserSpy.on.withArgs('loadstart').and.returnValue(
          of({
            url: 'https://www.fylehq.com',
          })
        );
        inAppBrowserService.create.and.returnValue(inappbrowserSpy);
        spyOn(component, 'syncTransactions');

        component.openYoodle(mockUrl, mockAccessToken, true);
        tick(20000);

        expect(personalCardsService.htmlFormUrl).toHaveBeenCalledOnceWith(mockUrl, mockAccessToken, true, '10287109');
        expect(inAppBrowserService.create).toHaveBeenCalledOnceWith(mockHtmlContent, '_blank', 'location=no');
        expect(inappbrowserSpy.on).toHaveBeenCalledTimes(2);
        expect(window.decodeURIComponent).toHaveBeenCalledTimes(1);
        expect(component.syncTransactions).toHaveBeenCalledTimes(1);
        expect(inappbrowserSpy.close).toHaveBeenCalled();
      }));
    });
  });

  describe('ngOnInit():', () => {
    it('should set mode to iOS and network watcher', () => {
      spyOn(component, 'setupNetworkWatcher');
      platform.is.and.returnValue(true);

      component.ngOnInit();

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(component.mode).toEqual('ios');
      expect(trackingService.personalCardsViewed).toHaveBeenCalledTimes(1);
    });

    it('should set mode to material design and network watcher', () => {
      spyOn(component, 'setupNetworkWatcher');
      platform.is.and.returnValue(false);

      component.ngOnInit();

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(component.mode).toEqual('md');
    });
  });

  it('ngOnDestroy(): should set onComponentDestroy$ to null', () => {
    spyOn(component.onComponentDestroy$, 'next');
    spyOn(component.onComponentDestroy$, 'complete');
    component.ngOnDestroy();
    expect(component.onComponentDestroy$.next).toHaveBeenCalledOnceWith(null);
    expect(component.onComponentDestroy$.complete).toHaveBeenCalledTimes(1);
  });

  it('loadLinkedAccounts(): should load linked accounts', (done) => {
    personalCardsService.getPersonalCards.and.returnValue(of(linkedAccounts));

    component.loadLinkedAccounts();

    component.linkedAccounts$.subscribe((res) => {
      expect(res).toEqual(linkedAccounts);
      expect(personalCardsService.getPersonalCards).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('loadTransactionCount(): should load transaction count', (done) => {
    extendQueryParamsService.extendQueryParamsForTextSearch.and.returnValue({});
    personalCardsService.getBankTransactionsCount.and.returnValue(of(1));

    component.loadTransactionCount();

    component.transactionsCount$.subscribe((res) => {
      expect(res).toEqual(1);
      expect(extendQueryParamsService.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(1);
      expect(personalCardsService.getBankTransactionsCount).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('loadInfiniteScroll(): should load infinite scroll', (done) => {
    component.transactions$ = of(platformPersonalCardTxns.data);
    component.transactionsCount$ = of(1);

    component.loadInfiniteScroll();

    component.isInfiniteScrollRequired$.subscribe((res) => {
      expect(res).toBeFalse();
      done();
    });
  });

  it('loadAccountCount(): should load accounts count and clear filters', (done) => {
    personalCardsService.getPersonalCardsCount.and.returnValue(of(1));
    spyOn(component, 'clearFilters');

    component.loadAccountCount();

    component.linkedAccountsCount$.subscribe((res) => {
      expect(res).toEqual(1);
      expect(personalCardsService.getPersonalCardsCount).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('loadPersonalTxns():', () => {
    it('should load personal cards txns with params', (done) => {
      activatedRoute.snapshot.queryParams.filters = JSON.stringify({});
      spyOn(component, 'addNewFiltersToParams').and.returnValue({});
      extendQueryParamsService.extendQueryParamsForTextSearch.and.returnValue({});
      personalCardsService.getBankTransactionsCount.and.returnValue(of(1));
      personalCardsService.getBankTransactions.and.returnValue(of(platformPersonalCardTxns));

      component.loadPersonalTxns().subscribe((res) => {
        expect(res).toEqual(platformPersonalCardTxns.data);
        expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
        expect(extendQueryParamsService.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(1);
        expect(personalCardsService.getBankTransactionsCount).toHaveBeenCalledTimes(1);
        expect(personalCardsService.getBankTransactions).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should load personal cards without params', (done) => {
      activatedRoute.snapshot.queryParams.filters = null;
      personalCardsService.getBankTransactionsCount.and.returnValue(of(0));
      personalCardsService.getBankTransactions.and.returnValue(of({ ...platformPersonalCardTxns, data: [] }));

      component.loadPersonalTxns().subscribe((res) => {
        expect(res).toEqual([]);
        expect(extendQueryParamsService.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(1);
        expect(personalCardsService.getBankTransactionsCount).toHaveBeenCalledTimes(1);
        expect(personalCardsService.getBankTransactions).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('ngAfterViewInit()', () => {
    beforeEach(() => {
      spyOn(component, 'loadAccountCount');
      spyOn(component, 'loadLinkedAccounts');
      spyOn(component, 'onCardChanged');
      spyOn(component, 'loadPersonalTxns').and.returnValue(of(platformPersonalCardTxns.data));
      spyOn(component, 'loadTransactionCount');
      spyOn(component, 'loadInfiniteScroll');
      personalCardsService.generateFilterPills.and.returnValue(allFilterPills);

      component.simpleSearchInput = fixture.debugElement.query(By.css('.personal-cards--simple-search-input'));
    });

    it('should set navigateBack based on activatedRoute params', () => {
      // @ts-ignore
      component.activatedRoute.snapshot.params = { navigateBack: 'true' };
      component.ngAfterViewInit();
      expect(component.navigateBack).toBeTrue();
    });

    it('should initialize loadCardData$', () => {
      component.ngAfterViewInit();
      expect(component.loadCardData$).toBeDefined();
      expect(component.loadCardData$.getValue()).toEqual({});
    });

    it('should generate filter pills based on filters', () => {
      personalCardsService.generateFilterPills.and.returnValue(allFilterPills);
      component.ngAfterViewInit();
      expect(component.filterPills).toEqual(allFilterPills);
    });

    it('should call loadTransactionCount and loadInfiniteScroll', () => {
      component.ngAfterViewInit();
      expect(component.loadTransactionCount).toHaveBeenCalledTimes(1);
      expect(component.loadInfiniteScroll).toHaveBeenCalledTimes(1);
    });
  });
});
