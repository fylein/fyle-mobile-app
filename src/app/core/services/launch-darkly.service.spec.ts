import { TestBed } from '@angular/core/testing';
import { LaunchDarklyService } from './launch-darkly.service';
import { UserEventService } from './user-event.service';
import * as LDClient from 'launchdarkly-js-client-sdk';
import { StorageService } from './storage.service';
import { lDUser } from '../mock-data/ld-client-user.data';
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
});
