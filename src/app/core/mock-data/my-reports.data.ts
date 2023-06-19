import { of } from 'rxjs';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';

export const generatedFiltersStateDateSortParams = [
  {
    name: 'State',
    value: 'approved',
  },
  {
    name: 'Date',
    value: 'last_week',
    associatedData: {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-07'),
    },
  },
  {
    name: 'Sort By',
    value: 'dateOldToNew',
  },
];

export const generatedFiltersStateDate = [
  {
    name: 'State',
    value: 'draft',
  },
  {
    name: 'Date',
    value: 'this_month',
    associatedData: {
      startDate: undefined,
      endDate: undefined,
    },
  },
];

export const expectedGenerateFilterPillsData = [
  {
    label: 'State',
    type: 'state',
    value: 'active, completed',
  },
  {
    label: 'Date',
    type: 'date',
    value: 'this Week',
  },
  {
    label: 'Sort By',
    type: 'sort',
    value: 'date - old to new',
  },
];

export const openFiltersOptions = [
  {
    name: 'State',
    optionType: FilterOptionType.multiselect,
    options: [
      {
        label: 'Draft',
        value: 'DRAFT',
      },
      {
        label: 'Reported',
        value: 'APPROVER_PENDING',
      },
      {
        label: 'Sent Back',
        value: 'APPROVER_INQUIRY',
      },
      {
        label: 'Approved',
        value: 'APPROVED',
      },
      {
        label: 'Payment Pending',
        value: 'PAYMENT_PENDING',
      },
      {
        label: 'Payment Processing',
        value: 'PAYMENT_PROCESSING',
      },
      {
        label: 'Paid',
        value: 'PAID',
      },
    ],
    optionsNewFlow: [
      {
        label: 'Draft',
        value: 'DRAFT',
      },
      {
        label: 'Submitted',
        value: 'APPROVER_PENDING',
      },
      {
        label: 'Sent Back',
        value: 'APPROVER_INQUIRY',
      },
      {
        label: 'Approved',
        value: 'APPROVED',
      },
      {
        label: 'Processing',
        value: 'PAYMENT_PROCESSING',
      },
      {
        label: 'Closed',
        value: 'PAID',
      },
    ],
    optionsNewFlowCCCOnly: [
      {
        label: 'Draft',
        value: 'DRAFT',
      },
      {
        label: 'Submitted',
        value: 'APPROVER_PENDING',
      },
      {
        label: 'Sent Back',
        value: 'APPROVER_INQUIRY',
      },
      {
        label: 'Approved',
        value: 'APPROVED',
      },
      {
        label: 'Closed',
        value: 'PAID',
      },
    ],
  } as FilterOptions<string>,
  {
    name: 'Date',
    optionType: FilterOptionType.date,
    options: [
      {
        label: 'All',
        value: DateFilters.all,
      },
      {
        label: 'This Week',
        value: DateFilters.thisWeek,
      },
      {
        label: 'This Month',
        value: DateFilters.thisMonth,
      },
      {
        label: 'Last Month',
        value: DateFilters.lastMonth,
      },
      {
        label: 'Custom',
        value: DateFilters.custom,
      },
    ],
  } as FilterOptions<DateFilters>,
  {
    name: 'Sort By',
    optionType: FilterOptionType.singleselect,
    options: [
      {
        label: 'Date - New to Old',
        value: 'dateNewToOld',
      },
      {
        label: 'Date - Old to New',
        value: 'dateOldToNew',
      },
      {
        label: 'Amount - High to Low',
        value: 'amountHighToLow',
      },
      {
        label: 'Amount - Low to High',
        value: 'amountLowToHigh',
      },
      {
        label: 'Name - A to Z',
        value: 'nameAToZ',
      },
      {
        label: 'Name - Z to A',
        value: 'nameZToA',
      },
    ],
  } as FilterOptions<string>,
];

export const deletePopoverParamsRes = {
  component: FyDeleteDialogComponent,
  cssClass: 'delete-dialog',
  backdropDismiss: false,
  componentProps: {
    header: 'Delete Report',
    body: 'Are you sure you want to delete this report?',
    infoMessage: 'Deleting the report will not delete any of the expenses.',
    deleteMethod: jasmine.any(Function),
  },
};

export const popoverControllerParams = {
  component: PopupAlertComponent,
  componentProps: {
    title: 'Cannot Delete Report',
    message: `Approved report cannot be deleted.`,
    primaryCta: {
      text: 'Close',
      action: 'continue',
    },
  },
  cssClass: 'pop-up-in-center',
};

const mockDeleteMethod = () => of(true);

export const deletePopoverParamsRes2 = {
  component: FyDeleteDialogComponent,
  cssClass: 'delete-dialog',
  backdropDismiss: false,
  componentProps: {
    header: 'Delete Report',
    body: 'Are you sure you want to delete this report?',
    infoMessage: 'Deleting the report will not delete any of the expenses.',
    deleteMethod: mockDeleteMethod,
  },
};
