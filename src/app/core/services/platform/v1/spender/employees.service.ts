import { Injectable, inject } from '@angular/core';
import { SpenderService } from './spender.service';
import { map, Observable } from 'rxjs';
import { CommuteDetails } from 'src/app/core/models/platform/v1/commute-details.model';
import { CommuteDetailsResponse } from 'src/app/core/models/platform/commute-details-response.model';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { PlatformEmployee } from 'src/app/core/models/platform/platform-employee.model';
import { EmployeeParams } from 'src/app/core/models/employee-params.model';
import { Employee } from 'src/app/core/models/spender/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private spenderService = inject(SpenderService);

  getCommuteDetails(eou: ExtendedOrgUser): Observable<PlatformApiResponse<CommuteDetailsResponse[]>> {
    return this.spenderService.get('/employees', {
      params: {
        user_id: `eq.${eou.us.id}`,
      },
    });
  }

  postCommuteDetails(commuteDetails: CommuteDetails): Observable<{ data: CommuteDetailsResponse }> {
    return this.spenderService.post('/employees/commute_details', {
      data: {
        commute_details: commuteDetails,
      },
    });
  }

  getByParams(params: Partial<PlatformEmployee>): Observable<PlatformApiResponse<PlatformEmployee[]>> {
    return this.spenderService.get(`/employees`, { params });
  }

  getEmployeesByParams(params: Partial<EmployeeParams>): Observable<PlatformApiResponse<Partial<Employee>[]>> {
    return this.spenderService.get<PlatformApiResponse<Partial<Employee>[]>>('/employees', { params });
  }

  getEmployeesBySearch(params: Partial<EmployeeParams>): Observable<Partial<Employee>[]> {
    if (params.or) {
      params.and = `(or${params.or},or(is_enabled.eq.true))`;
    } else {
      params.or = '(is_enabled.eq.true)';
    }
    return this.getEmployeesByParams({
      ...params,
    }).pipe(map((res) => res.data));
  }
}
