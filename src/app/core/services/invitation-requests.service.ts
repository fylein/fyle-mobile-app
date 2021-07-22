import { Injectable } from '@angular/core';
import { RouterApiService } from './router-api.service';

@Injectable({
    providedIn: 'root'
})
export class InvitationRequestsService {

    constructor(
    private routerApiService: RouterApiService
    ) { }

    upsertRouter(email: string) {
        return this.routerApiService.post('/invitation_requests/invite', { email });
    }
}
