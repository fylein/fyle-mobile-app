import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from '../core/services/auth.service';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) { }


  get(searchString: string) {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) => {
        return this.httpClient.get<any>(environment.ROOT_URL + '/vendors/all', {
          params: {
            org_user_id: eou.ou.id,
            q: searchString
          }
        });
      })
    );
  }
}
