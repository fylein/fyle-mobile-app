import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { tap, map, switchMap } from 'rxjs/operators';
import { Org } from '../models/org.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrgService {

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  getCurrentOrg() {
    return this.apiService.get('/orgs', {
      params: {
        is_current: true
      }
    }).pipe(
      map(orgs => orgs[0])
    );
  }


  getOrgs() {
    return this.apiService.get('/orgs').pipe(
      map(res => res as Org[])
    );
  }

  switchOrg(orgId: string) {
    return this.apiService.post(`/orgs/${orgId}/refresh_token`).pipe(
      switchMap(data => {
        return this.authService.newRefreshToken(data.refresh_token);
      })
    );
  }
}
