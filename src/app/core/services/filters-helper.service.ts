import { Injectable } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { AdvancesStates } from '../models/advances-states.model';
import { SortingParam } from '../models/sorting-param.model';
import { SortingDirection } from '../models/sorting-direction.model';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';

type Filters = Partial<{
  state: AdvancesStates[];
  sortParam: SortingParam;
  sortDir: SortingDirection;
}>;

@Injectable({
  providedIn: 'root',
})
export class FiltersHelperService {
  constructor(private titleCasePipe: TitleCasePipe, private modalController: ModalController) {}

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

    const sortString = this.getSortString(filters.sortParam, filters.sortDir);

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
        if (key === 'sortParam') {
          generatedFilters.push({
            name: filtersMap[key],
            value: this.getSortString(filters[key], filters.sortDir),
          });
        } else {
          generatedFilters.push({
            name: filtersMap[key],
            value: filters[key],
          });
        }
      }
    }
    return generatedFilters;
  }

  async openFilterModal(filters: Filters, filterOptions: FilterOptions<string>[], activeFilterInitialName?: string) {
    const filterPopover = await this.modalController.create({
      component: FyFiltersComponent,
      componentProps: {
        filterOptions,
        selectedFilterValues: this.generateSelectedFilters(filters),
        activeFilterInitialName,
      },
      cssClass: 'dialog-popover',
    });

    await filterPopover.present();

    const { data } = await filterPopover.onWillDismiss();
    if (data) {
      const filters = this.convertDataToFilters(data);
      return filters;
    }
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

  private getSortString(sortParam: SortingParam, sortDir: SortingDirection) {
    //constructs a string that incorporates both sort param and direction which is the format understood
    //by the filter modal component
    let sortString = '';
    const sortParamMap = {
      creationDate: 'crDate',
      approvalDate: 'appDate',
      project: 'project',
    };

    sortString = sortParamMap[sortParam];
    if (sortDir === SortingDirection.ascending) {
      if (sortParam === SortingParam.project) {
        sortString += 'AToZ';
      } else {
        sortString += 'OldToNew';
      }
    } else {
      if (sortParam === SortingParam.project) {
        sortString += 'ZToA';
      } else {
        sortString += 'NewToOld';
      }
    }

    return sortString;
  }
}
