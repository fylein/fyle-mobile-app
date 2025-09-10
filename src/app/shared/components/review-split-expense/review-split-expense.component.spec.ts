import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ModalController } from '@ionic/angular/standalone';
import { ReviewSplitExpenseComponent } from './review-split-expense.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { expenseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { of } from 'rxjs';
describe('ReviewSplitExpenseComponent', () => {
  let component: ReviewSplitExpenseComponent;
  let fixture: ComponentFixture<ReviewSplitExpenseComponent>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      providers: [
        { provide: ModalController, useValue: modalSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
      imports: [TranslocoModule, ReviewSplitExpenseComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewSplitExpenseComponent);
    component = fixture.componentInstance;
    modalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'reviewSplitExpense.title': 'Review split expenses',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with split expenses input', () => {
    const mockExpenses = [expenseData];
    fixture.componentRef.setInput('splitExpenses', mockExpenses);
    fixture.detectChanges();

    expect(component.splitExpenses()).toEqual(mockExpenses);
  });

  it('should handle empty split expenses array', () => {
    fixture.componentRef.setInput('splitExpenses', []);
    fixture.detectChanges();

    expect(component.splitExpenses()).toEqual([]);
  });

  it('goToExpense(): should call modalController.dismiss with correct params on goToTransaction', () => {
    const event = { expense: expenseData, expenseIndex: 0 };

    component.goToExpense(event);

    expect(modalControllerSpy.dismiss).toHaveBeenCalledWith({
      dismissed: true,
      action: 'navigate',
      expense: expenseData,
    });
  });

  it('close(): should call modalController.dismiss with correct params on close', () => {
    component.close();

    expect(modalControllerSpy.dismiss).toHaveBeenCalledWith({
      dismissed: true,
      action: 'close',
    });
  });
});
