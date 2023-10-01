import { CurrencyPipe } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { CardDetailComponent } from './card-detail.component';
import { cardDetailsRes } from 'src/app/core/mock-data/platform-corporate-card-detail-data';
import { Component, Input } from '@angular/core';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { By } from '@angular/platform-browser';

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

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'dashboardOnIncompleteCardExpensesClick',
      'dashboardOnTotalCardExpensesClick',
    ]);
    TestBed.configureTestingModule({
      declarations: [CardDetailComponent, HumanizeCurrencyPipe, MaskNumber, MockCorporateCardComponent],
      imports: [IonicModule.forRoot(), RouterModule, RouterTestingModule],
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    component.cardDetail = cardDetailsRes[0];
    fixture.detectChanges();
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

      const queryParams = {
        filters: JSON.stringify({ state: ['DRAFT'], cardNumbers: [component.cardDetail.card.card_number] }),
      };

      component.goToExpensesPage('incompleteExpenses', component.cardDetail);
      expect(trackingService.dashboardOnIncompleteCardExpensesClick).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });
    });

    it('should go to expenses page and show filter DRAFT & READY_TO_REPORT expenses', () => {
      trackingService.dashboardOnTotalCardExpensesClick.and.callThrough();

      const queryParams = {
        filters: JSON.stringify({
          state: ['DRAFT,READY_TO_REPORT'],
          cardNumbers: [component.cardDetail.card.card_number],
        }),
      };

      component.goToExpensesPage('totalExpenses', component.cardDetail);
      expect(trackingService.dashboardOnTotalCardExpensesClick).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });
    });
  });
});
