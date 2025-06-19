import { Injectable } from '@angular/core';
import { LocationService } from './location.service';
import { from, Observable, of } from 'rxjs';
import { concatMap, map, reduce } from 'rxjs/operators';
import { OrgUserSettingsService } from './org-user-settings.service';
import { Cacheable } from 'ts-cacheable';
import { MileageSettings, OrgUserSettings } from '../models/org_user_settings.model';
import { Location } from '../models/location.model';
import { OrgSettings } from '../models/org-settings.model';
import { CommuteDeductionOptions } from '../models/commute-deduction-options.model';
import { CommuteDeduction } from '../enums/commute-deduction.enum';
import { TranslocoService } from '@jsverse/transloco';
@Injectable({
  providedIn: 'root',
})
export class MileageService {
  constructor(
    private locationService: LocationService,
    private orgUserSettingsService: OrgUserSettingsService,
    private translocoService: TranslocoService
  ) {}

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

  isCommuteDeductionEnabled(orgSettings: OrgSettings): boolean {
    return (
      orgSettings.mileage?.allowed &&
      orgSettings.mileage.enabled &&
      orgSettings.commute_deduction_settings?.allowed &&
      orgSettings.commute_deduction_settings.enabled
    );
  }

  getCommuteDeductionOptions(distance: number): CommuteDeductionOptions[] {
    return [
      {
        label: this.translocoService.translate('services.mileage.oneWayDistance'),
        value: CommuteDeduction.ONE_WAY,
        distance: distance === null || distance === undefined ? null : distance,
      },
      {
        label: this.translocoService.translate('services.mileage.roundTripDistance'),
        value: CommuteDeduction.ROUND_TRIP,
        distance: distance === null || distance === undefined ? null : distance * 2,
      },
      {
        label: this.translocoService.translate('services.mileage.noDeduction'),
        value: CommuteDeduction.NO_DEDUCTION,
        distance: 0,
      },
    ];
  }

  private getChunks(locations: Location[], chunks: Array<Location[]>): void {
    for (let index = 0, len = locations.length - 1; index < len; index++) {
      const from = locations[index];
      const to = locations[index + 1];

      if (from && to && from.display && to.display && from.latitude && to.latitude && from.longitude && to.longitude) {
        chunks.push([from, to]);
      }
    }
  }
}
