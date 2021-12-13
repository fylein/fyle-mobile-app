import { Injectable } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { AdvancesStates } from '../models/advances-states.model';
import { SortingParam } from '../models/sorting-param.model';
import { SortingDirection } from '../models/sorting-direction.model';
import { SortingValue } from '../models/sorting-value.model';
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
      [SortingValue.creationDateAsc]: 'created at - new to old',
      [SortingValue.creationDateDesc]: 'created at - old to new',
      [SortingValue.approvalDateAsc]: 'approved at - new to old',
      [SortingValue.approvalDateDesc]: 'approved at - old to new',
      [SortingValue.projectAsc]: 'project - A to Z',
      [SortingValue.projectDesc]: 'project - Z to A',
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
      generatedFilters.sortParam = this.getSortParam(sortBy.value);
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

  private getSortParam(sortValue: string) {
    let sortParam: SortingParam;
    if (sortValue.includes('crDate')) {
      sortParam = SortingParam.creationDate;
    } else if (sortValue.includes('appDate')) {
      sortParam = SortingParam.approvalDate;
    } else if (sortValue.includes('project')) {
      sortParam = SortingParam.project;
    }

    return sortParam;
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

    if (sortParam === SortingParam.creationDate) {
      if (sortDir === SortingDirection.ascending) {
        sortString = 'crDateOldToNew';
      } else {
        sortString = 'crDateNewToOld';
      }
    } else if (sortParam === SortingParam.approvalDate) {
      if (sortDir === SortingDirection.ascending) {
        sortString = 'appDateOldToNew';
      } else {
        sortString = 'appDateNewToOld';
      }
    } else if (sortParam === SortingParam.project) {
      if (sortDir === SortingDirection.ascending) {
        sortString = 'projectAToZ';
      } else {
        sortString = 'projectZToA';
      }
    }

    return sortString;
  }
}
