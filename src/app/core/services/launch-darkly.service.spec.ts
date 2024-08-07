import { TestBed } from '@angular/core/testing';
import { LaunchDarklyService } from './launch-darkly.service';
import { UserEventService } from './user-event.service';
import * as LDClient from 'launchdarkly-js-client-sdk';
import { StorageService } from './storage.service';
import { lDUser } from '../mock-data/ld-client-user.data';
import { ldAllFlagsRes } from '../mock-data/ld-all-flags.data';
import { of } from 'rxjs';

describe('LaunchDarklyService', () => {
  let launchDarklyService: LaunchDarklyService;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let ldClient: LDClient.LDClient;

  beforeEach(() => {
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['onLogout']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);

    TestBed.configureTestingModule({
      providers: [
        LaunchDarklyService,
        {
          provide: UserEventService,
          useValue: userEventServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
      ],
    });
    launchDarklyService = TestBed.inject(LaunchDarklyService);
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(launchDarklyService).toBeTruthy();
  });

  it('should call shutDownClient on userEventService logout', () => {
    spyOn(launchDarklyService, 'shutDownClient');

    userEventService.onLogout.calls.mostRecent().args[0]();
    expect(launchDarklyService.shutDownClient).toHaveBeenCalledTimes(1);
  });

  it('isTheSameUser(): should check if the user is same', () => {
    //@ts-ignore
    expect(launchDarklyService.isTheSameUser(lDUser)).toBeFalse();
  });

  describe('getVariation():', () => {
    it('should get variation', (done) => {
      const key = 'keyboard_plugin_enabled';
      storageService.get.and.resolveTo(ldAllFlagsRes);

      launchDarklyService.getVariation(key, true).subscribe((res) => {
        expect(res).toBeTrue();
        done();
      });
    });

    it('should return default value when flags are not available', (done) => {
      const key = 'keyboard_plugin_enabled';
      storageService.get.and.resolveTo(null);

      launchDarklyService.getVariation(key, true).subscribe((res) => {
        expect(res).toBeTrue();
        done();
      });
    });
  });

  it('checkIfKeyboardPluginIsEnabled(): check if keyboard plugin is enabled', (done) => {
    spyOn(launchDarklyService, 'getVariation').and.returnValue(of(true));
    const key = 'keyboard_plugin_enabled';

    launchDarklyService.checkIfKeyboardPluginIsEnabled().subscribe((res) => {
      expect(res).toBeTrue();
      expect(launchDarklyService.getVariation).toHaveBeenCalledOnceWith('keyboard_plugin_enabled', true);
      done();
    });
  });

  it('checkIfNegativeExpensePluginIsEnabled(): should check if negative expense plugin is enabled', (done) => {
    spyOn(launchDarklyService, 'getVariation').and.returnValue(of(true));
    const key = 'numeric-keypad';

    launchDarklyService.checkIfNegativeExpensePluginIsEnabled().subscribe((res) => {
      expect(res).toBeTrue();
      expect(launchDarklyService.getVariation).toHaveBeenCalledOnceWith(key, false);
      done();
    });
  });

  it('checkIfAndroidNegativeExpensePluginIsEnabled(): should check if android negative expense plugin is enabled', (done) => {
    spyOn(launchDarklyService, 'getVariation').and.returnValue(of(true));
    const key = 'android-numeric-keypad';

    launchDarklyService.checkIfAndroidNegativeExpensePluginIsEnabled().subscribe((res) => {
      expect(res).toBeTrue();
      expect(launchDarklyService.getVariation).toHaveBeenCalledOnceWith(key, false);
      done();
    });
  });

  describe('shutDownClient():', () => {
    beforeEach(() => {
      ldClient = jasmine.createSpyObj('LDClient', ['off', 'close']);
      launchDarklyService.ldClient = ldClient;
    });

    it('should shut down LD client if it exists', () => {
      launchDarklyService.shutDownClient();
      expect(ldClient.off).toHaveBeenCalledWith('initialized', jasmine.any(Function), launchDarklyService);
      expect(ldClient.off).toHaveBeenCalledWith('change', jasmine.any(Function), launchDarklyService);
      expect(ldClient.close).toHaveBeenCalled();
      expect(launchDarklyService.ldClient).toBeNull();
    });

    it('should not throw error if LD client does not exist', () => {
      launchDarklyService.ldClient = null;
      expect(() => launchDarklyService.shutDownClient()).not.toThrow();
    });
  });
});
