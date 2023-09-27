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
import { ComponentFixture } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
import { addEditAdvanceRequestFormValueData } from 'src/app/core/mock-data/add-edit-advance-request-form-value.data';

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
  });
}
