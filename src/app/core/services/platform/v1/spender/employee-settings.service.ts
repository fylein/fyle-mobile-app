import { from, map, Observable, of, Subject, switchMap } from "rxjs";
import { PlatformApiResponse } from "src/app/core/models/platform/platform-api-response.model";
import { SpenderService } from "./spender.service";
import { Injectable } from "@angular/core";
import { EmployeeSettings } from "src/app/core/models/employee-settings.model";
import { Cacheable, CacheBuster } from "ts-cacheable";
import { CostCentersService } from "src/app/core/services/cost-centers.service";
import { EmailEventsObject } from "src/app/core/models/email-events.model";
import { NotificationEvents } from "src/app/core/models/notification-events.model";
import { AccountType } from "src/app/core/enums/account-type.enum";
import { CostCenter } from "src/app/core/models/v1/cost-center.model";
import { AuthService } from "../../../auth.service";

const employeeSettingsCacheBuster$ = new Subject<void>();

@Injectable({
    providedIn: 'root'
  })
  export class PlatformEmployeeSettingsService {
    constructor(private spenderService: SpenderService, private costCentersService: CostCentersService, private authService: AuthService) {}

    @Cacheable({
        cacheBusterObserver: employeeSettingsCacheBuster$,
      })
    get(employeeId?: string): Observable<EmployeeSettings> {
      const eou$ = from(this.authService.getEou());
      return (employeeId ? of(employeeId) : eou$.pipe(map(eou => eou.ou.id))).pipe(
        switchMap(id => this.spenderService.get<PlatformApiResponse<EmployeeSettings>>(
          '/spender/employee_settings',
          { params: { employee_id: id } }
        ).pipe(map(response => response.data)))
      );
    }
  
    @CacheBuster({
        cacheBusterNotifier: employeeSettingsCacheBuster$,
      })
    post(employeeData: EmployeeSettings): Observable<EmployeeSettings> {
      return this.spenderService.post<PlatformApiResponse<EmployeeSettings>>(
        '/spender/employee_settings',
        { data: employeeData }
      ).pipe(map(response => response.data));
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
      return this.get().pipe(map((employeeSettings) => employeeSettings.payment_mode_settings.allowed_payment_modes));
    }
  
    getAllowedCostCenters(
      employeeSettings: EmployeeSettings
    ): Observable<CostCenter[]> {
      return this.costCentersService.getAllActive().pipe(
        map((costCenters) => {
          let allowedCostCenters: CostCenter[] = [];
          if (employeeSettings?.cost_center_ids.length > 0) {
            allowedCostCenters = costCenters.filter(
              (costCenter) => employeeSettings.cost_center_ids.indexOf(costCenter.id) > -1
            );
          }
          return allowedCostCenters;
        })
      );
    }

    getAllowedCostCentersByOuId(
      employeeId: string
    ): Observable<CostCenter[]> {
      return this.get(employeeId).pipe(
        switchMap((employeeSettings) => {
          if (employeeSettings?.cost_center_ids.length > 0) {
            return this.costCentersService.getAllActive().pipe(
              map((costCenters) => costCenters.filter((costCenter) => employeeSettings.cost_center_ids.indexOf(costCenter.id) > -1))
            );
          }
          return of([]);
        })
      );
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
        map(emailEvents => {
          const events = Object.keys(emailEvents.features).reduce<Array<{
            textLabel: string;
            selected: boolean;
            email: { selected: boolean };
            push: { selected: boolean };
            feature: string;
            eventType: string;
          }>>((acc, featureKey) => {
            const featureEvents = Object.keys(emailEvents[featureKey]).map(notificationEvent => ({
              ...emailEvents[featureKey][notificationEvent],
              feature: featureKey,
              eventType: notificationEvent
            }));
            return [...acc, ...featureEvents];
          }, []);

          return {
            features: emailEvents.features,
            events
          };
        })
      );
    }
  }
  