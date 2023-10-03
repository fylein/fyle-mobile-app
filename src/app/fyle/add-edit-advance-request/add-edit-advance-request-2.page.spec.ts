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
import { ActivatedRoute, Router } from '@angular/router';
import { clone, cloneDeep } from 'lodash';
import { advanceRequests, advanceRequests2 } from 'src/app/core/mock-data/advance-requests.data';
import {
  addEditAdvanceRequestFormValueData,
  addEditAdvanceRequestFormValueData3,
} from 'src/app/core/mock-data/add-edit-advance-request-form-value.data';
import { of } from 'rxjs';
import {
  advanceRequestCustomFieldValuesData,
  advanceRequestCustomFieldValuesData2,
} from 'src/app/core/mock-data/advance-request-custom-field-values.data';
import {
  advanceRequestFileUrlData,
  advanceRequestFileUrlData2,
  expectedFileData2,
  fileObject4,
} from 'src/app/core/mock-data/file-object.data';
import { fileData3 } from 'src/app/core/mock-data/file.data';
import { CameraOptionsPopupComponent } from './camera-options-popup/camera-options-popup.component';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import {
  modalControllerParams3,
  modalControllerParams4,
  modalControllerParams5,
  popoverControllerParams5,
} from 'src/app/core/mock-data/modal-controller.data';
import { properties } from 'src/app/core/mock-data/modal-properties.data';

export function TestCases2(getTestBed) {
  return describe('test cases 2', () => {
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

    const policyViolationActionDescription =
      'The expense will be flagged, employee will be alerted, expense will be made unreportable and expense amount will be capped to the amount limit.';

    it('generateAdvanceRequestFromFg(): should generate advance request from form', () => {
      const mockAdvanceRequest = cloneDeep(advanceRequests);
      component.fg = new FormBuilder().group(addEditAdvanceRequestFormValueData3);
      component.generateAdvanceRequestFromFg(of(mockAdvanceRequest)).subscribe((res) => {
        expect(res).toEqual(advanceRequests2);
      });
    });

    it('modifyAdvanceRequestCustomFields(): should sort the values and update the customFieldValues date to YYYY-M-D format if it contains date', () => {
      const mockCustomField = cloneDeep(advanceRequestCustomFieldValuesData);
      const result = component.modifyAdvanceRequestCustomFields(mockCustomField);
      expect(result).toEqual(advanceRequestCustomFieldValuesData2);
      expect(component.customFieldValues).toEqual(advanceRequestCustomFieldValuesData2);
    });

    it('fileAttachments(): should return file attachments if ids are absent in fileObject', (done) => {
      transactionsOutboxService.fileUpload.and.resolveTo(fileObject4[0]);
      const mockFileObjects = cloneDeep(advanceRequestFileUrlData);
      component.dataUrls = mockFileObjects;
      component.fileAttachments().subscribe((res) => {
        expect(transactionsOutboxService.fileUpload).toHaveBeenCalledOnceWith(undefined, 'image');
        expect(res).toEqual(fileData3);
        done();
      });
    });

    it('addAttachments(): should open camera option popup and add receipt details', fakeAsync(() => {
      component.dataUrls = [];
      fileService.getImageTypeFromDataUrl.and.returnValue('pdf');

      const cameraOptionsPopupSpy = jasmine.createSpyObj('cameraOptionsPopup', ['present', 'onWillDismiss']);
      cameraOptionsPopupSpy.onWillDismiss.and.resolveTo({
        data: { dataUrl: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.pdf', type: 'pdf', option: 'camera' },
      });
      popoverController.create.and.resolveTo(cameraOptionsPopupSpy);

      const captureReceiptModalSpy = jasmine.createSpyObj('captureReceiptModal', ['present', 'onWillDismiss']);
      captureReceiptModalSpy.onWillDismiss.and.resolveTo({
        data: { dataUrl: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.pdf' },
      });
      modalController.create.and.resolveTo(captureReceiptModalSpy);

      const event = jasmine.createSpyObj('event', ['stopPropagation', 'preventDefault']);
      component.addAttachments(event);
      tick(100);

      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: CameraOptionsPopupComponent,
        cssClass: 'camera-options-popover',
      });
      expect(cameraOptionsPopupSpy.present).toHaveBeenCalledTimes(1);
      expect(cameraOptionsPopupSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams3);
      expect(captureReceiptModalSpy.present).toHaveBeenCalledTimes(1);
      expect(captureReceiptModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(fileService.getImageTypeFromDataUrl).toHaveBeenCalledOnceWith(
        '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.pdf'
      );
      expect(component.dataUrls).toEqual(expectedFileData2);
    }));

    it('viewAttachments(): should show the attachments as preview', fakeAsync(() => {
      component.dataUrls = cloneDeep(advanceRequestFileUrlData2);
      const attachmentModalSpy = jasmine.createSpyObj('attachmentsModal', ['present', 'onWillDismiss']);
      attachmentModalSpy.onWillDismiss.and.resolveTo({ data: { attachments: expectedFileData2 } });
      modalController.create.and.resolveTo(attachmentModalSpy);

      component.viewAttachments();
      tick(100);
      expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams4);
      expect(attachmentModalSpy.present).toHaveBeenCalledTimes(1);
      expect(attachmentModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(component.dataUrls).toEqual(expectedFileData2);
    }));

    it('getReceiptExtension(): should return the extension of the receipt', () => {
      const mockFileObject = cloneDeep(advanceRequestFileUrlData2[0]);
      const result = component.getReceiptExtension(mockFileObject.name);
      expect(result).toEqual('pdf');
    });

    describe('getReceiptDetails():', () => {
      it('should return the receipt details with thumbnail as fy-receipt.svg if extension is pdf', () => {
        spyOn(component, 'getReceiptExtension').and.returnValue('pdf');
        const mockFileObject = cloneDeep(advanceRequestFileUrlData2[0]);
        const result = component.getReceiptDetails(mockFileObject);
        expect(component.getReceiptExtension).toHaveBeenCalledOnceWith(mockFileObject.name);
        expect(result).toEqual({
          type: 'pdf',
          thumbnail: 'img/fy-pdf.svg',
        });
      });

      it('should return the receipt details with type as image and thumbnail as file url if extension is png', () => {
        spyOn(component, 'getReceiptExtension').and.returnValue('png');
        const mockFileObject = cloneDeep(advanceRequestFileUrlData2[0]);
        const result = component.getReceiptDetails(mockFileObject);
        expect(component.getReceiptExtension).toHaveBeenCalledOnceWith(mockFileObject.name);
        expect(result).toEqual({
          type: 'image',
          thumbnail:
            'https://fyle-storage-mumbai-3.s3.amazonaws.com/2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=AKIA54Z3LIXTX6CFH4VG%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee',
        });
      });
    });

    it('getAttachedReceipts(): should return all the attached receipts corresponding to an advance request', () => {
      const mockFileObject = cloneDeep(advanceRequestFileUrlData[0]);
      spyOn(component, 'getReceiptDetails').and.returnValue({
        type: 'pdf',
        thumbnail: 'img/fy-pdf.svg',
      });
      fileService.downloadUrl.and.returnValue(of('mockdownloadurl.png'));
      fileService.findByAdvanceRequestId.and.returnValue(of([mockFileObject]));
      component.dataUrls = [mockFileObject];
      component.getAttachedReceipts('areqR1cyLgXdND').subscribe((res) => {
        expect(component.getReceiptDetails).toHaveBeenCalledOnceWith(mockFileObject);
        expect(fileService.downloadUrl).toHaveBeenCalledOnceWith('fiSSsy2Bf4Se');
        expect(fileService.findByAdvanceRequestId).toHaveBeenCalledOnceWith('areqR1cyLgXdND');
        expect(res).toEqual([
          {
            ...mockFileObject,
            type: 'pdf',
            thumbnail: 'img/fy-pdf.svg',
            url: 'mockdownloadurl.png',
          },
        ]);
      });
    });

    describe('openCommentsModal():', () => {
      it('openCommentsModal(): should open the comments modal and call track addComment method if updated is true', fakeAsync(() => {
        const viewCommentModalSpy = jasmine.createSpyObj('modal', ['present', 'onDidDismiss']);
        viewCommentModalSpy.onDidDismiss.and.resolveTo({ data: { updated: true } });
        modalController.create.and.resolveTo(viewCommentModalSpy);
        component.id = 'areqR1cyLgXdND';
        modalProperties.getModalDefaultProperties.and.returnValue(properties);

        component.openCommentsModal();
        tick(100);
        expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams5);
        expect(viewCommentModalSpy.present).toHaveBeenCalledTimes(1);
        expect(viewCommentModalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
        expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
        expect(trackingService.addComment).toHaveBeenCalledTimes(1);
      }));

      it('openCommentsModal(): should open the comments modal and call track viewComment method if updated is false', fakeAsync(() => {
        const viewCommentModalSpy = jasmine.createSpyObj('modal', ['present', 'onDidDismiss']);
        viewCommentModalSpy.onDidDismiss.and.resolveTo({ data: { updated: false } });
        modalController.create.and.resolveTo(viewCommentModalSpy);
        component.id = 'areqR1cyLgXdND';
        modalProperties.getModalDefaultProperties.and.returnValue(properties);

        component.openCommentsModal();
        tick(100);
        expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams5);
        expect(viewCommentModalSpy.present).toHaveBeenCalledTimes(1);
        expect(viewCommentModalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
        expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
        expect(trackingService.viewComment).toHaveBeenCalledTimes(1);
      }));
    });

    it('delete(): should show popover and remove delete advance request', fakeAsync(() => {
      const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
      deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });
      popoverController.create.and.resolveTo(deletePopoverSpy);
      advanceRequestService.delete.and.resolveTo();
      component.id = 'areqR1cyLgXdND';
      component.delete();
      tick(100);
      expect(popoverController.create).toHaveBeenCalledOnceWith(popoverControllerParams5);
      expect(deletePopoverSpy.present).toHaveBeenCalledTimes(1);
      expect(deletePopoverSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_advances']);
    }));
  });
}
