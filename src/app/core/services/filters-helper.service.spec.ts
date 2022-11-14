import { TestBed } from '@angular/core/testing';
import { FiltersHelperService } from './filters-helper.service';
import { Filters } from '../models/filters.model';
import { AdvancesStates } from '../models/advances-states.model';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { SortingValue } from '../models/sorting-value.model';
import { ModalController } from '@ionic/angular';
import { TitleCasePipe } from '@angular/common';
import { SortingDirection } from '../models/sorting-direction.model';
import { SortingParam } from '../models/sorting-param.model';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';

describe('FiltersHelperService', () => {
  let service: FiltersHelperService;
  let controller: jasmine.SpyObj<ModalController>;
  let titlePipe: jasmine.SpyObj<TitleCasePipe>;

  beforeEach(() => {
    const controllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const titleSpy = jasmine.createSpyObj('TitleCasePipe', ['transform']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ModalController,
          useValue: controllerSpy,
        },
        {
          provide: TitleCasePipe,
          useValue: titleSpy,
        },
      ],
    });
    service = TestBed.inject(FiltersHelperService);
    controller = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    titlePipe = TestBed.inject(TitleCasePipe) as jasmine.SpyObj<TitleCasePipe>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Testing Function: generateFilterPills
   */

  it('should generated pill using project name and states', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.approved, AdvancesStates.cancelled],
      sortParam: SortingParam.approvalDate,
    };

    const result = service.generateFilterPills(testFilters, 'some project');
    expect(result).toBeTruthy();
  });

  it('should generate pill using only Sorting Params - Approved At New To Old', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'approved at - new to old' }];

    expect(service.generateFilterPills(testFilters, 'some project')).toBeTruthy();
    expect(service.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Approved At Old To New', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
      sortDir: SortingDirection.ascending,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'approved at - old to new' }];

    expect(service.generateFilterPills(testFilters, 'some project')).toBeTruthy();
    expect(service.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Created At New to Old', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.creationDate,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'created at - new to old' }];

    expect(service.generateFilterPills(testFilters, 'some project')).toBeTruthy();
    expect(service.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Created At Old to New', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.creationDate,
      sortDir: SortingDirection.ascending,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'created at - old to new' }];

    expect(service.generateFilterPills(testFilters, 'some project')).toBeTruthy();
    expect(service.generateFilterPills(testFilters)).toEqual(testPill);
  });

  /**
   * Testing Function: generateSelectedFilters and convertDataToFilters
   */

  it('should generate selected filters using only State - APPROVED,DRAFT', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.approved, AdvancesStates.draft],
    };

    const testSelectedFilter: SelectedFilters<any>[] = [
      {
        name: 'State',
        value: ['APPROVED', 'DRAFT'],
      },
    ];

    expect(service.generateSelectedFilters(testFilters)).toBeTruthy();
    expect(service.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
    expect(service.convertDataToFilters(testSelectedFilter)).toEqual(testFilters);
  });

  it('should generate selected filters using only State - PAID,CANCELLED', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.paid, AdvancesStates.cancelled],
    };

    const testSelectedFilter: SelectedFilters<any>[] = [
      {
        name: 'State',
        value: ['PAID', 'CANCELLED'],
      },
    ];

    expect(service.generateSelectedFilters(testFilters)).toBeTruthy();
    expect(service.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
    expect(service.convertDataToFilters(testSelectedFilter)).toEqual(testFilters);
  });

  it('should generate selected filters using only State - SENT_BACK,APPROVAL_PENDING', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.sentBack, AdvancesStates.pending],
    };

    const testSelectedFilter: SelectedFilters<any>[] = [
      {
        name: 'State',
        value: ['SENT_BACK', 'APPROVAL_PENDING'],
      },
    ];

    expect(service.generateSelectedFilters(testFilters)).toBeTruthy();
    expect(service.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
    expect(service.convertDataToFilters(testSelectedFilter)).toEqual(testFilters);
  });

  it('should generate selected filters using Sort Param - APPROVAL DATE | DESCENDING', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
      sortDir: SortingDirection.descending,
    };

    const testSelectedFilter: SelectedFilters<any>[] = [
      {
        name: 'Sort By',
        value: 'appDateNewToOld',
      },
      {
        name: 'Sort Direction',
        value: 1,
      },
    ];

    expect(service.generateSelectedFilters(testFilters)).toBeTruthy();
    expect(service.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
    expect(service.convertDataToFilters(testSelectedFilter)).toEqual(testFilters);
  });

  it('should generate selected filters using Sort Param - CREATED DATE | ASCENDING', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.creationDate,
      sortDir: SortingDirection.ascending,
    };

    const testSelectedFilter: SelectedFilters<any>[] = [
      {
        name: 'Sort By',
        value: 'crDateOldToNew',
      },
    ];

    expect(service.generateSelectedFilters(testFilters)).toBeTruthy();
    expect(service.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
    expect(service.convertDataToFilters(testSelectedFilter)).toEqual(testFilters);
  });

  it('should generate selected filters using Sort Param - PROJECT | ASCENDING', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.project,
      sortDir: SortingDirection.ascending,
    };

    const testSelectedFilter: SelectedFilters<any>[] = [
      {
        name: 'Sort By',
        value: 'projectAToZ',
      },
    ];

    expect(service.generateSelectedFilters(testFilters)).toBeTruthy();
    expect(service.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
    expect(service.convertDataToFilters(testSelectedFilter)).toEqual(testFilters);
  });

  it('should generate selected filters using Sort Param - PROJECT | DESCENDING', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.project,
      sortDir: SortingDirection.descending,
    };

    const testSelectedFilter: SelectedFilters<any>[] = [
      {
        name: 'Sort By',
        value: 'projectZToA',
      },
      {
        name: 'Sort Direction',
        value: 1,
      },
    ];

    expect(service.generateSelectedFilters(testFilters)).toBeTruthy();
    expect(service.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
    expect(service.convertDataToFilters(testSelectedFilter)).toEqual(testFilters);
  });

  /**
   * Testing modal controller
   */

  it('should open the modal and save date', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
      sortDir: SortingDirection.ascending,
    };

    const filterOptions = [
      {
        name: 'State',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Draft',
            value: AdvancesStates.draft,
          },

          {
            label: 'Sent Back',
            value: AdvancesStates.sentBack,
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Sort By',
        optionType: FilterOptionType.singleselect,
        options: [
          {
            label: 'Created At - New to Old',
            value: SortingValue.creationDateAsc,
          },
          {
            label: 'Created At - Old to New',
            value: SortingValue.creationDateDesc,
          },
          {
            label: 'Approved At - New to Old',
            value: SortingValue.approvalDateAsc,
          },
          {
            label: 'Approved At - Old to New',
            value: SortingValue.approvalDateDesc,
          },
        ],
      },
    ];
    const result = service.openFilterModal(testFilters, filterOptions);
  });
});
