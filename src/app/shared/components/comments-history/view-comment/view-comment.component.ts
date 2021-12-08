import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController, Platform, PopoverController } from '@ionic/angular';
import { from, Observable, Subject } from 'rxjs';
import { finalize, map, startWith, switchMap } from 'rxjs/operators';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatusService } from 'src/app/core/services/status.service';
import { Expense } from '../../../../core/models/expense.model';
import { TransactionService } from '../../../../core/services/transaction.service';
import { Router } from '@angular/router';
import { TrackingService } from '../../../../core/services/tracking.service';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';
import * as moment from 'moment';

@Component({
  selector: 'app-view-comment',
  templateUrl: './view-comment.component.html',
  styleUrls: ['./view-comment.component.scss'],
})
export class ViewCommentComponent implements OnInit {
  @Input() objectType: string;

  @Input() objectId: any;

  @ViewChild(IonContent, { static: false }) content: IonContent;

  @ViewChild('commentInput') commentInput: ElementRef;

  estatuses$: Observable<ExtendedStatus[]>;

  totalCommentsCount$: Observable<number>;

  newComment: string;

  refreshEstatuses$: Subject<void> = new Subject();

  isCommentAdded: boolean;

  reversalComment: string;

  matchedExpense: Expense;

  expenseNumber: string;

  isCommentsView = true;

  systemComments: ExtendedStatus[];

  userComments: any;

  type: string;

  systemEstatuses: ExtendedStatus[];

  showDt: boolean;

  isSwipe = false;

  constructor(
    private statusService: StatusService,
    private authService: AuthService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private transactionService: TransactionService,
    private router: Router,
    private trackingService: TrackingService,
    private elementRef: ElementRef,
    public platform: Platform
  ) {}

  addComment() {
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
        .subscribe((res) => {
          this.refreshEstatuses$.next();
        });
    }
  }

  async closeCommentModal() {
    if (this.newComment) {
      const unsavedChangesPopOver = await this.popoverController.create({
        component: PopupAlertComponentComponent,
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
      const { data } = await unsavedChangesPopOver.onWillDismiss();

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

  segmentChanged() {
    this.isCommentsView = !this.isCommentsView;
    if (!this.isSwipe) {
      this.trackingService.commentsHistoryActions({
        action: 'click',
        segment: this.isCommentsView ? 'comments' : 'history',
      });
    }
    this.isSwipe = false;
  }

  swipeRightToHistory(event) {
    this.isSwipe = true;
    if (event && event.direction === 2) {
      const historyBtn = this.elementRef.nativeElement.getElementsByClassName('view-comment--segment-block__btn')[1];
      historyBtn.click();
      this.trackingService.commentsHistoryActions({
        action: 'swipe',
        segment: 'comments',
      });
    }
  }

  swipeLeftToComments(event) {
    this.isSwipe = true;
    if (event && event.direction === 4) {
      const commentsBtn = this.elementRef.nativeElement.getElementsByClassName('view-comment--segment-block__btn')[0];
      commentsBtn.click();
      this.trackingService.commentsHistoryActions({
        action: 'swipe',
        segment: 'history',
      });
    }
  }

  ngOnInit() {
    const eou$ = from(this.authService.getEou());

    this.estatuses$ = this.refreshEstatuses$.pipe(
      startWith(0),
      switchMap(() => eou$),
      switchMap((eou) =>
        this.statusService.find(this.objectType, this.objectId).pipe(
          map((res) =>
            res.map((status) => {
              status.isBotComment = status && ['SYSTEM', 'POLICY'].indexOf(status.st_org_user_id) > -1;
              status.isSelfComment = status && eou && eou.ou && status.st_org_user_id === eou.ou.id;
              status.isOthersComment = status && eou && eou.ou && status.st_org_user_id !== eou.ou.id;
              return status;
            })
          ),
          map((res) => res.sort((a, b) => a.st_created_at.valueOf() - b.st_created_at.valueOf())),
          finalize(() => {
            setTimeout(() => {
              this.content.scrollToBottom(500);
            }, 500);
          })
        )
      )
    );

    this.estatuses$.subscribe((estatuses) => {
      const reversalStatus = estatuses.filter(
        (status) => status.st_comment.indexOf('created') > -1 && status.st_comment.indexOf('reversal') > -1
      );

      this.systemComments = estatuses.filter((status) => ['SYSTEM', 'POLICY'].indexOf(status.st_org_user_id) > -1);

      this.type =
        this.objectType.toLowerCase() === 'transactions'
          ? 'Expense'
          : this.objectType.substring(0, this.objectType.length - 1);

      this.systemEstatuses = this.statusService.createStatusMap(this.systemComments, this.type);

      this.userComments = estatuses.filter((status) => status.us_full_name);

      for (let i = 0; i < this.userComments.length; i++) {
        const prevCommentDt = moment(this.userComments[i - 1] && this.userComments[i - 1].st_created_at);
        const currentCommentDt = moment(this.userComments[i] && this.userComments[i].st_created_at);
        if (moment(prevCommentDt).isSame(currentCommentDt, 'day')) {
          this.userComments[i].show_dt = false;
        } else {
          this.userComments[i].show_dt = true;
        }
      }

      if (reversalStatus && reversalStatus.length > 0 && reversalStatus[0]) {
        const comment = reversalStatus[0].st_comment;
        this.reversalComment = comment.substring(0, comment.lastIndexOf(' '));
        this.expenseNumber = comment.slice(comment.lastIndexOf(' ') + 1);
        this.transactionService.getTransactionByExpenseNumber(this.expenseNumber).subscribe((txn) => {
          this.matchedExpense = txn;
        });
      }
    });

    this.totalCommentsCount$ = this.estatuses$.pipe(
      map((res) => res.filter((estatus) => estatus.st_org_user_id !== 'SYSTEM').length)
    );
  }

  async openViewExpense() {
    await this.modalController.dismiss();
    if (this.matchedExpense) {
      this.router.navigate([
        '/',
        'enterprise',
        'view_expense',
        {
          id: this.matchedExpense.tx_id,
        },
      ]);
    }
  }
}
