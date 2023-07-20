import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Redirect } from '../models/redirect.model';
import { UnflattenedTransaction } from '../models/unflattened-transaction.model';
import { TrackingService } from './tracking.service';

@Injectable({
  providedIn: 'root',
})
export class DeepLinkService {
  constructor(private router: Router, private trackingService: TrackingService) {}

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
  redirect(redirectionParam: Redirect): void {
    const redirectUri: string = redirectionParam.redirect_uri;
    const verificationCode: string = redirectionParam.verification_code;
    const orgId: string = redirectionParam.org_id;
    const refreshToken: string = redirectionParam.refresh_token;

    if (redirectUri) {
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
            refreshToken,
          },
        ]);
      } else if (redirectUri.match('/reports/rp') && redirectUri.split('/reports/').pop().length === 12) {
        const reportId = redirectUri.split('/reports/').pop();
        const subModule = 'report';
        this.router.navigate([
          '/',
          'deep_link_redirection',
          {
            sub_module: subModule,
            id: reportId,
          },
        ]);
      } else if (redirectUri.match('/view_expense/tx') && redirectUri.split('/view_expense/').pop().length === 12) {
        const txnId = redirectUri.split('/view_expense/').pop();
        const subModule = 'expense';
        this.router.navigate([
          '/',
          'deep_link_redirection',
          {
            sub_module: subModule,
            id: txnId,
          },
        ]);
      } else if (
        redirectUri.match('/advance_request/areq') &&
        redirectUri.split('/advance_request/').pop().length === 14
      ) {
        const advReqId = redirectUri.split('/advance_request/').pop();
        const subModule = 'advReq';
        this.router.navigate([
          '/',
          'deep_link_redirection',
          {
            sub_module: subModule,
            id: advReqId,
          },
        ]);
      } else if (redirectUri.match('/tx') && redirectUri.split('/').length > 2) {
        const urlArray = redirectUri.split('/');
        const txnId = urlArray[urlArray.length - 1];
        const orgId = urlArray[urlArray.length - 2];
        if (txnId && orgId && txnId.startsWith('tx') && orgId.startsWith('or')) {
          this.router.navigate([
            '/',
            'deep_link_redirection',
            {
              sub_module: 'expense',
              id: txnId,
              orgId,
            },
          ]);
        } else {
          this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
        }
        this.trackingService.smsDeepLinkOpened({
          orgId,
          txnId,
        });
      } else {
        this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
      }
    } else {
      this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
    }
  }

  getExpenseRoute(etxn: UnflattenedTransaction): string[] {
    const category = etxn.tx.org_category?.toLowerCase();
    const canEditTxn = ['DRAFT', 'DRAFT_INQUIRY', 'COMPLETE', 'APPROVER_PENDING'].includes(etxn.tx.state);

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
