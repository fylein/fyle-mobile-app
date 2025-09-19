import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ModalController, PopoverController } from '@ionic/angular/standalone';

import { DashboardOptInComponent } from './dashboard-opt-in.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { of } from 'rxjs';
import { MatIconTestingModule } from '@angular/material/icon/testing';
describe('DashboardOptInComponent', () => {
  let component: DashboardOptInComponent;
  let fixture: ComponentFixture<DashboardOptInComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss', 'onWillDismiss']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['clickedOnDashboardBanner']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [TranslocoModule, DashboardOptInComponent,
        MatIconTestingModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardOptInComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'dashboardOptIn.skipOptInMessage':
          "<div>\n              <p>You can't send receipts and expense details via text message if you don't opt-in.</p>\n              <p>Are you sure you want to skip?<p>  \n            </div>",
        'dashboardOptIn.areYouSure': 'Are you sure?',
        'dashboardOptIn.yesSkipOptIn': 'Yes, skip opt-in',
        'dashboardOptIn.noGoBack': 'No, go back',
        'dashboardOptIn.skip': 'Skip',
        'dashboardOptIn.altOptInToTextReceipts': 'Opt-in to text receipts',
        'dashboardOptIn.tryAI': 'Try AI',
        'dashboardOptIn.description':
          'Text receipts for <span class="dashboard-opt-in__instant-text-decoration">instant</span>\n      <span class="dashboard-opt-in__underline"></span> expense submission',
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
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('optInClick()', () => {
    beforeEach(() => {
      spyOn(component.toggleOptInBanner, 'emit');
    });

    it('should dismiss modal on optInClick with skipOptIn as false if user opted-in', async () => {
      const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
      modalController.create.and.resolveTo(modal);
      modal.onWillDismiss.and.resolveTo({ data: { action: 'SUCCESS' } });

      await component.optInClick();
      expect(trackingService.clickedOnDashboardBanner).toHaveBeenCalledTimes(1);
      expect(component.toggleOptInBanner.emit).toHaveBeenCalledWith({ optedIn: true });
    });

    it('should dismiss modal on optInClick with skipOptIn as true if user has not opted-in', async () => {
      const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
      modalController.create.and.resolveTo(modal);
      modal.onWillDismiss.and.resolveTo({});

      await component.optInClick();
      expect(trackingService.clickedOnDashboardBanner).toHaveBeenCalledTimes(1);
      expect(component.toggleOptInBanner.emit).not.toHaveBeenCalled();
    });
  });

  it('skip(): should show popover and emit toggleOptInBanner with false', async () => {
    const popover = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
    popoverController.create.and.resolveTo(popover);
    popover.onWillDismiss.and.resolveTo({ data: { action: 'continue' } });
    spyOn(component.toggleOptInBanner, 'emit');

    await component.skip(new Event('click'));
    expect(popover.present).toHaveBeenCalledTimes(1);
    expect(component.toggleOptInBanner.emit).toHaveBeenCalledWith({ optedIn: false });
  });
});
