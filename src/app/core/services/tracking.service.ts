import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { DeviceService } from '../../core/services/device.service';
import { environment } from 'src/environments/environment';
import { ExpenseView } from '../models/expense-view.enum';
import { TaskFilters } from '../models/task-filters.model';
import { OrgCategory } from '../models/v1/org-category.model';
import { TeamReportsFilters } from '../models/team-reports-filters.model';
import { forkJoin, from } from 'rxjs';
import { ReportFilters } from '../models/report-filters.model';
import { CommuteDetailsResponse } from '../models/platform/commute-details-response.model';
import { HttpErrorResponse } from '@angular/common/http';
import mixpanel, { Config } from 'mixpanel-browser';
import { AddAttachmentProperties } from '../models/add-attachment-properties.model';
import { AppLaunchTimeProperties } from '../models/app-launch-time-properties.model';
import { CaptureSingleReceiptTimeProperties } from '../models/capture-single-receipt-time-properties.model';
import { CardEnrolledProperties } from '../models/card-enrolled-properties.model';
import { CardEnrollmentErrorsProperties } from '../models/card-enrollment-errors-properties.model';
import { CardUnenrolledProperties } from '../models/card-unenrolled-properties.model';
import { CommentHistoryActionProperties } from '../models/comment-history-action-properties.model';
import { CorporateCardExpenseProperties } from '../models/corporate-card-expense-properties.model';
import { CreateReportProperties } from '../models/create-report-properties.model';
import { EnrollingNonRTFCardProperties } from '../models/enrolling-non-rtf-card-properties.model';
import { ExpenseClickProperties } from '../models/expense-click-properties.model';
import { ExpenseProperties } from '../models/expense-properties.model';
import { FilterPillClickedProperties } from '../models/filter-pill-clicked-properties.model';
import { FooterButtonClickProperties } from '../models/footer-button-click-properties.model';
import { IdentifyProperties } from '../models/identify-properties.model';
import { OnSettingToggleProperties } from '../models/on-setting-toggle-properties.model';
import { PolicyCorrectionProperties } from '../models/policy-correction-properties.model';
import { ReportNameChangeProperties } from '../models/report-name-change-properties.model';
import { SplittingExpenseProperties } from '../models/splitting-expense-properties.model';
import { SwitchOrgProperties } from '../models/switch-Oorg-properties.model';
import { SwitchOrgLaunchTimeProperties } from '../models/switch-org-launch-time-properties.model';
import { TaskFilterClearAllProperties } from '../models/task-filter-clear-all-properties.model';
import { TaskPageOpenProperties } from '../models/task-page-open-properties.model';
import { TaskProperties } from '../models/task-properties.model';
import { ViewReportInfoProperties } from '../models/view-report-info-properties.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  private authService = inject(AuthService);

  private deviceService = inject(DeviceService);

  identityId = null;

  ROOT_ENDPOINT: string;

  setRoot(rootUrl: string): void {
    this.ROOT_ENDPOINT = rootUrl;
    this.initializeMixpanel();
  }

  initializeMixpanel(): void {
    try {
      const enableMixpanel = environment.ENABLE_MIXPANEL;
      if (enableMixpanel === 'true') {
        const config: Partial<Config> = {
          debug: false,
          track_pageview: false,
          persistence: 'localStorage',
        };

        const useMixpanelProxy = environment.USE_MIXPANEL_PROXY;
        if (useMixpanelProxy === 'true' && this.ROOT_ENDPOINT) {
          config.api_host = this.ROOT_ENDPOINT + '/mixpanel';
        }

        mixpanel.init(environment.MIXPANEL_PROJECT_TOKEN, config);
      }
    } catch (e) {}
  }

  async updateIdentity(): Promise<void> {
    const eou = await this.authService.getEou();
    const userId = eou?.us?.id;
    if (userId && userId !== this.identityId) {
      try {
        mixpanel?.identify(userId);
      } catch (e) {}

      this.identityId = userId;
    }
  }

  async getUserProperties(): Promise<IdentifyProperties> {
    const properties: IdentifyProperties = {};
    try {
      const eou = await this.authService.getEou();
      if (eou?.us && eou?.ou) {
        try {
          const distinctId = mixpanel?.get_distinct_id() as string;
          if (distinctId !== eou.us.id) {
            mixpanel?.identify(eou.us.id);
          }

          properties['User Id'] = eou.us.id;
          properties['Org Id'] = eou.ou.org_id;
          properties['Org User Id'] = eou.ou.id;
          properties['Org Currency'] = eou.org.currency;
          properties['Is Demo Account'] = this.isDemoAccount(eou);
        } catch (e) {}
      }
    } catch (error) {}
    return properties;
  }

  async updateIdentityIfNotPresent(): Promise<void> {
    if (!this.identityId) {
      await this.updateIdentity();
    }
  }

  // new function name
  updateSegmentProfile(data: IdentifyProperties): void {
    try {
      // ASSUMPTION: we are assuming that user is already identified via onSignin()
      mixpanel?.people?.set(data);
    } catch (e) {}
  }

  eventTrack<T>(action: string, properties = {} as T): void {
    forkJoin({
      deviceInfo: this.deviceService.getDeviceInfo(),
      userProps: from(this.getUserProperties()),
    }).subscribe(({ deviceInfo, userProps }) => {
      properties = {
        ...properties,
        ...userProps,
        Asset: 'Mobile',
        DeviceType: deviceInfo.platform,
        deviceInfo: {
          manufacturer: deviceInfo.manufacturer,
          model: deviceInfo.model,
          operatingSystem: deviceInfo.operatingSystem,
          osVersion: deviceInfo.osVersion,
          platform: deviceInfo.platform,
          webViewVersion: deviceInfo.webViewVersion,
        },
        appVersion: environment.LIVE_UPDATE_APP_VERSION,
        // overriding $current_url which MixPanel auto captures to prevent query parms containing PII data
        $current_url: window.location.href?.split('?')[0],
      };

      try {
        mixpanel?.track(action, properties);
      } catch (e) {}
    });
  }

  // external APIs
  onSignin(userId: string, properties: { label?: string } = {}): void {
    try {
      mixpanel?.identify(userId);
    } catch (e) {}

    this.identityId = userId;
    this.eventTrack('Signin', properties);
  }

  /*** Events related to expense ***/
  // create expense event
  async createExpense(properties: ExpenseProperties): Promise<void> {
    // Temporary hack for already logged in users - we need to know their identity
    await this.updateIdentity();
    this.eventTrack('Create Expense', properties);
  }

  splittingExpense(properties: SplittingExpenseProperties): void {
    this.eventTrack('Splitting Expense', properties);
  }

  splitExpenseSuccess(properties: SplittingExpenseProperties): void {
    this.eventTrack('Split Expense Success', properties);
  }

  splitExpenseFailed(properties: SplittingExpenseProperties): void {
    this.eventTrack('Split Expense Failed', properties);
  }

  splitExpensePolicyCheckFailed(properties: SplittingExpenseProperties): void {
    this.eventTrack('Split Expense Policy check failed', properties);
  }

  splitExpensePolicyAndMissingFieldsPopupShown(properties: SplittingExpenseProperties): void {
    this.eventTrack('Split Expense Policy and Missing Fields Popup Shown', properties);
  }

  // view expense event
  viewExpense(properties: { Type: string }): void {
    this.eventTrack('View Expense', properties);
  }

  // delete expense event
  deleteExpense(properties: { Type?: string } = {}): void {
    this.eventTrack('Delete Expense', properties);
  }

  // edit expense event
  editExpense(properties: ExpenseProperties): void {
    this.eventTrack('Edit Expense', properties);
  }

  // policy correction event
  policyCorrection(properties: PolicyCorrectionProperties): void {
    this.eventTrack('Policy Correction on Expense', properties);
  }

  // add attachment event
  addAttachment(properties: Partial<AddAttachmentProperties>): void {
    this.eventTrack('Add Attachment', properties);
  }

  addMoreFilesClicked(properties = {}): void {
    this.eventTrack('Add More Files Clicked', properties);
  }

  // add view attachment event
  viewAttachment(properties = {}): void {
    this.eventTrack('View Attachment', properties);
  }

  // File upload complete event
  fileUploadComplete(properties = {}): void {
    this.eventTrack('File Upload Complete', properties);
  }

  // File download complete event
  fileDownloadComplete(properties = {}): void {
    this.eventTrack('File Download Complete', properties);
  }

  // Click on delete file icon event
  deleteFileClicked(properties = {}): void {
    this.eventTrack('Delete File Clicked', properties);
  }

  // File deleted event
  fileDeleted(properties = {}): void {
    this.eventTrack('File Deleted', properties);
  }

  // add comment event
  addComment(properties: { view?: string } = {}): void {
    this.eventTrack('Add Comment', properties);
  }

  // view comment event
  viewComment(properties: { view?: string } = {}): void {
    this.eventTrack('View Comment', properties);
  }

  //Actions inside comments and history
  commentsHistoryActions(properties: CommentHistoryActionProperties): void {
    this.eventTrack('Comments and History segment Actions', properties);
  }

  // click Add To Report event
  clickAddToReport(properties = {}): void {
    this.eventTrack('Click Add To Report', properties);
  }

  // click on save and add new expense button
  clickSaveAddNew(properties = {}): void {
    this.eventTrack('Click Save Add New Expense', properties);
  }

  // click on Delete Expense
  clickDeleteExpense(properties: { Type: string }): void {
    this.eventTrack('Click Delete Expense', properties);
  }

  // click on Add to report button
  addToReport(properties: { count?: number } = {}): void {
    this.eventTrack('Add Expenses to report', properties);
  }

  // click on Create Report
  clickCreateReport(properties = {}): void {
    this.eventTrack('Click Create Report', properties);
  }

  /*** Events related to reports ***/
  // click share report
  clickShareReport(properties = {}): void {
    this.eventTrack('Click Share Report', properties);
  }

  // delete report event
  deleteReport(properties = {}): void {
    this.eventTrack('Delete Report', properties);
  }

  // create report event
  createReport(properties: CreateReportProperties): void {
    this.eventTrack('Create Report', properties);
  }

  // Report name change event
  reportNameChange(properties: ReportNameChangeProperties): void {
    this.eventTrack('Report Name Change', properties);
  }

  /*** Events related to help page ***/
  // view help card event
  viewHelpCard(properties = {}): void {
    this.eventTrack('View Help Card', properties);
  }

  // engage with help card event
  engageWithHelpCard(properties = {}): void {
    this.eventTrack('Engage with Help Card', properties);
  }

  /*** Events related to system ***/
  // signout event
  onSignOut(properties = {}): void {
    this.eventTrack('Sign Out', properties);
  }

  /*** Events related to lifecycle ***/
  // email verified event
  emailVerified(properties = {}): void {
    this.eventTrack('Email Verified', properties);
  }

  // activated event
  activated(properties = {}): void {
    this.eventTrack('Activated', properties);
  }

  // when first expense is created
  createFirstExpense(properties = {}): void {
    this.eventTrack('Create First Expense', properties);
  }

  // when first report is created
  createFirstReport(properties: CreateReportProperties): void {
    this.eventTrack('Create First Report', properties);
  }

  // When user submits password and company details form and hits continue.
  setupHalf(properties = {}): void {
    this.eventTrack('Setup Half', properties);
  }

  // When user completes account setup journey
  setupComplete(properties = {}): void {
    this.eventTrack('Setup Complete', properties);
  }

  // When toast message is displayed
  showToastMessage(properties: { ToastContent: string }): void {
    this.eventTrack('Toast message displayed', properties);
  }

  /*** Old events ***/
  // reset password event
  resetPassword(properties = {}): void {
    this.eventTrack('Reset Password', properties);
  }

  // sync error event
  syncError(properties: { label: Error }): void {
    this.eventTrack('Sync Error', properties);
  }

  // capture receipt flow, patch expenses error
  patchExpensesError(properties: { label: Error }): void {
    this.eventTrack('Patch expense error - capture receipt flow', properties);
  }

  checkPolicyError(properties: { label: Error }): void {
    this.eventTrack('Check Policy Error', properties);
  }

  editExpenseError(properties: { label: Error }): void {
    this.eventTrack('Edit Expense Error', properties);
  }

  editMileageError(properties: { label: Error }): void {
    this.eventTrack('Edit Mileage Error', properties);
  }

  editPerDiemError(properties: { label: Error }): void {
    this.eventTrack('Edit Per Diem Error', properties);
  }

  // adding expenses in existing report event
  addToExistingReport(properties = {}): void {
    this.eventTrack('Add Expenses to Report', properties);
  }

  // adding expenses in existing report while add/edit expense event
  addToExistingReportAddEditExpense(properties = {}): void {
    this.eventTrack('Add Expenses to existing report while add/edit expense', properties);
  }

  removeFromExistingReportEditExpense(properties = {}): void {
    this.eventTrack('Remove Expenses from existing report through edit expense', properties);
  }

  onSwitchOrg(properties: SwitchOrgProperties): void {
    this.eventTrack('Switch Org', properties);
  }

  // Corporate Cards section related Events
  unlinkCorporateCardExpense(properties: CorporateCardExpenseProperties): void {
    this.eventTrack('unlink corporate card expense', properties);
  }

  switchedToInstafyleBulkMode(properties = {}): void {
    this.eventTrack('switched to bulk instafyle', properties);
  }

  switchedToInstafyleSingleMode(properties = {}): void {
    this.eventTrack('switched to single instafyle', properties);
  }

  instafyleGalleryUploadOpened(properties = {}): void {
    this.eventTrack('instafyle gallery upload opened', properties);
  }

  flashModeSet(properties: { FlashMode: 'on' | 'off' }): void {
    this.eventTrack('instafyle flash mode set', properties);
  }

  // New Dashboard Actions
  dashboardActionSheetOpened(properties = {}): void {
    this.eventTrack('dashboard action sheet opened', properties);
  }

  dashboardActionSheetButtonClicked(properties: { Action: string }): void {
    this.eventTrack('dashboard action sheet button clicked', properties);
  }

  dashboardOnIncompleteCardExpensesClick(properties = {}): void {
    this.eventTrack('dashboard incomplete corporate card expenses clicked', properties);
  }

  dashboardOnCompleteCardExpensesClick(properties = {}): void {
    this.eventTrack('dashboard complete corporate card expenses clicked', properties);
  }

  //View expenses
  viewExpenseClicked(properties: ExpenseClickProperties): void {
    this.eventTrack('View expense clicked', properties);
  }

  expenseNavClicked(properties: { to: string }): void {
    this.eventTrack('Expense navigation clicked', properties);
  }

  expenseRemovedByApprover(properties = {}): void {
    this.eventTrack('Expense removed from report by approver', properties);
  }

  // Footer
  footerButtonClicked(properties: FooterButtonClickProperties): void {
    this.eventTrack('footer button clicked', properties);
  }

  myExpensesBulkDeleteExpenses(properties: { count?: number } = {}): void {
    this.eventTrack('bulk delete of expenses from my expenses page', properties);
  }

  myExpensesActionSheetAction(properties: { Action: string }): void {
    this.eventTrack('my expenses action sheet action clicked', properties);
  }

  myExpenseActionSheetAddButtonClicked(properties: { Action: string }): void {
    this.eventTrack('my expense action sheet add button clicked', properties);
  }

  myExpensesFilterApplied(properties: { filterLabels: string[] }): void {
    this.eventTrack('my expenses filters applied', properties);
  }

  myReportsFilterApplied(properties: ReportFilters): void {
    this.eventTrack('my reports filters applied', properties);
  }

  myReportsActionSheetAddButtonClicked(properties: { Action: string }): void {
    this.eventTrack('my reports action sheet add button clicked', properties);
  }

  TeamReportsFilterApplied(properties: Partial<TeamReportsFilters>): void {
    this.eventTrack('team reports filters applied', properties);
  }

  showMoreClicked(properties: { source: string }): void {
    this.eventTrack('show more clicked', properties);
  }

  hideMoreClicked(properties: { source: string }): void {
    this.eventTrack('hide more clicked', properties);
  }

  footerSaveAndPrevClicked(properties = {}): void {
    this.eventTrack('save and previous clicked inside footer', properties);
  }

  footerSaveAndNextClicked(properties = {}): void {
    this.eventTrack('save and next clicked inside footer', properties);
  }

  // Tasks
  tasksFiltersApplied(properties = {} as TaskFilters): void {
    this.eventTrack('filters applied in tasks', properties);
  }

  tasksPageOpened(properties = {} as TaskPageOpenProperties): void {
    this.eventTrack('tasks page opened', properties);
  }

  tasksShown(properties = {} as TaskProperties): void {
    this.eventTrack('tasks shown', properties);
  }

  tasksClicked(properties = {} as TaskProperties): void {
    this.eventTrack('tasks clicked', properties);
  }

  tasksFilterClearAllClicked(properties = {} as TaskFilterClearAllProperties): void {
    this.eventTrack('tasks clear all filters clicked', properties);
  }

  tasksFilterPillClicked(properties = {} as FilterPillClickedProperties): void {
    this.eventTrack('tasks clicked on filter pill', properties);
  }

  // Add to Report inside expenses
  openAddToReportModal(properties = {}): void {
    this.eventTrack('Open Add to Report Modal', properties);
  }

  addToReportFromExpense(properties = {}): void {
    this.eventTrack('Add to Report from expense', properties);
  }

  openCreateDraftReportPopover(properties = {}): void {
    this.eventTrack('Open Create Draft Report Popover', properties);
  }

  createDraftReportFromExpense(properties = {}): void {
    this.eventTrack('Create draft report from expense', properties);
  }

  //Reports
  //Open view report info modal
  clickViewReportInfo(properties: { view: ExpenseView }): void {
    this.eventTrack('Open View Report Info', properties);
  }

  //Actions inside view report info modal
  viewReportInfo(properties: ViewReportInfoProperties): void {
    this.eventTrack('View Report Info', properties);
  }

  // Team Advances
  sendBackAdvance(properties = {} as { Asset: string }): void {
    this.eventTrack('Send Back Advance', properties);
  }

  rejectAdvance(properties = {} as { Asset: string }): void {
    this.eventTrack('Reject Advance', properties);
  }

  //Toggle settings
  onSettingsToggle(properties: OnSettingToggleProperties): void {
    this.eventTrack('Toggle Setting', properties);
  }

  //Personal Cards
  personalCardsViewed(properties = {}): void {
    this.eventTrack('Personal cards page opened', properties);
  }

  newCardLinkedOnPersonalCards(properties = {}): void {
    this.eventTrack('New card linked on personal cards', properties);
  }

  cardDeletedOnPersonalCards(properties = {}): void {
    this.eventTrack('Card deleted on personal cards', properties);
  }

  newExpenseCreatedFromPersonalCard(properties = {}): void {
    this.eventTrack('New expense created from personal card transaction', properties);
  }

  oldExpensematchedFromPersonalCard(properties = {}): void {
    this.eventTrack('Expense matched created from personal card transaction', properties);
  }

  transactionsHiddenOnPersonalCards(properties = {}): void {
    this.eventTrack('Transactions hidden on personal cards', properties);
  }

  transactionsFetchedOnPersonalCards(properties = {}): void {
    this.eventTrack('Transactions fetched on perosnal cards', properties);
  }

  cropReceipt(properties = {}): void {
    this.eventTrack('Receipt Cropped', properties);
  }

  saveReceiptWithInvalidForm(properties = {}): void {
    this.eventTrack('Save receipt with invalid form', properties);
  }

  // Merge related trackings
  expensesMerged(properties = {}): void {
    this.eventTrack('Expenses merged successfully', properties);
  }

  duplicateTaskClicked(properties = {}): void {
    this.eventTrack('potential duplicate task clicked from dashboard', properties);
  }

  dismissedDuplicateSet(properties = {}): void {
    this.eventTrack('duplicate set dismissed', properties);
  }

  dismissedIndividualExpenses(properties = {}): void {
    this.eventTrack('individual expense dismissed as not duplicate', properties);
  }

  visitedMergeExpensesPageFromTask(properties = {}): void {
    this.eventTrack('visited merged expense page from tasks', properties);
  }

  // Track app launch time
  appLaunchTime(properties = {} as AppLaunchTimeProperties): void {
    this.eventTrack('app launch time', properties);
  }

  // Track time taken to capture single receipt for the first time
  captureSingleReceiptTime(properties = {} as CaptureSingleReceiptTimeProperties): void {
    this.eventTrack('capture single receipt time', properties);
  }

  autoSubmissionInfoCardClicked(properties = {} as { isSeparateCard: boolean }): void {
    this.eventTrack('Auto Submission Info Card Clicked', properties);
  }

  // Track switch org launch time
  switchOrgLaunchTime(properties = {} as SwitchOrgLaunchTimeProperties): void {
    this.eventTrack('switch org launch time', properties);
  }

  // Track dashboard launch time
  dashboardLaunchTime(properties = {} as { 'Dashboard launch time': string }): void {
    this.eventTrack('dashboard launch time', properties);
  }

  footerHomeTabClicked(properties = {} as { page: string }): void {
    this.eventTrack('Home Tab clicked On Footer', properties);
  }

  footerExpensesTabClicked(): void {
    this.eventTrack('Expenses Tab clicked On Footer');
  }

  footerReportsTabClicked(): void {
    this.eventTrack('Reports Tab clicked On Footer');
  }

  menuButtonClicked(properties = {}): void {
    this.eventTrack('Menu Button Clicked', properties);
  }

  menuItemClicked(properties = {} as { option: string }): void {
    this.eventTrack('Menu Item Clicked', properties);
  }

  receiptLimitReached(properties = {}): void {
    this.eventTrack('Popover shown since receipt limit exceeded', properties);
  }

  updateMobileNumberClicked(properties = {}): void {
    this.eventTrack('Update Mobile Number Clicked', properties);
  }

  updateMobileNumber(): void {
    this.eventTrack('Update Mobile Number');
  }

  verifyMobileNumber(): void {
    this.eventTrack('Verify Mobile Number');
  }

  mobileNumberVerified(properties = {}): void {
    this.eventTrack('Mobile Number Verified', properties);
  }

  smsDeepLinkOpened(properties = {}): void {
    this.eventTrack('SMS Deep Link Opened', properties);
  }

  cardUnenrolled(properties: CardUnenrolledProperties): void {
    this.eventTrack('Card Unenrolled', properties);
  }

  cardEnrolled(properties: CardEnrolledProperties): void {
    this.eventTrack('Card Enrolled', properties);
  }

  cardEnrollmentErrors(properties: CardEnrollmentErrorsProperties): void {
    this.eventTrack('Card Enrollment Errors', properties);
  }

  enrollingNonRTFCard(properties: EnrollingNonRTFCardProperties): void {
    this.eventTrack('Enrolling Non RTF Card', properties);
  }

  showSuggestedDuplicates(): void {
    this.eventTrack('Show Suggested Duplicates');
  }

  spenderSelectedPendingTxnFromMyExpenses(): void {
    this.eventTrack('Spenders select expenses with Pending transactions');
  }

  spenderTriedSplittingExpenseWithPendingTxn(): void {
    this.eventTrack('Spenders Split expenses with Pending transactions');
  }

  commuteDeductionAddLocationClickFromProfile(): void {
    this.eventTrack('Commute Deduction - Add Location Click From Profile');
  }

  commuteDeductionEditLocationClickFromProfile(): void {
    this.eventTrack('Commute Deduction - Edit Location Click From Profile');
  }

  commuteDeductionDetailsEdited(properties: CommuteDetailsResponse): void {
    this.eventTrack('Commute Deduction - Details Edited', properties);
  }

  commuteDeductionAddLocationOptionClicked(): void {
    this.eventTrack('Commute Deduction - Add Location Option Click');
  }

  commuteDeductionTaskClicked(): void {
    this.eventTrack('Commute Deduction - Task Click');
  }

  commuteDeductionDetailsAddedFromProfile(properties: CommuteDetailsResponse): void {
    this.eventTrack('Commute Deduction - Details Added From Profile', properties);
  }

  commuteDeductionDetailsAddedFromSpenderTask(properties: CommuteDetailsResponse): void {
    this.eventTrack('Commute Deduction - Details Added from Spender Task', properties);
  }

  commuteDeductionDetailsAddedFromMileageForm(properties: CommuteDetailsResponse): void {
    this.eventTrack('Commute Deduction - Details Added from Mileage Form', properties);
  }

  commuteDeductionDetailsError(properties: HttpErrorResponse): void {
    this.eventTrack('Commute Deduction - Details Error', properties);
  }

  statsClicked(properties: { event: string }): void {
    this.eventTrack('Dashboard Stats Clicked', properties);
  }

  openOptInDialog(properties): void {
    this.eventTrack('Open Opt In Dialog', properties);
  }

  optInFlowSuccess(properties): void {
    this.eventTrack('Opt In Flow Success', properties);
  }

  optInFlowError(properties): void {
    this.eventTrack('Opt In Flow Error', properties);
  }

  optInFlowRetry(properties): void {
    this.eventTrack('Opt In Flow Retry', properties);
  }

  clickedOnHelpArticle(): void {
    this.eventTrack('Clicked on help article link for Opt-in Dialog');
  }

  skipOptInFlow(): void {
    this.eventTrack('Skip Opt-in');
  }

  clickedOnTask(properties): void {
    this.eventTrack('Clicked On Task', properties);
  }

  clickedOptInFromProfile(): void {
    this.eventTrack('Click On Opt in CTA in Profile page');
  }

  clickedOnEditNumber(): void {
    this.eventTrack('Edit Mobile Number Clicked');
  }

  clickedOnDeleteNumber(): void {
    this.eventTrack('Delete Mobile Number Clicked');
  }

  clickedOnOptOut(): void {
    this.eventTrack('Opt Out Clicked');
  }

  optedOut(): void {
    this.eventTrack('Opted Out');
  }

  deleteMobileNumber(): void {
    this.eventTrack('Delete Mobile Number');
  }

  showOptInModalPostExpenseCreation(): void {
    this.eventTrack('Opt In Modal Post Expense Creation Shown');
  }

  skipOptInModalPostExpenseCreation(): void {
    this.eventTrack('Skip Opt In Modal Post Expense Creation');
  }

  optInFromPostExpenseCreationModal(): void {
    this.eventTrack('Opt In From Post Expense Creation Modal');
  }

  showOptInModalPostCardAdditionInDashboard(): void {
    this.eventTrack('Opt In Modal Post Card Addition Shown in Dashboard');
  }

  skipOptInModalPostCardAdditionInDashboard(): void {
    this.eventTrack('Skip Opt In Modal Post Card Addition in Dashboard');
  }

  optInFromPostPostCardAdditionInDashboard(): void {
    this.eventTrack('Opt In From Post Card Addition in Dashboard');
  }

  showOptInModalPostCardAdditionInSettings(): void {
    this.eventTrack('Opt In Modal Post Card Addition Shown in Settings');
  }

  skipOptInModalPostCardAdditionInSettings(): void {
    this.eventTrack('Skip Opt In Modal Post Card Addition in Settings');
  }

  optInFromPostPostCardAdditionInSettings(): void {
    this.eventTrack('Opt In From Post Card Addition in Settings');
  }

  optedInFromDashboardBanner(): void {
    this.eventTrack('Opted In From Dashboard Banner');
  }

  optedInFromDashboardEmailOptInBanner(): void {
    this.eventTrack('Clicked On Dashboard Email Forwarding Banner');
  }

  skipOptInFromDashboardEmailOptInBanner(): void {
    this.eventTrack('Skip Opt In From Dashboard Email Opt In Banner');
  }

  skipOptInFromDashboardBanner(): void {
    this.eventTrack('Skip Opt In From Dashboard Banner');
  }

  optInClickedFromProfile(): void {
    this.eventTrack('Opt in Clicked From Profile');
  }

  optedInFromProfile(): void {
    this.eventTrack('Opted In From Profile');
  }

  optedInFromTasks(): void {
    this.eventTrack('Opted In From Tasks');
  }

  clickedOnDashboardBanner(): void {
    this.eventTrack('Clicked On Dashboard Banner');
  }

  // Track receipt scan duration event
  receiptScanTime(properties: { duration: number; fileType: string }): void {
    this.eventTrack('Receipt Scan Time', properties);
  }

  receiptScanTimeInstaFyle(properties: { duration: number; fileType: string }): void {
    this.eventTrack('Receipt Scan Time InstaFyle', properties);
  }

  dashboardPendingTasksNotificationClicked(properties = {} as TaskPageOpenProperties): void {
    this.eventTrack('Dashboard Pending Tasks Notification Clicked', properties);
  }

  saveReceiptForLater(): void {
    this.eventTrack('Save receipt for later clicked');
  }

  discardReceipt(): void {
    this.eventTrack('Discard receipt clicked from receipt preview');
  }

  clickedOnZeroStateAddExpense(): void {
    this.eventTrack('Clicked on my expenses zero state CTA');
  }

  clickedOnZeroStateCreateReport(): void {
    this.eventTrack('Clicked on my reports zero state CTA');
  }

  private isDemoAccount(eou: ExtendedOrgUser): boolean {
    const email = eou.us.email.toLowerCase();
    const orgName = eou.ou.org_name.toLowerCase();
    const keywords = ['demo', 'test', 'fyle'];

    return keywords.some((keyword) => email.includes(keyword) || orgName.includes(keyword));
  }
}
