import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// pipe imports
import { EllipsisPipe } from './pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from './pipes/humanize-currency.pipe';
import { ReportState } from './pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from './pipes/snake_case_to_space_case.pipe';
import { TripState } from './pipes/trip-state.pipe';
import { FySelectComponent } from './components/fy-select/fy-select.component';
import { FySelectModalComponent } from './components/fy-select/fy-select-modal/fy-select-modal.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IonicModule } from '@ionic/angular';
import { FyLocationComponent } from './components/fy-location/fy-location.component';
import { FyMultiselectComponent } from './components/fy-multiselect/fy-multiselect.component';
import { FyUserlistComponent } from './components/fy-userlist/fy-userlist.component';
import { FyLocationModalComponent } from './components/fy-location/fy-location-modal/fy-location-modal.component';
import { FyMultiselectModalComponent } from './components/fy-multiselect/fy-multiselect-modal/fy-multiselect-modal.component';
import { FyUserlistModalComponent } from './components/fy-userlist/fy-userlist-modal/fy-userlist-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FyAlertComponent } from './components/fy-alert/fy-alert.component';
import { FyDuplicateDetectionComponent } from './components/fy-duplicate-detection/fy-duplicate-detection.component';
import { FyDuplicateDetectionModalComponent } from './components/fy-duplicate-detection/fy-duplicate-detection-modal/fy-duplicate-detection-modal.component';
import { AdvanceState } from './pipes/advance-state.pipe';
import { InitialsPipe } from './pipes/initials.pipe';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ApproverDialogComponent } from './components/fy-apporver/approver-dialog/approver-dialog.component';
import { ModifyApproverDialogComponent } from './components/fy-modify-approver/modify-approver-dialog/modify-approver-dialog.component';
import { FyCategoryIconComponent } from './components/fy-category-icon/fy-category-icon.component';
import { FyViewAttachmentComponent } from './components/fy-view-attachment/fy-view-attachment.component';

// component imports
import { DelegatedAccMessageComponent } from './components/delegated-acc-message/delegated-acc-message.component';
import { IconModule } from './icon/icon.module';
import { CurrencyComponent } from './components/currency/currency.component';
import { CommentsComponent } from './components/comments/comments.component';
import { ViewCommentComponent } from './components/comments/view-comment/view-comment.component';
import { FyApporverComponent } from './components/fy-apporver/fy-apporver.component';
import { FyModifyApproverComponent } from './components/fy-modify-approver/fy-modify-approver.component';
import { ConfirmationCommentPopoverComponent } from './components/fy-apporver/approver-dialog/confirmation-comment-popover/confirmation-comment-popover.component';
import { ModifyApproverConfirmationPopoverComponent } from './components/fy-modify-approver/modify-approver-dialog/modify-approver-confirmation-popover/modify-approver-confirmation-popover.component';

// directive imports
import { FormButtonValidationDirective } from './directive/form-button-validation.directive';

import { FyPreviewAttachmentsComponent } from './components/fy-preview-attachments/fy-preview-attachments.component';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FyZeroStateComponent } from './components/fy-zero-state/fy-zero-state.component';
import { FyPopupComponent } from './components/fy-popup/fy-popup.component';
import { FyFlagExpenseComponent } from './components/fy-flag-expense/fy-flag-expense.component';
import { FlagUnflagConfirmationComponent } from './components/fy-flag-expense/flag-unflag-confirmation/flag-unflag-confirmation.component';
import { FyPolicyViolationInfoComponent } from './components/fy-policy-violation-info/fy-policy-violation-info.component';
import {FyAddToReportComponent} from './components/fy-add-to-report/fy-add-to-report.component';
import {FyAddToReportModalComponent} from './components/fy-add-to-report/fy-add-to-report-modal/fy-add-to-report-modal.component';
import { FySelectVendorComponent } from './components/fy-select-vendor/fy-select-vendor.component';
import { FySelectVendorModalComponent } from './components/fy-select-vendor/fy-select-modal/fy-select-vendor-modal.component';
import {FyProjectSelectModalComponent} from './components/fy-select-project/fy-select-modal/fy-select-project-modal.component';
import {FySelectProjectComponent} from './components/fy-select-project/fy-select-project.component';

@NgModule({
  declarations: [
    AdvanceState,
    InitialsPipe,
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    SnakeCaseToSpaceCase,
    TripState,
    FySelectComponent,
    FySelectModalComponent,
    FySelectVendorComponent,
    FySelectVendorModalComponent,
    FyLocationComponent,
    FyMultiselectComponent,
    FyUserlistComponent,
    FyLocationModalComponent,
    FyMultiselectModalComponent,
    FyUserlistModalComponent,
    FyAlertComponent,
    FyDuplicateDetectionComponent,
    FyDuplicateDetectionModalComponent,
    DelegatedAccMessageComponent,
    CurrencyComponent,
    CommentsComponent,
    ViewCommentComponent,
    FyPreviewAttachmentsComponent,
    FyZeroStateComponent,
    FyPreviewAttachmentsComponent,
    FyPopupComponent,
    FyApporverComponent,
    FyModifyApproverComponent,
    ApproverDialogComponent,
    ModifyApproverDialogComponent,
    ConfirmationCommentPopoverComponent,
    FyPreviewAttachmentsComponent,
    FyCategoryIconComponent,
    ModifyApproverConfirmationPopoverComponent,
    FyFlagExpenseComponent,
    FlagUnflagConfirmationComponent,
    FyPolicyViolationInfoComponent,
    FyAddToReportComponent,
    FyAddToReportModalComponent,
    FormButtonValidationDirective,
    FySelectProjectComponent,
    FyProjectSelectModalComponent,
    FyViewAttachmentComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    ReactiveFormsModule,
    PinchZoomModule,
    PdfViewerModule
  ],
  exports: [
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    FySelectComponent,
    FySelectVendorComponent,
    FyLocationComponent,
    FyMultiselectComponent,
    FyUserlistComponent,
    FyAlertComponent,
    FyDuplicateDetectionComponent,
    AdvanceState,
    SnakeCaseToSpaceCase,
    TripState,
    InitialsPipe,
    DelegatedAccMessageComponent,
    IconModule,
    CurrencyComponent,
    CommentsComponent,
    FormButtonValidationDirective,
    MatProgressSpinnerModule,
    FyPreviewAttachmentsComponent,
    FyZeroStateComponent,
    FyPreviewAttachmentsComponent,
    FyPopupComponent,
    FyApporverComponent,
    ModifyApproverDialogComponent,
    FyModifyApproverComponent,
    ConfirmationCommentPopoverComponent,
    FyPreviewAttachmentsComponent,
    FyCategoryIconComponent,
    ModifyApproverConfirmationPopoverComponent,
    FyFlagExpenseComponent,
    FlagUnflagConfirmationComponent,
    FyPolicyViolationInfoComponent,
    FyAddToReportComponent,
    FySelectProjectComponent,
    FyProjectSelectModalComponent,
    FyViewAttachmentComponent
  ],
  providers: [
    DecimalPipe,
    DatePipe
  ]
})
export class SharedModule { }
