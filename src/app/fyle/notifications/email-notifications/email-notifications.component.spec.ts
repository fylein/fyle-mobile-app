import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ModalController, Platform, PopoverController } from '@ionic/angular/standalone';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { NotificationEventItem } from 'src/app/core/models/notification-event-item.model';
import { NotificationEventsEnum } from 'src/app/core/models/notification-events.enum';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { EmailNotificationsComponent } from './email-notifications.component';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { employeeSettingsData } from 'src/app/core/mock-data/employee-settings.data';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { PushNotifications } from '@capacitor/push-notifications';
import { AndroidSettings, IOSSettings } from 'capacitor-native-settings';

describe('EmailNotificationsComponent', () => {
  let component: EmailNotificationsComponent;
  let fixture: ComponentFixture<EmailNotificationsComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let platform: jasmine.SpyObj<Platform>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockNotifications: NotificationEventItem[] = [
    {
      eventEnum: NotificationEventsEnum.ESTATUSES_CREATED_TXN,
      event: 'Expense Created',
      email: true,
    },
    {
      eventEnum: NotificationEventsEnum.ERPTS_SUBMITTED,
      event: 'Expense Submitted',
      email: false,
    },
  ];

  const mockUnsubscribedEventsByUser = [NotificationEventsEnum.ESTATUSES_CREATED_TXN];

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', [
      'post',
      'clearEmployeeSettings',
    ]);
    const trackingServiceSpy = jasmine.createSpyObj<TrackingService>('TrackingService', [
      'eventTrack',
      'showToastMessage',
    ]);
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', ['getVariation']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', [
      'setSnackbarProperties',
    ]);

    translocoServiceSpy.translate.and.callFake((key: string) => key);
    snackbarPropertiesServiceSpy.setSnackbarProperties.and.returnValue({});
    launchDarklyServiceSpy.getVariation.and.returnValue(of(false));

    popoverControllerSpy.create.and.resolveTo({
      present: () => Promise.resolve(),
      onWillDismiss: () => Promise.resolve({ data: undefined }),
    } as any);

    spyOn(PushNotifications as any, 'checkPermissions').and.resolveTo({ receive: 'granted' } as any);

    TestBed.configureTestingModule({
      imports: [EmailNotificationsComponent, MatIconTestingModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: Platform,
          useValue: platformSpy,
        },
        {
          provide: PlatformEmployeeSettingsService,
          useValue: platformEmployeeSettingsServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: LaunchDarklyService,
          useValue: launchDarklyServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailNotificationsComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService,
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    component.title = 'Email Notifications';
    component.notifications = cloneDeep(mockNotifications);
    component.unsubscribedEventsByUser = cloneDeep(mockUnsubscribedEventsByUser);
    component.employeeSettings = cloneDeep(employeeSettingsData);
    platformEmployeeSettingsService.post.and.returnValue(of(null));
    platformEmployeeSettingsService.clearEmployeeSettings.and.returnValue(of(null));
    platform.is.and.returnValue(false);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit():', () => {
    it('should initialize component and set iOS platform', () => {
      platform.is.and.returnValue(true);
      spyOn(component, 'updateSelectAll');

      component.ngOnInit();

      expect(platform.is).toHaveBeenCalledWith('ios');
      expect(component.isIos).toBeTrue();
      expect(component.updateSelectAll).toHaveBeenCalledTimes(1);
    });

    it('should set iOS platform to false for non-iOS devices', () => {
      platform.is.and.returnValue(false);
      spyOn(component, 'updateSelectAll');

      component.ngOnInit();

      expect(component.isIos).toBeFalse();
      expect(component.updateSelectAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateSaveText():', () => {
    it('should update save text to "Saving..."', () => {
      component.updateSaveText('Saving...');
      expect(component.saveText).toBe('Saving...');
    });
  });

  describe('closeModal():', () => {
    it('should not dismiss the modal directly when there are unsaved changes', async () => {
      component.hasChanges = true;

      await component.closeModal();

      expect(modalController.dismiss).not.toHaveBeenCalled();
    });

    it('should reset changes and dismiss the modal when user chooses discard in unsaved changes popover', async () => {
      component.hasChanges = true;

      const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverSpy.present.and.resolveTo();
      popoverSpy.onWillDismiss.and.resolveTo({
        data: { action: 'discard' },
      } as any);

      (popoverController.create as jasmine.Spy).and.resolveTo(popoverSpy);

      await component.closeModal();

      expect(component.hasChanges).toBeFalse();
      expect(modalController.dismiss).toHaveBeenCalledWith({
        employeeSettingsUpdated: false,
      });
    });
  });

  describe('updateSelectAll():', () => {
    it('should set selectAll to true when all notifications have email enabled', () => {
      component.notifications = [
        { eventEnum: NotificationEventsEnum.ESTATUSES_CREATED_TXN, event: 'Expense Created', email: true },
        { eventEnum: NotificationEventsEnum.ERPTS_SUBMITTED, event: 'Expense Submitted', email: true },
      ];

      component.updateSelectAll();

      expect(component.selectAllEmail).toBeTrue();
    });

    it('should set selectAll to false when not all notifications have email enabled', () => {
      component.notifications = [
        { eventEnum: NotificationEventsEnum.ESTATUSES_CREATED_TXN, event: 'Expense Created', email: true },
        { eventEnum: NotificationEventsEnum.ERPTS_SUBMITTED, event: 'Expense Submitted', email: false },
      ];

      component.updateSelectAll();

      expect(component.selectAllEmail).toBeFalse();
    });
  });

  describe('toggleAllNotifications():', () => {
    it('should toggle all notifications to selected', () => {
      spyOn(component, 'updateSelectAll');
      spyOn(component, 'updateNotificationSettings');

      component.toggleAllNotifications(true, 'email');

      expect(component.notifications.every((n) => n.email)).toBeTrue();
      expect(component.updateSelectAll).toHaveBeenCalledTimes(1);
      expect(component.updateNotificationSettings).toHaveBeenCalledTimes(1);
    });

    it('should toggle all notifications to unselected', () => {
      spyOn(component, 'updateSelectAll');
      spyOn(component, 'updateNotificationSettings');

      component.toggleAllNotifications(false, 'email');

      expect(component.notifications.every((n) => !n.email)).toBeTrue();
      expect(component.updateSelectAll).toHaveBeenCalledTimes(1);
      expect(component.updateNotificationSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggleNotification():', () => {
    it('should toggle specific notification', () => {
      const notificationToBeToggled = component.notifications.find(
        (n) => n.eventEnum === NotificationEventsEnum.ESTATUSES_CREATED_TXN,
      );

      spyOn(component, 'updateSelectAll');
      spyOn(component, 'updateNotificationSettings');

      component.toggleNotification(notificationToBeToggled);

      const toggledNotification = component.notifications.find(
        (n) => n.eventEnum === NotificationEventsEnum.ESTATUSES_CREATED_TXN,
      );
      expect(toggledNotification.email).toBeFalse();
      expect(component.updateSelectAll).toHaveBeenCalledTimes(1);
      expect(component.updateNotificationSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateNotificationSettings():', () => {
    it('should update unsubscribed events and mark changes as pending', () => {
      component.updateNotificationSettings();

      expect(component.employeeSettings.notification_settings.email_unsubscribed_events).toContain(
        NotificationEventsEnum.ERPTS_SUBMITTED,
      );
      expect(component.hasChanges).toBeTrue();
    });

    it('should merge other push-unsubscribed events with current modal selection', () => {
      component.notifications = [
        {
          eventEnum: NotificationEventsEnum.ESTATUSES_CREATED_TXN,
          event: 'Expense Created',
          email: true,
          mobile: true,
        } as any,
        {
          eventEnum: NotificationEventsEnum.ERPTS_SUBMITTED,
          event: 'Expense Submitted',
          email: true,
          mobile: false,
        } as any,
      ];

      Object.defineProperty(component, 'unsubscribedPushEventsByUser', {
        value: () => ['some-other-event', NotificationEventsEnum.ERPTS_SUBMITTED],
        configurable: true,
      });
      component.employeeSettings.notification_settings.push_unsubscribed_events = [];

      component.updateNotificationSettings();

      expect(component.employeeSettings.notification_settings.push_unsubscribed_events).toEqual([
        'some-other-event',
        NotificationEventsEnum.ERPTS_SUBMITTED,
      ]);
      expect(component.hasChanges).toBeTrue();
    });
  });

  describe('updateEmployeeSettings():', () => {
    it('should update employee settings and dismiss the modal', fakeAsync(() => {
      const showSuccessToastSpy = spyOn<any>(component as any, 'showSuccessToast');

      component.updateEmployeeSettings();
      tick();

      expect(platformEmployeeSettingsService.post).toHaveBeenCalledWith(component.employeeSettings);
      expect(platformEmployeeSettingsService.clearEmployeeSettings).toHaveBeenCalledTimes(1);
      expect(showSuccessToastSpy).toHaveBeenCalledTimes(1);
      expect(modalController.dismiss).toHaveBeenCalledWith({ employeeSettingsUpdated: true });
      expect(component.saveChangesLoader).toBeFalse();
    }));
  });

  describe('showSuccessToast():', () => {
    it('should show success toast with translated message and track it', () => {
      (component as any).showSuccessToast();

      expect(translocoService.translate).toHaveBeenCalledWith(
        'emailNotifications.notificationsUpdatedSuccessMessage',
      );
      expect(matSnackBar.openFromComponent).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          panelClass: 'msb-success',
        }),
      );
      expect(trackingService.showToastMessage).toHaveBeenCalledWith({
        ToastContent: 'emailNotifications.notificationsUpdatedSuccessMessage',
      });
    });
  });

  describe('openDeviceSettings():', () => {
    it('should open native app settings on the device', () => {
      component.nativeSettings = jasmine.createSpyObj('NativeSettings', ['open']) as any;

      component.openDeviceSettings();

      expect(component.nativeSettings.open).toHaveBeenCalledWith({
        optionAndroid: AndroidSettings.ApplicationDetails,
        optionIOS: IOSSettings.App,
      });
    });
  });

  describe('saveChanges():', () => {
    it('should update notification settings, persist changes and track event', () => {
      spyOn(component, 'updateNotificationSettings');
      spyOn(component, 'updateEmployeeSettings');

      component.saveChanges();

      expect(component.updateNotificationSettings).toHaveBeenCalledTimes(1);
      expect(component.updateEmployeeSettings).toHaveBeenCalledTimes(1);
      expect(trackingService.eventTrack).toHaveBeenCalledWith('Email notifications updated from mobile app', {
        unsubscribedEvents:
          component.employeeSettings.notification_settings.email_unsubscribed_events,
        pushUnsubscribedEvents:
          component.employeeSettings.notification_settings.push_unsubscribed_events,
      });
      expect(component.hasChanges).toBeFalse();
    });

    it('should use empty array for pushUnsubscribedEvents when push_unsubscribed_events is undefined', () => {
      spyOn(component, 'updateNotificationSettings');
      spyOn(component, 'updateEmployeeSettings');
      component.employeeSettings.notification_settings.push_unsubscribed_events = undefined as any;

      component.saveChanges();

      const trackingCallArgs = (trackingService.eventTrack as jasmine.Spy).calls.mostRecent().args[1];
      expect(trackingCallArgs.pushUnsubscribedEvents).toEqual([]);
    });
  });
});
