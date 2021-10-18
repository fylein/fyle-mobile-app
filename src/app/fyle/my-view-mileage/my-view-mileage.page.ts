import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, IonContent } from '@ionic/angular';
import { from, Observable, of } from 'rxjs';
import { finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { Expense } from 'src/app/core/models/expense.model';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { StatusService } from 'src/app/core/services/status.service';

@Component({
  selector: 'app-my-view-mileage',
  templateUrl: './my-view-mileage.page.html',
  styleUrls: ['./my-view-mileage.page.scss'],
})
export class MyViewMileagePage implements OnInit {
  @ViewChild('comments') commentsContainer: ElementRef;

  extendedMileage$: Observable<Expense>;

  orgSettings$: Observable<any>;

  mileageCustomFields$: Observable<CustomField[]>;

  isCriticalPolicyViolated$: Observable<boolean>;

  isAmountCapped$: Observable<boolean>;

  policyViloations$: Observable<any>;

  comments$: Observable<any>;

  policyDetails;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private offlineService: OfflineService,
    private customInputsService: CustomInputsService,
    private policyService: PolicyService,
    private navController: NavController,
    private statusService: StatusService
  ) {}

  isNumber(val) {
    return typeof val === 'number';
  }

  goBack() {
    this.navController.back();
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

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;

    this.extendedMileage$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.transactionService.getExpenseV2(id)),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.orgSettings$ = this.offlineService.getOrgSettings().pipe(shareReplay(1));

    this.mileageCustomFields$ = this.extendedMileage$.pipe(
      switchMap((res) =>
        this.customInputsService.fillCustomProperties(res.tx_org_category_id, res.tx_custom_properties, true)
      ),
      map((res) =>
        res.map((customProperties) => {
          customProperties.displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
          return customProperties;
        })
      )
    );

    if (id) {
      this.policyViloations$ = this.policyService.getPolicyViolationRules(id);
    } else {
      this.policyViloations$ = of(null);
    }

    this.comments$ = this.statusService.find('transactions', id);

    this.isCriticalPolicyViolated$ = this.extendedMileage$.pipe(
      map((res) => this.isNumber(res.tx_policy_amount) && res.tx_policy_amount < 0.0001)
    );

    this.getPolicyDetails(id);

    this.isAmountCapped$ = this.extendedMileage$.pipe(
      map((res) => this.isNumber(res.tx_admin_amount) || this.isNumber(res.tx_policy_amount))
    );
  }

  ngOnInit() {}
}
