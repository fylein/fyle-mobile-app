import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { TaxGroupService } from './tax_group.service';

const taxGroupApiV2Response = {
  count: 4,
  data: [
    {
      created_at: '2022-01-11T16:47:32.799643',
      created_by: {
        allowed_CIDRs: [],
        cluster_domain: null,
        name: 'ouX2ae0s0Sv2',
        org_id: 'orrjqbDbeP9p',
        org_user_id: 'ouX2ae0s0Sv2',
        proxy_org_user_id: null,
        roles: ['FYLER', 'TRAVEL_ADMIN', 'ADMIN', 'APPROVER'],
        scopes: [],
        tpa_id: 'tpaoTkeEaiFeg',
        tpa_name: null,
        user_id: 'usJzTy7lqHSI',
      },
      id: 'tgGkhkwUUtJv',
      is_enabled: true,
      name: 'sdfsdfsdfsdf',
      org_id: 'orrjqbDbeP9p',
      percentage: 18,
      updated_at: '2022-01-11T16:47:32.799643',
      updated_by: {
        allowed_CIDRs: [],
        cluster_domain: null,
        name: 'ouX2ae0s0Sv2',
        org_id: 'orrjqbDbeP9p',
        org_user_id: 'ouX2ae0s0Sv2',
        proxy_org_user_id: null,
        roles: ['FYLER', 'TRAVEL_ADMIN', 'ADMIN', 'APPROVER'],
        scopes: [],
        tpa_id: 'tpaoTkeEaiFeg',
        tpa_name: null,
        user_id: 'usJzTy7lqHSI',
      },
    },
    {
      created_at: '2022-01-11T16:47:32.799643',
      created_by: {
        allowed_CIDRs: [],
        cluster_domain: null,
        name: 'ouX2ae0s0Sv2',
        org_id: 'orrjqbDbeP9p',
        org_user_id: 'ouX2ae0s0Sv2',
        proxy_org_user_id: null,
        roles: ['FYLER', 'TRAVEL_ADMIN', 'ADMIN', 'APPROVER'],
        scopes: [],
        tpa_id: 'tpaoTkeEaiFeg',
        tpa_name: null,
        user_id: 'usJzTy7lqHSI',
      },
      id: 'tgpXt0GjWqkp',
      is_enabled: true,
      name: 'Enertyesdfrgine',
      org_id: 'orrjqbDbeP9p',
      percentage: 18,
      updated_at: '2022-01-11T16:47:32.799643',
      updated_by: {
        allowed_CIDRs: [],
        cluster_domain: null,
        name: 'ouX2ae0s0Sv2',
        org_id: 'orrjqbDbeP9p',
        org_user_id: 'ouX2ae0s0Sv2',
        proxy_org_user_id: null,
        roles: ['FYLER', 'TRAVEL_ADMIN', 'ADMIN', 'APPROVER'],
        scopes: [],
        tpa_id: 'tpaoTkeEaiFeg',
        tpa_name: null,
        user_id: 'usJzTy7lqHSI',
      },
    },
    {
      created_at: '2022-01-11T16:48:50.415136',
      created_by: {
        allowed_CIDRs: [],
        cluster_domain: null,
        name: 'ouX2ae0s0Sv2',
        org_id: 'orrjqbDbeP9p',
        org_user_id: 'ouX2ae0s0Sv2',
        proxy_org_user_id: null,
        roles: ['FYLER', 'TRAVEL_ADMIN', 'ADMIN', 'APPROVER'],
        scopes: [],
        tpa_id: 'tpaoTkeEaiFeg',
        tpa_name: null,
        user_id: 'usJzTy7lqHSI',
      },
      id: 'tghfGCzN5O06',
      is_enabled: true,
      name: 'sdfsgiufiudfsdfsdf',
      org_id: 'orrjqbDbeP9p',
      percentage: 18,
      updated_at: '2022-01-11T16:48:50.415136',
      updated_by: {
        allowed_CIDRs: [],
        cluster_domain: null,
        name: 'ouX2ae0s0Sv2',
        org_id: 'orrjqbDbeP9p',
        org_user_id: 'ouX2ae0s0Sv2',
        proxy_org_user_id: null,
        roles: ['FYLER', 'TRAVEL_ADMIN', 'ADMIN', 'APPROVER'],
        scopes: [],
        tpa_id: 'tpaoTkeEaiFeg',
        tpa_name: null,
        user_id: 'usJzTy7lqHSI',
      },
    },
    {
      created_at: '2022-01-11T16:48:50.415136',
      created_by: {
        allowed_CIDRs: [],
        cluster_domain: null,
        name: 'ouX2ae0s0Sv2',
        org_id: 'orrjqbDbeP9p',
        org_user_id: 'ouX2ae0s0Sv2',
        proxy_org_user_id: null,
        roles: ['FYLER', 'TRAVEL_ADMIN', 'ADMIN', 'APPROVER'],
        scopes: [],
        tpa_id: 'tpaoTkeEaiFeg',
        tpa_name: null,
        user_id: 'usJzTy7lqHSI',
      },
      id: 'tghVuRqYO0fY',
      is_enabled: true,
      name: 'Enerligoiugttyesdfrgine',
      org_id: 'orrjqbDbeP9p',
      percentage: 18,
      updated_at: '2022-01-11T16:48:50.415136',
      updated_by: {
        allowed_CIDRs: [],
        cluster_domain: null,
        name: 'ouX2ae0s0Sv2',
        org_id: 'orrjqbDbeP9p',
        org_user_id: 'ouX2ae0s0Sv2',
        proxy_org_user_id: null,
        roles: ['FYLER', 'TRAVEL_ADMIN', 'ADMIN', 'APPROVER'],
        scopes: [],
        tpa_id: 'tpaoTkeEaiFeg',
        tpa_name: null,
        user_id: 'usJzTy7lqHSI',
      },
    },
  ],
  limit: 4,
  offset: 0,
  url: '/v2/tax_groups',
};

describe('TaxGroupService', () => {
  let taxGroupService: TaxGroupService;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;

  beforeEach(() => {
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);

    TestBed.configureTestingModule({
      providers: [
        TaxGroupService,
        {
          provide: ApiV2Service,
          useValue: apiV2ServiceSpy,
        },
      ],
    });
    taxGroupService = TestBed.inject(TaxGroupService);
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
  });

  it('should be created', () => {
    expect(taxGroupService).toBeTruthy();
  });

  it('should be able to fetch tax groups data from api', (done) => {
    apiV2Service.get.and.returnValue(of(taxGroupApiV2Response));

    taxGroupService
      .get({
        is_enabled: 'eq.true',
      })
      .subscribe((taxGroups) => {
        expect(taxGroups).toEqual(taxGroupApiV2Response.data);
        expect(apiV2Service.get).toHaveBeenCalledWith('/tax_groups', {
          params: {
            is_enabled: 'eq.true',
          },
        });
        done();
      });
  });
});
