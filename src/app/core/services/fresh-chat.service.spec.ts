import { TestBed } from '@angular/core/testing';
import { FreshChatService } from './fresh-chat.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { NetworkService } from './network.service';
import { of } from 'rxjs';
import { orgUserSettingsData } from '../mock-data/org-user-settings.data';

describe('FreshChatService', () => {
  let freshChatService: FreshChatService;
  let authService: jasmine.SpyObj<AuthService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let networkService: jasmine.SpyObj<NetworkService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get', 'post']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    TestBed.configureTestingModule({
      providers: [
        FreshChatService,
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
      ],
    });
    freshChatService = TestBed.inject(FreshChatService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
  });

  it('should be created', () => {
    expect(freshChatService).toBeTruthy();
  });

  it('getOrgUserSettings(): should get org user settings', (done) => {
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));

    //@ts-ignore
    freshChatService.getOrgUserSettings().then((res) => {
      expect(res).toEqual(orgUserSettingsData);
      done();
    });
  });
});
