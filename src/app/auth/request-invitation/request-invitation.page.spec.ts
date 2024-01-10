import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { InvitationRequestsService } from 'src/app/core/services/invitation-requests.service';
import { RequestInvitationPage } from './request-invitation.page';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RequestInvitationPage', () => {
  let component: RequestInvitationPage;
  let fixture: ComponentFixture<RequestInvitationPage>;
  let fb: UntypedFormBuilder;
  let activeroutemock: ActivatedRoute;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let invitationRequestsService: jasmine.SpyObj<InvitationRequestsService>;

  beforeEach(waitForAsync(() => {
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const invitationRequestsServiceSpy = jasmine.createSpyObj('InvitationRequestsService', ['upsertRouter']);

    TestBed.configureTestingModule({
      declarations: [RequestInvitationPage],
      imports: [IonicModule.forRoot(), RouterModule.forRoot([]), FormsModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: InvitationRequestsService,
          useValue: invitationRequestsServiceSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                email: '',
              },
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(RequestInvitationPage);

    fb = TestBed.inject(UntypedFormBuilder);
    activeroutemock = TestBed.inject(ActivatedRoute);
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    invitationRequestsService = TestBed.inject(InvitationRequestsService) as jasmine.SpyObj<InvitationRequestsService>;

    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sendRequestInvitation', () => {
    it('should call the upsertRouter method with the correct email', fakeAsync(() => {
      invitationRequestsService.upsertRouter.and.returnValue(of(null));
      loaderService.showLoader.and.returnValue(Promise.resolve());
      loaderService.hideLoader.and.returnValue(Promise.resolve());
      const ipEmail = 'ajain1234@fyle.in';
      component.fg.controls.email.setValue(ipEmail);

      component.sendRequestInvitation();
      tick(500);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Sending request to join organization...');
      expect(invitationRequestsService.upsertRouter).toHaveBeenCalledOnceWith(ipEmail);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(component.currentPageState).toBe(component.RequestInvitationStates.success);
    }));

    it('should set current page state to alreadySent if error status is 400', fakeAsync(() => {
      const error = { status: 400 };
      activeroutemock.snapshot.params = {
        email: '',
      };
      component.fg.controls.email.setValue('');
      invitationRequestsService.upsertRouter.and.returnValue(throwError(() => error));
      loaderService.showLoader.and.returnValue(Promise.resolve());
      loaderService.hideLoader.and.returnValue(Promise.resolve());

      component.sendRequestInvitation();
      tick(500);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Sending request to join organization...');
      expect(invitationRequestsService.upsertRouter).toHaveBeenCalledOnceWith('');
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(component.currentPageState).toBe(component.RequestInvitationStates.alreadySent);
    }));

    it('should set current page state to failure if error status is not 400', fakeAsync(() => {
      const error = new Error('Some error');
      activeroutemock.snapshot.params = {
        email: '',
      };
      component.fg.controls.email.setValue('');
      invitationRequestsService.upsertRouter.and.returnValue(throwError(() => error));
      loaderService.showLoader.and.returnValue(Promise.resolve());
      loaderService.hideLoader.and.returnValue(Promise.resolve());

      component.sendRequestInvitation();
      tick(500);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Sending request to join organization...');
      expect(invitationRequestsService.upsertRouter).toHaveBeenCalledOnceWith('');
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(component.currentPageState).toBe(component.RequestInvitationStates.failure);
    }));
  });
});
