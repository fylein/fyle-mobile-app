import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DeviceService } from '../../core/services/device.service';
import { environment } from 'src/environments/environment';
import {
  ExpenseProperties,
  IdentifyProperties,
  SplittingExpenseProperties,
  TrackingMethods,
  PolicyCorrectionProperties,
  AddAttachmentProperties,
  CommentHistoryActionProperties,
  CreateReportProperties,
  SwitchOrgProperties,
  CorporateCardExpenseProperties,
  ExpenseClickProperties,
  FooterButtonClickProperties,
  TaskPageOpenProperties,
  TaskProperties,
  TaskFilterClearAllProperties,
  FilterPillClickedProperties,
  ViewReportInfoProperties,
  OnSettingToggleProperties,
  AppLaunchTimeProperties,
  CaptureSingleReceiptTimeProperties,
  SwitchOrgLaunchTimeProperties,
  ReportNameChangeProperties,
  CardEnrolledProperties,
  CardEnrollmentErrorsProperties,
  CardUnenrolledProperties,
  EnrollingNonRTFCardProperties,
} from '../models/tracking-properties.model';
import { ExpenseView } from '../models/expense-view.enum';
import { ExpenseFilters } from 'src/app/fyle/my-expenses/expense-filters.model';
import { ReportFilters } from 'src/app/fyle/my-expenses/my-expenses-filters.model';
import { TaskFilters } from '../models/task-filters.model';
import { OrgCategory } from '../models/v1/org-category.model';
import { TeamReportsFilters } from '../models/team-reports-filters.model';
import { forkJoin, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  identityEmail = null;

  constructor(private authService: AuthService, private deviceService: DeviceService) {}

  get tracking(): TrackingMethods {
    return (window as typeof window & { analytics: TrackingMethods }).analytics;
  }

  async updateIdentity(): Promise<void> {
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

  async getUserProperties(): Promise<IdentifyProperties> {
    const properties: IdentifyProperties = {};
    try {
      const eou = await this.authService.getEou();
      if (eou && eou.us && eou && eou.ou) {
        properties['User Name'] = eou.us.full_name;
        properties['User Org Name'] = eou.ou.org_name;
        properties['User Org ID'] = eou.ou.org_id;
      }
    } catch (error) {}
    return properties;
  }

  async updateIdentityIfNotPresent(): Promise<void> {
    if (!this.identityEmail) {
      await this.updateIdentity();
    }
  }

  // new function name
  updateSegmentProfile(data: IdentifyProperties): void {
    if (this.tracking) {
      this.tracking.identify(data);
    }
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
      };

      if (this.tracking) {
        this.tracking.track(action, properties);
      }
    });
  }

  // external APIs
  onSignin(email: string, properties: { label?: string } = {}): void {
    if (this.tracking) {
      this.tracking.identify(email, {
        $email: email,
      });

      this.identityEmail = email;
    }

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

  // add view attachment event
  viewAttachment(properties = {}): void {
    this.eventTrack('View Attachment', properties);
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

  dashboardOnUnreportedExpensesClick(properties = {}): void {
    this.eventTrack('dashboard unreported expenses clicked', properties);
  }

  dashboardOnIncompleteExpensesClick(properties = {}): void {
    this.eventTrack('dashboard incomplete expenses clicked', properties);
  }

  dashboardOnIncompleteCardExpensesClick(properties = {}): void {
    this.eventTrack('dashboard incomplete corporate card expenses clicked', properties);
  }

  dashboardOnTotalCardExpensesClick(properties = {}): void {
    this.eventTrack('dashboard total corporate card expenses clicked', properties);
  }

  dashboardOnReportPillClick(properties: { State: string }): void {
    this.eventTrack('dashboard report pill clicked', properties);
  }

  //View expenses
  viewExpenseClicked(properties: ExpenseClickProperties): void {
    this.eventTrack('View expense clicked', properties);
  }

  expenseNavClicked(properties: { to: string }): void {
    this.eventTrack('Expense navigation clicked', properties);
  }

  expenseFlagUnflagClicked(properties: { action: string }): void {
    this.eventTrack('Expense flagged or unflagged', properties);
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

  myExpensesFilterApplied(properties: Partial<ExpenseFilters>): void {
    this.eventTrack('my expenses filters applied', properties);
  }

  myReportsFilterApplied(properties: ReportFilters): void {
    this.eventTrack('my reports filters applied', properties);
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

  unmatchedExpensesFromPersonalCard(properties = {}): void {
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

  menuButtonClicked(properties = {}): void {
    this.eventTrack('Menu Button Clicked', properties);
  }

  menuItemClicked(properties = {} as { option: string }): void {
    this.eventTrack('Menu Item Clicked', properties);
  }

  setCategoryFromVendor(properties = {} as OrgCategory): void {
    this.eventTrack('Category Updated By Vendor', properties);
  }

  receiptLimitReached(properties = {}): void {
    this.eventTrack('Popover shown since receipt limit exceeded', properties);
  }

  updateMobileNumber(properties = {}): void {
    this.eventTrack('Update Mobile Number', properties);
  }

  verifyMobileNumber(): void {
    this.eventTrack('Verify Mobile Number');
  }

  mobileNumberVerified(): void {
    this.eventTrack('Mobile Number Verified');
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
}
