import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from '../../../../core/services/snackbar-properties.service';
import { DateService } from 'src/app/core/services/date.service';
import { BankAccountCardComponent } from './bank-account-card.component';
import { deletePersonalCardPlatformRes, linkedAccounts } from 'src/app/core/mock-data/personal-cards.data';
import { of } from 'rxjs';
import { ToastMessageComponent } from '../../toast-message/toast-message.component';
import { PopupAlertComponent } from '../../popup-alert/popup-alert.component';
import { DeleteButtonComponent } from './delete-button/delete-button-component';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('BankAccountCardComponent', () => {
  let component: BankAccountCardComponent;
  let fixture: ComponentFixture<BankAccountCardComponent>;
  let personalCardsService: jasmine.SpyObj<PersonalCardsService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let dateService: jasmine.SpyObj<DateService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const personalCardsServiceSpy = jasmine.createSpyObj('PersonalCardsService', ['deleteAccount']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['convertUTCDateToLocalDate']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [BankAccountCardComponent],
      imports: [IonicModule.forRoot(), TranslocoModule],
      providers: [
        {
          provide: PersonalCardsService,
          useValue: personalCardsServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BankAccountCardComponent);
    personalCardsService = TestBed.inject(PersonalCardsService) as jasmine.SpyObj<PersonalCardsService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;

    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'bankAccountCard.lastFetch': 'Last fetch:',
        'bankAccountCard.deletingCard': 'Deleting your card...',
        'bankAccountCard.cardDeletedSuccess': 'Card successfully deleted.',
        'bankAccountCard.deleteCardTitle': 'Delete Card',
        'bankAccountCard.deleteConfirmationMessage': 'Are you sure want to delete this card <b> {{accountInfo}} </b>?',
        'bankAccountCard.delete': 'Delete',
        'bankAccountCard.cancel': 'Cancel',
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

    component = fixture.componentInstance;

    component.accountDetails = linkedAccounts[1];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('presentPopover(): should present popover', async () => {
    spyOn(component, 'confirmPopup').and.callThrough();
    popoverController.create.and.returnValue(
      new Promise((resolve) => {
        const deleteCardPopOverSpy = jasmine.createSpyObj('deleteCardPopOver', ['present', 'onDidDismiss']);

        deleteCardPopOverSpy.onDidDismiss.and.returnValue(
          new Promise((resInt) => {
            resInt({ data: 'delete' });
          })
        );
        resolve(deleteCardPopOverSpy);
      })
    );

    component.presentPopover(new PointerEvent('event'));
    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: DeleteButtonComponent,
      cssClass: 'delete-button-class',
      event: new PointerEvent('event'),
    });
  });

  it('deleteAccount(): should delete account', fakeAsync(() => {
    spyOn(component.deleted, 'emit');
    loaderService.showLoader.and.resolveTo();
    personalCardsService.deleteAccount.and.returnValue(of(deletePersonalCardPlatformRes.data));
    loaderService.hideLoader.and.resolveTo();
    matSnackBar.openFromComponent.and.callThrough();
    snackbarProperties.setSnackbarProperties.and.callThrough();
    fixture.detectChanges();

    component.deleteAccount();
    tick();
    expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Deleting your card...', 5000);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(personalCardsService.deleteAccount).toHaveBeenCalledOnceWith(component.accountDetails.id);
    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      panelClass: ['msb-success'],
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
      message: 'Card successfully deleted.',
    });
    expect(component.deleted.emit).toHaveBeenCalledTimes(1);
  }));

  it('confirmPopup(): should display the confirm popup', async () => {
    spyOn(component, 'deleteAccount').and.callThrough();
    popoverController.create.and.returnValue(
      new Promise((resolve) => {
        const deleteCardPopOverSpy = jasmine.createSpyObj('deleteCardPopOver', ['present', 'onWillDismiss']);

        deleteCardPopOverSpy.onWillDismiss.and.returnValue(
          new Promise((resInt) => {
            resInt({
              action: 'delete',
            });
          })
        );
        resolve(deleteCardPopOverSpy);
      })
    );

    component.confirmPopup();
    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Delete Card',
        message: `Are you sure want to delete this card <b> (${component.accountDetails.bank_name} ${component.accountDetails.card_number}) </b>?`,
        primaryCta: {
          text: 'Delete',
          action: 'delete',
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'cancel',
        },
      },
      cssClass: 'pop-up-in-center',
    });
  });

  it('should present popover if clicked on', () => {
    spyOn(component, 'presentPopover');

    const actionIcon = getElementBySelector(fixture, '.personal-card--action-icon') as HTMLElement;
    click(actionIcon);

    expect(component.presentPopover).toHaveBeenCalledOnceWith(new PointerEvent(''));
  });

  it('should display information correctly', () => {
    expect(getTextContent(getElementBySelector(fixture, '.personal-card--bank-name'))).toEqual('Dag Site yodlee');
    expect(getTextContent(getElementBySelector(fixture, '.personal-card--account-info__type'))).toEqual('CREDIT');
    expect(getTextContent(getElementBySelector(fixture, '.personal-card--account-info__mask'))).toEqual('xxxx9806');
  });
});
