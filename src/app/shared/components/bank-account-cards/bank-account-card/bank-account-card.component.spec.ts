import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from '../../../../core/services/snackbar-properties.service';
import { DateService } from 'src/app/core/services/date.service';
import { BankAccountCardComponent } from './bank-account-card.component';
import { apiLinkedAccRes, deletePersonalCardRes } from 'src/app/core/mock-data/personal-cards.data';
import { of } from 'rxjs';
import { ToastMessageComponent } from '../../toast-message/toast-message.component';

describe('BankAccountCardComponent', () => {
  let component: BankAccountCardComponent;
  let fixture: ComponentFixture<BankAccountCardComponent>;
  let personalCardsService: jasmine.SpyObj<PersonalCardsService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let dateService: jasmine.SpyObj<DateService>;

  beforeEach(waitForAsync(() => {
    const personalCardsServiceSpy = jasmine.createSpyObj('PersonalCardsService', ['deleteAccount']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['convertUTCDateToLocalDate']);
    TestBed.configureTestingModule({
      declarations: [BankAccountCardComponent],
      imports: [IonicModule.forRoot()],
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
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BankAccountCardComponent);
    personalCardsService = TestBed.inject(PersonalCardsService) as jasmine.SpyObj<PersonalCardsService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    component = fixture.componentInstance;

    component.accountDetails = apiLinkedAccRes.data[1];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('presentPopover(): should present popover', () => {
    popoverController.create.and.returnValue(
      new Promise((resolve) => {
        const deleteCardPopOverSpy = jasmine.createSpyObj('deleteCardPopOver', []);
      })
    );
  });

  it('deleteAccount(): should delete account', fakeAsync(() => {
    spyOn(component.deleted, 'emit');
    loaderService.showLoader.and.returnValue(Promise.resolve());
    personalCardsService.deleteAccount.and.returnValue(of(deletePersonalCardRes));
    loaderService.hideLoader.and.returnValue(Promise.resolve());
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
  });
});
