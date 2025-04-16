import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController, Platform, PopoverController } from '@ionic/angular';
import { from, Observable, Subject } from 'rxjs';
import { finalize, map, startWith, switchMap } from 'rxjs/operators';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatusService } from 'src/app/core/services/status.service';
import { TrackingService } from '../../../../core/services/tracking.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import * as dayjs from 'dayjs';
import { DateWithTimezonePipe } from 'src/app/shared/pipes/date-with-timezone.pipe';
import { ExpenseCommentService as SpenderExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { ExpenseCommentService as ApproverExpenseCommentService } from 'src/app/core/services/platform/v1/approver/expense-comment.service';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';

@Component({
  selector: 'app-view-comment',
  templateUrl: './view-comment.component.html',
  styleUrls: ['./view-comment.component.scss'],
  providers: [DateWithTimezonePipe],
})
export class ViewCommentComponent implements OnInit {
  @Input() objectType: string;

  @Input() objectId: string;

  @Input() view: ExpenseView;

  @ViewChild(IonContent, { static: false }) content: IonContent;

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

  constructor(
    private statusService: StatusService,
    private authService: AuthService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private trackingService: TrackingService,
    private elementRef: ElementRef,
    public platform: Platform,
    private dateWithTimezonePipe: DateWithTimezonePipe,
    private spenderExpenseCommentService: SpenderExpenseCommentService,
    private approverExpenseCommentService: ApproverExpenseCommentService
  ) {}

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

      this.statusService
        .post(this.objectType, this.objectId, data)
        .pipe()
        .subscribe(() => {
          this.refreshEstatuses$.next(null);
        });
    }
  }

  async closeCommentModal(): Promise<void> {
    if (this.newComment) {
      const unsavedChangesPopOver = await this.popoverController.create({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Discard Message',
          message: 'Are you sure you want to discard the message?',
          primaryCta: {
            text: 'Discard',
            action: 'discard',
          },
          secondaryCta: {
            text: 'Cancel',
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
        'view-comment--segment-block__btn'
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
        'view-comment--segment-block__btn'
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

        const comments$ = isExpense
          ? this.view === ExpenseView.team
            ? this.approverExpenseCommentService.getTransformedComments(this.objectId)
            : this.spenderExpenseCommentService.getTransformedComments(this.objectId)
          : this.statusService.find(this.objectType, this.objectId);

        return comments$.pipe(
          map((res) =>
            res.map((status) => {
              status.isBotComment = ['SYSTEM', 'POLICY'].includes(status?.st_org_user_id);
              status.isSelfComment = eou?.ou?.id === status?.st_org_user_id;
              status.isOthersComment = eou?.ou?.id !== status?.st_org_user_id;
              return status;
            })
          ),
          map((res) => res.sort((a, b) => new Date(a.st_created_at).valueOf() - new Date(b.st_created_at).valueOf())),
          finalize(() => {
            setTimeout(() => {
              this.setContentScrollToBottom();
            }, 500);
          })
        );
      })
    );

    this.estatuses$.subscribe((estatuses) => {
      this.systemComments = estatuses.filter((status) => ['SYSTEM', 'POLICY'].indexOf(status.st_org_user_id) > -1);

      this.type =
        this.objectType.toLowerCase() === 'transactions'
          ? 'Expense'
          : this.objectType.substring(0, this.objectType.length - 1);

      this.systemEstatuses = this.statusService.createStatusMap(this.systemComments, this.type);

      this.userComments = estatuses.filter((status) => status.us_full_name);

      for (let i = 0; i < this.userComments.length; i++) {
        const prevCommentDt = this.dateWithTimezonePipe.transform(
          this.userComments[i - 1] && this.userComments[i - 1].st_created_at
        );
        const currentCommentDt = this.dateWithTimezonePipe.transform(
          this.userComments[i] && this.userComments[i].st_created_at
        );
        if (dayjs(prevCommentDt).isSame(currentCommentDt, 'day')) {
          this.userComments[i].show_dt = false;
        } else {
          this.userComments[i].show_dt = true;
        }
      }
    });

    this.totalCommentsCount$ = this.estatuses$.pipe(
      map((res) => res.filter((estatus) => estatus.st_org_user_id !== 'SYSTEM').length)
    );
  }
}
