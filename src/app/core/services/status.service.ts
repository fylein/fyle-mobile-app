import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  constructor(
    private apiService: ApiService,
    private dataTransformService: DataTransformService,
    private dateService: DateService,
    private datePipe: DatePipe
  ) { }

  find(objectType, objectId) {
    return this.apiService.get('/' + objectType + '/' + objectId + '/estatuses').pipe(
      map(estatuses => {
        return estatuses.map(estatus => {
          const res = this.dataTransformService.unflatten(estatus);
          this.dateService.fixDates(res.st);
          res.st.created_at = this.dateService.getLocalDate(res.st.created_at);
          res.st.createdAtNew = this.datePipe.transform(res.st.created_at, 'MMM d, y');
          return res;
        });
      })
    );
  }


  post(objectType, objectId, status, notify?) {
    return this.apiService.post('/' + objectType + '/' + objectId + '/statuses', {
      status,
      notify: notify || false // By default don't notify via mail for the new status to the interested parties.
    });
  };
}
