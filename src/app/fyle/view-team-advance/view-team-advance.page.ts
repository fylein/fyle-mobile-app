import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { File } from 'src/app/core/models/file.model';
import { Approval } from 'src/app/core/models/approval.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { FileService } from 'src/app/core/services/file.service';
import { from, noop, Subject } from 'rxjs';
import { switchMap, finalize, shareReplay, concatMap, map, reduce, startWith, take } from 'rxjs/operators';
import { PopupService } from 'src/app/core/services/popup.service';
import { PopoverController } from '@ionic/angular';
import { AdvanceActionsComponent } from './advance-actions/advance-actions.component';
import { ApproveAdvanceComponent } from './approve-advance/approve-advance.component';
import { SendBackAdvanceComponent } from './send-back-advance/send-back-advance.component';
import { RejectAdvanceComponent } from './reject-advance/reject-advance.component';

@Component({
  selector: 'app-view-team-advance',
  templateUrl: './view-team-advance.page.html',
  styleUrls: ['./view-team-advance.page.scss'],
})
export class ViewTeamAdvancePage implements OnInit {

  advanceRequest$: Observable<ExtendedAdvanceRequest>;
  actions$: Observable<any>;
  approvals$: Observable<Approval[]>;
  activeApprovals$: Observable<Approval[]>;
  attachedFiles$: Observable<File[]>;
  advanceRequestCustomFields$: Observable<CustomField[]>;
  refreshApprovers$ = new Subject();
  showAdvanceActions$: Observable<boolean>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private advanceRequestService: AdvanceRequestService,
    private fileService: FileService,
    private router: Router,
    private popupService: PopupService,
    private popoverController: PopoverController
  ) { }

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;
    this.advanceRequest$ = this.refreshApprovers$.pipe(
      startWith(true),
      switchMap(() => {
        return this.advanceRequestService.getAdvanceRequest(id);
      })
      // finalize(() => from(this.loaderService.hideLoader())),
      // shareReplay()
    );

    this.actions$ = this.advanceRequestService.getActions(id).pipe(
      shareReplay()
    );

    this.showAdvanceActions$ = this.actions$.pipe(map(advanceActions => advanceActions.can_approve || advanceActions.can_inquire || advanceActions.can_reject))

    this.actions$.subscribe(console.log);

    this.approvals$ = this.advanceRequestService.getActiveApproversByAdvanceRequestId(id);

    this.activeApprovals$ = this.refreshApprovers$.pipe(
      startWith(true),
      switchMap(() => {
        return this.approvals$;
      }),
      map(approvals => approvals.filter(approval => approval.state !== 'APPROVAL_DISABLED'))
    );

    this.attachedFiles$ = this.fileService.findByAdvanceRequestId(id).pipe(
      switchMap(res => {
        return from(res);
      }),
      concatMap(file => {
        return this.fileService.downloadUrl(file.id).pipe(
          map(url => {
            file.file_download_url = url;
            return file as File;
          })
        )
      }),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }, [] as File[])
    );

    this.advanceRequestCustomFields$ = this.advanceRequest$.pipe(
      map(res => {
        return this.advanceRequestService.modifyAdvanceRequestCustomFields(JSON.parse(res.areq_custom_field_values));
      })
    );
  }

  // Todo: Redirect to edit advance page
  edit() {
  }

  onUpdateApprover(message: string) {
    if (message) {
      this.refreshApprovers$.next();
    }
  }

  async delete() {
    const id = this.activatedRoute.snapshot.params.id;

    const popupResults = await this.popupService.showPopup({
      header: 'Confirm',
      message: 'Are you sure you want to delete this Advance Request',
      primaryCta: {
        text: 'Delete Advance Request'
      }
    });

    if (popupResults === 'primary') {
      this.advanceRequestService.delete(id).subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'team_advance']);
      });
    }
  }

  async openAdvanceActionsPopover() {
    const actions = await this.actions$.toPromise();
    const areq = await this.advanceRequest$.pipe(take(1)).toPromise();

    const advanceActions = await this.popoverController.create({
      componentProps: {
        actions,
        areq
      },
      component: AdvanceActionsComponent,
      cssClass: 'dialog-popover'
    });

    await advanceActions.present();

    const { data } = await advanceActions.onWillDismiss();

    if (data && data.command === 'approveAdvance') {
      await this.showApproveAdvanceSummaryPopover();
    } else if (data && data.command === 'sendBackAdvance') {
      await this.showSendBackAdvanceSummaryPopover();
    } else if (data && data.command === 'rejectAdvance') {
      await this.showRejectAdvanceSummaryPopup();
    }
  }

  async showApproveAdvanceSummaryPopover() {
    const areq = await this.advanceRequest$.pipe(take(1)).toPromise();
    const showApprover = await this.popoverController.create({
      component: ApproveAdvanceComponent,
      cssClass: 'dialog-popover',
      componentProps: {
        areq: areq
      }
    });

    await showApprover.present();

    const { data } = await showApprover.onWillDismiss();

    if (data && data.goBack) {
      this.router.navigate(['/', 'enterprise', 'team_advance']);
    }
  }

  async showSendBackAdvanceSummaryPopover() {
    const areq = await this.advanceRequest$.pipe(take(1)).toPromise();
    const showApprover = await this.popoverController.create({
      component: SendBackAdvanceComponent,
      cssClass: 'dialog-popover',
      componentProps: {
        areq: areq
      }
    });

    await showApprover.present();

    const { data } = await showApprover.onWillDismiss();

    if (data && data.goBack) {
      this.router.navigate(['/', 'enterprise', 'team_advance']);
    }
  }

  async showRejectAdvanceSummaryPopup() {
    const areq = await this.advanceRequest$.pipe(take(1)).toPromise();
    const showApprover = await this.popoverController.create({
      component: RejectAdvanceComponent,
      cssClass: 'dialog-popover',
      componentProps: {
        areq: areq
      }
    });

    await showApprover.present();

    const { data } = await showApprover.onWillDismiss();

    if (data && data.goBack) {
      this.router.navigate(['/', 'enterprise', 'team_advance']);
    }
  }

  ngOnInit() {
  }
}
