import { ModalController, PopoverController } from '@ionic/angular';
import { AdvanceRequestPolicyService } from 'src/app/core/services/advance-request-policy.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { FileService } from 'src/app/core/services/file.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { StatusService } from 'src/app/core/services/status.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { AddEditAdvanceRequestPage } from './add-edit-advance-request.page';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
import {
  addEditAdvanceRequestFormValueData,
  addEditAdvanceRequestFormValueData2,
} from 'src/app/core/mock-data/add-edit-advance-request-form-value.data';
import { ActivatedRoute, Router } from '@angular/router';
import { expenseFieldsMapResponse } from 'src/app/core/mock-data/expense-fields-map.data';
import { Observable, of } from 'rxjs';
import { checkPolicyData } from 'src/app/core/mock-data/policy-violation-check.data';
import { advanceRequests } from 'src/app/core/mock-data/advance-requests.data';
import { advRequestFile } from 'src/app/core/mock-data/advance-request-file.data';
import { fileData1 } from 'src/app/core/mock-data/file.data';
import { PolicyViolationDialogComponent } from './policy-violation-dialog/policy-violation-dialog.component';
import { txnStatusData } from 'src/app/core/mock-data/transaction-status.data';
import { properties } from 'src/app/core/mock-data/modal-properties.data';
import { advanceRequestPolicyViolationParams } from 'src/app/core/mock-data/modal-controller.data';

export function TestCases1(getTestBed) {
  return describe('test cases 1', () => {
    let component: AddEditAdvanceRequestPage;
    let fixture: ComponentFixture<AddEditAdvanceRequestPage>;
    let authService: jasmine.SpyObj<AuthService>;
    let advanceRequestsCustomFieldsService: jasmine.SpyObj<AdvanceRequestsCustomFieldsService>;
    let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
    let advanceRequestPolicyService: jasmine.SpyObj<AdvanceRequestPolicyService>;
    let modalController: jasmine.SpyObj<ModalController>;
    let statusService: jasmine.SpyObj<StatusService>;
    let loaderService: jasmine.SpyObj<LoaderService>;
    let projectsService: jasmine.SpyObj<ProjectsService>;
    let popoverController: jasmine.SpyObj<PopoverController>;
    let transactionsOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
    let fileService: jasmine.SpyObj<FileService>;
    let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
    let networkService: jasmine.SpyObj<NetworkService>;
    let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
    let currencyService: jasmine.SpyObj<CurrencyService>;
    let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
    let router: jasmine.SpyObj<Router>;
    let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

    beforeEach(() => {
      const TestBed = getTestBed();
      fixture = TestBed.createComponent(AddEditAdvanceRequestPage);
      component = fixture.componentInstance;

      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      advanceRequestsCustomFieldsService = TestBed.inject(
        AdvanceRequestsCustomFieldsService
      ) as jasmine.SpyObj<AdvanceRequestsCustomFieldsService>;
      advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
      advanceRequestPolicyService = TestBed.inject(
        AdvanceRequestPolicyService
      ) as jasmine.SpyObj<AdvanceRequestPolicyService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
      popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
      transactionsOutboxService = TestBed.inject(
        TransactionsOutboxService
      ) as jasmine.SpyObj<TransactionsOutboxService>;
      fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
      orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
      modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
      currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
      orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('getFormValues(): should return form value', () => {
      component.fg = new FormBuilder().group({ ...addEditAdvanceRequestFormValueData });

      const result = component.getFormValues();
      expect(result).toEqual(addEditAdvanceRequestFormValueData);
    });

    describe('currencyObjValidator():', () => {
      it('should validate currency object', () => {
        component.fg = new FormBuilder().group({
          currencyObj: new FormControl({
            amount: 130,
            currency: 'USD',
            orig_amount: 10,
            orig_currency: 'USD',
          }),
        });

        const result = component.currencyObjValidator(component.fg.controls.currencyObj);
        expect(result).toBeNull();
      });

      it('should return false if there is no value in form control', () => {
        component.fg = new FormBuilder().group({
          currencyObj: [null],
        });

        const result = component.currencyObjValidator(component.fg.controls.currencyObj);
        expect(result).toEqual({
          required: false,
        });
      });
    });

    it('ngOnInit(): should setup form and initialize id, from, advanceActions, and expenseFields$', () => {
      activatedRoute.snapshot.params = {
        from: 'TEAM_ADVANCE',
      };
      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse));

      component.ngOnInit();

      expect(component.fg.value).toEqual(addEditAdvanceRequestFormValueData2);
      expect(component.fg.controls.currencyObj.validator).toEqual(component.currencyObjValidator);
      expect(component.id).toEqual(undefined);
      expect(component.from).toEqual('TEAM_ADVANCE');
      expect(component.advanceActions).toEqual({
        can_save: true,
        can_submit: true,
      });
      component.expenseFields$.subscribe((result) => {
        expect(result).toEqual(expenseFieldsMapResponse);
      });
    });

    describe('goBack():', () => {
      it('should navigate to team_advances page if from is TEAM_ADVANCE', () => {
        component.from = 'TEAM_ADVANCE';
        component.goBack();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_advance']);
      });

      it('should navigate to my advances page if from is ADVANCE', () => {
        component.from = 'ADVANCE';
        component.goBack();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_advances']);
      });
    });

    it('checkPolicyViolation(): should call advanceRequestService.testPolicy() once', () => {
      advanceRequestService.testPolicy.and.returnValue(of(checkPolicyData));
      const result = component.checkPolicyViolation(advanceRequests);
      expect(advanceRequestService.testPolicy).toHaveBeenCalledOnceWith(advanceRequests);
      result.subscribe((res) => {
        expect(res).toEqual(checkPolicyData);
      });
    });

    it('submitAdvanceRequest(): should get file attachments and call advanceRequestService.createAdvReqWithFilesAndSubmit once', () => {
      advanceRequestService.createAdvReqWithFilesAndSubmit.and.returnValue(of(advRequestFile));
      const mockFileData = of(fileData1);
      spyOn(component, 'fileAttachments').and.returnValue(mockFileData);

      const result = component.submitAdvanceRequest(advanceRequests);

      expect(component.fileAttachments).toHaveBeenCalledTimes(1);
      expect(advanceRequestService.createAdvReqWithFilesAndSubmit).toHaveBeenCalledOnceWith(
        advanceRequests,
        mockFileData
      );
      result.subscribe((res) => {
        expect(res).toEqual(advRequestFile);
      });
    });

    it('saveDraftAdvanceRequest(): should get file attachments and call advanceRequestService.saveDraftAdvReqWithFiles once', () => {
      advanceRequestService.saveDraftAdvReqWithFiles.and.returnValue(of(advRequestFile));
      const mockFileData = of(fileData1);
      spyOn(component, 'fileAttachments').and.returnValue(mockFileData);

      const result = component.saveDraftAdvanceRequest(advanceRequests);

      expect(component.fileAttachments).toHaveBeenCalledTimes(1);
      expect(advanceRequestService.saveDraftAdvReqWithFiles).toHaveBeenCalledOnceWith(advanceRequests, mockFileData);
      result.subscribe((res) => {
        expect(res).toEqual(advRequestFile);
      });
    });

    describe('saveAndSubmit():', () => {
      beforeEach(() => {
        spyOn(component, 'submitAdvanceRequest');
        spyOn(component, 'saveDraftAdvanceRequest');
      });

      it('should call submitAdvanceRequest once if event is not equal to draft', () => {
        component.saveAndSubmit('submit', advanceRequests);
        expect(component.submitAdvanceRequest).toHaveBeenCalledTimes(1);
        expect(component.saveDraftAdvanceRequest).not.toHaveBeenCalled();
      });

      it('should call saveDraftAdvanceRequest once if event is equal to draft', () => {
        component.saveAndSubmit('draft', advanceRequests);
        expect(component.submitAdvanceRequest).not.toHaveBeenCalled();
        expect(component.saveDraftAdvanceRequest).toHaveBeenCalledTimes(1);
      });
    });

    describe('showPolicyModal():', () => {
      beforeEach(() => {
        component.fg = new FormBuilder().group({});
        statusService.findLatestComment.and.returnValue(of('latest comment'));
        statusService.post.and.returnValue(of(txnStatusData));
        modalProperties.getModalDefaultProperties.and.returnValue(properties);
        spyOn(component, 'saveAndSubmit').and.returnValue(of(advRequestFile));
        spyOn(component.fg, 'reset');
      });

      it('should navigate to team_advance page and set saveDraftAdvanceLoading to false if reason in specified, event is draft and user has come from team advances page', fakeAsync(() => {
        const policyViolationModalSpy = jasmine.createSpyObj('policyViolationModal', ['present', 'onWillDismiss']);
        policyViolationModalSpy.onWillDismiss.and.resolveTo({ data: { reason: 'latest comment' } });
        modalController.create.and.resolveTo(policyViolationModalSpy);
        component.from = 'TEAM_ADVANCE';

        const policyRules = ['rule1', 'rule2'];
        const policyViolationActionDescription =
          'The expense will be flagged, employee will be alerted, expense will be made unreportable and expense amount will be capped to the amount limit.';
        component.showPolicyModal(policyRules, policyViolationActionDescription, 'draft', advanceRequests);
        tick(200);

        expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
          'areqMP09oaYXBf',
          'advance_requests',
          'ouX8dwsbLCLv'
        );
        expect(policyViolationModalSpy.present).toHaveBeenCalledTimes(1);
        expect(policyViolationModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
        expect(modalController.create).toHaveBeenCalledOnceWith(advanceRequestPolicyViolationParams);
        expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
        expect(component.saveAndSubmit).toHaveBeenCalledOnceWith('draft', advanceRequests);
        expect(statusService.post).toHaveBeenCalledOnceWith(
          'advance_requests',
          'areqMP09oaYXBf',
          { comment: 'latest comment' },
          true
        );
        expect(component.fg.reset).toHaveBeenCalledTimes(1);
        expect(component.saveDraftAdvanceLoading).toBeFalse();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_advance']);
      }));

      it('should navigate to my_advances page and set saveAdvanceLoading to false if reason in specified, event is not draft and user has come from my advances page', fakeAsync(() => {
        const policyViolationModalSpy = jasmine.createSpyObj('policyViolationModal', ['present', 'onWillDismiss']);
        policyViolationModalSpy.onWillDismiss.and.resolveTo({ data: { reason: 'latest comment' } });
        modalController.create.and.resolveTo(policyViolationModalSpy);
        component.from = 'ADVANCE';

        const policyRules = ['rule1', 'rule2'];
        const policyViolationActionDescription =
          'The expense will be flagged, employee will be alerted, expense will be made unreportable and expense amount will be capped to the amount limit.';
        component.showPolicyModal(policyRules, policyViolationActionDescription, 'submit', advanceRequests);
        tick(200);

        expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
          'areqMP09oaYXBf',
          'advance_requests',
          'ouX8dwsbLCLv'
        );
        expect(policyViolationModalSpy.present).toHaveBeenCalledTimes(1);
        expect(policyViolationModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
        expect(modalController.create).toHaveBeenCalledOnceWith(advanceRequestPolicyViolationParams);
        expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
        expect(component.saveAndSubmit).toHaveBeenCalledOnceWith('submit', advanceRequests);
        expect(statusService.post).toHaveBeenCalledOnceWith(
          'advance_requests',
          'areqMP09oaYXBf',
          { comment: 'latest comment' },
          true
        );
        expect(component.fg.reset).toHaveBeenCalledTimes(1);
        expect(component.saveAdvanceLoading).toBeFalse();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_advances']);
      }));

      it('should set saveDraftAdvanceLoading to false if policyViolation popover returns undefined and event is draft', fakeAsync(() => {
        const policyViolationModalSpy = jasmine.createSpyObj('policyViolationModal', ['present', 'onWillDismiss']);
        policyViolationModalSpy.onWillDismiss.and.resolveTo({ data: undefined });
        modalController.create.and.resolveTo(policyViolationModalSpy);

        const policyRules = ['rule1', 'rule2'];
        const policyViolationActionDescription =
          'The expense will be flagged, employee will be alerted, expense will be made unreportable and expense amount will be capped to the amount limit.';
        component.showPolicyModal(policyRules, policyViolationActionDescription, 'draft', advanceRequests);
        tick(200);

        expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
          'areqMP09oaYXBf',
          'advance_requests',
          'ouX8dwsbLCLv'
        );
        expect(policyViolationModalSpy.present).toHaveBeenCalledTimes(1);
        expect(policyViolationModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
        expect(modalController.create).toHaveBeenCalledOnceWith(advanceRequestPolicyViolationParams);
        expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
        expect(component.saveAndSubmit).not.toHaveBeenCalled();
        expect(statusService.post).not.toHaveBeenCalled();
        expect(component.fg.reset).not.toHaveBeenCalled();
        expect(component.saveDraftAdvanceLoading).toBeFalse();
        expect(router.navigate).not.toHaveBeenCalled();
      }));

      it('should set saveAdvanceLoading to false if policyViolation popover returns undefined and event is not draft', fakeAsync(() => {
        const policyViolationModalSpy = jasmine.createSpyObj('policyViolationModal', ['present', 'onWillDismiss']);
        policyViolationModalSpy.onWillDismiss.and.resolveTo({ data: undefined });
        modalController.create.and.resolveTo(policyViolationModalSpy);

        const policyRules = ['rule1', 'rule2'];
        const policyViolationActionDescription =
          'The expense will be flagged, employee will be alerted, expense will be made unreportable and expense amount will be capped to the amount limit.';
        component.showPolicyModal(policyRules, policyViolationActionDescription, 'submit', advanceRequests);
        tick(200);

        expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
          'areqMP09oaYXBf',
          'advance_requests',
          'ouX8dwsbLCLv'
        );
        expect(policyViolationModalSpy.present).toHaveBeenCalledTimes(1);
        expect(policyViolationModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
        expect(modalController.create).toHaveBeenCalledOnceWith(advanceRequestPolicyViolationParams);
        expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
        expect(component.saveAndSubmit).not.toHaveBeenCalled();
        expect(statusService.post).not.toHaveBeenCalled();
        expect(component.fg.reset).not.toHaveBeenCalled();
        expect(component.saveAdvanceLoading).toBeFalse();
        expect(router.navigate).not.toHaveBeenCalled();
      }));
    });
  });
}
