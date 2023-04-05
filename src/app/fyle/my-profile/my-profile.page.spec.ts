import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MyProfilePage } from './my-profile.page';
import { AuthService } from 'src/app/core/services/auth.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { OrgService } from 'src/app/core/services/org.service';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('MyProfilePage', () => {
  let component: MyProfilePage;
  let fixture: ComponentFixture<MyProfilePage>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let userEventService: UserEventService;
  let secureStorageService: SecureStorageService;
  let storageService: StorageService;
  let deviceService: DeviceService;
  let loaderService: LoaderService;
  let tokenService: TokenService;
  let trackingService: TrackingService;
  let orgService: OrgService;
  let networkService: jasmine.SpyObj<NetworkService>;
  let orgSettingsService: OrgSettingsService;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'logout']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);

    TestBed.configureTestingModule({
      declarations: [MyProfilePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), MatRippleModule, MatIconModule, MatIconTestingModule, HttpClientTestingModule],
      providers: [
        UserEventService,
        StorageService,
        DeviceService,
        LoaderService,
        TokenService,
        TrackingService,
        OrgService,
        OrgSettingsService,
        SecureStorageService,
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: NetworkService,
          userValue: networkServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyProfilePage);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    storageService = TestBed.inject(StorageService);
    userEventService = TestBed.inject(UserEventService);
    deviceService = TestBed.inject(DeviceService);
    loaderService = TestBed.inject(LoaderService);
    tokenService = TestBed.inject(TokenService);
    orgService = TestBed.inject(OrgService);
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    orgSettingsService = TestBed.inject(OrgSettingsService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update isConnected inside setupNetworkWatcher', () => {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    spyOn(networkService, 'connectivityWatcher');
    spyOn(networkService, 'isOnline').and.returnValue(of(false));
    component.setupNetworkWatcher();
    expect(networkService.connectivityWatcher).toHaveBeenCalledOnceWith(networkWatcherEmitter);
    expect(networkService.isOnline).toHaveBeenCalledTimes(1);
    expect(component.isConnected$).toBeDefined();
    let isConnectedValue: boolean;
    component.isConnected$.subscribe((value: boolean) => {
      isConnectedValue = value;
    });
    networkWatcherEmitter.next(true);
    expect(isConnectedValue).toBeFalse();
    networkWatcherEmitter.next(false);
    expect(isConnectedValue).toBeFalse();
  });
});
