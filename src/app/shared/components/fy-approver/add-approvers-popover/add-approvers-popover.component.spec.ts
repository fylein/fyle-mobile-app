import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
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
import { apiAllApproverRes1 } from 'src/app/core/mock-data/approver.data';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { of } from 'rxjs';

fdescribe('AddApproversPopoverComponent', () => {
  let component: AddApproversPopoverComponent;
  let fixture: ComponentFixture<AddApproversPopoverComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
  let reportService: jasmine.SpyObj<ReportService>;
  let loaderService: jasmine.SpyObj<LoaderService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', ['addApprover']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['addApprover']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

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
          provide: ReportService,
          useValue: reportServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
      ],
    }).compileComponents();
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;

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
    component.selectedApproversList = selectedApproversList;
    modalController.create.and.returnValue(Promise.resolve(modalSpy));
    modalSpy.onWillDismiss.and.returnValue(Promise.resolve({ data: { selectedApproversList } } as any));

    component.openModal();
    tick();
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: ApproverDialogComponent,
      componentProps: {
        approverEmailsList: component.approverEmailsList,
        initialApproverList: selectedApproversList,
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
    popoverController.dismiss.and.returnValue(Promise.resolve(true));

    tick();
    component.closeAddApproversPopover();
    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  }));

  it('should call advanceRequestService.addApprover() for type ADVANCE_REQUEST', fakeAsync(() => {
    component.type = 'ADVANCE_REQUEST';
    component.id = 'areqMP09oaYXBf';
    component.confirmationMessage = 'The request is approved';
    component.selectedApproversList = [{ email: 'john.doe@example.com' }];
    advanceRequestService.addApprover.and.returnValue(of(pullBackAdvancedRequests));
    loaderService.showLoader.and.returnValue(Promise.resolve());
    loaderService.hideLoader.and.returnValue(Promise.resolve());
    popoverController.dismiss.and.returnValue(Promise.resolve(true));

    component.saveUpdatedApproversList();

    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    tick();
    expect(advanceRequestService.addApprover).toHaveBeenCalledWith(
      'areqMP09oaYXBf',
      'john.doe@example.com',
      'The request is approved'
    );
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ reload: true });
  }));
});
