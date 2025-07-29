import { Component, Input, OnInit } from '@angular/core';
import { FilterOptions } from './filter-options.interface';
import { SelectedFilters } from './selected-filters.interface';
import { FilterOptionType } from './filter-option-type.enum';
import { ModalController } from '@ionic/angular';
import { forkJoin, Observable, of } from 'rxjs';

// eslint-disable-next-line custom-rules/prefer-semantic-extension-name
type FilterValue = string | number | boolean | Date;

// eslint-disable-next-line custom-rules/one-interface-per-file, custom-rules/prefer-semantic-extension-name
interface SimplifyReportsSettings {
  enabled: boolean;
}

@Component({
  selector: 'app-fy-filters',
  templateUrl: './fy-filters.component.html',
  styleUrls: ['./fy-filters.component.scss'],
  standalone: false,
})
export class FyFiltersComponent implements OnInit {
  @Input() simplifyReportsSettings$: Observable<SimplifyReportsSettings> = of({ enabled: false });

  @Input() nonReimbursableOrg$: Observable<boolean> = of(false);

  @Input() selectedFilterValues: SelectedFilters<FilterValue>[];

  @Input() activeFilterInitialName: string;

  filterOptions: FilterOptions<FilterValue>[];

  currentFilterValueMap: { [key: string]: FilterValue | FilterValue[] } = {};

  customDateMap: {
    [key: string]: {
      startDate?: Date;
      endDate?: Date;
    };
  } = {};

  activeFilter: FilterOptions<FilterValue>;

  startDate: Date;

  endDate: Date;

  constructor(private modalController: ModalController) {}

  get FilterOptionType(): typeof FilterOptionType {
    return FilterOptionType;
  }

  ngOnInit(): void {
    const activeFilterInitialIndex =
      (this.activeFilterInitialName &&
        this.filterOptions.findIndex((option) => option.name === this.activeFilterInitialName)) ||
      0;
    this.activeFilter = this.filterOptions[activeFilterInitialIndex];
    this.currentFilterValueMap = this.selectedFilterValues.reduce(
      (acc, curr) => {
        acc[curr.name] = curr.value;
        return acc;
      },
      {} as { [key: string]: FilterValue | FilterValue[] },
    );
    this.customDateMap = this.selectedFilterValues
      .filter((selectedFilters) => selectedFilters.name === 'Date' && selectedFilters.value === 'custom')
      .reduce(
        (acc, curr) => {
          acc[curr.name] = {
            startDate: curr.associatedData?.startDate,
            endDate: curr.associatedData?.endDate,
          };
          return acc;
        },
        {} as { [key: string]: { startDate?: Date; endDate?: Date } },
      );
    if (this.activeFilter.name === 'Date') {
      this.startDate = this.customDateMap[this.activeFilter.name]?.startDate;
      this.endDate = this.customDateMap[this.activeFilter.name]?.endDate;
    }

    const stateFilterIndex = this.filterOptions.findIndex((option) => option.name === 'State');
    forkJoin({
      simplifyReportsSettings: this.simplifyReportsSettings$,
      nonReimbursableOrg: this.nonReimbursableOrg$,
    }).subscribe(({ simplifyReportsSettings, nonReimbursableOrg }) => {
      if (simplifyReportsSettings.enabled) {
        this.filterOptions[stateFilterIndex].options = nonReimbursableOrg
          ? this.filterOptions[stateFilterIndex].optionsNewFlowCCCOnly
          : this.filterOptions[stateFilterIndex].optionsNewFlow;
      }
    });
  }

  getNoOfFilters(): number {
    return Object.values(this.currentFilterValueMap).filter(
      (value) => value && (Array.isArray(value) ? value.length : true),
    ).length;
  }

  onFilterClick(filterDefinition: FilterOptions<FilterValue>): void {
    this.activeFilter = filterDefinition;
    if (this.activeFilter.optionType === FilterOptionType.date) {
      const customDate = this.customDateMap[this.activeFilter.name];
      if (customDate) {
        this.startDate = customDate.startDate;
        this.endDate = customDate.endDate;
      }
    }
  }

  cancel(): void {
    this.modalController.dismiss();
  }

  clearAll(): void {
    this.currentFilterValueMap = {};
    this.customDateMap = {};
    this.startDate = null;
    this.endDate = null;
  }

  onDateChange(): void {
    this.customDateMap[this.activeFilter.name] = {
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }

  switchFilter(currentFilter: FilterOptions<FilterValue>, option: { label: string; value: FilterValue }): void {
    const filter = this.currentFilterValueMap[currentFilter.name];

    if (currentFilter.optionType === FilterOptionType.singleselect) {
      this.switchSingleSelectFilter(filter, currentFilter, option);
    }

    if (currentFilter.optionType === FilterOptionType.multiselect) {
      this.switchMultiselectFilter(filter, option, currentFilter);
    }

    if (currentFilter.optionType === FilterOptionType.date) {
      this.switchDateFilter(filter, currentFilter, option);
    }
  }

  save(): void {
    const filters = Object.keys(this.currentFilterValueMap).reduce(
      (acc, key) =>
        acc.concat({
          name: key,
          value: this.currentFilterValueMap[key],
          associatedData: this.customDateMap[key],
        } as SelectedFilters<FilterValue>),
      [] as SelectedFilters<FilterValue>[],
    );
    this.modalController.dismiss(filters);
  }

  switchDateFilter(
    filter: FilterValue | FilterValue[],
    currentFilter: FilterOptions<FilterValue>,
    option: {
      label: string;
      value: FilterValue;
    },
  ): void {
    if (filter && this.currentFilterValueMap[currentFilter.name] === option.value) {
      this.currentFilterValueMap[currentFilter.name] = null;
    } else {
      this.currentFilterValueMap[currentFilter.name] = option.value;
      if (option.value !== 'custom') {
        this.customDateMap[currentFilter.name] = null;
        this.startDate = null;
        this.endDate = null;
      }
    }
  }

  switchMultiselectFilter(
    filter: FilterValue | FilterValue[],
    option: {
      label: string;
      value: FilterValue;
    },
    currentFilter: FilterOptions<FilterValue>,
  ): void {
    if (filter) {
      const filterArray = filter as FilterValue[];
      const doesValueExistInFilter = filterArray.some((value) => value === option.value);
      if (doesValueExistInFilter) {
        this.currentFilterValueMap[currentFilter.name] = filterArray.filter((value) => value !== option.value);
      } else {
        filterArray.push(option.value);
      }
    } else {
      this.currentFilterValueMap[currentFilter.name] = [option.value];
    }
  }

  switchSingleSelectFilter(
    filter: FilterValue | FilterValue[],
    currentFilter: FilterOptions<FilterValue>,
    option: {
      label: string;
      value: FilterValue;
    },
  ): void {
    if (filter && this.currentFilterValueMap[currentFilter.name] === option.value) {
      this.currentFilterValueMap[currentFilter.name] = null;
    } else {
      this.currentFilterValueMap[currentFilter.name] = option.value;
    }
  }
}
