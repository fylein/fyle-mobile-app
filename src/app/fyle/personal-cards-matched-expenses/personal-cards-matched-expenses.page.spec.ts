import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Navigation, Router, RouterModule, UrlSerializer, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { platformPersonalCardTxns } from 'src/app/core/mock-data/personal-card-txns.data';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { PersonalCardsMatchedExpensesPage } from './personal-cards-matched-expenses.page';
import { CurrencyPipe } from '@angular/common';
import { CurrencySymbolPipe } from 'src/app/shared/pipes/currency-symbol.pipe';
import { ExpensePreviewComponent } from './expense-preview/expense-preview.component';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { ExactCurrencyPipe } from 'src/app/shared/pipes/exact-currency.pipe';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { platformExpenseWithExtractedData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { platformPersonalCardTxnExpenseSuggestionsRes } from 'src/app/core/mock-data/personal-card-txn-expense-suggestions.data';
import { linkedAccounts } from 'src/app/core/mock-data/personal-cards.data';

describe('PersonalCardsMatchedExpensesPage', () => {
  let component: PersonalCardsMatchedExpensesPage;
  let fixture: ComponentFixture<PersonalCardsMatchedExpensesPage>;
  let personalCardsService: jasmine.SpyObj<PersonalCardsService>;
  let router: jasmine.SpyObj<Router>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalPropertiesService: jasmine.SpyObj<ModalPropertiesService>;

  const data: Navigation = {
    extras: {
      state: {
        personalCard: linkedAccounts[0],
        txnDetails: platformPersonalCardTxns.data[0],
        expenseSuggestions: [platformExpenseWithExtractedData, ...platformPersonalCardTxnExpenseSuggestionsRes.data],
      },
    },
    id: 0,
    initialUrl: new UrlTree(),
    extractedUrl: new UrlTree(),
    trigger: 'imperative',
    previousNavigation: undefined,
  };

  beforeEach(waitForAsync(() => {
    const personalCardsServiceSpy = jasmine.createSpyObj('PersonalCardsService', ['getMatchedExpenses']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    TestBed.configureTestingModule({
      declarations: [PersonalCardsMatchedExpensesPage, CurrencySymbolPipe, ExactCurrencyPipe],
      imports: [IonicModule.forRoot(), RouterTestingModule, RouterModule],
      providers: [
        UrlSerializer,
        {
          provide: PersonalCardsService,
          useValue: personalCardsServiceSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
        FyCurrencyPipe,
        CurrencyPipe,
      ],
    }).compileComponents();
    personalCardsService = TestBed.inject(PersonalCardsService) as jasmine.SpyObj<PersonalCardsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalPropertiesService = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    spyOn(router, 'getCurrentNavigation').and.returnValue(data);
    fixture = TestBed.createComponent(PersonalCardsMatchedExpensesPage);
    component = fixture.componentInstance;
    component.txnDetails = data.extras.state.txnDetails;
    component.expenseSuggestions = data.extras.state.expenseSuggestions;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set matched expenses and display information correctly', () => {
    component.txnDetails = data.extras.state.txnDetails;
    component.expenseSuggestions = data.extras.state.expenseSuggestions;
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.matched-expenses--purpose'))).toEqual(
      component.txnDetails.description
    );
    expect(getTextContent(getElementBySelector(fixture, '.matched-expenses--currency'))).toEqual('$');
    expect(getTextContent(getElementBySelector(fixture, '.matched-expenses--amount'))).toEqual('200.00');
    expect(getTextContent(getElementBySelector(fixture, '.matched-expenses--date'))).toEqual('Sep 22, 2024');
  });

  it('createExpense(): should take the user to create expense page', () => {
    spyOn(router, 'navigate');

    component.txnDetails = data.extras.state.txnDetails;
    fixture.detectChanges();
    component.createExpense();
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'add_edit_expense',
      { personalCardTxn: JSON.stringify(component.txnDetails), navigate_back: true },
    ]);
  });

  it('openExpensePreview(): should open expense preview modal', async () => {
    component.personalCard = data.extras.state.personalCard;
    component.txnDetails = data.extras.state.txnDetails;
    fixture.detectChanges();
    modalController.create.and.returnValue(
      new Promise((resolve) => {
        const expenseDetailsModalSpy = jasmine.createSpyObj('expenseDetailsModal', ['present']) as any;
        expenseDetailsModalSpy.present.and.callThrough();
        resolve(expenseDetailsModalSpy);
      })
    );
    const cssClass = 'expense-preview-modal';

    const modalData = {
      cssClass,
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    };

    modalPropertiesService.getModalDefaultProperties.and.returnValue(modalData);

    const expense_id = 'eq.txRNWeQRXhso';
    await component.openExpensePreview(expense_id);
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: ExpensePreviewComponent,
      componentProps: {
        expenseId: expense_id,
        card: component.personalCard.card_number,
        cardTxnId: component.txnDetails.id,
        type: 'match',
      },
      ...modalData,
    });
    expect(modalPropertiesService.getModalDefaultProperties).toHaveBeenCalledOnceWith(cssClass);
  });

  it('should click create card and go to create expense page', () => {
    spyOn(component, 'createExpense');

    const createCard = getElementBySelector(fixture, '.matched-expenses--action-card') as HTMLElement;
    click(createCard);

    expect(component.createExpense).toHaveBeenCalledTimes(1);
  });
});
