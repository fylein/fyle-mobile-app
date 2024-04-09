import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FreshChatService } from './fresh-chat.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { NetworkService } from './network.service';
import { of } from 'rxjs';
import { orgUserSettingsData, orgUserSettingsData2 } from '../mock-data/org-user-settings.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { FreshChatWidget } from '../models/fresh-chat-widget.model';

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
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('initialize(): should get initialize freshchat', () => {
    //@ts-ignore
    spyOn(freshChatService, 'initFreshChat').and.returnValue(null);
    //@ts-ignore
    freshChatService.initialize(document, 'freshchat-js-sdk');
    //@ts-ignore
    freshChatService.initiateCall();
    //@ts-ignore
    expect(freshChatService.initFreshChat).toHaveBeenCalledTimes(1);
  });

  describe('setupNetworkWatcher():', () => {
    beforeEach(() => {
      //@ts-ignore
      spyOn(freshChatService, 'initiateCall');
      networkService.isOnline.and.returnValue(of(true));
      authService.getEou.and.resolveTo(apiEouRes);
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
    });

    it('should setup network watcher', fakeAsync(() => {
      freshChatService.setupNetworkWatcher();
      tick(100);

      expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
      expect(networkService.isOnline).toHaveBeenCalledTimes(1);
      //@ts-ignore
      expect(freshChatService.initiateCall).toHaveBeenCalledTimes(1);
      expect(storageService.set).toHaveBeenCalledOnceWith('inAppChatRestoreId', null);
    }));

    it('should not setup freshchat sdk if fresh chat settings is undefined', fakeAsync(() => {
      orgUserSettingsService.get.and.returnValue(of({ ...orgUserSettingsData, in_app_chat_settings: undefined }));
      freshChatService.setupNetworkWatcher();
      tick(100);

      expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
      expect(networkService.isOnline).toHaveBeenCalledTimes(1);
      //@ts-ignore
      expect(freshChatService.initiateCall).not.toHaveBeenCalled();
      expect(storageService.set).not.toHaveBeenCalled();
    }));

    it('should not setup freshchat sdk if org user setting is undefined', fakeAsync(() => {
      orgUserSettingsService.get.and.returnValue(of(undefined));
      freshChatService.setupNetworkWatcher();
      tick(100);

      expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
      expect(networkService.isOnline).toHaveBeenCalledTimes(1);
      //@ts-ignore
      expect(freshChatService.initiateCall).not.toHaveBeenCalled();
      expect(storageService.set).not.toHaveBeenCalled();
    }));
  });

  it('getWindow(): should get window object', () => {
    expect(freshChatService.getWindow()).toEqual(window);
  });

  describe('openLiveChatSupport():', () => {
    it('should open live chat support', () => {
      const openSpy = jasmine.createSpy('open');
      const mockWindow = jasmine.createSpyObj('window', ['fcWidget']);
      mockWindow.fcWidget = {
        open: openSpy,
      };
      spyOn(freshChatService, 'getWindow').and.returnValue(mockWindow);
      freshChatService.openLiveChatSupport();
      expect(openSpy).toHaveBeenCalledTimes(1);
    });

    it('should not open live chat support if fresh chat widget is undefined', () => {
      const openSpy = jasmine.createSpy('open');
      const mockWindow = jasmine.createSpyObj('window', ['fcWidget']);
      mockWindow.fcWidget = undefined;
      spyOn(freshChatService, 'getWindow').and.returnValue(mockWindow);
      freshChatService.openLiveChatSupport();
      expect(openSpy).not.toHaveBeenCalled();
    });

    it('should not open live chat support if window is undefined', () => {
      const openSpy = jasmine.createSpy('open');
      spyOn(freshChatService, 'getWindow').and.returnValue(undefined);
      freshChatService.openLiveChatSupport();
      expect(openSpy).not.toHaveBeenCalled();
    });
  });

  describe('destroy():', () => {
    it('should destroy fresh chat widget', () => {
      const destroySpy = jasmine.createSpy('destroy');
      const mockWindow = jasmine.createSpyObj('window', ['fcWidget']);
      mockWindow.fcWidget = {
        destroy: destroySpy,
      };
      spyOn(freshChatService, 'getWindow').and.returnValue(mockWindow);
      freshChatService.destroy();
      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('should not destroy if fresh chat widget is undefined', () => {
      const destroySpy = jasmine.createSpy('destroy');
      const mockWindow = jasmine.createSpyObj('window', ['fcWidget']);
      mockWindow.fcWidget = undefined;
      spyOn(freshChatService, 'getWindow').and.returnValue(mockWindow);
      freshChatService.destroy();
      expect(destroySpy).not.toHaveBeenCalled();
    });

    it('should not destroy fresh chat widget if window is undefined', () => {
      const destroySpy = jasmine.createSpy('destroy');
      spyOn(freshChatService, 'getWindow').and.returnValue(undefined);
      freshChatService.destroy();
      expect(destroySpy).not.toHaveBeenCalled();
    });
  });
});
