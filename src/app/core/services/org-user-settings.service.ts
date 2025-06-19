import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CostCentersService } from './cost-centers.service';
import { map, switchMap } from 'rxjs/operators';
import { Subject, of, Observable } from 'rxjs';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { OrgUserSettings } from '../models/org_user_settings.model';
import { OrgUserService } from './org-user.service';
import { AccountType } from '../enums/account-type.enum';
import { EmailEventsObject } from '../models/email-events.model';
import { CostCenter } from '../models/v1/cost-center.model';
import { NotificationEvents, EmailEvents } from '../models/notification-events.model';
import { TranslocoService } from '@jsverse/transloco';

const orgUserSettingsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class OrgUserSettingsService {
  constructor(
    private apiService: ApiService,
    private costCentersService: CostCentersService,
    private orgUserService: OrgUserService,
    private translocoService: TranslocoService
  ) {}

  @Cacheable({
    cacheBusterObserver: orgUserSettingsCacheBuster$,
  })
  get(): Observable<OrgUserSettings> {
    return this.apiService.get('/org_user_settings').pipe(map((res) => res as OrgUserSettings));
  }

  @CacheBuster({
    cacheBusterNotifier: orgUserSettingsCacheBuster$,
  })
  post(data: OrgUserSettings): Observable<OrgUserSettings> {
    return this.apiService.post('/org_user_settings', data);
  }

  @Cacheable({
    cacheBusterObserver: orgUserSettingsCacheBuster$,
  })
  getUserSettings(userSettingsId: string): Observable<OrgUserSettings> {
    return this.apiService.get('/org_user_settings/' + userSettingsId).pipe(map((res) => res as OrgUserSettings));
  }

  @Cacheable()
  getAllowedPaymentModes(): Observable<AccountType[]> {
    return this.get().pipe(map((orgUserSettings) => orgUserSettings.payment_mode_settings.allowed_payment_modes));
  }

  @CacheBuster({
    cacheBusterNotifier: orgUserSettingsCacheBuster$,
  })
  clearOrgUserSettings(): Observable<void> {
    return of(null);
  }

  getAllowedCostCenters(
    orgUserSettings: OrgUserSettings,
    filters = { isUserSpecific: false }
  ): Observable<CostCenter[]> {
    return this.costCentersService.getAllActive().pipe(
      map((costCenters) => {
        let allowedCostCenters: CostCenter[] = [];
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

  getOrgUserSettingsById(ouId: string): Observable<OrgUserSettings> {
    return this.orgUserService.getUserById(ouId).pipe(switchMap((user) => this.getUserSettings(user.ou_settings_id)));
  }

  getAllowedCostCentersByOuId(ouId: string): Observable<CostCenter[]> {
    return this.getOrgUserSettingsById(ouId).pipe(
      switchMap((orgUserSettings) => this.getAllowedCostCenters(orgUserSettings, { isUserSpecific: true }))
    );
  }

  getEmailEvents(): EmailEventsObject {
    const featuresList = {
      features: {
        expensesAndReports: {
          textLabel: this.translocoService.translate('services.orgUserSettings.expensesAndReports'),
          selected: true,
        },
        advances: {
          textLabel: this.translocoService.translate('services.orgUserSettings.advances'),
          selected: true,
        },
      },
      expensesAndReports: {
        eous_forward_email_to_user: {
          textLabel: this.translocoService.translate('services.orgUserSettings.expenseCreatedViaEmail'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        erpts_submitted: {
          textLabel: this.translocoService.translate('services.orgUserSettings.reportSubmitted'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        estatuses_created_txn: {
          textLabel: this.translocoService.translate('services.orgUserSettings.commentOnExpense'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        estatuses_created_rpt: {
          textLabel: this.translocoService.translate('services.orgUserSettings.commentOnReport'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        etxns_admin_removed: {
          textLabel: this.translocoService.translate('services.orgUserSettings.expenseRemoved'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        etxns_admin_updated: {
          textLabel: this.translocoService.translate('services.orgUserSettings.expenseEditedByOther'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        erpts_inquiry: {
          textLabel: this.translocoService.translate('services.orgUserSettings.reportSentBack'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        erpts_approved: {
          textLabel: this.translocoService.translate('services.orgUserSettings.reportApproved'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        ereimbursements_completed: {
          textLabel: this.translocoService.translate('services.orgUserSettings.reimbursementDone'),
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
          textLabel: this.translocoService.translate('services.orgUserSettings.advanceRequestSubmitted'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        eadvance_requests_updated: {
          textLabel: this.translocoService.translate('services.orgUserSettings.advanceRequestUpdated'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        eadvance_requests_inquiry: {
          textLabel: this.translocoService.translate('services.orgUserSettings.advanceRequestSentBack'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        eadvance_requests_approved: {
          textLabel: this.translocoService.translate('services.orgUserSettings.advanceRequestApproved'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        eadvances_created: {
          textLabel: this.translocoService.translate('services.orgUserSettings.advanceAssigned'),
          selected: true,
          email: {
            selected: true,
          },
          push: {
            selected: true,
          },
        },
        eadvance_requests_rejected: {
          textLabel: this.translocoService.translate('services.orgUserSettings.advanceRequestRejected'),
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

  getNotificationEvents(): Observable<NotificationEvents> {
    // TODO: convert this is rxjs
    const emailEvents = this.getEmailEvents();
    const notificationEvents = {
      features: emailEvents.features,
      events: [] as EmailEvents[],
    };
    Object.keys(emailEvents.features).forEach((featureKey) => {
      const featureEvents = emailEvents[featureKey as keyof EmailEventsObject] as Record<
        string,
        Omit<EmailEvents, 'eventType' | 'feature'>
      >;
      Object.keys(featureEvents).forEach((notificationEvent) => {
        const newNotificationEvent: EmailEvents = {
          ...featureEvents[notificationEvent],
          feature: featureKey,
          eventType: notificationEvent,
        };
        notificationEvents.events.push(newNotificationEvent);
      });
    });
    return of(notificationEvents);
  }
}
