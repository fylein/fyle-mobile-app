import { Injectable } from '@angular/core';
import { LocationService } from './location.service';
import { from, Observable, of } from 'rxjs';
import { concatMap, map, reduce } from 'rxjs/operators';
import { OrgUserSettingsService } from './org-user-settings.service';
import { Cacheable } from 'ts-cacheable';
import { MileageSettings, OrgUserSettings } from '../models/org_user_settings.model';
import { Location } from '../models/location.model';
@Injectable({
  providedIn: 'root',
})
export class MileageService {
  constructor(private locationService: LocationService, private orgUserSettingsService: OrgUserSettingsService) {}

  @Cacheable()
  getOrgUserMileageSettings(): Observable<MileageSettings> {
    return this.orgUserSettingsService.get().pipe(map((res: OrgUserSettings) => res.mileage_settings));
  }

  getDistanceInternal(fromLocation: Location, toLocation: Location): Observable<number> {
    return this.locationService.getDistance(fromLocation, toLocation);
  }

  getDistance(locations: Location[] = []): Observable<number> {
    const chunks: Array<Location[]> = [];

    this.getChunks(locations, chunks);

    if (chunks.length === 0) {
      return of(null);
    } else {
      return from(chunks).pipe(
        concatMap((chunk) => this.getDistanceInternal(chunk[0], chunk[1])),
        reduce((dist1, dist2) => dist1 + dist2)
      );
    }
  }

  private getChunks(locations: Location[], chunks: Array<Location[]>) {
    for (let index = 0, len = locations.length - 1; index < len; index++) {
      const from = locations[index];
      const to = locations[index + 1];

      if (from && to && from.display && to.display && from.latitude && to.latitude && from.longitude && to.longitude) {
        chunks.push([from, to]);
      }
    }
  }
}
