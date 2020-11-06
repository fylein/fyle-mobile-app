import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { forkJoin, from, iif, noop, Observable, of } from 'rxjs';
import { finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { AddExpensesToReportComponent } from './add-expenses-to-report/add-expenses-to-report.component';

@Component({
  selector: 'app-my-edit-report',
  templateUrl: './my-edit-report.page.html',
  styleUrls: ['./my-edit-report.page.scss'],
})
export class MyEditReportPage implements OnInit {

  extendedReport$: Observable<ExtendedReport>;
  reportedEtxns$: Observable<Expense[]>;
  unReportedEtxns: Expense[];
  deleteExpensesIdList = [];
  addedExpensesIdList = [];
  isReportEdited = false;
  reportTitle: string;
  isPurposeChanged = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private reportService: ReportService,
    private authService: AuthService,
    private transactionService: TransactionService,
    private modalController: ModalController,
  ) { }

  goBack() {
    this.router.navigate(['/', 'enterprise', 'my_view_report', { id: this.activatedRoute.snapshot.params.id }]);
  }

  checkReportEdited = function () {
    this.isReportEdited = (this.deleteExpensesIdList.length > 0) || (this.addedExpensesIdList.length > 0) || this.isPurposeChanged;
  };

  ngOnInit() {
  }

  getVendorName(etxn) {
    const category = etxn.tx_org_category && etxn.tx_org_category.toLowerCase();
    let vendorName = etxn.tx_vendor || 'Expense';

    if (category === 'mileage') {
      vendorName = etxn.tx_distance;
      vendorName += ' ' + etxn.tx_distance_unit;
    } else if (category === 'per diem') {
      vendorName = etxn.tx_num_days;
      vendorName += ' Days';
    }

    return vendorName;
  }

  async showAddExpensesToReportModal() {
    const AddExpensesToReportModal = await this.modalController.create({
      component: AddExpensesToReportComponent,
      componentProps: {
        unReportedEtxns: this.unReportedEtxns
      }
    });

    await AddExpensesToReportModal.present();

    const { data } = await AddExpensesToReportModal.onWillDismiss();
    if (data && data.selectedTxnIds) {
      this.addedExpensesIdList = data.selectedTxnIds;
      this.checkReportEdited();
    }
  }

  addExpenseToDeleteList(etxn: Expense) {
    etxn.isHidden = true;
    this.deleteExpensesIdList.push(etxn.tx_id);
    this.checkReportEdited();
    // Todo: update report amount and count after 
    // 1. deselct old reported expense and 
    // 2. select new expense
  };

  undoExpenseDelete(etxn: Expense) {
    etxn.isHidden = false;
    let index = this.deleteExpensesIdList.indexOf(etxn.tx_id);
    this.deleteExpensesIdList.splice(index, 1);
    this.checkReportEdited();
    // Todo: update report amount and count after 
    // 1. deselct old reported expense and 
    // 2. select new expense
  }

  removeExpenseFromAddedExpensesList(etxn: Expense) {
    etxn.isSelected = false;
    let index = this.addedExpensesIdList.indexOf(etxn.tx_id);
    this.addedExpensesIdList.splice(index, 1);
    this.checkReportEdited();
    // Todo: update report amount and count after 
    // 1. deselct old reported expense and 
    // 2. select new expense
  }

  setPurposeChanged() {
    this.isPurposeChanged = true;
    this.checkReportEdited();
  }

  removeTxnFromReport() {
    let removeTxnList$ = [];
    this.deleteExpensesIdList.forEach(txnId => {
      removeTxnList$.push(this.reportService.removeTransaction(this.activatedRoute.snapshot.params.id, txnId))
    });

    return forkJoin(removeTxnList$);
  }

  saveReport() {
    let report = {
      purpose: this.reportTitle,
      id: this.activatedRoute.snapshot.params.id
    }

    this.reportService.createDraft(report).pipe(
      switchMap(res => {
        return iif(() => (this.addedExpensesIdList.length > 0), this.reportService.addTransactions(this.activatedRoute.snapshot.params.id, this.addedExpensesIdList) ,of(false));
      }),
      switchMap(res => {
        return iif(() => (this.deleteExpensesIdList.length > 0), this.removeTxnFromReport() ,of(false));
      }),
      finalize(() => {
        this.addedExpensesIdList = [];
        this.deleteExpensesIdList = [];
        this.router.navigate(['/', 'enterprise', 'my_reports']);
      })
    ).subscribe(noop)
  }

  ionViewWillEnter() {
    this.extendedReport$ = this.reportService.getReport(this.activatedRoute.snapshot.params.id);

    this.extendedReport$.subscribe(res => {
      this.reportTitle = res.rp_purpose;
    })

    this.reportedEtxns$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return from(this.authService.getEou()).pipe(
          switchMap(eou => {
            return this.transactionService.getAllETxnc({
              tx_org_user_id: 'eq.' + eou.ou.id,
              tx_report_id: 'eq.' + this.activatedRoute.snapshot.params.id,
              order: 'tx_txn_dt.desc,tx_id.desc'
            });
          }),
          map((etxns: Expense[]) => {
            return etxns.map(etxn => {
              etxn.vendorDetails = this.getVendorName(etxn);
              return etxn as Expense;
            });
          }),
          shareReplay()
        );
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    );

    const queryParams = {
      tx_report_id : 'is.null',
      tx_state: 'in.(COMPLETE)',
      order: 'tx_txn_dt.desc'
    };

    this.transactionService.getAllExpenses({ queryParams }).pipe(
      map((etxns : Expense[]) => {
        etxns.forEach((etxn, i) => {
          etxn.vendorDetails = this.getVendorName(etxn);
          etxn.showDt = true;
          etxn.isSelected = false;
          if (i > 0 && (etxn.tx_txn_dt === etxns[i - 1].tx_txn_dt)) {
            etxn.showDt = false;
          }
        });
        this.unReportedEtxns = etxns;
      }),
    ).subscribe(noop);

    // this.unReportedEtxns$.subscribe(res => {
    //   debugger;
    // })
  }

}
