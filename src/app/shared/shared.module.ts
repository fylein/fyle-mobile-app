import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { SwiperModule } from 'swiper/angular';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslocoModule } from '@jsverse/transloco';

// pipe imports
import { EllipsisPipe } from './pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from './pipes/humanize-currency.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';
import { ReportState } from './pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from './pipes/snake-case-to-space-case.pipe';
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
import { AdvanceState } from './pipes/advance-state.pipe';
import { InitialsPipe } from './pipes/initials.pipe';
import { ApproverDialogComponent } from './components/fy-approver/add-approvers-popover/approver-dialog/approver-dialog.component';
import { FyMenuIconComponent } from './components/fy-menu-icon/fy-menu-icon.component';
import { FyViewAttachmentComponent } from './components/fy-view-attachment/fy-view-attachment.component';
import { FyHighlightTextComponent } from './components/fy-highlight-text/fy-highlight-text.component';
import { FyLoadingScreenComponent } from './components/fy-loading-screen/fy-loading-screen.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// component imports
import { DelegatedAccMessageComponent } from './components/delegated-acc-message/delegated-acc-message.component';
import { IconModule } from './icon/icon.module';
import { ViewCommentComponent } from './components/comments-history/view-comment/view-comment.component';
import { AuditHistoryComponent } from './components/comments-history/audit-history/audit-history.component';
import { StatusesDiffComponent } from './components/comments-history/audit-history/statuses-diff/statuses-diff.component';
import { FyApproverComponent } from './components/fy-approver/fy-approver.component';
import { FyPolicyViolationComponent } from './components/fy-policy-violation/fy-policy-violation.component';

// directive imports
import { FormButtonValidationDirective } from './directive/form-button-validation.directive';
import { FormatDateDirective } from './directive/format-date.directive';

import { PinchZoomModule } from '@meddv/ngx-pinch-zoom';
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
import { FyAlertInfoComponent } from './components/fy-alert-info/fy-alert-info.component';
import { MatRippleModule } from '@angular/material/core';
import { ReviewFooterComponent } from './components/review-footer/review-footer.component';
import { NavigationFooterComponent } from './components/navigation-footer/navigation-footer.component';
import { FyConnectionComponent } from './components/fy-connection/fy-connection.component';
import { FyCriticalPolicyViolationComponent } from './components/fy-critical-policy-violation/fy-critical-policy-violation.component';
import { PopupAlertComponent } from './components/popup-alert/popup-alert.component';
import { CreateNewReportComponent as CreateNewReportComponentV2 } from './components/create-new-report-v2/create-new-report.component';
import { ExpensesCardComponent } from './components/expenses-card/expenses-card.component';
import { ExpensesCardComponent as ExpensesCardComponentV2 } from './components/expenses-card-v2/expenses-card.component';
import { ToastMessageComponent } from './components/toast-message/toast-message.component';
import { FyHeaderComponent } from './components/fy-header/fy-header.component';
import { FyDeleteDialogComponent } from './components/fy-delete-dialog/fy-delete-dialog.component';
import { FyFiltersComponent } from './components/fy-filters/fy-filters.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FyFilterPillsComponent } from './components/fy-filter-pills/fy-filter-pills.component';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { RouteSelectorComponent } from './components/route-selector/route-selector.component';
import { RouteSelectorModalComponent } from './components/route-selector/route-selector-modal/route-selector-modal.component';
import { RouteVisualizerComponent } from './components/route-visualizer/route-visualizer.component';
import { ReceiptPreviewThumbnailComponent } from './components/receipt-preview-thumbnail/receipt-preview-thumbnail.component';
import { FyViewReportInfoComponent } from './components/fy-view-report-info/fy-view-report-info.component';
import { BankAccountCardsComponent } from './components/bank-account-cards/bank-account-cards.component';
import { BankAccountCardComponent } from './components/bank-account-cards/bank-account-card/bank-account-card.component';
import { DeleteButtonComponent } from './components/bank-account-cards/bank-account-card/delete-button/delete-button-component';
import { AddApproversPopoverComponent } from './components/fy-approver/add-approvers-popover/add-approvers-popover.component';
import { ExpenseCardLiteComponent } from './components/expense-card-lite/expense-card-lite.component';
import { FyInputPopoverComponent } from './components/fy-input-popover/fy-input-popover.component';
import { FyPopoverComponent } from './components/fy-popover/fy-popover.component';
import { SidemenuComponent } from './components/sidemenu/sidemenu.component';
import { SidemenuHeaderComponent } from './components/sidemenu/sidemenu-header/sidemenu-header.component';
import { SidemenuFooterComponent } from './components/sidemenu/sidemenu-footer/sidemenu-footer.component';
import { SidemenuContentComponent } from './components/sidemenu/sidemenu-content/sidemenu-content.component';
import { SidemenuContentItemComponent } from './components/sidemenu/sidemenu-content/sidemenu-content-item/sidemenu-content-item.component';
import { FyNavFooterComponent } from './components/navigation-footer/fy-nav-footer/fy-nav-footer.component';
import { PersonalCardTransactionComponent } from './components/personal-card-transaction/personal-card-transaction.component';
import { CaptureReceiptComponent } from './components/capture-receipt/capture-receipt.component';
import { ReceiptPreviewComponent } from './components/capture-receipt/receipt-preview/receipt-preview.component';
import { AddMorePopupComponent } from './components/capture-receipt/add-more-popup/add-more-popup.component';
import { CropReceiptComponent } from './components/capture-receipt/crop-receipt/crop-receipt.component';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FyNumberComponent } from './components/fy-number/fy-number.component';
import { FyStatisticComponent } from './components/fy-statistic/fy-statistic.component';
import { FySummaryTileComponent } from './components/summary-tile/summary-tile.component';
import { ViewExpenseSkeletonLoaderComponent } from './components/view-expense-skeleton-loader/view-expense-skeleton-loader.component';
import { SpentCardsComponent } from './components/spent-cards/spent-cards.component';
import { CardDetailComponent } from './components/spent-cards/card-detail/card-detail.component';
import { MaskNumber } from './pipes/mask-number.pipe';
import { PolicyViolationActionComponent } from './components/fy-policy-violation/policy-violation-action/policy-violation-action.component';
import { SplitExpensePolicyViolationComponent } from './components/split-expense-policy-violation/split-expense-policy-violation.component';
import { ReviewSplitExpenseComponent } from './components/review-split-expense/review-split-expense.component';
import { PolicyViolationRuleComponent } from './components/policy-violation-rule/policy-violation-rule.component';
import { FyCurrencyComponent } from './components/fy-currency/fy-currency.component';
import { FyCurrencyChooseCurrencyComponent } from './components/fy-currency/fy-currency-choose-currency/fy-currency-choose-currency.component';
import { FyCurrencyExchangeRateComponent } from './components/fy-currency/fy-currency-exchange-rate/fy-currency-exchange-rate.component';
import { FyCurrencyPipe } from './pipes/fy-currency.pipe';
import { CurrencySymbolPipe } from './pipes/currency-symbol.pipe';
import { MileageRateName } from './pipes/mileage-rate-name.pipe';
import { SingularPipe } from './pipes/singular.pipe';
import { VirtualSelectComponent } from './components/virtual-select/virtual-select.component';
import { VirtualSelectModalComponent } from './components/virtual-select/virtual-select-modal/virtual-select-modal.component';
import { AutoSubmissionInfoCardComponent } from '../fyle/dashboard/tasks/auto-submission-info-card/auto-submission-info-card.component';
import { CameraPreviewComponent } from './components/capture-receipt/camera-preview/camera-preview.component';
import { DependentFieldsComponent } from './components/dependent-fields/dependent-fields.component';
import { DependentFieldComponent } from './components/dependent-fields/dependent-field/dependent-field.component';
import { DependentFieldModalComponent } from './components/dependent-fields/dependent-field/dependent-field-modal/dependent-field-modal.component';
import { FySelectDisabledComponent } from './components/fy-select-disabled/fy-select-disabled.component';
import { ReportsCardComponent } from './components/reports-card/reports-card.component';
import { ViewDependentFieldsComponent } from './components/view-dependent-fields/view-dependent-fields.component';
import { PopupWithBulletsComponent } from './components/popup-with-bullets/popup-with-bullets.component';
import { AddCardComponent } from './components/add-card/add-card.component';
import { CardNumberComponent } from './components/card-number/card-number.component';
import { ArrayToCommaListPipe } from './pipes/array-to-comma-list.pipe';
import { CorporateCardComponent } from './components/corporate-card/corporate-card.component';
import { VirtualCardComponent } from './components/virtual-card/virtual-card.component';
import { AutofocusDirective } from './directive/autofocus.directive';
import { TransactionStatusInfoPopoverComponent } from './components/transaction-status-info-popover/transaction-status-info-popover.component';
import { TransactionStatusComponent } from './components/transaction-status/transaction-status.component';
import { FySelectCommuteDetailsComponent } from './components/fy-select-commute-details/fy-select-commute-details.component';
import { FyOptInComponent } from './components/fy-opt-in/fy-opt-in.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { PromoteOptInModalComponent } from './components/promote-opt-in-modal/promote-opt-in-modal.component';
import { ProfileOptInCardComponent } from './components/profile-opt-in-card/profile-opt-in-card.component';
import { DashboardOptInComponent } from './components/dashboard-opt-in/dashboard-opt-in.component';
import { DashboardEmailOptInComponent } from './components/dashboard-email-opt-in/dashboard-email-opt-in.component';
import { MobileNumberCardComponent } from './components/mobile-number-card/mobile-number-card.component';
import { PasswordCheckTooltipComponent } from './components/password-check-tooltip/password-check-tooltip.component';
import { ExactCurrencyPipe } from './pipes/exact-currency.pipe';
import { CCExpenseMerchantInfoModalComponent } from './components/cc-expense-merchant-info-modal/cc-expense-merchant-info-modal.component';
import { FyMsgPopoverComponent } from './components/fy-msg-popover/fy-msg-popover.component';
import { ShowAllApproversPopoverComponent } from './components/fy-approver/show-all-approvers-popover/show-all-approvers-popover.component';
import { DateWithTimezonePipe } from './pipes/date-with-timezone.pipe';
import { FyExpansionInfoMsgComponent } from './components/fy-expansion-info-msg/fy-expansion-info-msg.component';

@NgModule({
  declarations: [
    AdvanceState,
    InitialsPipe,
    EllipsisPipe,
    HighlightPipe,
    HumanizeCurrencyPipe,
    ReportState,
    SnakeCaseToSpaceCase,
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
    DelegatedAccMessageComponent,
    ViewCommentComponent,
    AuditHistoryComponent,
    StatusesDiffComponent,
    FyZeroStateComponent,
    FyPopupComponent,
    FyApproverComponent,
    ApproverDialogComponent,
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
    PopupAlertComponent,
    PasswordCheckTooltipComponent,
    CreateNewReportComponentV2,
    ExpensesCardComponent,
    ExpensesCardComponentV2,
    ToastMessageComponent,
    FyHeaderComponent,
    FyDeleteDialogComponent,
    FyFiltersComponent,
    FyFilterPillsComponent,
    ReceiptPreviewThumbnailComponent,
    RouteVisualizerComponent,
    RouteSelectorComponent,
    RouteSelectorModalComponent,
    FyViewReportInfoComponent,
    BankAccountCardsComponent,
    BankAccountCardComponent,
    DeleteButtonComponent,
    AddApproversPopoverComponent,
    ShowAllApproversPopoverComponent,
    ExpenseCardLiteComponent,
    BankAccountCardsComponent,
    BankAccountCardComponent,
    DeleteButtonComponent,
    PersonalCardTransactionComponent,
    FyInputPopoverComponent,
    FyPopoverComponent,
    FyMsgPopoverComponent,
    SidemenuComponent,
    SidemenuHeaderComponent,
    SidemenuFooterComponent,
    SidemenuContentComponent,
    SidemenuContentItemComponent,
    FyNavFooterComponent,
    CaptureReceiptComponent,
    ReceiptPreviewComponent,
    AddMorePopupComponent,
    CropReceiptComponent,
    FyNumberComponent,
    FyStatisticComponent,
    FySummaryTileComponent,
    ViewExpenseSkeletonLoaderComponent,
    SpentCardsComponent,
    CardDetailComponent,
    MaskNumber,
    FyPolicyViolationComponent,
    PolicyViolationActionComponent,
    SplitExpensePolicyViolationComponent,
    ReviewSplitExpenseComponent,
    PolicyViolationRuleComponent,
    FyCurrencyComponent,
    FyCurrencyChooseCurrencyComponent,
    FyCurrencyExchangeRateComponent,
    FyCurrencyPipe,
    CurrencySymbolPipe,
    MileageRateName,
    SingularPipe,
    VirtualSelectComponent,
    VirtualSelectModalComponent,
    AutoSubmissionInfoCardComponent,
    CameraPreviewComponent,
    DependentFieldsComponent,
    DependentFieldComponent,
    DependentFieldModalComponent,
    FySelectDisabledComponent,
    ReportsCardComponent,
    ViewDependentFieldsComponent,
    PopupWithBulletsComponent,
    AddCardComponent,
    CardNumberComponent,
    ArrayToCommaListPipe,
    CorporateCardComponent,
    AutofocusDirective,
    TransactionStatusComponent,
    TransactionStatusInfoPopoverComponent,
    VirtualCardComponent,
    FySelectCommuteDetailsComponent,
    FyOptInComponent,
    PromoteOptInModalComponent,
    ProfileOptInCardComponent,
    DashboardOptInComponent,
    DashboardEmailOptInComponent,
    MobileNumberCardComponent,
    ExactCurrencyPipe,
    CCExpenseMerchantInfoModalComponent,
    DateWithTimezonePipe,
    FyExpansionInfoMsgComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    PinchZoomModule,
    PdfViewerModule,
    MatRippleModule,
    MatDatepickerModule,
    MatChipsModule,
    MatChipsModule,
    SwiperModule,
    MatSnackBarModule,
    RouterModule,
    MatBottomSheetModule,
    ImageCropperModule,
    ScrollingModule,
    NgOtpInputModule,
    TranslocoModule,
  ],
  exports: [
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ExactCurrencyPipe,
    ReportState,
    DateFormatPipe,
    FySelectComponent,
    FySelectVendorComponent,
    FyLocationComponent,
    FyMultiselectComponent,
    FyUserlistComponent,
    AdvanceState,
    SnakeCaseToSpaceCase,
    InitialsPipe,
    DelegatedAccMessageComponent,
    IconModule,
    AuditHistoryComponent,
    StatusesDiffComponent,
    FormButtonValidationDirective,
    FyZeroStateComponent,
    FyPopupComponent,
    FyApproverComponent,
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
    PopupAlertComponent,
    PasswordCheckTooltipComponent,
    CreateNewReportComponentV2,
    ExpensesCardComponent,
    ExpensesCardComponentV2,
    ToastMessageComponent,
    FyHeaderComponent,
    FyDeleteDialogComponent,
    FyFiltersComponent,
    FyFilterPillsComponent,
    ReceiptPreviewThumbnailComponent,
    RouteVisualizerComponent,
    RouteSelectorComponent,
    MatChipsModule,
    ExpenseCardLiteComponent,
    BankAccountCardsComponent,
    PersonalCardTransactionComponent,
    FyPopoverComponent,
    FyMsgPopoverComponent,
    SidemenuComponent,
    FyNavFooterComponent,
    CaptureReceiptComponent,
    ReceiptPreviewComponent,
    AddMorePopupComponent,
    CropReceiptComponent,
    FyNumberComponent,
    FyStatisticComponent,
    FySummaryTileComponent,
    ViewExpenseSkeletonLoaderComponent,
    SpentCardsComponent,
    CardDetailComponent,
    MaskNumber,
    FyPolicyViolationComponent,
    PolicyViolationActionComponent,
    SplitExpensePolicyViolationComponent,
    PolicyViolationRuleComponent,
    FyCurrencyComponent,
    FyCurrencyChooseCurrencyComponent,
    FyCurrencyExchangeRateComponent,
    FyCurrencyPipe,
    CurrencySymbolPipe,
    MileageRateName,
    SingularPipe,
    VirtualSelectComponent,
    AutoSubmissionInfoCardComponent,
    CameraPreviewComponent,
    DependentFieldsComponent,
    DependentFieldComponent,
    DependentFieldModalComponent,
    FySelectDisabledComponent,
    ReportsCardComponent,
    ViewDependentFieldsComponent,
    PopupWithBulletsComponent,
    AddCardComponent,
    CardNumberComponent,
    ArrayToCommaListPipe,
    CorporateCardComponent,
    AutofocusDirective,
    TransactionStatusComponent,
    TransactionStatusInfoPopoverComponent,
    VirtualCardComponent,
    FySelectCommuteDetailsComponent,
    FyOptInComponent,
    PromoteOptInModalComponent,
    ProfileOptInCardComponent,
    DashboardOptInComponent,
    DashboardEmailOptInComponent,
    MobileNumberCardComponent,
    CCExpenseMerchantInfoModalComponent,
    ReviewSplitExpenseComponent,
    DateWithTimezonePipe,
    FyExpansionInfoMsgComponent,
    TranslocoModule,
  ],
  providers: [
    DecimalPipe,
    DatePipe,
    HumanizeCurrencyPipe,
    ImagePicker,
    FyCurrencyPipe,
    ReportState,
    ExactCurrencyPipe,
    TitleCasePipe,
  ],
})
export class SharedModule {}
