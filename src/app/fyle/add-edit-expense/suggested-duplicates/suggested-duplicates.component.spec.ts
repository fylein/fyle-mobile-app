import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { SuggestedDuplicatesComponent } from './suggested-duplicates.component';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { etxncData } from 'src/app/core/mock-data/expense.data';
import { getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

fdescribe('SuggestedDuplicatesComponent', () => {
  let component: SuggestedDuplicatesComponent;
  let fixture: ComponentFixture<SuggestedDuplicatesComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let handleDuplicatesService: jasmine.SpyObj<HandleDuplicatesService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let snackbarPropertiesService: jasmine.SpyObj<SnackbarPropertiesService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const handleDuplicatesServiceSpy = jasmine.createSpyObj('HandleDuplicatesService', ['dismissAll']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getETxnc']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [SuggestedDuplicatesComponent],
      imports: [
        IonicModule.forRoot(),
        MatIconModule,
        MatIconTestingModule,
        FormsModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        CommonModule,
      ],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: HandleDuplicatesService, useValue: handleDuplicatesServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], //this is added temporarily and is not recommended
    }).compileComponents();

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    handleDuplicatesService = TestBed.inject(HandleDuplicatesService) as jasmine.SpyObj<HandleDuplicatesService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    snackbarPropertiesService = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(SuggestedDuplicatesComponent);
    component = fixture.componentInstance;
    component.duplicateExpenses = [{ tx_id: 'tx1ZvrMjIj4W' }, { tx_id: 'tx8v1PZSUxy5' }, { tx_id: 'txKW3vYo8W2v' }];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show success toast message when called', () => {
    const snackbarProperties = {
      data: {
        icon: 'tick-square-filled',
        showCloseButton: true,
        message: 'Duplicates was successfully dismissed',
      },
      duration: 3000,
    };
    const openFromComponentSpy = matSnackBar.openFromComponent.and.returnValue({
      onAction: () => ({
        subscribe: (noop: () => void) => {},
      }),
    } as MatSnackBarRef<ToastMessageComponent>);
    const setSnackbarPropertiesSpy =
      snackbarPropertiesService.setSnackbarProperties.and.returnValue(snackbarProperties);

    component.showDismissedSuccessToast();
    fixture.detectChanges();
    expect(setSnackbarPropertiesSpy).toHaveBeenCalledOnceWith('success', {
      message: 'Duplicates was successfully dismissed',
    });
    expect(openFromComponentSpy).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...snackbarProperties,
      panelClass: ['msb-success-with-camera-icon'],
    });
  });

  it('should dismiss the modal and navigate to the merge expense page', () => {
    const getETxncSpy = transactionService.getETxnc.and.returnValue(of(etxncData.data));
    const selectedExpenses = etxncData.data;
    component.mergeExpenses();
    fixture.detectChanges();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'merge_expense',
      {
        selectedElements: JSON.stringify(selectedExpenses),
        from: 'EDIT_EXPENSE',
      },
    ]);
    expect(getETxncSpy).toHaveBeenCalledOnceWith({
      offset: 0,
      limit: 10,
      params: { tx_id: 'in.(tx1ZvrMjIj4W,tx8v1PZSUxy5,txKW3vYo8W2v)' },
    });
  });

  it('should dismiss all duplicate expenses and display success toast message', () => {
    const dismissAllSpy = handleDuplicatesService.dismissAll.and.returnValue(of(null));
    const showDismissedSuccessToastSpy = spyOn(component, 'showDismissedSuccessToast');
    const modalControllerDismissSpy = modalController.dismiss.and.returnValue(Promise.resolve(true));

    component.dismissAll();
    fixture.detectChanges();
    expect(dismissAllSpy).toHaveBeenCalledOnceWith(
      ['tx1ZvrMjIj4W', 'tx8v1PZSUxy5', 'txKW3vYo8W2v'],
      ['tx1ZvrMjIj4W', 'tx8v1PZSUxy5', 'txKW3vYo8W2v']
    );
    expect(showDismissedSuccessToastSpy).toHaveBeenCalledTimes(1);
    expect(modalControllerDismissSpy).toHaveBeenCalledOnceWith({ action: 'dismissed' });
  });

  it('should display the correct header information and number of expense cards', () => {
    const headerEl = getElementBySelector(fixture, '.suggested-duplicates--header');
    fixture.detectChanges();
    expect(getTextContent(headerEl)).toContain('3 expenses for');

    const expenseCardEls = getAllElementsBySelector(fixture, 'app-expense-card');
    fixture.detectChanges();
    expect(expenseCardEls.length).toBe(component.duplicateExpenses.length);
  });
});
