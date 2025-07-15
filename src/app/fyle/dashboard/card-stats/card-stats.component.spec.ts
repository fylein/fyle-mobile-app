import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';

import { CardStatsComponent } from './card-stats.component';
import { Component, Input } from '@angular/core';
import { PlatformCorporateCardDetail } from 'src/app/core/models/platform-corporate-card-detail.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { DashboardService } from '../dashboard.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { of } from 'rxjs';
import {
  orgSettingsCCCDisabled,
  orgSettingsCCCEnabled,
  orgSettingsRTFDisabled,
} from 'src/app/core/mock-data/org-settings.data';
import { employeeSettingsData } from 'src/app/core/mock-data/employee-settings.data';
import { emptyCCCStats, mastercardCCCStats } from 'src/app/core/mock-data/ccc-expense.details.data';
import { mastercardRTFCard } from 'src/app/core/mock-data/platform-corporate-card.data';
import { By } from '@angular/platform-browser';
import { cardDetailsRes, virtualCardDetailsCombined } from 'src/app/core/mock-data/platform-corporate-card-detail.data';
import { AddCorporateCardComponent } from '../../manage-corporate-cards/add-corporate-card/add-corporate-card.component';
import { CardAddedComponent } from '../../manage-corporate-cards/card-added/card-added.component';
import { VirtualCardsService } from 'src/app/core/services/virtual-cards.service';
import { virtualCardCombinedResponse } from 'src/app/core/mock-data/virtual-card-combined-response.data';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { tap } from 'rxjs/operators';

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
  const cardDetails = cardDetailsRes;

  let component: CardStatsComponent;
  let fixture: ComponentFixture<CardStatsComponent>;

  let currencyService: jasmine.SpyObj<CurrencyService>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let virtualCardsService: jasmine.SpyObj<VirtualCardsService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getCCCDetails']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', ['get']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getCorporateCards',
      'getPlatformCorporateCardDetails',
      'clearCache',
    ]);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const virtualCardsServiceSpy = jasmine.createSpyObj('VirtualCardsService', ['getCardDetailsMap']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [CardStatsComponent, MockSpentCardsComponent, MockAddCardComponent],
      imports: [IonicModule.forRoot(), TranslocoModule],
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
          provide: PlatformEmployeeSettingsService,
          useValue: platformEmployeeSettingsServiceSpy,
        },
        {
          provide: CorporateCreditCardExpenseService,
          useValue: corporateCreditCardExpenseServiceSpy,
        },
        {
          provide: VirtualCardsService,
          useValue: virtualCardsServiceSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardStatsComponent);
    component = fixture.componentInstance;

    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    virtualCardsService = TestBed.inject(VirtualCardsService) as jasmine.SpyObj<VirtualCardsService>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'cardStats.myCards': 'My cards',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });

    // Default return values
    currencyService.getHomeCurrency.and.returnValue(of('USD'));
    orgSettingsService.get.and.returnValue(of(orgSettingsCCCEnabled));
    platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of(cards));
    dashboardService.getCCCDetails.and.returnValue(of(cardStats));
    corporateCreditCardExpenseService.getPlatformCorporateCardDetails.and.returnValue(cardDetails);
    networkService.isOnline.and.returnValue(of(true));
    corporateCreditCardExpenseService.clearCache.and.returnValue(of(null));

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

      component.isVirtualCardsEnabled$ = of({ enabled: false });

      fixture.detectChanges();

      const spentCardsComponent = fixture.debugElement.query(By.directive(MockSpentCardsComponent));
      expect(spentCardsComponent).toBeTruthy();

      const spentCardsComponentInstance = spentCardsComponent.componentInstance as MockSpentCardsComponent;
      expect(spentCardsComponentInstance.cardDetails).toEqual(cardDetails);
      expect(spentCardsComponentInstance.homeCurrency).toEqual('USD');
      expect(spentCardsComponentInstance.currencySymbol).toEqual('$');
      expect(spentCardsComponentInstance.showAddCardSlide).toBeTrue();

      expect(corporateCreditCardExpenseService.getCorporateCards).toHaveBeenCalledTimes(1);
      expect(corporateCreditCardExpenseService.getPlatformCorporateCardDetails).toHaveBeenCalledOnceWith(
        cards,
        cardStats
      );
    });

    xit('should set virtualCardDetails$ when isVirtualCardsEnabled is true', fakeAsync(() => {
      component.isVirtualCardsEnabled$ = of({ enabled: true });

      virtualCardsService.getCardDetailsMap.and.returnValue(of(virtualCardCombinedResponse));

      component.ngOnInit();
      component.init();

      tick(100);
      component.virtualCardDetails$.subscribe((virtualCardDetailsRes) => {
        expect(virtualCardDetailsRes).toBeDefined();
        expect(virtualCardDetailsRes.length).toBe(4);
        expect(virtualCardDetailsRes[3]).toEqual(virtualCardDetailsCombined[0]);
      });
    }));

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
        expect(addCardComponentInstance.showZeroStateMessage).toBeTrue();
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
      component.isVirtualCardsEnabled$ = of({ enabled: false });

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

    xit('should open the card added modal on successful card addition and reload the cards', fakeAsync(() => {
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
      component.isVirtualCardsEnabled$ = of({ enabled: false });
      fixture.detectChanges();

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

    xit('should open the card added modal on successful card addition and reload the cards', fakeAsync(() => {
      addCardPopoverSpy.onDidDismiss.and.resolveTo({ data: { success: true } });

      component.isVirtualCardsEnabled$ = of({ enabled: false });

      fixture.detectChanges();

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

  describe('handleEnrollmentSuccess', () => {
    let cardAddedPopoverSpy: jasmine.SpyObj<HTMLIonPopoverElement>;

    beforeEach(() => {
      cardAddedPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', [
        'present',
        'onDidDismiss',
      ]) as jasmine.SpyObj<HTMLIonPopoverElement>;

      popoverController.create.and.returnValue(Promise.resolve(cardAddedPopoverSpy));
      corporateCreditCardExpenseService.clearCache.and.returnValue(of(null));
      spyOn(component.cardAdded, 'emit');

      component.ngOnInit();
      component.init();
    });

    it('should clear cache, show card added modal, emit event and reload cards on successful enrollment', fakeAsync(() => {
      // Call the private method directly using any type assertion
      (component as any).handleEnrollmentSuccess();

      tick();

      expect(corporateCreditCardExpenseService.clearCache).toHaveBeenCalledTimes(1);
      expect(popoverController.create).toHaveBeenCalledWith({
        component: CardAddedComponent,
        cssClass: 'pop-up-in-center',
      });
      expect(cardAddedPopoverSpy.present).toHaveBeenCalledTimes(1);
      expect(cardAddedPopoverSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(component.cardAdded.emit).toHaveBeenCalledTimes(1);
      expect(component.loadCardDetails$.next).toHaveBeenCalledTimes(1);
    }));

    it('should execute all steps in the correct order', fakeAsync(() => {
      const executionOrder: string[] = [];
      
      corporateCreditCardExpenseService.clearCache.and.returnValue(
        of(null).pipe(
          tap(() => executionOrder.push('cache_cleared'))
        )
      );

      popoverController.create.and.returnValue(
        Promise.resolve(cardAddedPopoverSpy).then(() => {
          executionOrder.push('popover_created');
          return cardAddedPopoverSpy;
        })
      );

      cardAddedPopoverSpy.present.and.returnValue(
        Promise.resolve().then(() => {
          executionOrder.push('popover_presented');
        })
      );

      cardAddedPopoverSpy.onDidDismiss.and.returnValue(
        Promise.resolve({}).then(() => {
          executionOrder.push('popover_dismissed');
          return {};
        })
      );

      // Call the private method directly using any type assertion
      (component as any).handleEnrollmentSuccess();

      tick();

      expect(executionOrder).toEqual([
        'cache_cleared',
        'popover_created',
        'popover_presented',
        'popover_dismissed'
      ]);
      expect(component.cardAdded.emit).toHaveBeenCalledTimes(1);
      expect(component.loadCardDetails$.next).toHaveBeenCalledTimes(1);
    }));

    it('should emit cardAdded event after popover is dismissed', fakeAsync(() => {
      // Reset the spy call count
      (component.cardAdded.emit as jasmine.Spy).calls.reset();

      // Call the private method directly using any type assertion
      (component as any).handleEnrollmentSuccess();

      // Before tick, emit should not be called
      expect(component.cardAdded.emit).not.toHaveBeenCalled();

      tick();

      // After tick, emit should be called
      expect(component.cardAdded.emit).toHaveBeenCalledTimes(1);
    }));

    it('should reload card details after popover is dismissed', fakeAsync(() => {
      // Reset the spy call count
      (component.loadCardDetails$.next as jasmine.Spy).calls.reset();

      // Call the private method directly using any type assertion
      (component as any).handleEnrollmentSuccess();

      // Before tick, reload should not be called
      expect(component.loadCardDetails$.next).not.toHaveBeenCalled();

      tick();

      // After tick, reload should be called
      expect(component.loadCardDetails$.next).toHaveBeenCalledTimes(1);
    }));
  });
});
