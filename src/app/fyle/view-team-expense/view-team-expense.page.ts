import { Component, OnInit } from '@angular/core';
import { Observable, from, forkJoin, Subject, combineLatest } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OfflineService } from 'src/app/core/services/offline.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { switchMap, shareReplay, concatMap, map, finalize, reduce, tap } from 'rxjs/operators';
import { StatusService } from 'src/app/core/services/status.service';
import { ReportService } from 'src/app/core/services/report.service';
import { FileService } from 'src/app/core/services/file.service';
import { ModalController } from '@ionic/angular';
import { ViewAttachmentComponent } from './view-attachment/view-attachment.component';

@Component({
  selector: 'app-view-team-expense',
  templateUrl: './view-team-expense.page.html',
  styleUrls: ['./view-team-expense.page.scss'],
})
export class ViewTeamExpensePage implements OnInit {

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
  reportId;
  currencyOptions;
  updateFlag$ = new Subject();

  constructor(
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private offlineService: OfflineService,
    private customInputsService: CustomInputsService,
    private statusService: StatusService,
    private router: Router,
    private fileService: FileService,
    private modalController: ModalController,
    private router: Router
  ) { }

  isNumber(val) {
    return typeof val === 'number';
  }

  goBackToReport() {
    this.router.navigate(['/', 'enterprise', 'view_team_report', {id: this.reportId}])
  }

  isPolicyComment(estatus) {
    return estatus.st_org_user_id === 'POLICY';
  }

  scrollToComments() {
    document.getElementById('commentsSection').scrollIntoView();
  }

  getDisplayValue(customProperties) {
    return this.customInputsService.getCustomPropertyDisplayValue(customProperties);
  }

  onUpdateFlag(event) {
    if (event) {
      this.updateFlag$.next();
    }
  }

  goBack() {
    this.router.navigate(['/', 'enterprise', 'view_team_report', {id: this.reportId}]);
  }

  ngOnInit() {}

  ionViewWillEnter() {
    const txId = this.activatedRoute.snapshot.params.id;
    this.currencyOptions = {
      disabled: true
    };

    this.etxnWithoutCustomProperties$ = this.updateFlag$.pipe(
      switchMap(() => {
        return from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.transactionService.getEtxn(txId);
          })
        );
      }),
      finalize(() => this.loaderService.hideLoader()),
      shareReplay()
    );

    this.etxnWithoutCustomProperties$.subscribe(res => {
      this.reportId = res.tx_report_id;
    });

    this.customProperties$ = this.etxnWithoutCustomProperties$.pipe(
      concatMap(etxn => {
        return this.customInputsService.fillCustomProperties(etxn.tx_org_category_id, etxn.tx_custom_properties, true);
      }),
      shareReplay()
    );

    this.etxn$ = combineLatest(
      [
        this.etxnWithoutCustomProperties$,
        this.customProperties$
      ]).pipe(
        map(res => {
          res[0].tx_custom_properties = res[1];
          return res[0];
        }),
        finalize(() => this.loaderService.hideLoader())
      );

    this.policyViloations$ = this.etxnWithoutCustomProperties$.pipe(
      concatMap(etxn => {
        return this.statusService.find('transactions', etxn.tx_id);
      }),
      map(comments => {
        return comments.filter(this.isPolicyComment);
      })
    );

    this.canFlagOrUnflag$ = this.etxnWithoutCustomProperties$.pipe(
      map(etxn => {
        return ['COMPLETE', 'POLICY_APPROVED', 'APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING'].indexOf(etxn.tx_state) > -1;
      })
    );

    this.canDelete$ = this.etxnWithoutCustomProperties$.pipe(
      concatMap(etxn => {
        return this.reportService.getTeamReport(etxn.tx_report_id);
      }),
      map(report => {
        if (report.rp_num_transactions === 1) {
          return false;
        }
        return ['PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].indexOf(report.tx_state) < 0;
      })
    );

    this.isAmountCapped$ = this.etxn$.pipe(
      map(etxn => this.isNumber(etxn.tx_admin_amount) || this.isNumber(etxn.tx_policy_amount))
    );

    const orgSettings$ = this.offlineService.getOrgSettings();

    orgSettings$.subscribe(orgSettings => {
      this.orgSettings = orgSettings;
    });

    this.isCriticalPolicyViolated$ = this.etxn$.pipe(
      map(etxn => this.isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001),
    );

    const editExpenseAttachments = this.etxn$.pipe(
      switchMap(etxn => this.fileService.findByTransactionId(etxn.tx_id)),
      switchMap(fileObjs => {
        return from(fileObjs);
      }),
      concatMap((fileObj: any) => {
        return this.fileService.downloadUrl(fileObj.id).pipe(
          map(downloadUrl => {
            fileObj.url = downloadUrl;
            const details = this.getReceiptDetails(fileObj);
            fileObj.type = details.type;
            fileObj.thumbnail = details.thumbnail;
            return fileObj;
          })
        );
      }),
      reduce((acc, curr) => acc.concat(curr), [])
    );

    this.attachments$ = editExpenseAttachments;
    this.updateFlag$.next();
    this.attachments$.subscribe(console.log);
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
      thumbnail: 'img/fy-receipt.svg'
    };

    if (ext && (['pdf'].indexOf(ext) > -1)) {
      res.type = 'pdf';
      res.thumbnail = 'img/fy-pdf.svg';
    } else if (ext && (['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1)) {
      res.type = 'image';
      res.thumbnail = file.url;
    }

    return res;
  }

  viewAttachments() {
    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.attachments$;
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(async (attachments) => {
      const attachmentsModal = await this.modalController.create({
        component: ViewAttachmentComponent,
        componentProps: {
          attachments
        }
      });

      await attachmentsModal.present();
    });
  }
}
