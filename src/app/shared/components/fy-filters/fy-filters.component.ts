import {Component, Input, OnInit} from '@angular/core';
import {FilterOptions} from './filter-options.interface';
import {SelectedFilters} from './selected-filters.interface';
import {FilterOptionType} from './filter-option-type.enum';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-fy-filters',
  templateUrl: './fy-filters.component.html',
  styleUrls: ['./fy-filters.component.scss'],
})
export class FyFiltersComponent implements OnInit {
  @Input() filterOptions: FilterOptions<any>[];
  @Input() selectedFilterValues: SelectedFilters<any>[];
  @Input() activeFilterInitialName;

  currentFilterValueMap: {[key: string]: any| any[]} = {};
  customDateMap: {[key: string]: {
    startDate?: Date,
    endDate?: Date
    }} = {};
  activeFilter;

  startDate: Date;
  endDate: Date;

  get FilterOptionType() {
    return FilterOptionType;
  }

  constructor(
      private modalController: ModalController
  ) { }

  ngOnInit() {
    const activeFilterInitialIndex = (this.activeFilterInitialName && this.filterOptions.findIndex(option => option.name === this.activeFilterInitialName)) || 0;
    this.activeFilter =  this.filterOptions[activeFilterInitialIndex];
    this.currentFilterValueMap = this.selectedFilterValues.reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {});
  }

  onFilterClick(filterDefinition: FilterOptions<any>) {
    this.activeFilter = filterDefinition;
    if (this.activeFilter.optionType === FilterOptionType.date) {
      const customDate =  this.customDateMap[this.activeFilter.name];
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
      endDate: this.endDate
    };
  }

  switchFilter(currentFilter: FilterOptions<any>, option: { label: string; value: any }) {
    const filter = this.currentFilterValueMap[currentFilter.name];

    if (currentFilter.optionType === FilterOptionType.singleselect) {
      if (filter && this.currentFilterValueMap[currentFilter.name] === option.value) {
        this.currentFilterValueMap[currentFilter.name] = null;
      } else {
        this.currentFilterValueMap[currentFilter.name] = option.value;
      }
    }

    if (currentFilter.optionType === FilterOptionType.multiselect) {
      if (filter) {
        const doesValueExistInFilter = filter.some(value => value === option.value);
        if (doesValueExistInFilter) {
          this.currentFilterValueMap[currentFilter.name] = this.currentFilterValueMap[currentFilter.name]
                                                                    .filter(value => value !== option.value);
        } else {
          this.currentFilterValueMap[currentFilter.name].push(option.value);
        }
      } else {
        this.currentFilterValueMap[currentFilter.name] = [option.value];
      }
    }

    if (currentFilter.optionType === FilterOptionType.date) {
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
  }

  save() {
    const filters = Object.keys(this.currentFilterValueMap).reduce((acc, key) => {
      return acc.concat({
        name: key,
        value: this.currentFilterValueMap[key],
        associatedData: this.customDateMap[key]
      } as SelectedFilters<any>);
    }, []);
    this.modalController.dismiss(filters);
  }
}
