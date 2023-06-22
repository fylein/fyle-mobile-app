import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { filterOptions1 } from '../mock-data/filter.data';
import { selectedFilters1 } from '../mock-data/selected-filters.data';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { AddTxnToReportDialogComponent } from 'src/app/fyle/my-expenses/add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import { Mode } from '@ionic/core';
import { apiExpenseRes } from '../mock-data/expense.data';
import { CreateNewReportComponent } from 'src/app/shared/components/create-new-report/create-new-report.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';

export const expectedActionSheetButtonRes = [
  {
    text: 'Capture Receipt',
    icon: 'assets/svg/fy-camera.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add Manually',
    icon: 'assets/svg/fy-expense.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add Mileage',
    icon: 'assets/svg/fy-mileage.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add Per Diem',
    icon: 'assets/svg/fy-calendar.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
];

export const expectedCurrentParams = {
  sortDir: 'asc',
  queryParams: {
    corporate_credit_card_account_number: 'in.(789)',
    and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)',
    or: ['(tx_is_split_expense.eq.true)'],
  },
};

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

export const expectedCriticalPolicyViolationPopoverParams = {
  title: `2 Critical Policy and \
              1 Draft Expenses blocking the way`,
  message: `Critical policy blocking these 2 expenses worth \
              $33700 from being submitted. \
              Also 1 other expenses are in draft states.`,
  reportType: 'newReport',
};

export const expectedCriticalPolicyViolationPopoverParams2 = {
  title: '2 Critical Policy Expenses blocking the way',
  message: `Critical policy blocking these 2 expenses worth \
              $33700 from being submitted.`,
  reportType: 'newReport',
};

export const expectedCriticalPolicyViolationPopoverParams3 = {
  title: '1 Draft Expenses blocking the way',
  message: '1 expenses are in draft states.',
  reportType: 'newReport',
};

export const modalDefaultPropertiesRes = {
  cssClass: 'fy-modal',
  showBackdrop: true,
  canDismiss: true,
  backdropDismiss: true,
  animated: true,
  initialBreakpoint: 1,
  breakpoints: [0, 1],
  handle: false,
};

export const newReportModalParams = {
  component: CreateNewReportComponent,
  componentProps: {
    selectedExpensesToReport: apiExpenseRes,
  },
  mode: <Mode>'ios',
  ...modalDefaultPropertiesRes,
};

export const addExpenseToReportModalParams = {
  component: AddTxnToReportDialogComponent,
  componentProps: {
    txId: '12345',
  },
  mode: <Mode>'ios',
  ...modalDefaultPropertiesRes,
};

export const snackbarPropertiesRes = {
  data: {
    icon: 'danger',
    showCloseButton: true,
    message: 'Please select one or more expenses to be reported',
  },
  duration: 3000,
};

export const snackbarPropertiesRes2 = {
  data: {
    icon: 'success',
    showCloseButton: true,
    message: 'Expense added to report successfully',
  },
  duration: 3000,
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

export const snackbarPropertiesRes3 = {
  data: {
    icon: 'success',
    showCloseButton: true,
    message: '1 expense has been deleted',
  },
  duration: 3000,
};

export const snackbarPropertiesRes4 = {
  data: {
    icon: 'danger',
    showCloseButton: true,
    message: 'We could not delete the expenses. Please try again',
  },
  duration: 3000,
};
