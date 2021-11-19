import { Injectable } from '@angular/core';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { AdvancesStates } from '../models/advances-states.model';
import { TitleCasePipe } from '@angular/common';

type Filters = Partial<{
  state: AdvancesStates[];
  sortParam: string;
  sortDir: string;
}>;

@Injectable({
  providedIn: 'root',
})
export class FiltersHelperService {
  constructor(private titleCasePipe: TitleCasePipe) {}

  generateFilterPills(filters: Filters) {
    const filterPills: FilterPill[] = [];
    const filterPillsMap = {
      crDateNewToOld: 'creation date - new to old',
      crDateOldToNew: 'creation date - old to new',
      appDateNewToOld: 'approval date - new to old',
      appDateOldToNew: 'approval date - old to new',
      projectAToZ: 'project - A to Z',
      projectZToA: 'project - Z to A',
    };

    //for state filters
    if (filters.state && filters.state.length) {
      const capitalizedStates = filters.state.map((state) => this.titleCasePipe.transform(state.replace(/_/g, ' ')));

      filterPills.push({
        label: 'State',
        type: 'state',
        value: capitalizedStates.join(', '),
      });
    }

    //for sorting filters
    if (filters.sortParam) {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: filterPillsMap[filters.sortParam],
      });
    }

    return filterPills;
  }

  convertDataToFilters(selectedFilters: SelectedFilters<any>[]): Filters {
    const generatedFilters: Filters = {};

    const stateFilter = selectedFilters.find((filter) => filter.name === 'State');
    const sortBy = selectedFilters.find((filter) => filter.name === 'Sort By');

    if (stateFilter) {
      generatedFilters.state = stateFilter.value;
    }

    if (sortBy && sortBy.value) {
      generatedFilters.sortParam = sortBy.value;
      generatedFilters.sortDir = this.getSortDir(sortBy.value);
    }
    return generatedFilters;
  }

  generateSelectedFilters(filters: Filters): SelectedFilters<any>[] {
    const generatedFilters: SelectedFilters<any>[] = [];
    const filtersMap = {
      state: 'State',
      sortParam: 'Sort By',
      sortDir: 'Sort Direction',
    };

    for (const key in filters) {
      if (filters[key]) {
        generatedFilters.push({
          name: filtersMap[key],
          value: filters[key],
        });
      }
    }

    return generatedFilters;
  }

  private getSortDir(sortParam: string) {
    let sortDir: string;

    if (sortParam.includes('NewToOld')) {
      sortDir = 'desc';
    } else if (sortParam.includes('OldToNew')) {
      sortDir = 'asc';
    } else if (sortParam.includes('AToZ')) {
      sortDir = 'asc';
    } else if (sortParam.includes('ZToA')) {
      sortDir = 'desc';
    }

    return sortDir;
  }
}
