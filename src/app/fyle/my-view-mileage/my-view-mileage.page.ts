import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from, Observable } from 'rxjs';
import { finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { TransactionService } from 'src/app/core/services/transaction.service';

@Component({
  selector: 'app-my-view-mileage',
  templateUrl: './my-view-mileage.page.html',
  styleUrls: ['./my-view-mileage.page.scss'],
})
export class MyViewMileagePage implements OnInit {

  extendedMileage$: Observable<any>;
  orgSettings$: Observable<any>;
  mileageCustomFields$: Observable<CustomField[]>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private offlineService : OfflineService
  ) { }

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
      map(res => {
        debugger;
         return this.transactionService.modifyCustomFields(res.tx_custom_properties);
      })
    );

    this.mileageCustomFields$.subscribe((res) => {
      debugger;
    })


  }


  ngOnInit() {
  }

}
