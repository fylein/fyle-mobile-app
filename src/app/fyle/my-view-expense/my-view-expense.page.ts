import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {from, forkJoin, Observable, concat, Subject} from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import {ActivatedRoute, Router} from '@angular/router';
import {switchMap, finalize, map, shareReplay, concatMap, tap, reduce, takeUntil} from 'rxjs/operators';
import { PolicyService } from 'src/app/core/services/policy.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { Expense } from 'src/app/core/models/expense.model';
import { ModalController, NavController } from '@ionic/angular';
import { FileService } from 'src/app/core/services/file.service';
import { StatusService } from 'src/app/core/services/status.service';
import { ViewAttachmentComponent } from './view-attachment/view-attachment.component';
import {NetworkService} from '../../core/services/network.service';

@Component({
  selector: 'app-my-view-expense',
  templateUrl: './my-view-expense.page.html',
  styleUrls: ['./my-view-expense.page.scss'],
})
export class MyViewExpensePage implements OnInit {

  etxn$: Observable<Expense>;
  policyViloations$: Observable<any>;
  isAmountCapped$: Observable<boolean>;
  isCriticalPolicyViolated$: Observable<boolean>;
  allExpenseCustomFields$: Observable<any>;
  customProperties$: Observable<any>;
  etxnWithoutCustomProperties$: Observable<any>;
  orgSettings: any;
  attachments$: Observable<any>;
  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  currencyOptions;

  constructor(
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private policyService: PolicyService,
    private offlineService: OfflineService,
    private customInputsService: CustomInputsService,
    private statusService: StatusService,
    private fileService: FileService,
    private modalController: ModalController,
    private navController: NavController,
    private networkService: NetworkService,
    private router: Router
  ) { }

  isNumber(val) {
    return typeof val === 'number';
  }

  goBack() {
    this.navController.back();
  }

  getDisplayValue(customProperties) {
    return this.customInputsService.getCustomPropertyDisplayValue(customProperties);
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
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    });
  }

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    const txId = this.activatedRoute.snapshot.params.id;
    this.currencyOptions = {
      disabled: true
    };

    this.etxnWithoutCustomProperties$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.transactionService.getEtxn(txId);
      }),
      shareReplay()
    );

    this.customProperties$ = this.etxnWithoutCustomProperties$.pipe(
      concatMap(etxn => {
        return this.customInputsService.fillCustomProperties(etxn.tx_org_category_id, etxn.tx_custom_properties, true);
      }),
      shareReplay()
    );

    this.etxn$ = forkJoin(
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

    this.policyViloations$ = this.policyService.getPolicyRuleViolationsAndQueryParams(txId);

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
