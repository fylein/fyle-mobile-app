import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule, PopoverController } from '@ionic/angular';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';
import { FyAlertInfoComponent } from '../fy-alert-info/fy-alert-info.component';
import { PopupAlertComponent } from './popup-alert.component';
import { of } from 'rxjs';

describe('PopupAlertComponent', () => {
  let component: PopupAlertComponent;
  let fixture: ComponentFixture<PopupAlertComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    translocoServiceSpy.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'popupAlert.successfullyConnected': 'Successfully connected',
        'popupAlert.failedConnecting': 'Failed connecting',
        'popupAlert.reportViolations': 'This report has {{count}} violations',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TranslocoModule, PopupAlertComponent, FyAlertInfoComponent],
    providers: [
        {
            provide: PopoverController,
            useValue: popoverControllerSpy,
        },
        { provide: TranslocoService, useValue: translocoServiceSpy },
    ],
}).compileComponents();

    fixture = TestBed.createComponent(PopupAlertComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
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
