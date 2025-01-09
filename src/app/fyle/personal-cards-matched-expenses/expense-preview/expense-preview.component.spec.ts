import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpensePreviewComponent } from './expense-preview.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ExpensePreviewShimmerComponent } from '../expense-preview-shimmer/expense-preview-shimmer.component';
import { of } from 'rxjs';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { apiExpenses1 } from 'src/app/core/mock-data/platform/v1/expense.data';

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
  let expensesService: jasmine.SpyObj<ExpensesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const personalCardsServiceSpy = jasmine.createSpyObj('PersonalCardsService', ['getExpenseDetails', 'matchExpense']);
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['oldExpensematchedFromPersonalCard']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenses']);

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
        { provide: ExpensesService, useValue: expensesServiceSpy },
      ],
    }).compileComponents();

    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    personalCardsService = TestBed.inject(PersonalCardsService) as jasmine.SpyObj<PersonalCardsService>;
    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;

    fixture = TestBed.createComponent(ExpensePreviewComponent);
    component = fixture.componentInstance;
    component.expenseId = 'txOJVaaPxo9O';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onInit():', () => {
    it('should set isIos to true if the platform is iOS', () => {
      platform.is.and.returnValue(true);
      component.ngOnInit();
      expect(component.isIos).toBeTrue();
    });

    it('should set isIos to false if the platform is not iOS', () => {
      platform.is.and.returnValue(false);
      component.ngOnInit();
      expect(component.isIos).toBeFalse();
    });
  });

  it('ionViewWillEnter(): should get personal card expense details', (done) => {
    expensesService.getExpenses.and.returnValue(of(apiExpenses1));
    component.ionViewWillEnter();

    component.expenseDetails$.subscribe((result) => {
      expect(result).toEqual(apiExpenses1[0]);
      expect(expensesService.getExpenses).toHaveBeenCalledOnceWith({ split_group_id: `eq.${component.expenseId}` });
      done();
    });
  });

  it('editExpense(): should navigate to the add-edit-expense page and edit expense', () => {
    const modalControllerDismissSpy = modalController.dismiss.and.resolveTo(true);
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
    const modalControllerDismissSpy = modalController.dismiss.and.resolveTo(true);
    component.closeModal();
    expect(modalControllerDismissSpy).toHaveBeenCalledTimes(1);
  });

  it('matchExpense(): should match the expenses', () => {
    component.loading = true;
    const response = {
      external_expense_id: 'tx3nHShG60zq',
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
});
