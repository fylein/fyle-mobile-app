import { Injectable, inject } from '@angular/core';
import dayjs from 'dayjs';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { ExpenseType } from 'src/app/core/enums/expense-type.enum';
import { ExpenseFilters } from 'src/app/core/models/platform/expense-filters.model';
import { TranslocoService } from '@jsverse/transloco';
import { PlatformOrgSettingsService } from 'src/app/core/services/platform/v1/spender/org-settings.service';
import { OrgSettings } from 'src/app/core/models/org-settings.model';

@Injectable({
  providedIn: 'root',
})
export class MyExpensesService {
  private translocoService = inject(TranslocoService);

  private orgSettingsService = inject(PlatformOrgSettingsService);

  maskNumber = new MaskNumber();

  generateSortFilterPills(filter: Partial<ExpenseFilters>, filterPills: FilterPill[]): void {
    this.generateSortTxnDatePills(filter, filterPills);

    this.generateSortAmountPills(filter, filterPills);

    this.generateSortCategoryPills(filter, filterPills);
  }

  convertSelectedOptionsToExpenseFilters(
    selectedFilters: SelectedFilters<string | string[]>[],
  ): Partial<ExpenseFilters> {
    const generatedFilters: Partial<ExpenseFilters> = {};

    const typeFilter = selectedFilters.find((filter) => filter.name === 'Type');
    if (typeFilter) {
      generatedFilters.state = typeFilter.value;
    }

    const dateFilter = selectedFilters.find((filter) => filter.name === 'Date');
    if (dateFilter) {
      generatedFilters.date = <string>dateFilter.value;
      generatedFilters.customDateStart = dateFilter.associatedData?.startDate;
      generatedFilters.customDateEnd = dateFilter.associatedData?.endDate;
    }

    const receiptAttachedFilter = selectedFilters.find((filter) => filter.name === 'Receipts attached');

    if (receiptAttachedFilter) {
      generatedFilters.receiptsAttached = <string>receiptAttachedFilter.value;
    }

    const potentialDuplicatesFilter = selectedFilters.find((filter) => filter.name === 'Potential duplicates');

    if (potentialDuplicatesFilter) {
      generatedFilters.potentialDuplicates = <string>potentialDuplicatesFilter.value;
    }

    const expenseTypeFilter = selectedFilters.find((filter) => filter.name === 'Expense type');

    if (expenseTypeFilter) {
      generatedFilters.type = <string[]>expenseTypeFilter.value;
    }

    const cardsFilter = selectedFilters.find((filter) => filter.name === 'Cards ending in...');

    if (cardsFilter) {
      generatedFilters.cardNumbers = <string[]>cardsFilter.value;
    }

    const sortBy = selectedFilters.find((filter) => filter.name === 'Sort by');

    this.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

    const splitExpenseFilter = selectedFilters.find((filter) => filter.name === 'Split expense');

    if (splitExpenseFilter) {
      generatedFilters.splitExpense = <string>splitExpenseFilter.value;
    }

    return generatedFilters;
  }

  generateSortAmountPills(filter: Partial<ExpenseFilters>, filterPills: FilterPill[]): void {
    if (filter.sortParam === 'amount' && filter.sortDir === 'desc') {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.sortBy'),
        type: 'sort',
        value: this.translocoService.translate('services.myExpenses.amountHighToLowPill'),
      });
    } else if (filter.sortParam === 'amount' && filter.sortDir === 'asc') {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.sortBy'),
        type: 'sort',
        value: this.translocoService.translate('services.myExpenses.amountLowToHighPill'),
      });
    }
  }

  generateSortTxnDatePills(filter: Partial<ExpenseFilters>, filterPills: FilterPill[]): void {
    if (filter.sortParam === 'spent_at' && filter.sortDir === 'asc') {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.sortBy'),
        type: 'sort',
        value: this.translocoService.translate('services.myExpenses.dateOldToNewPill'),
      });
    } else if (filter.sortParam === 'spent_at' && filter.sortDir === 'desc') {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.sortBy'),
        type: 'sort',
        value: this.translocoService.translate('services.myExpenses.dateNewToOldPill'),
      });
    }
  }

  generateTypeFilterPills(filter: Partial<ExpenseFilters>, filterPills: FilterPill[]): void {
    const combinedValue = filter.type
      .map((type) => {
        if (type === 'EXPENSE') {
          return this.translocoService.translate('services.myExpenses.regularExpenses');
        } else if (type === 'PER_DIEM') {
          return this.translocoService.translate('services.myExpenses.perDiem');
        } else if (type === 'MILEAGE') {
          return this.translocoService.translate('services.myExpenses.mileage');
        } else {
          return type;
        }
      })
      .reduce((type1, type2) => `${type1}, ${type2}`);

    filterPills.push({
      label: this.translocoService.translate('services.myExpenses.expenseType'),
      type: 'type',
      value: combinedValue,
    });
  }

  generateDateFilterPills(filter: Partial<ExpenseFilters>, filterPills: FilterPill[]): FilterPill[] {
    if (filter.date === DateFilters.thisWeek) {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.date'),
        type: 'date',
        value: this.translocoService.translate('services.myExpenses.thisWeekPill'),
      });
    }

    if (filter.date === DateFilters.thisMonth) {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.date'),
        type: 'date',
        value: this.translocoService.translate('services.myExpenses.thisMonthPill'),
      });
    }

    if (filter.date === DateFilters.all) {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.date'),
        type: 'date',
        value: this.translocoService.translate('services.myExpenses.all'),
      });
    }

    if (filter.date === DateFilters.lastMonth) {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.date'),
        type: 'date',
        value: this.translocoService.translate('services.myExpenses.lastMonthPill'),
      });
    }

    if (filter.date === DateFilters.custom) {
      filterPills = this.generateCustomDatePill(filter, filterPills);
    }

    return filterPills;
  }

  generateCustomDatePill(filter: Partial<ExpenseFilters>, filterPills: FilterPill[]): FilterPill[] {
    const startDate = filter.customDateStart && dayjs(filter.customDateStart).format('YYYY-MM-D');
    const endDate = filter.customDateEnd && dayjs(filter.customDateEnd).format('YYYY-MM-D');

    if (startDate && endDate) {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.date'),
        type: 'date',
        value: `${startDate}${this.translocoService.translate('services.myExpenses.to')}${endDate}`,
      });
    } else if (startDate) {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.date'),
        type: 'date',
        value: `${this.translocoService.translate('services.myExpenses.greaterThanOrEqual')}${startDate}`,
      });
    } else if (endDate) {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.date'),
        type: 'date',
        value: `${this.translocoService.translate('services.myExpenses.lessThanOrEqual')}${endDate}`,
      });
    }

    return filterPills;
  }

  generateReceiptsAttachedFilterPills(filterPills: FilterPill[], filter: Partial<ExpenseFilters>): void {
    filterPills.push({
      label: this.translocoService.translate('services.myExpenses.receiptsAttached'),
      type: 'receiptsAttached',
      value: filter.receiptsAttached.toLowerCase(),
    });
  }

  generatePotentialDuplicatesFilterPills(filterPills: FilterPill[], filter: Partial<ExpenseFilters>): void {
    filterPills.push({
      label: this.translocoService.translate('services.myExpenses.potentialDuplicates'),
      type: 'potentialDuplicates',
      value: filter.potentialDuplicates.toLowerCase(),
    });
  }

  generateSplitExpenseFilterPills(filterPills: FilterPill[], filter: Partial<ExpenseFilters>): void {
    filterPills.push({
      label: this.translocoService.translate('services.myExpenses.splitExpense'),
      type: 'splitExpense',
      value: filter.splitExpense.toLowerCase(),
    });
  }

  generateCardFilterPills(filterPills: FilterPill[], filter: Partial<ExpenseFilters>): void {
    filterPills.push({
      label: this.translocoService.translate('services.myExpenses.cardsEndingIn'),
      type: 'cardNumbers',
      value: filter.cardNumbers
        .map((cardNumber) => this.maskNumber.transform(cardNumber))
        .reduce((state1, state2) => `${state1}, ${state2}`),
    });
  }

  generateStateFilterPills(filterPills: FilterPill[], filter: Partial<ExpenseFilters>): void {
    const filterState = filter.state as string[];

    filterPills.push({
      label: this.translocoService.translate('services.myExpenses.type'),
      type: 'state',
      value: filterState
        .map((state) => {
          if (state === 'DRAFT') {
            return this.translocoService.translate('services.myExpenses.incomplete');
          } else if (state === 'READY_TO_REPORT') {
            return this.translocoService.translate('services.myExpenses.complete');
          } else if (state === 'POLICY_VIOLATED') {
            return this.translocoService.translate('services.myExpenses.policyViolatedPill');
          } else if (state === 'BLOCKED') {
            return this.translocoService.translate('services.myExpenses.blockedPill');
          } else if (state === 'CANNOT_REPORT') {
            return this.translocoService.translate('services.myExpenses.cannotReportPill');
          } else {
            return state.replace(/_/g, ' ').toLowerCase();
          }
        })
        .reduce((state1, state2) => `${state1}, ${state2}`),
    });
  }

  convertSelectedSortFitlersToFilters(
    sortBy: SelectedFilters<string | string[]>,
    generatedFilters: Partial<ExpenseFilters>,
  ): void {
    if (sortBy) {
      if (sortBy.value === 'dateNewToOld') {
        generatedFilters.sortParam = 'spent_at';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'dateOldToNew') {
        generatedFilters.sortParam = 'spent_at';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'amountHighToLow') {
        generatedFilters.sortParam = 'amount';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'amountLowToHigh') {
        generatedFilters.sortParam = 'amount';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'categoryAToZ') {
        generatedFilters.sortParam = 'category->name';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'categoryZToA') {
        generatedFilters.sortParam = 'category->name';
        generatedFilters.sortDir = 'desc';
      }
    }
  }

  getFilters(orgSettings?: OrgSettings): FilterOptions<string>[] {
    const typeOptions = [
      {
        label: this.translocoService.translate('services.myExpenses.complete'),
        value: 'READY_TO_REPORT',
      },
      {
        label: this.translocoService.translate('services.myExpenses.incomplete'),
        value: 'DRAFT',
      },
    ];
    // Add BLOCKED filter only if is_new_critical_policy_violation_flow_enabled is true
    if (orgSettings?.is_new_critical_policy_violation_flow_enabled) {
      typeOptions.push({
        label: this.translocoService.translate('services.myExpenses.blocked'),
        value: 'BLOCKED',
      });
    } else {
      // Use CANNOT_REPORT when the flag is false
      typeOptions.push({
        label: this.translocoService.translate('services.myExpenses.cannotReport'),
        value: 'CANNOT_REPORT',
      });
    }

    typeOptions.push({
      label: this.translocoService.translate('services.myExpenses.policyViolated'),
      value: 'POLICY_VIOLATED',
    });

    return [
      {
        name: this.translocoService.translate('services.myExpenses.type'),
        optionType: FilterOptionType.multiselect,
        options: typeOptions,
      } as FilterOptions<string>,
      {
        name: this.translocoService.translate('services.myExpenses.date'),
        optionType: FilterOptionType.date,
        options: [
          {
            label: this.translocoService.translate('services.myExpenses.all'),
            value: DateFilters.all,
          },
          {
            label: this.translocoService.translate('services.myExpenses.thisWeek'),
            value: DateFilters.thisWeek,
          },
          {
            label: this.translocoService.translate('services.myExpenses.thisMonth'),
            value: DateFilters.thisMonth,
          },
          {
            label: this.translocoService.translate('services.myExpenses.lastMonth'),
            value: DateFilters.lastMonth,
          },
          {
            label: this.translocoService.translate('services.myExpenses.custom'),
            value: DateFilters.custom,
          },
        ],
      } as FilterOptions<DateFilters>,
      {
        name: this.translocoService.translate('services.myExpenses.receiptsAttached'),
        optionType: FilterOptionType.singleselect,
        options: [
          {
            label: this.translocoService.translate('services.myExpenses.yes'),
            value: 'YES',
          },
          {
            label: this.translocoService.translate('services.myExpenses.no'),
            value: 'NO',
          },
        ],
      } as FilterOptions<string>,
      {
        name: this.translocoService.translate('services.myExpenses.expenseType'),
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: this.translocoService.translate('services.myExpenses.mileage'),
            value: ExpenseType.MILEAGE,
          },
          {
            label: this.translocoService.translate('services.myExpenses.perDiem'),
            value: ExpenseType.PER_DIEM,
          },
          {
            label: this.translocoService.translate('services.myExpenses.regularExpenses'),
            value: ExpenseType.EXPENSE,
          },
        ],
      } as FilterOptions<string>,
      {
        name: this.translocoService.translate('services.myExpenses.potentialDuplicates'),
        optionType: FilterOptionType.singleselect,
        options: [
          {
            label: this.translocoService.translate('services.myExpenses.yes'),
            value: 'YES',
          },
          {
            label: this.translocoService.translate('services.myExpenses.no'),
            value: 'NO',
          },
        ],
      } as FilterOptions<string>,
      {
        name: this.translocoService.translate('services.myExpenses.sortBy'),
        optionType: FilterOptionType.singleselect,
        options: [
          {
            label: this.translocoService.translate('services.myExpenses.dateNewToOldSort'),
            value: 'dateNewToOld',
          },
          {
            label: this.translocoService.translate('services.myExpenses.dateOldToNewSort'),
            value: 'dateOldToNew',
          },
          {
            label: this.translocoService.translate('services.myExpenses.amountHighToLowSort'),
            value: 'amountHighToLow',
          },
          {
            label: this.translocoService.translate('services.myExpenses.amountLowToHighSort'),
            value: 'amountLowToHigh',
          },
          {
            label: this.translocoService.translate('services.myExpenses.categoryAToZSort'),
            value: 'categoryAToZ',
          },
          {
            label: this.translocoService.translate('services.myExpenses.categoryZToASort'),
            value: 'categoryZToA',
          },
        ],
      } as FilterOptions<string>,
      {
        name: this.translocoService.translate('services.myExpenses.splitExpense'),
        optionType: FilterOptionType.singleselect,
        options: [
          {
            label: this.translocoService.translate('services.myExpenses.yes'),
            value: 'YES',
          },
          {
            label: this.translocoService.translate('services.myExpenses.no'),
            value: 'NO',
          },
        ],
      } as FilterOptions<string>,
    ];
  }

  generateSelectedFilters(filter: Partial<ExpenseFilters>): SelectedFilters<string | string[]>[] {
    const generatedFilters: SelectedFilters<string | string[]>[] = [];

    if (filter.state) {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.type'),
        value: filter.state,
      });
    }

    if (filter.receiptsAttached) {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.receiptsAttached'),
        value: filter.receiptsAttached,
      });
    }

    if (filter.potentialDuplicates) {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.potentialDuplicates'),
        value: filter.potentialDuplicates,
      });
    }

    if (filter.date) {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.date'),
        value: filter.date,
        associatedData: {
          startDate: filter.customDateStart,
          endDate: filter.customDateEnd,
        },
      });
    }

    if (filter.type) {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.expenseType'),
        value: filter.type,
      });
    }

    if (filter.cardNumbers) {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.cardsEndingIn'),
        value: filter.cardNumbers,
      });
    }

    if (filter.sortParam && filter.sortDir) {
      this.addSortToGeneratedFilters(filter, generatedFilters);
    }

    if (filter.splitExpense) {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.splitExpense'),
        value: filter.splitExpense,
      });
    }

    return generatedFilters;
  }

  addSortToGeneratedFilters(
    filter: Partial<ExpenseFilters>,
    generatedFilters: SelectedFilters<string | string[]>[],
  ): void {
    this.convertTxnDtSortToSelectedFilters(filter, generatedFilters);

    this.convertAmountSortToSelectedFilters(filter, generatedFilters);

    this.convertCategorySortToSelectedFilters(filter, generatedFilters);
  }

  convertCategorySortToSelectedFilters(
    filter: Partial<ExpenseFilters>,
    generatedFilters: SelectedFilters<string | string[]>[],
  ): void {
    if (filter.sortParam === 'category->name' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.sortBy'),
        value: 'categoryAToZ',
      });
    } else if (filter.sortParam === 'category->name' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.sortBy'),
        value: 'categoryZToA',
      });
    }
  }

  convertAmountSortToSelectedFilters(
    filter: Partial<ExpenseFilters>,
    generatedFilters: SelectedFilters<string | string[]>[],
  ): void {
    if (filter.sortParam === 'amount' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.sortBy'),
        value: 'amountHighToLow',
      });
    } else if (filter.sortParam === 'amount' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.sortBy'),
        value: 'amountLowToHigh',
      });
    }
  }

  convertTxnDtSortToSelectedFilters(
    filter: Partial<ExpenseFilters>,
    generatedFilters: SelectedFilters<string | string[]>[],
  ): void {
    if (filter.sortParam === 'spent_at' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.sortBy'),
        value: 'dateOldToNew',
      });
    } else if (filter.sortParam === 'spent_at' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: this.translocoService.translate('services.myExpenses.sortBy'),
        value: 'dateNewToOld',
      });
    }
  }

  private generateSortCategoryPills(filter: Partial<ExpenseFilters>, filterPills: FilterPill[]): void {
    if (filter.sortParam === 'category->name' && filter.sortDir === 'asc') {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.sortBy'),
        type: 'sort',
        value: this.translocoService.translate('services.myExpenses.categoryAToZPill'),
      });
    } else if (filter.sortParam === 'category->name' && filter.sortDir === 'desc') {
      filterPills.push({
        label: this.translocoService.translate('services.myExpenses.sortBy'),
        type: 'sort',
        value: this.translocoService.translate('services.myExpenses.categoryZToAPill'),
      });
    }
  }
}
