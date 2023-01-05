import { TestBed } from '@angular/core/testing';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  currentEouRes,
  currentEouUnflatted,
  employeesParamsRes,
  employeesRes,
  eouListWithDisabledUser,
  switchToDelegatorParams,
  switchToDelegatorResponse,
  postUserResponse,
  postUserParam,
  postOrgUser,
} from '../test-data/org-user.service.spec.data';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { of } from 'rxjs';
import { OrgUserService } from './org-user.service';
import { TokenService } from './token.service';

describe('OrgUserService', () => {
  let orgUserService: OrgUserService;
  let jwtHelperService: jasmine.SpyObj<JwtHelperService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const jwtHelperServiceSpy = jasmine.createSpyObj('JwtHelperService', ['decodeToken']);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getAccessToken']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['newRefreshToken', 'refreshEou']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['unflatten']);

    TestBed.configureTestingModule({
      providers: [
        OrgUserService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: ApiV2Service,
          useValue: apiv2ServiceSpy,
        },
        {
          provide: JwtHelperService,
          useValue: jwtHelperServiceSpy,
        },
        {
          provide: TokenService,
          useValue: tokenServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: DataTransformService,
          useValue: dataTransformServiceSpy,
        },
      ],
    });
    orgUserService = TestBed.inject(OrgUserService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    jwtHelperService = TestBed.inject(JwtHelperService) as jasmine.SpyObj<JwtHelperService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
  });

  it('should be created', () => {
    expect(orgUserService).toBeTruthy();
  });

  it('should be able to get current eou', (done) => {
    apiService.get.and.returnValue(of(currentEouUnflatted));
    dataTransformService.unflatten.withArgs(currentEouUnflatted).and.returnValue(currentEouRes);

    orgUserService.getCurrent().subscribe((res) => {
      expect(res).toEqual(currentEouRes);
      done();
    });
  });

  it('should be able to get user by ID', (done) => {
    apiService.get.and.returnValue(of(currentEouUnflatted));
    const userId = 'ouhOiO1Tfs3f';
    orgUserService.getUserById(userId).subscribe((res) => {
      expect(res).toEqual(currentEouUnflatted);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith('/eous/' + userId);
  });

  it('should be able to get employees by params', (done) => {
    apiV2Service.get.and.returnValue(of(employeesRes));
    const params = {
      limit: 5,
      order: 'us_full_name.asc,ou_id',
      ou_id: 'not.eq.ouX8dwsbLCLv',
      ou_org_id: 'eq.orNVthTo2Zyo',
      ou_roles: 'like.%ADMIN%',
      ou_status: 'eq."ACTIVE"',
      select: 'us_full_name,us_email',
    };
    orgUserService.getEmployeesByParams(params).subscribe((res) => {
      expect(res).toEqual(employeesRes);
      done();
    });

    expect(apiV2Service.get).toHaveBeenCalledWith('/spender_employees', { params });
  });

  it('should be able to get employees by search with OR param', (done) => {
    const params = {
      order: 'us_full_name.asc,us_email.asc,ou_id',
      us_email: 'in.(ajain@fyle.in)',
      or: '(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS")',
      and: '(or(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS"),or(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS"))',
    };
    apiV2Service.get.and.returnValue(of(employeesParamsRes));
    orgUserService.getEmployeesByParams(params).subscribe((res) => {
      expect(res).toEqual(employeesParamsRes);
    });
    expect(apiV2Service.get).toHaveBeenCalledWith('/spender_employees', { params });
    orgUserService.getEmployeesBySearch(params).subscribe((res) => {
      expect(res).toEqual(employeesParamsRes.data);
      done();
    });
  });

  it('should be able to get employees by search without OR param', (done) => {
    const params = {
      order: 'us_full_name.asc,us_email.asc,ou_id',
      us_email: 'in.(ajain@fyle.in)',
      and: '(or(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS"),or(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS"))',
    };
    apiV2Service.get.and.returnValue(of(employeesParamsRes));
    orgUserService.getEmployeesByParams(params).subscribe((res) => {
      expect(res).toEqual(employeesParamsRes);
    });
    expect(apiV2Service.get).toHaveBeenCalledWith('/spender_employees', { params });
    orgUserService.getEmployeesBySearch(params).subscribe((res) => {
      expect(res).toEqual(employeesParamsRes.data);
      done();
    });
  });

  it('should be able to exclude eou by employee status', () => {
    const status = 'DISABLED';
    const eousFiltered = eouListWithDisabledUser.filter((eou) => status.indexOf(eou.ou.status) === -1);
    expect(orgUserService.excludeByStatus(eouListWithDisabledUser, status)).toEqual(eousFiltered);
  });

  it('should be able to return undefined if eou param is missing when excluding eou by status', () => {
    const status = 'DISABLED';
    expect(orgUserService.excludeByStatus(null, status)).toEqual([]);
  });

  it('should be able to find delegated accounts', (done) => {
    const eouList = [currentEouUnflatted];
    apiService.get.and.returnValue(of(eouList));
    eouList.map((delegatedAccount) =>
      dataTransformService.unflatten.withArgs(delegatedAccount).and.returnValue(currentEouRes)
    );

    orgUserService.findDelegatedAccounts().subscribe((res) => {
      expect(res).toEqual([currentEouRes]);
      done();
    });
  });

  it('should be able to switch to delegator account', (done) => {
    apiService.post.and.returnValue(of(switchToDelegatorResponse));
    authService.newRefreshToken.and.returnValue(of(switchToDelegatorResponse));

    orgUserService.switchToDelegator(switchToDelegatorParams).subscribe((res) => {
      expect(res).toEqual(switchToDelegatorResponse);
      done();
    });
  });

  it('should be able to post user', (done) => {
    apiService.post.and.returnValue(of(postUserResponse));
    orgUserService.postUser(postUserParam).subscribe((res) => {
      expect(res).toEqual(postUserResponse);
      done();
    });
  });

  it('should be able to post org user', (done) => {
    apiService.post.and.returnValue(of(postOrgUser));
    orgUserService.postOrgUser(postOrgUser).subscribe((res) => {
      expect(res).toEqual(postOrgUser);
      done();
    });
  });
});
