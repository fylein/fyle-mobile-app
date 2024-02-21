import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MatSnackBarModule, MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { ToastMessageComponent } from './toast-message.component';
import { MatIconModule } from '@angular/material/icon';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('ToastMessageComponent', () => {
  let toastMessageComponent: ToastMessageComponent;
  let fixture: ComponentFixture<ToastMessageComponent>;
  let snackbarRefSpy: jasmine.SpyObj<MatSnackBarRef<ToastMessageComponent>>;

  beforeEach(waitForAsync(() => {
    snackbarRefSpy = jasmine.createSpyObj('MatSnackBarRef', ['dismiss', 'dismissWithAction']);

    TestBed.configureTestingModule({
      declarations: [ToastMessageComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatSnackBarModule, MatIconTestingModule],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: {} },
        { provide: MatSnackBarRef, useValue: snackbarRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastMessageComponent);
    toastMessageComponent = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(toastMessageComponent).toBeTruthy();
  });

  it('should display message', () => {
    const message = 'Test message';
    toastMessageComponent.data = {
      icon: 'danger-fill',
      message: 'Test message',
      redirectionText: null,
      showCloseButton: false,
    };
    fixture.detectChanges();
    const element = getElementBySelector(fixture, '.toast-message--body');
    expect(getTextContent(element)).toContain(message);
  });

  it('should not display redirection text if not provided', () => {
    toastMessageComponent.data.redirectionText = '';
    fixture.detectChanges();
    const redirectionEl = getElementBySelector(fixture, '.toast-message--redirection');
    expect(redirectionEl).toBeNull();
  });

  it('should dismiss the snackbar with action on redirection text click', () => {
    toastMessageComponent.data = {
      icon: '',
      message: '',
      redirectionText: 'Go to home',
      showCloseButton: false,
    };
    fixture.detectChanges();

    const redirectionEl = getElementBySelector(fixture, '.toast-message--redirection') as HTMLElement;
    expect(redirectionEl).toBeTruthy();
    click(redirectionEl);
    expect(snackbarRefSpy.dismissWithAction).toHaveBeenCalledTimes(1);
  });

  it('should dismiss the snackbar on close button click', () => {
    toastMessageComponent.data = {
      icon: '',
      message: '',
      redirectionText: '',
      showCloseButton: true,
    };
    fixture.detectChanges();

    const closeButtonEl = getElementBySelector(fixture, '.toast-message--right-icon') as HTMLElement;
    expect(closeButtonEl).toBeTruthy();
    click(closeButtonEl);
    expect(snackbarRefSpy.dismiss).toHaveBeenCalledTimes(1);
  });
});
