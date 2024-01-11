import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { ModalController } from '@ionic/angular';
import { ApproverDialogComponent } from './approver-dialog.component';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import {
  MatLegacyChipInputEvent as MatChipInputEvent,
  MatLegacyChipsModule as MatChipsModule,
} from '@angular/material/legacy-chips';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { employeesParamsRes } from 'src/app/core/test-data/org-user.service.spec.data';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { click, getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('ApproverDialogComponent', () => {
  let component: ApproverDialogComponent;
  let fixture: ComponentFixture<ApproverDialogComponent>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let modalController: jasmine.SpyObj<ModalController>;

  const approvers = [
    {
      name: 'Abhishek Jain',
      email: 'ajain@fyle.in',
    },
    {
      name: 'Jay B',
      email: 'jay.b@fyle.in',
    },
  ];

  const emps = [
    {
      ou_id: 'ouX8dwsbLCLv',
      ou_org_id: 'orNVthTo2Zyo',
      ou_roles: 'ADMIN',
      ou_status: 'ACTIVE',
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
      us_id: 'usvKA4X8Ugcz',
      is_selected: true,
    },
    {
      ou_id: 'ouCI4UQ2G0K1',
      ou_org_id: 'orNVthTo2Zyo',
      ou_roles: 'ADMIN',
      ou_status: 'ACTIVE',
      us_email: 'jay.b@fyle.in',
      us_full_name: 'Jay Budhadev',
      us_id: 'usvKA4X8Ugcr',
      is_selected: true,
    },
  ];

  beforeEach(waitForAsync(() => {
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['getEmployeesBySearch']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [ApproverDialogComponent],
      imports: [
        IonicModule.forRoot(),
        MatIconTestingModule,
        MatIconModule,
        FormsModule,
        MatChipsModule,
        MatCheckboxModule,
      ],
      providers: [
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: OrgUserService,
          useValue: orgUserServiceSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ApproverDialogComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;

    component.initialApproverList = approvers;

    component.approverEmailsList = ['jay.b@fyle.in', 'ajain@fyle.in'];

    orgUserService.getEmployeesBySearch.and.returnValue(of(employeesParamsRes.data));
    loaderService.showLoader.and.returnValue(Promise.resolve(null));
    loaderService.hideLoader.and.returnValue(Promise.resolve(null));

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clearValue(): should clear value', () => {
    spyOn(component, 'getSearchedUsersList');

    component.clearValue();
    expect(component.getSearchedUsersList).toHaveBeenCalledTimes(1);
    expect(component.value).toEqual('');
  });

  it('addChip(): should add chip', () => {
    spyOn(component, 'clearValue');
    const ev: MatChipInputEvent = {
      value: 'label',
      input: getElementBySelector(fixture, '.selection-modal--form-input') as HTMLInputElement,
    };
    component.addChip(ev);
    expect(component.clearValue).toHaveBeenCalledTimes(1);
  });

  it('closeApproverModal(): should close approver modal', () => {
    modalController.dismiss.and.returnValue(null);

    component.closeApproverModal();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('saveUpdatedApproveList', async () => {
    modalController.dismiss.and.returnValue(null);

    await component.saveUpdatedApproveList();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      selectedApproversList: component.selectedApproversList,
    });
  });

  describe('onSelectApprover(): ', () => {
    it('should add an approver to the list', () => {
      spyOn(component, 'getSelectedApproversDict');
      component.selectedApproversList = approvers;
      fixture.detectChanges();

      component.onSelectApprover(
        {
          ou_id: 'ouX8dwsbLCLv',
          ou_org_id: 'orNVthTo2Zyo',
          ou_roles: 'ADMIN',
          ou_status: 'ACTIVE',
          us_email: 'ajain@fyle.in',
          us_full_name: 'Abhishek Jain',
          us_id: 'usvKA4X8Ugcr',
          is_selected: true,
        },
        { checked: true }
      );

      expect(component.getSelectedApproversDict).toHaveBeenCalledTimes(1);
      expect(component.selectedApproversList.length).toEqual(3);
      expect(component.areApproversAdded).toEqual(false);
    });

    it('should remove an unchecked approver', () => {
      spyOn(component, 'getSelectedApproversDict');
      component.selectedApproversList = [
        {
          name: 'Abhishek Jain',
          email: 'ajain@fyle.in',
        },
      ];
      fixture.detectChanges();

      component.onSelectApprover(
        {
          ou_id: 'ouX8dwsbLCLv',
          ou_org_id: 'orNVthTo2Zyo',
          ou_roles: 'ADMIN',
          ou_status: 'ACTIVE',
          us_email: 'ajain@fyle.in',
          us_full_name: 'Abhishek Jain',
          us_id: 'usvKA4X8Ugcr',
          is_selected: true,
        },
        { checked: false }
      );

      expect(component.getSelectedApproversDict).toHaveBeenCalledTimes(1);
      expect(component.selectedApproversList.length).toEqual(0);
      expect(component.areApproversAdded).toEqual(true);
    });
  });

  it('removeApprover', () => {
    spyOn(component, 'getSelectedApproversDict');
    component.selectedApproversList = approvers;
    fixture.detectChanges();

    component.removeApprover({
      name: 'Jay B',
      email: 'jay.b@fyle.in',
    });

    expect(component.getSelectedApproversDict).toHaveBeenCalledTimes(1);
  });

  describe('getDefaultUsersList():', () => {
    it(' should get default user list', fakeAsync(() => {
      orgUserService.getEmployeesBySearch.and.returnValue(of(employeesParamsRes.data));
      loaderService.showLoader.and.returnValue(Promise.resolve(null));
      loaderService.hideLoader.and.returnValue(Promise.resolve(null));

      const params = {
        order: 'us_full_name.asc,us_email.asc,ou_id',
        us_email: `in.(${component.approverEmailsList.join(',')})`,
      };

      tick();
      component.getDefaultUsersList();
      expect(orgUserService.getEmployeesBySearch).toHaveBeenCalledWith(params);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(2);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    }));

    it('if approver email list is empty', () => {
      component.approverEmailsList = [];
      orgUserService.getEmployeesBySearch.and.returnValue(of(employeesParamsRes.data));
      loaderService.showLoader.and.returnValue(Promise.resolve(null));
      loaderService.hideLoader.and.returnValue(Promise.resolve(null));
      fixture.detectChanges();

      const params = {
        order: 'us_full_name.asc,us_email.asc,ou_id',

        limit: 20,
      };

      component.getDefaultUsersList();
      expect(orgUserService.getEmployeesBySearch).toHaveBeenCalledWith(params);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(2);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    });
  });

  it('getSearchedUsersList(): get users list from search text', (done) => {
    orgUserService.getEmployeesBySearch.and.returnValue(of(employeesParamsRes.data));

    component.getSearchedUsersList('text').subscribe((res) => {
      expect(res).toEqual([
        {
          ou_id: 'oubQzXeZbwbS',
          ou_org_id: 'orNVthTo2Zyo',
          ou_roles: '["FYLER","APPROVER","HOD","HOP"]',
          ou_status: '"ACTIVE"',
          us_email: 'ajain+12+12+1@fyle.in',
          us_full_name: 'AA23',
          us_id: 'usTdvbcxOqjs',
          is_selected: false,
        },
        {
          ou_id: 'ouXYHXfr4w0b',
          ou_org_id: 'orNVthTo2Zyo',
          ou_roles: '["FYLER","APPROVER","HOP"]',
          ou_status: '"PENDING_DETAILS"',
          us_email: 'aaaaaaa@aaaabbbb.com',
          us_full_name: 'AAA',
          us_id: 'usBBavu872gu',
          is_selected: false,
        },
      ]);
      expect(orgUserService.getEmployeesBySearch).toHaveBeenCalledWith({
        limit: 20,
        order: 'us_full_name.asc,us_email.asc,ou_id',
        or: '(us_email.ilike.*text*,us_full_name.ilike.*text*)',
      });
      done();
    });
  });

  it('getUsersList(): should get users list with search text', () => {
    spyOn(component, 'getSearchedUsersList');

    component.getUsersList('text');
    expect(component.getSearchedUsersList).toHaveBeenCalledTimes(1);
  });

  it('getSearchedEmployees', () => {
    const res = component.getSearchedEmployees(emps, [
      {
        ou_id: 'ouCI4UQ2G0K1',
        ou_org_id: 'orNVthTo2Zyo',
        ou_roles: 'ADMIN',
        ou_status: 'ACTIVE',
        us_email: 'aiyush.d@fyle.in',
        us_full_name: 'Aiyush Dhar',
        us_id: 'usvKA4X8Ugcb',
        is_selected: true,
      },
    ]);

    expect(res).toEqual([
      {
        ou_id: 'ouX8dwsbLCLv',
        ou_org_id: 'orNVthTo2Zyo',
        ou_roles: 'ADMIN',
        ou_status: 'ACTIVE',
        us_email: 'ajain@fyle.in',
        us_full_name: 'Abhishek Jain',
        us_id: 'usvKA4X8Ugcz',
        is_selected: true,
      },
      {
        ou_id: 'ouCI4UQ2G0K1',
        ou_org_id: 'orNVthTo2Zyo',
        ou_roles: 'ADMIN',
        ou_status: 'ACTIVE',
        us_email: 'jay.b@fyle.in',
        us_full_name: 'Jay Budhadev',
        us_id: 'usvKA4X8Ugcr',
        is_selected: true,
      },
    ]);
  });

  it('should close modal if clicked on ', () => {
    spyOn(component, 'closeApproverModal');

    const closeIcon = getElementBySelector(fixture, '[data-testid="closeBtn"]') as HTMLElement;
    click(closeIcon);

    expect(component.closeApproverModal).toHaveBeenCalledTimes(1);
  });

  it('should save and update approver list', () => {
    spyOn(component, 'saveUpdatedApproveList');

    const saveCTA = getElementBySelector(fixture, '.selection-modal--cta') as HTMLElement;
    click(saveCTA);

    expect(component.saveUpdatedApproveList).toHaveBeenCalledTimes(1);
  });

  it('should display selected approvers list', () => {
    component.selectedApproversList = approvers;
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.selection-modal--selected-count'))).toEqual(
      `${component.selectedApproversList.length} selected`
    );
  });

  it('should display header information correctly', () => {
    component.selectedApproversList = approvers;
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.selection-modal--approver-details__title'))).toEqual('AA23');
    expect(getTextContent(getElementBySelector(fixture, '.selection-modal--approver-details__content'))).toEqual(
      'ajain+12+12+1@fyle.in'
    );
  });

  it('should display approver name', () => {
    component.selectedApproversList = approvers;
    fixture.detectChanges();

    spyOn(component, 'removeApprover');
    const approverCards = getAllElementsBySelector(fixture, '[data-testid="approvers"]');
    expect(getTextContent(approverCards[0])).toEqual('Abhishek Jain cancel');
  });
});
