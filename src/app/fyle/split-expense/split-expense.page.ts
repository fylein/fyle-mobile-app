import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { isNumber } from 'lodash';
import * as dayjs from 'dayjs';
import { forkJoin, from, iif, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, finalize, map, switchMap } from 'rxjs/operators';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { DateService } from 'src/app/core/services/date.service';
import { FileService } from 'src/app/core/services/file.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { SplitExpenseService } from 'src/app/core/services/split-expense.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ReportService } from 'src/app/core/services/report.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { SplitExpensePolicyViolationComponent } from 'src/app/shared/components/split-expense-policy-violation/split-expense-policy-violation.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { OrgCategory, OrgCategoryListItem } from 'src/app/core/models/v1/org-category.model';
import { FormattedPolicyViolation } from 'src/app/core/models/formatted-policy-violation.model';
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
import { Expense } from 'src/app/core/models/expense.model';
import { PolicyViolationTxn } from 'src/app/core/models/policy-violation-txn.model';
import { SplitExpenseForm } from 'src/app/core/models/split-expense-form.model';
import { ToastType } from 'src/app/core/enums/toast-type.enum';

@Component({
  selector: 'app-split-expense',
  templateUrl: './split-expense.page.html',
  styleUrls: ['./split-expense.page.scss'],
})
export class SplitExpensePage {
  splitExpensesFormArray = new FormArray([]);

  fg: FormGroup;

  splitType: string;

  txnFields: Partial<ExpenseFieldsObj>;

  amount: number;

  currency: string;

  totalSplitAmount: number;

  remainingAmount: number;

  categories$: Observable<OrgCategoryListItem[]>;

  costCenters$: Observable<CostCenters[]>;

  isCorporateCardsEnabled$: Observable<boolean>;

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private dateService: DateService,
    private splitExpenseService: SplitExpenseService,
    private currencyService: CurrencyService,
    private transactionService: TransactionService,
    private fileService: FileService,
    private navController: NavController,
    private router: Router,
    private transactionsOutboxService: TransactionsOutboxService,
    private reportService: ReportService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private trackingService: TrackingService,
    private policyService: PolicyService,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private orgUserSettingsService: OrgUserSettingsService,
    private orgSettingsService: OrgSettingsService,
    private dependentFieldsService: DependentFieldsService,
    private launchDarklyService: LaunchDarklyService,
    private projectsService: ProjectsService,
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
        { emitEvent: false },
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
        { emitEvent: false },
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

  generateSplitEtxnFromFg(splitExpenseValue: SplitExpense): Observable<Transaction> {
    // Fixing the date format here as the transaction object date is a string
    this.transaction.from_dt =
      this.transaction.from_dt && this.dateService.getUTCDate(new Date(this.transaction.from_dt));
    this.transaction.to_dt = this.transaction.to_dt && this.dateService.getUTCDate(new Date(this.transaction.to_dt));

    return this.dependentCustomProperties$.pipe(
      map((dependentCustomProperties) => {
        let txnCustomProperties = this.transaction.custom_properties;

        const isDifferentProject =
          this.splitType === 'projects' && splitExpenseValue.project?.project_id !== this.transaction.project_id;
        const isDifferentCostCenter =
          this.splitType === 'cost centers' && splitExpenseValue.cost_center?.id !== this.transaction.cost_center_id;

        //If selected project/cost center is not same as the original expense, then remove dependent fields from source expense.
        if (isDifferentProject || isDifferentCostCenter) {
          txnCustomProperties = this.transaction.custom_properties.filter(
            (customProperty) => !dependentCustomProperties.includes(customProperty),
          );
        }

        return {
          ...this.transaction,
          org_category_id: splitExpenseValue.category && splitExpenseValue.category.id,
          project_id: splitExpenseValue.project && splitExpenseValue.project.project_id,
          cost_center_id: splitExpenseValue.cost_center && splitExpenseValue.cost_center.id,
          currency: splitExpenseValue.currency,
          amount: splitExpenseValue.amount,
          source: 'MOBILE',
          billable: this.setUpSplitExpenseBillable(splitExpenseValue),
          tax_amount: this.setUpSplitExpenseTax(splitExpenseValue),
          custom_properties: txnCustomProperties,
        };
      }),
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
        }),
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

  createAndLinkTxnsWithFiles(splitExpenses: Transaction[]): Observable<string[]> {
    const splitExpense$: Partial<{ txns: Observable<Transaction[]>; files: Observable<FileObject[]> }> = {
      txns: this.splitExpenseService.createSplitTxns(this.transaction, this.totalSplitAmount, splitExpenses),
    };

    if (this.fileObjs && this.fileObjs.length > 0) {
      splitExpense$.files = this.splitExpenseService.getBase64Content(this.fileObjs);
    }

    return forkJoin(splitExpense$).pipe(
      switchMap((data) => {
        this.splitExpenseTxn = data.txns.map((txn) => txn);
        this.completeTxnIds = this.splitExpenseTxn.filter((tx) => tx.state === 'COMPLETE').map((txn) => txn.id);
        if (this.completeTxnIds.length !== 0 && this.reportId) {
          return this.reportService.addTransactions(this.reportId, this.completeTxnIds).pipe(map(() => data));
        } else {
          return of(data);
        }
      }),
      switchMap((data) => {
        const txnIds = data.txns.map((txn) => txn.id);
        return this.splitExpenseService.linkTxnWithFiles(data).pipe(map(() => txnIds));
      }),
    );
  }

  toastWithCTA(toastMessage: string): void {
    const toastMessageData = {
      message: toastMessage,
      redirectionText: 'View Report',
    };

    const expensesAddedToReportSnackBar = this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
      panelClass: ['msb-success-with-camera-icon'],
    });
    this.trackingService.showToastMessage({ ToastContent: toastMessage });
    expensesAddedToReportSnackBar.onAction().subscribe(() => {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: this.reportId, navigateBack: true }]);
    });
  }

  toastWithoutCTA(toastMessage: string, toastType: ToastType, panelClass: string): void {
    const message = toastMessage;

    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties(toastType, { message }),
      panelClass: [panelClass],
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  showSuccessToast(): void {
    if (this.reportId) {
      if (this.completeTxnIds.length === this.splitExpenseTxn.length) {
        const toastMessage = 'Your expense was split successfully. All the split expenses were added to report';
        this.toastWithCTA(toastMessage);
      } else if (this.completeTxnIds.length > 0 && this.splitExpenseTxn.length > 0) {
        const toastMessage =
          'Your expense was split successfully. ' +
          this.completeTxnIds.length +
          ' out of ' +
          this.splitExpenseTxn.length +
          ' expenses were added to report.';
        this.toastWithCTA(toastMessage);
      } else {
        const toastMessage = 'Your expense was split successfully. Review split expenses to add it to the report.';
        this.toastWithoutCTA(toastMessage, ToastType.INFORMATION, 'msb-info');
      }
    } else {
      const toastMessage = 'Your expense was split successfully.';
      this.toastWithoutCTA(toastMessage, ToastType.SUCCESS, 'msb-success-with-camera-icon');
    }
    this.router.navigate(['/', 'enterprise', 'my_expenses']);
  }

  getAttachedFiles(transactionId: string): Observable<FileObject[]> {
    return this.fileService.findByTransactionId(transactionId).pipe(
      map((uploadedFiles) => {
        this.fileObjs = uploadedFiles;
        return this.fileObjs;
      }),
    );
  }

  async showSplitExpenseViolations(violations: { [id: string]: FormattedPolicyViolation }): Promise<void> {
    const splitExpenseViolationsModal = await this.modalController.create({
      component: SplitExpensePolicyViolationComponent,
      componentProps: {
        policyViolations: violations,
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await splitExpenseViolationsModal.present();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
    const { data } = await splitExpenseViolationsModal.onWillDismiss();
    this.showSuccessToast();
  }

  handleSplitExpensePolicyViolations(violations: { [transactionID: string]: PolicyViolation }): void {
    const doViolationsExist = this.policyService.checkIfViolationsExist(violations);
    if (doViolationsExist) {
      const formattedViolations = this.splitExpenseService.formatPolicyViolations(violations);
      this.showSplitExpenseViolations(formattedViolations);
    } else {
      this.showSuccessToast();
    }
  }

  save(): void {
    if (this.splitExpensesFormArray.valid) {
      this.showErrorBlock = false;
      if (this.amount && this.amount !== this.totalSplitAmount) {
        this.showErrorBlock = true;
        this.errorMessage = 'Split amount cannot be more than ' + this.amount + '.';
        setTimeout(() => {
          this.showErrorBlock = false;
        }, 2500);
        return;
      }
      let canCreateNegativeExpense = true;
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

        this.saveSplitExpenseLoading = true;

        const generatedSplitEtxn$ = (this.splitExpensesFormArray.value as SplitExpense[]).map((splitExpenseValue) =>
          this.generateSplitEtxnFromFg(splitExpenseValue)
        );

        forkJoin({
          generatedSplitEtxn: forkJoin(generatedSplitEtxn$),
          files: this.uploadFiles(this.fileUrls),
        })
          .pipe(
            concatMap(({ generatedSplitEtxn }) => this.createAndLinkTxnsWithFiles(generatedSplitEtxn)),
            concatMap((res) => {
              const observables: Partial<{
                delete: Observable<Expense>;
                matchCCC: Observable<null>;
                violations: Observable<PolicyViolationTxn>;
              }> = {};
              if (this.transaction.id) {
                observables.delete = this.transactionService.delete(this.transaction.id);
              }
              if (this.transaction.corporate_credit_card_expense_group_id) {
                observables.matchCCC = this.transactionService.matchCCCExpense(res[0], this.selectedCCCTransaction.id);
              }

              observables.violations = this.splitExpenseService.checkForPolicyViolations(
                res,
                this.fileObjs,
                this.categoryList,
              );

              return forkJoin(observables);
            }),
            catchError((err) => {
              const message = 'We were unable to split your expense. Please try again later.';
              this.toastWithoutCTA(message, ToastType.FAILURE, 'msb-failure-with-camera-icon');
              this.router.navigate(['/', 'enterprise', 'my_expenses']);
              return throwError(err);
            }),
            finalize(() => {
              this.saveSplitExpenseLoading = false;

              const splitTrackingProps = {
                'Split Type': this.splitType,
                'Is Evenly Split': this.isEvenlySplit(),
              };
              this.trackingService.splittingExpense(splitTrackingProps);
            }),
          )
          .subscribe((response) => {
            this.handleSplitExpensePolicyViolations(response.violations as { [id: string]: PolicyViolation });
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

    this.categories$ = this.getActiveCategories().pipe(
      switchMap((activeCategories) =>
        this.launchDarklyService.getVariation('show_project_mapped_categories_in_split_expense', false).pipe(
          switchMap((showProjectMappedCategories) => {
            if (showProjectMappedCategories && this.transaction.project_id) {
              return this.projectsService
                .getbyId(this.transaction.project_id)
                .pipe(
                  map(
                    (project) =>
                      this.projectsService.getAllowedOrgCategoryIds(project, activeCategories) as OrgCategory[]
                  )
                );
            }

            return of(activeCategories);
          }),
          map((categories) => categories.map((category) => ({ label: category.displayName, value: category }))),
        ),
      ),
    );

    this.getCategoryList();

    let parentFieldId: number;
    if (this.splitType === 'projects') {
      parentFieldId = this.txnFields.project_id.id;
    } else if (this.splitType === 'cost centers') {
      parentFieldId = this.txnFields.cost_center_id.id;
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
      const orgUserSettings$ = this.orgUserSettingsService.get();
      this.costCenters$ = forkJoin({
        orgSettings: orgSettings$,
        orgUserSettings: orgUserSettings$,
      }).pipe(
        switchMap(({ orgSettings, orgUserSettings }) => {
          if (orgSettings.cost_centers.enabled) {
            return this.orgUserSettingsService.getAllowedCostCenters(orgUserSettings);
          } else {
            return of([]);
          }
        }),
        map((costCenters: CostCenter[]) =>
          costCenters.map((costCenter) => ({
            label: costCenter.name,
            value: costCenter,
          })),
        ),
      );
    }

    this.isCorporateCardsEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.corporate_credit_card_settings && orgSettings.corporate_credit_card_settings.enabled,
      ),
    );

    forkJoin({
      homeCurrency: this.currencyService.getHomeCurrency(),
      isCorporateCardsEnabled: this.isCorporateCardsEnabled$,
    }).subscribe(({ homeCurrency, isCorporateCardsEnabled }) =>
      this.setValuesForCCC(currencyObj, homeCurrency, isCorporateCardsEnabled),
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

    const today = new Date();
    const minDate = new Date('Jan 1, 2001');
    const maxDate = this.dateService.addDaysToDate(today, 1);

    this.minDate = minDate.getFullYear() + '-' + (minDate.getMonth() + 1) + '-' + minDate.getDate();
    this.maxDate = maxDate.getFullYear() + '-' + (maxDate.getMonth() + 1) + '-' + maxDate.getDate();
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
    const fg: FormGroup<any> = this.formBuilder.group({
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
        { emitEvent: false },
      );
    }

    this.getTotalSplitAmount();
  }

  splitEvenly(): void {
    const evenAmount = parseFloat((this.amount / this.splitExpensesFormArray.length).toFixed(3));
    const evenPercentage = parseFloat((100 / this.splitExpensesFormArray.length).toFixed(3));

    const lastSplitIndex = this.splitExpensesFormArray.length - 1;

    // Last split should have the remaining amount after even split to make sure we get the total amount
    const lastSplitAmount = parseFloat((this.amount - evenAmount * lastSplitIndex).toFixed(3));
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
        },
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
