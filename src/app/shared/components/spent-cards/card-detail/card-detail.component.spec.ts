import { CurrencyPipe } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { expectedUniqueCardStats } from 'src/app/core/mock-data/unique-cards-stats.data';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { CardDetailComponent } from './card-detail.component';

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
      declarations: [CardDetailComponent, HumanizeCurrencyPipe, MaskNumber],
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
    component.cardDetail = expectedUniqueCardStats[0];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check if information is displayed correctly', () => {
    expect(getTextContent(getElementBySelector(fixture, '.stats--ccc-bank-name'))).toEqual('DAMNA');
    expect(getTextContent(getElementBySelector(fixture, '.stats--ccc-account-info__mask'))).toEqual('****8698');
    expect(getTextContent(getElementBySelector(fixture, '.stats--ccc-classified-count'))).toEqual('964');
    expect(getTextContent(getElementBySelector(fixture, '.stats--ccc-stats-title'))).toEqual(
      'Incomplete Card Expenses'
    );
  });

  describe('goToExpensesPage():', () => {
    it('should go to expenses page and show filter DRAFT expenses', () => {
      trackingService.dashboardOnIncompleteCardExpensesClick.and.callThrough();

      const queryParams = {
        filters: JSON.stringify({ state: ['DRAFT'], cardNumbers: [component.cardDetail.cardNumber] }),
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
        filters: JSON.stringify({ state: ['DRAFT,READY_TO_REPORT'], cardNumbers: [component.cardDetail.cardNumber] }),
      };

      component.goToExpensesPage('totalExpenses', component.cardDetail);
      expect(trackingService.dashboardOnTotalCardExpensesClick).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });
    });
  });
});
