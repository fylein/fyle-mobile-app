import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs/internal/observable/of';
import { CategoriesService } from './categories.service';
import { SpenderPlatformApiService } from './spender-platform-api.service';

const categoryPlatformResponse = {
  count: 4,
  data: [
    {
      code: null,
      created_at: '2020-05-26T09:41:48.997882+00:00',
      display_name: 'Activity',
      id: 110221,
      is_enabled: true,
      name: 'Activity',
      org_id: 'orDjkSfq43i2',
      restricted_project_ids: [],
      sub_category: null,
      system_category: 'Activity',
      updated_at: '2022-05-05T17:47:34.313143+00:00',
    },
    {
      code: null,
      created_at: '2020-05-26T09:41:49.013496+00:00',
      display_name: 'Train',
      id: 110222,
      is_enabled: true,
      name: 'Train',
      org_id: 'orDjkSfq43i2',
      restricted_project_ids: [290502, 290501],
      sub_category: null,
      system_category: 'Train',
      updated_at: '2022-05-05T17:47:34.313143+00:00',
    },
    {
      code: null,
      created_at: '2020-05-26T09:41:49.025697+00:00',
      display_name: 'Fuel',
      id: 110223,
      is_enabled: true,
      name: 'Fuel',
      org_id: 'orDjkSfq43i2',
      restricted_project_ids: [290501],
      sub_category: null,
      system_category: 'Fuel',
      updated_at: '2022-05-05T17:47:34.313143+00:00',
    },
    {
      code: null,
      created_at: '2020-05-26T09:41:49.034454+00:00',
      display_name: 'Snacks',
      id: 110224,
      is_enabled: true,
      name: 'Snacks',
      org_id: 'orDjkSfq43i2',
      restricted_project_ids: [290501],
      sub_category: null,
      system_category: 'Snacks',
      updated_at: '2022-05-05T17:47:34.313143+00:00',
    },
  ],
  offset: 0,
};

const transformedCategories = [
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:48.997882+00:00'),
    displayName: 'Activity',
    id: 110221,
    enabled: true,
    name: 'Activity',
    org_id: 'orDjkSfq43i2',
    sub_category: null,
    fyle_category: 'Activity',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.013496+00:00'),
    displayName: 'Train',
    id: 110222,
    enabled: true,
    name: 'Train',
    org_id: 'orDjkSfq43i2',
    sub_category: null,
    fyle_category: 'Train',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.025697+00:00'),
    displayName: 'Fuel',
    id: 110223,
    enabled: true,
    name: 'Fuel',
    org_id: 'orDjkSfq43i2',
    sub_category: null,
    fyle_category: 'Fuel',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.034454+00:00'),
    displayName: 'Snacks',
    id: 110224,
    enabled: true,
    name: 'Snacks',
    org_id: 'orDjkSfq43i2',
    sub_category: null,
    fyle_category: 'Snacks',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
];

const unsortedCategories1 = [
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:48.997882+00:00'),
    displayName: 'Activity',
    id: 110221,
    enabled: true,
    name: 'Activity',
    org_id: 'orDjkSfq43i2',
    sub_category: 'temp activity 2',
    fyle_category: 'Activity',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:48.997882+00:00'),
    displayName: 'Activity',
    id: 110221,
    enabled: true,
    name: 'Activity',
    org_id: 'orDjkSfq43i2',
    sub_category: 'temp activity 1',
    fyle_category: 'Activity',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:48.997882+00:00'),
    displayName: 'Activity',
    id: 110221,
    enabled: true,
    name: 'Activity',
    org_id: 'orDjkSfq43i2',
    sub_category: 'Activity',
    fyle_category: 'Activity',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:48.997882+00:00'),
    displayName: 'Activity',
    id: 110221,
    enabled: true,
    name: 'Activity',
    org_id: 'orDjkSfq43i2',
    sub_category: 'temp activity 3',
    fyle_category: 'Activity',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:48.997882+00:00'),
    displayName: 'Activity',
    id: 110221,
    enabled: true,
    name: 'Activity',
    org_id: 'orDjkSfq43i2',
    sub_category: 'temp activity 3',
    fyle_category: 'Activity',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
];

const sortedCategories1 = [
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:48.997882+00:00'),
    displayName: 'Activity',
    id: 110221,
    enabled: true,
    name: 'Activity',
    org_id: 'orDjkSfq43i2',
    sub_category: 'Activity',
    fyle_category: 'Activity',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:48.997882+00:00'),
    displayName: 'Activity',
    id: 110221,
    enabled: true,
    name: 'Activity',
    org_id: 'orDjkSfq43i2',
    sub_category: 'temp activity 1',
    fyle_category: 'Activity',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:48.997882+00:00'),
    displayName: 'Activity',
    id: 110221,
    enabled: true,
    name: 'Activity',
    org_id: 'orDjkSfq43i2',
    sub_category: 'temp activity 2',
    fyle_category: 'Activity',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:48.997882+00:00'),
    displayName: 'Activity',
    id: 110221,
    enabled: true,
    name: 'Activity',
    org_id: 'orDjkSfq43i2',
    sub_category: 'temp activity 3',
    fyle_category: 'Activity',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:48.997882+00:00'),
    displayName: 'Activity',
    id: 110221,
    enabled: true,
    name: 'Activity',
    org_id: 'orDjkSfq43i2',
    sub_category: 'temp activity 3',
    fyle_category: 'Activity',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
];

const categoriesForFilterTest = [
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:48.997882+00:00'),
    displayName: 'Activity',
    id: 110221,
    enabled: true,
    name: 'Activity',
    org_id: 'orDjkSfq43i2',
    sub_category: null,
    fyle_category: 'Activity',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.013496+00:00'),
    displayName: 'Train',
    id: 110222,
    enabled: true,
    name: 'Train',
    org_id: 'orDjkSfq43i2',
    sub_category: null,
    fyle_category: 'Train',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.013496+00:00'),
    displayName: 'Polka',
    id: 110222,
    enabled: true,
    name: 'Polka',
    org_id: 'orDjkSfq43i2',
    sub_category: null,
    fyle_category: null,
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.025697+00:00'),
    displayName: 'Fuel',
    id: 110223,
    enabled: true,
    name: 'Fuel',
    org_id: 'orDjkSfq43i2',
    sub_category: 'Fuel',
    fyle_category: 'Fuel',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.025697+00:00'),
    displayName: 'Fuel / Fuel2',
    id: 110223,
    enabled: true,
    name: 'Fuel',
    org_id: 'orDjkSfq43i2',
    sub_category: 'Fuel2',
    fyle_category: 'Fuel',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.034454+00:00'),
    displayName: 'Snacks',
    id: 110224,
    enabled: true,
    name: 'Snacks',
    org_id: 'orDjkSfq43i2',
    sub_category: null,
    fyle_category: 'Snacks',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
];

const categoriesAfterFilterTest = [
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.013496+00:00'),
    displayName: 'Train',
    id: 110222,
    enabled: true,
    name: 'Train',
    org_id: 'orDjkSfq43i2',
    sub_category: null,
    fyle_category: 'Train',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.013496+00:00'),
    displayName: 'Polka',
    id: 110222,
    enabled: true,
    name: 'Polka',
    org_id: 'orDjkSfq43i2',
    sub_category: null,
    fyle_category: null,
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.025697+00:00'),
    displayName: 'Fuel',
    id: 110223,
    enabled: true,
    name: 'Fuel',
    org_id: 'orDjkSfq43i2',
    sub_category: 'Fuel',
    fyle_category: 'Fuel',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.025697+00:00'),
    displayName: 'Fuel / Fuel2',
    id: 110223,
    enabled: true,
    name: 'Fuel',
    org_id: 'orDjkSfq43i2',
    sub_category: 'Fuel2',
    fyle_category: 'Fuel',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
  {
    code: null,
    created_at: new Date('2020-05-26T09:41:49.034454+00:00'),
    displayName: 'Snacks',
    id: 110224,
    enabled: true,
    name: 'Snacks',
    org_id: 'orDjkSfq43i2',
    sub_category: null,
    fyle_category: 'Snacks',
    updated_at: new Date('2022-05-05T17:47:34.313143+00:00'),
  },
];

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;
  let spenderPlatformApiService: jasmine.SpyObj<SpenderPlatformApiService>;

  beforeEach(() => {
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        CategoriesService,
        {
          provide: SpenderPlatformApiService,
          useValue: spenderPlatformApiServiceSpy,
        },
      ],
    });
    categoriesService = TestBed.inject(CategoriesService);
    spenderPlatformApiService = TestBed.inject(SpenderPlatformApiService) as jasmine.SpyObj<SpenderPlatformApiService>;
  });

  it('should be created', () => {
    expect(categoriesService).toBeTruthy();
  });

  it('should return proper response from api and transform it into proper model', (done) => {
    spenderPlatformApiService.get.and.returnValue(of(categoryPlatformResponse));
    const sortedCategories = categoriesService.sortCategories(transformedCategories);
    categoriesService.getAll().subscribe((categories) => {
      expect(categories).toEqual(sortedCategories);
      done();
    });
  });

  it('should be able to sort categories properly', () => {
    const sortedCategories = categoriesService.sortCategories(unsortedCategories1);
    expect(sortedCategories).toEqual(sortedCategories1);
  });

  it('should be able to filter categories for creation of expenses properly', () => {
    const filteredCategories = categoriesService.filterRequired(categoriesForFilterTest);
    expect(filteredCategories).toEqual(categoriesAfterFilterTest);
  });
});
