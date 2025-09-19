import { TestBed } from '@angular/core/testing';

import { FeatureConfigService } from './feature-config.service';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { AuthService } from '../../../auth.service';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { featureConfigOptInData } from 'src/app/core/mock-data/feature-config.data';
import { of } from 'rxjs';

describe('FeatureConfigService', () => {
  let service: FeatureConfigService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get', 'post']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);

    TestBed.configureTestingModule({
      providers: [
        { provide: SpenderPlatformV1ApiService, useValue: spenderPlatformV1ApiServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });
    service = TestBed.inject(FeatureConfigService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService,
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getConfiguration(): should return feature config on the basis of user_id', (done) => {
    authService.getEou.and.resolveTo(apiEouRes);
    spenderPlatformV1ApiService.get.and.returnValue(of({ data: [featureConfigOptInData] }));

    const config = {
      feature: 'SMS_OPT_IN',
      key: 'POST_EXPENSE_CREATION',
      sub_feature: 'ALL_EXPENSES',
    };

    service.getConfiguration(config).subscribe((response) => {
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/feature_configs', {
        params: {
          target_client: 'eq.MOBILEAPP',
          feature: 'eq.SMS_OPT_IN',
          key: 'eq.POST_EXPENSE_CREATION',
          is_shared: 'eq.false',
          user_id: 'eq.usvKA4X8Ugcr',
          sub_feature: 'eq.ALL_EXPENSES',
        },
      });
      expect(response).toEqual(featureConfigOptInData);
      done();
    });
  });

  it('saveConfiguration(): should save feature config', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(null));

    const config = {
      feature: 'SMS_OPT_IN',
      key: 'POST_EXPENSE_CREATION',
      value: { count: 1 },
      sub_feature: 'ALL_EXPENSES',
    };

    service.saveConfiguration(config).subscribe((response) => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/feature_configs/bulk', {
        data: [
          {
            target_client: 'MOBILEAPP',
            feature: 'SMS_OPT_IN',
            key: 'POST_EXPENSE_CREATION',
            value: { count: 1 },
            is_shared: false,
            sub_feature: 'ALL_EXPENSES',
          },
        ],
      });
      expect(response).toBeNull();
      done();
    });
  });
});
