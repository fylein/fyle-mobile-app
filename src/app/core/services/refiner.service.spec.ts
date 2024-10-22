import { TestBed } from '@angular/core/testing';
import { CurrencyService } from './currency.service';
import { RefinerService } from './refiner.service';
import { AuthService } from './auth.service';
import { NetworkService } from './network.service';
import { OrgUserService } from './org-user.service';
import { of } from 'rxjs';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { ExtendedOrgUser } from '../models/extended-org-user.model';

describe('RefinerService', () => {
  let refinerService: RefinerService;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let authService: jasmine.SpyObj<AuthService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;

  beforeEach(() => {
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['isSwitchedToDelegator']);

    TestBed.configureTestingModule({
      providers: [
        RefinerService,
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
      ],
    });
    refinerService = TestBed.inject(RefinerService);
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
  });

  it('should be created', () => {
    expect(refinerService).toBeTruthy();
  });

  describe('setupNetworkWatcher', () => {
    it('should setup a network watcher', () => {
      const emitterSpy = jasmine.createSpyObj('EventEmitter', ['asObservable']);
      emitterSpy.asObservable.and.returnValue(of(true));
      refinerService.setupNetworkWatcher();
      networkService.isOnline.and.returnValue(of(true));

      expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(2);
      expect(networkService.isOnline).toHaveBeenCalledTimes(2);
    });
  });

  describe('getRegion', () => {
    const testCases = [
      { currency: 'INR', expected: 'India' },
      { currency: 'USD', expected: 'International Americas' },
      { currency: 'AUD', expected: 'International APAC' },
      { currency: 'AED', expected: 'International Africa' },
      { currency: 'EUR', expected: 'Europe' },
      { currency: 'ZAR', expected: 'International Africa' },
      { currency: 'XYZ', expected: 'Undefined' },
      { currency: null, expected: 'Undefined' },
      { currency: undefined, expected: 'Undefined' },
      { currency: '', expected: 'Undefined' },
    ];

    testCases.forEach(({ currency, expected }) => {
      it(`should return "${expected}" for currency "${currency}"`, () => {
        expect(refinerService.getRegion(currency)).toEqual(expected);
      });
    });
  });

  describe('isNonDemoOrg():', () => {
    it('should return true for non-demo orgs', () => {
      const orgName = 'Acme Corp';
      expect(refinerService.isNonDemoOrg(orgName)).toBeTrue();
    });

    it('should return false for demo orgs', () => {
      const orgName = 'Fyle for Acme Corp';
      expect(refinerService.isNonDemoOrg(orgName)).toBeFalse();
    });

    it('should be case insensitive', () => {
      const orgName = 'Fyle For Test Corp';
      expect(refinerService.isNonDemoOrg(orgName)).toBeFalse();
    });
  });

  describe('canStartSurvey():', () => {
    it('should return false if eou is undefined', (done) => {
      const demoOrgRes: ExtendedOrgUser = undefined;
      const homeCurrency = 'INR';
      const eou = demoOrgRes;

      refinerService.canStartSurvey(homeCurrency, eou).subscribe((res) => {
        expect(res).toBeFalse();
        done();
      });
    });

    it('should return false if ou is undefined', (done) => {
      const demoOrgRes: ExtendedOrgUser = { ...apiEouRes, ou: undefined };
      const homeCurrency = 'INR';
      const eou = demoOrgRes;

      refinerService.canStartSurvey(homeCurrency, eou).subscribe((res) => {
        expect(res).toBeFalse();
        done();
      });
    });

    it('should return false if org_name is undefined', (done) => {
      const demoOrgRes: ExtendedOrgUser = { ...apiEouRes, ou: { ...apiEouRes.ou, org_name: undefined } };
      const homeCurrency = 'INR';
      const eou = demoOrgRes;

      refinerService.canStartSurvey(homeCurrency, eou).subscribe((res) => {
        expect(res).toBeFalse();
        done();
      });
    });

    it('should return true for non-demo orgs and when not switched to delegator', (done) => {
      spyOn(refinerService, 'isNonDemoOrg').and.returnValue(true);
      const switchedToDelegator = false;
      orgUserService.isSwitchedToDelegator.and.resolveTo(switchedToDelegator);
      const homeCurrency = 'INR';
      const eou = apiEouRes;

      refinerService.canStartSurvey(homeCurrency, eou).subscribe((res) => {
        expect(res).toBeTrue();
        expect(orgUserService.isSwitchedToDelegator).toHaveBeenCalledTimes(1);
        expect(refinerService.isNonDemoOrg).toHaveBeenCalledOnceWith('Staging Loaded');
        done();
      });
    });

    it('should return false for demo orgs', (done) => {
      const switchedToDelegator = false;
      const demoOrgRes: ExtendedOrgUser = {
        ...apiEouRes,
        ou: {
          ...apiEouRes.ou,
          org_name: 'Fyle for Acme Corp',
        },
      };
      const homeCurrency = 'INR';
      const eou = demoOrgRes;
      spyOn(refinerService, 'isNonDemoOrg').and.returnValue(false);
      orgUserService.isSwitchedToDelegator.and.resolveTo(switchedToDelegator);

      refinerService.canStartSurvey(homeCurrency, eou).subscribe((res) => {
        expect(res).toBeFalse();
        done();
      });
    });

    it('should return false when switched to delegator', (done) => {
      const switchedToDelegator = true;
      const homeCurrency = 'INR';
      const eou = apiEouRes;
      spyOn(refinerService, 'isNonDemoOrg').and.returnValue(true);
      orgUserService.isSwitchedToDelegator.and.resolveTo(switchedToDelegator);

      refinerService.canStartSurvey(homeCurrency, eou).subscribe((res) => {
        expect(res).toBeFalse();
        done();
      });
    });

    it('should return false for demo orgs and when switched to delegator', (done) => {
      const demoOrgRes: ExtendedOrgUser = {
        ...apiEouRes,
        ou: {
          ...apiEouRes.ou,
          org_name: 'Fyle for Acme Corp',
        },
      };
      spyOn(refinerService, 'isNonDemoOrg').and.returnValue(false);
      const switchedToDelegator = true;
      orgUserService.isSwitchedToDelegator.and.resolveTo(switchedToDelegator);
      const homeCurrency = 'INR';
      const eou = demoOrgRes;
      refinerService.canStartSurvey(homeCurrency, eou).subscribe((res) => {
        expect(res).toBeFalse();
        expect(orgUserService.isSwitchedToDelegator).toHaveBeenCalledTimes(1);
        expect(refinerService.isNonDemoOrg).toHaveBeenCalledOnceWith('Fyle for Acme Corp');
        done();
      });
    });

    it('should return false for non-demo orgs but switched to delegator', (done) => {
      const eou = { ou: { org_name: 'Acme Corp' } } as ExtendedOrgUser;
      spyOn(refinerService, 'isNonDemoOrg').and.returnValue(true);
      orgUserService.isSwitchedToDelegator.and.resolveTo(true);

      refinerService.canStartSurvey('INR', eou).subscribe((res) => {
        expect(res).toBeFalse();
        expect(orgUserService.isSwitchedToDelegator).toHaveBeenCalledTimes(1);
        expect(refinerService.isNonDemoOrg).toHaveBeenCalledWith('Acme Corp');
        done();
      });
    });
  });
});
