import { Injectable, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { SortingParam } from '../models/sorting-param.model';
import { SortingDirection } from '../models/sorting-direction.model';
import { SortingValue } from '../models/sorting-value.model';
import { Filters } from '../models/filters.model';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { AdvancesStates } from '../models/advances-states.model';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class FiltersHelperService {
  private titleCasePipe = inject(TitleCasePipe);

  private modalController = inject(ModalController);

  private translocoService = inject(TranslocoService);

  generateFilterPills(filters: Filters, projectFieldName?: string): FilterPill[] {
    const filterPills: FilterPill[] = [];

    const filterPillsMap: Record<SortingValue, string> = {
      [SortingValue.creationDateAsc]: this.translocoService.translate('services.filtersHelper.creationDateNewToOld'),
      [SortingValue.creationDateDesc]: this.translocoService.translate('services.filtersHelper.creationDateOldToNew'),
      [SortingValue.approvalDateAsc]: this.translocoService.translate('services.filtersHelper.approvalDateNewToOld'),
      [SortingValue.approvalDateDesc]: this.translocoService.translate('services.filtersHelper.approvalDateOldToNew'),
      [SortingValue.projectAsc]: this.translocoService.translate('services.filtersHelper.projectAToZ'),
      [SortingValue.projectDesc]: this.translocoService.translate('services.filtersHelper.projectZToA'),
    };

    if (projectFieldName) {
      filterPillsMap[SortingValue.projectAsc] = `${this.titleCasePipe.transform(
        projectFieldName,
      )}${this.translocoService.translate('services.filtersHelper.aToZ')}`;
      filterPillsMap[SortingValue.projectDesc] = `${this.titleCasePipe.transform(
        projectFieldName,
      )}${this.translocoService.translate('services.filtersHelper.zToA')}`;
    }

    const sortString = this.getSortString(filters.sortParam, filters.sortDir);

    if (filters.state && filters.state.length) {
      const capitalizedStates = filters.state.map((state) => this.titleCasePipe.transform(state.replace(/_/g, ' ')));

      filterPills.push({
        label: this.translocoService.translate('services.filtersHelper.state'),
        type: 'state',
        value: capitalizedStates.join(', '),
      });
    }

    if (filters.sortParam) {
      filterPills.push({
        label: this.translocoService.translate('services.filtersHelper.sortBy'),
        type: 'sort',
        value: filterPillsMap[sortString as SortingValue],
      });
    }

    return filterPills;
  }

  convertDataToFilters(selectedFilters: SelectedFilters<string | AdvancesStates[] | SortingDirection>[]): Filters {
    const generatedFilters: Filters = {};

    const stateFilter = selectedFilters.find(
      (filter): filter is SelectedFilters<AdvancesStates[]> =>
        filter.name === this.translocoService.translate('services.filtersHelper.state'),
    );
    const sortBy = selectedFilters.find<SelectedFilters<string>>(
      (filter): filter is SelectedFilters<string> =>
        filter.name === this.translocoService.translate('services.filtersHelper.sortBy'),
    );

    if (stateFilter) {
      generatedFilters.state = stateFilter.value;
    }

    if (sortBy && sortBy.value) {
      generatedFilters.sortParam = this.getSortParam(sortBy.value);
      generatedFilters.sortDir = this.getSortDir(sortBy.value);
    }
    return generatedFilters;
  }

  generateSelectedFilters(filters: Filters): SelectedFilters<string | AdvancesStates[] | SortingDirection>[] {
    const generatedFilters: SelectedFilters<string | AdvancesStates[]>[] = [];
    const filtersMap: Record<string, string> = {
      state: this.translocoService.translate('services.filtersHelper.state'),
      sortParam: this.translocoService.translate('services.filtersHelper.sortBy'),
      sortDir: this.translocoService.translate('services.filtersHelper.sortDirection'),
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
            value: filters[key] as AdvancesStates,
          });
        }
      }
    }
    return generatedFilters;
  }

  async openFilterModal(
    filters: Filters,
    filterOptions: FilterOptions<string>[],
    activeFilterInitialName?: string,
  ): Promise<Filters> {
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

    const { data } = (await filterPopover.onWillDismiss()) as { data: SelectedFilters<string | AdvancesStates[]>[] };
    if (data) {
      const filters = this.convertDataToFilters(data);
      return filters;
    }
  }

  private getSortParam(sortValue: string): SortingParam {
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

  private getSortDir(sortValue: string): SortingDirection {
    let sortDir: SortingDirection;

    if (sortValue.includes('NewToOld') || sortValue.includes('ZToA')) {
      sortDir = SortingDirection.descending;
    } else if (sortValue.includes('OldToNew') || sortValue.includes('AToZ')) {
      sortDir = SortingDirection.ascending;
    }
    return sortDir;
  }

  private getSortString(sortParam: SortingParam, sortDir: SortingDirection): string {
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
