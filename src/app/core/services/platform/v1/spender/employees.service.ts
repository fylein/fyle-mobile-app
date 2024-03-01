import { Injectable } from '@angular/core';
import { SpenderService } from './spender.service';
import { Observable } from 'rxjs';
import { CommuteDetails } from 'src/app/core/models/platform/v1/commute-details.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  constructor(private spenderService: SpenderService) {}

  postCommuteDetails(commuteDetails: CommuteDetails): Observable<any> {
    return this.spenderService.post('/employees/commute_details', {
      data: {
        commute_details: commuteDetails,
      },
    });
  }
}
