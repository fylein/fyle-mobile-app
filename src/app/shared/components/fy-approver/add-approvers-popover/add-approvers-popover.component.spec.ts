import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';
import { AddApproversPopoverComponent } from './add-approvers-popover.component';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ApproverDialogComponent } from './approver-dialog/approver-dialog.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { ReportService } from 'src/app/core/services/report.service';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { FormsModule } from '@angular/forms';
import { pullBackAdvancedRequests } from 'src/app/core/mock-data/advance-requests.data';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { of } from 'rxjs';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';

describe('AddApproversPopoverComponent', () => {
  let component: AddApproversPopoverComponent;
  let fixture: ComponentFixture<AddApproversPopoverComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
  let approverReportsService: jasmine.SpyObj<ApproverReportsService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', ['addApprover']);
    const approverReportsServiceSpy = jasmine.createSpyObj('ApproverReportsService', ['addApprover']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);
    TestBed.configureTestingModule({
      declarations: [ApproverDialogComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: AdvanceRequestService,
          useValue: advanceRequestServiceSpy,
        },
        {
          provide: ApproverReportsService,
          useValue: approverReportsServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
    approverReportsService = TestBed.inject(ApproverReportsService) as jasmine.SpyObj<ApproverReportsService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'addApproversPopover.moreEllipsis': ', ...',
      };
      return translations[key] || key;
    });
    fixture = TestBed.createComponent(AddApproversPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openCurrencyModal(): should open the modal', fakeAsync(() => {
    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
    component.approverEmailsList = ['ajain@fyle.in'];
    component.id = 'rpFE5X1Pqi9P';
    component.type = 'report';
    component.ownerEmail = 'jay.b@fyle.in';
    const selectedApproversList = ['ajain@fyle.in', 'aiyush.dhar@fylein', 'chethan.m+90@fyle.in', 'ashutosh.m@fyle.in'];
    component.selectedApproversList = selectedApproversList.map((email) => {
      return { email };
    });
    modalController.create.and.resolveTo(modalSpy);
    modalSpy.onWillDismiss.and.resolveTo({ data: { selectedApproversList } } as any);

    component.openModal();
    tick();
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: ApproverDialogComponent,
      componentProps: {
        approverEmailsList: component.approverEmailsList,
        initialApproverList: selectedApproversList.map((email) => {
          return { email };
        }),
        id: component.id,
        type: component.type,
        ownerEmail: component.ownerEmail,
      },
      mode: 'ios',
      ...modalProperties.getModalDefaultProperties(),
    });
    expect(modalSpy.present).toHaveBeenCalledTimes(1);
    expect(modalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
  }));

  it('closeAddApproversPopover(): should close popover', fakeAsync(() => {
    popoverController.dismiss.and.resolveTo(true);

    tick();
    component.closeAddApproversPopover();
    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  }));

  it('should call advanceRequestService.addApprover() for type ADVANCE REQUEST', fakeAsync(() => {
    fixture.detectChanges();
    component.type = 'ADVANCE_REQUEST';
    component.id = 'areqMP09oaYXBf';
    component.confirmationMessage = 'The request is approved';
    component.selectedApproversList = [{ email: 'john.doe@fyle.in' }];
    advanceRequestService.addApprover.and.returnValue(of(pullBackAdvancedRequests));
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    popoverController.dismiss.and.resolveTo(true);

    component.saveUpdatedApproversList();

    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    tick();
    expect(advanceRequestService.addApprover).toHaveBeenCalledOnceWith(
      'areqMP09oaYXBf',
      'john.doe@fyle.in',
      'The request is approved'
    );
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ reload: true });
  }));

  it('should call approverReportsService.addApprover() for other request types', fakeAsync(() => {
    fixture.detectChanges();
    component.type = 'report';
    component.id = 'repP09oaYXAf';
    component.confirmationMessage = 'The request is approved';
    component.selectedApproversList = [{ email: 'ajain@fyle.in' }];
    approverReportsService.addApprover.and.returnValue(of(null));
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    popoverController.dismiss.and.resolveTo(true);

    component.saveUpdatedApproversList();

    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    tick();
    expect(approverReportsService.addApprover).toHaveBeenCalledOnceWith(
      'repP09oaYXAf',
      'ajain@fyle.in',
      'The request is approved'
    );
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ reload: true });
  }));

  it('should have the "Add Approvers" title in the header', () => {
    const title = getElementBySelector(fixture, '.add-approvers-popover--toolbar__title');
    expect(getTextContent(title)).toContain('Add approvers');
  });

  it('should display the "+n more" chip when there are more than 3 selected approvers', () => {
    const selectedApproversList = ['ajain@fyle.in', 'aiyush.dhar@fyle.in', 'chetan.m@fyle.in', 'john.d@fyle.in'];
    component.selectedApproversList = selectedApproversList.map((email) => {
      return { email };
    });
    fixture.detectChanges();
    const moreChip = getElementBySelector(fixture, '.add-approvers-popover--input-container__chip');
    expect(moreChip).toBeTruthy();
    expect(getTextContent(moreChip)).toContain('+1 more');
  });
});
