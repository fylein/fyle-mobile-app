import { Component, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable, from, Subject, combineLatest, concat, noop } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OfflineService } from 'src/app/core/services/offline.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { switchMap, shareReplay, concatMap, map, finalize, reduce, tap, takeUntil, scan, take } from 'rxjs/operators';
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
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';

@Component({
  selector: 'app-view-team-expense',
  templateUrl: './view-team-expense.page.html',
  styleUrls: ['./view-team-expense.page.scss'],
})
export class ViewTeamExpensePage implements OnInit {
  @ViewChild('comments') commentsContainer: ElementRef;

  etxn$: Observable<Expense>;

  policyViloations$: Observable<any>;

  isAmountCapped$: Observable<boolean>;

  isCriticalPolicyViolated$: Observable<boolean>;

  allExpenseCustomFields$: Observable<any>;

  customProperties$: Observable<any>;

  etxnWithoutCustomProperties$: Observable<any>;

  canFlagOrUnflag$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  orgSettings: any;

  reportId;

  attachments$: Observable<any>;

  currencyOptions;

  updateFlag$ = new Subject();

  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  comments$: Observable<any>;

  policyDetails;

  isDeviceWidthSmall = window.innerWidth < 330;

  isExpenseFlagged: boolean;

  constructor(
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private offlineService: OfflineService,
    private customInputsService: CustomInputsService,
    private statusService: StatusService,
    private fileService: FileService,
    private modalController: ModalController,
    private router: Router,
    private popoverController: PopoverController,
    private networkService: NetworkService,
    private policyService: PolicyService,
    private modalProperties: ModalPropertiesService,
    private trackingService: TrackingService
  ) {}

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  setupNetworkWatcher() {
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

  isNumber(val) {
    return typeof val === 'number';
  }

  goBackToReport() {
    this.router.navigate(['/', 'enterprise', 'view_team_report', { id: this.reportId }]);
  }

  async openCommentsModal() {
    const etxn = await this.transactionService.getEtxn(this.activatedRoute.snapshot.params.id).toPromise();
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'transactions',
        objectId: etxn.tx_id,
      },
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data && data.updated) {
      this.trackingService.addComment();
    } else {
      this.trackingService.viewComment();
    }
  }

  isPolicyComment(estatus) {
    return estatus.st_org_user_id === 'POLICY';
  }

  scrollCommentsIntoView() {
    if (this.commentsContainer) {
      const commentsContainer = this.commentsContainer.nativeElement as HTMLElement;
      if (commentsContainer) {
        commentsContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    }
  }

  getPolicyDetails(txId) {
    if (txId) {
      from(this.policyService.getPolicyViolationRules(txId))
        .pipe()
        .subscribe((details) => {
          this.policyDetails = details;
        });
    }
  }

  getDisplayValue(customProperties) {
    return this.customInputsService.getCustomPropertyDisplayValue(customProperties);
  }

  goBack() {
    this.router.navigate(['/', 'enterprise', 'view_team_report', { id: this.reportId }]);
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    const txId = this.activatedRoute.snapshot.params.id;
    this.currencyOptions = {
      disabled: true,
    };

    this.etxnWithoutCustomProperties$ = this.updateFlag$.pipe(
      switchMap(() =>
        from(this.loaderService.showLoader()).pipe(switchMap(() => this.transactionService.getEtxn(txId)))
      ),
      finalize(() => this.loaderService.hideLoader()),
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

    this.etxn$ = combineLatest([this.etxnWithoutCustomProperties$, this.customProperties$]).pipe(
      map((res) => {
        res[0].tx_custom_properties = res[1];
        return res[0];
      }),
      finalize(() => this.loaderService.hideLoader()),
      shareReplay(1)
    );

    this.etxn$.subscribe((etxn) => {
      this.isExpenseFlagged = etxn.tx_manual_flag;
    });

    this.policyViloations$ = this.etxnWithoutCustomProperties$.pipe(
      concatMap((etxn) => this.statusService.find('transactions', etxn.tx_id)),
      map((comments) => comments.filter(this.isPolicyComment))
    );

    this.comments$ = this.statusService.find('transactions', txId);

    this.canFlagOrUnflag$ = this.etxnWithoutCustomProperties$.pipe(
      map(
        (etxn) =>
          ['COMPLETE', 'POLICY_APPROVED', 'APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING'].indexOf(etxn.tx_state) > -1
      )
    );

    this.canDelete$ = this.etxnWithoutCustomProperties$.pipe(
      concatMap((etxn) =>
        this.reportService.getTeamReport(etxn.tx_report_id).pipe(map((report) => ({ report, etxn })))
      ),
      map(({ report, etxn }) => {
        if (report.rp_num_transactions === 1) {
          return false;
        }
        return ['PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].indexOf(etxn.tx_state) < 0;
      })
    );

    this.isAmountCapped$ = this.etxn$.pipe(
      map((etxn) => this.isNumber(etxn.tx_admin_amount) || this.isNumber(etxn.tx_policy_amount))
    );

    const orgSettings$ = this.offlineService.getOrgSettings();

    orgSettings$.subscribe((orgSettings) => {
      this.orgSettings = orgSettings;
    });

    this.isCriticalPolicyViolated$ = this.etxn$.pipe(
      map((etxn) => this.isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001)
    );

    this.getPolicyDetails(txId);

    const editExpenseAttachments = this.etxn$.pipe(
      take(1),
      switchMap((etxn) => this.fileService.findByTransactionId(etxn.tx_id)),
      switchMap((fileObjs) => from(fileObjs)),
      concatMap((fileObj: any) =>
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
      reduce((acc, curr) => acc.concat(curr), [])
    );

    this.attachments$ = editExpenseAttachments;
    this.updateFlag$.next();
    this.attachments$.subscribe(noop);
  }

  getReceiptExtension(name) {
    let res = null;

    if (name) {
      const filename = name.toLowerCase();
      const idx = filename.lastIndexOf('.');

      if (idx > -1) {
        res = filename.substring(idx + 1, filename.length);
      }
    }

    return res;
  }

  getReceiptDetails(file) {
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

  async removeExpenseFromReport() {
    const etxn = await this.transactionService.getEtxn(this.activatedRoute.snapshot.params.id).toPromise();

    const deletePopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: 'Remove Expense',
        body: 'Are you sure you want to remove this expense from the report?',
        infoMessage: 'The report amount will be adjusted accordingly.',
        ctaText: 'Remove',
        ctaLoadingText: 'Removing',
        deleteMethod: () => this.reportService.removeTransaction(etxn.tx_report_id, etxn.tx_id),
      },
    });

    await deletePopover.present();
    const { data } = await deletePopover.onDidDismiss();

    if (data && data.status === 'success') {
      this.router.navigate(['/', 'enterprise', 'view_team_report', { id: etxn.tx_report_id }]);
    }
  }

  async flagUnflagExpense() {
    const id = this.activatedRoute.snapshot.params.id;
    const etxn = await this.transactionService.getEtxn(id).toPromise();

    const title = this.isExpenseFlagged ? 'Unflag' : 'Flag';
    const flagUnflagModal = await this.popoverController.create({
      component: FyPopoverComponent,
      componentProps: {
        title,
        formLabel: `Reason for ${title.toLowerCase()}ing expense`,
      },
      cssClass: 'fy-dialog-popover',
    });

    await flagUnflagModal.present();
    const { data } = await flagUnflagModal.onWillDismiss();

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
            this.updateFlag$.next();
            this.loaderService.hideLoader();
          })
        )
        .subscribe(noop);
    }
    this.isExpenseFlagged = etxn.tx_manual_flag;
  }

  viewAttachments() {
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
          },
        });

        await attachmentsModal.present();
      });
  }
}
