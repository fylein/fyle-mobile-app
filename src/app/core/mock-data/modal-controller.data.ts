import deepFreeze from 'deep-freeze-strict';

import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { filterOptions1 } from './filter.data';
import { selectedFilters1, selectedFilters4, taskSelectedFiltersData } from './selected-filters.data';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { CreateNewReportComponent as createReportV2 } from 'src/app/shared/components/create-new-report-v2/create-new-report.component';
import { CreateNewReportComponent } from 'src/app/shared/components/create-new-report/create-new-report.component';
import { Mode } from '@ionic/core';
import { fyModalProperties } from './model-properties.data';
import { AddTxnToReportDialogComponent as v2 } from 'src/app/fyle/my-expenses/add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { FyAddToReportModalComponent } from 'src/app/shared/components/fy-add-to-report/fy-add-to-report-modal/fy-add-to-report-modal.component';
import { reportOptionsData } from './report-options.data';
import { expectedReportsPaginated } from './platform-report.data';
import { FyInputPopoverComponent } from 'src/app/shared/components/fy-input-popover/fy-input-popover.component';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { advanceRequestFileUrlData2, fileObject4 } from './file-object.data';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { VirtualSelectModalComponent } from 'src/app/shared/components/virtual-select/virtual-select-modal/virtual-select-modal.component';

import { apiExpenseRes } from './expense.data';
import { apiExpenses1 } from './platform/v1/expense.data';

export const modalControllerParams = deepFreeze({
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
});

export const modalControllerParams2 = deepFreeze({
  component: FyFiltersComponent,
  componentProps: {
    filterOptions: filterOptions1,
    selectedFilterValues: selectedFilters1,
    activeFilterInitialName: 'approvalDate',
  },
  cssClass: 'dialog-popover',
});

export const newReportModalParams = deepFreeze({
  component: CreateNewReportComponent,
  componentProps: {
    selectedExpensesToReport: apiExpenseRes,
  },
  mode: <Mode>'ios',
  ...fyModalProperties,
});

export const newReportModalParams2 = deepFreeze({
  component: createReportV2,
  componentProps: {
    selectedExpensesToReport: apiExpenses1,
  },
  mode: <Mode>'ios',
  ...fyModalProperties,
});

export const addExpenseToReportModalParams2 = deepFreeze({
  component: v2,
  componentProps: {
    txId: '12345',
  },
  mode: <Mode>'ios',
  ...fyModalProperties,
});

export const popoverControllerParams = deepFreeze({
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
});

export const openFromComponentConfig = deepFreeze({
  data: {
    icon: 'warning-fill',
    showCloseButton: true,
    message: 'Please select one or more expenses to be reported',
  },
  duration: 3000,
  panelClass: ['msb-failure-with-report-btn'],
});

export const taskModalControllerParams = deepFreeze({
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
});

export const taskModalControllerParams2 = deepFreeze({
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
});

export const teamReportsModalControllerParams = deepFreeze({
  component: FyFiltersComponent,
  componentProps: {
    filterOptions: [
      {
        name: 'State',
        optionType: FilterOptionType.multiselect,
        options: [
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
            label: 'Paid',
            value: 'PAID',
          },
        ],
        optionsNewFlow: [
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
        name: 'Submitted Date',
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
            label: 'Submitted Date - New to Old',
            value: 'dateNewToOld',
          },
          {
            label: 'Submitted Date - Old to New',
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
    ],
    simplifyReportsSettings$: undefined,
    selectedFilterValues: selectedFilters4,
    activeFilterInitialName: 'State',
  },
  cssClass: 'dialog-popover',
});

export const popoverControllerParams2 = deepFreeze({
  component: PopupAlertComponent,
  componentProps: {
    title: 'Unsaved Changes',
    message: 'You have unsaved information that will be lost if you discard this expense.',
    primaryCta: {
      text: 'Discard',
      action: 'continue',
    },
    secondaryCta: {
      text: 'Cancel',
      action: 'cancel',
    },
  },
  cssClass: 'pop-up-in-center',
});

export const addToReportModalControllerParams = deepFreeze({
  component: FyAddToReportModalComponent,
  componentProps: {
    options: reportOptionsData,
    currentSelection: expectedReportsPaginated[0],
    selectionElement: undefined,
    showNullOption: true,
    cacheName: '',
    customInput: false,
    subheader: 'All',
    enableSearch: false,
    autoSubmissionReportName: '#Aug 1',
    isNewReportsFlowEnabled: false,
  },
  mode: 'ios' as Mode,
  cssClass: 'fy-modal',
  showBackdrop: true,
  canDismiss: true,
  backdropDismiss: true,
  animated: true,
  initialBreakpoint: 1,
  breakpoints: [0, 1],
  handle: false,
});

export const popoverControllerParams3 = deepFreeze({
  component: FyInputPopoverComponent,
  componentProps: {
    title: 'New Draft Report',
    ctaText: 'Save',
    inputValue: 'Client Meeting',
    inputLabel: 'Report Name',
    isRequired: true,
  },
  cssClass: 'fy-dialog-popover',
});

export const modalControllerParams3 = deepFreeze({
  component: CaptureReceiptComponent,
  componentProps: {
    isModal: true,
    allowGalleryUploads: false,
    allowBulkFyle: false,
  },
  cssClass: 'hide-modal',
});

export const modalControllerParams4 = deepFreeze({
  component: FyViewAttachmentComponent,
  componentProps: {
    attachments: advanceRequestFileUrlData2,
    canEdit: true,
  },
  mode: 'ios' as Mode,
});

export const modalControllerParams5 = deepFreeze({
  component: ViewCommentComponent,
  componentProps: {
    objectType: 'advance_requests',
    objectId: 'areqR1cyLgXdND',
  },
  cssClass: 'fy-modal',
  showBackdrop: true,
  canDismiss: true,
  backdropDismiss: true,
  animated: true,
  initialBreakpoint: 1,
  breakpoints: [0, 1],
  handle: false,
});

export const popoverControllerParams5 = deepFreeze({
  component: PopupAlertComponent,
  cssClass: 'pop-up-in-center',
  componentProps: {
    title: 'Review Advance',
    message: 'Advance request by Abhishek Jain of amount $54 will be approved',
    primaryCta: {
      text: 'Approve',
      action: 'approve',
    },
    secondaryCta: {
      text: 'Cancel',
      action: 'cancel',
    },
  },
});

export const popoverControllerParams6 = deepFreeze({
  component: FyPopoverComponent,
  cssClass: 'fy-dialog-popover',
  componentProps: {
    title: 'Send Back',
    formLabel: 'Reason For Sending Back Advance',
  },
});

export const popoverControllerParams7 = deepFreeze({
  component: FyPopoverComponent,
  cssClass: 'fy-dialog-popover',
  componentProps: {
    title: 'Reject',
    formLabel: 'Please mention the reason for rejecting the advance request',
  },
});

export const modalControllerParams6 = deepFreeze({
  component: ViewCommentComponent,
  componentProps: {
    objectType: 'advance_requests',
    objectId: 'areqR1cyLgXdND',
  },
  cssClass: 'fy-modal',
  showBackdrop: true,
  canDismiss: true,
  backdropDismiss: true,
  animated: true,
  initialBreakpoint: 1,
  breakpoints: [0, 1],
  handle: false,
});

export const modalControllerParams7 = deepFreeze({
  component: FyViewAttachmentComponent,
  componentProps: {
    attachments: fileObject4[0],
  },
  mode: 'ios' as Mode,
  presentingElement: undefined,
  cssClass: 'fy-modal',
  showBackdrop: true,
  canDismiss: true,
  backdropDismiss: true,
  animated: true,
  initialBreakpoint: 1,
  breakpoints: [0, 1],
  handle: false,
});

export const popoverControllerParams8 = deepFreeze({
  component: FyPopoverComponent,
  componentProps: {
    title: 'Pull Back Advance?',
    formLabel: 'Pulling back your advance request will allow you to edit and re-submit the request.',
  },
  cssClass: 'fy-dialog-popover',
});

export const modalControllerParams8 = deepFreeze({
  component: ViewCommentComponent,
  componentProps: {
    objectType: 'advance_requests',
    objectId: 'areqiwr3Wwirr',
  },
  cssClass: 'fy-modal',
  showBackdrop: true,
  canDismiss: true,
  backdropDismiss: true,
  animated: true,
  initialBreakpoint: 1,
  breakpoints: [0, 1],
  handle: false,
});

export const modalControllerParams9 = deepFreeze({
  component: FyViewAttachmentComponent,
  componentProps: {
    attachments: fileObject4[0],
  },
  mode: 'ios' as Mode,
  cssClass: 'fy-modal',
  showBackdrop: true,
  canDismiss: true,
  backdropDismiss: true,
  animated: true,
  initialBreakpoint: 1,
  breakpoints: [0, 1],
  handle: false,
});

export const virtualSelectModalControllerParams = deepFreeze({
  component: VirtualSelectModalComponent,
  componentProps: {
    options: [],
    currentSelection: undefined,
    selectionElement: undefined,
    nullOption: true,
    cacheName: '',
    subheader: 'All',
    enableSearch: true,
    selectModalHeader: 'Select Item',
    placeholder: undefined,
    showSaveButton: false,
    defaultLabelProp: undefined,
    recentlyUsed: undefined,
    label: '',
  },
  mode: 'ios' as Mode,
  cssClass: 'fy-modal',
  showBackdrop: true,
  canDismiss: true,
  backdropDismiss: true,
  animated: true,
  initialBreakpoint: 1,
  breakpoints: [0, 1],
  handle: false,
});

export const permissionDeniedPopoverParams = deepFreeze({
  component: PopupAlertComponent,
  componentProps: {
    title: 'Photos Permission',
    message: 'Please allow Fyle to access device photos. Click Settings and allow Photos access',
    primaryCta: {
      text: 'Open Settings',
      action: 'OPEN_SETTINGS',
    },
    secondaryCta: {
      text: 'Cancel',
      action: 'CANCEL',
    },
  },
  cssClass: 'pop-up-in-center',
  backdropDismiss: false,
});
