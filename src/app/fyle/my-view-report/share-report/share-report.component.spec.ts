import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { FormsModule } from '@angular/forms';
import { getElementBySelector, getElementByTagName } from 'src/app/core/dom-helpers';
import { ShareReportComponent } from './share-report.component';
import { of } from 'rxjs';
import { getTranslocoModule } from 'src/app/core/testing/transloco-testing.utils';

describe('ShareReportComponent', () => {
  let component: ShareReportComponent;
  let fixture: ComponentFixture<ShareReportComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    modalController = jasmine.createSpyObj('ModalController', ['dismiss']);
    TestBed.configureTestingModule({
      declarations: [ShareReportComponent],
      imports: [IonicModule.forRoot(), FormsModule, MatIconModule, MatIconTestingModule, getTranslocoModule()],
      providers: [{ provide: ModalController, useValue: modalController }],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dismiss the popover when cancel is clicked', async () => {
    modalController.dismiss.and.resolveTo(true);
    await component.cancel();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('should dismiss the modal and return the email value when the email input field is valid', async () => {
    component.email = 'johnD@fyle.in';
    component.shareReport({ value: 'johnD@fyle.in', valid: true, control: { markAllAsTouched: () => {} } });
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ email: 'johnD@fyle.in' });
  });

  it('should do nothing when the email input field is empty or invalid', async () => {
    modalController.dismiss.and.resolveTo(true);

    component.shareReport({ value: '', invalid: false, control: { markAllAsTouched: () => {} } });
    expect(modalController.dismiss).not.toHaveBeenCalled();

    component.shareReport({ value: 'invalid_email', invalid: true, control: { markAllAsTouched: () => {} } });
    expect(modalController.dismiss).not.toHaveBeenCalled();
  });

  it('should dismiss the modal and return the email value when the email input field is valid', async () => {
    modalController.dismiss.and.resolveTo(true);

    component.email = 'johnD@fyle.in';
    const emailInput = {
      value: 'johnD@fyle.in',
      valid: true,
      invalid: false,
      control: {
        markAllAsTouched: () => {},
      },
    };

    fixture.detectChanges();
    await component.shareReport(emailInput);
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ email: 'johnD@fyle.in' });
  });

  it('should set focus on email input field', fakeAsync(() => {
    const emailInputField = getElementByTagName(fixture, 'input') as HTMLInputElement;
    spyOn(emailInputField, 'focus');
    component.ngAfterViewInit();
    tick(600);
    expect(emailInputField.focus).toHaveBeenCalled();
  }));

  xit('should disable the "Share" button when the email input field is empty', () => {
    const emailInput = {
      value: '',
      valid: true,
      invalid: false,
      control: {
        markAllAsTouched: () => {},
      },
    };
    component.email = '';
    fixture.detectChanges();
    const shareButton = getElementBySelector(fixture, '.share-report--toolbar__btn-share') as HTMLButtonElement;
    component.shareReport(emailInput);
    expect(shareButton.disabled).toBeTruthy();
  });

  it('should call markAllAsTouched when the email input is not valid', async () => {
    const emailInput = {
      value: 'invalid email',
      valid: false,
      control: {
        markAllAsTouched: () => {},
      },
    };

    spyOn(emailInput.control, 'markAllAsTouched').and.callThrough();
    await component.shareReport(emailInput);
    expect(emailInput.control.markAllAsTouched).toHaveBeenCalledTimes(1);
  });
});
