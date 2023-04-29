import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { FyFiltersComponent } from './fy-filters.component';
import { of } from 'rxjs';
import { selectedFilters1 } from 'src/app/core/mock-data/selected-filters.data';
import { FilterOptionType } from './filter-option-type.enum';
import { FilterOptions } from './filter-options.interface';
import { filterOptions1 } from 'src/app/core/mock-data/filter.data';

describe('FyFiltersComponent', () => {
  let component: FyFiltersComponent;
  let fixture: ComponentFixture<FyFiltersComponent>;
  let modalController: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    TestBed.configureTestingModule({
      declarations: [FyFiltersComponent],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
      ],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FyFiltersComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  }));

  it('should create', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set active Filter correctly', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    expect(component.activeFilter).toEqual({
      name: 'Expense Type',
      optionType: FilterOptionType.multiselect,
      options: [
        {
          label: 'Mileage',
          value: 'MILEAGE',
        },
        {
          label: 'Per Diem',
          value: 'PER_DIEM',
        },
        {
          label: 'Regular Expenses',
          value: 'REGULAR_EXPENSES',
        },
      ],
    });
  });

  it('should set current filter value map', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    expect(component.currentFilterValueMap).toEqual({
      'Created On': 'custom',
      'Updated On': 'custom',
      'Transactions Type': 'Debit',
    });
  });

  it('should set custom date filter map correctly', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    component.selectedFilterValues = [
      {
        name: 'Date',
        value: 'custom',
        associatedData: {
          startDate: new Date('2023-04-01'),
          endDate: new Date('2023-04-30'),
        },
      },
      {
        name: 'Date',
        value: 'last-7-days',
        associatedData: null,
      },
    ];
    fixture.detectChanges();
    component.ngOnInit();

    expect(component.customDateMap).toEqual({
      Date: {
        startDate: new Date('2023-04-01'),
        endDate: new Date('2023-04-30'),
      },
    });
  });

  it('should set not custom date filter map correctly', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    component.selectedFilterValues = [
      {
        name: 'Date',
        value: 'custom',
      },
      {
        name: 'Date',
        value: 'last-7-days',
        associatedData: null,
      },
    ];
    fixture.detectChanges();
    component.ngOnInit();

    expect(component.customDateMap).toEqual({
      Date: {
        startDate: undefined,
        endDate: undefined,
      },
    });
  });

  it('should set start Date and end Date if active Filter is date', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Date';
    component.filterOptions = [
      {
        name: 'Date',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Complete',
            value: 'UNREPORTED',
          },
          {
            label: 'Draft',
            value: 'DRAFT',
          },
          {
            label: 'Duplicate',
            value: 'DUPLICATE',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Reports',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Sent Back',
            value: 'SENT_BACK',
          },
          {
            label: 'Unsubmitted',
            value: 'DRAFT',
          },
          {
            label: 'Unapproved',
            value: 'TEAM',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Advances',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Sent Back',
            value: 'SENT_BACK',
          },
        ],
      } as FilterOptions<string>,
    ];
    component.selectedFilterValues = [
      {
        name: 'Date',
        value: 'custom',
        associatedData: {
          startDate: new Date('2023-04-01'),
          endDate: new Date('2023-04-30'),
        },
      },
      {
        name: 'Date',
        value: 'last-7-days',
        associatedData: null,
      },
    ];

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.startDate).toEqual(new Date('2023-04-01'));
    expect(component.endDate).toEqual(new Date('2023-04-30'));
  });

  it('should set start Date and end Date to undefined if active Filter is date but startDate and endDate is not present', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Date';
    component.filterOptions = [
      {
        name: 'Date',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Complete',
            value: 'UNREPORTED',
          },
          {
            label: 'Draft',
            value: 'DRAFT',
          },
          {
            label: 'Duplicate',
            value: 'DUPLICATE',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Reports',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Sent Back',
            value: 'SENT_BACK',
          },
          {
            label: 'Unsubmitted',
            value: 'DRAFT',
          },
          {
            label: 'Unapproved',
            value: 'TEAM',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Advances',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Sent Back',
            value: 'SENT_BACK',
          },
        ],
      } as FilterOptions<string>,
    ];
    component.selectedFilterValues = [];

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.startDate).toEqual(undefined);
    expect(component.endDate).toEqual(undefined);
  });

  it('should set filterOptions option', () => {
    component.selectedFilterValues = selectedFilters1;
    component.activeFilterInitialName = 'State';
    component.filterOptions = [
      {
        name: 'State',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Complete',
            value: 'UNREPORTED',
          },
          {
            label: 'Draft',
            value: 'DRAFT',
          },
          {
            label: 'Duplicate',
            value: 'DUPLICATE',
          },
        ],
        optionsNewFlowCCCOnly: [
          {
            label: 'Complete2',
            value: 'UNREPORTED2',
          },
          {
            label: 'Draft2',
            value: 'DRAFT2',
          },
          {
            label: 'Duplicate2',
            value: 'DUPLICATE2',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Reports',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Sent Back',
            value: 'SENT_BACK',
          },
          {
            label: 'Unsubmitted',
            value: 'DRAFT',
          },
          {
            label: 'Unapproved',
            value: 'TEAM',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Advances',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Sent Back',
            value: 'SENT_BACK',
          },
        ],
      } as FilterOptions<string>,
    ];
    component.simplifyReportsSettings$ = of({ enabled: true });
    component.nonReimbursableOrg$ = of(true);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.filterOptions[0].options).toEqual([
      {
        label: 'Complete2',
        value: 'UNREPORTED2',
      },
      {
        label: 'Draft2',
        value: 'DRAFT2',
      },
      {
        label: 'Duplicate2',
        value: 'DUPLICATE2',
      },
    ]);
  });

  it('should set filterOptions options to optionsNewFlow', () => {
    component.selectedFilterValues = selectedFilters1;
    component.activeFilterInitialName = 'State';
    component.filterOptions = [
      {
        name: 'State',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Complete',
            value: 'UNREPORTED',
          },
          {
            label: 'Draft',
            value: 'DRAFT',
          },
          {
            label: 'Duplicate',
            value: 'DUPLICATE',
          },
        ],
        optionsNewFlow: [
          {
            label: 'Complete2',
            value: 'UNREPORTED2',
          },
          {
            label: 'Draft2',
            value: 'DRAFT2',
          },
          {
            label: 'Duplicate2',
            value: 'DUPLICATE2',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Reports',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Sent Back',
            value: 'SENT_BACK',
          },
          {
            label: 'Unsubmitted',
            value: 'DRAFT',
          },
          {
            label: 'Unapproved',
            value: 'TEAM',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Advances',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Sent Back',
            value: 'SENT_BACK',
          },
        ],
      } as FilterOptions<string>,
    ];
    component.simplifyReportsSettings$ = of({ enabled: true });
    component.nonReimbursableOrg$ = of(false);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.filterOptions[0].options).toEqual([
      {
        label: 'Complete2',
        value: 'UNREPORTED2',
      },
      {
        label: 'Draft2',
        value: 'DRAFT2',
      },
      {
        label: 'Duplicate2',
        value: 'DUPLICATE2',
      },
    ]);
  });

  it('getNumbeOfFilter(): should return the length of currentFilterValueMap', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    expect(component.getNoOfFilters()).toBe(3);
  });

  it('onFilterClick(): should set activeFilter and startDate and endDate', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    const filterDefinition = {
      name: 'Date',
      optionType: FilterOptionType.date,
      options: [
        {
          label: 'Sent Back',
          value: 'SENT_BACK',
        },
      ],
    };
    component.selectedFilterValues = [
      {
        name: 'Date',
        value: 'custom',
        associatedData: {
          startDate: new Date('2023-04-01'),
          endDate: new Date('2023-04-30'),
        },
      },
      {
        name: 'Date',
        value: 'last-7-days',
        associatedData: null,
      },
    ];
    component.customDateMap = {
      Date: {
        startDate: new Date('2023-04-01'),
        endDate: new Date('2023-04-30'),
      },
    };
    fixture.detectChanges();
    component.onFilterClick(filterDefinition);
    expect(component.activeFilter).toEqual(filterDefinition);
    expect(component.startDate).toEqual(new Date('2023-04-01'));
    expect(component.endDate).toEqual(new Date('2023-04-30'));
  });

  it('cancel(): should dismiss the modal', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    component.cancel();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('clearAll(): should clear currentFilterValueMap,customDateMap,startDate and endDate', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    component.clearAll();
    expect(component.currentFilterValueMap).toEqual({});
    expect(component.customDateMap).toEqual({});
    expect(component.startDate).toBeNull();
    expect(component.endDate).toBeNull();
  });
  it('onDateChange(): should update startDate and endDate', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    component.startDate = new Date('2023-04-22');
    component.endDate = new Date('2023-04-25');
    fixture.detectChanges();
    component.onDateChange();
    expect(component.customDateMap['Expense Type']).toEqual({
      startDate: new Date('2023-04-22'),
      endDate: new Date('2023-04-25'),
    });
  });

  it('switchFilter(): should call switchDateFilter if optionType is date', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    const filterDefinition = {
      name: 'Created On',
      optionType: FilterOptionType.date,
      options: [
        {
          label: 'Sent Back',
          value: 'SENT_BACK',
        },
      ],
    };
    const option = {
      label: 'example',
      value: 10,
    };
    spyOn(component, 'switchDateFilter');
    component.switchFilter(filterDefinition, option);
    expect(component.switchDateFilter).toHaveBeenCalledOnceWith('custom', filterDefinition, option);
  });

  it('switchFilter(): should call switchMultiselectFilter if optionType is multiselect', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    const filterDefinition = {
      name: 'Created On',
      optionType: FilterOptionType.multiselect,
      options: [
        {
          label: 'Sent Back',
          value: 'SENT_BACK',
        },
      ],
    };
    const option = {
      label: 'example',
      value: 10,
    };
    spyOn(component, 'switchMultiselectFilter');
    component.switchFilter(filterDefinition, option);
    expect(component.switchMultiselectFilter).toHaveBeenCalledOnceWith('custom', option, filterDefinition);
  });

  it('switchFilter(): should call switchSingleSelectFilter if optionType is single select', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    const filterDefinition = {
      name: 'Created On',
      optionType: FilterOptionType.singleselect,
      options: [
        {
          label: 'Sent Back',
          value: 'SENT_BACK',
        },
      ],
    };
    const option = {
      label: 'example',
      value: 10,
    };
    spyOn(component, 'switchSingleSelectFilter');
    component.switchFilter(filterDefinition, option);
    expect(component.switchSingleSelectFilter).toHaveBeenCalledOnceWith('custom', filterDefinition, option);
  });

  it('save(): should dismiss the modal', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    component.currentFilterValueMap = {
      filter1: 'value1',
      filter2: 'value2',
    };
    component.customDateMap = {
      filter1: new Date('2023-03-22'),
      filter2: new Date('2023-03-20'),
    } as any;

    const expectedFilters = [
      {
        name: 'filter1',
        value: 'value1',
        associatedData: new Date('2023-03-22'),
      },
      {
        name: 'filter2',
        value: 'value2',
        associatedData: new Date('2023-03-20'),
      },
    ];
    component.save();

    expect(modalController.dismiss).toHaveBeenCalledWith(expectedFilters);
  });

  it('switchDateFilter(): should remove filter if exist', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    const filter = 'filter1';
    const filterOptions = {
      name: 'filter1',
      optionType: FilterOptionType.multiselect,
      options: [
        {
          label: 'Complete',
          value: 'UNREPORTED',
        },
        {
          label: 'Draft',
          value: 'DRAFT',
        },
        {
          label: 'Duplicate',
          value: 'DUPLICATE',
        },
      ],
    };
    const options = {
      label: 'label1',
      value: 'value1',
    };
    component.currentFilterValueMap = {
      filter1: 'value1',
      filter2: 'value2',
    };

    component.switchDateFilter(filter, filterOptions, options);

    expect(component.currentFilterValueMap.filter1).toBeNull();
  });

  it("switchDateFilter(): should add filter if filter does't exist", () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    const filter = '';
    const filterOptions = {
      name: 'filter1',
      optionType: FilterOptionType.multiselect,
      options: [
        {
          label: 'Complete',
          value: 'UNREPORTED',
        },
        {
          label: 'Draft',
          value: 'DRAFT',
        },
        {
          label: 'Duplicate',
          value: 'DUPLICATE',
        },
      ],
    };
    const options = {
      label: 'label1',
      value: 'value1',
    };
    component.currentFilterValueMap = {
      filter1: 'value1',
      filter2: 'value2',
    };

    component.switchDateFilter(filter, filterOptions, options);

    expect(component.currentFilterValueMap.filter1).toEqual('value1');
    expect(component.customDateMap.filter1).toBeNull();
    expect(component.startDate).toBeNull();
    expect(component.endDate).toBeNull();
  });

  it('switchMultiSelectFilter(): should remove filter if exist', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    const filter = ['filter1', 'filter2'];
    const filterOptions = {
      name: 'filter1',
      optionType: FilterOptionType.multiselect,
      options: [
        {
          label: 'Complete',
          value: 'UNREPORTED',
        },
        {
          label: 'Draft',
          value: 'DRAFT',
        },
        {
          label: 'Duplicate',
          value: 'DUPLICATE',
        },
      ],
    };
    const options = {
      label: 'label1',
      value: 'filter1',
    };
    component.currentFilterValueMap = {
      filter1: ['filter1', 'filter2'],
      filter2: ['filter1', 'filter2'],
    };

    component.switchMultiselectFilter(filter, options, filterOptions);

    expect(component.currentFilterValueMap.filter1).toEqual(['filter2']);
  });

  it("switchMultiSelectFilter(): should add filter if doesn't exist", () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    const filter = ['filter1', 'filter2'];
    const filterOptions = {
      name: 'filter1',
      optionType: FilterOptionType.multiselect,
      options: [
        {
          label: 'Complete',
          value: 'UNREPORTED',
        },
        {
          label: 'Draft',
          value: 'DRAFT',
        },
        {
          label: 'Duplicate',
          value: 'DUPLICATE',
        },
      ],
    };
    const options = {
      label: 'label1',
      value: 'filter3',
    };
    component.currentFilterValueMap = {
      filter1: ['filter1', 'filter2'],
      filter2: ['filter1', 'filter2'],
    };

    component.switchMultiselectFilter(filter, options, filterOptions);

    expect(component.currentFilterValueMap.filter1).toEqual(['filter1', 'filter2', 'filter3']);
  });

  it("switchMultiSelectFilter(): should add currentFilterValueMap if filter doesn't exist", () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    const filter = '';
    const filterOptions = {
      name: 'filter1',
      optionType: FilterOptionType.multiselect,
      options: [
        {
          label: 'Complete',
          value: 'UNREPORTED',
        },
        {
          label: 'Draft',
          value: 'DRAFT',
        },
        {
          label: 'Duplicate',
          value: 'DUPLICATE',
        },
      ],
    };
    const options = {
      label: 'label1',
      value: 'filter1',
    };
    component.currentFilterValueMap = {
      filter1: ['filter1', 'filter2'],
      filter2: ['filter1', 'filter2'],
    };

    component.switchMultiselectFilter(filter, options, filterOptions);

    expect(component.currentFilterValueMap.filter1).toEqual(['filter1']);
  });

  it('switchSingleSelectFilter(): should update currentFilterValueMap if filter exist', () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    const filter = 'filter1';
    const filterOptions = {
      name: 'filter1',
      optionType: FilterOptionType.multiselect,
      options: [
        {
          label: 'Complete',
          value: 'UNREPORTED',
        },
        {
          label: 'Draft',
          value: 'DRAFT',
        },
        {
          label: 'Duplicate',
          value: 'DUPLICATE',
        },
      ],
    };
    const options = {
      label: 'label1',
      value: 'filter1',
    };
    component.currentFilterValueMap = {
      filter1: 'filter1',
      filter2: 'filter2',
    };

    component.switchSingleSelectFilter(filter, filterOptions, options);

    expect(component.currentFilterValueMap.filter1).toBeNull();
  });

  it("switchSingleSelectFilter(): should update currentFilterValueMap if filter doesn't exist", () => {
    component.simplifyReportsSettings$ = of({ enabled: false });
    component.selectedFilterValues = selectedFilters1;
    component.nonReimbursableOrg$ = of(false);
    component.activeFilterInitialName = 'Expense Type';
    component.filterOptions = filterOptions1;
    fixture.detectChanges();
    const filter = '';
    const filterOptions = {
      name: 'filter1',
      optionType: FilterOptionType.multiselect,
      options: [
        {
          label: 'Complete',
          value: 'UNREPORTED',
        },
        {
          label: 'Draft',
          value: 'DRAFT',
        },
        {
          label: 'Duplicate',
          value: 'DUPLICATE',
        },
      ],
    };
    const options = {
      label: 'label1',
      value: 'filter1',
    };
    component.currentFilterValueMap = {
      filter2: 'filter2',
    };

    component.switchSingleSelectFilter(filter, filterOptions, options);

    expect(component.currentFilterValueMap.filter1).toEqual('filter1');
  });
});
