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
import { of } from 'rxjs';
import { apiAccessTokenRes } from '../core/mock-data/acess-token-data.data';
import { apiEouRes } from '../core/mock-data/extended-org-user.data';

fdescribe('DeepLinkRedirectionPage', () => {
  let component: DeepLinkRedirectionPage;
  let fixture: ComponentFixture<DeepLinkRedirectionPage>;
  let router: jasmine.SpyObj<Router>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let reportService: jasmine.SpyObj<ReportService>;
  let authService: jasmine.SpyObj<AuthService>;
  let activatedRouteMock: any;

  // eslint-disable-next-line prefer-const
  activatedRouteMock = {
    snapshot: {
      params: {
        sub_module: 'report',
        id: 'rprAfNrce73O',
      },
    },
  };

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', ['getEReq']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getETxnUnflattened']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getERpt']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);

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
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    reportService.getERpt.and.returnValue(of(expectedSingleErpt));
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    fixture = TestBed.createComponent(DeepLinkRedirectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to report module', fakeAsync(() => {
    activatedRouteMock.snapshot.params.sub_module = 'report';
    activatedRouteMock.snapshot.params.id = 'rprAfNrce73O';

    fixture.detectChanges();
    expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading....');
    tick(500);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    tick(500);
    expect(reportService.getERpt).toHaveBeenCalledOnceWith(activatedRouteMock.snapshot.params.id);
    expect(router.navigate).toHaveBeenCalledWith([
      '/',
      'enterprise',
      'my_view_report',
      { id: activatedRouteMock.snapshot.params.id },
    ]);
  }));
});
