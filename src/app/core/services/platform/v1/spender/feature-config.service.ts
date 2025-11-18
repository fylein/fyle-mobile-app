import { Injectable, inject } from '@angular/core';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { Observable, Subject, from, map, switchMap } from 'rxjs';
import { FeatureConfig } from 'src/app/core/models/feature-config.model';
import { AuthService } from '../../../auth.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { CacheBuster, Cacheable } from 'ts-cacheable';

const featureConfigCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class FeatureConfigService {
  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  private authService = inject(AuthService);

  @Cacheable({
    cacheBusterObserver: featureConfigCacheBuster$,
  })
  getConfiguration<T>(configuration: Partial<FeatureConfig<T>>): Observable<FeatureConfig<T>> {
    return from(this.authService.getEou()).pipe(
      switchMap((extendedOrgUser) => {
        const data = {
          params: {
            target_client: 'eq.MOBILEAPP',
            feature: `eq.${configuration.feature}`,
            key: `eq.${configuration.key}`,
            is_shared: `eq.${configuration.is_shared || false}`,
            user_id: `eq.${extendedOrgUser.us.id}`,
          } as Record<string, string>,
        };

        if (configuration.sub_feature) {
          data.params.sub_feature = `eq.${configuration.sub_feature}`;
        }

        return this.spenderPlatformV1ApiService
          .get('/feature_configs', data)
          .pipe(map((response: PlatformApiResponse<FeatureConfig<T>[]>) => response.data[0]));
      }),
    );
  }

  @CacheBuster({
    cacheBusterNotifier: featureConfigCacheBuster$,
  })
  saveConfiguration<T>(configuration: Partial<FeatureConfig<T>>): Observable<void> {
    const params: Partial<FeatureConfig<T>> = {
      target_client: 'MOBILEAPP',
      feature: configuration.feature,
      key: configuration.key,
      value: configuration.value,
      is_shared: configuration.is_shared || false,
    };

    if (configuration.sub_feature) {
      params.sub_feature = configuration.sub_feature;
    }

    const payload = {
      data: [params],
    };

    return this.spenderPlatformV1ApiService.post('/feature_configs/bulk', payload);
  }
}
