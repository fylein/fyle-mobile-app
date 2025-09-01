import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, Platform, PopoverController } from '@ionic/angular';

import { AddEditAdvanceRequestPage } from './add-edit-advance-request.page';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';

import { AuthService } from 'src/app/core/services/auth.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { FileService } from 'src/app/core/services/file.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { StatusService } from 'src/app/core/services/status.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestCases1 } from './add-edit-advance-request-1.page.spec';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TestCases2 } from './add-edit-advance-request-2.page.spec';
import { SpenderFileService } from 'src/app/core/services/platform/v1/spender/file.service';
import { ApproverFileService } from 'src/app/core/services/platform/v1/approver/file.service';

describe('AddEditAdvanceRequestPage', () => {
  const getTestBed = () => {
    const authServiceSpyObj = jasmine.createSpyObj('AuthService', ['getEou']);

    const advanceRequestServiceSpyObj = jasmine.createSpyObj('AdvanceRequestService', [
      'testPolicy',
      'createAdvReqWithFilesAndSubmit',
      'saveDraftAdvReqWithFiles',
      'delete',
      'getSpenderPermissions',
      'getApproverPermissions',
      'getEReq',
      'getEReqFromApprover',
      'getCustomFieldsForSpender',
      'getCustomFieldsForApprover',
    ]);
    const modalControllerSpyObj = jasmine.createSpyObj('ModalController', ['create']);
    const statusServiceSpyObj = jasmine.createSpyObj('StatusService', ['findLatestComment', 'post']);
    const loaderServiceSpyObj = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const projectsServiceSpyObj = jasmine.createSpyObj('ProjectsService', ['getbyId', 'getAllActive']);
    const popoverControllerSpyObj = jasmine.createSpyObj('PopoverController', ['create']);
    const transactionsOutboxServiceSpyObj = jasmine.createSpyObj('TransactionsOutboxService', ['fileUpload']);
    const fileServiceSpyObj = jasmine.createSpyObj('FileService', [
      'fileUpload',
      'getImageTypeFromDataUrl',
      'downloadUrl',
      'findByAdvanceRequestId',
      'readFile',
    ]);
    const orgSettingsServiceSpyObj = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const networkServiceSpyObj = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const modalPropertiesSpyObj = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const trackingServiceSpyObj = jasmine.createSpyObj('TrackingService', ['addComment', 'viewComment']);
    const expenseFieldsServiceSpyObj = jasmine.createSpyObj('ExpenseFieldsService', ['getAllMap']);
    const currencyServiceSpyObj = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const platformEmployeeSettingsServiceSpyObj = jasmine.createSpyObj('PlatformEmployeeSettingsService', ['get']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const spenderFileServiceSpyObj = jasmine.createSpyObj('SpenderFileService', [
      'createFile',
      'createFilesBulk',
      'deleteFilesBulk',
      'generateUrls',
      'generateUrlsBulk',
      'downloadFile',
      'attachToAdvance',
    ]);
    const approverFileServiceSpyObj = jasmine.createSpyObj('ApproverFileService', [
      'createFile',
      'createFilesBulk',
      'generateUrls',
      'generateUrlsBulk',
      'downloadFile',
      'deleteFilesBulk',
      'attachToAdvance',
    ]);

    const platformSpyObj = jasmine.createSpyObj('Platform', ['is']);

    TestBed.configureTestingModule({
      declarations: [AddEditAdvanceRequestPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpyObj },

        { provide: AdvanceRequestService, useValue: advanceRequestServiceSpyObj },
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
        { provide: PlatformEmployeeSettingsService, useValue: platformEmployeeSettingsServiceSpyObj },
        { provide: Router, useValue: routerSpyObj },
        { provide: SpenderFileService, useValue: spenderFileServiceSpyObj },
        { provide: ApproverFileService, useValue: approverFileServiceSpyObj },
        { provide: Platform, useValue: platformSpyObj },
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
        UntypedFormBuilder,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    return TestBed;
  };

  TestCases1(getTestBed);
  TestCases2(getTestBed);
});
