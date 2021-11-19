import { Injectable } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { AdvancesStates } from '../models/advances-states.model';
import { SortingParam } from '../models/sorting-param.model';
import { SortingDirection } from '../models/sorting-direction.model';

type Filters = Partial<{
  state: AdvancesStates[];
  sortParam: SortingParam;
  sortDir: SortingDirection;
}>;

@Injectable({
  providedIn: 'root',
})
export class FiltersHelperService {
  constructor(private titleCasePipe: TitleCasePipe) {}

  generateFilterPills(filters: Filters) {
    const filterPills: FilterPill[] = [];

    let sortString = '';

    const sortParamMap = {
      creationDate: 'crDate',
      approvalDate: 'appDate',
      project: 'project',
    };

    const filterPillsMap = {
      crDateNewToOld: 'creation date - new to old',
      crDateOldToNew: 'creation date - old to new',
      appDateNewToOld: 'approval date - new to old',
      appDateOldToNew: 'approval date - old to new',
      projectAToZ: 'project - A to Z',
      projectZToA: 'project - Z to A',
    };

    sortString = sortParamMap[filters.sortParam];
    if (filters.sortDir === SortingDirection.ascending) {
      if (filters.sortParam === SortingParam.project) {
        sortString += 'AToZ';
      } else {
        sortString += 'OldToNew';
      }
    } else {
      if (filters.sortParam === SortingParam.project) {
        sortString += 'ZToA';
      } else {
        sortString += 'NewToOld';
      }
    }

    if (filters.state && filters.state.length) {
      const capitalizedStates = filters.state.map((state) => this.titleCasePipe.transform(state.replace(/_/g, ' ')));

      filterPills.push({
        label: 'State',
        type: 'state',
        value: capitalizedStates.join(', '),
      });
    }

    if (filters.sortParam) {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: filterPillsMap[sortString],
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
      let sortParam: SortingParam;
      if (sortBy.value.includes('crDate')) {
        sortParam = SortingParam.creationDate;
      } else if (sortBy.value.includes('appDate')) {
        sortParam = SortingParam.approvalDate;
      } else if (sortBy.value.includes('project')) {
        sortParam = SortingParam.project;
      }
      generatedFilters.sortParam = sortParam;
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

    for (const key of Object.keys(filters)) {
      if (filters[key]) {
        generatedFilters.push({
          name: filtersMap[key],
          value: filters[key],
        });
      }
    }

    return generatedFilters;
  }

  private getSortDir(sortValue: string) {
    let sortDir: SortingDirection;

    if (sortValue.includes('NewToOld') || sortValue.includes('ZToA')) {
      sortDir = SortingDirection.descending;
    } else if (sortValue.includes('OldToNew') || sortValue.includes('AToZ')) {
      sortDir = SortingDirection.ascending;
    }
    return sortDir;
  }
}
