import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Navigation, Router, RouterModule, UrlSerializer, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { apiExpenseRes } from 'src/app/core/mock-data/expense.data';
import { apiPersonalCardTxnsRes } from 'src/app/core/mock-data/personal-card-txns.data';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { PersonalCardsMatchedExpensesPage } from './personal-cards-matched-expenses.page';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CurrencySymbolPipe } from 'src/app/shared/pipes/currency-symbol.pipe';
import * as dayjs from 'dayjs';
import { ExpensePreviewComponent } from './expense-preview/expense-preview.component';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('PersonalCardsMatchedExpensesPage', () => {
  let component: PersonalCardsMatchedExpensesPage;
  let fixture: ComponentFixture<PersonalCardsMatchedExpensesPage>;
  let personalCardsService: jasmine.SpyObj<PersonalCardsService>;
  let router: jasmine.SpyObj<Router>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalPropertiesService: jasmine.SpyObj<ModalPropertiesService>;

  const data: Navigation = {
    extras: { state: { txnDetails: apiPersonalCardTxnsRes.data[0] } },
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
      declarations: [PersonalCardsMatchedExpensesPage, CurrencySymbolPipe],
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
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set matched expenses and display information correctly', () => {
    component.txnDetails = data.extras.state.txnDetails;
    const txnDate = dayjs(component.txnDetails.btxn_transaction_dt).format('YYYY-MM-DD');
    personalCardsService.getMatchedExpenses.and.returnValue(of(apiExpenseRes));
    fixture.detectChanges();
    component.ionViewWillEnter();
    expect(personalCardsService.getMatchedExpenses).toHaveBeenCalledOnceWith(component.txnDetails.btxn_amount, txnDate);

    expect(getTextContent(getElementBySelector(fixture, '.matched-expenses--purpose'))).toEqual(
      component.txnDetails.btxn_description,
    );
    expect(getTextContent(getElementBySelector(fixture, '.matched-expenses--currency'))).toEqual('$');
    expect(getTextContent(getElementBySelector(fixture, '.matched-expenses--amount'))).toEqual('200.00');
    expect(getTextContent(getElementBySelector(fixture, '.matched-expenses--date'))).toEqual('Sep 19, 2021');
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
    component.txnDetails = data.extras.state.txnDetails;
    fixture.detectChanges();
    modalController.create.and.returnValue(
      new Promise((resolve) => {
        const expenseDetailsModalSpy = jasmine.createSpyObj('expenseDetailsModal', ['present']) as any;
        expenseDetailsModalSpy.present.and.callThrough();
        resolve(expenseDetailsModalSpy);
      }),
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
        card: component.txnDetails.ba_account_number,
        cardTxnId: component.txnDetails.btxn_id,
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
