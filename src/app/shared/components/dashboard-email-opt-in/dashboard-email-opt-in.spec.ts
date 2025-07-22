import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { DashboardEmailOptInComponent } from './dashboard-email-opt-in.component';
import { TrackingService } from 'src/app/core/services/tracking.service';

describe('DashboardEmailOptInComponent', () => {
  let component: DashboardEmailOptInComponent;
  let fixture: ComponentFixture<DashboardEmailOptInComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let router: jasmine.SpyObj<Router>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService');
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });

    TestBed.configureTestingModule({
      declarations: [DashboardEmailOptInComponent],
      imports: [IonicModule.forRoot(), TranslocoModule],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardEmailOptInComponent);
    component = fixture.componentInstance;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;

    translocoService.translate.and.callFake((key: any) => {
      const translations: { [key: string]: string } = {
        'dashboardEmailOptIn.skipEmailOptInMessage':
          "<div>\n              <p>You won't receive email updates about your expense status if you don't opt in.</p>\n              <p>Are you sure you want to skip?<p>  \n            </div>",
        'dashboardEmailOptIn.areYouSure': 'Are you sure?',
        'dashboardEmailOptIn.yesSkipEmailOptIn': 'Yes, skip opt in',
        'dashboardEmailOptIn.noGoBack': 'No, go back',
      };
      return translations[key] || key;
    });

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('emailOptInClick()', () => {
    beforeEach(() => {
      spyOn(component.toggleEmailOptInBanner, 'emit');
    });

    it('should call tracking service, emit toggleEmailOptInBanner with optedIn true, and navigate to profile', async () => {
      await component.emailOptInClick();

      expect(component.toggleEmailOptInBanner.emit).toHaveBeenCalledWith({ optedIn: true });
      expect(router.navigate).toHaveBeenCalledWith([
        '/',
        'enterprise',
        'my_profile',
        {
          navigate_back: true,
          show_email_walkthrough: true,
        },
      ]);
    });
  });

  describe('getSkipEmailOptInMessageBody()', () => {
    it('should return translated skip email opt in message', () => {
      const result = component.getSkipEmailOptInMessageBody();

      expect(translocoService.translate).toHaveBeenCalledWith('dashboardEmailOptIn.skipEmailOptInMessage');
      expect(result).toBe(
        "<div>\n              <p>You won't receive email updates about your expense status if you don't opt in.</p>\n              <p>Are you sure you want to skip?<p>  \n            </div>"
      );
    });
  });

  describe('skip()', () => {
    let mockEvent: Event;

    beforeEach(() => {
      mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      spyOn(component.toggleEmailOptInBanner, 'emit');
    });

    it('should show popover and emit toggleEmailOptInBanner with optedIn false when user confirms skip', async () => {
      const popover = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.resolveTo(popover);
      popover.onWillDismiss.and.resolveTo({ data: { action: 'continue' } });

      await component.skip(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(popoverController.create).toHaveBeenCalledWith({
        component: jasmine.any(Function),
        componentProps: {
          title: 'Are you sure?',
          message:
            "<div>\n              <p>You won't receive email updates about your expense status if you don't opt in.</p>\n              <p>Are you sure you want to skip?<p>  \n            </div>",
          primaryCta: {
            text: 'Yes, skip opt in',
            action: 'continue',
          },
          secondaryCta: {
            text: 'No, go back',
            action: 'cancel',
          },
          leftAlign: true,
        },
        cssClass: 'skip-opt-in-popover',
      });
      expect(popover.present).toHaveBeenCalledTimes(1);
      expect(component.toggleEmailOptInBanner.emit).toHaveBeenCalledWith({ optedIn: false });
    });

    it('should show popover but not emit toggleEmailOptInBanner when user cancels skip', async () => {
      const popover = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.resolveTo(popover);
      popover.onWillDismiss.and.resolveTo({ data: { action: 'cancel' } });

      await component.skip(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(popover.present).toHaveBeenCalledTimes(1);
      expect(component.toggleEmailOptInBanner.emit).not.toHaveBeenCalled();
    });

    it('should show popover but not emit toggleEmailOptInBanner when no data is returned', async () => {
      const popover = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.resolveTo(popover);
      popover.onWillDismiss.and.resolveTo({});

      await component.skip(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(popover.present).toHaveBeenCalledTimes(1);
      expect(component.toggleEmailOptInBanner.emit).not.toHaveBeenCalled();
    });
  });
});
