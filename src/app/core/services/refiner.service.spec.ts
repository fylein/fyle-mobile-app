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

  it('setupNetworkWatcher(): should setup a network watcher', () => {
    const emitterSpy = jasmine.createSpyObj('EventEmitter', ['asObservable']);
    emitterSpy.asObservable.and.returnValue(of(true));
    refinerService.setupNetworkWatcher();
    networkService.isOnline.and.returnValue(of(true));
    expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(2);
    expect(networkService.isOnline).toHaveBeenCalledTimes(2);
  });

  it('getRegion(): should return region', () => {
    expect(refinerService.getRegion('INR')).toEqual('India');
    expect(refinerService.getRegion('USD')).toEqual('International Americas');
    expect(refinerService.getRegion('EUR')).toEqual('Europe');
    expect(refinerService.getRegion('AUD')).toEqual('International APAC');
    expect(refinerService.getRegion('AED')).toEqual('International Africa');
    expect(refinerService.getRegion('')).toEqual('Undefined');
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
  });

  describe('canStartSurvey():', () => {
    it('should return true for non-demo orgs and when not switched to delegator', (done) => {
      spyOn(refinerService, 'isNonDemoOrg').and.returnValue(true);
      const switchedToDelegator = false;
      orgUserService.isSwitchedToDelegator.and.returnValue(Promise.resolve(switchedToDelegator));
      const homeCurrency = 'INR';
      const eou = apiEouRes;
      refinerService.canStartSurvey(homeCurrency, eou).subscribe((res) => {
        expect(res).toBeTrue();
        expect(orgUserService.isSwitchedToDelegator).toHaveBeenCalledTimes(1);
        expect(refinerService.isNonDemoOrg).toHaveBeenCalledOnceWith('Staging Loaded');
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
      orgUserService.isSwitchedToDelegator.and.returnValue(Promise.resolve(switchedToDelegator));
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
