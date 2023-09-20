import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';

import { CardStatsComponent } from './card-stats.component';
import { Component, Input } from '@angular/core';
import { PlatformCorporateCardDetail } from 'src/app/core/models/platform-corporate-card-detail.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { DashboardService } from '../dashboard.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { of } from 'rxjs';
import {
  orgSettingsCCCDisabled,
  orgSettingsCCCEnabled,
  orgSettingsRTFDisabled,
} from 'src/app/core/mock-data/org-settings.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { emptyCCCStats, mastercardCCCStats } from 'src/app/core/mock-data/ccc-expense.details.data';
import { mastercardRTFCard } from 'src/app/core/mock-data/platform-corporate-card.data';
import { By } from '@angular/platform-browser';
import { cardDetailsRes } from 'src/app/core/mock-data/platform-corporate-card-detail-data';
import { AddCorporateCardComponent } from '../../manage-corporate-cards/add-corporate-card/add-corporate-card.component';
import { CardAddedComponent } from '../../manage-corporate-cards/card-added/card-added.component';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';

@Component({
  selector: 'app-spent-cards',
  template: '<div></div>',
})
class MockSpentCardsComponent {
  @Input() cardDetails: PlatformCorporateCardDetail[];

  @Input() homeCurrency: string;

  @Input() currencySymbol: string;

  @Input() showAddCardSlide: boolean;
}

@Component({
  selector: 'app-add-card',
  template: '<div></div>',
})
class MockAddCardComponent {
  @Input() showZeroStateMessage: boolean;
}

describe('CardStatsComponent', () => {
  const cards = [mastercardRTFCard];
  const cardStats = mastercardCCCStats;
  const cardDetails = [cardDetailsRes[1]];

  let component: CardStatsComponent;
  let fixture: ComponentFixture<CardStatsComponent>;

  let currencyService: jasmine.SpyObj<CurrencyService>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;

  beforeEach(waitForAsync(() => {
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getCCCDetails']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getCorporateCards',
      'getPlatformCorporateCardDetails',
      'clearCache',
    ]);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', ['getVariation']);

    TestBed.configureTestingModule({
      declarations: [CardStatsComponent, MockSpentCardsComponent, MockAddCardComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
        {
          provide: DashboardService,
          useValue: dashboardServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: CorporateCreditCardExpenseService,
          useValue: corporateCreditCardExpenseServiceSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: LaunchDarklyService,
          useValue: launchDarklyServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardStatsComponent);
    component = fixture.componentInstance;

    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;

    // Default return values
    currencyService.getHomeCurrency.and.returnValue(of('USD'));
    orgSettingsService.get.and.returnValue(of(orgSettingsCCCEnabled));
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of(cards));
    dashboardService.getCCCDetails.and.returnValue(of(cardStats));
    corporateCreditCardExpenseService.getPlatformCorporateCardDetails.and.returnValue(cardDetails);
    networkService.isOnline.and.returnValue(of(true));
    corporateCreditCardExpenseService.clearCache.and.returnValue(of(null));
    launchDarklyService.getVariation.and.returnValue(of(true));

    spyOn(component.loadCardDetails$, 'next').and.callThrough();

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    it('should not display anything if CCC is disabled', () => {
      orgSettingsService.get.and.returnValue(of(orgSettingsCCCDisabled));

      component.ngOnInit();
      component.init();

      fixture.detectChanges();

      expect(fixture.nativeElement.children.length).toEqual(0);
    });

    it('should not display anything if the user is offline', () => {
      networkService.isOnline.and.returnValue(of(false));

      component.ngOnInit();
      component.init();

      fixture.detectChanges();

      expect(fixture.nativeElement.children.length).toEqual(0);
    });

    it('should display the cards swiper when cards are present for the user', () => {
      component.ngOnInit();
      component.init();

      fixture.detectChanges();

      const spentCardsComponent = fixture.debugElement.query(By.directive(MockSpentCardsComponent));
      expect(spentCardsComponent).toBeTruthy();

      const spentCardsComponentInstance = spentCardsComponent.componentInstance as MockSpentCardsComponent;
      expect(spentCardsComponentInstance.cardDetails).toEqual(cardDetails);
      expect(spentCardsComponentInstance.homeCurrency).toEqual('USD');
      expect(spentCardsComponentInstance.currencySymbol).toEqual('$');
      expect(spentCardsComponentInstance.showAddCardSlide).toEqual(true);

      expect(corporateCreditCardExpenseService.getCorporateCards).toHaveBeenCalledTimes(1);
      expect(corporateCreditCardExpenseService.getPlatformCorporateCardDetails).toHaveBeenCalledOnceWith(
        cards,
        cardStats.cardDetails
      );
    });

    describe('add card zero state', () => {
      beforeEach(() => {
        corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([]));
        dashboardService.getCCCDetails.and.returnValue(of(emptyCCCStats));
        corporateCreditCardExpenseService.getPlatformCorporateCardDetails.and.returnValue([]);
      });

      it('should be visible if RTF enrollment is enabled', () => {
        component.ngOnInit();
        component.init();

        fixture.detectChanges();

        const addCardComponent = fixture.debugElement.query(By.directive(MockAddCardComponent));
        expect(addCardComponent).toBeTruthy();

        const addCardComponentInstance = addCardComponent.componentInstance as MockAddCardComponent;
        expect(addCardComponentInstance.showZeroStateMessage).toEqual(true);
      });

      it('should not be visible if RTF enrollment is disabled', fakeAsync(() => {
        orgSettingsService.get.and.returnValue(of(orgSettingsRTFDisabled));

        fixture.detectChanges();

        component.ngOnInit();
        component.init();

        fixture.detectChanges();

        const addCardComponent = fixture.debugElement.query(By.directive(MockAddCardComponent));
        expect(addCardComponent).toBeFalsy();
      }));
    });
  });

  describe('add card flow from zero state', () => {
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
        Promise.resolve(cardAddedPopoverSpy)
      );

      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([]));
      dashboardService.getCCCDetails.and.returnValue(of(emptyCCCStats));
      corporateCreditCardExpenseService.getPlatformCorporateCardDetails.and.returnValue([]);

      component.ngOnInit();
      component.init();

      fixture.detectChanges();
    });

    it('should open the add corporate card modal on addCardClick event', fakeAsync(() => {
      // Returning empty object, because we don't want to trigger the success flow, we are just testing if the popover opens or not
      addCardPopoverSpy.onDidDismiss.and.resolveTo({});

      const addCardComponent = fixture.debugElement.query(By.directive(MockAddCardComponent));
      addCardComponent.triggerEventHandler('addCardClick', null);

      tick();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: AddCorporateCardComponent,
        cssClass: 'fy-dialog-popover',
        componentProps: {
          isVisaRTFEnabled: true,
          isMastercardRTFEnabled: true,
          isYodleeEnabled: true,
        },
      });

      expect(addCardPopoverSpy.present).toHaveBeenCalledTimes(1);
    }));

    it('should open the card added modal on successful card addition and reload the cards', fakeAsync(() => {
      addCardPopoverSpy.onDidDismiss.and.resolveTo({ data: { success: true } });

      const spentCardsComponent = fixture.debugElement.query(By.directive(MockAddCardComponent));
      spentCardsComponent.triggerEventHandler('addCardClick', null);

      tick();

      expect(popoverController.create).toHaveBeenCalledWith({
        component: CardAddedComponent,
        cssClass: 'pop-up-in-center',
      });
      expect(cardAddedPopoverSpy.present).toHaveBeenCalledTimes(1);
      expect(component.loadCardDetails$.next).toHaveBeenCalledTimes(1);
    }));
  });

  describe('add card flow from cards swiper', () => {
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
        Promise.resolve(cardAddedPopoverSpy)
      );

      component.ngOnInit();
      component.init();

      fixture.detectChanges();
    });

    it('should open the add corporate card modal on addCardClick event', fakeAsync(() => {
      // Returning empty object, because we don't want to trigger the success flow, we are just testing if the popover opens or not
      addCardPopoverSpy.onDidDismiss.and.resolveTo({});

      const addCardComponent = fixture.debugElement.query(By.directive(MockSpentCardsComponent));
      addCardComponent.triggerEventHandler('addCardClick', null);

      tick();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: AddCorporateCardComponent,
        cssClass: 'fy-dialog-popover',
        componentProps: {
          isVisaRTFEnabled: true,
          isMastercardRTFEnabled: true,
          isYodleeEnabled: true,
        },
      });

      expect(addCardPopoverSpy.present).toHaveBeenCalledTimes(1);
    }));

    it('should open the card added modal on successful card addition and reload the cards', fakeAsync(() => {
      addCardPopoverSpy.onDidDismiss.and.resolveTo({ data: { success: true } });

      const spentCardsComponent = fixture.debugElement.query(By.directive(MockSpentCardsComponent));
      spentCardsComponent.triggerEventHandler('addCardClick', null);

      tick();

      expect(popoverController.create).toHaveBeenCalledWith({
        component: CardAddedComponent,
        cssClass: 'pop-up-in-center',
      });
      expect(cardAddedPopoverSpy.present).toHaveBeenCalledTimes(1);
      expect(component.loadCardDetails$.next).toHaveBeenCalledTimes(1);
    }));
  });
});
