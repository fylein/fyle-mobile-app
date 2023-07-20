import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../core/services/loader.service';
import { AdvanceRequestService } from '../core/services/advance-request.service';
import { AuthService } from '../core/services/auth.service';
import { TransactionService } from '../core/services/transaction.service';
import { ReportService } from '../core/services/report.service';
import { DeepLinkRedirectionPage } from './deep-link-redirection.page';
import { expectedSingleErpt } from '../core/mock-data/report-unflattened.data';
import { of, throwError } from 'rxjs';
import { apiEouRes } from '../core/mock-data/extended-org-user.data';
import { unflattenedTxnData } from '../core/mock-data/unflattened-txn.data';
import { singleErqUnflattened } from '../core/mock-data/extended-advance-request.data';
import { DeepLinkService } from '../core/services/deep-link.service';

describe('DeepLinkRedirectionPage', () => {
  let component: DeepLinkRedirectionPage;
  let fixture: ComponentFixture<DeepLinkRedirectionPage>;
  let router: jasmine.SpyObj<Router>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let reportService: jasmine.SpyObj<ReportService>;
  let authService: jasmine.SpyObj<AuthService>;
  let deepLinkService: jasmine.SpyObj<DeepLinkService>;
  let activeroutemock: ActivatedRoute;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', ['getEReq']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getETxnUnflattened']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getERpt']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const deepLinkServiceSpy = jasmine.createSpyObj('DeepLinkService', ['getExpenseRoute']);

    TestBed.configureTestingModule({
      declarations: [DeepLinkRedirectionPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: AdvanceRequestService, useValue: advanceRequestServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: DeepLinkService, useValue: deepLinkServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: '123',
                sub_module: 'testParam',
              },
            },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    deepLinkService = TestBed.inject(DeepLinkService) as jasmine.SpyObj<DeepLinkService>;
    activeroutemock = TestBed.inject(ActivatedRoute);

    reportService.getERpt.and.returnValue(of(expectedSingleErpt));
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    fixture = TestBed.createComponent(DeepLinkRedirectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('redirectToReportModule', () => {
    it('should redirect to report module', fakeAsync(() => {
      activeroutemock.snapshot.params = {
        sub_module: 'report',
        id: 'rprAfNrce73O',
      };

      component.redirectToReportModule();
      fixture.detectChanges();
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading....');
      tick(500);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      tick(500);
      expect(reportService.getERpt).toHaveBeenCalledOnceWith(activeroutemock.snapshot.params.id);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_view_report',
        { id: activeroutemock.snapshot.params.id },
      ]);
    }));

    it('should redirect to team reports when ids do not match', fakeAsync(() => {
      activeroutemock.snapshot.params = {
        sub_module: 'report',
        id: 'rprAfNrce75O',
      };
      const updatedApiEouRes = {
        ...apiEouRes,
        ou: {
          ...apiEouRes.ou,
          id: 'ouWE1234',
        },
      };

      authService.getEou.and.returnValue(Promise.resolve(updatedApiEouRes));

      const updatedErpt = {
        ...expectedSingleErpt,
        rp: {
          ...expectedSingleErpt.rp,
          org_user_id: 'rprAfNrce75O',
        },
      };
      reportService.getERpt.and.returnValue(of(updatedErpt));
      component.redirectToReportModule();
      fixture.detectChanges();
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading....');
      tick(500);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      tick(500);
      expect(reportService.getERpt).toHaveBeenCalledOnceWith(activeroutemock.snapshot.params.id);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'view_team_report',
        { id: activeroutemock.snapshot.params.id },
      ]);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    }));

    it('should call switch_org if AuthService.getEou() fails', fakeAsync(() => {
      const updatedApiEouRes = {
        ...apiEouRes,
        ou: {
          ...apiEouRes.ou,
          id: null,
        },
      };

      spyOn(component, 'switchOrg');
      const error = 'Something went wrong';
      authService.getEou.and.returnValue(Promise.resolve(updatedApiEouRes));
      reportService.getERpt.and.returnValue(throwError(() => error));
      component.redirectToReportModule();
      fixture.detectChanges();
      tick(500);
      expect(component.switchOrg).toHaveBeenCalledTimes(1);
    }));
  });

  describe('redirectToExpenseModule():', () => {
    beforeEach(() => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();

      transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
      deepLinkService.getExpenseRoute.and.returnValue(['/', 'enterprise', 'view_expense']);

      authService.getEou.and.resolveTo(apiEouRes);
      spyOn(component, 'switchOrg').and.returnValue();
    });

    it('should redirect to the expense page in logged-in org if orgId is not present in route param', fakeAsync(() => {
      const txnId = 'txAfNrce75O';
      activeroutemock.snapshot.params = {
        sub_module: 'expense',
        id: txnId,
      };

      component.redirectToExpenseModule();
      tick(200);

      expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(txnId);
      expect(deepLinkService.getExpenseRoute).toHaveBeenCalledOnceWith(unflattenedTxnData);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'view_expense', { id: txnId }]);
    }));

    it('should redirect to the expense page if expense orgId is same as logged-in org id', fakeAsync(() => {
      const orgId = 'orNVthTo2Zyo';
      const txnId = 'tx3qHxFNgRcZ';
      activeroutemock.snapshot.params = {
        sub_module: 'expense',
        id: txnId,
        orgId,
      };

      component.redirectToExpenseModule();
      tick(200);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading....');
      expect(authService.getEou).toHaveBeenCalledOnceWith();
      expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(txnId);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(2);
      expect(deepLinkService.getExpenseRoute).toHaveBeenCalledOnceWith(unflattenedTxnData);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'view_expense', { id: txnId }]);
    }));

    it('should redirect to the switch org page if expense orgId is different than logged-in org id', fakeAsync(() => {
      const orgId = 'orOTDe765hQp';
      const txnId = 'tx3qHxFNgRcZ';
      activeroutemock.snapshot.params = {
        sub_module: 'expense',
        id: txnId,
        orgId,
      };

      component.redirectToExpenseModule();
      tick(200);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading....');
      expect(authService.getEou).toHaveBeenCalledOnceWith();
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { txnId, orgId }]);
    }));

    it('should call switchOrg() if GET Eou fails', fakeAsync(() => {
      const orgId = 'orNVthTo2Zyo';
      const txnId = 'tx3qHxFNgRcZ';
      activeroutemock.snapshot.params = {
        sub_module: 'expense',
        id: txnId,
        orgId,
      };
      authService.getEou.and.rejectWith();
      component.redirectToExpenseModule();
      tick(500);
      expect(component.switchOrg).toHaveBeenCalledOnceWith();
    }));

    it('should call switchOrg() if GET expense call fails', fakeAsync(() => {
      const orgId = 'orNVthTo2Zyo';
      const txnId = 'tx3qHxFNgRcZ';
      activeroutemock.snapshot.params = {
        sub_module: 'expense',
        id: txnId,
        orgId,
      };
      transactionService.getETxnUnflattened.and.returnValue(throwError(() => {}));
      component.redirectToExpenseModule();
      tick(500);
      expect(component.switchOrg).toHaveBeenCalledOnceWith();
    }));
  });

  describe('redirectToAdvanceModule():', () => {
    it('should redirect to view_team_advance page if the org ids do not match each other', fakeAsync(() => {
      const updatedApiEouRes = {
        ...apiEouRes,
        ou: {
          ...apiEouRes.ou,
          id: 'ouWE1234',
        },
      };

      authService.getEou.and.returnValue(Promise.resolve(updatedApiEouRes));

      activeroutemock.snapshot.params = {
        sub_module: 'advReq',
        id: 'areqGzKF1Tne23',
      };
      advanceRequestService.getEReq.and.returnValue(of(singleErqUnflattened));
      component.redirectToAdvReqModule();
      fixture.detectChanges();
      tick(500);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading....');
      tick(500);
      expect(authService.getEou).toHaveBeenCalledTimes(1);

      expect(advanceRequestService.getEReq).toHaveBeenCalledOnceWith(activeroutemock.snapshot.params.id);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'view_team_advance',
        { id: activeroutemock.snapshot.params.id },
      ]);
      tick(500);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    }));

    it('should redirect to my_view_advance_request page if non of the conditions match', fakeAsync(() => {
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));

      activeroutemock.snapshot.params = {
        sub_module: 'advReq',
        id: 'areqGzKF1Tne23',
      };
      advanceRequestService.getEReq.and.returnValue(of(singleErqUnflattened));
      component.redirectToAdvReqModule();
      fixture.detectChanges();
      tick(500);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading....');
      tick(500);
      expect(authService.getEou).toHaveBeenCalledTimes(1);

      expect(advanceRequestService.getEReq).toHaveBeenCalledOnceWith(activeroutemock.snapshot.params.id);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_view_advance_request',
        { id: activeroutemock.snapshot.params.id },
      ]);
      tick(500);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    }));

    it('should redirect to view_advance page if the advance request id is provided', fakeAsync(() => {
      const updatesErqUnflattened = {
        ...singleErqUnflattened,
        advance: {
          ...singleErqUnflattened.advance,
          id: 'advGzKF1Tne23',
        },
      };

      activeroutemock.snapshot.params = {
        sub_module: 'advReq',
        id: 'advGzKF1Tne23',
      };
      advanceRequestService.getEReq.and.returnValue(of(updatesErqUnflattened));
      component.redirectToAdvReqModule();
      fixture.detectChanges();
      tick(500);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading....');
      tick(500);
      expect(advanceRequestService.getEReq).toHaveBeenCalledOnceWith(activeroutemock.snapshot.params.id);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_view_advance',
        { id: activeroutemock.snapshot.params.id },
      ]);
      tick(500);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    }));

    it('should call switch_org if tadvancedRequestService.getEreq fails', fakeAsync(() => {
      spyOn(component, 'switchOrg');
      const error = 'Something went wrong';
      advanceRequestService.getEReq.and.returnValue(throwError(() => error));
      component.redirectToAdvReqModule();
      fixture.detectChanges();
      tick(500);
      expect(component.switchOrg).toHaveBeenCalledTimes(1);
    }));
  });

  describe('ionViewWillEnter()', () => {
    it('should call redirectToReportModule() if the sub_module is report', fakeAsync(() => {
      activeroutemock.snapshot.params = {
        sub_module: 'report',
        id: 'rprAfNrce75O',
      };
      spyOn(component, 'redirectToReportModule').and.stub();

      component.ionViewWillEnter();
      fixture.detectChanges();

      tick(500);
      expect(component.redirectToReportModule).toHaveBeenCalledTimes(1);
    }));

    it('should call redirectToExpenseModule() if the sub_module is expense', fakeAsync(() => {
      activeroutemock.snapshot.params = {
        sub_module: 'expense',
        id: 'txAfNrce76O',
      };
      spyOn(component, 'redirectToExpenseModule');
      component.ionViewWillEnter();
      fixture.detectChanges();
      tick(500);
      expect(component.redirectToExpenseModule).toHaveBeenCalledTimes(1);
    }));

    it('should call redirectToAdvReqModule() if the sub_module is advReq', fakeAsync(() => {
      activeroutemock.snapshot.params = {
        sub_module: 'advReq',
        id: 'advGzKF1Tne23',
      };
      spyOn(component, 'redirectToAdvReqModule').and.stub();
      component.ionViewWillEnter();
      fixture.detectChanges();
      tick(500);
      expect(component.redirectToAdvReqModule).toHaveBeenCalledTimes(1);
    }));
  });

  it('should call switchOrg method of authService', () => {
    component.switchOrg();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org']);
  });
});
