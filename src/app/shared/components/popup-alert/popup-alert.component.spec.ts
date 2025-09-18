import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular/standalone';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';
import { FyAlertInfoComponent } from '../fy-alert-info/fy-alert-info.component';
import { PopupAlertComponent } from './popup-alert.component';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';

describe('PopupAlertComponent', () => {
  let component: PopupAlertComponent;
  let fixture: ComponentFixture<PopupAlertComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    TestBed.configureTestingModule({
      imports: [getTranslocoTestingModule(), PopupAlertComponent, FyAlertInfoComponent],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupAlertComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    component = fixture.componentInstance;
    component.primaryCta = {
      text: 'Test Primary CTA',
      action: 'Success',
      type: 'alert',
    };
    component.secondaryCta = {
      text: 'Test Secondary CTA',
      action: 'Cancel',
      type: 'secondary',
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ctaClickedEvent():', () => {
    it('should dismiss popover with action when primary cta is clicked', () => {
      const primaryCtaEl = getElementBySelector(fixture, '.popup-alert--primary-cta') as HTMLButtonElement;
      click(primaryCtaEl);
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({
        action: 'Success',
      });
    });

    it('should dismiss popover with action when secondary cta is clicked', () => {
      const secondaryCtaEl = getElementBySelector(fixture, '.popup-alert--secondary-cta') as HTMLButtonElement;
      click(secondaryCtaEl);
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({
        action: 'Cancel',
      });
    });
  });
});
