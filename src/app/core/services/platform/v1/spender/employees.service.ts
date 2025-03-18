import { Injectable } from '@angular/core';
import { SpenderService } from './spender.service';
import { Observable } from 'rxjs';
import { CommuteDetails } from 'src/app/core/models/platform/v1/commute-details.model';
import { CommuteDetailsResponse } from 'src/app/core/models/platform/commute-details-response.model';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { PlatformEmployee } from 'src/app/core/models/platform/platform-employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  constructor(private spenderService: SpenderService) {}

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
}
