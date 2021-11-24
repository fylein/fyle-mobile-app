import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  identityEmail = null;

  constructor(private authService: AuthService) {}

  get tracking() {
    return (window as any).analytics;
  }

  async updateIdentity() {
    const eou = await this.authService.getEou();
    const email = eou && eou.us && eou.us.email;
    if (email && email !== this.identityEmail) {
      if (this.tracking) {
        this.tracking.identify(email, {
          $email: email,
        });
      }
      this.identityEmail = email;
    }
  }

  async getUserProperties() {
    const properties = {};
    const eou = await this.authService.getEou();
    if (eou && eou.us && eou && eou.ou) {
      properties['User Name'] = eou.us.full_name;
      properties['User Org Name'] = eou.ou.org_name;
      properties['User Org ID'] = eou.ou.org_id;
    }
    return properties;
  }

  async updateIdentityIfNotPresent() {
    if (!this.identityEmail) {
      await this.updateIdentity();
    }
  }

  // deprecated - use updateSegmentProfile
  uploadCtUserProfile(data) {
    this.updateSegmentProfile(data);
  }

  // new function name
  updateSegmentProfile(data) {
    if (this.tracking) {
      this.tracking.identify(data);
    }
  }

  onStateChange(toState, toParams, fromState, fromParams) {}

  eventTrack(action, properties = {}) {
    properties = {
      ...properties,
      Asset: 'Mobile',
    };
    if (this.tracking) {
      this.tracking.track(action, properties);
    }
  }

  // external APIs
  onSignin(email, properties = {}) {
    if (this.tracking) {
      this.tracking.identify(email, {
        $email: email,
      });

      this.identityEmail = email;
    }

    this.eventTrack('Signin', properties);
  }

  onLogout() {}

  /*** Events related to expense ***/

  // create expense event
  async createExpense(properties) {
    // Temporary hack for already logged in users - we need to know their identity
    await this.updateIdentity();
    this.eventTrack('Create Expense', properties);
  }

  bulkAddExpenses(properties) {
    this.eventTrack('Create Bulk Expenses', properties);
  }

  bulkUploadReceipts(properties) {
    this.eventTrack('Upload Bulk Receipts', properties);
  }

  bulkAddMileageExpenses(properties) {
    this.eventTrack('Create Bulk  Mileage Expenses', properties);
  }

  // view expense event
  viewExpense(properties) {
    this.eventTrack('View Expense', properties);
  }

  // delete expense event
  deleteExpense(properties = {}) {
    this.eventTrack('Delete Expense', properties);
  }

  // delete expense event
  bulkDeleteExpenses(properties) {
    this.eventTrack('Bulk Delete Expenses', properties);
  }

  // edit expense event
  editExpense(properties) {
    this.eventTrack('Edit Expense', properties);
  }

  // policy correction event
  policyCorrection(properties) {
    this.eventTrack('Policy Correction on Expense', properties);
  }

  // add attachment event
  addAttachment(properties) {
    this.eventTrack('Add Attachment', properties);
  }

  // add view attachment event
  viewAttachment(properties = {}) {
    this.eventTrack('View Attachment', properties);
  }

  // delete delete attachment event
  deleteAttachment(properties) {
    this.eventTrack('Delete Attachment', properties);
  }

  // add comment event
  addComment(properties = {}) {
    this.eventTrack('Add Comment', properties);
  }

  // view comment event
  viewComment(properties = {}) {
    this.eventTrack('View Comment', properties);
  }

  //Actions inside comments and history
  commentsHistoryActions(properties) {
    this.eventTrack('Comments and History segment Actions', properties);
  }

  // click Add To Report event
  clickAddToReport(properties = {}) {
    this.eventTrack('Click Add To Report', properties);
  }

  // click on save and add new expense button
  clickSaveAddNew(properties = {}) {
    this.eventTrack('Click Save Add New Expense', properties);
  }

  // click on save and create report button
  clickSaveCreateReport(properties) {
    this.eventTrack('Click Save and Create Report', properties);
  }

  // click on save expense button
  clickAddExpense(properties) {
    this.eventTrack('Click Add Expense', properties);
  }

  // click on add custom fields (webapp)
  clickAddCustomFields(properties) {
    this.eventTrack('Click Add Custom Fields', properties);
  }

  // click on add mileage
  clickAddMileage(properties) {
    this.eventTrack('Click Add Mileage', properties);
  }

  // click on Enable & Setup Mileage button
  clickEnableSetupMileage(properties) {
    this.eventTrack('Click Enabled & Setup Mileage', properties);
  }

  // click on Delete Expense
  clickDeleteExpense(properties) {
    this.eventTrack('Click Delete Expense', properties);
  }

  // click on Add Expense to Report
  AddExpenseToReport(properties) {
    this.eventTrack('Add Expense to Report', properties);
  }

  // click on Add to report button
  addToReport(properties = {}) {
    this.eventTrack('Add Expenses to report', properties);
  }

  // click on Create Report
  clickCreateReport(properties = {}) {
    this.eventTrack('Click Create Report', properties);
  }

  // categoryFailure in activity
  categoryFailure(properties) {
    this.eventTrack('Category Failure', properties);
  }

  /*** Events related to reports ***/

  // click download report
  clickDownloadReport(properties) {
    this.eventTrack('Click Download Report', properties);
  }

  // click share report
  clickShareReport(properties = {}) {
    this.eventTrack('Click Share Report', properties);
  }

  // delete report event
  deleteReport(properties = {}) {
    this.eventTrack('Delete Report', properties);
  }

  // create report event
  createReport(properties) {
    this.eventTrack('Create Report', properties);
  }

  createDraftReport(properties) {
    this.eventTrack('Create Draft Report', properties);
  }

  addRecommendedExpenses(properties) {
    this.eventTrack('Add recommended expenses', properties);
  }

  addUnreportedExpensesFromReport(properties) {
    this.eventTrack('Add unreported expenses from report page', properties);
  }

  // click new report event
  clickNewReport(properties) {
    this.eventTrack('Click New Report', properties);
  }

  // click export report event
  exportReport(properties) {
    this.eventTrack('Export Report', properties);
  }

  /*** Events related to Settings ***/

  // update mileage event
  updateMileageSettings(properties) {
    this.eventTrack('Update Mileage Settings', properties);
  }

  // add custom field event
  addCustomField(properties) {
    this.eventTrack('Add Custom Field', properties);
  }

  // invite a friend event
  referral(properties) {
    this.eventTrack('Referral', properties);
  }

  // click invite a friend
  clickReferAFriend(properties) {
    this.eventTrack('Click Refer a Friend', properties);
  }

  // update profile
  updateProfile(properties) {
    this.eventTrack('Update Profile', properties);
  }

  // update projects settings
  updateProjectsSettings(properties) {
    this.eventTrack('Update Projects Settings', properties);
  }

  // update levels settings
  updateLevelsSettings(properties) {
    this.eventTrack('Update Levels Settings', properties);
  }

  // update holidays settings
  updateHolidaysSettings(properties) {
    this.eventTrack('Update Holidays Settings', properties);
  }

  // update departments settings
  updateDepartmentsSettings(properties) {
    this.eventTrack('Update Departments Settings', properties);
  }

  // update custom fields settings
  updateCustomFieldsSettings(properties) {
    this.eventTrack('Update Custom Field Settings', properties);
  }

  // update categories settings
  updateCategoriesSettings(properties) {
    this.eventTrack('Update Categories Settings', properties);
  }

  // update organization settings
  updateOrganizationSettings(properties) {
    this.eventTrack('Update Organization Settings', properties);
  }

  // click add secondary email settings
  clickAddSecondaryEmail(properties) {
    this.eventTrack('Click Add Secondary email', properties);
  }

  /*** Events related to help page ***/

  // view help card event
  viewHelpCard(properties = {}) {
    this.eventTrack('View Help Card', properties);
  }

  // engage with help card event
  engageWithHelpCard(properties = {}) {
    this.eventTrack('Engage with Help Card', properties);
  }

  /*** Events related to system ***/

  // signout event
  onSignOut(properties = {}) {
    this.eventTrack('Sign Out', properties);
  }

  /*** Events related to lifecycle ***/

  // email verified event
  emailVerified(properties = {}) {
    this.eventTrack('Email Verified', properties);
  }

  // persona choosen event
  onChosingPersona(properties) {
    this.eventTrack('Persona Chosen', properties);
  }

  // activated event
  activated(properties = {}) {
    this.eventTrack('Activated', properties);
  }

  // when first expense is created
  createFirstExpense(properties = {}) {
    this.eventTrack('Create First Expense', properties);
  }

  // when first report is created
  createFirstReport(properties) {
    this.eventTrack('Create First Report', properties);
  }

  // When user submits password and company details form and hits continue.
  setupHalf(properties = {}) {
    this.eventTrack('Setup Half', properties);
  }

  // When user completes account setup journey
  setupComplete(properties = {}) {
    this.eventTrack('Setup Complete', properties);
  }

  // When toast message is displayed
  showToastMessage(properties) {
    this.eventTrack('Toast message displayed', properties);
  }

  /*** Old events ***/

  // reset password event
  resetPassword(properties = {}) {
    this.eventTrack('Reset Password', properties);
  }

  // sync error event
  syncError(properties) {
    this.eventTrack('Sync Error', properties);
  }

  // adding expenses in existing report event
  addToExistingReport(properties = {}) {
    this.eventTrack('Add Expenses to Report', properties);
  }

  // adding expenses in existing report while add/edit expense event
  addToExistingReportAddEditExpense(properties = {}) {
    this.eventTrack('Add Expenses to existing report while add/edit expense', properties);
  }

  // moving expense from one report to another while add/edit expense event
  moveToAnotherReportAddEditExpense(properties) {
    this.eventTrack('Move expense from one report to another report while add/edit expense', properties);
  }

  removeFromExistingReportEditExpense(properties = {}) {
    this.eventTrack('Remove Expenses from existing report through edit expense', properties);
  }

  // removing expenses in existing report event
  removeTxnFromReport(properties) {
    this.eventTrack('Remove Expense From Report', properties);
  }

  // click on add expenses to report event
  clickAddExpensesToreport(properties) {
    this.eventTrack('Click Add Expenses to Report', properties);
  }

  // resubmit report event
  resubmitReport(properties) {
    this.eventTrack('Resubmit Report', properties);
  }

  // submit draft report event
  submitDraftReport(properties) {
    this.eventTrack('Submit draft Report', properties);
  }

  // opening more menu popover event
  openMoreMenuPopover(properties) {
    this.eventTrack('More Options', properties);
  }

  // insta fyle enabled
  onEnableInstaFyle(properties) {
    this.eventTrack('Insta Fyle Enabled', properties);
  }

  // insta fyle disabled
  onDisableInstaFyle(properties) {
    this.eventTrack('Insta Fyle Disabled', properties);
  }

  // bulk fyle enabled
  onEnableBulkFyle(properties) {
    this.eventTrack('Bulk Fyle Enabled', properties);
  }

  // bulk fyle disabled
  onDisableBulkFyle(properties) {
    this.eventTrack('Bulk Fyle Disabled', properties);
  }

  // switch to admin toggle
  switchAdmin(properties) {
    this.eventTrack('Switch Admin', properties);
  }

  // switch to user toggle
  switchUser(properties) {
    this.eventTrack('Switch User', properties);
  }

  onSwitchOrg(properties) {
    this.eventTrack('Switch Org', properties);
  }

  // switch to user toggle
  analytics(properties) {
    this.eventTrack('Analytics', properties);
  }

  // when first action is create expense
  firstActionCreateExpense(properties) {
    this.eventTrack('First action - Create expense', properties);
  }

  // When error occurs in getting bulk users upload template
  bulkUsersTemplateError(properties) {
    this.eventTrack('Error in getBulkUsersTemplate', properties);
  }

  // When insert/update occurs using bulk users upload
  bulkUsersUploadInsertUpdate(properties) {
    this.eventTrack('Bulk users insert/update', properties);
  }

  // When insert/update fails on bulk users upload
  bulkUsersUploadInsertUpdateFailure(properties) {
    this.eventTrack('Bulk users insert/update Error', properties);
  }

  // Corporate Cards section related Events

  // When admin sends reminders to users for matching their CCCExpenses
  numberOfCCCMatchRemindersSentAtOnce(properties) {
    this.eventTrack('Number of users sent CCCMatch Reminders at once', properties);
  }

  // When admin cancels the dialog box asking to send reminders for matching
  adminCancelledCCCMatchReminder(properties) {
    this.eventTrack('Admin cancels CCC Match Reminder dialog box', properties);
  }

  // When admin chooses to cutomize the reminder message being sent
  adminCustomizesCCCMatchReminderMessage(properties) {
    this.eventTrack('Admin customizes CCC Match Reminder dialog box', properties);
  }

  /** Matched from Corporate cards page */
  matchedToAnExpense(properties) {
    this.eventTrack('Matched to an Expense', properties);
  }

  /** Unmatch from corporate cards page - auto matched  */
  unMatchAutoMatchedCardTransaction(properties) {
    this.eventTrack('UnMatched an Auto-Matched card transaction', properties);
  }

  /** Changed date filter from employee summary page */
  changeDateFilterEmployeeSummaryCCC(properties) {
    this.eventTrack('Date filter Changed for CCC Reconciliation', properties);
  }

  // common onboarding
  OnboardingDialogOpened(properties) {
    this.eventTrack('OnBoarding Dialog Opened', properties);
  }

  // ccc onboarding
  ccOnboardingNextClicked(properties) {
    this.eventTrack('CCC OnBoarding Next Clicked', properties);
  }

  ccOnboardingDialogCompleted(properties) {
    this.eventTrack('CCC OnBoarding Dialog Completed', properties);
  }

  ccOnboardingDialogClosed(properties) {
    this.eventTrack('CCC OnBoarding Dialog Closed', properties);
  }

  // policy onboarding
  policyOnboardingNextClicked(properties) {
    this.eventTrack('Policy OnBoarding Next Clicked', properties);
  }

  policyOnboardingDialogCompletedDemoSkipped(properties) {
    this.eventTrack('Policy OnBoarding Dialog Completed and Demo Skipped', properties);
  }

  policyOnboardingDialogCompletedDemoStarted(properties) {
    this.eventTrack('Policy OnBoarding Dialog Completed and Demo Started', properties);
  }

  policyOnboardingDialogClosed(properties) {
    this.eventTrack('Policy OnBoarding Dialog Closed', properties);
  }

  // expense field onboarding
  expenseOnboardingNextClicked(properties) {
    this.eventTrack('Expense OnBoarding Next Clicked', properties);
  }

  expenseOnboardingDialogClosed(properties) {
    this.eventTrack('Expense OnBoarding Dialog Closed', properties);
  }

  expenseOnboardingDialogCompleted(properties) {
    this.eventTrack('Expense OnBoarding Dialog Completed', properties);
  }

  // analytics charts interaction
  // Insights Graphs Events
  policiesWithExceptionallyApprovedExpenses(properties) {
    this.eventTrack('Analytics - Policies with exceptionally approved expenses', properties);
  }

  numberOfDaysBookedInAdvanceFlight(properties) {
    this.eventTrack('Analytics - Number Of Days Booked In Advance Flight', properties);
  }

  numberOfDaysBookedInAdvanceHotel(properties) {
    this.eventTrack('Analytics - Number Of Days Booked In Advance Hotel', properties);
  }

  // Trips Graph Events
  tripExpensesBrokenAgainstBookingSourceForFlight(properties) {
    this.eventTrack('Analytics - Type of Booking for Flight', properties);
  }

  tripExpensesBrokenAgainstBookingSourceForHotel(properties) {
    this.eventTrack('Analytics - Type of Booking for Hotel', properties);
  }

  tripExpensesBrokenAgainstBookingSourceForTrain(properties) {
    this.eventTrack('Analytics - Type of Booking for Train', properties);
  }

  // Track sidenav toggle
  onSideNavToggle(properties) {
    this.eventTrack('Toggle sidebar', properties);
  }

  // Track switching to and fro from Beta View
  onSwitch(properties) {
    this.eventTrack('Switch between Beta and Original', properties);
  }

  // Track Manual Reminders from Admin Dashboard
  onManualRemindersSent(properties) {
    this.eventTrack('Manual Reminders Triggered', properties);
  }

  // Track User preferences
  userPreferences(properties) {
    this.eventTrack('User Preferences', properties);
  }

  // tracking events for organization side pages (Old views)
  UIGridRefreshedInOldView(properties) {
    this.eventTrack('UI Grid refreshed in older views', properties);
  }

  primaryCtaClickedInOldView(properties) {
    this.eventTrack('Clicked on primary CTA in older views', properties);
  }

  exportRequestedInOldView(properties) {
    this.eventTrack('Requested export in older views', properties);
  }

  rowItemClickedInOldView(properties) {
    this.eventTrack('Clicked on a row item in older views', properties);
  }

  simpleSearchPerformedInOldView(properties) {
    this.eventTrack('Performed simple search in older views', properties);
  }

  corporateCardsClassifiedRowClicked(properties) {
    this.eventTrack('corporate cards classified row clicked', properties);
  }

  corporateCardsViewExpenseWhileUnmatch(properties) {
    this.eventTrack('corporate cards view expense while unmatch', properties);
  }

  corporateCardsViewExpenseWhileMatch(properties) {
    this.eventTrack('corporate cards view expense while match', properties);
  }

  corporateCardsClickedUnmatchedFromDashboard(properties) {
    this.eventTrack('corporate cards clicked unmatched from dashboard', properties);
  }

  corporateCardsDismissal(properties) {
    this.eventTrack('corporate cards dismissal', properties);
  }

  corporateCardsMarkPersonal(properties) {
    this.eventTrack('corporate cards mark personal', properties);
  }

  corporateCardsClassifiedTabClicked(properties) {
    this.eventTrack('corporate cards classified tab clicked', properties);
  }

  corporateCardsMyExpensesCccReversals(properties) {
    this.eventTrack('corporate cards my expenses ccc reversals', properties);
  }

  corporateCardsUnmatch(properties) {
    this.eventTrack('corporate cards unmatch', properties);
  }

  corporateCardsUndoDismissal(properties) {
    this.eventTrack('corporate cards undo dismissal', properties);
  }

  corporateCardsUnmarkPersonal(properties) {
    this.eventTrack('corporate cards unmark personal', properties);
  }

  corporateCardsMatchConfirmationPopup(properties) {
    this.eventTrack('corporate cards match confirmation popup', properties);
  }

  corporateCardsMatchEditExpense(properties) {
    this.eventTrack('corporate cards match edit expense', properties);
  }

  corporateCardsMatchAddExpense(properties) {
    this.eventTrack('corporate cards match add expense', properties);
  }

  corporateCardsUnMatchEditExpense(properties) {
    this.eventTrack('corporate cards unmatch edit expense', properties);
  }

  corporateCardsOpenedDropdown(properties) {
    this.eventTrack('corporate cards opened dropdown', properties);
  }

  // Instafyle Actions

  instafyleIntroDisabled(properties = {}) {
    this.eventTrack('instafyle intro disabled', properties);
  }

  switchedToInstafyleBulkMode(properties = {}) {
    this.eventTrack('switched to bulk instafyle', properties);
  }

  switchedToInstafyleSingleMode(properties = {}) {
    this.eventTrack('switched to single instafyle', properties);
  }

  instafyleGalleryUploadOpened(properties = {}) {
    this.eventTrack('instafyle gallery upload opened', properties);
  }

  flashModeSet(properties) {
    this.eventTrack('instafyle flash mode set', properties);
  }

  // New Dashboard Actions
  dashboardActionSheetOpened(properties = {}) {
    this.eventTrack('dashboard action sheet opened', properties);
  }

  dashboardActionSheetButtonClicked(properties) {
    this.eventTrack('dashboard action sheet button clicked', properties);
  }

  dashboardOnUnreportedExpensesClick(properties = {}) {
    this.eventTrack('dashboard unreported expenses clicked', properties);
  }

  dashboardOnReportPillClick(properties) {
    this.eventTrack('dashboard report pill clicked', properties);
  }

  dashboardOnCorporateCardClick(properties) {
    this.eventTrack('dashboard corporate card clicked', properties);
  }

  //View expenses
  viewExpenseClicked(properties) {
    this.eventTrack('View expense clicked', properties);
  }

  expenseNavClicked(properties) {
    this.eventTrack('Expense navigation clicked', properties);
  }

  expenseFlagUnflagClicked(properties) {
    this.eventTrack('Expense flagged or unflagged', properties);
  }

  expenseRemovedByApprover(properties = {}) {
    this.eventTrack('Expense removed from report by approver', properties);
  }

  // Footer
  footerButtonClicked(properties) {
    this.eventTrack('footer button clicked', properties);
  }

  myExpensesBulkDeleteExpenses(properties = {}) {
    this.eventTrack('bulk delete of expenses from my expenses page', properties);
  }

  myExpensesActionSheetAction(properties) {
    this.eventTrack('my expenses action sheet action clicked', properties);
  }

  myExpensesFilterApplied(properties) {
    this.eventTrack('my expenses filters applied', properties);
  }

  myReportsFilterApplied(properties) {
    this.eventTrack('my reports filters applied', properties);
  }

  TeamReportsFilterApplied(properties) {
    this.eventTrack('team reports filters applied', properties);
  }

  // Duplicates
  async duplicateDetectionAlertShown(properties: {}) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('Duplicate Detection User Alert Shown', properties);
  }

  async duplicateDetectionUserActionExpand(properties: {}) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('Duplicate Detection User Action Expand', properties);
  }

  async duplicateDetectionUserActionCollapse(properties: {}) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('Duplicate Detection User Action Collapse', properties);
  }

  showMoreClicked(properties) {
    this.eventTrack('show more clicked', properties);
  }

  hideMoreClicked(properties) {
    this.eventTrack('hide more clicked', properties);
  }

  footerSaveAndPrevClicked(properties = {}) {
    this.eventTrack('save and previous clicked inside footer', properties);
  }

  footerSaveAndNextClicked(properties = {}) {
    this.eventTrack('save and next clicked inside footer', properties);
  }

  // Tasks
  async tasksFiltersApplied(properties = {}) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('filters applied in tasks', properties);
  }

  async tasksPageOpened(properties = {}) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('tasks page opened', properties);
  }

  async tasksShown(properties = {}) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('tasks shown', properties);
  }

  async tasksClicked(properties = {}) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('tasks clicked', properties);
  }

  async tasksFilterClearAllClicked(properties = {}) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('tasks clear all filters clicked', properties);
  }

  async tasksFilterPillClicked(properties = {}) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('tasks clicked on filter pill', properties);
  }

  async tasksFilterPillRemoveClicked(properties = {}) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('tasks clicked on remove filter pill', properties);
  }

  // Add to Report inside expenses
  openAddToReportModal(properties = {}) {
    this.eventTrack('Open Add to Report Modal', properties);
  }

  addToReportFromExpense(properties = {}) {
    this.eventTrack('Add to Report from expense', properties);
  }

  openCreateDraftReportPopover(properties = {}) {
    this.eventTrack('Open Create Draft Report Popover', properties);
  }

  createDraftReportFromExpense(properties = {}) {
    this.eventTrack('Create draft report from expense', properties);
  }

  //Reports
  //Open view report info modal
  clickViewReportInfo(properties) {
    this.eventTrack('Open View Report Info', properties);
  }

  //Actions inside view report info modal
  viewReportInfo(properties) {
    this.eventTrack('View Report Info', properties);
  }

  // Team Advances
  async sendBackAdvance(properties = {}) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('Send Back Advance', properties);
  }

  async rejectAdvance(properties = {}) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('Reject Advance', properties);
  }

  //Toggle settings
  onSettingsToggle(properties) {
    this.eventTrack('Toggle Setting', properties);
  }
}
