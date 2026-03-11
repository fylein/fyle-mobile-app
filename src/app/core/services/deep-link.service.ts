import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Redirect } from '../models/redirect.model';
import { UnflattenedTransaction } from '../models/unflattened-transaction.model';
import { TrackingService } from './tracking.service';
import { FilterState } from '../enums/filter-state.enum';

@Injectable({
  providedIn: 'root',
})
export class DeepLinkService {
  private router = inject(Router);

  private trackingService = inject(TrackingService);

  getJsonFromUrl(url?: string): Redirect {
    const query = url?.split('?')[1];
    const result: Redirect = {};
    query?.split('&').forEach((part) => {
      const item = part.split('=');
      result[item[0]] = decodeURIComponent(item[1]);
    });

    //If no query string is present, url is from the SMS link, so send the entire url in redirect_uri
    if (url && Object.keys(result).length === 0) {
      result.redirect_uri = url;
    }
    return result;
  }

  // eslint-disable-next-line complexity
  redirect(redirectionParam: Redirect, notificationType?: string): void {
    const redirectUri: string = redirectionParam.redirect_uri;
    const verificationCode: string = redirectionParam.verification_code;
    const orgId: string = redirectionParam.org_id;
    const refreshToken: string = redirectionParam.token;

    if (redirectUri) {
      const orgIdFromUri = redirectUri.match(/org_id=([^&]+)/)?.[1];
      const resolvedOrgId = orgIdFromUri ? decodeURIComponent(orgIdFromUri) : orgId;
      if (redirectUri.match('verify')) {
        this.router.navigate([
          '/',
          'auth',
          'verify',
          {
            verification_code: verificationCode,
            org_id: orgId,
          },
        ]);
      } else if (redirectUri.match('new_password')) {
        this.router.navigate([
          '/',
          'auth',
          'new_password',
          {
            token: refreshToken,
          },
        ]);
      } else if (redirectUri.match('/reports/rp') && redirectUri.split('/reports/').pop().length === 12) {
        const reportId = redirectUri.split('/reports/').pop();
        const subModule = 'report';
        const properties: Record<string, string> = {
          sub_module: subModule,
          id: reportId,
        };
        if (resolvedOrgId) {
          properties.orgId = resolvedOrgId;
        }
        if (notificationType) {
          properties.push_notification_type = notificationType;
        }
        this.router.navigate(['/', 'deep_link_redirection', properties]);
      } else if (redirectUri.match('/my_expenses/') && redirectUri.match('state=draft')) {
        const filters = {
          state: [FilterState.DRAFT],
        };
        if (resolvedOrgId) {
          this.router.navigate([
            '/',
            'deep_link_redirection',
            {
              sub_module: 'my_expenses',
              orgId: resolvedOrgId,
              filters: JSON.stringify(filters),
            },
          ]);
        } else {
          this.router.navigate(['/', 'enterprise', 'my_expenses'], {
            queryParams: {
              filters: JSON.stringify(filters),
            },
          });
        }
      } else if (
        redirectUri.match('/my_expenses/') &&
        redirectUri.includes('txnId=') &&
        redirectUri.split('txnId=').pop().length === 12
      ) {
        const txnId = redirectUri.split('txnId=').pop();
        const subModule = 'expense';
        const properties: Record<string, string> = {
          sub_module: subModule,
          id: txnId,
        };
        if (resolvedOrgId) {
          properties.orgId = resolvedOrgId;
        }
        if (notificationType) {
          properties.push_notification_type = notificationType;
        }
        this.router.navigate(['/', 'deep_link_redirection', properties]);
      } else if (
        redirectUri.match('/advance_request/areq') &&
        redirectUri.split('/advance_request/').pop().length === 14
      ) {
        const advReqId = redirectUri.split('/advance_request/').pop();
        const subModule = 'advReq';
        const properties: Record<string, string> = {
          sub_module: subModule,
          id: advReqId,
        };
        if (notificationType) {
          properties.push_notification_type = notificationType;
        }
        this.router.navigate(['/', 'deep_link_redirection', properties]);
      } else if (redirectUri.match('/tx') && redirectUri.split('/').length > 2) {
        const urlArray = redirectUri.split('/');
        const txnId = urlArray[urlArray.length - 1];
        const orgId = urlArray[urlArray.length - 2];
        if (txnId && orgId && txnId.startsWith('tx') && orgId.startsWith('or')) {
          const properties: Record<string, string> = {
            sub_module: 'expense',
            id: txnId,
            orgId,
          };
          if (notificationType) {
            properties.push_notification_type = notificationType;
          }
          this.router.navigate(['/', 'deep_link_redirection', properties]);
        } else {
          this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
        }
        this.trackingService.smsDeepLinkOpened({
          orgId,
          txnId,
        });
      } else if (redirectUri.match('corporate_cards')) {
        const properties: Record<string, string> = {
          sub_module: 'manage_corporate_cards',
          orgId,
        };
        if (notificationType) {
          properties.push_notification_type = notificationType;
        }
        this.router.navigate(['/', 'deep_link_redirection', properties]);
      } else if (redirectUri.match('my_dashboard')) {
        // https://staging1.fyle.tech/app/main/my_dashboard?org_id=oroX1Q9TTEOg&open_sms_dialog=true&referrer=transactional_email
        const referrer = redirectUri.match(/referrer=(\w+)/)?.[1];
        const orgId = redirectUri.match(/org_id=(\w+)/)?.[1];
        const openSMSOptInDialog = redirectUri.includes('open_sms_dialog=true');
        const properties = {
          sub_module: 'my_dashboard',
          openSMSOptInDialog,
          orgId,
          referrer,
        };
        this.trackingService.smsDeepLinkOpened(properties);
        this.router.navigate(['/', 'deep_link_redirection', properties]);
      } else {
        this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
      }
    } else {
      this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
    }
  }

  getExpenseRoute(etxn: Partial<UnflattenedTransaction>): string[] {
    const category = etxn.tx.org_category?.toLowerCase();
    const canEditTxn = ['DRAFT', 'COMPLETE', 'APPROVER_PENDING'].includes(etxn.tx.state);

    let route: string[] = [];
    if (canEditTxn) {
      route = ['/', 'enterprise', 'add_edit_expense'];
      if (category === 'mileage') {
        route = ['/', 'enterprise', 'add_edit_mileage'];
      } else if (category === 'per diem') {
        route = ['/', 'enterprise', 'add_edit_per_diem'];
      }
    } else {
      route = ['/', 'enterprise', 'view_expense'];
      if (category === 'mileage') {
        route = ['/', 'enterprise', 'view_mileage'];
      } else if (category === 'per diem') {
        route = ['/', 'enterprise', 'view_per_diem'];
      }
    }

    return route;
  }
}
