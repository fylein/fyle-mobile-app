import { CurrencyPipe } from '@angular/common';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ExactCurrencyPipe } from 'src/app/shared/pipes/exact-currency.pipe';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { CardDetailComponent } from './card-detail.component';
import { cardDetailsRes } from 'src/app/core/mock-data/platform-corporate-card-detail.data';
import { Component, Input } from '@angular/core';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { By } from '@angular/platform-browser';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { of } from 'rxjs';
import { orgSettingsWithV2ExpensesPage, orgSettingsWoV2ExpensesPage } from 'src/app/core/mock-data/org-settings.data';

@Component({
  selector: 'app-corporate-card',
  template: '<div></div>',
})
class MockCorporateCardComponent {
  @Input() card: PlatformCorporateCard;

  @Input() hideOptionsMenu: boolean;
}

describe('CardDetailComponent', () => {
  let component: CardDetailComponent;
  let fixture: ComponentFixture<CardDetailComponent>;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let orgSettingService: jasmine.SpyObj<OrgSettingsService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'dashboardOnIncompleteCardExpensesClick',
      'dashboardOnCompleteCardExpensesClick',
    ]);
    const orgSettingServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [
        CardDetailComponent,
        HumanizeCurrencyPipe,
        ExactCurrencyPipe,
        MaskNumber,
        MockCorporateCardComponent,
      ],
      imports: [IonicModule.forRoot(), RouterModule, RouterTestingModule, TranslocoModule],
      providers: [
        FyCurrencyPipe,
        CurrencyPipe,
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    orgSettingService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    component.cardDetail = cardDetailsRes[cardDetailsRes.length - 1];
    orgSettingService.get.and.returnValue(of(orgSettingsWithV2ExpensesPage));
    fixture.detectChanges();
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'cardDetail.incompleteCardExpense': '{{count}} incomplete expenses',
        'cardDetail.completeCardExpense': '{{count}} complete expenses',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the card correctly', () => {
    const card = fixture.debugElement.query(By.directive(MockCorporateCardComponent));
    expect(card).toBeTruthy();

    expect(card.componentInstance.card).toEqual(component.cardDetail.card);
    expect(card.componentInstance.hideOptionsMenu).toBeTrue();
  });

  describe('goToExpensesPage():', () => {
    it('should go to expenses page and show filter DRAFT expenses', () => {
      trackingService.dashboardOnIncompleteCardExpensesClick.and.callThrough();
      fixture.detectChanges();

      const queryParams = {
        filters: JSON.stringify({ state: ['DRAFT'], cardNumbers: [component.cardDetail.card.card_number] }),
      };

      component.goToExpensesPage('incompleteExpenses', component.cardDetail);
      expect(trackingService.dashboardOnIncompleteCardExpensesClick).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });
    });

    it('should go to expenses page and show filter READY_TO_REPORT expenses', () => {
      trackingService.dashboardOnCompleteCardExpensesClick.and.callThrough();
      fixture.detectChanges();

      const queryParams = {
        filters: JSON.stringify({
          state: ['READY_TO_REPORT'],
          cardNumbers: [component.cardDetail.card.card_number],
        }),
      };

      component.goToExpensesPage('completeExpenses', component.cardDetail);
      expect(trackingService.dashboardOnCompleteCardExpensesClick).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });
    });
  });
});
