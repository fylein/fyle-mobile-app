import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { tap, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrgService {

  constructor(
    private apiService: ApiService
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
    return this.apiService.get('/orgs');
  }
}
