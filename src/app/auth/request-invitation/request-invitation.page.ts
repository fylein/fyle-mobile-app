import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { from, Subject, throwError } from 'rxjs';
import { InvitationRequestsService } from 'src/app/core/services/invitation-requests.service';
import { catchError, concatMap, finalize, takeUntil } from 'rxjs/operators';

enum RequestInvitationPageState {
  notSent,
  success,
  failure,
  alreadySent,
}

@Component({
  selector: 'app-request-invitation',
  templateUrl: './request-invitation.page.html',
  styleUrls: ['./request-invitation.page.scss'],
})
export class RequestInvitationPage {
  fg: FormGroup;

  currentPageState: RequestInvitationPageState = RequestInvitationPageState.notSent;

  onPageExit$: Subject<void>;

  constructor(
    private fb: FormBuilder,
    private activateRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private invitationRequestsService: InvitationRequestsService
  ) {}

  get RequestInvitationStates() {
    return RequestInvitationPageState;
  }

  ionViewWillLeave() {
    this.onPageExit$.next();
    this.onPageExit$.complete();
  }

  ionViewWillEnter() {
    this.onPageExit$ = new Subject();
    const emailParam = this.activateRoute.snapshot.params.email;

    this.fg = this.fb.group({
      email: [emailParam || '', Validators.required],
    });
  }

  sendRequestInvitation() {
    from(this.loaderService.showLoader('Sending request to join organization...'))
      .pipe(
        concatMap(() => this.invitationRequestsService.upsertRouter(this.fg.controls.email.value)),
        finalize(async () => {
          await this.loaderService.hideLoader();
        }),
        catchError((err) => {
          if (err.status === 400) {
            this.currentPageState = this.RequestInvitationStates.alreadySent;
          } else {
            this.currentPageState = this.RequestInvitationStates.failure;
          }
          return throwError(err);
        }),
        takeUntil(this.onPageExit$)
      )
      .subscribe(() => {
        this.currentPageState = this.RequestInvitationStates.success;
      });
  }
}
