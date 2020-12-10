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
import { switchMap, finalize, shareReplay, concatMap, map, reduce, startWith } from 'rxjs/operators';
import { PopupService } from 'src/app/core/services/popup.service';

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private advanceRequestService: AdvanceRequestService,
    private fileService: FileService,
    private router: Router,
    private popupService: PopupService
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
        text: 'Okay'
      },
      secondaryCta: {
        text: 'Cancel'
      }
    });

    if (popupResults === 'primary') {
      this.advanceRequestService.delete(id).subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_advances']);
      });
    }
  }

  ngOnInit() {
  }
}
