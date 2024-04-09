import { CurrencyPipe, DatePipe } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { extendedAdvReqDraft } from 'src/app/core/mock-data/extended-advance-request.data';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { EllipsisPipe } from 'src/app/shared/pipes/ellipses.pipe';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { MyAdvancesCardComponent } from './my-advances-card.component';
import * as dayjs from 'dayjs';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { advanceRequests } from 'src/app/core/mock-data/advance-requests.data';

describe('MyAdvancesCardComponent', () => {
  let component: MyAdvancesCardComponent;
  let fixture: ComponentFixture<MyAdvancesCardComponent>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;

  beforeEach(waitForAsync(() => {
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', ['getInternalStateAndDisplayName']);
    TestBed.configureTestingModule({
      declarations: [MyAdvancesCardComponent, EllipsisPipe, HumanizeCurrencyPipe, DatePipe],
      imports: [IonicModule.forRoot()],
      providers: [
        FyCurrencyPipe,
        CurrencyPipe,
        {
          provide: AdvanceRequestService,
          useValue: advanceRequestServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyAdvancesCardComponent);
    component = fixture.componentInstance;
    advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
    component.advanceRequest = extendedAdvReqDraft;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('change show date if previous date is provided', () => {
    component.prevDate = new Date('2023-01-16T06:22:47.058Z');
    component.advanceRequest = advanceRequests;
    fixture.detectChanges();

    component.ngOnInit();
    expect(component.showDate).toEqual(dayjs(component.advanceRequest.created_at).isSame(component.prevDate, 'day'));
    expect(getTextContent(getElementBySelector(fixture, '.advance-card--date'))).toEqual('Feb 23, 2023');
  });

  it('should check if advance request information is displayed', () => {
    component.advanceRequest = advanceRequests;
    fixture.detectChanges();
    expect(getTextContent(getElementBySelector(fixture, '.advance-card--date'))).toEqual('Feb 23, 2023');
    expect(getTextContent(getElementBySelector(fixture, '.advance-card--purpose'))).toEqual('some');
    expect(getTextContent(getElementBySelector(fixture, '.advance-card--amount'))).toEqual('150.00');
    expect(getTextContent(getElementBySelector(fixture, '.advance-card--approval'))).toEqual('');
    expect(getTextContent(getElementBySelector(fixture, '.state-pill'))).toEqual('Paid');
  });

  it('should emit advance when click on the card', () => {
    const onAdvanceClickSpy = spyOn(component, 'onAdvanceClick');

    const advanceCard = getElementBySelector(fixture, '.advance-card') as HTMLElement;
    click(advanceCard);
    expect(onAdvanceClickSpy).toHaveBeenCalledTimes(1);
  });

  it('onAdvanceClick():should emit event when click on advance', () => {
    spyOn(component.advanceClick, 'emit');
    const internalState = {
      state: 'paid',
      name: 'Paid',
    };
    fixture.detectChanges();

    component.onAdvanceClick();
    expect(component.advanceClick.emit).toHaveBeenCalledOnceWith({
      advanceRequest: extendedAdvReqDraft,
      internalState,
    });
  });
});
