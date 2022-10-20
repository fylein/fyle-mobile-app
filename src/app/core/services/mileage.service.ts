import { Injectable } from '@angular/core';
import { LocationService } from './location.service';
import { from, of } from 'rxjs';
import { concatMap, map, reduce } from 'rxjs/operators';
import { OrgUserSettingsService } from './org-user-settings.service';
import { Cacheable } from 'ts-cacheable';

@Injectable({
  providedIn: 'root',
})
export class MileageService {
  constructor(private locationService: LocationService, private orgUserSettingsService: OrgUserSettingsService) {}

  @Cacheable()
  getOrgUserMileageSettings() {
    return this.orgUserSettingsService.get().pipe(map((res: any) => res.mileage_settings));
  }

  getDistanceInternal(fromLocation, toLocation) {
    return this.locationService.getDistance(fromLocation, toLocation);
  }

  getDistance(locations: any[] = []) {
    const chunks = [];

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

  private getChunks(locations: any[], chunks: any[]) {
    for (let index = 0, len = locations.length - 1; index < len; index++) {
      const from = locations[index];
      const to = locations[index + 1];

      if (from && to && from.display && to.display && from.latitude && to.latitude && from.longitude && to.longitude) {
        chunks.push([from, to]);
      }
    }
  }
}
