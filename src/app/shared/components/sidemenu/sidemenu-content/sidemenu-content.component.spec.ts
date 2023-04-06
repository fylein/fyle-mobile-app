import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { FreshChatService } from 'src/app/core/services/fresh-chat.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { SidemenuContentComponent } from './sidemenu-content.component';
import {
  sidemenuItemData1,
  sidemenuItemData2,
  sidemenuItemData3,
  sidemenuItemData4,
} from 'src/app/core/mock-data/sidemenu-item.data';
import { globalCacheBusterNotifier } from 'ts-cacheable';

fdescribe('SidemenuContentComponent', () => {
  let component: SidemenuContentComponent;
  let fixture: ComponentFixture<SidemenuContentComponent>;
  let router: jasmine.SpyObj<Router>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let freshChatService: jasmine.SpyObj<FreshChatService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let menuController: jasmine.SpyObj<MenuController>;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['clearCache']);
    const freshChatServiceSpy = jasmine.createSpyObj('FreshChatService', [
      'setupNetworkWatcher',
      'openLiveChatSupport',
    ]);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['menuItemClicked']);

    const menuControllerSpy = jasmine.createSpyObj('MenuController', ['close']);

    TestBed.configureTestingModule({
      declarations: [SidemenuContentComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: UserEventService, useValue: userEventServiceSpy },
        { provide: FreshChatService, useValue: freshChatServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: MenuController, useValue: menuControllerSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    freshChatService = TestBed.inject(FreshChatService) as jasmine.SpyObj<FreshChatService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    menuController = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;

    fixture = TestBed.createComponent(SidemenuContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call trackingService.menuItemClicked with correct argument', () => {
    component.goToRoute(sidemenuItemData1);
    fixture.detectChanges();
    expect(trackingService.menuItemClicked).toHaveBeenCalledOnceWith({ option: sidemenuItemData1.title });
  });

  it('should toggle isDropdownOpen property when sidemenu item has dropdown options', () => {
    component.goToRoute(sidemenuItemData2);
    fixture.detectChanges();
    expect(sidemenuItemData2.isDropdownOpen).toBe(true); // initial click should open dropdown
    component.goToRoute(sidemenuItemData2);
    fixture.detectChanges();
    expect(sidemenuItemData2.isDropdownOpen).toBe(false); // second click should close dropdown
  });

  it('should close the menucontroller when sidemenu item does not have dropdown options', () => {
    component.goToRoute(sidemenuItemData1);
    expect(sidemenuItemData2.isDropdownOpen).toBe(false);
    expect(menuController.close).toHaveBeenCalledTimes(1);
  });

  it('should clear cache and navigate to the switch_org route', () => {
    const globalCacheSpy = spyOn(globalCacheBusterNotifier, 'next');
    component.goToRoute(sidemenuItemData4);
    fixture.detectChanges();
    expect(userEventService.clearCache).toHaveBeenCalledTimes(1);
    expect(globalCacheSpy).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(sidemenuItemData4.route);
  });
});
