import { CostCentersService } from 'src/app/core/services/cost-centers.service';
import { Component } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { isEmpty, isNumber } from 'lodash';
import * as dayjs from 'dayjs';
import { combineLatest, forkJoin, from, iif, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, finalize, map, switchMap } from 'rxjs/operators';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { DateService } from 'src/app/core/services/date.service';
import { SplitExpenseService } from 'src/app/core/services/split-expense.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { SplitExpensePolicyViolationComponent } from 'src/app/shared/components/split-expense-policy-violation/split-expense-policy-violation.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { OrgCategory, OrgCategoryListItem } from 'src/app/core/models/v1/org-category.model';
import { PolicyViolation } from 'src/app/core/models/policy-violation.model';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { CustomInput } from 'src/app/core/models/custom-input.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { ExpenseFieldsObj } from 'src/app/core/models/v1/expense-fields-obj.model';
import { CostCenter, CostCenters } from 'src/app/core/models/v1/cost-center.model';
import { Transaction } from 'src/app/core/models/v1/transaction.model';
import { MatchedCCCTransaction } from 'src/app/core/models/matchedCCCTransaction.model';
import { SplitExpense } from 'src/app/core/models/split-expense.model';
import { CurrencyObj } from 'src/app/core/models/currency-obj.model';
import { SplitExpenseForm } from 'src/app/core/models/split-expense-form.model';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import { ProjectV2 } from 'src/app/core/models/v2/project-v2.model';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { SplitExpensePolicy } from 'src/app/core/models/platform/v1/split-expense-policy.model';
import { SplitExpenseMissingFields } from 'src/app/core/models/platform/v1/split-expense-missing-fields.model';
import { TransformedSplitExpenseMissingFields } from 'src/app/core/models/transformed-split-expense-missing-fields.model';
import { SplitExpenseViolationsPopup } from 'src/app/core/models/split-expense-violations-popup.model';
import { TimezoneService } from 'src/app/core/services/timezone.service';
import { TxnCustomProperties } from 'src/app/core/models/txn-custom-properties.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { Expense as PlatformExpense } from 'src/app/core/models/platform/v1/expense.model';
import { PlatformFile } from 'src/app/core/models/platform/platform-file.model';
import { SplittingExpenseProperties } from 'src/app/core/models/splitting-expense-properties.model';

@Component({
  selector: 'app-split-expense',
  templateUrl: './split-expense.page.html',
  styleUrls: ['./split-expense.page.scss'],
})
export class SplitExpensePage {
  splitExpensesFormArray = new UntypedFormArray([]);

  fg: UntypedFormGroup;

  splitType: string;

  txnFields: Partial<ExpenseFieldsObj>;

  amount: number;

  currency: string;

  totalSplitAmount: number;

  remainingAmount: number;

  categories$: Observable<OrgCategoryListItem[]>;

  costCenters$: Observable<CostCenters[]>;

  isCorporateCardsEnabled$: Observable<boolean>;

  isProjectCategoryRestrictionsEnabled$: Observable<boolean>;

  transaction: Transaction;

  fileObjs: FileObject[];

  fileUrls: FileObject[];

  maxDate: string;

  minDate: string;

  selectedCCCTransaction: MatchedCCCTransaction;

  saveSplitExpenseLoading: boolean;

  errorMessage: string;

  showErrorBlock: boolean;

  reportId: string;

  splitExpenseTxn: Transaction[];

  completeTxnIds: string[];

  categoryList: OrgCategory[];

  dependentCustomProperties$: Observable<Partial<CustomInput>[]>;

  selectedProject: ProjectV2;

  expenseFields: ExpenseField[];

  formattedSplitExpense: Transaction[];

  unspecifiedCategory: OrgCategory = null;

  splitExpenseHeader: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private categoriesService: CategoriesService,
    private dateService: DateService,
    private splitExpenseService: SplitExpenseService,
    private currencyService: CurrencyService,
    private navController: NavController,
    private router: Router,
    private transactionsOutboxService: TransactionsOutboxService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private trackingService: TrackingService,
    private policyService: PolicyService,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private costCentersService: CostCentersService,
    private orgUserSettingsService: OrgUserSettingsService,
    private orgSettingsService: OrgSettingsService,
    private dependentFieldsService: DependentFieldsService,
    private launchDarklyService: LaunchDarklyService,
    private projectsService: ProjectsService,
    private timezoneService: TimezoneService,
    private expensesService: ExpensesService
  ) {}

  goBack(): void {
    this.navController.back();
  }

  onChangeAmount(splitExpenseForm: SplitExpenseForm, index: number): void {
    if (!splitExpenseForm.controls.amount._pendingChange || !this.amount || !isNumber(splitExpenseForm.value.amount)) {
      return;
    }

    if (this.splitExpensesFormArray.length === 2) {
      const otherIndex = index === 0 ? 1 : 0;
      const otherSplitExpenseForm = this.splitExpensesFormArray.at(otherIndex);

      const rawAmount = this.amount - splitExpenseForm.value.amount;
      const amount = parseFloat(rawAmount.toFixed(3));

      const percentage = parseFloat(((amount / this.amount) * 100).toFixed(3));

      otherSplitExpenseForm.patchValue(
        {
          amount,
          percentage,
        },
        { emitEvent: false }
      );
    }

    let percentage = (splitExpenseForm.value.amount / this.amount) * 100;
    percentage = parseFloat(percentage.toFixed(3));

    splitExpenseForm.patchValue({
      percentage,
    });

    this.getTotalSplitAmount();
  }

  onChangePercentage(splitExpenseForm: SplitExpenseForm, index: number): void {
    if (
      !splitExpenseForm.controls.percentage._pendingChange ||
      !this.amount ||
      !isNumber(splitExpenseForm.value.percentage)
    ) {
      return;
    }

    if (this.splitExpensesFormArray.length === 2) {
      const otherIndex = index === 0 ? 1 : 0;
      const otherSplitExpenseForm = this.splitExpensesFormArray.at(otherIndex);

      const percentage = Math.min(100, Math.max(0, 100 - splitExpenseForm.value.percentage));

      const rawAmount = (this.amount * percentage) / 100;
      const amount = parseFloat(rawAmount.toFixed(3));

      otherSplitExpenseForm.patchValue(
        {
          amount,
          percentage,
        },
        { emitEvent: false }
      );
    }

    let amount = (this.amount * splitExpenseForm.value.percentage) / 100;
    amount = parseFloat(amount.toFixed(3));

    splitExpenseForm.patchValue({
      amount,
    });
    this.getTotalSplitAmount();
  }

  getTotalSplitAmount(): void {
    if ((this.splitExpensesFormArray.value as SplitExpense[]).length > 1) {
      const amounts = (this.splitExpensesFormArray.value as SplitExpense[]).map(
        (obj: { amount: number }) => obj.amount
      );

      const totalSplitAmount = amounts.reduce((acc, curr) => acc + curr);

      this.totalSplitAmount = parseFloat(totalSplitAmount.toFixed(3)) || 0;
      const remainingAmount = this.amount - this.totalSplitAmount;
      this.remainingAmount = parseFloat(remainingAmount.toFixed(3)) || 0;
    }
  }

  setUpSplitExpenseBillable(splitExpense: SplitExpense): boolean {
    if (splitExpense.project && this.txnFields && this.txnFields.billable) {
      return !!this.txnFields.billable.default_value;
    }
    return this.transaction.billable;
  }

  setUpSplitExpenseTax(splitExpense: SplitExpense): number {
    if (this.transaction.tax_amount && this.transaction.amount) {
      return (this.transaction.tax_amount * splitExpense.percentage) / 100;
    } else {
      return this.transaction.tax_amount;
    }
  }

  setTransactionDate(splitExpenseValue: SplitExpense, offset: string): Date {
    let txnDate: Date;

    if (splitExpenseValue.txn_dt) {
      txnDate = this.dateService.getUTCDate(new Date(splitExpenseValue.txn_dt));
    } else if (this.transaction.txn_dt) {
      txnDate = this.dateService.getUTCDate(new Date(this.transaction.txn_dt));
    } else {
      txnDate = this.dateService.getUTCDate(new Date());
    }

    txnDate.setHours(12);
    txnDate.setMinutes(0);
    txnDate.setSeconds(0);
    txnDate.setMilliseconds(0);
    txnDate = this.timezoneService.convertToUtc(txnDate, offset);

    return txnDate;
  }

  correctDates(transaction: Transaction, offset: string): void {
    // setting from_date and to_date time to T10:00:00:000 in local time zone
    if (transaction.from_dt) {
      transaction.from_dt.setHours(12);
      transaction.from_dt.setMinutes(0);
      transaction.from_dt.setSeconds(0);
      transaction.from_dt.setMilliseconds(0);
      transaction.from_dt = this.timezoneService.convertToUtc(transaction.from_dt, offset);
    }

    if (transaction.to_dt) {
      transaction.to_dt.setHours(12);
      transaction.to_dt.setMinutes(0);
      transaction.to_dt.setSeconds(0);
      transaction.to_dt.setMilliseconds(0);
      transaction.to_dt = this.timezoneService.convertToUtc(transaction.to_dt, offset);
    }
  }

  generateSplitEtxnFromFg(splitExpenseValue: SplitExpense): Observable<Transaction> {
    // Fixing the date format here as the transaction object date is a string
    this.transaction.from_dt =
      this.transaction.from_dt && this.dateService.getUTCDate(new Date(this.transaction.from_dt));
    this.transaction.to_dt = this.transaction.to_dt && this.dateService.getUTCDate(new Date(this.transaction.to_dt));

    return forkJoin({
      dependentCustomProperties: this.dependentCustomProperties$,
      orgUserSettings: this.orgUserSettingsService.get(),
    }).pipe(
      concatMap(({ dependentCustomProperties, orgUserSettings }) => {
        let txnCustomProperties = this.transaction.custom_properties;
        const offset = orgUserSettings.locale.offset;

        const isDifferentProject =
          this.splitType === 'projects' && splitExpenseValue.project?.project_id !== this.transaction.project_id;
        const isDifferentCostCenter =
          this.splitType === 'cost centers' && splitExpenseValue.cost_center?.id !== this.transaction.cost_center_id;

        //If selected project/cost center is not same as the original expense, then remove dependent fields from source expense.
        if (isDifferentProject || isDifferentCostCenter) {
          txnCustomProperties = this.transaction.custom_properties.filter(
            (customProperty) => !dependentCustomProperties?.includes(customProperty)
          );
        }

        this.correctDates(this.transaction, offset);

        return of({
          ...this.transaction,
          org_category_id: splitExpenseValue.category && splitExpenseValue.category.id,
          project_id: splitExpenseValue.project && splitExpenseValue.project.project_id,
          cost_center_id: splitExpenseValue.cost_center && splitExpenseValue.cost_center.id,
          currency: splitExpenseValue.currency,
          amount: splitExpenseValue.amount,
          source: 'MOBILE',
          billable: this.setUpSplitExpenseBillable(splitExpenseValue),
          tax_amount: this.setUpSplitExpenseTax(splitExpenseValue),
          txn_dt: this.setTransactionDate(splitExpenseValue, offset),
          custom_properties: this.timezoneService.convertAllDatesToProperLocale(
            txnCustomProperties,
            offset
          ) as TxnCustomProperties[],
        });
      })
    );
  }

  uploadNewFiles(files: FileObject[]): Observable<FileObject[]> {
    const fileObjs: Observable<FileObject>[] = [];
    files.forEach((file) => {
      if (
        file.type &&
        (file.type.indexOf('image') > -1 ||
          file.type.indexOf('jpeg') > -1 ||
          file.type.indexOf('jpg') > -1 ||
          file.type.indexOf('png') > -1)
      ) {
        file.type = 'image';
      } else if (file.type && file.type.indexOf('pdf') > -1) {
        file.type = 'pdf';
      }
      fileObjs.push(from(this.transactionsOutboxService.fileUpload(file.url, file.type)));
    });

    return iif(() => fileObjs.length !== 0, forkJoin(fileObjs), of(null));
  }

  uploadFiles(files: FileObject[]): Observable<FileObject[]> {
    if (!this.transaction.id) {
      return this.uploadNewFiles(files).pipe(
        map((files) => {
          this.fileObjs = files;
          return this.fileObjs;
        })
      );
    } else {
      return this.getAttachedFiles(this.transaction.id);
    }
  }

  getCategoryList(): void {
    this.categories$.subscribe((categories) => {
      this.categoryList = categories.map((category) => category.value);
    });
  }

  setSplitExpenseValuesBasedOnProject(
    splitTxn: Transaction,
    project: ProjectV2,
    isProjectCategoryRestrictionsEnabled: boolean
  ): void {
    splitTxn.project_id = project.project_id;
    splitTxn.project_name = project.project_name;
    splitTxn.org_category_id = null;
    splitTxn.org_category = null;
    if (
      this.transaction.org_category_id &&
      (!isProjectCategoryRestrictionsEnabled ||
        (project.project_org_category_ids &&
          project.project_org_category_ids.includes(this.transaction.org_category_id)))
    ) {
      splitTxn.org_category_id = this.transaction.org_category_id;
      splitTxn.org_category = this.transaction.org_category;
    }
  }

  setSplitExpenseProjectHelper(
    splitFormValue: SplitExpense,
    splitTxn: Transaction,
    expenseDetails: Record<string, ExpenseField | ProjectV2>,
    isProjectCategoryRestrictionsEnabled: boolean
  ): void {
    const project: ProjectV2 = expenseDetails.project as ProjectV2;
    const costCenter: ExpenseField = expenseDetails.costCenter as ExpenseField;

    if (splitFormValue.project?.project_id) {
      this.setSplitExpenseValuesBasedOnProject(splitTxn, project, isProjectCategoryRestrictionsEnabled);
    } else if (splitFormValue.category?.id) {
      splitTxn.org_category_id = splitFormValue.category.id;
      splitTxn.org_category = splitFormValue.category.name;
      splitTxn.project_id = null;
      splitTxn.project_name = null;
      if (
        this.transaction.project_id &&
        (!isProjectCategoryRestrictionsEnabled || project.project_org_category_ids.includes(splitFormValue.category.id))
      ) {
        splitTxn.project_id = project.project_id;
        splitTxn.project_name = project.project_name;
      }

      //if source txn has cost_center_id, check if the split category id is present in cost_center
      if (this.transaction.cost_center_id && !costCenter?.org_category_ids?.includes(splitFormValue.category.id)) {
        splitTxn.cost_center_id = null;
        splitTxn.cost_center_name = null;
      }
    }
  }

  setCategoryAndProjectHelper(
    splitFormValue: SplitExpense,
    splitTxn: Transaction,
    expenseDetails: Record<string, ExpenseField | ProjectV2>,
    isProjectCategoryRestrictionsEnabled: boolean
  ): void {
    splitTxn.cost_center_id = splitFormValue.cost_center?.id || this.transaction.cost_center_id;
    if (this.transaction.project_id || this.transaction.org_category_id) {
      this.setSplitExpenseProjectHelper(splitFormValue, splitTxn, expenseDetails, isProjectCategoryRestrictionsEnabled);
    } else {
      //if no project or category id exists in source txn, set them from splitExpense object
      splitTxn.org_category_id = splitFormValue.category?.id || this.transaction.org_category_id;
      splitTxn.project_id = splitFormValue.project?.id || this.transaction.project_id;
    }
  }

  setupCategoryAndProject(
    splitTxn: Transaction,
    splitFormValue: SplitExpense,
    isProjectCategoryRestrictionsEnabled: boolean
  ): void {
    const expenseDetails: Record<string, ExpenseField | ProjectV2> = {
      costCenter: this.txnFields.cost_center_id,
      project: null,
    };

    if (!this.transaction.project_id && !splitFormValue.project?.project_id) {
      //if no project id exists, pass project as null, expenseDetails has project as null by default
      this.setCategoryAndProjectHelper(splitFormValue, splitTxn, expenseDetails, isProjectCategoryRestrictionsEnabled);
    } else {
      //if split_expense has project org_category_ids, pass project
      if (splitFormValue.project && splitFormValue.project.project_org_category_ids) {
        expenseDetails.project = splitFormValue.project;
        this.setCategoryAndProjectHelper(
          splitFormValue,
          splitTxn,
          expenseDetails,
          isProjectCategoryRestrictionsEnabled
        );
      } else if (
        (splitFormValue.project?.project_id && !splitFormValue.project.project_org_category_ids) ||
        this.transaction.project_id
      ) {
        //if split_expense or source txn has projectIds, call the method to get project and push to promises
        if (splitFormValue.project) {
          expenseDetails.project = splitFormValue.project;
        } else {
          expenseDetails.project = this.selectedProject;
        }
        this.setCategoryAndProjectHelper(
          splitFormValue,
          splitTxn,
          expenseDetails,
          isProjectCategoryRestrictionsEnabled
        );
      }
    }
  }

  createSplitTxns(splitExpenses: Transaction[]): Observable<Transaction[]> {
    const splitExpense$: Partial<{ txns: Observable<Transaction[]>; files: Observable<FileObject[]> }> = {
      txns: this.splitExpenseService.createSplitTxns(
        this.transaction,
        this.totalSplitAmount,
        splitExpenses,
        this.expenseFields
      ),
    };

    return forkJoin([splitExpense$.txns, this.isProjectCategoryRestrictionsEnabled$]).pipe(
      switchMap(([txns, isProjectCategoryRestrictionsEnabled]) => {
        for (const [index, txn] of txns.entries()) {
          const splitForm = this.splitExpensesFormArray.at(index);
          this.setupCategoryAndProject(txn, splitForm.value as SplitExpense, isProjectCategoryRestrictionsEnabled);
        }
        this.splitExpenseTxn = txns;
        return of(this.splitExpenseTxn);
      })
    );
  }

  toastWithoutCTA(toastMessage: string, toastType: ToastType, panelClass: string): void {
    const message = toastMessage;

    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties(toastType, { message }),
      panelClass: [panelClass],
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  getViolationName(index: number): string {
    const splitExpenseFormValue = this.splitExpensesFormArray.at(index).value as SplitExpense;
    if (this.splitType === 'projects') {
      return splitExpenseFormValue.project.project_name;
    } else if (this.splitType === 'cost centers') {
      return splitExpenseFormValue.cost_center.name;
    } else {
      return splitExpenseFormValue.category.name;
    }
  }

  transformViolationData(etxns: Transaction[], violations: SplitExpensePolicy): { [id: number]: PolicyViolation } {
    const violationData: { [id: number]: PolicyViolation } = {};
    for (const [index, etxn] of etxns.entries()) {
      violationData[index] = {};
      for (const key in violations) {
        if (violations.hasOwnProperty(key)) {
          violationData[index].amount = etxn.orig_amount || etxn.amount;
          violationData[index].currency = etxn.orig_currency || etxn.currency;
          violationData[index].name = this.getViolationName(index);
          violationData[index].type = this.splitType;
          violationData[index].data = violations.data[index];
        }
      }
    }
    return violationData;
  }

  transformMandatoryFieldsData(
    etxns: Transaction[],
    mandatoryFields: Partial<SplitExpenseMissingFields>
  ): { [id: number]: Partial<TransformedSplitExpenseMissingFields> } {
    const mandatoryFieldsData: { [id: number]: Partial<TransformedSplitExpenseMissingFields> } = {};
    for (const [index, etxn] of etxns.entries()) {
      mandatoryFieldsData[index] = {};
      for (const key in mandatoryFields) {
        if (mandatoryFields.hasOwnProperty(key)) {
          mandatoryFieldsData[index].amount = etxn.orig_amount || etxn.amount;
          mandatoryFieldsData[index].currency = etxn.orig_currency || etxn.currency;
          mandatoryFieldsData[index].name = this.getViolationName(index);
          mandatoryFieldsData[index].type = this.splitType;
          mandatoryFieldsData[index].data = mandatoryFields.data[index];
          break;
        }
      }
    }
    return mandatoryFieldsData;
  }

  showSuccessToast(): void {
    this.saveSplitExpenseLoading = false;
    const toastMessage = 'Expense split successfully.';
    if (this.reportId) {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: this.reportId }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    }
    this.toastWithoutCTA(toastMessage, ToastType.SUCCESS, 'msb-success-with-camera-icon');
  }

  getAttachedFiles(expenseId: string): Observable<Partial<PlatformFile>[]> {
    return this.expensesService.getExpenseById(expenseId).pipe(
      map((expense: PlatformExpense) => {
        this.fileObjs = expense.files;
        return this.fileObjs;
      })
    );
  }

  async showSplitExpensePolicyViolationsAndMissingFields(
    splitEtxns: Transaction[],
    policyViolations: { [id: number]: PolicyViolation },
    missingFieldsViolations: { [id: number]: Partial<TransformedSplitExpenseMissingFields> }
  ): Promise<SplitExpenseViolationsPopup> {
    const filteredPolicyViolations = this.splitExpenseService.filteredPolicyViolations(policyViolations);

    let filteredMissingFieldsViolations = {};

    if (missingFieldsViolations) {
      filteredMissingFieldsViolations =
        this.splitExpenseService.filteredMissingFieldsViolations(missingFieldsViolations);
    } else {
      filteredMissingFieldsViolations = null;
    }

    const splitTrackingProps = this.getSplitExpensePoperties();
    this.trackingService.splitExpensePolicyAndMissingFieldsPopupShown(splitTrackingProps);

    const splitExpenseViolationsModal = await this.modalController.create({
      component: SplitExpensePolicyViolationComponent,
      componentProps: {
        policyViolations: filteredPolicyViolations,
        missingFieldsViolations: filteredMissingFieldsViolations,
        isPartOfReport: !!this.reportId,
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await splitExpenseViolationsModal.present();

    const { data } = await splitExpenseViolationsModal.onWillDismiss<SplitExpenseViolationsPopup>();

    return data;
  }

  handlePolicyAndMissingFieldsCheck(splitEtxns: Transaction[]): Observable<SplitExpenseViolationsPopup> {
    for (const txn of splitEtxns) {
      delete txn.id;

      const categoryId = txn.org_category_id || this.unspecifiedCategory?.id;

      if (txn.custom_properties?.length > 0 && this.expenseFields?.length > 0) {
        txn.custom_properties = txn.custom_properties.filter((customProperty) => {
          const customField = this.expenseFields.find((field) => field.id === customProperty.id);
          return customField?.org_category_ids?.includes(categoryId);
        });
      }
    }

    const reportAndCategoryParams = {
      reportId: this.reportId,
      unspecifiedCategory: this.unspecifiedCategory,
    };

    return this.splitExpenseService
      .handlePolicyAndMissingFieldsCheck(splitEtxns, this.fileObjs, this.transaction, reportAndCategoryParams)
      .pipe(
        concatMap((res) => {
          const formattedViolations = this.transformViolationData(splitEtxns, res.policyViolations);
          let formattedMandatoryFields: { [id: number]: Partial<TransformedSplitExpenseMissingFields> } = null;

          if (!isEmpty(res.missingFields)) {
            formattedMandatoryFields = this.transformMandatoryFieldsData(splitEtxns, res.missingFields);
          }

          const doViolationsExist = this.policyService.checkIfViolationsExist(formattedViolations);
          const doMandatoryFieldsExist =
            formattedMandatoryFields && this.splitExpenseService.checkIfMissingFieldsExist(formattedMandatoryFields);

          if (doViolationsExist || doMandatoryFieldsExist) {
            return from(
              this.showSplitExpensePolicyViolationsAndMissingFields(
                splitEtxns,
                formattedViolations,
                formattedMandatoryFields
              )
            );
          }

          return of({ action: 'continue', comments: null });
        })
      );
  }

  handleSplitExpense(comments: { [id: number]: string }): void {
    const reportAndCategoryParams = {
      reportId: this.reportId,
      unspecifiedCategory: this.unspecifiedCategory,
    };

    this.splitExpenseService
      .splitExpense(this.formattedSplitExpense, this.fileObjs, this.transaction, reportAndCategoryParams)
      .pipe(
        catchError((errResponse: HttpErrorResponse) => {
          this.saveSplitExpenseLoading = false;

          const splitTrackingProps = this.getSplitExpensePoperties();
          splitTrackingProps['Error Message'] = (errResponse?.error as { message: string })?.message;
          this.trackingService.splitExpensePolicyCheckFailed(splitTrackingProps);

          const message = 'We were unable to split your expense. Please try again later.';
          this.toastWithoutCTA(message, ToastType.FAILURE, 'msb-failure-with-camera-icon');
          this.router.navigate(['/', 'enterprise', 'my_expenses']);
          return throwError(errResponse);
        })
      )
      .subscribe((txns) => {
        const splitTrackingProps = this.getSplitExpensePoperties();
        this.trackingService.splitExpenseSuccess(splitTrackingProps);

        const txnIds = txns.data.map((txn) => txn.id);

        if (comments) {
          return this.splitExpenseService
            .postSplitExpenseComments(txnIds, comments)
            .pipe(
              catchError((err) => {
                const message = 'We were unable to split your expense. Please try again later.';
                this.toastWithoutCTA(message, ToastType.FAILURE, 'msb-failure-with-camera-icon');
                this.router.navigate(['/', 'enterprise', 'my_expenses']);
                return throwError(err);
              })
            )
            .subscribe(() => this.showSuccessToast());
        }

        return this.showSuccessToast();
      });
  }

  correctTotalSplitAmount(): void {
    const totalSplitAmount = this.formattedSplitExpense.reduce(
      (prev, cur) => parseFloat((prev + cur.amount).toPrecision(15)),
      0
    );

    if (this.transaction.amount !== totalSplitAmount) {
      const difference = parseFloat((this.transaction.amount - totalSplitAmount).toFixed(15));
      this.formattedSplitExpense[this.formattedSplitExpense.length - 1].amount = parseFloat(
        (this.formattedSplitExpense[this.formattedSplitExpense.length - 1].amount + difference).toPrecision(15)
      );
    }
  }

  getSplitExpensePoperties(): SplittingExpenseProperties {
    return {
      Type: this.splitType,
      'Is Evenly Split': this.isEvenlySplit(),
      Asset: 'Mobile',
      'Is part of report': !!this.reportId,
      'Report ID': this.reportId || null,
      'Expense State': this.transaction.state,
      'User Role': 'spender',
    };
  }

  save(): void {
    if (this.splitExpensesFormArray.valid) {
      this.showErrorBlock = false;
      if (this.amount && parseFloat(this.amount.toFixed(3)) !== this.totalSplitAmount) {
        this.showErrorBlock = true;
        this.errorMessage = 'Split amount cannot be more than ' + this.amount + '.';
        setTimeout(() => {
          this.showErrorBlock = false;
        }, 2500);
        return;
      }
      let canCreateNegativeExpense = true;

      this.saveSplitExpenseLoading = true;

      this.isCorporateCardsEnabled$.subscribe((isCorporateCardsEnabled) => {
        canCreateNegativeExpense = (this.splitExpensesFormArray.value as SplitExpense[]).reduce(
          (defaultValue: boolean, splitExpenseValue) => {
            const negativeAmountPresent = splitExpenseValue.amount && splitExpenseValue.amount <= 0;
            if (!isCorporateCardsEnabled && negativeAmountPresent) {
              defaultValue = false;
            }
            return defaultValue;
          },
          true
        );

        if (!canCreateNegativeExpense) {
          this.showErrorBlock = true;
          this.errorMessage = 'Amount should be greater than 0.01';
          setTimeout(() => {
            this.showErrorBlock = false;
          }, 2500);
          return;
        }

        const generatedSplitEtxn$ = (this.splitExpensesFormArray.value as SplitExpense[]).map((splitExpenseValue) =>
          this.generateSplitEtxnFromFg(splitExpenseValue)
        );

        forkJoin({
          generatedSplitEtxn: forkJoin(generatedSplitEtxn$),
          files: this.uploadFiles(this.fileUrls),
        })
          .pipe(
            concatMap(({ generatedSplitEtxn }) => this.createSplitTxns(generatedSplitEtxn)),
            concatMap((formattedSplitExpense) => {
              this.formattedSplitExpense = formattedSplitExpense;
              this.correctTotalSplitAmount();
              return this.handlePolicyAndMissingFieldsCheck(formattedSplitExpense);
            }),
            catchError((errResponse: HttpErrorResponse) => {
              const splitTrackingProps = this.getSplitExpensePoperties();
              splitTrackingProps['Error Message'] = (errResponse?.error as { message: string })?.message;

              const fileIds = this.fileObjs?.map((file) => file.id);
              splitTrackingProps['Split Payload'] = this.splitExpenseService.transformSplitTo(
                this.formattedSplitExpense,
                this.transaction,
                fileIds,
                { reportId: this.reportId, unspecifiedCategory: this.unspecifiedCategory }
              );

              this.saveSplitExpenseLoading = false;

              this.trackingService.splitExpensePolicyCheckFailed(splitTrackingProps);

              const message = 'We were unable to split your expense. Please try again later.';
              this.toastWithoutCTA(message, ToastType.FAILURE, 'msb-failure-with-camera-icon');
              return throwError(errResponse);
            }),
            finalize(() => {
              const splitTrackingProps = this.getSplitExpensePoperties();
              this.trackingService.splittingExpense(splitTrackingProps);
            })
          )
          .subscribe((response) => {
            if (response && response.action === 'continue') {
              this.handleSplitExpense(response.comments);
            } else {
              // If user clicks on cancel button, then stop the loader
              this.saveSplitExpenseLoading = false;
            }
          });
      });
    } else {
      this.splitExpensesFormArray.markAllAsTouched();
    }
  }

  getActiveCategories(): Observable<OrgCategory[]> {
    const allCategories$ = this.categoriesService.getAll();

    return allCategories$.pipe(map((catogories) => this.categoriesService.filterRequired(catogories)));
  }

  getUnspecifiedCategory(): void {
    this.categoriesService.getCategoryByName('Unspecified').subscribe((unspecifiedCategory) => {
      this.unspecifiedCategory = unspecifiedCategory;
    });
  }

  getSplitExpenseHeader(): void {
    if (this.splitType === 'cost centers') {
      this.splitExpenseHeader = this.txnFields.cost_center_id.field_name;
    } else if (this.splitType === 'projects') {
      this.splitExpenseHeader = this.txnFields.project_id.field_name;
    } else {
      this.splitExpenseHeader = 'category';
    }
  }

  ionViewWillEnter(): void {
    const currencyObj = JSON.parse(this.activatedRoute.snapshot.params.currencyObj as string) as CurrencyObj;
    const orgSettings$ = this.orgSettingsService.get();
    this.splitType = this.activatedRoute.snapshot.params.splitType as string;
    this.txnFields = JSON.parse(this.activatedRoute.snapshot.params.txnFields as string) as Partial<ExpenseFieldsObj>;
    this.fileUrls = JSON.parse(this.activatedRoute.snapshot.params.fileObjs as string) as FileObject[];
    this.selectedCCCTransaction = JSON.parse(
      this.activatedRoute.snapshot.params.selectedCCCTransaction as string
    ) as MatchedCCCTransaction;
    this.reportId = JSON.parse(this.activatedRoute.snapshot.params.selectedReportId as string) as string;
    this.transaction = JSON.parse(this.activatedRoute.snapshot.params.txn as string) as Transaction;
    this.selectedProject = JSON.parse(this.activatedRoute.snapshot.params.selectedProject as string) as ProjectV2;
    this.expenseFields = JSON.parse(this.activatedRoute.snapshot.params.expenseFields as string) as ExpenseField[];

    // Set max and min date for form
    const today = new Date();
    this.minDate = dayjs(new Date('Jan 1, 2001')).format('YYYY-MM-D');
    this.maxDate = dayjs(this.dateService.addDaysToDate(today, 1)).format('YYYY-MM-D');

    // This method is used for setting the header of split expense page
    this.getSplitExpenseHeader();

    this.isProjectCategoryRestrictionsEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.advanced_projects.allowed && orgSettings.advanced_projects.enable_category_restriction
      )
    );

    this.categories$ = this.getActiveCategories().pipe(
      switchMap((activeCategories) =>
        this.launchDarklyService.getVariation('show_project_mapped_categories_in_split_expense', false).pipe(
          switchMap((showProjectMappedCategories) => {
            if (showProjectMappedCategories && this.transaction.project_id) {
              return combineLatest([
                this.projectsService.getbyId(this.transaction.project_id),
                this.isProjectCategoryRestrictionsEnabled$,
              ]).pipe(
                map(([project, isProjectCategoryRestrictionsEnabled]) =>
                  this.projectsService.getAllowedOrgCategoryIds(
                    project,
                    activeCategories,
                    isProjectCategoryRestrictionsEnabled
                  )
                )
              );
            }

            return of(activeCategories);
          }),
          map((categories) => categories.map((category) => ({ label: category.displayName, value: category })))
        )
      )
    );

    this.getCategoryList();

    let parentFieldId: number;
    if (this.splitType === 'projects') {
      parentFieldId = this.txnFields.project_id.id;
    } else if (this.splitType === 'cost centers') {
      parentFieldId = this.txnFields.cost_center_id?.id;
    }

    this.dependentCustomProperties$ = iif(
      () => !!parentFieldId,
      this.dependentFieldsService.getDependentFieldValuesForBaseField(
        this.transaction.custom_properties,
        parentFieldId
      ),
      of(null)
    );

    if (this.splitType === 'cost centers') {
      this.costCenters$ = orgSettings$.pipe(
        switchMap((orgSettings) => {
          if (orgSettings.cost_centers.enabled) {
            return this.costCentersService.getAllActive();
          } else {
            return of([]);
          }
        }),
        map((costCenters: CostCenter[]) =>
          costCenters.map((costCenter) => ({
            label: costCenter.name,
            value: costCenter,
          }))
        )
      );
    }

    this.isCorporateCardsEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.corporate_credit_card_settings && orgSettings.corporate_credit_card_settings.enabled
      )
    );

    this.getUnspecifiedCategory();

    forkJoin({
      homeCurrency: this.currencyService.getHomeCurrency(),
      isCorporateCardsEnabled: this.isCorporateCardsEnabled$,
    }).subscribe(({ homeCurrency, isCorporateCardsEnabled }) =>
      this.setValuesForCCC(currencyObj, homeCurrency, isCorporateCardsEnabled)
    );
  }

  setValuesForCCC(currencyObj: CurrencyObj, homeCurrency: string, isCorporateCardsEnabled: boolean): void {
    this.setAmountAndCurrency(currencyObj, homeCurrency);

    let amount1 = this.amount > 0.0001 || isCorporateCardsEnabled ? this.amount * 0.6 : null; // 60% split
    let amount2 = this.amount > 0.0001 || isCorporateCardsEnabled ? this.amount * 0.4 : null; // 40% split

    const percentage1 = this.amount ? 60 : null;
    const percentage2 = this.amount ? 40 : null;
    amount1 = amount1 ? parseFloat(amount1.toFixed(3)) : amount1;
    amount2 = amount2 ? parseFloat(amount2.toFixed(3)) : amount2;
    this.add(amount1, this.currency, percentage1, null);
    this.add(amount2, this.currency, percentage2, null);
    this.getTotalSplitAmount();
  }

  setAmountAndCurrency(currencyObj: CurrencyObj, homeCurrency: string): void {
    this.amount = currencyObj && (currencyObj.orig_amount || currencyObj.amount);
    this.currency = (currencyObj && (currencyObj.orig_currency || currencyObj.currency)) || homeCurrency;
  }

  customDateValidator(control: { value: string }): {
    invalidDateSelection: boolean;
  } {
    const today = new Date();
    const minDate = dayjs(new Date('Jan 1, 2001'));
    const maxDate = dayjs(new Date(today)).add(1, 'day');
    const passedInDate = control.value && dayjs(new Date(control.value));
    if (passedInDate) {
      return passedInDate.isBefore(maxDate) && passedInDate.isAfter(minDate)
        ? null
        : {
            invalidDateSelection: true,
          };
    }
  }

  add(amount?: number, currency?: string, percentage?: number, txnDt?: string | Date | dayjs.Dayjs): void {
    if (!txnDt) {
      const dateOfTxn = this.transaction?.txn_dt;
      const today = new Date();
      txnDt = dateOfTxn ? new Date(dateOfTxn) : today;
      txnDt = dayjs(txnDt).format('YYYY-MM-DD');
    }
    const fg = this.formBuilder.group({
      amount: [amount, Validators.required],
      currency: [currency],
      percentage: [percentage],
      txn_dt: [txnDt, Validators.compose([Validators.required, this.customDateValidator])],
    });

    if (this.splitType === 'categories') {
      fg.addControl('category', this.formBuilder.control('', [Validators.required]));
    } else if (this.splitType === 'projects') {
      fg.addControl('project', this.formBuilder.control('', [Validators.required]));
    } else if (this.splitType === 'cost centers') {
      fg.addControl('cost_center', this.formBuilder.control('', [Validators.required]));
    }

    this.splitExpensesFormArray.push(fg);
    this.getTotalSplitAmount();
  }

  remove(index: number): void {
    this.splitExpensesFormArray.removeAt(index);

    if (this.splitExpensesFormArray.length === 2) {
      const firstSplitExpenseForm = this.splitExpensesFormArray.at(0);
      const lastSplitExpenseForm = this.splitExpensesFormArray.at(1);

      const percentage = Math.min(
        100,
        Math.max(0, 100 - (firstSplitExpenseForm.value as { percentage: number }).percentage)
      );

      const rawAmount = (this.amount * percentage) / 100;
      const amount = parseFloat(rawAmount.toFixed(3));

      lastSplitExpenseForm.patchValue(
        {
          amount,
          percentage,
        },
        { emitEvent: false }
      );
    }

    this.getTotalSplitAmount();
  }

  splitEvenly(): void {
    const evenAmount = parseFloat((this.amount / this.splitExpensesFormArray.length).toFixed(3));
    const evenPercentage = parseFloat((100 / this.splitExpensesFormArray.length).toFixed(3));

    const lastSplitIndex = this.splitExpensesFormArray.length - 1;

    // Last split should have the remaining amount after even split to make sure we get the total amount

    const evenlySplitTotalAmount = parseFloat((evenAmount * lastSplitIndex).toPrecision(15));
    const lastSplitAmount = parseFloat((this.amount - evenlySplitTotalAmount).toFixed(7));
    const lastSplitPercentage = parseFloat((100 - evenPercentage * lastSplitIndex).toFixed(3));

    this.setEvenSplit(evenAmount, evenPercentage, lastSplitAmount, lastSplitPercentage);

    // Recalculate the total split amount and remaining amount
    this.getTotalSplitAmount();
  }

  private setEvenSplit(
    evenAmount: number,
    evenPercentage: number,
    lastSplitAmount: number,
    lastSplitPercentage: number
  ): void {
    const lastSplitIndex = this.splitExpensesFormArray.length - 1;

    this.splitExpensesFormArray.controls.forEach((control, index) => {
      const isLastSplit = index === lastSplitIndex;

      control.patchValue(
        {
          amount: isLastSplit ? lastSplitAmount : evenAmount,
          percentage: isLastSplit ? lastSplitPercentage : evenPercentage,
        },
        {
          emitEvent: false,
        }
      );
    });
  }

  private isEvenlySplit(): boolean {
    let splitAmount: number;

    // First Assuming that the expense is evenly split
    let isEvenSplit = true;

    this.splitExpensesFormArray.controls.forEach((control) => {
      const split = control.value as SplitExpense;

      if (!splitAmount) {
        splitAmount = split.amount;
      } else {
        // If the split amount is not the same for each split, then it is not evenly split
        // We are using 0.01 as the tolerance amount, because float point number cannot be evenly split perfectly in all cases, we will only check similarity up to 2 decimal places
        if (Math.abs(splitAmount - split.amount) > 0.01) {
          isEvenSplit = false;
        }
      }
    });

    return isEvenSplit;
  }
}
