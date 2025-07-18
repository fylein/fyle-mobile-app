import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MatRippleModule } from '@angular/material/core';
import { TeamAdvCardComponent } from './team-adv-card.component';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { EllipsisPipe } from 'src/app/shared/pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ExactCurrencyPipe } from 'src/app/shared/pipes/exact-currency.pipe';
import { extendedAdvReqDraft } from 'src/app/core/mock-data/extended-advance-request.data';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('TeamAdvCardComponent', () => {
  let teamAdvCardComponent: TeamAdvCardComponent;
  let fixture: ComponentFixture<TeamAdvCardComponent>;
  let advanceRequestServiceSpy: jasmine.SpyObj<AdvanceRequestService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const fyCurrencyPipeSpy = jasmine.createSpyObj('FyCurrencyPipe', ['transform']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', ['getInternalStateAndDisplayName']);

    advanceRequestServiceSpy.getInternalStateAndDisplayName.and.returnValue({
      state: 'inquiry',
      name: 'Sent Back',
    });

    TestBed.configureTestingModule({
      declarations: [TeamAdvCardComponent, HumanizeCurrencyPipe, ExactCurrencyPipe, EllipsisPipe, FyCurrencyPipe],
      imports: [IonicModule.forRoot(), MatRippleModule, TranslocoModule],
      providers: [
        { provide: AdvanceRequestService, useValue: advanceRequestServiceSpy },
        {
          provide: FyCurrencyPipe,
          useValue: fyCurrencyPipeSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamAdvCardComponent);
    teamAdvCardComponent = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'teamAdvCard.approvedDate': 'Approved date',
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
    teamAdvCardComponent.advanceRequest = {
      ...extendedAdvReqDraft,
      areq_created_at: new Date('2023-01-16T06:22:47.058Z'),
      areq_currency: 'USD',
    };
    teamAdvCardComponent.internalState = {
      state: 'inquiry',
      name: 'Sent Back',
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(teamAdvCardComponent).toBeTruthy();
  });

  describe('OnInit():', () => {
    it('should set showDate to false when advanceRequest was created on the same day as prevDate', () => {
      teamAdvCardComponent.prevDate = new Date('2023-01-16T06:22:47.058Z');
      fixture.detectChanges();
      teamAdvCardComponent.ngOnInit();
      expect(teamAdvCardComponent.currencySymbol).toEqual('$'); // Assuming USD is the currency code
      expect(teamAdvCardComponent.showDate).toBeTrue();
      expect(advanceRequestServiceSpy.getInternalStateAndDisplayName).toHaveBeenCalledWith(
        teamAdvCardComponent.advanceRequest
      );
      expect(advanceRequestServiceSpy.getInternalStateAndDisplayName).toHaveBeenCalledTimes(2);
      expect(teamAdvCardComponent.internalState).toEqual({ state: 'inquiry', name: 'Sent Back' });
    });
  });

  it('should emit an event when onGoToAdvances() is called', () => {
    spyOn(teamAdvCardComponent.gotoAdvance, 'emit');
    teamAdvCardComponent.onGoToAdvances();
    expect(teamAdvCardComponent.gotoAdvance.emit).toHaveBeenCalledOnceWith(teamAdvCardComponent.advanceRequest);
  });
});
