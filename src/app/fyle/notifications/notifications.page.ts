import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable, from, noop, zip } from 'rxjs';
import { finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import {
  EmailEvents,
  NotificationEventFeatures,
  NotificationEvents,
} from 'src/app/core/models/notification-events.model';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  isDelegateePresent$: Observable<boolean>;

  employeeSettings$: Observable<EmployeeSettings>;

  notificationEvents$: Observable<NotificationEvents>;

  orgSettings$: Observable<OrgSettings>;

  delegationOptions: string[];

  notificationEvents: NotificationEvents;

  employeeSettings: EmployeeSettings;

  orgSettings: OrgSettings;

  isAllSelected: {
    emailEvents?: boolean;
    pushEvents?: boolean;
  };

  notifEvents = [];

  saveNotifLoading = false;

  notificationForm: UntypedFormGroup;

  constructor(
    private authService: AuthService,
    private platformEmployeeSettingsService: PlatformEmployeeSettingsService,
    private formBuilder: UntypedFormBuilder,
    private orgSettingsService: OrgSettingsService,
    private router: Router,
    private navController: NavController,
    private employeesService: EmployeesService
  ) {}

  get pushEvents(): UntypedFormArray {
    return this.notificationForm.controls.pushEvents as UntypedFormArray;
  }

  get emailEvents(): UntypedFormArray {
    return this.notificationForm.controls.emailEvents as UntypedFormArray;
  }

  getDelegateeSubscription(): Observable<string> {
    return this.employeeSettings$.pipe(
      map((employeeSettings) => {
        if (
          employeeSettings.notification_settings.notify_delegatee === true &&
          employeeSettings.notification_settings.notify_user === false
        ) {
          return this.delegationOptions[1];
        } else if (
          employeeSettings.notification_settings.notify_delegatee === true &&
          employeeSettings.notification_settings.notify_user === true
        ) {
          return this.delegationOptions[0];
        } else {
          return this.delegationOptions[2];
        }
      })
    );
  }

  setEvents(notificationEvents: NotificationEvents, employeeSettings: EmployeeSettings): void {
    const unSubscribedPushNotifications = employeeSettings.notification_settings.push_unsubscribed_events;
    const unSubscribedEmailNotifications = employeeSettings.notification_settings.email_unsubscribed_events;

    notificationEvents.events.forEach((event) => {
      const a = new UntypedFormControl(true);
      const b = new UntypedFormControl(true);

      if (unSubscribedPushNotifications.indexOf(event.eventType.toUpperCase()) > -1) {
        a.setValue(false);
      }

      if (unSubscribedEmailNotifications.indexOf(event.eventType.toUpperCase()) > -1) {
        b.setValue(false);
      }

      this.pushEvents.push(a);
      this.emailEvents.push(b);

      this.notifEvents.push(
        Object.assign({}, event, {
          push: a,
          email: b,
        })
      );
    });
  }

  goBack(): void {
    this.router.navigate(['/', 'enterprise', 'my_profile']);
  }

  saveNotificationSettings(): void {
    this.saveNotifLoading = true;
    const unsubscribedPushEvents: string[] = [];
    const unsubscribedEmailEvents: string[] = [];

    this.notificationEvents.events.forEach((event: EmailEvents, index: number) => {
      const emailEvent = this.emailEvents.value as { value: { email: { selected: boolean } } };
      const pushEvent = this.pushEvents.value as { value: { push: { selected: boolean } } };
      event.email.selected = emailEvent[index] as boolean;
      event.push.selected = pushEvent[index] as boolean;

      if (emailEvent[index] === false) {
        unsubscribedEmailEvents.push(event.eventType.toUpperCase());
      }
      if (pushEvent[index] === false) {
        unsubscribedPushEvents.push(event.eventType.toUpperCase());
      }
    });

    this.employeeSettings.notification_settings.email_unsubscribed_events = [];
    this.employeeSettings.notification_settings.email_unsubscribed_events = unsubscribedEmailEvents;

    this.employeeSettings.notification_settings.push_unsubscribed_events = [];
    this.employeeSettings.notification_settings.push_unsubscribed_events = unsubscribedPushEvents;

    this.platformEmployeeSettingsService
      .post(this.employeeSettings)
      .pipe(tap(() => this.platformEmployeeSettingsService.clearEmployeeSettings()))
      .pipe(finalize(() => (this.saveNotifLoading = false)))
      .subscribe(() => {
        this.navBack();
      });
  }

  navBack(): void {
    this.navController.back();
  }

  isAllEventsSubscribed(): void {
    this.isAllSelected.emailEvents = this.employeeSettings.notification_settings.email_unsubscribed_events.length === 0;
    this.isAllSelected.pushEvents = this.employeeSettings.notification_settings.push_unsubscribed_events.length === 0;
  }

  removeAdminUnsbscribedEvents(): void {
    this.orgSettings$
      .pipe(
        map((setting) => {
          if (setting.admin_email_settings.unsubscribed_events.length) {
            this.notificationEvents.events = this.notificationEvents.events.filter((notificationEvent) => {
              const emailEvents = setting.admin_email_settings.unsubscribed_events as string[];
              return emailEvents.indexOf(notificationEvent.eventType.toUpperCase()) === -1;
            });
          }
        })
      )
      .subscribe(noop);
  }

  updateAdvanceRequestFeatures(): void {
    this.orgSettings$
      .pipe(
        map((setting) => {
          if (!setting.advance_requests.enabled) {
            this.notificationEvents.events = this.notificationEvents.events.filter(
              (notificationEvent) => notificationEvent.feature !== 'advances'
            );
            delete this.notificationEvents.features.advances;
          }
        })
      )
      .subscribe(noop);
  }

  updateDelegateeNotifyPreference(event: { value: string }): void {
    if (event) {
      if (event.value === 'Notify my delegate') {
        this.employeeSettings.notification_settings.notify_delegatee = true;
        this.employeeSettings.notification_settings.notify_user = false;
      } else if (event.value === 'Notify me and my delegate') {
        this.employeeSettings.notification_settings.notify_delegatee = true;
        this.employeeSettings.notification_settings.notify_user = true;
      } else if (event.value === 'Notify me only') {
        this.employeeSettings.notification_settings.notify_delegatee = false;
        this.employeeSettings.notification_settings.notify_user = true;
      }
    }
  }

  removeDisabledFeatures(): void {
    const activeFeatures = this.notificationEvents.events.reduce((accumulator, notificationEvent) => {
      if (accumulator.indexOf(notificationEvent.feature) === -1) {
        accumulator.push(notificationEvent.feature);
      }
      return accumulator as string[];
    }, []);

    const newFeatures: NotificationEventFeatures = {
      advances: {
        selected: false,
        textLabel: '',
      },
      expensesAndReports: {
        selected: false,
        textLabel: '',
      },
    };
    activeFeatures.forEach((featureKey: string) => {
      newFeatures[featureKey] = this.notificationEvents.features[featureKey] as {
        selected: boolean;
        textLabel: string;
      };
    });
    this.notificationEvents.features = newFeatures;
    this.updateAdvanceRequestFeatures();
  }

  updateNotificationEvents(): void {
    this.removeAdminUnsbscribedEvents();
    this.removeDisabledFeatures();
  }

  toggleAllSelected(eventType: string): void {
    if (eventType === 'email') {
      const emailEventsValue = this.notificationForm.controls.emailEvents.value as string[];
      if (this.isAllSelected.emailEvents) {
        this.emailEvents.setValue(emailEventsValue.map(() => false));
      } else {
        this.emailEvents.setValue(emailEventsValue.map(() => true));
      }
    }
    if (eventType === 'push') {
      const pushEventsValue = this.notificationForm.controls.pushEvents.value as string[];
      if (this.isAllSelected.pushEvents) {
        this.pushEvents.setValue(pushEventsValue.map(() => false));
      } else {
        this.pushEvents.setValue(pushEventsValue.map(() => true));
      }
    }
  }

  ngOnInit(): void {
    this.delegationOptions = ['Notify me and my delegate', 'Notify my delegate', 'Notify me only'];

    this.isAllSelected = {
      emailEvents: false,
      pushEvents: false,
    };
    this.employeeSettings$ = this.platformEmployeeSettingsService.get().pipe(shareReplay(1));

    // creating form
    this.notificationForm = this.formBuilder.group({
      notifyOption: [],
      pushEvents: new UntypedFormArray([]), // push notification event form control array
      emailEvents: new UntypedFormArray([]), // email  notification event form control array
    });

    let notifyOption;
    this.getDelegateeSubscription().subscribe((option) => {
      notifyOption = option;
      this.notificationForm.controls.notifyOption.setValue(notifyOption);
    });

    this.isDelegateePresent$ = from(this.authService.getEou()).pipe(
      switchMap((res) => this.employeesService.getByParams({ user_id: `eq.${res.us.id}` })),
      map((employeesResponse) => employeesResponse?.data[0]?.delegatees?.length > 0)
    );

    this.orgSettings$ = this.orgSettingsService.get();
    this.notificationEvents$ = this.platformEmployeeSettingsService.getNotificationEvents();

    zip(this.notificationEvents$, this.employeeSettings$, this.orgSettings$)
      .pipe(
        finalize(() => {
          this.isAllEventsSubscribed();
          this.updateNotificationEvents();
        })
      )
      .subscribe((res) => {
        this.notificationEvents = res[0];
        this.employeeSettings = res[1];
        this.setEvents(this.notificationEvents, this.employeeSettings);
      });

    /**
     * on valueChange of any check box, checking for all box selected or not
     * if selected will toggle all select box
     */

    this.toggleEvents();
  }

  toggleEvents(): void {
    this.notificationForm.valueChanges.subscribe((change: { emailEvents: boolean[]; pushEvents: boolean[] }) => {
      const emailEvents = change.emailEvents;
      const pushEvents = change.pushEvents;
      this.isAllSelected.emailEvents = emailEvents.every((selected) => selected === true);
      this.isAllSelected.pushEvents = pushEvents.every((selected) => selected === true);
    });
  }
}
