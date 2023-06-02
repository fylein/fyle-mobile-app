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
} from '../models/tracking-properties.model';
import { ExpenseView } from '../models/expense-view.enum';
import { Filters } from 'src/app/fyle/my-expenses/my-expenses-filters.model';
import { TaskFilters } from '../models/task-filters.model';
import { OrgCategory } from '../models/v1/org-category.model';
import { StringChain } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  identityEmail = null;

  constructor(private authService: AuthService, private deviceService: DeviceService) {}

  get tracking(): TrackingMethods {
    return (window as typeof window & { analytics: TrackingMethods }).analytics;
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

  async getUserProperties(): Promise<IdentifyProperties> {
    const properties: IdentifyProperties = {};
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

  // new function name
  updateSegmentProfile(data: IdentifyProperties) {
    if (this.tracking) {
      this.tracking.identify(data);
    }
  }

  eventTrack<T>(action: string, properties = {} as T) {
    this.deviceService.getDeviceInfo().subscribe((deviceInfo) => {
      properties = {
        ...properties,
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
  onSignin(email: string, properties: { label?: string } = {}) {
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
  async createExpense(properties: ExpenseProperties) {
    // Temporary hack for already logged in users - we need to know their identity
    await this.updateIdentity();
    this.eventTrack('Create Expense', properties);
  }

  splittingExpense(properties: SplittingExpenseProperties) {
    this.eventTrack('Splitting Expense', properties);
  }

  // view expense event
  viewExpense(properties: { Type: string }) {
    this.eventTrack('View Expense', properties);
  }

  // delete expense event
  deleteExpense(properties: { Type?: string } = {}) {
    this.eventTrack('Delete Expense', properties);
  }

  // edit expense event
  editExpense(properties: ExpenseProperties) {
    this.eventTrack('Edit Expense', properties);
  }

  // policy correction event
  policyCorrection(properties: PolicyCorrectionProperties) {
    this.eventTrack('Policy Correction on Expense', properties);
  }

  // add attachment event
  addAttachment(properties: Partial<AddAttachmentProperties>) {
    this.eventTrack('Add Attachment', properties);
  }

  // add view attachment event
  viewAttachment(properties = {}) {
    this.eventTrack('View Attachment', properties);
  }

  // add comment event
  addComment(properties: { view?: string } = {}) {
    this.eventTrack('Add Comment', properties);
  }

  // view comment event
  viewComment(properties: { view?: string } = {}) {
    this.eventTrack('View Comment', properties);
  }

  //Actions inside comments and history
  commentsHistoryActions(properties: CommentHistoryActionProperties) {
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

  // click on Delete Expense
  clickDeleteExpense(properties: { Type: string }) {
    this.eventTrack('Click Delete Expense', properties);
  }

  // click on Add to report button
  addToReport(properties: { count?: number } = {}) {
    this.eventTrack('Add Expenses to report', properties);
  }

  // click on Create Report
  clickCreateReport(properties = {}) {
    this.eventTrack('Click Create Report', properties);
  }

  /*** Events related to reports ***/
  // click share report
  clickShareReport(properties = {}) {
    this.eventTrack('Click Share Report', properties);
  }

  // delete report event
  deleteReport(properties = {}) {
    this.eventTrack('Delete Report', properties);
  }

  // create report event
  createReport(properties: CreateReportProperties) {
    this.eventTrack('Create Report', properties);
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

  // activated event
  activated(properties = {}) {
    this.eventTrack('Activated', properties);
  }

  // when first expense is created
  createFirstExpense(properties = {}) {
    this.eventTrack('Create First Expense', properties);
  }

  // when first report is created
  createFirstReport(properties: CreateReportProperties) {
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
  showToastMessage(properties: { ToastContent: string }) {
    this.eventTrack('Toast message displayed', properties);
  }

  /*** Old events ***/
  // reset password event
  resetPassword(properties = {}) {
    this.eventTrack('Reset Password', properties);
  }

  // sync error event
  syncError(properties: { label: Error }) {
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

  removeFromExistingReportEditExpense(properties = {}) {
    this.eventTrack('Remove Expenses from existing report through edit expense', properties);
  }

  onSwitchOrg(properties: SwitchOrgProperties) {
    this.eventTrack('Switch Org', properties);
  }

  // Corporate Cards section related Events
  unlinkCorporateCardExpense(properties: CorporateCardExpenseProperties) {
    this.eventTrack('unlink corporate card expense', properties);
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

  flashModeSet(properties: { FlashMode: 'on' | 'off' }) {
    this.eventTrack('instafyle flash mode set', properties);
  }

  // New Dashboard Actions
  dashboardActionSheetOpened(properties = {}) {
    this.eventTrack('dashboard action sheet opened', properties);
  }

  dashboardActionSheetButtonClicked(properties: { Action: string }) {
    this.eventTrack('dashboard action sheet button clicked', properties);
  }

  dashboardOnUnreportedExpensesClick(properties = {}) {
    this.eventTrack('dashboard unreported expenses clicked', properties);
  }

  dashboardOnIncompleteExpensesClick(properties = {}) {
    this.eventTrack('dashboard incomplete expenses clicked', properties);
  }

  dashboardOnIncompleteCardExpensesClick(properties = {}) {
    this.eventTrack('dashboard incomplete corporate card expenses clicked', properties);
  }

  dashboardOnTotalCardExpensesClick(properties = {}) {
    this.eventTrack('dashboard total corporate card expenses clicked', properties);
  }

  dashboardOnReportPillClick(properties: { State: string }) {
    this.eventTrack('dashboard report pill clicked', properties);
  }

  //View expenses
  viewExpenseClicked(properties: ExpenseClickProperties) {
    this.eventTrack('View expense clicked', properties);
  }

  expenseNavClicked(properties: { to: string }) {
    this.eventTrack('Expense navigation clicked', properties);
  }

  expenseFlagUnflagClicked(properties: { action: string }) {
    this.eventTrack('Expense flagged or unflagged', properties);
  }

  expenseRemovedByApprover(properties = {}) {
    this.eventTrack('Expense removed from report by approver', properties);
  }

  // Footer
  footerButtonClicked(properties: FooterButtonClickProperties) {
    this.eventTrack('footer button clicked', properties);
  }

  myExpensesBulkDeleteExpenses(properties: { count?: number } = {}) {
    this.eventTrack('bulk delete of expenses from my expenses page', properties);
  }

  myExpensesActionSheetAction(properties: { Action: string }) {
    this.eventTrack('my expenses action sheet action clicked', properties);
  }

  myExpensesFilterApplied(properties: Filters) {
    this.eventTrack('my expenses filters applied', properties);
  }

  myReportsFilterApplied(properties: Filters) {
    this.eventTrack('my reports filters applied', properties);
  }

  TeamReportsFilterApplied(properties: Filters) {
    this.eventTrack('team reports filters applied', properties);
  }

  showMoreClicked(properties: { source: string }) {
    this.eventTrack('show more clicked', properties);
  }

  hideMoreClicked(properties: { source: string }) {
    this.eventTrack('hide more clicked', properties);
  }

  footerSaveAndPrevClicked(properties = {}) {
    this.eventTrack('save and previous clicked inside footer', properties);
  }

  footerSaveAndNextClicked(properties = {}) {
    this.eventTrack('save and next clicked inside footer', properties);
  }

  // Tasks
  async tasksFiltersApplied(properties = {} as TaskFilters) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('filters applied in tasks', properties);
  }

  async tasksPageOpened(properties = {} as TaskPageOpenProperties) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('tasks page opened', properties);
  }

  async tasksShown(properties = {} as TaskProperties) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('tasks shown', properties);
  }

  async tasksClicked(properties = {} as TaskProperties) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('tasks clicked', properties);
  }

  async tasksFilterClearAllClicked(properties = {} as TaskFilterClearAllProperties) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('tasks clear all filters clicked', properties);
  }

  async tasksFilterPillClicked(properties = {} as FilterPillClickedProperties) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('tasks clicked on filter pill', properties);
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
  clickViewReportInfo(properties: { view: ExpenseView }) {
    this.eventTrack('Open View Report Info', properties);
  }

  //Actions inside view report info modal
  viewReportInfo(properties: ViewReportInfoProperties) {
    this.eventTrack('View Report Info', properties);
  }

  // Team Advances
  async sendBackAdvance(properties = {} as { Asset: string }) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('Send Back Advance', properties);
  }

  async rejectAdvance(properties = {} as { Asset: string }) {
    Object.assign(properties, await this.getUserProperties());
    this.eventTrack('Reject Advance', properties);
  }

  //Toggle settings
  onSettingsToggle(properties: OnSettingToggleProperties) {
    this.eventTrack('Toggle Setting', properties);
  }

  //Personal Cards
  personalCardsViewed(properties = {}) {
    this.eventTrack('Personal cards page opened', properties);
  }

  newCardLinkedOnPersonalCards(properties = {}) {
    this.eventTrack('New card linked on personal cards', properties);
  }

  cardDeletedOnPersonalCards(properties = {}) {
    this.eventTrack('Card deleted on personal cards', properties);
  }

  newExpenseCreatedFromPersonalCard(properties = {}) {
    this.eventTrack('New expense created from personal card transaction', properties);
  }

  oldExpensematchedFromPersonalCard(properties = {}) {
    this.eventTrack('Expense matched created from personal card transaction', properties);
  }

  unmatchedExpensesFromPersonalCard(properties = {}) {
    this.eventTrack('Expense matched created from personal card transaction', properties);
  }

  transactionsHiddenOnPersonalCards(properties = {}) {
    this.eventTrack('Transactions hidden on personal cards', properties);
  }

  transactionsFetchedOnPersonalCards(properties = {}) {
    this.eventTrack('Transactions fetched on perosnal cards', properties);
  }

  cropReceipt(properties = {}) {
    this.eventTrack('Receipt Cropped', properties);
  }

  saveReceiptWithInvalidForm(properties = {}) {
    this.eventTrack('Save receipt with invalid form', properties);
  }

  // Merge related trackings
  expensesMerged(properties = {}) {
    this.eventTrack('Expenses merged successfully', properties);
  }

  duplicateTaskClicked(properties = {}) {
    this.eventTrack('potential duplicate task clicked from dashboard', properties);
  }

  dismissedDuplicateSet(properties = {}) {
    this.eventTrack('duplicate set dismissed', properties);
  }

  dismissedIndividualExpenses(properties = {}) {
    this.eventTrack('individual expense dismissed as not duplicate', properties);
  }

  visitedMergeExpensesPageFromTask(properties = {}) {
    this.eventTrack('visited merged expense page from tasks', properties);
  }

  // Track app launch time
  appLaunchTime(properties = {} as AppLaunchTimeProperties) {
    this.eventTrack('app launch time', properties);
  }

  // Track time taken to capture single receipt for the first time
  captureSingleReceiptTime(properties = {} as CaptureSingleReceiptTimeProperties) {
    this.eventTrack('capture single receipt time', properties);
  }

  autoSubmissionInfoCardClicked(properties = {} as { isSeparateCard: boolean }) {
    this.eventTrack('Auto Submission Info Card Clicked', properties);
  }

  // Track switch org launch time
  switchOrgLaunchTime(properties = {} as SwitchOrgLaunchTimeProperties) {
    this.eventTrack('switch org launch time', properties);
  }

  // Track dashboard launch time
  dashboardLaunchTime(properties = {} as { 'Dashboard launch time': string }) {
    this.eventTrack('dashboard launch time', properties);
  }

  footerHomeTabClicked(properties = {} as { page: string }) {
    this.eventTrack('Home Tab clicked On Footer', properties);
  }

  menuButtonClicked(properties = {}) {
    this.eventTrack('Menu Button Clicked', properties);
  }

  menuItemClicked(properties = {} as { option: string }) {
    this.eventTrack('Menu Item Clicked', properties);
  }

  setCategoryFromVendor(properties = {} as OrgCategory) {
    this.eventTrack('Category Updated By Vendor', properties);
  }

  receiptLimitReached(properties = {}) {
    this.eventTrack('Popover shown since receipt limit exceeded', properties);
  }
}
