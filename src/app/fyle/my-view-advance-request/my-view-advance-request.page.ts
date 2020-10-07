import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, from, Observable } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { Approval } from 'src/app/core/models/approval.model';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-my-view-advance-request',
  templateUrl: './my-view-advance-request.page.html',
  styleUrls: ['./my-view-advance-request.page.scss'],
})
export class MyViewAdvanceRequestPage implements OnInit {
  advanceRequest$: Observable<ExtendedAdvanceRequest>;
  actions$: Observable<any>;
  activeApprovals$: Observable<Approval[]>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private advanceRequestService: AdvanceRequestService
  ) { }

  ionViewWillEnter () {
    const id = this.activatedRoute.snapshot.params.id;
    this.advanceRequest$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.advanceRequestService.getAdvanceRequest(id);
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    );

    this.actions$ = this.advanceRequestService.getActions(id);
    this.activeApprovals$ = this.advanceRequestService.getActiveApproversByAdvanceRequestId(id);

    // this.activeApprovals$.subscribe((res) => {
    //   debugger;
    // })

    // forkJoin({

    // })


  }
  

  ngOnInit() {
  }

}
