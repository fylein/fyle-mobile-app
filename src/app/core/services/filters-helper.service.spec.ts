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
import { TranslocoService } from '@jsverse/transloco';
describe('FiltersHelperService', () => {
  let filterHelperService: FiltersHelperService;
  let modalController: jasmine.SpyObj<ModalController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  const SortDirAsc: number = SortingDirection.ascending;
  const SortDirDesc: number = SortingDirection.descending;

  beforeEach(() => {
    const controllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.filtersHelper.creationDateNewToOld': 'created date - new to old',
        'services.filtersHelper.creationDateOldToNew': 'created date - old to new',
        'services.filtersHelper.approvalDateNewToOld': 'approved date - new to old',
        'services.filtersHelper.approvalDateOldToNew': 'approved date - old to new',
        'services.filtersHelper.projectAToZ': 'project - A to Z',
        'services.filtersHelper.projectZToA': 'project - Z to A',
        'services.filtersHelper.state': 'State',
        'services.filtersHelper.sortBy': 'Sort by',
        'services.filtersHelper.aToZ': ' - A to Z',
        'services.filtersHelper.zToA': ' - Z to A',
        'services.filtersHelper.sortDirection': 'Sort Direction',
      };
      return translations[key] || key;
    });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ModalController,
          useValue: controllerSpy,
        },
        TitleCasePipe,
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });
    filterHelperService = TestBed.inject(FiltersHelperService);
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
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

  it('should generate pill using only Sorting Params - Approved date New To Old', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
    };

    const testPill: FilterPill[] = [{ label: 'Sort by', type: 'sort', value: 'approved date - new to old' }];

    expect(filterHelperService.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params With Project Name - Project A to Z | Ascending', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.project,
      sortDir: SortingDirection.ascending,
    };

    const testPill: FilterPill[] = [{ label: 'Sort by', type: 'sort', value: 'Some Project - A to Z' }];

    expect(filterHelperService.generateFilterPills(testFilters, 'some project')).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params With Project Name - Project Z to A | Descending', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.project,
      sortDir: SortingDirection.descending,
    };

    const testPill: FilterPill[] = [{ label: 'Sort by', type: 'sort', value: 'Some Project - Z to A' }];

    expect(filterHelperService.generateFilterPills(testFilters, 'some project')).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Approved date Old To New', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
      sortDir: SortingDirection.ascending,
    };

    const testPill: FilterPill[] = [{ label: 'Sort by', type: 'sort', value: 'approved date - old to new' }];

    expect(filterHelperService.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Created date New to Old', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.creationDate,
    };

    const testPill: FilterPill[] = [{ label: 'Sort by', type: 'sort', value: 'created date - new to old' }];

    expect(filterHelperService.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate pill using only Sorting Params - Created date Old to New', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.creationDate,
      sortDir: SortingDirection.ascending,
    };

    const testPill: FilterPill[] = [{ label: 'Sort by', type: 'sort', value: 'created date - old to new' }];
    expect(filterHelperService.generateFilterPills(testFilters)).toEqual(testPill);
  });

  it('should generate selected filters using only State - APPROVED,DRAFT', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.approved, AdvancesStates.draft],
    };

    const testSelectedFilter: SelectedFilters<string | AdvancesStates[]>[] = [
      {
        name: 'State',
        value: [AdvancesStates.approved, AdvancesStates.draft],
      },
    ];

    expect(filterHelperService.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
  });

  it('should generate selected filters using only State - PAID,CANCELLED', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.paid, AdvancesStates.cancelled],
    };

    const testSelectedFilter: SelectedFilters<string | AdvancesStates[]>[] = [
      {
        name: 'State',
        value: [AdvancesStates.paid, AdvancesStates.cancelled],
      },
    ];

    expect(filterHelperService.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
  });

  it('should generate selected filters using only State - SENT_BACK,APPROVAL_PENDING', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.sentBack, AdvancesStates.pending],
    };

    const testSelectedFilter: SelectedFilters<string | AdvancesStates[]>[] = [
      {
        name: 'State',
        value: [AdvancesStates.sentBack, AdvancesStates.pending],
      },
    ];

    expect(filterHelperService.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
  });

  it('should generate selected filters using Sort Param - APPROVAL DATE | DESCENDING', () => {
    const testFilters: Filters = {
      sortParam: SortingParam.approvalDate,
      sortDir: SortingDirection.descending,
    };

    const testSelectedFilter: SelectedFilters<string | AdvancesStates[] | SortingDirection>[] = [
      {
        name: 'Sort by',
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

    const testSelectedFilter: SelectedFilters<string | AdvancesStates[]>[] = [
      {
        name: 'Sort by',
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

    const testSelectedFilter: SelectedFilters<string | AdvancesStates[]>[] = [
      {
        name: 'Sort by',
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

    const testSelectedFilter: SelectedFilters<string | SortingDirection | AdvancesStates[]>[] = [
      {
        name: 'Sort by',
        value: 'projectZToA',
      },
      {
        name: 'Sort Direction',
        value: SortDirDesc,
      },
    ];

    expect(filterHelperService.generateSelectedFilters(testFilters)).toEqual(testSelectedFilter);
  });

  it('should convert data to selected filters | Sort by - A to Z, Sort Direction - DESC, State - DRAFT,CANCELLED', () => {
    const testSelectedFilters: SelectedFilters<string | AdvancesStates[] | SortingDirection>[] = [
      {
        name: 'Sort by',
        value: 'projectZToA',
      },
      {
        name: 'Sort Direction',
        value: SortDirDesc,
      },
      {
        name: 'State',
        value: [AdvancesStates.approved, AdvancesStates.draft],
      },
    ];

    const testFilters: Filters = {
      state: [AdvancesStates.approved, AdvancesStates.draft],
      sortParam: SortingParam.project,
      sortDir: SortingDirection.descending,
    };

    expect(filterHelperService.convertDataToFilters(testSelectedFilters)).toEqual(testFilters);
  });

  it('should convert data to selected filters | Sort by - Z to A, Sort Direction - DESC, State - DRAFT,CANCELLED', () => {
    const testSelectedFilters: SelectedFilters<string | AdvancesStates[] | SortingDirection>[] = [
      {
        name: 'Sort by',
        value: 'projectZToA',
      },
      {
        name: 'Sort Direction',
        value: SortDirDesc,
      },
      {
        name: 'State',
        value: [AdvancesStates.approved, AdvancesStates.draft],
      },
    ];
    const testFilters: Filters = {
      state: [AdvancesStates.approved, AdvancesStates.draft],
      sortParam: SortingParam.project,
      sortDir: SortingDirection.descending,
    };

    expect(filterHelperService.convertDataToFilters(testSelectedFilters)).toEqual(testFilters);
  });

  it('should convert data to selected filters | Sort by - A to Z, Sort Direction - ASC', () => {
    const testSelectedFilters: SelectedFilters<string | AdvancesStates[]>[] = [
      {
        name: 'Sort by',
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
    const testSelectedFilters: SelectedFilters<string | AdvancesStates[]>[] = [
      {
        name: 'Sort by',
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
    const testSelectedFilters: SelectedFilters<string | AdvancesStates[] | SortingDirection>[] = [
      {
        name: 'Sort by',
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
        name: 'Sort by',
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
        name: 'Sort by',
        optionType: FilterOptionType.singleselect,
        options: [
          {
            label: 'Created date - New to Old',
            value: SortingValue.creationDateAsc,
          },
          {
            label: 'Created date - Old to New',
            value: SortingValue.creationDateDesc,
          },
          {
            label: 'Approved date - New to Old',
            value: SortingValue.approvalDateAsc,
          },
          {
            label: 'Approved date - Old to New',
            value: SortingValue.approvalDateDesc,
          },
        ],
      },
    ];

    modalController.create.and.returnValue(
      new Promise((resolve) => {
        const filterPopoverSpy = jasmine.createSpyObj('filterPopover', ['onWillDismiss', 'present']);
        filterPopoverSpy.onWillDismiss.and.returnValue(
          new Promise((resInt) => {
            resInt({
              data: selectedFilters,
            });
          }),
        );
        resolve(filterPopoverSpy);
      }),
    );
    const result = await filterHelperService.openFilterModal(testFilters, filterOptions);
    expect(result).toEqual(expectedFilters);
  });
});
