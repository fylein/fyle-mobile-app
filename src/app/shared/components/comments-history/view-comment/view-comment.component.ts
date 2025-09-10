import { Component, ElementRef, Input, OnInit, ViewChild, inject } from '@angular/core';
import { IonContent, ModalController, Platform, PopoverController } from '@ionic/angular/standalone';
import { from, Observable, Subject } from 'rxjs';
import { finalize, map, startWith, switchMap } from 'rxjs/operators';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatusService } from 'src/app/core/services/status.service';
import { TrackingService } from '../../../../core/services/tracking.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import dayjs from 'dayjs';
import { DateWithTimezonePipe } from 'src/app/shared/pipes/date-with-timezone.pipe';
import { ExpenseCommentService as SpenderExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { ExpenseCommentService as ApproverExpenseCommentService } from 'src/app/core/services/platform/v1/approver/expense-comment.service';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { AuditHistoryComponent } from '../audit-history/audit-history.component';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DateWithTimezonePipe as DateWithTimezonePipe_1 } from '../../../pipes/date-with-timezone.pipe';

@Component({
  selector: 'app-view-comment',
  templateUrl: './view-comment.component.html',
  styleUrls: ['./view-comment.component.scss'],
  providers: [DateWithTimezonePipe],
  imports: [
    IonicModule,
    MatIcon,
    NgClass,
    AuditHistoryComponent,
    MatInput,
    FormsModule,
    TranslocoPipe,
    DateWithTimezonePipe_1,
  ],
})
export class ViewCommentComponent implements OnInit {
  private statusService = inject(StatusService);

  private authService = inject(AuthService);

  private modalController = inject(ModalController);

  private popoverController = inject(PopoverController);

  private trackingService = inject(TrackingService);

  private elementRef = inject(ElementRef);

  platform = inject(Platform);

  private dateWithTimezonePipe = inject(DateWithTimezonePipe);

  private spenderExpenseCommentService = inject(SpenderExpenseCommentService);

  private approverExpenseCommentService = inject(ApproverExpenseCommentService);

  private translocoService = inject(TranslocoService);

  private advanceRequestService = inject(AdvanceRequestService);

  private router = inject(Router);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() objectType: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() objectId: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() view: ExpenseView;

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild(IonContent, { static: false }) content: IonContent;

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('commentInput') commentInput: ElementRef<HTMLInputElement>;

  estatuses$: Observable<ExtendedStatus[]>;

  totalCommentsCount$: Observable<number>;

  newComment: string;

  refreshEstatuses$: Subject<void> = new Subject();

  isCommentAdded: boolean;

  isCommentsView = true;

  systemComments: ExtendedStatus[];

  userComments: ExtendedStatus[];

  type: string;

  systemEstatuses: ExtendedStatus[];

  showDt: boolean;

  isSwipe = false;

  setContentScrollToBottom(): void {
    this.content.scrollToBottom(500);
  }

  addComment(): void {
    if (this.newComment) {
      const data = {
        comment: this.newComment,
      };

      this.newComment = null;
      this.commentInput.nativeElement.focus();
      this.isCommentAdded = true;

      const isExpense = this.objectType === 'transactions';
      const isAdvanceRequest = this.objectType === 'advance_requests';

      if (isExpense) {
        const commentsPayload = [
          {
            expense_id: this.objectId,
            comment: data.comment,
            notify: false,
          },
        ];

        const post$ =
          this.view === ExpenseView.team
            ? this.approverExpenseCommentService.post(commentsPayload)
            : this.spenderExpenseCommentService.post(commentsPayload);

        post$.pipe().subscribe(() => {
          this.refreshEstatuses$.next(null);
        });
      } else if (isAdvanceRequest) {
        const post$ = this.isTeamAdvanceRoute()
          ? this.advanceRequestService.postCommentPlatformForApprover(this.objectId, data.comment)
          : this.advanceRequestService.postCommentPlatform(this.objectId, data.comment);
        post$.pipe().subscribe(() => {
          this.refreshEstatuses$.next(null);
        });
      } else {
        this.statusService
          .post(this.objectType, this.objectId, data)
          .pipe()
          .subscribe(() => {
            this.refreshEstatuses$.next(null);
          });
      }
    }
  }

  async closeCommentModal(): Promise<void> {
    const title = this.translocoService.translate('viewComment.discardMessage');
    const message = this.translocoService.translate('viewComment.confirmDiscard');
    if (this.newComment) {
      const unsavedChangesPopOver = await this.popoverController.create({
        component: PopupAlertComponent,
        componentProps: {
          title,
          message,
          primaryCta: {
            text: this.translocoService.translate('viewComment.discard'),
            action: 'discard',
          },
          secondaryCta: {
            text: this.translocoService.translate('viewComment.cancel'),
            action: 'cancel',
          },
        },
        cssClass: 'pop-up-in-center',
      });

      await unsavedChangesPopOver.present();
      const { data } = await unsavedChangesPopOver.onWillDismiss<{ action: string }>();

      if (data && data.action === 'discard') {
        this.trackingService.viewComment();
        this.modalController.dismiss();
      }
    } else {
      if (this.isCommentAdded) {
        this.trackingService.addComment();
        this.modalController.dismiss({ updated: true });
      } else {
        this.trackingService.viewComment();
        this.modalController.dismiss();
      }
    }
  }

  segmentChanged(): void {
    this.isCommentsView = !this.isCommentsView;
    if (!this.isSwipe) {
      this.trackingService.commentsHistoryActions({
        action: 'click',
        segment: this.isCommentsView ? 'comments' : 'history',
      });
    }
    this.isSwipe = false;
  }

  swipeRightToHistory(event: { direction: number }): void {
    this.isSwipe = true;
    if (event && event.direction === 2) {
      const historyBtn = (this.elementRef.nativeElement as HTMLElement).getElementsByClassName(
        'view-comment--segment-block__btn',
      )[1] as HTMLElement;
      historyBtn.click();
      this.trackingService.commentsHistoryActions({
        action: 'swipe',
        segment: 'comments',
      });
    }
  }

  swipeLeftToComments(event: { direction: number }): void {
    this.isSwipe = true;
    if (event && event.direction === 4) {
      const commentsBtn = (this.elementRef.nativeElement as HTMLElement).getElementsByClassName(
        'view-comment--segment-block__btn',
      )[0] as HTMLElement;
      commentsBtn.click();
      this.trackingService.commentsHistoryActions({
        action: 'swipe',
        segment: 'history',
      });
    }
  }

  ngOnInit(): void {
    const eou$ = from(this.authService.getEou());

    this.estatuses$ = this.refreshEstatuses$.pipe(
      startWith(0),
      switchMap(() => eou$),
      switchMap((eou) => {
        const isExpense = this.objectType === 'transactions';
        const isAdvanceRequest = this.objectType === 'advance_requests';
        // Determine the correct userId based on the object type:
        // - For Expenses (Platform API), the status object contains `user_id`, so we compare with `eou.us.id`.
        // - For Advance Requests (Platform API), the status object contains `user_id`, so we compare with `eou.us.id`.
        // - For other objects (Public API), the status object contains `org_user_id`, so we compare with `eou.ou.id`.
        const userId = isExpense || isAdvanceRequest ? eou?.us?.id : eou?.ou?.id;

        const comments$: Observable<ExtendedStatus[]> = isExpense
          ? this.view === ExpenseView.team
            ? this.approverExpenseCommentService.getTransformedComments(this.objectId)
            : this.spenderExpenseCommentService.getTransformedComments(this.objectId)
          : this.objectType === 'advance_requests'
            ? this.isTeamAdvanceRoute()
              ? this.advanceRequestService.getCommentsByAdvanceRequestIdPlatformForApprover(this.objectId)
              : this.advanceRequestService.getCommentsByAdvanceRequestIdPlatform(this.objectId)
            : this.statusService.find(this.objectType, this.objectId);

        return comments$.pipe(
          map((res) =>
            res.map((status) => {
              // For advance requests, the flags are already correctly set by the service
              // Only override them for non-advance-request objects
              if (this.objectType !== 'advance_requests') {
                status.isBotComment = ['SYSTEM', 'POLICY'].includes(status?.st_org_user_id);
                status.isSelfComment = userId === status?.st_org_user_id;
                status.isOthersComment = userId !== status?.st_org_user_id;
              }
              return status;
            }),
          ),
          map((res) => res.sort((a, b) => new Date(a.st_created_at).valueOf() - new Date(b.st_created_at).valueOf())),
          finalize(() => {
            setTimeout(() => {
              this.setContentScrollToBottom();
            }, 500);
          }),
        );
      }),
    );

    this.estatuses$.subscribe((estatuses) => {
      this.systemComments = estatuses.filter((status) => status.isBotComment);

      this.type =
        this.objectType.toLowerCase() === 'transactions'
          ? this.translocoService.translate('viewComment.expense')
          : this.objectType.substring(0, this.objectType.length - 1);

      this.systemEstatuses = this.statusService.createStatusMap(this.systemComments, this.type);

      this.userComments = estatuses.filter((status) => status.us_full_name);

      for (let i = 0; i < this.userComments.length; i++) {
        const prevCommentDt = this.dateWithTimezonePipe.transform(
          this.userComments[i - 1] && this.userComments[i - 1].st_created_at,
        );
        const currentCommentDt = this.dateWithTimezonePipe.transform(
          this.userComments[i] && this.userComments[i].st_created_at,
        );
        if (dayjs(prevCommentDt).isSame(currentCommentDt, 'day')) {
          this.userComments[i].show_dt = false;
        } else {
          this.userComments[i].show_dt = true;
        }
      }
    });

    this.totalCommentsCount$ = this.estatuses$.pipe(
      map((res) => res.filter((estatus) => !estatus.isBotComment).length),
    );
  }

  private isTeamAdvanceRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.includes('team_advance') || currentUrl.includes('view-team-advance-request');
  }
}
