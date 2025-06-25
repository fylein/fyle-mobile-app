import { map, Observable, of, Subject } from 'rxjs';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { SpenderService } from './spender.service';
import { Injectable } from '@angular/core';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { EmailEventsObject } from 'src/app/core/models/email-events.model';
import {
  EmailEvents,
  NotificationEventFeatures,
  NotificationEvents,
} from 'src/app/core/models/notification-events.model';
import { AccountType } from 'src/app/core/enums/account-type.enum';

const employeeSettingsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class PlatformEmployeeSettingsService {
  constructor(private spenderService: SpenderService) {}

  @Cacheable({
    cacheBusterObserver: employeeSettingsCacheBuster$,
  })
  get(): Observable<EmployeeSettings> {
    return this.spenderService.get<PlatformApiResponse<EmployeeSettings[]>>('/employee_settings', {}).pipe(
      map((response) => {
        if (response.data.length > 0) {
          const employeeSettings = response.data[0];
          // This is being done because of public platform data mismatch;
          // TODO: Remove this once migration is done.
          if (employeeSettings.default_payment_mode === AccountType.PERSONAL_ACCOUNT) {
            employeeSettings.default_payment_mode = AccountType.PERSONAL;
          }

          if (employeeSettings.payment_mode_settings?.allowed_payment_modes) {
            employeeSettings.payment_mode_settings.allowed_payment_modes =
              employeeSettings.payment_mode_settings.allowed_payment_modes.map((mode) =>
                mode === AccountType.PERSONAL_ACCOUNT ? AccountType.PERSONAL : mode
              );
          }
          return employeeSettings;
        }
        return null;
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: employeeSettingsCacheBuster$,
  })
  post(employeeData: EmployeeSettings): Observable<EmployeeSettings> {
    return this.spenderService
      .post<PlatformApiResponse<EmployeeSettings>>('/employee_settings', { data: employeeData })
      .pipe(map((response) => response.data));
  }

  @CacheBuster({
    cacheBusterNotifier: employeeSettingsCacheBuster$,
  })
  clearEmployeeSettings(): Observable<null> {
    return of(null);
  }

  @Cacheable({
    cacheBusterObserver: employeeSettingsCacheBuster$,
  })
  getAllowedPaymentModes(): Observable<AccountType[]> {
    return this.get().pipe(map((employeeSettings) => employeeSettings?.payment_mode_settings?.allowed_payment_modes));
  }

  getEmailEvents(): EmailEventsObject {
    const featuresList: EmailEventsObject = {
      features: {
        expensesAndReports: {
          textLabel: 'Expenses and reports',
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

  getNotificationEvents(): Observable<NotificationEvents> {
    return of(this.getEmailEvents()).pipe(
      map((emailEvents: EmailEventsObject): NotificationEvents => {
        const featureKeys = Object.keys(emailEvents.features) as (keyof NotificationEventFeatures)[];

        const events = featureKeys.reduce<EmailEvents[]>((acc, featureKey) => {
          const featureEventObj = emailEvents[featureKey] as Record<string, Omit<EmailEvents, 'feature' | 'eventType'>>;

          const featureEvents = Object.keys(featureEventObj).map((eventKey) => {
            const event = featureEventObj[eventKey];
            return {
              ...event,
              feature: featureKey,
              eventType: eventKey,
            } as EmailEvents;
          });

          return [...acc, ...featureEvents];
        }, []);

        return {
          features: emailEvents.features,
          events,
        };
      })
    );
  }
}
