import { Component, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Observable, from, Subject, concat, noop, forkJoin } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { switchMap, shareReplay, concatMap, map, finalize, reduce, takeUntil, take, filter } from 'rxjs/operators';
import { StatusService } from 'src/app/core/services/status.service';
import { ReportService } from 'src/app/core/services/report.service';
import { FileService } from 'src/app/core/services/file.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { NetworkService } from '../../core/services/network.service';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from '../../core/services/tracking.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { getCurrencySymbol } from '@angular/common';
import { MatchedCCCTransaction } from 'src/app/core/models/matchedCCCTransaction.model';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { CCCExpUnflattened } from 'src/app/core/models/corporate-card-expense-unflattened.model';
import { CustomInput } from 'src/app/core/models/custom-input.model';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { FileObject } from 'src/app/core/models/file-obj.model';

@Component({
  selector: 'app-view-expense',
  templateUrl: './view-expense.page.html',
  styleUrls: ['./view-expense.page.scss'],
})
export class ViewExpensePage {
  @ViewChild('comments') commentsContainer: ElementRef;

  etxn$: Observable<Expense>;

  policyViloations$: Observable<ExtendedStatus[]>;

  isAmountCapped$: Observable<boolean>;

  isCriticalPolicyViolated$: Observable<boolean>;

  customProperties$: Observable<CustomField[]>;

  etxnWithoutCustomProperties$: Observable<Expense>;

  canFlagOrUnflag$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  orgSettings: OrgSettings;

  reportId: string;

  attachments$: Observable<FileObject[]>;

  updateFlag$ = new Subject();

  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  comments$: Observable<ExtendedStatus[]>;

  policyDetails;

  isDeviceWidthSmall = window.innerWidth < 330;

  isSplitExpense: boolean;

  exchangeRate: number;

  paymentMode: string;

  isCCCTransaction = false;

  matchingCCCTransaction$: Observable<MatchedCCCTransaction>;

  numEtxnsInReport: number;

  activeEtxnIndex: number;

  paymentModeIcon: string;

  etxnCurrencySymbol: string;

  foreignCurrencySymbol: string;

  view: ExpenseView;

  isProjectShown: boolean;

  merchantFieldName: string;

  projectFieldName: string;

  isLoading = true;

  cardNumber: string;

  systemCategories: string[];

  travelSystemCategories: string[];

  flightSystemCategories: string[];

  breakfastSystemCategories: string[];

  systemCategoriesWithTaxi: string[];

  isNewReportsFlowEnabled = false;

  txnFields$: Observable<{ [key: string]: ExpenseField[] }>;

  projectDependentCustomProperties$: Observable<Partial<CustomInput>[]>;

  costCenterDependentCustomProperties$: Observable<Partial<CustomInput>[]>;

  constructor(
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private customInputsService: CustomInputsService,
    private statusService: StatusService,
    private fileService: FileService,
    private modalController: ModalController,
    private router: Router,
    private popoverController: PopoverController,
    private networkService: NetworkService,
    private policyService: PolicyService,
    private modalProperties: ModalPropertiesService,
    private trackingService: TrackingService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private expenseFieldsService: ExpenseFieldsService,
    private orgSettingsService: OrgSettingsService,
    private categoriesService: CategoriesService,
    private dependentFieldsService: DependentFieldsService
  ) {}

  get ExpenseView(): typeof ExpenseView {
    return ExpenseView;
  }

  ionViewWillLeave(): void {
    this.onPageExit.next(null);
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit),
      shareReplay(1)
    );

    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }

  isNumber(val: string | number): boolean {
    return typeof val === 'number';
  }

  async openCommentsModal(): Promise<void> {
    const etxn = await this.transactionService.getEtxn(this.activatedRoute.snapshot.params.id as string).toPromise();
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'transactions',
        objectId: etxn.tx_id,
      },
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();
    const { data } = (await modal.onDidDismiss()) as { data: { updated: boolean } };

    if (data && data.updated) {
      this.trackingService.addComment({ view: this.view });
    } else {
      this.trackingService.viewComment({ view: this.view });
    }
  }

  isPolicyComment(estatus: ExtendedStatus): boolean {
    return estatus.st_org_user_id === 'POLICY';
  }

  getPolicyDetails(expenseId: string): void {
    if (expenseId) {
      if (this.view === ExpenseView.team) {
        from(this.policyService.getApproverExpensePolicyViolations(expenseId))
          .pipe()
          .subscribe((policyDetails) => {
            this.policyDetails = policyDetails;
          });
      } else {
        from(this.policyService.getSpenderExpensePolicyViolations(expenseId))
          .pipe()
          .subscribe((policyDetails) => {
            this.policyDetails = policyDetails;
          });
      }
    }
  }

  getDisplayValue(customProperties: CustomField): boolean | string {
    const displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
    return displayValue === '-' ? 'Not Added' : displayValue;
  }

  goBack(): void {
    if (this.view === ExpenseView.team) {
      this.router.navigate(['/', 'enterprise', 'view_team_report', { id: this.reportId, navigate_back: true }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: this.reportId, navigate_back: true }]);
    }
  }

  setPaymentModeandIcon(etxn: Expense): void {
    if (etxn.source_account_type === AccountType.ADVANCE) {
      this.paymentMode = 'Advance';
      this.paymentModeIcon = 'fy-non-reimbursable';
    } else if (etxn.source_account_type === AccountType.CCC) {
      this.paymentMode = 'Corporate Card';
      this.paymentModeIcon = 'fy-unmatched';
      this.isCCCTransaction = true;
    } else if (etxn.tx_skip_reimbursement) {
      this.paymentMode = 'Paid by Company';
      this.paymentModeIcon = 'fy-non-reimbursable';
    } else {
      this.paymentMode = 'Paid by Employee';
      this.paymentModeIcon = 'fy-reimbursable';
    }
  }

  ionViewWillEnter(): void {
    this.setupNetworkWatcher();
    const txId = this.activatedRoute.snapshot.params.id as string;

    this.systemCategories = this.categoriesService.getSystemCategories();
    this.systemCategoriesWithTaxi = this.categoriesService.getSystemCategoriesWithTaxi();
    this.breakfastSystemCategories = this.categoriesService.getBreakfastSystemCategories();
    this.travelSystemCategories = this.categoriesService.getTravelSystemCategories();
    this.flightSystemCategories = this.categoriesService.getFlightSystemCategories();

    this.etxnWithoutCustomProperties$ = this.updateFlag$.pipe(
      switchMap(() => this.transactionService.getEtxn(txId)),
      shareReplay(1)
    );

    this.etxnWithoutCustomProperties$.subscribe((res) => {
      this.reportId = res.tx_report_id;
    });

    this.customProperties$ = this.etxnWithoutCustomProperties$.pipe(
      concatMap((etxn) =>
        this.customInputsService.fillCustomProperties(etxn.tx_org_category_id, etxn.tx_custom_properties, true)
      ),
      shareReplay(1)
    );

    this.etxn$ = this.etxnWithoutCustomProperties$.pipe(
      finalize(() => this.loaderService.hideLoader()),
      shareReplay(1)
    );

    this.txnFields$ = this.expenseFieldsService.getAllMap().pipe(shareReplay(1));

    this.projectDependentCustomProperties$ = forkJoin({
      etxn: this.etxn$.pipe(take(1)),
      txnFields: this.txnFields$.pipe(take(1)),
    }).pipe(
      filter(({ etxn, txnFields }) => etxn.tx_custom_properties && txnFields.project_id?.length > 0),
      switchMap(({ etxn, txnFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          etxn.tx_custom_properties,
          txnFields.project_id[0]?.id
        )
      )
    );

    this.costCenterDependentCustomProperties$ = forkJoin({
      etxn: this.etxn$.pipe(take(1)),
      txnFields: this.txnFields$.pipe(take(1)),
    }).pipe(
      filter(({ etxn, txnFields }) => etxn.tx_custom_properties && txnFields.cost_center_id?.length > 0),
      switchMap(({ etxn, txnFields }) =>
        this.dependentFieldsService.getDependentFieldValuesForBaseField(
          etxn.tx_custom_properties,
          txnFields.cost_center_id[0]?.id
        )
      ),
      shareReplay(1)
    );

    this.etxn$.subscribe((etxn) => {
      this.isSplitExpense = etxn.tx_split_group_id !== etxn.tx_id;

      if (etxn.tx_amount && etxn.tx_orig_amount) {
        this.exchangeRate = etxn.tx_amount / etxn.tx_orig_amount;
      }

      this.setPaymentModeandIcon(etxn);

      if (this.isCCCTransaction) {
        this.matchingCCCTransaction$ = this.corporateCreditCardExpenseService
          .getEccceByGroupId(etxn.tx_corporate_credit_card_expense_group_id)
          .pipe(
            map(
              (matchedExpense: CCCExpUnflattened[]) =>
                matchedExpense[0] && (this.paymentModeIcon = 'fy-matched') && matchedExpense[0].ccce
            )
          );
        this.matchingCCCTransaction$.subscribe((cardTxn) => {
          this.cardNumber = cardTxn?.card_or_account_number;
        });
      }
      this.foreignCurrencySymbol = getCurrencySymbol(etxn.tx_orig_currency, 'wide');
      this.etxnCurrencySymbol = getCurrencySymbol(etxn.tx_currency, 'wide');
    });

    forkJoin([this.txnFields$, this.etxn$.pipe(take(1))])
      .pipe(
        map(([expenseFieldsMap, etxn]) => {
          this.projectFieldName = expenseFieldsMap?.project_id[0]?.field_name;
          const isProjectMandatory = expenseFieldsMap?.project_id && expenseFieldsMap?.project_id[0]?.is_mandatory;
          this.isProjectShown = this.orgSettings.projects?.enabled && (!!etxn.tx_project_name || isProjectMandatory);
        })
      )
      .subscribe(noop);

    this.policyViloations$ = this.etxnWithoutCustomProperties$.pipe(
      concatMap((etxn) => this.statusService.find('transactions', etxn.tx_id)),
      map((comments) => comments.filter(this.isPolicyComment))
    );

    this.comments$ = this.statusService.find('transactions', txId);
    this.view = this.activatedRoute.snapshot.params.view as ExpenseView;

    this.canFlagOrUnflag$ = this.etxnWithoutCustomProperties$.pipe(
      filter(() => this.view === ExpenseView.team),
      map(
        (etxn) =>
          ['COMPLETE', 'POLICY_APPROVED', 'APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING'].indexOf(etxn.tx_state) > -1
      )
    );

    this.canDelete$ = this.etxnWithoutCustomProperties$.pipe(
      filter(() => this.view === ExpenseView.team),
      switchMap((etxn) =>
        this.reportService.getTeamReport(etxn.tx_report_id).pipe(map((report) => ({ report, etxn })))
      ),
      map(({ report, etxn }) => {
        if (report?.rp_num_transactions === 1) {
          return false;
        }
        return ['PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].indexOf(etxn.tx_state) < 0;
      })
    );

    this.isAmountCapped$ = this.etxn$.pipe(
      map((etxn) => this.isNumber(etxn.tx_admin_amount) || this.isNumber(etxn.tx_policy_amount))
    );

    this.orgSettingsService.get().subscribe((orgSettings) => {
      this.orgSettings = orgSettings;
      this.isNewReportsFlowEnabled = orgSettings.simplified_report_closure_settings?.enabled || false;
    });

    this.expenseFieldsService
      .getAllMap()
      .pipe(
        map((expenseFieldsMap) => {
          this.merchantFieldName = expenseFieldsMap.vendor_id[0]?.field_name;
        })
      )
      .subscribe(noop);

    this.isCriticalPolicyViolated$ = this.etxn$.pipe(
      map((etxn) => this.isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001)
    );

    this.getPolicyDetails(txId);

    const editExpenseAttachments = this.etxn$.pipe(
      take(1),
      switchMap((etxn) => this.fileService.findByTransactionId(etxn.tx_id)),
      switchMap((fileObjs) => from(fileObjs)),
      concatMap((fileObj: FileObject) =>
        this.fileService.downloadUrl(fileObj.id).pipe(
          map((downloadUrl) => {
            fileObj.url = downloadUrl;
            const details = this.getReceiptDetails(fileObj);
            fileObj.type = details.type;
            fileObj.thumbnail = details.thumbnail;
            return fileObj;
          })
        )
      ),
      reduce((acc: FileObject[], curr) => acc.concat(curr), [])
    );

    this.attachments$ = editExpenseAttachments;
    this.updateFlag$.next(null);
    this.attachments$.subscribe(noop, noop, () => {
      this.isLoading = false;
    });

    if (this.activatedRoute.snapshot.params.txnIds) {
      const etxnIds = JSON.parse(this.activatedRoute.snapshot.params.txnIds as string) as string[];
      this.numEtxnsInReport = etxnIds.length;
      this.activeEtxnIndex = parseInt(this.activatedRoute.snapshot.params.activeIndex as string, 10);
    }
  }

  getReceiptExtension(name: string): string {
    let res: string = null;

    if (name) {
      const filename = name.toLowerCase();
      const idx = filename.lastIndexOf('.');

      if (idx > -1) {
        res = filename.substring(idx + 1, filename.length);
      }
    }

    return res;
  }

  getReceiptDetails(file: FileObject): { type: string; thumbnail: string } {
    const ext = this.getReceiptExtension(file.name);
    const res = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg',
    };

    if (ext && ['pdf'].indexOf(ext) > -1) {
      res.type = 'pdf';
      res.thumbnail = 'img/fy-pdf.svg';
    } else if (ext && ['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1) {
      res.type = 'image';
      res.thumbnail = file.url;
    }

    return res;
  }

  getDeleteDialogProps(etxn: Expense): {
    component: typeof FyDeleteDialogComponent;
    cssClass: string;
    backdropDismiss: boolean;
    componentProps: {
      header: string;
      body: string;
      infoMessage: string;
      ctaText: string;
      ctaLoadingText: string;
      deleteMethod: () => Observable<void>;
    };
  } {
    return {
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: 'Remove Expense',
        body: 'Are you sure you want to remove this expense from the report?',
        infoMessage: 'The report amount will be adjusted accordingly.',
        ctaText: 'Remove',
        ctaLoadingText: 'Removing',
        deleteMethod: (): Observable<void> => this.reportService.removeTransaction(etxn.tx_report_id, etxn.tx_id),
      },
    };
  }

  async removeExpenseFromReport(): Promise<void> {
    const etxn = await this.transactionService.getEtxn(this.activatedRoute.snapshot.params.id as string).toPromise();
    const deletePopover = await this.popoverController.create(this.getDeleteDialogProps(etxn));
    await deletePopover.present();
    const { data } = (await deletePopover.onDidDismiss()) as { data: { status: string } };

    if (data && data.status === 'success') {
      this.trackingService.expenseRemovedByApprover();
      this.router.navigate(['/', 'enterprise', 'view_team_report', { id: etxn.tx_report_id, navigate_back: true }]);
    }
  }

  async flagUnflagExpense(isExpenseFlagged: boolean): Promise<void> {
    const id = this.activatedRoute.snapshot.params.id as string;
    const etxn = await this.transactionService.getEtxn(id).toPromise();

    const title = isExpenseFlagged ? 'Unflag' : 'Flag';
    const flagUnflagModal = await this.popoverController.create({
      component: FyPopoverComponent,
      componentProps: {
        title,
        formLabel: `Reason for ${title.toLowerCase()}ing expense`,
      },
      cssClass: 'fy-dialog-popover',
    });

    await flagUnflagModal.present();
    const { data } = (await flagUnflagModal.onWillDismiss()) as { data: { comment: string } };

    if (data && data.comment) {
      from(this.loaderService.showLoader('Please wait'))
        .pipe(
          switchMap(() => {
            const comment = {
              comment: data.comment,
            };
            return this.statusService.post('transactions', etxn.tx_id, comment, true);
          }),
          concatMap(() =>
            etxn.tx_manual_flag
              ? this.transactionService.manualUnflag(etxn.tx_id)
              : this.transactionService.manualFlag(etxn.tx_id)
          ),
          finalize(() => {
            this.updateFlag$.next(null);
            this.loaderService.hideLoader();
          })
        )
        .subscribe(noop);
    }
    this.trackingService.expenseFlagUnflagClicked({ action: title });
  }

  viewAttachments(): void {
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.attachments$),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(async (attachments) => {
        const attachmentsModal = await this.modalController.create({
          component: FyViewAttachmentComponent,
          componentProps: {
            attachments,
            canEdit: false,
          },
        });

        await attachmentsModal.present();
      });
  }
}
