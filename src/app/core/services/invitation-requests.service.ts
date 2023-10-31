import { Injectable } from '@angular/core';
import { RouterApiService } from './router-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvitationRequestsService {
  constructor(private routerApiService: RouterApiService) {}

  upsertRouter(email: string): Observable<null> {
    return this.routerApiService.post<null>('/invitation_requests/invite', { email });
  }
}
