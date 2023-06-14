import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Redirect } from '../models/redirect.model';

@Injectable({
  providedIn: 'root',
})
export class DeepLinkService {
  constructor(private router: Router) {}

  getJsonFromUrl(url?: string): Redirect {
    const query = url?.split('?')[1];
    const result = {};
    query?.split('&').forEach((part) => {
      const item = part.split('=');
      result[item[0]] = decodeURIComponent(item[1]);
    });

    if (Object.keys(result).length === 0) {
      return {
        redirect_uri: url,
      };
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
  redirect(redirectionParam: Redirect) {
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
      } else if (redirectUri.match('/tx')) {
        const txnId = redirectUri.split('/').pop();
        const subModule = 'expense';
        this.router.navigate([
          '/',
          'deep_link_redirection',
          {
            sub_module: subModule,
            id: txnId,
          },
        ]);
      } else {
        this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
      }
    } else {
      this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
    }
  }
}
