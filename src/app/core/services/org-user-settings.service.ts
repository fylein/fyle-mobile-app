import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CostCentersService } from './cost-centers.service';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin, Subject, of } from 'rxjs';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { OrgUserSettings } from '../models/org_user_settings.model';
import { OrgUserService } from './org-user.service';

const orgUserSettingsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class OrgUserSettingsService {
  constructor(
    private apiService: ApiService,
    private costCentersService: CostCentersService,
    private orgUserService: OrgUserService
  ) {}

  @Cacheable({
    cacheBusterObserver: orgUserSettingsCacheBuster$,
  })
  get() {
    return this.apiService.get('/org_user_settings').pipe(map((res) => res as OrgUserSettings));
  }

  @CacheBuster({
    cacheBusterNotifier: orgUserSettingsCacheBuster$,
  })
  post(data) {
    return this.apiService.post('/org_user_settings', data);
  }

  @Cacheable({
    cacheBusterObserver: orgUserSettingsCacheBuster$,
  })
  getUserSettings(userSettingsId: string) {
    return this.apiService.get('/org_user_settings/' + userSettingsId).pipe(map((res) => res as OrgUserSettings));
  }

  @CacheBuster({
    cacheBusterNotifier: orgUserSettingsCacheBuster$,
  })
  clearOrgUserSettings() {
    return of(null);
  }

  getOrgUserSettingsById(ouId: string) {
    return this.orgUserService.getUserById(ouId).pipe(switchMap((user) => this.getUserSettings(user.ou_settings_id)));
  }

  getAllowedCostCentersByOuId(ouId: string) {
    return this.getOrgUserSettingsById(ouId).pipe(
      switchMap((orgUserSettings) => this.getAllowedCostCenteres(orgUserSettings, { isUserSpecific: true }))
    );
  }

  getEmailEvents() {
    const featuresList = {
      features: {
        expensesAndReports: {
          textLabel: 'Expenses and Reports',
          selected: true,
        },
        advances: {
          textLabel: 'Advances',
          selected: true,
        },
      },
      expensesAndReports: {
        eous_forward_email_to_user: {
          textLabel: 'When an expense is created via email',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        erpts_submitted: {
          textLabel: 'On submission of expense report',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        estatuses_created_txn: {
          textLabel: 'When a comment is left on an expense',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        estatuses_created_rpt: {
          textLabel: 'When a comment is left on a report',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        etxns_admin_removed: {
          textLabel: 'When an expense is removed',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        etxns_admin_updated: {
          textLabel: 'When an expense is edited by someone else',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        erpts_inquiry: {
          textLabel: 'When a reported expense is sent back',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        erpts_approved: {
          textLabel: 'When a report is approved',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        ereimbursements_completed: {
          textLabel: 'When a reimbursement is done',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
      },
      advances: {
        eadvance_requests_created: {
          textLabel: 'When an advance request is submitted',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        eadvance_requests_updated: {
          textLabel: 'When an advance request is updated',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        eadvance_requests_inquiry: {
          textLabel: 'When an advance request is sent back',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        eadvance_requests_approved: {
          textLabel: 'When an advance request is approved',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        eadvances_created: {
          textLabel: 'When an advance is assigned',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        eadvance_requests_rejected: {
          textLabel: 'When an advance request is rejected',
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
      },
    };
    return featuresList;
  }

  getAllowedCostCenteres(orgUserSettings, filters = { isUserSpecific: false }) {
    return this.costCentersService.getAllActive().pipe(
      map((costCenters) => {
        let allowedCostCenters = [];
        if (orgUserSettings.cost_center_ids && orgUserSettings.cost_center_ids.length > 0) {
          allowedCostCenters = costCenters.filter(
            (costCenter) => orgUserSettings.cost_center_ids.indexOf(costCenter.id) > -1
          );
        } else if (!filters.isUserSpecific) {
          allowedCostCenters = costCenters;
        }
        return allowedCostCenters;
      })
    );
  }

  getNotificationEvents() {
    // TODO: convert this is rxjs
    const emailEvents = this.getEmailEvents();
    const notificationEvents = {
      features: emailEvents.features,
      events: [],
    };
    Object.keys(emailEvents.features).forEach((featureKey) => {
      Object.keys(emailEvents[featureKey]).forEach((notificationEvent) => {
        const newNotificationEvent = emailEvents[featureKey][notificationEvent];
        newNotificationEvent.feature = featureKey;
        newNotificationEvent.eventType = notificationEvent;
        notificationEvents.events.push(newNotificationEvent);
      });
    });
    return of(notificationEvents);
  }

  getDefaultCostCenter() {
    return forkJoin([this.costCentersService.getAllActive(), this.get()]).pipe(
      map((aggregatedResponse) => {
        const [costCenters, settings] = aggregatedResponse;
        const defaultCostCenterId =
          settings.cost_center_settings && settings.cost_center_settings.default_cost_center_id;
        return costCenters.find((costCenter) => costCenter.id === defaultCostCenterId);
      })
    );
  }
}
