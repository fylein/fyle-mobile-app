import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { SuggestedDuplicatesComponent } from './suggested-duplicates.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { apiExpenses1, expenseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';

describe('SuggestedDuplicatesComponent', () => {
  let component: SuggestedDuplicatesComponent;
  let fixture: ComponentFixture<SuggestedDuplicatesComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let snackbarPropertiesService: jasmine.SpyObj<SnackbarPropertiesService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenses', 'dismissDuplicates']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
    imports: [
        IonicModule.forRoot(),
        MatIconModule,
        MatIconTestingModule,
        FormsModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        CommonModule,
        TranslocoModule,
        SuggestedDuplicatesComponent,
    ],
    providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ExpensesService, useValue: expensesServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA], //this is added temporarily and is not recommended
}).compileComponents();

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    snackbarPropertiesService = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'suggestedDuplicates.dismissSuccess': 'Duplicates were successfully dismissed',
        'suggestedDuplicates.dismissAll': 'Dismiss all',
        'suggestedDuplicates.dismiss': 'Dismiss',
        'suggestedDuplicates.merge': 'Merge',
        'suggestedDuplicates.mergeExpense': 'Merge expense',
        'suggestedDuplicates.header': '{{count}} expenses for {{amount}}',
        'suggestedDuplicates.expensesFor': 'expenses for',
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
    fixture = TestBed.createComponent(SuggestedDuplicatesComponent);
    component = fixture.componentInstance;

    component.duplicateExpenseIDs = apiExpenses1.map((expense) => expense.id);
    component.duplicateExpenses = apiExpenses1;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ionViewWillEnter(): should get duplicate expenses', () => {
    component.duplicateExpenseIDs = ['txDDLtRaflUW', 'tx5WDG9lxBDT'];
    expensesService.getExpenses.and.returnValue(of(apiExpenses1));

    component.ionViewWillEnter();

    const queryParams = {
      id: 'in.(txDDLtRaflUW,tx5WDG9lxBDT)',
    };

    expect(component.duplicateExpenses).toEqual(apiExpenses1);
    expect(expensesService.getExpenses).toHaveBeenCalledOnceWith({
      offset: 0,
      limit: 10,
      ...queryParams,
    });
  });

  it('should show success toast message when called', () => {
    const snackbarProperties = {
      data: {
        icon: 'check-square-fill',
        showCloseButton: true,
        message: 'Duplicates were successfully dismissed',
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
      message: 'Duplicates were successfully dismissed',
    });
    expect(openFromComponentSpy).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...snackbarProperties,
      panelClass: ['msb-success-with-camera-icon'],
    });
  });

  it('should dismiss the modal and navigate to the merge expense page', () => {
    component.mergeExpenses();
    fixture.detectChanges();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'merge_expense',
      {
        expenseIDs: JSON.stringify(['txDDLtRaflUW', 'tx5WDG9lxBDT']),
        from: 'EDIT_EXPENSE',
      },
    ]);
  });

  it('should dismiss all duplicate expenses and display success toast message', () => {
    const dismissDuplicatesSpy = expensesService.dismissDuplicates.and.returnValue(of(null));
    const showDismissedSuccessToastSpy = spyOn(component, 'showDismissedSuccessToast');
    const modalControllerDismissSpy = modalController.dismiss.and.resolveTo(true);

    component.dismissAll();
    fixture.detectChanges();

    expect(dismissDuplicatesSpy).toHaveBeenCalledOnceWith(
      ['txDDLtRaflUW', 'tx5WDG9lxBDT'],
      ['txDDLtRaflUW', 'tx5WDG9lxBDT'],
    );
    expect(showDismissedSuccessToastSpy).toHaveBeenCalledTimes(1);
    expect(modalControllerDismissSpy).toHaveBeenCalledOnceWith({ action: 'dismissed' });
  });

  it('should display the correct header information', () => {
    const expectedHeader = '3 expenses for $100.50';
    component.duplicateExpenses = [
      { ...expenseData, amount: 100.5, currency: 'USD' },
      { ...expenseData, amount: 100.5, currency: 'USD' },
      { ...expenseData, amount: 100.5, currency: 'USD' },
    ];

    const headerEl = getElementBySelector(fixture, '.suggested-duplicates--header');
    fixture.detectChanges();
    expect(getTextContent(headerEl)).toEqual(expectedHeader);
  });

  it('should display correct number of expense cards', () => {
    const expenseCardEls = getAllElementsBySelector(fixture, 'app-expense-card-v2');
    fixture.detectChanges();
    expect(expenseCardEls.length).toBe(component.duplicateExpenses.length);
  });
});
