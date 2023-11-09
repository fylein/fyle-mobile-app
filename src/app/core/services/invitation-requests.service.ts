import { Injectable } from '@angular/core';
import { RouterApiService } from './router-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvitationRequestsService {
  constructor(private routerApiService: RouterApiService) {}

  upsertRouter(email: string): Observable<void> {
    return this.routerApiService.post<void>('/invitation_requests/invite', { email });
  }
}
