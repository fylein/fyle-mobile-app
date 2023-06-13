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

fdescribe('FiltersHelperService', () => {
  let filterHelperService: FiltersHelperService;
  let modalController: jasmine.SpyObj<ModalController>;

  const SortDirAsc: number = SortingDirection.ascending;
  const SortDirDesc: number = SortingDirection.descending;

  beforeEach(() => {
    const controllerSpy = jasmine.createSpyObj('ModalController', ['create']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ModalController,
          useValue: controllerSpy,
        },
        TitleCasePipe,
      ],
    });
    filterHelperService = TestBed.inject(FiltersHelperService);
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  });

  it('should be created', () => {
    expect(filterHelperService).toBeTruthy();
  });

  it('should generated pill using State - Approved and Draft', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.approved, AdvancesStates.draft],
    };

    const filterResponse = [
      {
        label: 'State',
        type: 'state',
        value: 'Approved, Draft',
      },
    ];

    expect(filterHelperService.generateFilterPills(testFilters)).toEqual(filterResponse);
  });

  it('should generated pill using State - Cancelled and Paid', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.cancelled, AdvancesStates.paid],
    };

    const filterResponse = [
      {
        label: 'State',
        type: 'state',
        value: 'Cancelled, Paid',
      },
    ];

    expect(filterHelperService.generateFilterPills(testFilters)).toEqual(filterResponse);
  });

  it('should generated pill using State - Approval Pending and Sent Back', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.pending, AdvancesStates.sentBack],
    };

    const filterResponse = [
      {
        label: 'State',
        type: 'state',
        value: 'Approval Pending, Sent Back',
      },
    ];

    expect(filterHelperService.generateFilterPills(testFilters)).toEqual(filterResponse);
  });

  it('should generate pill using only Sorting Params - Approved At New To Old', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'approved at - new to old' }];

    expect(filterHelperService.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params With Project Name - Project A to Z | Ascending', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.project,
      sortDir: SortingDirection.ascending,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'Some Project - A to Z' }];

    expect(filterHelperService.generateFilterPills(testFilters, 'some project')).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params With Project Name - Project Z to A | Descending', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.project,
      sortDir: SortingDirection.descending,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'Some Project - Z to A' }];

    expect(filterHelperService.generateFilterPills(testFilters, 'some project')).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Approved At New To Old', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'approved at - new to old' }];

    expect(filterHelperService.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Approved At Old To New', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
      sortDir: SortingDirection.ascending,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'approved at - old to new' }];

    expect(filterHelperService.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Created At New to Old', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.creationDate,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'created at - new to old' }];

    expect(filterHelperService.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Created At Old to New', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.creationDate,
      sortDir: SortingDirection.ascending,
    };

    const testPill: FilterPill[] = [{ label: 'Sort By', type: 'sort', value: 'created at - old to new' }];
    expect(filterHelperService.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate selected filters using only State - APPROVED,DRAFT', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.approved, AdvancesStates.draft],
    };

    const testSelectedFilter: SelectedFilters<string | number | string[]>[] = [
      {
        name: 'State',
        value: ['APPROVED', 'DRAFT'],
      },
    ];

    expect(filterHelperService.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
  });

  it('should generate selected filters using only State - PAID,CANCELLED', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.paid, AdvancesStates.cancelled],
    };

    const testSelectedFilter: SelectedFilters<string | number | string[]>[] = [
      {
        name: 'State',
        value: ['PAID', 'CANCELLED'],
      },
    ];

    expect(filterHelperService.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
  });

  it('should generate selected filters using only State - SENT_BACK,APPROVAL_PENDING', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.sentBack, AdvancesStates.pending],
    };

    const testSelectedFilter: SelectedFilters<string | number | string[]>[] = [
      {
        name: 'State',
        value: ['SENT_BACK', 'APPROVAL_PENDING'],
      },
    ];

    expect(filterHelperService.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
  });

  it('should generate selected filters using Sort Param - APPROVAL DATE | DESCENDING', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
      sortDir: SortingDirection.descending,
    };

    const testSelectedFilter: SelectedFilters<string | number>[] = [
      {
        name: 'Sort By',
        value: 'appDateNewToOld',
      },
      {
        name: 'Sort Direction',
        value: SortDirDesc,
      },
    ];

    expect(filterHelperService.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
  });

  it('should generate selected filters using Sort Param - CREATED DATE | ASCENDING', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.creationDate,
      sortDir: SortingDirection.ascending,
    };

    const testSelectedFilter: SelectedFilters<string | number>[] = [
      {
        name: 'Sort By',
        value: 'crDateOldToNew',
      },
    ];

    expect(filterHelperService.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
  });

  it('should generate selected filters using Sort Param - PROJECT | ASCENDING', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.project,
      sortDir: SortingDirection.ascending,
    };

    const testSelectedFilter: SelectedFilters<string | number>[] = [
      {
        name: 'Sort By',
        value: 'projectAToZ',
      },
    ];

    expect(filterHelperService.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
  });

  it('should generate selected filters using Sort Param - PROJECT | DESCENDING', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.project,
      sortDir: SortingDirection.descending,
    };

    const testSelectedFilter: SelectedFilters<string | number | string[]>[] = [
      {
        name: 'Sort By',
        value: 'projectZToA',
      },
      {
        name: 'Sort Direction',
        value: SortDirDesc,
      },
    ];

    expect(filterHelperService.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
  });

  it('should convert data to selected filters | Sort By - A to Z, Sort Direction - DESC, State - DRAFT,CANCELLED', () => {
    const testSelectedFilters: SelectedFilters<string | number | string[]>[] = [
      {
        name: 'Sort By',
        value: 'projectZToA',
      },
      {
        name: 'Sort Direction',
        value: SortDirDesc,
      },
      {
        name: 'State',
        value: ['APPROVED', 'DRAFT'],
      },
    ];

    const testFilters: Filters = {
      state: [AdvancesStates.approved, AdvancesStates.draft],
      sortParam: SortingParam.project,
      sortDir: SortingDirection.descending,
    };

    expect(filterHelperService.convertDataToFilters(testSelectedFilters)).toEqual(testFilters);
  });

  it('should convert data to selected filters | Sort By - Z to A, Sort Direction - DESC, State - DRAFT,CANCELLED', () => {
    const testSelectedFilters: SelectedFilters<string | number | string[]>[] = [
      {
        name: 'Sort By',
        value: 'projectZToA',
      },
      {
        name: 'Sort Direction',
        value: SortDirDesc,
      },
      {
        name: 'State',
        value: ['APPROVED', 'DRAFT'],
      },
    ];

    const testFilters: Filters = {
      state: [AdvancesStates.approved, AdvancesStates.draft],
      sortParam: SortingParam.project,
      sortDir: SortingDirection.descending,
    };

    expect(filterHelperService.convertDataToFilters(testSelectedFilters)).toEqual(testFilters);
  });

  it('should convert data to selected filters | Sort By - A to Z, Sort Direction - ASC', () => {
    const testSelectedFilters: SelectedFilters<string | number | string[]>[] = [
      {
        name: 'Sort By',
        value: 'projectAToZ',
      },
    ];

    const testFilters: Filters = {
      sortParam: SortingParam.project,
      sortDir: SortingDirection.ascending,
    };

    expect(filterHelperService.convertDataToFilters(testSelectedFilters)).toEqual(testFilters);
  });

  it('should convert data to selected filters | APPROVAL DATE - DESC', () => {
    const testSelectedFilters: SelectedFilters<string | number>[] = [
      {
        name: 'Sort By',
        value: 'appDateNewToOld',
      },
    ];

    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
      sortDir: SortingDirection.descending,
    };

    expect(filterHelperService.convertDataToFilters(testSelectedFilters)).toEqual(testFilters);
  });

  it('should convert data to selected filters | CREATION DATE - ASC', () => {
    const testSelectedFilters: SelectedFilters<string | string[] | number>[] = [
      {
        name: 'Sort By',
        value: 'crDateOldToNew',
      },
    ];

    const testFilters: Filters = {
      sortParam: SortingParam.creationDate,
      sortDir: SortingDirection.ascending,
    };

    expect(filterHelperService.convertDataToFilters(testSelectedFilters)).toEqual(testFilters);
  });

  it('should open the modal and save date', async () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
      sortDir: SortingDirection.ascending,
    };

    const selectedFilters: SelectedFilters<any>[] = [
      {
        name: 'Sort By',
        value: 'projectZToA',
      },
      {
        name: 'Sort Direction',
        value: 1,
      },
      {
        name: 'State',
        value: ['APPROVED', 'DRAFT'],
      },
    ];

    const expectedFilters: Filters = {
      state: [AdvancesStates.approved, AdvancesStates.draft],
      sortParam: SortingParam.project,
      sortDir: 1,
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

    modalController.create.and.returnValue(
      new Promise((resolve) => {
        const filterPopoverSpy = jasmine.createSpyObj('filterPopover', ['onWillDismiss', 'present']) as any;
        filterPopoverSpy.onWillDismiss.and.returnValue(
          new Promise((resInt) => {
            resInt({
              data: selectedFilters,
            });
          })
        );
        resolve(filterPopoverSpy);
      })
    );
    const result = await filterHelperService.openFilterModal(testFilters, filterOptions);
    expect(result).toEqual(expectedFilters);
  });
});
