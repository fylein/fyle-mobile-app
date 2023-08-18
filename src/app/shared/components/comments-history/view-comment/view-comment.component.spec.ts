import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatusService } from 'src/app/core/services/status.service';
import { TransactionService } from '../../../../core/services/transaction.service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrackingService } from '../../../../core/services/tracking.service';
import { ViewCommentComponent } from './view-comment.component';
import { ElementRef } from '@angular/core';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { DateFormatPipe } from 'src/app/shared/pipes/date-format.pipe';
import { PopupAlertComponent } from '../../popup-alert/popup-alert.component';
import { of } from 'rxjs';

import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { expenseData1 } from 'src/app/core/mock-data/expense.data';
import {
  apiCommentsResponse,
  getEstatusApiResponse,
  updateReponseWithFlattenedEStatus,
} from 'src/app/core/test-data/status.service.spec.data';

describe('ViewCommentComponent', () => {
  let component: ViewCommentComponent;
  let fixture: ComponentFixture<ViewCommentComponent>;
  let statusService: jasmine.SpyObj<StatusService>;
  let authService: jasmine.SpyObj<AuthService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let elementRef: jasmine.SpyObj<ElementRef>;
  let platform: jasmine.SpyObj<Platform>;

  beforeEach(waitForAsync(() => {
    statusService = jasmine.createSpyObj('StatusService', ['post', 'find', 'createStatusMap']);
    authService = jasmine.createSpyObj('AuthService', ['getEou']);
    modalController = jasmine.createSpyObj('ModalController', ['dismiss']);
    popoverController = jasmine.createSpyObj('PopoverController', ['create']);
    transactionService = jasmine.createSpyObj('TransactionService', ['getTransactionByExpenseNumber']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    trackingService = jasmine.createSpyObj('TrackingService', ['addComment', 'viewComment', 'commentsHistoryActions']);
    elementRef = jasmine.createSpyObj('ElementRef', ['nativeElement']);
    platform = jasmine.createSpyObj('Platform', ['is']);
    const dateFormatPipeSpy = jasmine.createSpyObj('DateFormatPipe', ['transform']);

    TestBed.configureTestingModule({
      declarations: [ViewCommentComponent, DateFormatPipe],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule],
      providers: [
        { provide: StatusService, useValue: statusService },
        { provide: AuthService, useValue: authService },
        { provide: ModalController, useValue: modalController },
        { provide: PopoverController, useValue: popoverController },
        { provide: TransactionService, useValue: transactionService },
        { provide: Router, useValue: router },
        { provide: TrackingService, useValue: trackingService },
        { provide: ElementRef, useValue: elementRef },
        { provide: Platform, useValue: platform },
        { provide: DateFormatPipe, useValue: dateFormatPipeSpy },
      ],
    }).compileComponents();

    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    statusService.find.and.returnValue(of(apiCommentsResponse));
    statusService.createStatusMap.and.returnValue(updateReponseWithFlattenedEStatus);
    transactionService.getTransactionByExpenseNumber.and.returnValue(of(expenseData1));

    fixture = TestBed.createComponent(ViewCommentComponent);
    component = fixture.componentInstance;
    component.estatuses$ = of(apiCommentsResponse);
    component.objectType = 'transactions';
    component.objectId = 'tx1oTNwgRdRq';
    component.newComment = 'This is a new comment';
    component.expenseNumber = 'E/2022/11/T/62';
    component.matchedExpense = expenseData1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add comment to status and reset input field', () => {
    const newComment = 'This is a new comment';
    const data = { comment: newComment };
    component.newComment = newComment;
    statusService.post.and.returnValue(of(null));
    const focusSpy = spyOn(component.commentInput.nativeElement, 'focus');
    component.addComment();

    fixture.detectChanges();
    expect(statusService.post).toHaveBeenCalledOnceWith(component.objectType, component.objectId, data);
    expect(component.newComment).toBeNull();
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(component.isCommentAdded).toBeTrue();
  });

  describe('closeCommentModal():', () => {
    it('should close the modal if the comment is discarded', fakeAsync(() => {
      const popOverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.returnValue(Promise.resolve(popOverSpy));
      popOverSpy.onWillDismiss.and.returnValue(Promise.resolve({ data: { action: 'discard' } }));
      component.closeCommentModal();
      tick(500);
      expect(popoverController.create).toHaveBeenCalledOnceWith({
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
      expect(popOverSpy.onWillDismiss).toHaveBeenCalled();
      expect(trackingService.viewComment).toHaveBeenCalledTimes(1);
      expect(modalController.dismiss).toHaveBeenCalled();
    }));

    it('should close the comment modal if no changes have been made and comment added', () => {
      component.newComment = null;
      component.isCommentAdded = true;
      component.closeCommentModal();
      modalController.dismiss.and.returnValue(Promise.resolve({ data: { updated: true } } as any));
      expect(modalController.dismiss).toHaveBeenCalled();
      expect(trackingService.addComment).toHaveBeenCalledTimes(1);
    });

    it('should close the comment modal if no changes have been made and no comment is added', () => {
      component.newComment = null;
      component.isCommentAdded = false;
      component.closeCommentModal();
      modalController.dismiss.and.returnValue(Promise.resolve(Promise.resolve({ data: { updated: false } } as any)));
      expect(modalController.dismiss).toHaveBeenCalled();
      expect(trackingService.viewComment).toHaveBeenCalledTimes(1);
    });
  });

  describe('segmentChanged(): ', () => {
    it('should set the segment to comments', () => {
      component.isCommentsView = false;
      component.isSwipe = false;

      component.segmentChanged();
      expect(trackingService.commentsHistoryActions).toHaveBeenCalledOnceWith({
        action: 'click',
        segment: 'comments',
      });
      expect(component.isSwipe).toBeFalse();
    });

    it('should set the segment to history', () => {
      component.isCommentsView = true;
      component.isSwipe = false;

      component.segmentChanged();
      expect(trackingService.commentsHistoryActions).toHaveBeenCalledOnceWith({
        action: 'click',
        segment: 'history',
      });
      expect(component.isSwipe).toBeFalse();
    });
  });

  it('swipeRightToHistory(): should swipe to history in the right direction', () => {
    component.isSwipe = true;
    const app = fixture.nativeElement;
    const btn = app.getElementsByClassName('view-comment--segment-block__btn')[1];
    const clickSpy = spyOn(btn, 'click');

    const event = {
      direction: 2,
    };
    component.swipeRightToHistory(event);

    fixture.detectChanges();
    expect(component.isSwipe).toBeTrue();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(trackingService.commentsHistoryActions).toHaveBeenCalledOnceWith({
      action: 'swipe',
      segment: 'comments',
    });
  });

  it('swipeLeftToComments(): should swipe to comments in the left direction', () => {
    component.isSwipe = true;
    const app = fixture.nativeElement;
    const btn = app.getElementsByClassName('view-comment--segment-block__btn')[0];
    const clickSpy = spyOn(btn, 'click');

    const event = {
      direction: 4,
    };
    component.swipeLeftToComments(event);

    fixture.detectChanges();
    expect(component.isSwipe).toBeTrue();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(trackingService.commentsHistoryActions).toHaveBeenCalledOnceWith({
      action: 'swipe',
      segment: 'history',
    });
  });

  it('openViewExpense(): should show th expenses', fakeAsync(() => {
    component.matchedExpense = expenseData1;
    component.openViewExpense();
    tick(1000);
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'view_expense',
      {
        id: component.matchedExpense.tx_id,
      },
    ]);
  }));

  describe('onInit():', () => {
    it('should set estatuses$ and totalCommentsCount$ properties correctly', fakeAsync(() => {
      const updatedApiCommentsResponse = apiCommentsResponse.map((comment) => ({
        ...comment,
        us_full_name: 'Dummy Name',
        st_org_user_id: 'POLICY',
      }));

      const totalCommentsCount = 33;
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      statusService.find.and.returnValue(of(updatedApiCommentsResponse));
      statusService.createStatusMap.and.returnValue(updateReponseWithFlattenedEStatus);
      component.ngOnInit();
      tick(500);
      expect(component.estatuses$).toBeDefined();
      component.estatuses$.subscribe((res) => {
        expect(res[0].isBotComment).toBeTrue();
        expect(res[0].isSelfComment).toBeFalse();
        expect(res[0].isOthersComment).toBeTrue();
      });
      expect(component.totalCommentsCount$).toBeDefined();
      component.totalCommentsCount$.subscribe((res) => {
        expect(res).toBe(totalCommentsCount);
      });
      tick(500);
      expect(authService.getEou).toHaveBeenCalled();
      expect(statusService.find).toHaveBeenCalledWith(component.objectType, component.objectId);
      expect(statusService.createStatusMap).toHaveBeenCalledWith(component.systemComments, component.type);
    }));

    it('should set type correctly for a given objectType', () => {
      component.objectType = 'Expenses';
      component.ngOnInit();
      expect(component.type).toEqual('Expense');
    });

    it('should set reversal comment, expense number, and matched expense if reversal status exists', () => {
      statusService.find.and.returnValue(of(apiCommentsResponse));
      component.estatuses$ = of(apiCommentsResponse);
      statusService.createStatusMap.and.returnValue(updateReponseWithFlattenedEStatus);
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.reversalComment).toEqual('created');
      expect(transactionService.getTransactionByExpenseNumber).toHaveBeenCalledOnceWith(component.expenseNumber);
      expect(component.matchedExpense).toEqual(expenseData1);
    });
  });
});
