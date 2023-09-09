import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import {
  ActionSheetButton,
  ActionSheetController,
  IonRefresher,
  IonicModule,
  PopoverController,
  RefresherCustomEvent,
} from '@ionic/angular';

import { ManageCorporateCardsPage } from './manage-corporate-cards.page';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { Router } from '@angular/router';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';
import { NEVER, of } from 'rxjs';
import { orgSettingsCCCEnabled } from 'src/app/core/mock-data/org-settings.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import {
  mastercardRTFCard,
  statementUploadedCard,
  visaRTFCard,
} from 'src/app/core/mock-data/platform-corporate-card.data';
import { Component, Input } from '@angular/core';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { By } from '@angular/platform-browser';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';
import { AddCorporateCardComponent } from './add-corporate-card/add-corporate-card.component';
import { CardAddedComponent } from './card-added/card-added.component';
import { noop } from 'lodash';

@Component({
  selector: 'app-corporate-card',
  template: '<div></div>',
})
class MockCorporateCardComponent {
  @Input() card: PlatformCorporateCard;

  @Input() isVisaRTFEnabled: boolean;

  @Input() isMastercardRTFEnabled: boolean;
}

describe('ManageCorporateCardsPage', () => {
  let component: ManageCorporateCardsPage;
  let fixture: ComponentFixture<ManageCorporateCardsPage>;

  let router: jasmine.SpyObj<Router>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let actionSheetController: jasmine.SpyObj<ActionSheetController>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let realTimeFeedService: jasmine.SpyObj<RealTimeFeedService>;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getCorporateCards',
      'clearCache',
    ]);
    const actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const realTimeFeedServiceSpy = jasmine.createSpyObj('RealTimeFeedService', ['getCardType', 'unenroll']);

    TestBed.configureTestingModule({
      declarations: [ManageCorporateCardsPage, MockCorporateCardComponent],
      imports: [IonicModule.forRoot()],
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
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: RealTimeFeedService,
          useValue: realTimeFeedServiceSpy,
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
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    realTimeFeedService = TestBed.inject(RealTimeFeedService) as jasmine.SpyObj<RealTimeFeedService>;

    // Default return values
    orgSettingsService.get.and.returnValue(of(orgSettingsCCCEnabled));
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
    corporateCreditCardExpenseService.clearCache.and.returnValue(of(null));
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([]));
    realTimeFeedService.unenroll.and.returnValue(of(null));

    spyOn(component.loadCorporateCards$, 'next').and.callThrough();

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
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
        expect(cardComponent.card).toEqual(cardsResponse[i]);

        expect(cardComponent.isVisaRTFEnabled).toBeTrue();
        expect(cardComponent.isMastercardRTFEnabled).toBeTrue();
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
      expect(realTimeFeedService.unenroll).not.toHaveBeenCalled();
    }));

    it('should unenroll the card and reload the cards list if the user clicks disconnect on the disconnect card modal', fakeAsync(() => {
      disconnectPopoverSpy.onDidDismiss.and.resolveTo({ data: { action: 'disconnect' } });

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
      expect(realTimeFeedService.unenroll).toHaveBeenCalledOnceWith(visaRTFCard);
      expect(corporateCreditCardExpenseService.clearCache).toHaveBeenCalledTimes(1);
      expect(component.loadCorporateCards$.next).toHaveBeenCalledTimes(1);
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
            text: 'Connect to Visa Real-time Feed',
            handler: jasmine.any(Function),
          },
          {
            text: 'Connect to Mastercard Real-time Feed',
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
            icon: 'assets/svg/fy-delete.svg',
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
});
