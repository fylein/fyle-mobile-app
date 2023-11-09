import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { NavigationFooterComponent } from './navigation-footer.component';
import { Router, ActivatedRoute } from '@angular/router';
import { FyNavFooterComponent } from './fy-nav-footer/fy-nav-footer.component';
import { apiExpenseRes, etxncData, expenseData1 } from 'src/app/core/mock-data/expense.data';
import { of } from 'rxjs';

describe('NavigationFooterComponent', () => {
  let component: NavigationFooterComponent;
  let fixture: ComponentFixture<NavigationFooterComponent>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getEtxn']);
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
              },
            },
          },
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
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
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    component.numExpensesInReport = 3;
    component.activeExpenseIndex = 1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('goToPrev():', () => {
    it('should go to the previous expense', () => {
      spyOn(component, 'goToTransaction');
      transactionService.getEtxn.and.returnValue(of(etxncData.data[0]));
      fixture.detectChanges();

      component.goToPrev(1);
      expect(trackingService.expenseNavClicked).toHaveBeenCalledOnceWith({ to: 'prev' });
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith('tx5fBcPBAxLv');
      expect(component.goToExpense).toHaveBeenCalledOnceWith(etxncData.data[0], 0, 'prev');
    });

    it('should not run if current index is 0', () => {
      spyOn(component, 'goToTransaction');
      fixture.detectChanges();

      component.goToPrev(0);
      expect(transactionService.getEtxn).not.toHaveBeenCalled();
      expect(trackingService.expenseNavClicked).not.toHaveBeenCalled();
      expect(component.goToExpense).not.toHaveBeenCalled();
    });

    it('should go to the previous txn if txn index not provided', () => {
      spyOn(component, 'goToTransaction');
      transactionService.getEtxn.and.returnValue(of(etxncData.data[0]));
      fixture.detectChanges();

      component.goToPrev();
      expect(trackingService.expenseNavClicked).toHaveBeenCalledOnceWith({ to: 'prev' });
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith('tx5fBcPBAxLv');
      expect(component.goToExpense).toHaveBeenCalledOnceWith(etxncData.data[0], 0, 'prev');
    });
  });

  describe('goToNext():', () => {
    it('should go to the next txn', () => {
      spyOn(component, 'goToTransaction');
      transactionService.getEtxn.and.returnValue(of(apiExpenseRes[0]));
      fixture.detectChanges();

      component.goToNext(1);
      expect(trackingService.expenseNavClicked).toHaveBeenCalledOnceWith({ to: 'next' });
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith('tx3nHShG60zq');
      expect(component.goToExpense).toHaveBeenCalledOnceWith(apiExpenseRes[0], 2, 'next');
    });

    it('should not go to next txn if provided index is the last txn', () => {
      spyOn(component, 'goToTransaction');
      fixture.detectChanges();

      component.goToNext(2);
      expect(transactionService.getEtxn).not.toHaveBeenCalled();
      expect(trackingService.expenseNavClicked).not.toHaveBeenCalled();
      expect(component.goToExpense).not.toHaveBeenCalled();
    });

    it('should go to next txn if the current index is not provided', () => {
      spyOn(component, 'goToTransaction');
      transactionService.getEtxn.and.returnValue(of(apiExpenseRes[0]));
      fixture.detectChanges();

      component.goToNext();
      expect(trackingService.expenseNavClicked).toHaveBeenCalledOnceWith({ to: 'next' });
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith('tx3nHShG60zq');
      expect(component.goToExpense).toHaveBeenCalledOnceWith(apiExpenseRes[0], 2, 'next');
    });
  });

  describe('goToTransaction():', () => {
    it('should go to transaction', () => {
      router.navigate.and.returnValue(Promise.resolve(null));
      component.goToExpense(expenseData1, 0, 'next');

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/enterprise/view_expense',
        {
          ...activatedRoute.snapshot.params,
          id: expenseData1.tx_id,
          activeIndex: 0,
        },
      ]);
    });

    it('should go to mileage', () => {
      router.navigate.and.returnValue(Promise.resolve(null));
      component.goToExpense({ ...expenseData1, tx_org_category: 'mileage' }, 0, 'next');

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/enterprise/view_mileage',
        {
          ...activatedRoute.snapshot.params,
          id: expenseData1.tx_id,
          activeIndex: 0,
        },
      ]);
    });

    it('should go to per-diem', () => {
      router.navigate.and.returnValue(Promise.resolve(null));
      component.goToExpense({ ...expenseData1, tx_org_category: 'per diem' }, 0, 'next');

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/enterprise/view_per_diem',
        {
          ...activatedRoute.snapshot.params,
          id: expenseData1.tx_id,
          activeIndex: 0,
        },
      ]);
    });
  });
});
