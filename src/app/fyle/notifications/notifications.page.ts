import { Component, OnInit } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { map, tap } from 'rxjs/operators';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { OfflineService } from 'src/app/core/services/offline.service';


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
  notifyOption;
  isAllSelected;

  constructor(
    private authService: AuthService,
    private orgUserSettingsService: OrgUserSettingsService,
    private offlineService: OfflineService
  ) { }

  updateDelegateeSubscription() {
    this.notifyOption = this.delegationOptions[0];
    this.orgUserSettings$.pipe(
      map(ouSetting => {
        if (ouSetting.notification_settings.notify_only_delegatee) {
          this.notifyOption = this.delegationOptions[1];
        }
      })
    );
  }

  toggleAllChannelEvents(type) {

  }

  updateIsAllSelected(type) {

  }

  ngOnInit() {
    this.delegationOptions = [
      'Notify me and my delegate',
      'Notify my delegate'
    ];

    this.isAllSelected = {
      push: false,
      email: false
    };

    this.orgUserSettings$ = this.orgUserSettingsService.get();

    // setting the Delegatee Subscription
    this.updateDelegateeSubscription();

    this.isDelegateePresent$ = from(this.authService.getEou()).pipe(
      map(eou => {
        return eou.ou.delegatee_id !== null;
      })
    );

    this.notificationEvents$ = this.orgUserSettingsService.getNotificationEvents();

    this.notificationEvents$.subscribe(res => console.log('\n\n\n jong =', res));
  }
}
