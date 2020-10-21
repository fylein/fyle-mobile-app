import { Component, OnInit } from '@angular/core';
import { from, forkJoin, Observable } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap, finalize, map } from 'rxjs/operators';
import { PolicyService } from 'src/app/core/services/policy.service';
import { Expense } from 'src/app/core/models/expense.model';

@Component({
  selector: 'app-my-view-expense',
  templateUrl: './my-view-expense.page.html',
  styleUrls: ['./my-view-expense.page.scss'],
})
export class MyViewExpensePage implements OnInit {

  etxn$: Observable<Expense>;
  policyViloations$;
  isAmountCapped$;


  constructor(
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private policyService: PolicyService
  ) { }

  ngOnInit() {
    const txId = this.activatedRoute.snapshot.params.id;

    this.etxn$ = this.transactionService.get(txId);
    this.policyViloations$ = this.policyService.getPolicyRuleViolationsAndQueryParams(txId);
    this.isAmountCapped$ = this.etxn$.pipe(
      map((etxn: any) => etxn.admin_amount || etxn.policy_amount)
    );



    // from(this.loaderService.showLoader()).pipe(
    //   switchMap(() => {
    //     return forkJoin(
    //       [
    //         etxn$,
    //         policyViloations$
    //       ]
    //     );
    //   }),
    //   finalize(() => from(this.loaderService.hideLoader()))
    // ).subscribe((res) => {

    //   if ((this.etxn.admin_amount) || (this.etxn.policy_amount)) {
    //     this.isAmountCapped = true;
    //   }
    // });

  }

  ionViewWillEnter() {
  }

}
