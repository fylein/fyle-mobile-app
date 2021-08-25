import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController, Platform } from '@ionic/angular';
import { from, Observable, Subject } from 'rxjs';
import { finalize, map, startWith, switchMap } from 'rxjs/operators';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatusService } from 'src/app/core/services/status.service';
import { Expense } from '../../../../core/models/expense.model';
import { TransactionService } from '../../../../core/services/transaction.service';
import { Router } from '@angular/router';
import { TrackingService } from '../../../../core/services/tracking.service';
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

  constructor(
    private statusService: StatusService,
    private authService: AuthService,
    private modalController: ModalController,
    private transactionService: TransactionService,
    private router: Router,
    private trackingService: TrackingService,
    private elementRef: ElementRef,
    public platform: Platform
  ) { }

  addComment() {

    if (this.newComment) {
      const data = {
        comment: this.newComment
      };

      this.newComment = null;
      this.isCommentAdded = true;

      this.statusService.post(this.objectType, this.objectId, data).pipe(
      ).subscribe(res => {
        this.refreshEstatuses$.next();
      });

    }
  }

  closeCommentModal() {
    if (this.isCommentAdded) {
      this.trackingService.addComment({ Asset: 'Mobile' });
      this.modalController.dismiss({ updated: true });
    } else {
      this.trackingService.viewComment({ Asset: 'Mobile' });
      this.modalController.dismiss();
    }
  }

  segmentChanged(event) {
    this.isCommentsView = !this.isCommentsView;
  }

  swipeRightToHistory(event) {
    if (event && event.direction === 2) {
      const historyBtn = this.elementRef.nativeElement.getElementsByClassName('view-comment--btn-segment')[1];
      historyBtn.click();
    }
  }

  swipeLeftToComments(event) {
    if (event && event.direction === 4) {
      const commentsBtn = this.elementRef.nativeElement.getElementsByClassName('view-comment--btn-segment')[0];
      commentsBtn.click();
    }
  }

  ngOnInit() {
    const eou$ = from(this.authService.getEou());

    this.estatuses$ = this.refreshEstatuses$.pipe(
      startWith(0),
      switchMap(() => eou$),
      switchMap(eou => this.statusService.find(this.objectType, this.objectId).pipe(
        map(res => res.map(status => {
          status.isBotComment = status && (['SYSTEM', 'POLICY'].indexOf(status.st_org_user_id) > -1);
          status.isSelfComment = status && eou && eou.ou && (status.st_org_user_id === eou.ou.id);
          status.isOthersComment = status && eou && eou.ou && (status.st_org_user_id !== eou.ou.id);
          return status;
        })),
        map(res => res.sort((a, b) => a.st_created_at.valueOf() - b.st_created_at.valueOf())),
        finalize(() => {
          setTimeout(() => {
            this.content.scrollToBottom(500);
          }, 500);
        })
      ))
    );

    this.estatuses$.subscribe(estatuses => {
      const reversalStatus = estatuses
        .filter((status) => (status.st_comment.indexOf('created') > -1 && status.st_comment.indexOf('reversal') > -1));

      this.systemComments = estatuses.filter((status) => ['SYSTEM', 'POLICY'].indexOf(status.st_org_user_id) > -1);

      this.type = this.objectType.toLowerCase() === 'transactions' ? 'Expense' : this.objectType.substring(0, this.objectType.length - 1);

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
      map(res => res.filter((estatus) => estatus.st_org_user_id !== 'SYSTEM').length)
    );
  }

  async openViewExpense() {
    await this.modalController.dismiss();
    if (this.matchedExpense) {
      this.router.navigate(['/', 'enterprise', 'my_view_expense', {
        id: this.matchedExpense.tx_id
      }]);
    }
  }
}
