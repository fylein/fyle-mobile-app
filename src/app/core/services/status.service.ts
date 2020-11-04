import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { DatePipe } from '@angular/common';
import { ExtendedStatus } from '../models/extended_status.model';

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
      map((estatuses: ExtendedStatus[])=> {
        return estatuses.map(estatus => {
          estatus.st_created_at = new Date(estatus.st_created_at);
          estatus.st_created_at = this.dateService.getLocalDate(estatus.st_created_at);
          return estatus as ExtendedStatus;
        });
      })
    )
  }


  post(objectType, objectId, status, notify = false) {
    return this.apiService.post('/' + objectType + '/' + objectId + '/statuses', {
      status,
      notify: notify
    });
  };
}
