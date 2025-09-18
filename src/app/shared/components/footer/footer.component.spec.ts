import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { FooterComponent } from './footer.component';
import { NetworkService } from 'src/app/core/services/network.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ConnectionMessageStatus } from '../fy-connection/connection-status.enum';
import { FooterState } from './footer-state.enum';
import { of } from 'rxjs';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';

describe('FooterComponent', () => {
  let footerComponent: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let networkServiceSpy: jasmine.SpyObj<NetworkService>;
  let trackingServiceSpy: jasmine.SpyObj<TrackingService>;
  let routerSpy: jasmine.SpyObj<Router>;
  beforeEach(waitForAsync(() => {
    networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'getConnectionStatus']);

    trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['footerButtonClicked']);
    routerSpy = jasmine.createSpyObj('Router', ['url']);

    TestBed.configureTestingModule({
      imports: [
        MatIconTestingModule,
        getTranslocoTestingModule(),
        FooterComponent,
      ],
      providers: [
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    footerComponent = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(footerComponent).toBeTruthy();
  });

  it('get ConnectionMessageStatus(): should return correct ConnectionMessageStatus', () => {
    expect(footerComponent.ConnectionMessageStatus).toEqual(ConnectionMessageStatus);
  });

  it('get FooterState(): should return correct FooterState', () => {
    expect(footerComponent.FooterState).toEqual(FooterState);
  });

  it('should set connectionState$ to the result of getConnectionStatus()', () => {
    const expectedStatus = ConnectionMessageStatus.onlineMessageShown;
    const connectionStatus$ = of(expectedStatus);
    networkServiceSpy.getConnectionStatus.and.returnValue(connectionStatus$);
    footerComponent.ngOnInit();
    expect(networkServiceSpy.getConnectionStatus).toHaveBeenCalledTimes(2);
    expect(footerComponent.connectionState$).toBe(connectionStatus$);
  });

  describe('goToHome():', () => {
    it('should emit homeClicked event on clicking home icon', () => {
      fixture.detectChanges();
      const homeClickedSpy = spyOn(footerComponent.homeClicked, 'emit');
      footerComponent.goToHome();
      expect(homeClickedSpy).toHaveBeenCalledTimes(1);
      expect(trackingServiceSpy.footerButtonClicked).toHaveBeenCalledOnceWith({ Action: 'Home', Url: routerSpy.url });
    });

    it('should navigate to the home page with tasks state if the active state is not HOME', () => {
      footerComponent.activeState = FooterState.TASKS;
      fixture.detectChanges();
      footerComponent.goToHome();
      expect(trackingServiceSpy.footerButtonClicked).toHaveBeenCalledOnceWith({ Action: 'Home', Url: routerSpy.url });
    });

    it('should not navigate if the active state is already HOME', () => {
      footerComponent.activeState = FooterState.HOME;
      fixture.detectChanges();
      footerComponent.goToHome();
      expect(trackingServiceSpy.footerButtonClicked).toHaveBeenCalledOnceWith({ Action: 'Home', Url: routerSpy.url });
    });
  });

  it('goToCameraMode(): should emit cameraClicked event on clicking camera icon', () => {
    fixture.detectChanges();
    const cameraModeSpy = spyOn(footerComponent.cameraClicked, 'emit');
    footerComponent.goToCameraMode();
    expect(cameraModeSpy).toHaveBeenCalledTimes(1);
    expect(trackingServiceSpy.footerButtonClicked).toHaveBeenCalledOnceWith({ Action: 'Camera', Url: routerSpy.url });
  });

  it('goToExpenses(): should emit expensesClicked event on clicking expenses icon', () => {
    fixture.detectChanges();
    const expensesSpy = spyOn(footerComponent.expensesClicked, 'emit');
    footerComponent.goToExpenses();
    expect(expensesSpy).toHaveBeenCalledTimes(1);
    expect(trackingServiceSpy.footerButtonClicked).toHaveBeenCalledOnceWith({ Action: 'Expenses', Url: routerSpy.url });
  });

  it('goToReports(): should emit reportsClicked event on clicking reports icon', () => {
    fixture.detectChanges();
    const reportsSpy = spyOn(footerComponent.reportsClicked, 'emit');
    footerComponent.goToReports();
    expect(reportsSpy).toHaveBeenCalledTimes(1);
    expect(trackingServiceSpy.footerButtonClicked).toHaveBeenCalledOnceWith({ Action: 'Reports', Url: routerSpy.url });
  });

  describe('goToTasks():', () => {
    it('should emit taskClicked event when connectionState is not disconnected', () => {
      const connectionState = ConnectionMessageStatus.onlineMessageShown;

      footerComponent.activeState = FooterState.TASKS;
      fixture.detectChanges();
      footerComponent.taskCount = 3;
      footerComponent.goToTasks(connectionState);

      expect(trackingServiceSpy.footerButtonClicked).toHaveBeenCalledOnceWith({
        Action: 'Tasks',
        Url: routerSpy.url,
      });
    });

    it('should disable task click when there are no tasks and the connection status is disconnected', () => {
      const connectionState = ConnectionMessageStatus.disconnected;

      footerComponent.activeState = FooterState.TASKS;
      fixture.detectChanges();
      footerComponent.taskCount = 0;
      footerComponent.goToTasks(connectionState);
      expect(trackingServiceSpy.footerButtonClicked).not.toHaveBeenCalled();
    });

    it('should display the task count in the pill when there are tasks', () => {
      const mockConnectionState = ConnectionMessageStatus.onlineMessageShown;
      const mockTaskCount = 2;
      footerComponent.connectionState$ = of(mockConnectionState);
      footerComponent.taskCount = mockTaskCount;
      fixture.detectChanges();
      const pill = getElementBySelector(fixture, '.fy-footer--icon-pill');
      expect(pill).toBeTruthy();
      expect(getTextContent(pill)).toEqual(`${mockTaskCount}`);
    });
  });
});
