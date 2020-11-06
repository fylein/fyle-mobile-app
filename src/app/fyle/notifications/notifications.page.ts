import { Component, OnInit } from '@angular/core';
import { Observable, from, forkJoin, merge, zip, noop } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { map, tap, switchMap, mergeMap, finalize } from 'rxjs/operators';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { OfflineService } from 'src/app/core/services/offline.service';
import { FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  isDelegateePresent$: Observable<boolean>;
  orgUserSettings$: Observable<OrgUserSettings>;
  notificationEvents$: Observable<any>;
  orgSettings$: Observable<any>;
  features$: Observable<any>;
  delegationOptions;
  notificationEvents;
  orgUserSettings;
  orgSettings;
  isAllSelected: {
    emailEvents: boolean;
    pushEvents: boolean;
  };
  notifEvents = [];

  notificationForm: FormGroup;

  constructor(
    private authService: AuthService,
    private orgUserSettingsService: OrgUserSettingsService,
    private formBuilder: FormBuilder,
    private offlineService: OfflineService
  ) { }

  updateDelegateeSubscription() {
    return this.orgUserSettings$.pipe(
      map(ouSetting => {
        if (ouSetting.notification_settings.notify_only_delegatee) {
          return this.delegationOptions[1];
        } else {
          return this.delegationOptions[0];
        }
      })
    );
  }

  trackByFeatureKey(index, item) {
    return item.key;
  }

  trackByEventType(index, item) {
    return item.eventType;
  }

  get pushEvents(): FormArray {
    return this.notificationForm.controls.pushEvents as FormArray;
  }

  get emailEvents(): FormArray {
    return this.notificationForm.controls.emailEvents as FormArray;
  }

  setEvents(notificationEvents, orgUserSettings) {
    const unSubscribedPushNotifications = orgUserSettings.notification_settings.push.unsubscribed_events;
    const unSubscribedEmailNotifications = orgUserSettings.notification_settings.email.unsubscribed_events;

    notificationEvents.events.forEach(event => {

      const a = new FormControl(true);
      const b = new FormControl(true);

      if (unSubscribedPushNotifications.indexOf(event.eventType.toUpperCase()) > -1 ) {
        a.setValue(false);
      }

      if (unSubscribedEmailNotifications.indexOf(event.eventType.toUpperCase()) > -1 ) {
        b.setValue(false);
      }

      this.pushEvents.push(a);
      this.emailEvents.push(b);

      this.notifEvents.push(Object.assign({}, event, {
        push: a,
        email: b
      }));
    });
  }

  saveNotificationSettings() {
    let unsubscribedPushEvents = [];
    let unsubscribedEmailEvents = [];

    this.notificationEvents.events.forEach((event, index) => {
      event.email.selected = this.emailEvents.value[index];
      event.push.selected = this.pushEvents.value[index];

      if (this.emailEvents.value[index] === false) {
        unsubscribedEmailEvents.push(event.eventType.toUpperCase());
      }
      if (this.pushEvents.value[index] === false) {
        unsubscribedPushEvents.push(event.eventType.toUpperCase());
      }
    });

    this.orgUserSettings.notification_settings.email.unsubscribed_events =
    this.orgUserSettings.notification_settings.email.unsubscribed_events
      .concat(unsubscribedEmailEvents)
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      });

    this.orgUserSettings.notification_settings.push.unsubscribed_events =
    this.orgUserSettings.notification_settings.push.unsubscribed_events
      .concat(unsubscribedPushEvents)
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      });

    console.log('this.orgUserSettings.notification_settings', this.orgUserSettings.notification_settings);

  }

  isAllEventsSubscribed() {
    this.isAllSelected.emailEvents = this.orgUserSettings.notification_settings.email.unsubscribed_events.length === 0;
    this.isAllSelected.pushEvents = this.orgUserSettings.notification_settings.push.unsubscribed_events.length === 0;
  }

  removeAdminUnsbscribedEvents() {
    this.orgSettings$.pipe(
      map(setting => {
        if (setting.admin_email_settings.unsubscribed_events.length) {
          this.notificationEvents.events = this.notificationEvents.events.filter(notificationEvent => {
            return this.orgSettings.admin_email_settings.unsubscribed_events.indexOf(notificationEvent.eventType.toUpperCase()) === -1;
          });
        }
      })
    );
  }

  updateAdvanceRequestFeatures() {
    this.orgSettings$.pipe(
      map(setting => {
        if (!setting && setting.advance_requests && setting.advance_requests.enabled) {
          this.notificationEvents.events = this.notificationEvents.events.filter(notificationEvent => {
            return notificationEvent.feature !== 'advances';
          });
          delete this.notificationEvents.features.advances;
        }
      })
    );
  }

  updateTripRequestFeatures() {
    this.orgSettings$.pipe(
      map(setting => {
        const isTripRequestsEnabled = setting.trip_requests.enabled;

        if (!isTripRequestsEnabled) {
          this.notificationEvents.events = this.notificationEvents.events.filter(notificationEvent => {
            return notificationEvent.feature !== 'trips';
          });
          delete this.notificationEvents.features.trips;
        }
        if (isTripRequestsEnabled && !setting.trip_requests.enabled_hotel_requests) {
          this.notificationEvents.events = this.notificationEvents.events.filter(notificationEvent => {
            return notificationEvent.profile !== 'hotel_requests';
          });
        }
        if (isTripRequestsEnabled && !setting.trip_requests.enabled_transportation_requests) {
          this.notificationEvents.events = this.notificationEvents.events.filter(notificationEvent => {
            return notificationEvent.profile !== 'transport_requests';
          });
        }
      })
    );
  }

  removeDisabledFeatures() {
    this.updateAdvanceRequestFeatures();
    this.updateTripRequestFeatures();

    const activeFeatures = this.notificationEvents.events.reduce((accumulator, notificationEvent) => {
      if (accumulator.indexOf(notificationEvent.feature) === -1) {
        accumulator.push(notificationEvent.feature);
      }
      return accumulator;
    }, []);

    let newFeatures = {};
    activeFeatures.forEach(featureKey => {
      newFeatures[featureKey] = this.notificationEvents.features[featureKey];
    });
    this.notificationEvents.features = newFeatures;
  }

  updateNotificationEvents() {
    this.removeAdminUnsbscribedEvents();
    this.removeDisabledFeatures();
  }

  toggleAllSelected(eventType) {
    if (eventType === 'email') {
      if (this.isAllSelected.emailEvents) {
        this.notificationForm.controls.emailEvents.setValue(this.notificationForm.controls.emailEvents.value.map(() => {
          return false;
        }));
      } else {
        this.notificationForm.controls.emailEvents.setValue(this.notificationForm.controls.emailEvents.value.map(() => {
          return true;
        }));
      }
    }
    if (eventType === 'push') {
      if (this.isAllSelected.pushEvents) {
        this.notificationForm.controls.pushEvents.setValue(this.notificationForm.controls.pushEvents.value.map(() => {
          return false;
        }));
      } else {
        this.notificationForm.controls.pushEvents.setValue(this.notificationForm.controls.pushEvents.value.map(() => {
          return true;
        }));
      }
    }
  }

  ngOnInit() {
    this.delegationOptions = [
      'Notify me and my delegate',
      'Notify my delegate'
    ];

    this.isAllSelected = {
      emailEvents: false,
      pushEvents: false
    };

    this.orgUserSettings$ = this.orgUserSettingsService.get();

    let notifyOption;
    this.updateDelegateeSubscription().subscribe(option => {
      notifyOption = option;
    });

    this.notificationForm = this.formBuilder.group({
      notifyOption: [notifyOption],
      pushEvents: new FormArray([]),
      emailEvents: new FormArray([])
    });

    this.isDelegateePresent$ = from(this.authService.getEou()).pipe(
      map(eou => {
        return eou.ou.delegatee_id !== null;
      })
    );

    this.orgSettings$ = this.offlineService.getOrgSettings();
    this.notificationEvents$ = this.orgUserSettingsService.getNotificationEvents();

    const mergedData$ = zip(this.notificationEvents$, this.orgUserSettings$, this.orgSettings$).pipe(
      finalize(() => {
        this.isAllEventsSubscribed();
        this.updateNotificationEvents();
      })
    ).subscribe(res => {
      this.notificationEvents = res[0];
      this.orgUserSettings = res[1];
      this.setEvents(this.notificationEvents, this.orgUserSettings);
    });

    this.notificationForm.valueChanges.subscribe(change => {
      this.isAllSelected.emailEvents = change.emailEvents.every(selected => selected === true);
      this.isAllSelected.pushEvents = change.pushEvents.every(selected => selected === true);
    });
  }
}
