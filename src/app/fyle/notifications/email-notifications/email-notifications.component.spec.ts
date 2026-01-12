import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ModalController, Platform } from '@ionic/angular/standalone';
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

describe('EmailNotificationsComponent', () => {
  let component: EmailNotificationsComponent;
  let fixture: ComponentFixture<EmailNotificationsComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let platform: jasmine.SpyObj<Platform>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  let trackingService: jasmine.SpyObj<TrackingService>;

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
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', [
      'post',
      'clearEmployeeSettings',
    ]);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['eventTrack']);

    TestBed.configureTestingModule({
      imports: [EmailNotificationsComponent,
        MatIconTestingModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
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
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailNotificationsComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService,
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;

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

    it('should update save text to "Saved"', () => {
      component.updateSaveText('Saved');
      expect(component.saveText).toBe('Saved');
    });
  });

  describe('closeModal():', () => {
    it('should dismiss the modal with employeeSettingsUpdated as true when saveText is "Saved"', () => {
      component.saveText = 'Saved';

      component.closeModal();

      expect(modalController.dismiss).toHaveBeenCalledWith({
        employeeSettingsUpdated: true,
      });
    });

    it('should dismiss the modal with employeeSettingsUpdated as false when saveText is not "Saved"', () => {
      component.saveText = 'Saving...';

      component.closeModal();

      expect(modalController.dismiss).toHaveBeenCalledWith({
        employeeSettingsUpdated: false,
      });
    });

    it('should dismiss the modal with employeeSettingsUpdated as false when saveText is empty', () => {
      component.saveText = '';

      component.closeModal();

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

      expect(component.selectAll).toBeTrue();
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
    it('should update unsubscribed events and call tracking service', () => {
      spyOn(component, 'updateEmployeeSettings');

      component.updateNotificationSettings();

      expect(component.employeeSettings.notification_settings.email_unsubscribed_events).toContain(
        NotificationEventsEnum.ERPTS_SUBMITTED,
      );
      expect(trackingService.eventTrack).toHaveBeenCalledWith('Email notifications updated from mobile app', {
        unsubscribedEvents: jasmine.any(Array),
      });
      expect(component.updateEmployeeSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateEmployeeSettings():', () => {
    it('should update employee settings and show save status', fakeAsync(() => {
      spyOn(component, 'updateSaveText');

      component.updateEmployeeSettings();
      tick();

      expect(platformEmployeeSettingsService.post).toHaveBeenCalledWith(component.employeeSettings);
      expect(platformEmployeeSettingsService.clearEmployeeSettings).toHaveBeenCalledTimes(1);
      expect(component.updateSaveText).toHaveBeenCalledWith('Saving...');
      expect(component.updateSaveText).toHaveBeenCalledWith('Saved');
    }));
  });
});
