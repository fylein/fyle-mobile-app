import { TestBed } from '@angular/core/testing';
import { FiltersHelperService } from './filters-helper.service';
import { Filters } from '../models/filters.model';
import { AdvancesStates } from '../models/advances-states.model';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
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

  it('should generate pill using only Sorting Params - Approved At New To Old', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'approved at - new to old' }];

    expect(service.generateFilterPills(testFilters)).toBeTruthy();
    expect(service.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Approved At Old To New', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
      sortDir: SortingDirection.ascending,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'approved at - old to new' }];

    expect(service.generateFilterPills(testFilters)).toBeTruthy();
    expect(service.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Created At New to Old', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.creationDate,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'created at - new to old' }];

    expect(service.generateFilterPills(testFilters)).toBeTruthy();
    expect(service.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Created At Old to New', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.creationDate,
      sortDir: SortingDirection.ascending,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'created at - old to new' }];

    expect(service.generateFilterPills(testFilters)).toBeTruthy();
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
});
