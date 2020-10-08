import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, from, Observable } from 'rxjs';
import { concatMap, finalize, map, reduce, shareReplay, switchMap } from 'rxjs/operators';
import { Approval } from 'src/app/core/models/approval.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { File } from 'src/app/core/models/file.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { FileService } from 'src/app/core/services/file.service';
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
  attachedFiles$: Observable<File[]>;
  advanceRequestCustomFileds$: Observable<CustomField[]>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private advanceRequestService: AdvanceRequestService,
    private fileService: FileService
  ) { }

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;
    this.advanceRequest$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.advanceRequestService.getAdvanceRequest(id);
      }),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay()
    );

    this.actions$ = this.advanceRequestService.getActions(id);
    this.activeApprovals$ = this.advanceRequestService.getActiveApproversByAdvanceRequestId(id);
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

    this.advanceRequestCustomFileds$ = this.advanceRequest$.pipe(
      map(res => {
         return JSON.parse(res.areq_custom_field_values);
      })
    )
  }
  

  ngOnInit() {
  }

}
