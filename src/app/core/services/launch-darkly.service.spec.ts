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

  it('isTheSameUser(): should check if the user is same', () => {
    //@ts-ignore
    expect(launchDarklyService.isTheSameUser(lDUser)).toBeFalse();
  });

  xit('updateCache(): should update cache', () => {
    storageService.set.and.callThrough();
    //@ts-ignore
    launchDarklyService.updateCache();
  });

  xit('initializeUser(): should initialize user', () => {
    //@ts-ignore
    spyOn(launchDarklyService, 'updateCache').and.callThrough();
    launchDarklyService.initializeUser(lDUser);
  });

  describe('getVariation():', () => {
    it('should get variation', (done) => {
      const key = 'keyboard_plugin_enabled';
      storageService.get.and.returnValue(Promise.resolve(ldAllFlagsRes));

      launchDarklyService.getVariation(key, true).subscribe((res) => {
        expect(res).toBeTrue();
        done();
      });
    });

    it('should return default value when flags are not available', (done) => {
      const key = 'keyboard_plugin_enabled';
      storageService.get.and.returnValue(Promise.resolve(null));

      launchDarklyService.getVariation(key, true).subscribe((res) => {
        expect(res).toBeTrue();
        done();
      });
    });
  });

  xit('shutDownClient(): should shut down client', () => {
    launchDarklyService.shutDownClient();
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
});
