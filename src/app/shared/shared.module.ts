import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { SwiperModule } from 'swiper/angular';

// pipe imports
import { EllipsisPipe } from './pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from './pipes/humanize-currency.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';
import { ReportState } from './pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from './pipes/snake-case-to-space-case.pipe';
import { ToLowerCase } from './pipes/to-lowercase.pipe';
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
import { ApproverDialogComponent } from './components/fy-approver/add-approvers-popover/approver-dialog/approver-dialog.component';
import { FyCategoryIconComponent } from './components/fy-category-icon/fy-category-icon.component';
import { FyMenuIconComponent } from './components/fy-menu-icon/fy-menu-icon.component';
import { FyViewAttachmentComponent } from './components/fy-view-attachment/fy-view-attachment.component';
import { FyHighlightTextComponent } from './components/fy-highlight-text/fy-highlight-text.component';
import { FyLoadingScreenComponent } from './components/fy-loading-screen/fy-loading-screen.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// component imports
import { DelegatedAccMessageComponent } from './components/delegated-acc-message/delegated-acc-message.component';
import { IconModule } from './icon/icon.module';
import { CurrencyComponent } from './components/currency/currency.component';
import { CommentsHistoryComponent } from './components/comments-history/comments-history.component';
import { ViewCommentComponent } from './components/comments-history/view-comment/view-comment.component';
import { AuditHistoryComponent } from './components/comments-history/audit-history/audit-history.component';
import { StatusesDiffComponent } from './components/comments-history/audit-history/statuses-diff/statuses-diff.component';
import { FyApproverComponent } from './components/fy-approver/fy-approver.component';
import { PolicyViolationDetailsComponent } from './components/policy-violation-details/policy-violation-details.component';

// directive imports
import { FormButtonValidationDirective } from './directive/form-button-validation.directive';
import { FormatDateDirective } from './directive/format-date.directive';

import { FyPreviewAttachmentsComponent } from './components/fy-preview-attachments/fy-preview-attachments.component';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FyZeroStateComponent } from './components/fy-zero-state/fy-zero-state.component';
import { FyPopupComponent } from './components/fy-popup/fy-popup.component';
import { FyPolicyViolationInfoComponent } from './components/fy-policy-violation-info/fy-policy-violation-info.component';
import { FyAddToReportComponent } from './components/fy-add-to-report/fy-add-to-report.component';
import { FyAddToReportModalComponent } from './components/fy-add-to-report/fy-add-to-report-modal/fy-add-to-report-modal.component';
import { FySelectVendorComponent } from './components/fy-select-vendor/fy-select-vendor.component';
import { FySelectVendorModalComponent } from './components/fy-select-vendor/fy-select-modal/fy-select-vendor-modal.component';
import { FyProjectSelectModalComponent } from './components/fy-select-project/fy-select-modal/fy-select-project-modal.component';
import { FySelectProjectComponent } from './components/fy-select-project/fy-select-project.component';
import { ExpenseState } from './pipes/expense-state.pipe';
import { FooterComponent } from './components/footer/footer.component';
import { FyAlertInfoComponent } from './components/fy-alert-info.component.html/fy-alert-info.component';
import { MatRippleModule } from '@angular/material/core';
import { ReviewFooterComponent } from './components/review-footer/review-footer.component';
import { NavigationFooterComponent } from './components/navigation-footer/navigation-footer.component';
import { FyConnectionComponent } from './components/fy-connection/fy-connection.component';
import { FyCriticalPolicyViolationComponent } from './components/fy-critical-policy-violation/fy-critical-policy-violation.component';
import { PopupAlertComponentComponent } from './components/popup-alert-component/popup-alert-component.component';
import { CreateNewReportComponent } from './components/create-new-report/create-new-report.component';
import { ExpensesCardComponent } from './components/expenses-card/expenses-card.component';
import { ToastMessageComponent } from './components/toast-message/toast-message.component';
import { FyHeaderComponent } from './components/fy-header/fy-header.component';
import { FyDeleteDialogComponent } from './components/fy-delete-dialog/fy-delete-dialog.component';
import { FyFiltersComponent } from './components/fy-filters/fy-filters.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FyFilterPillsComponent } from './components/fy-filter-pills/fy-filter-pills.component';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { RouteSelectorComponent } from './components/route-selector/route-selector.component';
import { RouteSelectorModalComponent } from './components/route-selector/route-selector-modal/route-selector-modal.component';
import { RouteVisualizerComponent } from './components/route-visualizer/route-visualizer.component';
import { ReceiptPreviewThumbnailComponent } from './components/receipt-preview-thumbnail/receipt-preview-thumbnail.component';
import { FyViewReportInfoComponent } from './components/fy-view-report-info/fy-view-report-info.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { BankAccountCardsComponent } from './components/bank-account-cards/bank-account-cards.component';
import { BankAccountCardComponent } from './components/bank-account-cards/bank-account-card/bank-account-card.component';
import { DeleteButtonComponent } from './components/bank-account-cards/bank-account-card/delete-button/delete-button-component';
import { AddApproversPopoverComponent } from './components/fy-approver/add-approvers-popover/add-approvers-popover.component';
import { ExpenseCardLiteComponent } from './components/expense-card-lite/expense-card-lite.component';
import { FyInputPopoverComponent } from './components/fy-input-popover/fy-input-popover.component';
import { FyPopoverComponent } from './components/fy-popover/fy-popover.component';
import { FyNavFooterComponent } from './components/navigation-footer/fy-nav-footer/fy-nav-footer.component';
import { PersonalCardTransactionComponent } from './components/personal-card-transaction/personal-card-transaction.component';

@NgModule({
  declarations: [
    AdvanceState,
    InitialsPipe,
    EllipsisPipe,
    HighlightPipe,
    HumanizeCurrencyPipe,
    ReportState,
    SnakeCaseToSpaceCase,
    ToLowerCase,
    TripState,
    DateFormatPipe,
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
    CommentsHistoryComponent,
    ViewCommentComponent,
    AuditHistoryComponent,
    StatusesDiffComponent,
    FyPreviewAttachmentsComponent,
    FyZeroStateComponent,
    FyPreviewAttachmentsComponent,
    FyPopupComponent,
    FyApproverComponent,
    ApproverDialogComponent,
    FyPreviewAttachmentsComponent,
    FyCategoryIconComponent,
    FyMenuIconComponent,
    FyPolicyViolationInfoComponent,
    FyAddToReportComponent,
    FyAddToReportModalComponent,
    FormButtonValidationDirective,
    FySelectProjectComponent,
    FyProjectSelectModalComponent,
    FyViewAttachmentComponent,
    FyHighlightTextComponent,
    FormatDateDirective,
    ExpenseState,
    FooterComponent,
    FyLoadingScreenComponent,
    FyAlertInfoComponent,
    ReviewFooterComponent,
    NavigationFooterComponent,
    FyConnectionComponent,
    FyCriticalPolicyViolationComponent,
    PopupAlertComponentComponent,
    CreateNewReportComponent,
    ExpensesCardComponent,
    ToastMessageComponent,
    FyHeaderComponent,
    FyDeleteDialogComponent,
    FyFiltersComponent,
    FyFilterPillsComponent,
    ReceiptPreviewThumbnailComponent,
    RouteVisualizerComponent,
    RouteSelectorComponent,
    RouteSelectorModalComponent,
    PolicyViolationDetailsComponent,
    FyViewReportInfoComponent,
    BankAccountCardsComponent,
    BankAccountCardComponent,
    DeleteButtonComponent,
    AddApproversPopoverComponent,
    ExpenseCardLiteComponent,
    BankAccountCardsComponent,
    BankAccountCardComponent,
    DeleteButtonComponent,
    PersonalCardTransactionComponent,
    FyInputPopoverComponent,
    FyPopoverComponent,
    FyNavFooterComponent,
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
    PdfViewerModule,
    MatRippleModule,
    MatRadioModule,
    MatDatepickerModule,
    MatChipsModule,
    GoogleMapsModule,
    MatChipsModule,
    SwiperModule,
    MatSnackBarModule,
  ],
  exports: [
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    DateFormatPipe,
    FySelectComponent,
    FySelectVendorComponent,
    FyLocationComponent,
    FyMultiselectComponent,
    FyUserlistComponent,
    FyAlertComponent,
    FyDuplicateDetectionComponent,
    AdvanceState,
    SnakeCaseToSpaceCase,
    ToLowerCase,
    TripState,
    InitialsPipe,
    DelegatedAccMessageComponent,
    IconModule,
    CurrencyComponent,
    CommentsHistoryComponent,
    AuditHistoryComponent,
    StatusesDiffComponent,
    FormButtonValidationDirective,
    MatProgressSpinnerModule,
    FyPreviewAttachmentsComponent,
    FyZeroStateComponent,
    FyPreviewAttachmentsComponent,
    FyPopupComponent,
    FyApproverComponent,
    FyPreviewAttachmentsComponent,
    FyCategoryIconComponent,
    FyMenuIconComponent,
    FyPolicyViolationInfoComponent,
    FyAddToReportComponent,
    FySelectProjectComponent,
    FyProjectSelectModalComponent,
    FyViewAttachmentComponent,
    FyHighlightTextComponent,
    FormatDateDirective,
    ExpenseState,
    FooterComponent,
    FyLoadingScreenComponent,
    FyAlertInfoComponent,
    ReviewFooterComponent,
    NavigationFooterComponent,
    FyConnectionComponent,
    FyCriticalPolicyViolationComponent,
    PopupAlertComponentComponent,
    CreateNewReportComponent,
    ExpensesCardComponent,
    ToastMessageComponent,
    FyHeaderComponent,
    FyDeleteDialogComponent,
    FyFiltersComponent,
    FyFilterPillsComponent,
    ReceiptPreviewThumbnailComponent,
    RouteVisualizerComponent,
    RouteSelectorComponent,
    MatChipsModule,
    PolicyViolationDetailsComponent,
    ExpenseCardLiteComponent,
    BankAccountCardsComponent,
    PersonalCardTransactionComponent,
    FyPopoverComponent,
    FyNavFooterComponent,
  ],
  providers: [DecimalPipe, DatePipe, HumanizeCurrencyPipe],
})
export class SharedModule {}
