import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular/standalone';
import { RebrandingPopupComponent } from './rebranding-popup.component';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RebrandingPopupComponent', () => {
  let component: RebrandingPopupComponent;
  let fixture: ComponentFixture<RebrandingPopupComponent>;
  let popoverControllerSpy: jasmine.SpyObj<PopoverController>;
  let trackingServiceSpy: jasmine.SpyObj<TrackingService>;

  beforeEach(waitForAsync(() => {
    const popoverSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const trackingSpy = jasmine.createSpyObj('TrackingService', [
      'clickedOnRebrandingLearnMore',
      'clickedOnRebrandingOk',
    ]);

    TestBed.configureTestingModule({
      imports: [
        RebrandingPopupComponent,
        getTranslocoTestingModule(),
        MatIconTestingModule,
      ],
      providers: [
        { provide: PopoverController, useValue: popoverSpy },
        { provide: TrackingService, useValue: trackingSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RebrandingPopupComponent);
    component = fixture.componentInstance;
    popoverControllerSpy = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    trackingServiceSpy = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;

    popoverControllerSpy.dismiss.and.resolveTo();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onLearnMoreClick(): should track and open URL', () => {
    const openSpy = spyOn(window, 'open').and.returnValue(null);

    component.onLearnMoreClick();

    expect(trackingServiceSpy.clickedOnRebrandingLearnMore).toHaveBeenCalledOnceWith();
    expect(openSpy).toHaveBeenCalledWith(jasmine.stringContaining('fylehq.com'), '_blank');
  });

  it('onOkClick(): should track, dismiss, and emit', async () => {
    const emitSpy = spyOn(component.popupDismissed, 'emit');

    await component.onOkClick();

    expect(trackingServiceSpy.clickedOnRebrandingOk).toHaveBeenCalledOnceWith();
    expect(popoverControllerSpy.dismiss).toHaveBeenCalledOnceWith();
    expect(emitSpy).toHaveBeenCalledOnceWith();
  });
});