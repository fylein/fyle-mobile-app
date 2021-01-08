import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { NavController } from '@ionic/angular';
import {concat, from, Observable, Subject} from 'rxjs';
import {finalize, map, shareReplay, switchMap, takeUntil} from 'rxjs/operators';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { Expense } from 'src/app/core/models/expense.model';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { PerDiemService } from 'src/app/core/services/per-diem.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import {NetworkService} from '../../core/services/network.service';

@Component({
  selector: 'app-my-view-per-diem',
  templateUrl: './my-view-per-diem.page.html',
  styleUrls: ['./my-view-per-diem.page.scss'],
})
export class MyViewPerDiemPage implements OnInit {

  extendedPerDiem$: Observable<Expense>;
  orgSettings$: Observable<any>;
  perDiemCustomFields$: Observable<CustomField[]>;
  perDiemRate$: Observable<any>;
  isCriticalPolicyViolated$: Observable<boolean>;
  isAmountCapped$: Observable<boolean>;
  policyViloations$: Observable<any>;
  isConnected$: Observable<boolean>;
  onPageExit = new Subject();

  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
    private loaderService: LoaderService,
    private offlineService: OfflineService,
    private customInputsService: CustomInputsService,
    private perDiemService: PerDiemService,
    private policyService: PolicyService,
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

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;

    this.extendedPerDiem$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.transactionService.getExpenseV2(id);
      }),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay()
    );

    this.orgSettings$ = this.offlineService.getOrgSettings().pipe(
      shareReplay()
    );

    this.perDiemCustomFields$ = this.extendedPerDiem$.pipe(
      switchMap(res => {
        return this.customInputsService.fillCustomProperties(res.tx_org_category_id, res.tx_custom_properties, true);
      }),
      map(res => {
        return res.map(customProperties => {
          customProperties.displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
          return customProperties;
        });
      })
    );

    this.perDiemRate$ = this.extendedPerDiem$.pipe(
      switchMap(res => {
        const perDiemRateId = parseInt(res.tx_per_diem_rate_id, 10);
        return this.perDiemService.getRate(perDiemRateId);
      })
    );

    this.policyViloations$ = this.policyService.getPolicyRuleViolationsAndQueryParams(id);

    // this.policyViloations$.subscribe(res => {
    //   debugger;
    // })

    this.isCriticalPolicyViolated$ = this.extendedPerDiem$.pipe(
      map(res => {
        return this.isNumber(res.tx_policy_amount) && res.tx_policy_amount < 0.0001;
      })
    );

    this.isAmountCapped$ = this.extendedPerDiem$.pipe(
      map(res => {
        return this.isNumber(res.tx_admin_amount) || this.isNumber(res.tx_policy_amount);
      })
    );

  }

  ngOnInit() {
  }

}
