import { Component, Input, OnInit } from '@angular/core';
import { FilterOptions } from './filter-options.interface';
import { SelectedFilters } from './selected-filters.interface';
import { FilterOptionType } from './filter-option-type.enum';
import { ModalController } from '@ionic/angular';
import { forkJoin, Observable, of } from 'rxjs';

@Component({
  selector: 'app-fy-filters',
  templateUrl: './fy-filters.component.html',
  styleUrls: ['./fy-filters.component.scss'],
})
export class FyFiltersComponent implements OnInit {
  @Input() simplifyReportsSettings$: Observable<any> = of({ enabled: false });

  @Input() nonReimbursableOrg$: Observable<boolean> = of(false);

  @Input() selectedFilterValues: SelectedFilters<any>[];

  @Input() activeFilterInitialName;

  filterOptions: FilterOptions<any>[];

  currentFilterValueMap: { [key: string]: any | any[] } = {};

  customDateMap: {
    [key: string]: {
      startDate?: Date;
      endDate?: Date;
    };
  } = {};

  activeFilter;

  startDate: Date;

  endDate: Date;

  constructor(private modalController: ModalController) {}

  get FilterOptionType() {
    return FilterOptionType;
  }

  ngOnInit() {
    const activeFilterInitialIndex =
      (this.activeFilterInitialName &&
        this.filterOptions.findIndex((option) => option.name === this.activeFilterInitialName)) ||
      0;
    this.activeFilter = this.filterOptions[activeFilterInitialIndex];
    this.currentFilterValueMap = this.selectedFilterValues.reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {});
    this.customDateMap = this.selectedFilterValues
      .filter((selectedFilters) => selectedFilters.name === 'Date' && selectedFilters.value === 'custom')
      .reduce((acc, curr) => {
        acc[curr.name] = {
          startDate: curr.associatedData?.startDate,
          endDate: curr.associatedData?.endDate,
        };
        return acc;
      }, {});
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

  getNoOfFilters() {
    return Object.values(this.currentFilterValueMap).filter((value) => value && value.length).length;
  }

  onFilterClick(filterDefinition: FilterOptions<any>) {
    this.activeFilter = filterDefinition;
    if (this.activeFilter.optionType === FilterOptionType.date) {
      const customDate = this.customDateMap[this.activeFilter.name];
      if (customDate) {
        this.startDate = customDate.startDate;
        this.endDate = customDate.endDate;
      }
    }
  }

  cancel() {
    this.modalController.dismiss();
  }

  clearAll() {
    this.currentFilterValueMap = {};
    this.customDateMap = {};
    this.startDate = null;
    this.endDate = null;
  }

  onDateChange() {
    this.customDateMap[this.activeFilter.name] = {
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }

  switchFilter(currentFilter: FilterOptions<any>, option: { label: string; value: any }) {
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

  save() {
    const filters = Object.keys(this.currentFilterValueMap).reduce(
      (acc, key) =>
        acc.concat({
          name: key,
          value: this.currentFilterValueMap[key],
          associatedData: this.customDateMap[key],
        } as SelectedFilters<any>),
      []
    );
    this.modalController.dismiss(filters);
  }

  switchDateFilter(
    filter: any,
    currentFilter: FilterOptions<any>,
    option: {
      label: string;
      value: any;
    }
  ) {
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
    filter: any,
    option: {
      label: string;
      value: any;
    },
    currentFilter: FilterOptions<any>
  ) {
    if (filter) {
      const doesValueExistInFilter = filter.some((value) => value === option.value);
      if (doesValueExistInFilter) {
        this.currentFilterValueMap[currentFilter.name] = this.currentFilterValueMap[currentFilter.name].filter(
          (value) => value !== option.value
        );
      } else {
        this.currentFilterValueMap[currentFilter.name].push(option.value);
      }
    } else {
      this.currentFilterValueMap[currentFilter.name] = [option.value];
    }
  }

  switchSingleSelectFilter(
    filter: any,
    currentFilter: FilterOptions<any>,
    option: {
      label: string;
      value: any;
    }
  ) {
    if (filter && this.currentFilterValueMap[currentFilter.name] === option.value) {
      this.currentFilterValueMap[currentFilter.name] = null;
    } else {
      this.currentFilterValueMap[currentFilter.name] = option.value;
    }
  }
}
