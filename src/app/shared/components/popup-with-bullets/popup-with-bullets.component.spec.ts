import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { PopupWithBulletsComponent } from './popup-with-bullets.component';
import { By } from '@angular/platform-browser';
import { ToastMessageComponent } from '../toast-message/toast-message.component';

describe('PopupWithBulletsComponent', () => {
  let component: PopupWithBulletsComponent;
  let fixture: ComponentFixture<PopupWithBulletsComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let clipboardService: jasmine.SpyObj<ClipboardService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;

  beforeEach(waitForAsync(() => {
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const clipboardServiceSpy = jasmine.createSpyObj('ClipboardService', ['writeString']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [PopupWithBulletsComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: ClipboardService,
          useValue: clipboardServiceSpy,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PopupWithBulletsComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    clipboardService = TestBed.inject(ClipboardService) as jasmine.SpyObj<ClipboardService>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    component.title = 'Verification Successful';
    component.listHeader = 'Now you can:';
    component.listItems = [
      {
        icon: 'envelope',
        text: 'Message your receipts to Fyle at (302) 440-2921 and we will create an expense for you.',
        textToCopy: '(302) 440-2921',
      },
    ];
    component.ctaText = 'Got it';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dimissPopover(): should dismiss popover', () => {
    spyOn(component, 'dismissPopover').and.callThrough();
    popoverController.dismiss.and.resolveTo();

    const dismissCta = fixture.debugElement.query(By.css('.popup-with-bullets__cta'));
    dismissCta.nativeElement.click();

    expect(component.dismissPopover).toHaveBeenCalledOnceWith();
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith();
  });

  it('copyToClipboard(): Should copy content to clipboard and show toast message', () => {
    clipboardService.writeString.and.resolveTo();
    spyOn(component, 'copyToClipboard').and.callThrough();
    spyOn(component, 'showToastMessage');

    const infoCard = fixture.debugElement.query(By.css('.popup-with-bullets__list-item__copy-text'));
    infoCard.nativeElement.click();

    expect(component.copyToClipboard).toHaveBeenCalledOnceWith(component.listItems[0].textToCopy);
    expect(clipboardService.writeString).toHaveBeenCalledOnceWith(component.listItems[0].textToCopy);
    expect(component.showToastMessage).toHaveBeenCalledOnceWith('Phone Number Copied Successfully');
  });

  it('showToastMessage(): Should show toast message', () => {
    const message = 'Phone Number Copied Successfully';
    const successToastProperties = {
      data: {
        icon: 'check-circle-outline',
        showCloseButton: true,
        message,
      },
      duration: 3000,
    };

    snackbarProperties.setSnackbarProperties.and.returnValue(successToastProperties);
    component.showToastMessage(message);

    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...successToastProperties,
      panelClass: 'msb-success',
    });

    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith(
      'success',
      { message },
      'check-circle-outline'
    );
  });
});
