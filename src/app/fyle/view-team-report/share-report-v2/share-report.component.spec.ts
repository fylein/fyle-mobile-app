import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatRippleModule } from '@angular/material/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { click, getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { FormsModule } from '@angular/forms';
import { ShareReportV2Component } from './share-report.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ShareReportComponent', () => {
  let component: ShareReportV2Component;
  let fixture: ComponentFixture<ShareReportV2Component>;
  let popoverControllerSpy: PopoverController;

  beforeEach(waitForAsync(() => {
    popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    TestBed.configureTestingModule({
      declarations: [ShareReportV2Component],
      imports: [IonicModule.forRoot(), MatRippleModule, FormsModule],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareReportV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title and details', () => {
    const shareReportTitle = getElementBySelector(fixture, '.share-report--title');
    expect(getTextContent(shareReportTitle)).toContain('Share Report');
    const shareReportDesc = getAllElementsBySelector(fixture, '.share-report--details');
    expect(getTextContent(shareReportDesc[0])).toContain('Share report via email.');
  });

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
