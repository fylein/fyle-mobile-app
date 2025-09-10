import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import {
  ActionSheetButton,
  ActionSheetController,
  IonRefresher,
  IonicModule,
  ModalController,
  PopoverController,
  RefresherCustomEvent,
  SegmentCustomEvent,
} from '@ionic/angular';

import { ManageCorporateCardsPage } from './manage-corporate-cards.page';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { NavigationStart, Router } from '@angular/router';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';
import { NEVER, Observable, Subscription, of, throwError } from 'rxjs';
import { orgSettingsCCCEnabled } from 'src/app/core/mock-data/org-settings.data';
import { employeeSettingsData } from 'src/app/core/mock-data/employee-settings.data';
import {
  mastercardRTFCard,
  statementUploadedCard,
  virtualCard,
  visaRTFCard,
} from 'src/app/core/mock-data/platform-corporate-card.data';
import { Component, input } from '@angular/core';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { By } from '@angular/platform-browser';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';
import { AddCorporateCardComponent } from './add-corporate-card/add-corporate-card.component';
import { CardAddedComponent } from './card-added/card-added.component';
import { noop } from 'lodash';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { cardUnenrolledProperties } from 'src/app/core/mock-data/corporate-card-trackers.data';
import { VirtualCardsService } from 'src/app/core/services/virtual-cards.service';
import { ManageCardsPageSegment } from 'src/app/core/enums/manage-cards-page-segment.enum';
import { virtualCardCombinedResponse } from 'src/app/core/mock-data/virtual-card-combined-response.data';
import { virtualCardDetailsCombined } from 'src/app/core/mock-data/platform-corporate-card-detail.data';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FeatureConfigService } from 'src/app/core/services/platform/v1/spender/feature-config.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PromoteOptInModalComponent } from 'src/app/shared/components/promote-opt-in-modal/promote-opt-in-modal.component';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { properties } from 'src/app/core/mock-data/modal-properties.data';

@Component({
  selector: 'app-corporate-card',
  template: '<div></div>',
})
class MockCorporateCardComponent {
  readonly card = input<PlatformCorporateCard>(undefined);

  readonly isVisaRTFEnabled = input<boolean>(undefined);

  readonly isMastercardRTFEnabled = input<boolean>(undefined);
}

describe('ManageCorporateCardsPage', () => {
  let component: ManageCorporateCardsPage;
  let fixture: ComponentFixture<ManageCorporateCardsPage>;

  let router: jasmine.SpyObj<Router>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let actionSheetController: jasmine.SpyObj<ActionSheetController>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  let realTimeFeedService: jasmine.SpyObj<RealTimeFeedService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let virtualCardsService: jasmine.SpyObj<VirtualCardsService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let featureConfigService: jasmine.SpyObj<FeatureConfigService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getCorporateCards',
      'clearCache',
    ]);
    const actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', ['get']);
    const realTimeFeedServiceSpy = jasmine.createSpyObj('RealTimeFeedService', ['getCardType', 'unenroll']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'cardUnenrolled',
      'showOptInModalPostCardAdditionInSettings',
      'skipOptInModalPostCardAdditionInSettings',
      'optInFromPostPostCardAdditionInSettings',
    ]);
    const virtualCardsServiceSpy = jasmine.createSpyObj('TrackingService', ['getCardDetailsMap']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', [
      'canShowOptInAfterAddingCard',
      'toggleShowOptInAfterAddingCard',
      'canShowOptInModal',
    ]);
    const featureConfigServiceSpy = jasmine.createSpyObj('FeatureConfigService', ['saveConfiguration']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ManageCorporateCardsPage, MockCorporateCardComponent],
      providers: [
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: CorporateCreditCardExpenseService,
          useValue: corporateCreditCardExpenseServiceSpy,
        },
        {
          provide: ActionSheetController,
          useValue: actionSheetControllerSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: PlatformEmployeeSettingsService,
          useValue: platformEmployeeSettingsServiceSpy,
        },
        {
          provide: RealTimeFeedService,
          useValue: realTimeFeedServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: VirtualCardsService,
          useValue: virtualCardsServiceSpy,
        },
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
        {
          provide: FeatureConfigService,
          useValue: featureConfigServiceSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageCorporateCardsPage);
    component = fixture.componentInstance;

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService,
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    actionSheetController = TestBed.inject(ActionSheetController) as jasmine.SpyObj<ActionSheetController>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService,
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    realTimeFeedService = TestBed.inject(RealTimeFeedService) as jasmine.SpyObj<RealTimeFeedService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    virtualCardsService = TestBed.inject(VirtualCardsService) as jasmine.SpyObj<VirtualCardsService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    featureConfigService = TestBed.inject(FeatureConfigService) as jasmine.SpyObj<FeatureConfigService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    // Default return values
    orgSettingsService.get.and.returnValue(of(orgSettingsCCCEnabled));
    platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
    corporateCreditCardExpenseService.clearCache.and.returnValue(of(null));
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([]));
    realTimeFeedService.unenroll.and.returnValue(of(null));
    component.isVirtualCardsEnabled$ = of({ enabled: true });
    spyOn(component.loadCorporateCards$, 'next').and.callThrough();

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    beforeEach(() => {
      spyOn(component, 'checkAddCorporateCardVisibility').and.returnValue(of(true));
    });

    it('should show a zero state if there are no corporate cards', () => {
      component.ionViewWillEnter();
      fixture.detectChanges();

      const zeroState = getElementBySelector(fixture, '[data-testid="zero-state"]');
      expect(zeroState).toBeTruthy();
    });

    it('should show a list of corporate cards assigned to the user', () => {
      const cardsResponse = [visaRTFCard, mastercardRTFCard];
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of(cardsResponse));

      component.ionViewWillEnter();
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(MockCorporateCardComponent));

      cards.forEach((card, i) => {
        const cardComponent = card.componentInstance as MockCorporateCardComponent;
        expect(cardComponent.card()).toEqual(cardsResponse[i]);

        expect(cardComponent.isVisaRTFEnabled()).toBeTrue();
        expect(cardComponent.isMastercardRTFEnabled()).toBeTrue();
      });
    });

    it('should show a shimmer when the corporate cards are being fetched', () => {
      // This is to simulate the scenario where the corporate cards are being fetched
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(NEVER);

      component.ionViewWillEnter();
      fixture.detectChanges();

      const shimmer = getElementBySelector(fixture, '[data-testid="shimmer"]');
      expect(shimmer).toBeTruthy();
    });
  });

  it('should redirect to my profile page when clicked on back icon', () => {
    const backButton = getElementBySelector(fixture, '[data-testid="back-button"]') as HTMLButtonElement;
    backButton.click();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_profile']);
  });

  describe('segmentChanged():', () => {
    it('should show Virtual Card page', () => {
      component.segmentChanged({
        detail: {
          value: ManageCardsPageSegment.VIRTUAL_CARDS,
        },
      } as SegmentCustomEvent);
      expect(component.segmentValue).toEqual(ManageCardsPageSegment.VIRTUAL_CARDS);
    });

    it('should show Corporate Card page', () => {
      component.segmentChanged({
        detail: {
          value: ManageCardsPageSegment.CORPORATE_CARDS,
        },
      } as SegmentCustomEvent);
      expect(component.segmentValue).toEqual(ManageCardsPageSegment.CORPORATE_CARDS);
    });
  });

  it('should load virtual card details when virtualCardDetails$ has enabled as true', () => {
    // Mock responses for service methods
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([virtualCard]));
    component.isVirtualCardsEnabled$ = of({ enabled: true });

    virtualCardsService.getCardDetailsMap.and.returnValue(of(virtualCardCombinedResponse));

    component.ionViewWillEnter();
    component.virtualCardDetails$.subscribe((virtualCardDetailsRes) => {
      expect(virtualCardDetailsRes).toBeDefined();
      expect(virtualCardDetailsRes).toEqual(virtualCardDetailsRes);
    });
  });

  describe('checkAddCorporateCardVisibility(): ', () => {
    beforeEach(() => {
      component.isVisaRTFEnabled$ = of(false);
      component.isMastercardRTFEnabled$ = of(false);
      component.isYodleeEnabled$ = of(false);
    });

    it('should return true when only isVisaRTFEnabled$ is true', (done) => {
      component.isVisaRTFEnabled$ = of(true);

      component.checkAddCorporateCardVisibility().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return true when only isMastercardRTFEnabled$ is true', (done) => {
      component.isMastercardRTFEnabled$ = of(true);

      component.checkAddCorporateCardVisibility().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return true when only isYodleeEnabled$ is true', (done) => {
      component.isYodleeEnabled$ = of(true);

      component.checkAddCorporateCardVisibility().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return false when all flags are false', (done) => {
      component.checkAddCorporateCardVisibility().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false when there is an error', (done) => {
      component.isVisaRTFEnabled$ = throwError('Error occurred');
      component.isMastercardRTFEnabled$ = of(false);
      component.isYodleeEnabled$ = of(false);

      component.checkAddCorporateCardVisibility().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return true when all flags are true', (done) => {
      component.isVisaRTFEnabled$ = of(true);
      component.isMastercardRTFEnabled$ = of(true);
      component.isYodleeEnabled$ = of(false);

      component.checkAddCorporateCardVisibility().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });
  });

  describe('add card flow', () => {
    let addCardPopoverSpy: jasmine.SpyObj<HTMLIonPopoverElement>;
    let cardAddedPopoverSpy: jasmine.SpyObj<HTMLIonPopoverElement>;

    beforeEach(() => {
      addCardPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onDidDismiss']);
      cardAddedPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
        'present',
        'onDidDismiss',
      ]) as jasmine.SpyObj<HTMLIonPopoverElement>;

      popoverController.create.and.returnValues(
        Promise.resolve(addCardPopoverSpy),
        Promise.resolve(cardAddedPopoverSpy),
      );
      spyOn(component, 'onCardAdded');

      spyOn(component, 'checkAddCorporateCardVisibility').and.returnValue(of(true));
      component.ionViewWillEnter();
      fixture.detectChanges();
    });

    it('should open up the add corporate card modal when clicked on add corporate card button', fakeAsync(() => {
      // Returning empty object, because we don't want to trigger the success flow, we are just testing if the popover opens or not
      addCardPopoverSpy.onDidDismiss.and.resolveTo({});

      const addButton = getElementBySelector(fixture, '[data-testid="add-button"]') as HTMLButtonElement;
      addButton.click();

      tick();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: AddCorporateCardComponent,
        cssClass: 'fy-dialog-popover',
        componentProps: {
          isVisaRTFEnabled: true,
          isMastercardRTFEnabled: true,
          isYodleeEnabled: true,
          card: undefined,
          cardType: undefined,
        },
      });

      expect(addCardPopoverSpy.present).toHaveBeenCalledTimes(1);
    }));

    it('should show the card added modal and reload the cards list when the card is successfully added from the add corporate card modal', fakeAsync(() => {
      addCardPopoverSpy.onDidDismiss.and.resolveTo({ data: { success: true } });

      const addButton = getElementBySelector(fixture, '[data-testid="add-button"]') as HTMLButtonElement;
      addButton.click();

      tick();

      expect(popoverController.create).toHaveBeenCalledTimes(2);
      expect(popoverController.create).toHaveBeenCalledWith({
        component: AddCorporateCardComponent,
        cssClass: 'fy-dialog-popover',
        componentProps: {
          isVisaRTFEnabled: true,
          isMastercardRTFEnabled: true,
          isYodleeEnabled: true,
          card: undefined,
          cardType: undefined,
        },
      });
      expect(addCardPopoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverController.create).toHaveBeenCalledWith({
        component: CardAddedComponent,
        cssClass: 'pop-up-in-center',
      });
      expect(cardAddedPopoverSpy.present).toHaveBeenCalledTimes(1);

      expect(corporateCreditCardExpenseService.clearCache).toHaveBeenCalledTimes(1);
      expect(component.loadCorporateCards$.next).toHaveBeenCalledTimes(1);
    }));
  });

  describe('card disconnection flow', () => {
    let disconnectPopoverSpy: jasmine.SpyObj<HTMLIonPopoverElement>;
    let actionSheetButtons: ActionSheetButton[];

    beforeEach((done) => {
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([visaRTFCard]));
      realTimeFeedService.getCardType.and.returnValue(CardNetworkType.VISA);
      disconnectPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onDidDismiss']);
      popoverController.create.and.resolveTo(disconnectPopoverSpy);

      component.ionViewWillEnter();
      fixture.detectChanges();

      component.setActionSheetButtons(visaRTFCard).subscribe((actionSheetButtonsRes) => {
        actionSheetButtons = actionSheetButtonsRes;
        done();
      });
    });

    it('should open the disconnect card modal when clicked on disconnect button in the card options menu', fakeAsync(() => {
      disconnectPopoverSpy.onDidDismiss.and.resolveTo({});

      const disconnectHandler = actionSheetButtons[0].handler;
      disconnectHandler();

      tick();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        cssClass: 'pop-up-in-center',
        componentProps: {
          title: 'Disconnect Card',
          message: `<div class="text-left"><div class="mb-16">You are disconnecting your Visa card from real-time feed.</div><div>Do you wish to continue?</div></div>`,
          primaryCta: {
            text: 'Yes, Disconnect',
            action: 'disconnect',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
        },
      });

      expect(disconnectPopoverSpy.present).toHaveBeenCalledTimes(1);
    }));

    it('should not unenroll the card if the user clicks cancel on the disconnect card modal', fakeAsync(() => {
      disconnectPopoverSpy.onDidDismiss.and.resolveTo({ data: { action: 'cancel' } });

      const disconnectHandler = actionSheetButtons[0].handler;
      disconnectHandler();

      tick();

      expect(realTimeFeedService.unenroll).not.toHaveBeenCalled();
    }));

    it('should unenroll the card and reload the cards list if the user clicks disconnect on the disconnect card modal', fakeAsync(() => {
      disconnectPopoverSpy.onDidDismiss.and.resolveTo({ data: { action: 'disconnect' } });

      const disconnectHandler = actionSheetButtons[0].handler;
      disconnectHandler();

      tick();

      expect(realTimeFeedService.unenroll).toHaveBeenCalledOnceWith(visaRTFCard);
      expect(corporateCreditCardExpenseService.clearCache).toHaveBeenCalledTimes(1);
      expect(component.loadCorporateCards$.next).toHaveBeenCalledTimes(1);
    }));

    it('should track card unenrollment event', fakeAsync(() => {
      disconnectPopoverSpy.onDidDismiss.and.resolveTo({ data: { action: 'disconnect' } });

      const disconnectHandler = actionSheetButtons[0].handler;
      disconnectHandler();

      tick();

      expect(trackingService.cardUnenrolled).toHaveBeenCalledOnceWith(cardUnenrolledProperties);
    }));
  });

  describe('card options action sheet menu', () => {
    it('should show correct options for statement uploaded cards', fakeAsync(() => {
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([statementUploadedCard]));
      const actionSheetSpy = jasmine.createSpyObj('HTMLIonActionSheetElement', [
        'present',
      ]) as jasmine.SpyObj<HTMLIonActionSheetElement>;
      actionSheetController.create.and.resolveTo(actionSheetSpy);

      component.ionViewWillEnter();
      fixture.detectChanges();

      const card = fixture.debugElement.query(By.directive(MockCorporateCardComponent));
      card.triggerEventHandler('cardOptionsClick', statementUploadedCard);

      tick();

      expect(actionSheetController.create).toHaveBeenCalledOnceWith({
        buttons: [
          {
            text: 'Connect to Visa real-time feed',
            handler: jasmine.any(Function),
          },
          {
            text: 'Connect to Mastercard real-time feed',
            handler: jasmine.any(Function),
          },
        ],
        cssClass: 'fy-action-sheet',
        mode: 'md',
      });

      expect(actionSheetSpy.present).toHaveBeenCalledTimes(1);
    }));

    it('should show correct options for rtf-connected cards', fakeAsync(() => {
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([visaRTFCard]));
      const actionSheetSpy = jasmine.createSpyObj('HTMLIonActionSheetElement', [
        'present',
      ]) as jasmine.SpyObj<HTMLIonActionSheetElement>;
      actionSheetController.create.and.resolveTo(actionSheetSpy);

      component.ionViewWillEnter();
      fixture.detectChanges();

      const card = fixture.debugElement.query(By.directive(MockCorporateCardComponent));
      card.triggerEventHandler('cardOptionsClick', visaRTFCard);

      tick();

      expect(actionSheetController.create).toHaveBeenCalledOnceWith({
        buttons: [
          {
            text: 'Disconnect',
            icon: 'assets/svg/bin.svg',
            cssClass: 'danger',
            handler: jasmine.any(Function),
          },
        ],
        cssClass: 'fy-action-sheet',
        mode: 'md',
      });

      expect(actionSheetSpy.present).toHaveBeenCalledTimes(1);
    }));
  });

  describe('enrollment of statement uploaded cards to rtf', () => {
    let addCardPopoverSpy: jasmine.SpyObj<HTMLIonPopoverElement>;
    let actionSheetButtons: ActionSheetButton[];

    beforeEach((done) => {
      addCardPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
        'present',
        'onDidDismiss',
      ]) as jasmine.SpyObj<HTMLIonPopoverElement>;
      popoverController.create.and.resolveTo(addCardPopoverSpy);

      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([statementUploadedCard]));

      component.ionViewWillEnter();
      fixture.detectChanges();

      component.setActionSheetButtons(statementUploadedCard).subscribe((actionSheetButtonsRes) => {
        actionSheetButtons = actionSheetButtonsRes;
        done();
      });
    });

    it("should open the add corporate card popover with the card's details for connecting it to visa rtf", fakeAsync(() => {
      addCardPopoverSpy.onDidDismiss.and.resolveTo({});

      const connectToVisaRTFHandler = actionSheetButtons[0].handler;
      connectToVisaRTFHandler();

      tick();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: AddCorporateCardComponent,
        cssClass: 'fy-dialog-popover',
        componentProps: {
          isVisaRTFEnabled: true,
          isMastercardRTFEnabled: true,
          isYodleeEnabled: true,
          card: statementUploadedCard,
          cardType: CardNetworkType.VISA,
        },
      });
      expect(addCardPopoverSpy.present).toHaveBeenCalledTimes(1);
    }));

    it("should open the add corporate card popover with the card's details for connecting it to mastercard rtf", fakeAsync(() => {
      addCardPopoverSpy.onDidDismiss.and.resolveTo({});

      const connectToMastercardRTFHandler = actionSheetButtons[1].handler;
      connectToMastercardRTFHandler();

      tick();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: AddCorporateCardComponent,
        cssClass: 'fy-dialog-popover',
        componentProps: {
          isVisaRTFEnabled: true,
          isMastercardRTFEnabled: true,
          isYodleeEnabled: true,
          card: statementUploadedCard,
          cardType: CardNetworkType.MASTERCARD,
        },
      });
      expect(addCardPopoverSpy.present).toHaveBeenCalledTimes(1);
    }));
  });

  it('should refresh the corporate cards list when pulled to refresh', () => {
    const refresher = fixture.debugElement.query(By.directive(IonRefresher));
    const refresherCustomEvent = {
      target: {
        complete: noop,
      },
    } as RefresherCustomEvent;
    spyOn(refresherCustomEvent.target, 'complete');

    refresher.triggerEventHandler('ionRefresh', refresherCustomEvent);

    expect(corporateCreditCardExpenseService.clearCache).toHaveBeenCalledTimes(1);
    expect(component.loadCorporateCards$.next).toHaveBeenCalledTimes(1);
    expect(refresherCustomEvent.target.complete).toHaveBeenCalledTimes(1);
  });

  describe('showPromoteOptInModal():', () => {
    beforeEach(() => {
      authService.getEou.and.resolveTo(apiEouRes);
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
      featureConfigService.saveConfiguration.and.returnValue(of(null));
    });

    it('should show promote opt-in modal and track skip event if user skipped opt-in', fakeAsync(() => {
      const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modal.onDidDismiss.and.resolveTo({ data: { skipOptIn: true } });
      modalController.create.and.resolveTo(modal);

      component.showPromoteOptInModal();
      tick(100);

      expect(trackingService.showOptInModalPostCardAdditionInSettings).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(modal.present).toHaveBeenCalledTimes(1);
      expect(modal.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(featureConfigService.saveConfiguration).toHaveBeenCalledOnceWith({
        feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
        key: 'OPT_IN_POPUP_SHOWN_COUNT',
        value: {
          count: 1,
        },
      });
      expect(trackingService.skipOptInModalPostCardAdditionInSettings).toHaveBeenCalledTimes(1);
      expect(trackingService.optInFromPostPostCardAdditionInSettings).not.toHaveBeenCalled();
    }));

    it('should show promote opt-in modal and track opt-in event if user opted-in', fakeAsync(() => {
      const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modal.onDidDismiss.and.resolveTo({ data: { skipOptIn: false } });
      modalController.create.and.resolveTo(modal);

      component.showPromoteOptInModal();
      tick(100);

      expect(trackingService.showOptInModalPostCardAdditionInSettings).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(modal.present).toHaveBeenCalledTimes(1);
      expect(modal.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(featureConfigService.saveConfiguration).toHaveBeenCalledOnceWith({
        feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
        key: 'OPT_IN_POPUP_SHOWN_COUNT',
        value: {
          count: 1,
        },
      });
      expect(trackingService.skipOptInModalPostCardAdditionInSettings).not.toHaveBeenCalled();
      expect(trackingService.optInFromPostPostCardAdditionInSettings).toHaveBeenCalledTimes(1);
    }));

    it('should show promote opt-in modal and track opt-in event if data is undefined', fakeAsync(() => {
      const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modal.onDidDismiss.and.resolveTo({ data: undefined });
      modalController.create.and.resolveTo(modal);

      component.showPromoteOptInModal();
      tick(100);

      expect(trackingService.showOptInModalPostCardAdditionInSettings).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(modal.present).toHaveBeenCalledTimes(1);
      expect(modal.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(featureConfigService.saveConfiguration).toHaveBeenCalledOnceWith({
        feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
        key: 'OPT_IN_POPUP_SHOWN_COUNT',
        value: {
          count: 1,
        },
      });
      expect(trackingService.skipOptInModalPostCardAdditionInSettings).not.toHaveBeenCalled();
      expect(trackingService.optInFromPostPostCardAdditionInSettings).toHaveBeenCalledTimes(1);
    }));
  });

  it('setNavigationSubscription(): should clear timeout and show promote opt-in modal if user navigates to manage corporate cards page', fakeAsync(() => {
    spyOn(component, 'showPromoteOptInModal');
    const navigationEvent = new NavigationStart(1, 'manage_corporate_cards');
    utilityService.canShowOptInModal.and.returnValue(of(true));
    Object.defineProperty(router, 'events', { value: of(navigationEvent) });

    component.setNavigationSubscription();
    tick(100);

    expect(utilityService.canShowOptInModal).toHaveBeenCalledOnceWith({
      feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
      key: 'OPT_IN_POPUP_SHOWN_COUNT',
    });
    expect(component.showPromoteOptInModal).toHaveBeenCalledTimes(1);
  }));

  it('onCardAdded(): should setup navigation subscription and modal delay', () => {
    spyOn(component, 'setNavigationSubscription');
    spyOn(component, 'setModalDelay');
    utilityService.canShowOptInModal.and.returnValue(of(true));

    component.onCardAdded();

    expect(component.setNavigationSubscription).toHaveBeenCalledTimes(1);
    expect(component.setModalDelay).toHaveBeenCalledTimes(1);
    expect(utilityService.canShowOptInModal).toHaveBeenCalledOnceWith({
      feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
      key: 'OPT_IN_POPUP_SHOWN_COUNT',
    });
    expect(utilityService.toggleShowOptInAfterAddingCard).toHaveBeenCalledOnceWith(true);
  });

  it('setModalDelay(): should set optInShowTimer and call showPromoteOptInModal after 2 seconds', fakeAsync(() => {
    spyOn(component, 'showPromoteOptInModal');

    component.setModalDelay();
    tick(4000);

    expect(component.showPromoteOptInModal).toHaveBeenCalledTimes(1);
  }));

  describe('ionViewWillLeave():', () => {
    it('should unsubscribe from navigationSubscription if it is defined', () => {
      component.navigationSubscription = new Subscription();
      spyOn(component.navigationSubscription, 'unsubscribe');

      component.ionViewWillLeave();

      expect(component.navigationSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should toggle optInAfterAddingCard flag to false', () => {
      component.navigationSubscription = null;

      component.ionViewWillLeave();

      expect(utilityService.toggleShowOptInAfterAddingCard).toHaveBeenCalledOnceWith(false);
    });
  });
});
