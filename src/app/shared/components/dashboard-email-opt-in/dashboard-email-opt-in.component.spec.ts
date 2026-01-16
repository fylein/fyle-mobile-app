import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { DashboardEmailOptInComponent } from './dashboard-email-opt-in.component';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';

describe('DashboardEmailOptInComponent', () => {
  let component: DashboardEmailOptInComponent;
  let fixture: ComponentFixture<DashboardEmailOptInComponent>;
  let popoverControllerSpy: jasmine.SpyObj<PopoverController>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardEmailOptInComponent, getTranslocoTestingModule()],
      providers: [
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardEmailOptInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('emailOptInClick():', () => {
    it('should emit toggleEmailOptInBanner and navigate to my_profile', fakeAsync(() => {
      spyOn(component.toggleEmailOptInBanner, 'emit');

      component.emailOptInClick();
      tick();

      expect(component.toggleEmailOptInBanner.emit).toHaveBeenCalledOnceWith({ optedIn: true });
      expect(routerSpy.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_profile',
        {
          navigate_back: true,
          show_email_walkthrough: true,
        },
      ]);
    }));
  });

  describe('getSkipEmailOptInMessageBody():', () => {
    it('should return translated skip message', () => {
      const result = component.getSkipEmailOptInMessageBody();
      expect(result).toBeDefined();
    });
  });

  describe('skip():', () => {
    it('should stop event propagation and show popover', fakeAsync(() => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const mockPopover = {
        present: jasmine.createSpy('present').and.resolveTo(),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.resolveTo({ data: { action: 'cancel' } }),
      };
      popoverControllerSpy.create.and.resolveTo(mockPopover as any);

      component.skip(mockEvent);
      tick();

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(popoverControllerSpy.create).toHaveBeenCalled();
      expect(mockPopover.present).toHaveBeenCalled();
      expect(mockPopover.onWillDismiss).toHaveBeenCalled();
    }));

    it('should emit optedIn false when user confirms skip', fakeAsync(() => {
      spyOn(component.toggleEmailOptInBanner, 'emit');
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const mockPopover = {
        present: jasmine.createSpy('present').and.resolveTo(),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.resolveTo({ data: { action: 'continue' } }),
      };
      popoverControllerSpy.create.and.resolveTo(mockPopover as any);

      component.skip(mockEvent);
      tick();

      expect(component.toggleEmailOptInBanner.emit).toHaveBeenCalledOnceWith({ optedIn: false });
    }));

    it('should not emit when user cancels skip', fakeAsync(() => {
      spyOn(component.toggleEmailOptInBanner, 'emit');
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const mockPopover = {
        present: jasmine.createSpy('present').and.resolveTo(),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.resolveTo({ data: { action: 'cancel' } }),
      };
      popoverControllerSpy.create.and.resolveTo(mockPopover as any);

      component.skip(mockEvent);
      tick();

      expect(component.toggleEmailOptInBanner.emit).not.toHaveBeenCalled();
    }));

    it('should handle null data from popover dismiss', fakeAsync(() => {
      spyOn(component.toggleEmailOptInBanner, 'emit');
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const mockPopover = {
        present: jasmine.createSpy('present').and.resolveTo(),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.resolveTo({ data: null }),
      };
      popoverControllerSpy.create.and.resolveTo(mockPopover as any);

      component.skip(mockEvent);
      tick();

      expect(component.toggleEmailOptInBanner.emit).not.toHaveBeenCalled();
    }));
  });
});
