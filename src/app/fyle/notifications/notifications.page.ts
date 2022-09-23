import { Component, OnInit } from '@angular/core';
import { Observable, from, forkJoin, merge, zip, noop } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { map, tap, switchMap, mergeMap, finalize } from 'rxjs/operators';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { OfflineService } from 'src/app/core/services/offline.service';
import { FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

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

  saveNotifLoading = false;

  notificationForm: FormGroup;

  constructor(
    private authService: AuthService,
    private orgUserSettingsService: OrgUserSettingsService,
    private formBuilder: FormBuilder,
    private offlineService: OfflineService,
    private router: Router,
    private navController: NavController
  ) {}

  get pushEvents(): FormArray {
    return this.notificationForm.controls.pushEvents as FormArray;
  }

  get emailEvents(): FormArray {
    return this.notificationForm.controls.emailEvents as FormArray;
  }

  getDelegateeSubscription() {
    return this.orgUserSettings$.pipe(
      map((ouSetting) => {
        if (
          ouSetting.notification_settings.notify_delegatee === true &&
          ouSetting.notification_settings.notify_user === false
        ) {
          return this.delegationOptions[1];
        } else if (
          ouSetting.notification_settings.notify_delegatee === true &&
          ouSetting.notification_settings.notify_user === true
        ) {
          return this.delegationOptions[0];
        } else if (
          ouSetting.notification_settings.notify_delegatee === false &&
          ouSetting.notification_settings.notify_user === true
        ) {
          return this.delegationOptions[2];
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

  setEvents(notificationEvents, orgUserSettings) {
    const unSubscribedPushNotifications = orgUserSettings.notification_settings.push.unsubscribed_events;
    const unSubscribedEmailNotifications = orgUserSettings.notification_settings.email.unsubscribed_events;

    notificationEvents.events.forEach((event) => {
      const a = new FormControl(true);
      const b = new FormControl(true);

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

  goBack() {
    this.router.navigate(['/', 'enterprise', 'my_profile']);
  }

  saveNotificationSettings() {
    this.saveNotifLoading = true;
    const unsubscribedPushEvents = [];
    const unsubscribedEmailEvents = [];

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

    this.orgUserSettings.notification_settings.email.unsubscribed_events = [];
    this.orgUserSettings.notification_settings.email.unsubscribed_events = unsubscribedEmailEvents;

    this.orgUserSettings.notification_settings.push.unsubscribed_events = [];
    this.orgUserSettings.notification_settings.push.unsubscribed_events = unsubscribedPushEvents;

    this.orgUserSettingsService
      .post(this.orgUserSettings)
      .pipe(() => this.orgUserSettingsService.clearOrgUserSettings())
      .pipe(finalize(() => (this.saveNotifLoading = false)))
      .subscribe(() => {
        this.navController.back();
      });
  }

  isAllEventsSubscribed() {
    this.isAllSelected.emailEvents = this.orgUserSettings.notification_settings.email.unsubscribed_events.length === 0;
    this.isAllSelected.pushEvents = this.orgUserSettings.notification_settings.push.unsubscribed_events.length === 0;
  }

  removeAdminUnsbscribedEvents() {
    this.orgSettings$.pipe(
      map((setting) => {
        if (setting.admin_email_settings.unsubscribed_events.length) {
          this.notificationEvents.events = this.notificationEvents.events.filter(
            (notificationEvent) =>
              this.orgSettings.admin_email_settings.unsubscribed_events.indexOf(
                notificationEvent.eventType.toUpperCase()
              ) === -1
          );
        }
      })
    );
  }

  updateAdvanceRequestFeatures() {
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

  updateDelegateeNotifyPreference(event) {
    if (event) {
      if (event.value === 'Notify my delegate') {
        this.orgUserSettings.notification_settings.notify_delegatee = true;
        this.orgUserSettings.notification_settings.notify_user = false;
      } else if (event.value === 'Notify me and my delegate') {
        this.orgUserSettings.notification_settings.notify_delegatee = true;
        this.orgUserSettings.notification_settings.notify_user = true;
      } else if (event.value === 'Notify me only') {
        this.orgUserSettings.notification_settings.notify_delegatee = false;
        this.orgUserSettings.notification_settings.notify_user = true;
      }
    }
  }

  removeDisabledFeatures() {
    this.updateAdvanceRequestFeatures();

    const activeFeatures = this.notificationEvents.events.reduce((accumulator, notificationEvent) => {
      if (accumulator.indexOf(notificationEvent.feature) === -1) {
        accumulator.push(notificationEvent.feature);
      }
      return accumulator;
    }, []);

    const newFeatures = {};
    activeFeatures.forEach((featureKey) => {
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
        this.notificationForm.controls.emailEvents.setValue(
          this.notificationForm.controls.emailEvents.value.map(() => false)
        );
      } else {
        this.notificationForm.controls.emailEvents.setValue(
          this.notificationForm.controls.emailEvents.value.map(() => true)
        );
      }
    }
    if (eventType === 'push') {
      if (this.isAllSelected.pushEvents) {
        this.notificationForm.controls.pushEvents.setValue(
          this.notificationForm.controls.pushEvents.value.map(() => false)
        );
      } else {
        this.notificationForm.controls.pushEvents.setValue(
          this.notificationForm.controls.pushEvents.value.map(() => true)
        );
      }
    }
  }

  ngOnInit() {
    this.delegationOptions = ['Notify me and my delegate', 'Notify my delegate', 'Notify me only'];

    this.isAllSelected = {
      emailEvents: false,
      pushEvents: false,
    };
    this.orgUserSettings$ = this.orgUserSettingsService.get();

    // creating form
    this.notificationForm = this.formBuilder.group({
      notifyOption: [],
      pushEvents: new FormArray([]), // push notification event form control array
      emailEvents: new FormArray([]), // email  notification event form control array
    });

    let notifyOption;
    this.getDelegateeSubscription().subscribe((option) => {
      notifyOption = option;
      this.notificationForm.controls.notifyOption.setValue(notifyOption);
    });

    this.isDelegateePresent$ = from(this.authService.getEou()).pipe(map((eou) => eou.ou.delegatee_id !== null));

    this.orgSettings$ = this.offlineService.getOrgSettings();
    this.notificationEvents$ = this.orgUserSettingsService.getNotificationEvents();

    const mergedData$ = zip(this.notificationEvents$, this.orgUserSettings$, this.orgSettings$)
      .pipe(
        finalize(() => {
          this.isAllEventsSubscribed();
          this.updateNotificationEvents();
        })
      )
      .subscribe((res) => {
        this.notificationEvents = res[0];
        this.orgUserSettings = res[1];
        this.setEvents(this.notificationEvents, this.orgUserSettings);
      });

    /**
     * on valueChange of any check box, checking for all box selected or not
     * if selected will toggle all select box
     */
    this.notificationForm.valueChanges.subscribe((change) => {
      this.isAllSelected.emailEvents = change.emailEvents.every((selected) => selected === true);
      this.isAllSelected.pushEvents = change.pushEvents.every((selected) => selected === true);
    });
  }
}
