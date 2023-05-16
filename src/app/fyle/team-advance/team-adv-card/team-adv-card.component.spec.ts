import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MatRippleModule } from '@angular/material/core';
import { TeamAdvCardComponent } from './team-adv-card.component';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { EllipsisPipe } from 'src/app/shared/pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { extendedAdvReqDraft } from 'src/app/core/mock-data/extended-advance-request.data';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';

describe('TeamAdvCardComponent', () => {
  let teamAdvCardComponent: TeamAdvCardComponent;
  let fixture: ComponentFixture<TeamAdvCardComponent>;
  let advanceRequestServiceSpy: jasmine.SpyObj<AdvanceRequestService>;

  beforeEach(waitForAsync(() => {
    advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', ['getInternalStateAndDisplayName']);

    advanceRequestServiceSpy.getInternalStateAndDisplayName.and.returnValue({
      state: 'inquiry',
      name: 'Sent Back',
    });

    TestBed.configureTestingModule({
      declarations: [TeamAdvCardComponent, HumanizeCurrencyPipe, EllipsisPipe],
      imports: [IonicModule.forRoot(), MatRippleModule],
      providers: [{ provide: AdvanceRequestService, useValue: advanceRequestServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamAdvCardComponent);
    teamAdvCardComponent = fixture.componentInstance;
    teamAdvCardComponent.advanceRequest = extendedAdvReqDraft;
    teamAdvCardComponent.advanceRequest = { areq_currency: 'USD' } as ExtendedAdvanceRequest;
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
      expect(teamAdvCardComponent.showDate).toBeFalse();
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
