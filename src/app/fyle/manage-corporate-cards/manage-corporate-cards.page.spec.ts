import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import {
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

    for (let i = 0; i < cards.length; i++) {
      expect(cards[i].componentInstance.card).toEqual(cardsResponse[i]);

      expect(cards[i].componentInstance.isVisaRTFEnabled).toBeTrue();
      expect(cards[i].componentInstance.isMastercardRTFEnabled).toBeTrue();
    }
  });

  it('should redirect to my profile page when clicked on back icon', () => {
    const backButton = getElementBySelector(fixture, '[data-testid="back-button"]') as HTMLButtonElement;
    backButton.click();

    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/', 'enterprise', 'my_profile']);
  });

  it('should show a shimmer when the corporate cards are being fetched', () => {
    // This is to simulate the scenario where the corporate cards are being fetched
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(NEVER);

    component.ionViewWillEnter();
    fixture.detectChanges();

    const shimmer = getElementBySelector(fixture, '[data-testid="shimmer"]');
    expect(shimmer).toBeTruthy();
  });

  it('should open up the add corporate card modal when clicked on add button', fakeAsync(() => {
    const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
      'present',
      'onDidDismiss',
    ]) as jasmine.SpyObj<HTMLIonPopoverElement>;

    popoverSpy.onDidDismiss.and.resolveTo({});
    popoverController.create.and.resolveTo(popoverSpy);

    component.ionViewWillEnter();
    fixture.detectChanges();

    const addButton = getElementBySelector(fixture, '[data-testid="add-button"]') as HTMLButtonElement;
    addButton.click();

    tick();

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

    expect(popoverSpy.present).toHaveBeenCalledTimes(1);
  }));

  it('should reload the cards list if a card is successfully added from the add corporate card modal', fakeAsync(() => {
    const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
      'present',
      'onDidDismiss',
    ]) as jasmine.SpyObj<HTMLIonPopoverElement>;

    popoverSpy.onDidDismiss.and.resolveTo({ data: { success: true } });

    const cardAddedPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
      'present',
      'onDidDismiss',
    ]) as jasmine.SpyObj<HTMLIonPopoverElement>;

    popoverController.create.and.returnValues(Promise.resolve(popoverSpy), Promise.resolve(cardAddedPopoverSpy));

    component.ionViewWillEnter();
    fixture.detectChanges();

    const addButton = getElementBySelector(fixture, '[data-testid="add-button"]') as HTMLButtonElement;
    addButton.click();

    tick();

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

    expect(popoverSpy.present).toHaveBeenCalledTimes(1);

    expect(corporateCreditCardExpenseService.clearCache).toHaveBeenCalledTimes(1);
    expect(component.loadCorporateCards$.next).toHaveBeenCalledTimes(1);
  }));

  it('should show the card added modal when the card is successfully added from the add corporate card modal', fakeAsync(() => {
    const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
      'present',
      'onDidDismiss',
    ]) as jasmine.SpyObj<HTMLIonPopoverElement>;
    popoverSpy.onDidDismiss.and.resolveTo({ data: { success: true } });

    const cardAddedPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
      'present',
      'onDidDismiss',
    ]) as jasmine.SpyObj<HTMLIonPopoverElement>;

    popoverController.create.and.returnValues(Promise.resolve(popoverSpy), Promise.resolve(cardAddedPopoverSpy));

    component.ionViewWillEnter();
    fixture.detectChanges();

    const addButton = getElementBySelector(fixture, '[data-testid="add-button"]') as HTMLButtonElement;
    addButton.click();

    tick();

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

    expect(popoverSpy.present).toHaveBeenCalledTimes(1);

    expect(popoverController.create).toHaveBeenCalledWith({
      component: CardAddedComponent,
      cssClass: 'pop-up-in-center',
    });
    expect(cardAddedPopoverSpy.present).toHaveBeenCalledTimes(1);
  }));

  it('should show proper card options menu for rtf-connected cards', fakeAsync(() => {
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([visaRTFCard]));

    const actionSheetSpy = jasmine.createSpyObj('actionSheet', ['present']);
    actionSheetController.create.and.resolveTo(actionSheetSpy);

    component.ionViewWillEnter();
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.directive(MockCorporateCardComponent));
    card.triggerEventHandler('cardOptionsClick', visaRTFCard);

    tick();

    expect(actionSheetController.create).toHaveBeenCalledWith({
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

    expect(actionSheetSpy.present).toHaveBeenCalled();
  }));

  it('should show the disconnect card modal when clicked on disconnect button in the card options menu', (done) => {
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([visaRTFCard]));
    realTimeFeedService.getCardType.and.returnValue(CardNetworkType.VISA);

    component.ionViewWillEnter();
    fixture.detectChanges();

    component.setActionSheetButtons(visaRTFCard).subscribe(
      fakeAsync((actionSheetButtons) => {
        const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
          'present',
          'onDidDismiss',
        ]) as jasmine.SpyObj<HTMLIonPopoverElement>;
        popoverSpy.onDidDismiss.and.resolveTo({ data: { action: 'test' } });
        popoverController.create.and.resolveTo(popoverSpy);

        const disconnectHandler = actionSheetButtons[0].handler;
        disconnectHandler();

        tick();

        expect(popoverController.create).toHaveBeenCalledWith({
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

        expect(popoverSpy.present).toHaveBeenCalled();
        done();
      }),
    );
  });

  it('should not unenroll the card and reload the page if the user clicks cancel on the disconnect card modal', (done) => {
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([visaRTFCard]));
    realTimeFeedService.getCardType.and.returnValue(CardNetworkType.VISA);

    component.ionViewWillEnter();
    fixture.detectChanges();

    component.setActionSheetButtons(visaRTFCard).subscribe(
      fakeAsync((actionSheetButtons) => {
        const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
          'present',
          'onDidDismiss',
        ]) as jasmine.SpyObj<HTMLIonPopoverElement>;
        popoverSpy.onDidDismiss.and.resolveTo({ data: { action: 'cancel' } });
        popoverController.create.and.resolveTo(popoverSpy);

        const disconnectHandler = actionSheetButtons[0].handler;
        disconnectHandler();

        tick();

        expect(popoverController.create).toHaveBeenCalledWith({
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

        expect(popoverSpy.present).toHaveBeenCalled();
        expect(realTimeFeedService.unenroll).not.toHaveBeenCalled();

        done();
      }),
    );
  });

  it('should unenroll the card and reload the page if the user clicks disconnect on the disconnect card modal', (done) => {
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([visaRTFCard]));
    realTimeFeedService.getCardType.and.returnValue(CardNetworkType.VISA);

    component.ionViewWillEnter();
    fixture.detectChanges();

    component.setActionSheetButtons(visaRTFCard).subscribe(
      fakeAsync((actionSheetButtons) => {
        const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
          'present',
          'onDidDismiss',
        ]) as jasmine.SpyObj<HTMLIonPopoverElement>;
        popoverSpy.onDidDismiss.and.resolveTo({ data: { action: 'disconnect' } });
        popoverController.create.and.resolveTo(popoverSpy);

        const disconnectHandler = actionSheetButtons[0].handler;
        disconnectHandler();

        tick();

        expect(popoverController.create).toHaveBeenCalledWith({
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

        expect(popoverSpy.present).toHaveBeenCalled();
        expect(realTimeFeedService.unenroll).toHaveBeenCalledWith(CardNetworkType.VISA, visaRTFCard.id);
        expect(corporateCreditCardExpenseService.clearCache).toHaveBeenCalledTimes(1);
        expect(component.loadCorporateCards$.next).toHaveBeenCalledTimes(1);

        done();
      }),
    );
  });

  it('should show proper card options menu for statement uploaded cards', fakeAsync(() => {
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([statementUploadedCard]));

    const actionSheetSpy = jasmine.createSpyObj('actionSheet', ['present']);
    actionSheetController.create.and.resolveTo(actionSheetSpy);

    component.ionViewWillEnter();
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.directive(MockCorporateCardComponent));
    card.triggerEventHandler('cardOptionsClick', statementUploadedCard);

    tick();

    expect(actionSheetController.create).toHaveBeenCalledWith({
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

  it('should handle enrollment of existing statement uploaded cards to visa rtf', (done) => {
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([statementUploadedCard]));

    component.ionViewWillEnter();
    fixture.detectChanges();

    component.setActionSheetButtons(statementUploadedCard).subscribe(
      fakeAsync((actionSheetButtons) => {
        const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
          'present',
          'onDidDismiss',
        ]) as jasmine.SpyObj<HTMLIonPopoverElement>;
        popoverSpy.onDidDismiss.and.resolveTo({});
        popoverController.create.and.resolveTo(popoverSpy);

        const connectToVisaRTFHandler = actionSheetButtons[0].handler;
        connectToVisaRTFHandler();

        tick();

        expect(popoverController.create).toHaveBeenCalledWith({
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
        expect(popoverSpy.present).toHaveBeenCalledTimes(1);

        done();
      }),
    );
  });

  it('should handle enrollment of existing statement uploaded cards to mastercard rtf', (done) => {
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([statementUploadedCard]));

    component.ionViewWillEnter();
    fixture.detectChanges();

    component.setActionSheetButtons(statementUploadedCard).subscribe(
      fakeAsync((actionSheetButtons) => {
        const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
          'present',
          'onDidDismiss',
        ]) as jasmine.SpyObj<HTMLIonPopoverElement>;
        popoverSpy.onDidDismiss.and.resolveTo({});
        popoverController.create.and.resolveTo(popoverSpy);

        const connectToMastercardRTFHandler = actionSheetButtons[1].handler;
        connectToMastercardRTFHandler();

        tick();

        expect(popoverController.create).toHaveBeenCalledWith({
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
        expect(popoverSpy.present).toHaveBeenCalledTimes(1);

        done();
      }),
    );
  });

  it('should refresh the corporate cards when pull to refresh is triggered', () => {
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
