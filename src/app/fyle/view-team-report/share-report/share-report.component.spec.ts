import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { MatRippleModule } from '@angular/material/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { FormsModule } from '@angular/forms';
import { ShareReportComponent } from './share-report.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('ShareReportComponent', () => {
  let component: ShareReportComponent;
  let fixture: ComponentFixture<ShareReportComponent>;
  let popoverControllerSpy: PopoverController;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [ShareReportComponent],
      imports: [IonicModule.forRoot(), MatRippleModule, FormsModule, TranslocoModule],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'shareReport.title': 'Share report',
        'shareReport.cancel': 'Cancel',
        'shareReport.details': 'Share report via email.',
        'shareReport.emailPlaceholder': 'Email ID',
        'shareReport.invalidEmail': 'Please enter a valid email',
        'shareReport.ctaButton': 'Pull back',
        'shareReport.share': 'Share',
        'shareReport.shareWith': 'Share report with',
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
    fixture = TestBed.createComponent(ShareReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title and details', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const shareReportTitle = getElementBySelector(fixture, '.share-report--title');
    expect(getTextContent(shareReportTitle)).toContain('Share report');
    const shareReportDesc = getAllElementsBySelector(fixture, '.share-report--details');
    expect(getTextContent(shareReportDesc[0])).toContain('Share report via email.');
  }));

  it('should dismiss the popover when cancel is clicked', async () => {
    await component.cancel();
    expect(popoverControllerSpy.dismiss).toHaveBeenCalledTimes(1);
  });

  it('should dismiss the popover with email when there is a valid email input', async () => {
    component.email = 'johnD@fyle.in';
    const emailInput = { valid: true, control: { markAllAsTouched: () => {} } };
    await component.shareReport(emailInput);
    expect(popoverControllerSpy.dismiss).toHaveBeenCalledOnceWith({ email: 'johnD@fyle.in' });
  });

  it('should mark all controls as touched when there is an invalid email input', async () => {
    const emailInput = { valid: false, control: { markAllAsTouched: () => {} } };
    spyOn(emailInput.control, 'markAllAsTouched').and.callThrough();
    await component.shareReport(emailInput);
    expect(emailInput.control.markAllAsTouched).toHaveBeenCalledTimes(1);
  });

  it('should disable the "Pull Back" button when email is empty', () => {
    const pullBackBtn = getElementBySelector(fixture, '.share-report--primary-cta button') as HTMLButtonElement;
    expect(pullBackBtn.disabled).toBeTrue();
  });

  it('should enable the "Pull Back" button when email is not empty', () => {
    const pullBackBtn = getElementBySelector(fixture, '.share-report--primary-cta button') as HTMLButtonElement;
    component.email = 'test@example.com';
    fixture.detectChanges();
    expect(pullBackBtn.disabled).toBeFalse();
  });
});
