import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, switchMap, concatMap, reduce } from 'rxjs/operators';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { DataTransformService } from './data-transform.service';
import { range, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExtendedOrgUsersService {

  constructor(
    private apiService: ApiService,
    private dataTransformService: DataTransformService,
  ) { }

  getCompanyEouc(params: { offset: number, limit: number }) {
    return this.apiService.get('/eous/company', {
      params
    }).pipe(
      map(
        eous => eous.map(
          eou => this.dataTransformService.unflatten(eou) as ExtendedOrgUser
        )
      )
    );
  }

  getAllCompanyEouc() {
    return this.getCompanyEouCount().pipe(
      switchMap(res => {
        return range(0, res.count / 50);
      }),
      concatMap(page => {
        return this.getCompanyEouc({ offset: 50 * page, limit: 50 });
      }),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }, [] as ExtendedOrgUser[])
    );
  }

  getCompanyEouCount(): Observable<{ count: number }> {
    return this.apiService.get('/eous/company/count').pipe(
      map(
        res => res as { count: number }
      )
    );
  }
}
