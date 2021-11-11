import { Injectable } from '@angular/core';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { AdvancesStates } from '../models/advances-states.model';

type Filters = Partial<{
  state: AdvancesStates[];
  sortParam: string;
  sortDir: string;
}>;

@Injectable({
  providedIn: 'root',
})
export class FiltersHelperService {
  constructor() {}

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
      const capitalizedStates = filters.state.map(
        (state) =>
          state
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase()) //capitalizing first letter of each word
      );

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
      if (sortBy.value.includes('NewToOld')) {
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value.includes('OldToNew')) {
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value.includes('AToZ')) {
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value.includes('ZToA')) {
        generatedFilters.sortDir = 'desc';
      }
    }
    return generatedFilters;
  }

  generateSelectedFilters(filters: Filters): SelectedFilters<any>[] {
    const generatedFilters: SelectedFilters<any>[] = [];
    if (filters && filters.state) {
      generatedFilters.push({
        name: 'State',
        value: filters.state,
      });
    }
    if (filters && filters.sortParam) {
      generatedFilters.push({
        name: 'Sort By',
        value: filters.sortParam,
      });
    }
    return generatedFilters;
  }
}
