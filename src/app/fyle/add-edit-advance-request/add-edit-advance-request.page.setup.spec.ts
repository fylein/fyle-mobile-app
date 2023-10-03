import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';

import { AddEditAdvanceRequestPage } from './add-edit-advance-request.page';
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
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestCases1 } from './add-edit-advance-request-1.page.spec';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TestCases2 } from './add-edit-advance-request-2.page.spec';

describe('AddEditAdvanceRequestPage', () => {
  const getTestBed = () => {
    const authServiceSpyObj = jasmine.createSpyObj('AuthService', ['getEou']);
    const advanceRequestsCustomFieldsServiceSpyObj = jasmine.createSpyObj('AdvanceRequestsCustomFieldsService', [
      'getAll',
    ]);
    const advanceRequestServiceSpyObj = jasmine.createSpyObj('AdvanceRequestService', [
      'testPolicy',
      'createAdvReqWithFilesAndSubmit',
      'saveDraftAdvReqWithFiles',
      'delete',
      'getActions',
      'getEReq',
    ]);
    const advanceRequestPolicyServiceSpyObj = jasmine.createSpyObj('AdvanceRequestPolicyService', ['getPolicyRules']);
    const modalControllerSpyObj = jasmine.createSpyObj('ModalController', ['create']);
    const statusServiceSpyObj = jasmine.createSpyObj('StatusService', ['findLatestComment', 'post']);
    const loaderServiceSpyObj = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const projectsServiceSpyObj = jasmine.createSpyObj('ProjectsService', ['getById', 'getAllActive']);
    const popoverControllerSpyObj = jasmine.createSpyObj('PopoverController', ['create']);
    const transactionsOutboxServiceSpyObj = jasmine.createSpyObj('TransactionsOutboxService', ['fileUpload']);
    const fileServiceSpyObj = jasmine.createSpyObj('FileService', ['fileUpload', 'getImageTypeFromDataUrl']);
    const orgSettingsServiceSpyObj = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const networkServiceSpyObj = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const modalPropertiesSpyObj = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const trackingServiceSpyObj = jasmine.createSpyObj('TrackingService', ['addComment', 'viewComment']);
    const expenseFieldsServiceSpyObj = jasmine.createSpyObj('ExpenseFieldsService', ['getAllMap']);
    const currencyServiceSpyObj = jasmine.createSpyObj('CurrencyService', ['getHomeCurrrency']);
    const orgUserSettingsServiceSpyObj = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [AddEditAdvanceRequestPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpyObj },
        { provide: AdvanceRequestsCustomFieldsService, useValue: advanceRequestsCustomFieldsServiceSpyObj },
        { provide: AdvanceRequestService, useValue: advanceRequestServiceSpyObj },
        { provide: AdvanceRequestPolicyService, useValue: advanceRequestPolicyServiceSpyObj },
        { provide: ModalController, useValue: modalControllerSpyObj },
        { provide: StatusService, useValue: statusServiceSpyObj },
        { provide: LoaderService, useValue: loaderServiceSpyObj },
        { provide: ProjectsService, useValue: projectsServiceSpyObj },
        { provide: PopoverController, useValue: popoverControllerSpyObj },
        { provide: TransactionsOutboxService, useValue: transactionsOutboxServiceSpyObj },
        { provide: FileService, useValue: fileServiceSpyObj },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpyObj },
        { provide: NetworkService, useValue: networkServiceSpyObj },
        { provide: ModalPropertiesService, useValue: modalPropertiesSpyObj },
        { provide: TrackingService, useValue: trackingServiceSpyObj },
        { provide: ExpenseFieldsService, useValue: expenseFieldsServiceSpyObj },
        { provide: CurrencyService, useValue: currencyServiceSpyObj },
        { provide: OrgUserSettingsService, useValue: orgUserSettingsServiceSpyObj },
        { provide: Router, useValue: routerSpyObj },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 'areqR1cyLgXdND',
              },
            },
          },
        },
        FormBuilder,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    return TestBed;
  };

  TestCases1(getTestBed);
  TestCases2(getTestBed);
});
