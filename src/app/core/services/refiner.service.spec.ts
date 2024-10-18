import { TestBed } from '@angular/core/testing';
import { CurrencyService } from './currency.service';
import { RefinerService } from './refiner.service';
import { AuthService } from './auth.service';
import { NetworkService } from './network.service';
import { OrgUserService } from './org-user.service';
import { of } from 'rxjs';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { ExtendedOrgUser } from '../models/extended-org-user.model';

xdescribe('RefinerService', () => {
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

  it('setupNetworkWatcher(): should setup a network watcher', () => {
    const emitterSpy = jasmine.createSpyObj('EventEmitter', ['asObservable']);
    emitterSpy.asObservable.and.returnValue(of(true));
    refinerService.setupNetworkWatcher();
    networkService.isOnline.and.returnValue(of(true));

    expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(2);
    expect(networkService.isOnline).toHaveBeenCalledTimes(2);
  });

  describe('getRegion(): should return region', () => {
    it('should return "India" for INR currency', () => {
      expect(refinerService.getRegion('INR')).toEqual('India');
    });

    it('should return "International Americas" for USD', () => {
      expect(refinerService.getRegion('USD')).toEqual('International Americas');
    });

    it('should return correct region for APAC currency', () => {
      expect(refinerService.getRegion('AUD')).toEqual('International APAC');
    });

    it('should return correct region for Middle East Africa currency', () => {
      expect(refinerService.getRegion('AED')).toEqual('International Africa');
    });

    it('should return correct region for Europe currency', () => {
      expect(refinerService.getRegion('EUR')).toEqual('Europe');
    });

    it('should return "Undefined" for unsupported currency', () => {
      expect(refinerService.getRegion('XYZ')).toEqual('Undefined');
    });

    it('should return "Undefined" for empty currency', () => {
      expect(refinerService.getRegion('')).toEqual('Undefined');
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
  });
});
