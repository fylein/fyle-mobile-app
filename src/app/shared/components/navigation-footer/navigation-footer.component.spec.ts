import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { NavigationFooterComponent } from './navigation-footer.component';
import { Router, ActivatedRoute } from '@angular/router';
import { FyNavFooterComponent } from './fy-nav-footer/fy-nav-footer.component';
import { ExpensesService as SpenderExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ExpensesService as ApproverExpensesService } from 'src/app/core/services/platform/v1/approver/expenses.service';
import { of } from 'rxjs';
import { expenseData, mileageExpense, perDiemExpense } from 'src/app/core/mock-data/platform/v1/expense.data';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';

describe('NavigationFooterComponent', () => {
  let component: NavigationFooterComponent;
  let fixture: ComponentFixture<NavigationFooterComponent>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let spenderExpensesService: jasmine.SpyObj<SpenderExpensesService>;
  let approverExpensesService: jasmine.SpyObj<ApproverExpensesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const spenderExpensesServiceSpy = jasmine.createSpyObj('SpenderExpensesService', ['getExpenseById']);
    const approverExpensesServiceSpy = jasmine.createSpyObj('ApproverExpensesService', ['getExpenseById']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['expenseNavClicked']);
    TestBed.configureTestingModule({
      declarations: [NavigationFooterComponent, FyNavFooterComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                txnIds: JSON.stringify(['tx5fBcPBAxLv', 'txOJVaaPxo9O', 'tx3nHShG60zq']),
                view: ExpenseView.individual,
              },
            },
          },
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: SpenderExpensesService,
          useValue: spenderExpensesServiceSpy,
        },
        {
          provide: ApproverExpensesService,
          useValue: approverExpensesServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NavigationFooterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    spenderExpensesService = TestBed.inject(SpenderExpensesService) as jasmine.SpyObj<SpenderExpensesService>;
    approverExpensesService = TestBed.inject(ApproverExpensesService) as jasmine.SpyObj<ApproverExpensesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    component.reportExpenseCount = 3;
    component.activeExpenseIndex = 1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('goToPrev():', () => {
    it('should go to the previous expense', () => {
      spyOn(component, 'goToExpense');
      spyOn(component, 'getExpense').and.returnValue(of(expenseData));
      fixture.detectChanges();

      component.goToPrev(1);
      expect(trackingService.expenseNavClicked).toHaveBeenCalledOnceWith({ to: 'prev' });
      expect(component.getExpense).toHaveBeenCalledOnceWith('tx5fBcPBAxLv');
      expect(component.goToExpense).toHaveBeenCalledOnceWith(expenseData, 0);
    });

    it('should not run if current index is 0', () => {
      spyOn(component, 'goToExpense');
      spyOn(component, 'getExpense');
      fixture.detectChanges();

      component.goToPrev(0);
      expect(component.getExpense).not.toHaveBeenCalled();
      expect(trackingService.expenseNavClicked).not.toHaveBeenCalled();
      expect(component.goToExpense).not.toHaveBeenCalled();
    });

    it('should go to the previous expense if expense index not provided', () => {
      spyOn(component, 'goToExpense');
      spyOn(component, 'getExpense').and.returnValue(of(expenseData));
      fixture.detectChanges();

      component.goToPrev();
      expect(trackingService.expenseNavClicked).toHaveBeenCalledOnceWith({ to: 'prev' });
      expect(component.getExpense).toHaveBeenCalledOnceWith('tx5fBcPBAxLv');
      expect(component.goToExpense).toHaveBeenCalledOnceWith(expenseData, 0);
    });
  });

  describe('goToNext():', () => {
    it('should go to the next expense', () => {
      spyOn(component, 'goToExpense');
      spyOn(component, 'getExpense').and.returnValue(of(expenseData));
      fixture.detectChanges();

      component.goToNext(1);
      expect(trackingService.expenseNavClicked).toHaveBeenCalledOnceWith({ to: 'next' });
      expect(component.getExpense).toHaveBeenCalledOnceWith('tx3nHShG60zq');
      expect(component.goToExpense).toHaveBeenCalledOnceWith(expenseData, 2);
    });

    it('should not go to next expense if provided index is the last expense', () => {
      spyOn(component, 'goToExpense');
      spyOn(component, 'getExpense');
      fixture.detectChanges();

      component.goToNext(2);
      expect(component.getExpense).not.toHaveBeenCalled();
      expect(trackingService.expenseNavClicked).not.toHaveBeenCalled();
      expect(component.goToExpense).not.toHaveBeenCalled();
    });

    it('should go to next expense if the current index is not provided', () => {
      spyOn(component, 'goToExpense');
      spyOn(component, 'getExpense').and.returnValue(of(expenseData));
      fixture.detectChanges();

      component.goToNext();
      expect(trackingService.expenseNavClicked).toHaveBeenCalledOnceWith({ to: 'next' });
      expect(component.getExpense).toHaveBeenCalledOnceWith('tx3nHShG60zq');
      expect(component.goToExpense).toHaveBeenCalledOnceWith(expenseData, 2);
    });
  });

  describe('getExpense():', () => {
    it('should get spender expense if view is individual', () => {
      component.view = ExpenseView.individual;
      spenderExpensesService.getExpenseById.and.returnValue(of(expenseData));

      component.getExpense('tx5fBcPBAxLv').subscribe((expense) => {
        expect(expense).toEqual(expenseData);
        expect(spenderExpensesService.getExpenseById).toHaveBeenCalledOnceWith('tx5fBcPBAxLv');
      });
    });

    it('should get approver expense if view is team', () => {
      component.view = ExpenseView.team;
      approverExpensesService.getExpenseById.and.returnValue(of(expenseData));

      component.getExpense('tx5fBcPBAxLv').subscribe((expense) => {
        expect(expense).toEqual(expenseData);
        expect(approverExpensesService.getExpenseById).toHaveBeenCalledOnceWith('tx5fBcPBAxLv');
      });
    });
  });

  describe('goToExpense():', () => {
    it('should go to transaction', () => {
      router.navigate.and.returnValue(Promise.resolve(null));
      component.goToExpense(expenseData, 0);

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/enterprise/view_expense',
        {
          ...activatedRoute.snapshot.params,
          id: expenseData.id,
          activeIndex: 0,
        },
      ]);
    });

    it('should go to mileage', () => {
      router.navigate.and.returnValue(Promise.resolve(null));
      component.goToExpense(mileageExpense, 0);

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/enterprise/view_mileage',
        {
          ...activatedRoute.snapshot.params,
          id: mileageExpense.id,
          activeIndex: 0,
        },
      ]);
    });

    it('should go to per-diem', () => {
      router.navigate.and.returnValue(Promise.resolve(null));
      component.goToExpense(perDiemExpense, 0);

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/enterprise/view_per_diem',
        {
          ...activatedRoute.snapshot.params,
          id: perDiemExpense.id,
          activeIndex: 0,
        },
      ]);
    });
  });
});
