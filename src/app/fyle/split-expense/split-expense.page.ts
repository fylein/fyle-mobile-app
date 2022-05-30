import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, PopoverController } from '@ionic/angular';
import { isNumber } from 'lodash';
import * as moment from 'moment';
import { forkJoin, from, iif, noop, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, finalize, map, switchMap, tap } from 'rxjs/operators';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { DateService } from 'src/app/core/services/date.service';
import { FileService } from 'src/app/core/services/file.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { SplitExpenseService } from 'src/app/core/services/split-expense.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ReportService } from 'src/app/core/services/report.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-split-expense',
  templateUrl: './split-expense.page.html',
  styleUrls: ['./split-expense.page.scss'],
})
export class SplitExpensePage implements OnInit {
  splitExpensesFormArray = new FormArray([]);

  fg: FormGroup;

  splitType: string;

  txnFields: any;

  amount: number;

  currency: string;

  totalSplitAmount: number;

  remainingAmount: number;

  categories$: Observable<any>;

  costCenters$: Observable<any>;

  isCorporateCardsEnabled$: Observable<boolean>;

  transaction: any;

  fileObjs: any[];

  fileUrls: any[];

  maxDate: string;

  minDate: string;

  selectedCCCTransaction: any;

  saveSplitExpenseLoading: boolean;

  errorMessage: string;

  showErrorBlock: boolean;

  reportId: string;

  splitExpenseTxn: any[];

  completeTxnIds: string[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private offlineService: OfflineService,
    private categoriesService: CategoriesService,
    private dateService: DateService,
    private splitExpenseService: SplitExpenseService,
    private popoverController: PopoverController,
    private transactionService: TransactionService,
    private fileService: FileService,
    private navController: NavController,
    private router: Router,
    private transactionsOutboxService: TransactionsOutboxService,
    private reportService: ReportService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private trackingService: TrackingService
  ) {}

  ngOnInit() {}

  goBack() {
    this.navController.back();
  }

  onChangeAmount(splitExpenseForm, index) {
    if (!splitExpenseForm.controls.amount._pendingChange || !this.amount || !isNumber(splitExpenseForm.value.amount)) {
      return;
    }

    if (this.splitExpensesFormArray.length === 2) {
      const otherIndex = index === 0 ? 1 : 0;
      const otherSplitExpenseForm = this.splitExpensesFormArray.at(otherIndex);

      const amount = parseFloat((this.amount - splitExpenseForm.value.amount).toFixed(3));
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

  onChangePercentage(splitExpenseForm, index) {
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
      const amount = parseFloat(((this.amount * percentage) / 100).toFixed(3));

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

  getTotalSplitAmount() {
    if (this.splitExpensesFormArray.value.length > 1) {
      const amounts = this.splitExpensesFormArray.value.map((obj) => obj.amount);

      const totalSplitAmount = amounts.reduce((acc, curr) => acc + curr);

      this.totalSplitAmount = parseFloat(totalSplitAmount.toFixed(3)) || 0;
      const remainingAmount = this.amount - this.totalSplitAmount;
      this.remainingAmount = parseFloat(remainingAmount.toFixed(3)) || 0;
    }
  }

  setUpSplitExpenseBillable(splitExpense) {
    if (splitExpense.project && this.txnFields && this.txnFields.billable) {
      return this.txnFields.billable.default_value;
    }
    return this.transaction.billable;
  }

  setUpSplitExpenseTax(splitExpense) {
    if (this.transaction.tax_amount && this.transaction.amount) {
      return (this.transaction.tax_amount * splitExpense.percentage) / 100;
    } else {
      return this.transaction.tax_amount;
    }
  }

  generateSplitEtxnFromFg(splitExpenseValue) {
    // Fixing the date format here as the transaction object date is a string
    this.transaction.from_dt =
      this.transaction?.from_dt && this.dateService.getUTCDate(new Date(this.transaction.from_dt));
    this.transaction.to_dt = this.transaction?.to_dt && this.dateService.getUTCDate(new Date(this.transaction.to_dt));

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
    };
  }

  uploadNewFiles(files) {
    const fileObjs = [];
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

  uploadFiles(files) {
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

  createAndLinkTxnsWithFiles(splitExpenses) {
    const splitExpense$: any = {
      txns: this.splitExpenseService.createSplitTxns(this.transaction, this.totalSplitAmount, splitExpenses),
    };

    if (this.fileObjs && this.fileObjs.length > 0) {
      splitExpense$.files = this.splitExpenseService.getBase64Content(this.fileObjs);
    }

    return forkJoin(splitExpense$).pipe(
      switchMap((data: any) => {
        this.splitExpenseTxn = data.txns.map((txn) => txn);
        this.completeTxnIds = this.splitExpenseTxn.filter((tx) => tx.state === 'COMPLETE').map((txn) => txn.id);
        if (this.completeTxnIds.length !== 0 && this.reportId) {
          return this.reportService.addTransactions(this.reportId, this.completeTxnIds).pipe(map(() => data));
        } else {
          return of(data);
        }
      }),
      switchMap((data: any) => {
        const txnIds = data.txns.map((txn) => txn.id);
        return this.splitExpenseService.linkTxnWithFiles(data).pipe(map(() => txnIds));
      })
    );
  }

  toastWithCTA(toastMessage) {
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

  toastWithoutCTA(toastMessage, toastType, panelClass) {
    const message = toastMessage;

    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties(toastType, { message }),
      panelClass: [panelClass],
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  showSuccessToast() {
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
        this.toastWithoutCTA(toastMessage, 'information', 'msb-info');
      }
    } else {
      const toastMessage = 'Your expense was split successfully.';
      this.toastWithoutCTA(toastMessage, 'success', 'msb-success-with-camera-icon');
    }
    this.router.navigate(['/', 'enterprise', 'my_expenses']);
  }

  getAttachedFiles(transactionId) {
    return this.fileService.findByTransactionId(transactionId).pipe(
      map((uploadedFiles) => {
        this.fileObjs = uploadedFiles;
        return this.fileObjs;
      })
    );
  }

  save() {
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
        canCreateNegativeExpense = this.splitExpensesFormArray.value.reduce((defaultValue, splitExpenseValue) => {
          const negativeAmountPresent = splitExpenseValue.amount && splitExpenseValue.amount <= 0;
          if (!isCorporateCardsEnabled && negativeAmountPresent) {
            defaultValue = false && defaultValue;
          }
          return defaultValue;
        }, true);

        if (!canCreateNegativeExpense) {
          this.showErrorBlock = true;
          this.errorMessage = 'Amount should be greater than 0.01';
          setTimeout(() => {
            this.showErrorBlock = false;
          }, 2500);
          return;
        }

        this.saveSplitExpenseLoading = true;
        const generatedSplitEtxn = [];
        this.splitExpensesFormArray.value.forEach((splitExpenseValue) => {
          generatedSplitEtxn.push(this.generateSplitEtxnFromFg(splitExpenseValue));
        });

        const uploadFiles$ = this.uploadFiles(this.fileUrls);

        uploadFiles$
          .pipe(
            concatMap(() => this.createAndLinkTxnsWithFiles(generatedSplitEtxn)),
            concatMap((res) => {
              const observables$ = [];
              if (this.transaction.id) {
                observables$.push(this.transactionService.delete(this.transaction.id));
              }
              if (this.transaction.corporate_credit_card_expense_group_id) {
                observables$.push(this.transactionService.matchCCCExpense(res[0], this.selectedCCCTransaction.id));
              }

              if (observables$.length === 0) {
                observables$.push(of(true));
              }
              return forkJoin(observables$);
            }),
            tap((res) => {
              this.showSuccessToast();
            }),
            catchError((err) => {
              const message = 'We were unable to split your expense. Please try again later.';
              this.toastWithoutCTA(message, 'failure', 'msb-failure-with-camera-icon');
              this.router.navigate(['/', 'enterprise', 'my_expenses']);
              return throwError(err);
            }),
            finalize(() => {
              this.saveSplitExpenseLoading = false;

              const splitTrackingProps = {
                'Split Type': this.splitType,
              };
              this.trackingService.splittingExpense(splitTrackingProps);
            })
          )
          .subscribe(noop);
      });
    } else {
      this.splitExpensesFormArray.markAllAsTouched();
    }
  }

  getActiveCategories() {
    const allCategories$ = this.offlineService.getAllEnabledCategories();

    return allCategories$.pipe(map((catogories) => this.categoriesService.filterRequired(catogories)));
  }

  ionViewWillEnter() {
    this.offlineService.getHomeCurrency().subscribe((homeCurrency) => {
      const currencyObj = JSON.parse(this.activatedRoute.snapshot.params.currencyObj);
      const orgSettings$ = this.offlineService.getOrgSettings();
      this.splitType = this.activatedRoute.snapshot.params.splitType;
      this.txnFields = JSON.parse(this.activatedRoute.snapshot.params.txnFields);
      this.transaction = JSON.parse(this.activatedRoute.snapshot.params.txn);
      this.fileUrls = JSON.parse(this.activatedRoute.snapshot.params.fileObjs);
      this.selectedCCCTransaction = JSON.parse(this.activatedRoute.snapshot.params.selectedCCCTransaction);
      this.reportId = JSON.parse(this.activatedRoute.snapshot.params.selectedReportId);
      if (this.splitType === 'categories') {
        this.categories$ = this.getActiveCategories().pipe(
          map((categories) => categories.map((category) => ({ label: category.displayName, value: category })))
        );
      } else if (this.splitType === 'cost centers') {
        const orgSettings$ = this.offlineService.getOrgSettings();
        const orgUserSettings$ = this.offlineService.getOrgUserSettings();
        this.costCenters$ = forkJoin({
          orgSettings: orgSettings$,
          orgUserSettings: orgUserSettings$,
        }).pipe(
          switchMap(({ orgSettings, orgUserSettings }) => {
            if (orgSettings.cost_centers.enabled) {
              return this.offlineService.getAllowedCostCenters(orgUserSettings);
            } else {
              return of([]);
            }
          }),
          map((costCenters) =>
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

      this.isCorporateCardsEnabled$.subscribe((isCorporateCardsEnabled) => {
        this.setValuesForCCC(currencyObj, homeCurrency, isCorporateCardsEnabled);
      });
    });
  }

  setValuesForCCC(currencyObj: any, homeCurrency: any, isCorporateCardsEnabled: boolean) {
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

  setAmountAndCurrency(currencyObj: any, homeCurrency: any) {
    this.amount = currencyObj && (currencyObj.orig_amount || currencyObj.amount);
    this.currency = (currencyObj && (currencyObj.orig_currency || currencyObj.currency)) || homeCurrency;
  }

  customDateValidator(control: AbstractControl) {
    const today = new Date();
    const minDate = moment(new Date('Jan 1, 2001'));
    const maxDate = moment(new Date(today)).add(1, 'day');
    const passedInDate = control.value && moment(new Date(control.value));
    if (passedInDate) {
      return passedInDate.isBetween(minDate, maxDate)
        ? null
        : {
            invalidDateSelection: true,
          };
    }
  }

  add(amount?, currency?, percentage?, txnDt?) {
    if (!txnDt) {
      const dateOfTxn = this.transaction?.txn_dt;
      const today: any = new Date();
      txnDt = dateOfTxn ? new Date(dateOfTxn) : today;
      txnDt = moment(txnDt).format('yyyy-MM-DD');
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

  remove(index: number) {
    this.splitExpensesFormArray.removeAt(index);

    if (this.splitExpensesFormArray.length === 2) {
      const firstSplitExpenseForm = this.splitExpensesFormArray.at(0);
      const lastSplitExpenseForm = this.splitExpensesFormArray.at(1);

      const percentage = Math.min(100, Math.max(0, 100 - firstSplitExpenseForm.value.percentage));
      const amount = parseFloat(((this.amount * percentage) / 100).toFixed(3));

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
}
