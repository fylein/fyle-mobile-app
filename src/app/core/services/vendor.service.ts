import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Vendor } from '../models/vendor.model';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private httpClient = inject(HttpClient);

  private authService = inject(AuthService);

  ROOT_ENDPOINT: string;

  constructor() {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  get(searchString: string) {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.httpClient.get<Vendor[]>(this.ROOT_ENDPOINT + '/vendors/all', {
          params: {
            org_user_id: eou.ou.id,
            q: searchString,
          },
        }),
      ),
    );
  }
}
