import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import {
  MatLegacySnackBar as MatSnackBar,
  MatLegacySnackBarModule as MatSnackBarModule,
} from '@angular/material/legacy-snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpensePreviewComponent } from './expense-preview.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ExpensePreviewShimmerComponent } from '../expense-preview-shimmer/expense-preview-shimmer.component';
import { of } from 'rxjs';
import { etxncData } from 'src/app/core/mock-data/expense.data';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';

describe('ExpensePreviewComponent', () => {
  let component: ExpensePreviewComponent;
  let fixture: ComponentFixture<ExpensePreviewComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let personalCardsService: jasmine.SpyObj<PersonalCardsService>;
  let router: jasmine.SpyObj<Router>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let platform: jasmine.SpyObj<Platform>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const personalCardsServiceSpy = jasmine.createSpyObj('PersonalCardsService', [
      'getExpenseDetails',
      'matchExpense',
      'unmatchExpense',
    ]);
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'oldExpensematchedFromPersonalCard',
      'unmatchedExpensesFromPersonalCard',
    ]);

    TestBed.configureTestingModule({
      declarations: [ExpensePreviewComponent, ExpensePreviewShimmerComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule, MatSnackBarModule],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PersonalCardsService, useValue: personalCardsServiceSpy },
        { provide: Platform, useValue: platformSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
      ],
    }).compileComponents();

    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    personalCardsService = TestBed.inject(PersonalCardsService) as jasmine.SpyObj<PersonalCardsService>;
    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;

    fixture = TestBed.createComponent(ExpensePreviewComponent);
    component = fixture.componentInstance;
    const expense = { id: 'txOJVaaPxo9O' };
    component.expenseId = expense;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('onInit():', () => {
    it('should set isIos to true if the platform is iOS', () => {
      platform.is.and.returnValue(true);
      component.ngOnInit();
      expect(component.isIos).toBe(true);
    });

    it('should set isIos to false if the platform is not iOS', () => {
      platform.is.and.returnValue(false);
      component.ngOnInit();
      expect(component.isIos).toBe(false);
    });
  });

  it('ionViewWillEnter(): should get personal card expense details', (done) => {
    personalCardsService.getExpenseDetails.and.returnValue(of(etxncData.data[0]));
    component.ionViewWillEnter();

    component.expenseDetails$.subscribe((result) => {
      expect(result).toEqual(etxncData.data[0]);
      expect(personalCardsService.getExpenseDetails).toHaveBeenCalledOnceWith(component.expenseId);
      done();
    });
  });

  it('editExpense(): should navigate to the add-edit-expense page and edit expense', () => {
    const modalControllerDismissSpy = modalController.dismiss.and.returnValue(Promise.resolve(true));
    component.editExpense();
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'add_edit_expense',
      { id: component.expenseId, navigate_back: true },
    ]);
    expect(modalControllerDismissSpy).toHaveBeenCalledTimes(1);
  });

  it('closeModal(): should dismiss the modal', () => {
    const modalControllerDismissSpy = modalController.dismiss.and.returnValue(Promise.resolve(true));
    component.closeModal();
    expect(modalControllerDismissSpy).toHaveBeenCalledTimes(1);
  });

  it('matchExpense(): should match the expenses', () => {
    component.loading = true;
    const response = {
      id: 'tx3nHShG60zq',
      transaction_split_group_id: 'tx3nHShG60zq',
    };
    component.expenseId = 'testExpenseId';
    component.cardTxnId = 'testCardTxnId';
    personalCardsService.matchExpense.and.returnValue(of(response));

    component.matchExpense();
    expect(component.loading).toBeFalsy();

    expect(personalCardsService.matchExpense).toHaveBeenCalledWith('testExpenseId', 'testCardTxnId');
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/', 'enterprise', 'personal_cards']);
    expect(trackingService.oldExpensematchedFromPersonalCard).toHaveBeenCalledTimes(1);
  });

  it('unmatchExpense(): should unmatch the expenses', () => {
    component.unMatching = true;
    personalCardsService.unmatchExpense.and.returnValue(of(null));
    component.expenseId = 'tx2ZttMRItRx';
    component.cardTxnId = 'btxntEdVJeYyyx';

    component.unmatchExpense();
    expect(component.unMatching).toBeFalsy();

    fixture.detectChanges();
    expect(personalCardsService.unmatchExpense).toHaveBeenCalledOnceWith(component.expenseId, component.cardTxnId);
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    expect(matSnackBar.openFromComponent).toHaveBeenCalledWith(ToastMessageComponent, {
      ...snackbarProperties.setSnackbarProperties('success', { message: 'Successfully unmatched the expense.' }),
      panelClass: ['msb-success'],
    });
    expect(router.navigate).toHaveBeenCalledWith(['/', 'enterprise', 'personal_cards']);
    expect(trackingService.unmatchedExpensesFromPersonalCard).toHaveBeenCalledTimes(1);
  });
});
