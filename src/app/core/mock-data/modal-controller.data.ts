import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { filterOptions1 } from './filter.data';
import { selectedFilters1, taskSelectedFiltersData } from './selected-filters.data';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { CreateNewReportComponent } from 'src/app/shared/components/create-new-report/create-new-report.component';
import { apiExpenseRes } from './expense.data';
import { Mode } from '@ionic/core';
import { fyModalProperties } from './model-properties.data';
import { AddTxnToReportDialogComponent } from 'src/app/fyle/my-expenses/add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';

export const modalControllerParams = {
  component: FyFiltersComponent,
  componentProps: {
    filterOptions: [
      ...filterOptions1,
      {
        name: 'Cards',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'ABC',
            value: '1234',
          },
        ],
      },
    ],
    selectedFilterValues: selectedFilters1,
    activeFilterInitialName: 'approvalDate',
  },
  cssClass: 'dialog-popover',
};

export const modalControllerParams2 = {
  component: FyFiltersComponent,
  componentProps: {
    filterOptions: filterOptions1,
    selectedFilterValues: selectedFilters1,
    activeFilterInitialName: 'approvalDate',
  },
  cssClass: 'dialog-popover',
};

export const newReportModalParams = {
  component: CreateNewReportComponent,
  componentProps: {
    selectedExpensesToReport: apiExpenseRes,
  },
  mode: <Mode>'ios',
  ...fyModalProperties,
};

export const addExpenseToReportModalParams = {
  component: AddTxnToReportDialogComponent,
  componentProps: {
    txId: '12345',
  },
  mode: <Mode>'ios',
  ...fyModalProperties,
};

export const popoverControllerParams = {
  component: PopupAlertComponent,
  componentProps: {
    title: '2 Draft Expenses blocking the way',
    message: '2 expenses are in draft state.',
    primaryCta: {
      text: 'Exclude and Continue',
      action: 'continue',
    },
    secondaryCta: {
      text: 'Cancel',
      action: 'cancel',
    },
  },
  cssClass: 'pop-up-in-center',
};

export const openFromComponentConfig = {
  data: {
    icon: 'danger',
    showCloseButton: true,
    message: 'Please select one or more expenses to be reported',
  },
  duration: 3000,
  panelClass: ['msb-failure-with-report-btn'],
};

export const taskModalControllerParams = {
  component: FyFiltersComponent,
  componentProps: {
    filterOptions: [
      {
        name: 'Expenses',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Complete',
            value: 'UNREPORTED',
          },
          {
            label: 'Draft',
            value: 'DRAFT',
          },
          {
            label: 'Duplicate',
            value: 'DUPLICATE',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Reports',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Sent Back',
            value: 'SENT_BACK',
          },
          {
            label: 'Unsubmitted',
            value: 'DRAFT',
          },
          {
            label: 'Unapproved',
            value: 'TEAM',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Advances',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Sent Back',
            value: 'SENT_BACK',
          },
        ],
      } as FilterOptions<string>,
    ],
    selectedFilterValues: taskSelectedFiltersData,
    activeFilterInitialName: 'Expenses',
  },
  cssClass: 'dialog-popover',
};

export const taskModalControllerParams2 = {
  component: FyFiltersComponent,
  componentProps: {
    filterOptions: [
      {
        name: 'Expenses',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Complete',
            value: 'UNREPORTED',
          },
          {
            label: 'Draft',
            value: 'DRAFT',
          },
          {
            label: 'Duplicate',
            value: 'DUPLICATE',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Reports',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Sent Back',
            value: 'SENT_BACK',
          },
          {
            label: 'Unsubmitted',
            value: 'DRAFT',
          },
          {
            label: 'Unapproved',
            value: 'TEAM',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Advances',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Sent Back',
            value: 'SENT_BACK',
          },
        ],
      } as FilterOptions<string>,
    ],
    selectedFilterValues: taskSelectedFiltersData,
    activeFilterInitialName: undefined,
  },
  cssClass: 'dialog-popover',
};
