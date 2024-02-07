import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VirtualCardComponent } from './virtual-card.component';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from '../toast-message/toast-message.component';

fdescribe('VirtualCardComponent', () => {
  let component: VirtualCardComponent;
  let fixture: ComponentFixture<VirtualCardComponent>;
  let clipboardService: jasmine.SpyObj<ClipboardService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;

  beforeEach(waitForAsync(() => {
    const clipboardServiceSpy = jasmine.createSpyObj('ClipboardService', ['writeString']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    TestBed.configureTestingModule({
      declarations: [VirtualCardComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ClipboardService, useValue: clipboardServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VirtualCardComponent);
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    component = fixture.componentInstance;
    spyOn(component, 'showToastMessage');
    fixture.detectChanges();
  }));

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('copyToClipboard(): Should copy content to clipboard and trigger toast message', fakeAsync(() => {
    spyOn(component, 'copyToClipboard').and.callThrough();
    clipboardService.writeString.and.resolveTo();

    const copyToClipboardIcon = getElementBySelector(
      fixture,
      '.virtual-card__card-fields__cvv-copy-icon'
    ) as HTMLDivElement;
    click(copyToClipboardIcon);
    tick(100);

    expect(component.copyToClipboard).toHaveBeenCalledOnceWith(component.cvv);
    expect(clipboardService.writeString).toHaveBeenCalledOnceWith(component.cvv);
  }));

  fit('showToastMessage(): should show toast notification', () => {
    const props = {
      data: {
        icon: 'check-square-fill',
        showCloseButton: true,
        message: 'Copied Successfully!',
      },
      duration: 3000,
    };
    matSnackBar.openFromComponent.and.callThrough();
    snackbarProperties.setSnackbarProperties.and.returnValue(props);

    component.showToastMessage('Copied Successfully!');
    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...props,
      panelClass: ['msb-info'],
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledTimes(1);
  });
});
