import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SpinnerDialog } from '@awesome-cordova-plugins/spinner-dialog/ngx';
import { IonicModule, ModalController, Platform } from '@ionic/angular';
import { BehaviorSubject, of } from 'rxjs';
import { getElementRef } from 'src/app/core/dom-helpers';
import { apiPersonalCardTxnsRes } from 'src/app/core/mock-data/personal-card-txns.data';
import { linkedAccountsRes } from 'src/app/core/mock-data/personal-cards.data';
import { apiToken } from 'src/app/core/mock-data/yoodle-token.data';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from '../../core/services/snackbar-properties.service';
import { PersonalCardsPage } from './personal-cards.page';

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
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;
  let platform: jasmine.SpyObj<Platform>;
  let spinnerDialog: jasmine.SpyObj<SpinnerDialog>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const personalCardsServiceSpy = jasmine.createSpyObj('PersonalCardsService', [
      'getLinkedAccountsCount',
      'getLinkedAccounts',
      'getBankTransactionsCount',
      'getBankTransactions',
      'generateFilterPills',
      'getToken',
      'htmlFormUrl',
      'postBankAccounts',
      'fetchTransactions',
      'hideTransactions',
      'generateSelectedFilters',
      'convertFilters',
      'generateTxnDateParams',
      'generateCreditParams',
      'getMatchedExpensesCount',
      'generateDateParams',
    ]);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const inAppBrowserServiceSpy = jasmine.createSpyObj('InAppBrowserService', ['create']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['extendQueryParamsForTextSearch']);
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);
    const spinnerDialogSpy = jasmine.createSpyObj('SpinnerDialog', ['show']);
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
      imports: [IonicModule.forRoot(), RouterTestingModule, FormsModule, MatCheckboxModule],
      providers: [
        ChangeDetectorRef,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                navigateBack: true,
                queryParams: {
                  filters: {
                    amount: 10,
                  },
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
          provide: ApiV2Service,
          useValue: apiV2ServiceSpy,
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
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    spinnerDialog = TestBed.inject(SpinnerDialog) as jasmine.SpyObj<SpinnerDialog>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;

    personalCardsService.getLinkedAccountsCount.and.returnValue(of(2));
    personalCardsService.getLinkedAccounts.and.returnValue(of(linkedAccountsRes));
    component.loadData$ = new BehaviorSubject(null);
    component.loadCardData$ = new BehaviorSubject(null);
    component.linkedAccountsCount$ = of(1);
    component.isConnected$ = of(true);
    component.linkedAccounts$ = of(linkedAccountsRes);
    component.transactionsCount$ = of(2);
    component.transactions$ = of([apiPersonalCardTxnsRes.data[0]]);
    component.isInfiniteScrollRequired$ = of(true);
    component.simpleSearchInput = getElementRef(fixture, '.personal-cards--simple-search-input');
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('mocked lifecycle', () => {
    beforeEach(() => {
      spyOn(component, 'ngOnInit');
      spyOn(component, 'ionViewWillEnter');
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
      expect(component.openYoodle).toHaveBeenCalledOnceWith(apiToken.fast_link_url, apiToken.access_token);
    }));

    describe('postAccounts():', () => {
      it('should post account data with 1 card', fakeAsync(() => {
        const message = '1 card successfully added to Fyle!';
        const props = {
          data: {
            icon: 'tick-square-filled',
            showCloseButton: false,
            message: message,
          },
          duration: 3000,
        };
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        personalCardsService.postBankAccounts.and.returnValue(of(['card123']));
        spyOn(component.loadCardData$, 'next');
        snackbarProperties.setSnackbarProperties.and.returnValue(props);

        component.postAccounts(['id123']);
        tick(500);

        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(personalCardsService.postBankAccounts).toHaveBeenCalledOnceWith(['id123']);
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
            icon: 'tick-square-filled',
            showCloseButton: false,
            message: message,
          },
          duration: 3000,
        };
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        personalCardsService.postBankAccounts.and.returnValue(of(['card123', 'card456']));
        spyOn(component.loadCardData$, 'next');
        snackbarProperties.setSnackbarProperties.and.returnValue(props);

        component.postAccounts(['id123']);
        tick(500);

        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(personalCardsService.postBankAccounts).toHaveBeenCalledOnceWith(['id123']);
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
  });
});
