import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
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
import { cloneDeep } from 'lodash';

describe('ApproverDialogComponent', () => {
  let component: ApproverDialogComponent;
  let fixture: ComponentFixture<ApproverDialogComponent>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let employeesService: jasmine.SpyObj<EmployeesService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

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
      id: 'ouX8dwsbLCLv',
      roles: 'ADMIN',
      is_enabled: true,
      has_accepted_invite: true,
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
      user_id: 'usvKA4X8Ugcz',
      is_selected: true,
    },
    {
      id: 'ouCI4UQ2G0K1',
      roles: 'ADMIN',
      is_enabled: true,
      has_accepted_invite: true,
      email: 'jay.b@fyle.in',
      full_name: 'Jay Budhadev',
      user_id: 'usvKA4X8Ugcr',
      is_selected: true,
    },
  ];

  beforeEach(waitForAsync(() => {
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const employeesServiceSpy = jasmine.createSpyObj('EmployeesService', ['getEmployeesBySearch']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);
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
          provide: EmployeesService,
          useValue: employeesServiceSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ApproverDialogComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    employeesService = TestBed.inject(EmployeesService) as jasmine.SpyObj<EmployeesService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'approverDialog.loading': 'Loading...',
      };
      return translations[key] || key;
    });
    component.initialApproverList = cloneDeep(approvers);

    component.approverEmailsList = ['jay.b@fyle.in', 'ajain@fyle.in'];

    const employeesData = cloneDeep(employeesParamsRes.data);
    employeesService.getEmployeesBySearch.and.returnValue(of(employeesData));
    loaderService.showLoader.and.resolveTo(null);
    loaderService.hideLoader.and.resolveTo(null);

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
    const chipInput = jasmine.createSpyObj('chipInput', ['clear']);
    const ev: MatChipInputEvent = {
      chipInput,
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
          id: 'ouX8dwsbLCLv',
          roles: 'ADMIN',
          is_enabled: true,
          has_accepted_invite: true,
          email: 'ajain@fyle.in',
          full_name: 'Abhishek Jain',
          user_id: 'usvKA4X8Ugcr',
          is_selected: true,
        },
        { checked: true }
      );

      expect(component.getSelectedApproversDict).toHaveBeenCalledTimes(1);
      expect(component.selectedApproversList.length).toEqual(3);
      expect(component.areApproversAdded).toBeFalse();
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
          id: 'ouX8dwsbLCLv',
          roles: 'ADMIN',
          is_enabled: true,
          has_accepted_invite: true,
          email: 'ajain@fyle.in',
          full_name: 'Abhishek Jain',
          user_id: 'usvKA4X8Ugcr',
          is_selected: true,
        },
        { checked: false }
      );

      expect(component.getSelectedApproversDict).toHaveBeenCalledTimes(1);
      expect(component.selectedApproversList.length).toEqual(0);
      expect(component.areApproversAdded).toBeTrue();
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
      employeesService.getEmployeesBySearch.and.returnValue(of(employeesParamsRes.data));
      loaderService.showLoader.and.resolveTo(null);
      loaderService.hideLoader.and.resolveTo(null);

      const params = {
        order: 'full_name.asc,email.asc',
        email: `in.(${component.approverEmailsList.join(',')})`,
      };

      tick();
      component.getDefaultUsersList();
      expect(employeesService.getEmployeesBySearch).toHaveBeenCalledWith(params);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(2);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    }));

    it('if approver email list is empty', () => {
      component.approverEmailsList = [];
      employeesService.getEmployeesBySearch.and.returnValue(of(employeesParamsRes.data));
      loaderService.showLoader.and.resolveTo(null);
      loaderService.hideLoader.and.resolveTo(null);
      fixture.detectChanges();

      const params = {
        order: 'full_name.asc,email.asc',
        limit: 20,
      };

      component.getDefaultUsersList();
      expect(employeesService.getEmployeesBySearch).toHaveBeenCalledWith(params);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(2);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    });
  });

  it('getSearchedUsersList(): get users list from search text', (done) => {
    const employeesData = cloneDeep(employeesParamsRes.data);
    employeesService.getEmployeesBySearch.and.returnValue(of(employeesData));

    component.getSearchedUsersList('text').subscribe((res) => {
      expect(res).toEqual([
        {
          id: 'oubQzXeZbwbS',
          roles: '["FYLER","APPROVER","HOD","HOP"]',
          is_enabled: true,
          has_accepted_invite: true,
          email: 'ajain+12+12+1@fyle.in',
          full_name: 'AA23',
          user_id: 'usTdvbcxOqjs',
          is_selected: false,
        },
        {
          id: 'ouXYHXfr4w0b',
          roles: '["FYLER","APPROVER","HOP"]',
          is_enabled: true,
          has_accepted_invite: false,
          email: 'aaaaaaa@aaaabbbb.com',
          full_name: 'AAA',
          user_id: 'usBBavu872gu',
          is_selected: false,
        },
      ]);
      expect(employeesService.getEmployeesBySearch).toHaveBeenCalledWith({
        limit: 20,
        order: 'full_name.asc,email.asc',
        or: '(email.ilike.%text%,full_name.ilike.%text%)',
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
        id: 'ouCI4UQ2G0K1',
        roles: 'ADMIN',
        is_enabled: true,
        has_accepted_invite: true,
        email: 'aiyush.d@fyle.in',
        full_name: 'Aiyush Dhar',
        user_id: 'usvKA4X8Ugcb',
        is_selected: true,
      },
    ]);

    expect(res).toEqual([
      {
        id: 'ouX8dwsbLCLv',
        roles: 'ADMIN',
        is_enabled: true,
        has_accepted_invite: true,
        email: 'ajain@fyle.in',
        full_name: 'Abhishek Jain',
        user_id: 'usvKA4X8Ugcz',
        is_selected: true,
      },
      {
        id: 'ouCI4UQ2G0K1',
        roles: 'ADMIN',
        is_enabled: true,
        has_accepted_invite: true,
        email: 'jay.b@fyle.in',
        full_name: 'Jay Budhadev',
        user_id: 'usvKA4X8Ugcr',
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
