import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { Expense } from 'src/app/core/models/expense.model';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { TransactionService } from 'src/app/core/services/transaction.service';

@Component({
  selector: 'app-my-view-mileage',
  templateUrl: './my-view-mileage.page.html',
  styleUrls: ['./my-view-mileage.page.scss'],
})
export class MyViewMileagePage implements OnInit {

  extendedMileage$: Observable<Expense>;
  orgSettings$: Observable<any>;
  mileageCustomFields$: Observable<CustomField[]>;
  isCriticalPolicyViolated$: Observable<boolean>;
  isAmountCapped$: Observable<boolean>;
  policyViloations$: Observable<any>;
  @ViewChild(IonContent) myContent: IonContent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private offlineService : OfflineService,
    private customInputsService: CustomInputsService,
    private policyService: PolicyService
  ) { }

  isNumber(val) {
    return typeof val === 'number';
  }

  goBack() {
    // Todo: All logic of redirect to previous page
    //debugger;
    this.myContent.scrollToBottom();
  }

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;

    this.extendedMileage$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.transactionService.getExpenseV2(id);
      }),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay()
    );

    this.orgSettings$ = this.offlineService.getOrgSettings().pipe(
      shareReplay()
    );

    this.mileageCustomFields$ = this.extendedMileage$.pipe(
      switchMap(res => {
        return this.customInputsService.fillCustomProperties(res.tx_org_category_id, res.tx_custom_properties, true);
      }),
      map(res => {
        return res.map(customProperties => { 
          customProperties.displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties); 
          return customProperties; 
        })
      })
    )

    this.policyViloations$ = this.policyService.getPolicyRuleViolationsAndQueryParams(id);

    this.isCriticalPolicyViolated$ = this.extendedMileage$.pipe(
      map(res => {
        return this.isNumber(res.tx_policy_amount) && res.tx_policy_amount < 0.0001
      })
    )

    this.isAmountCapped$ = this.extendedMileage$.pipe(
      map(res => {
        return this.isNumber(res.tx_admin_amount) || this.isNumber(res.tx_policy_amount)
      })
    )

  }


  ngOnInit() {
  }

}
