import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ModalController } from '@ionic/angular';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FyUserlistModalComponent } from './fy-userlist-modal.component';
import { ChangeDetectorRef } from '@angular/core';
import { customExpensefields } from 'src/app/core/mock-data/expense-field.data';
import { customPropertiesData } from 'src/app/core/mock-data/custom-property.data';
import { employeesParamsRes, employeesRes } from 'src/app/core/test-data/org-user.service.spec.data';
import { of } from 'rxjs';

const params = {
  order: 'us_full_name.asc,us_email.asc,ou_id',
  us_email: 'in.(ajain@fyle.in)',
  or: '(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS")',
  and: '(or(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS"),or(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS"))',
};

fdescribe('FyUserlistModalComponent', () => {
  let component: FyUserlistModalComponent;
  let fixture: ComponentFixture<FyUserlistModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let loaderService: jasmine.SpyObj<LoaderService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['getEmployeesBySearch']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

    TestBed.configureTestingModule({
      declarations: [FyUserlistModalComponent],
      imports: [IonicModule.forRoot(), MatIconTestingModule, FormsModule, MatChipsModule, MatIconModule],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ChangeDetectorRef, useValue: cdrSpy },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
      ],
    }).compileComponents();

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    cdr = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;

    orgUserService.getEmployeesBySearch.and.returnValue(of(employeesParamsRes.data));
    fixture = TestBed.createComponent(FyUserlistModalComponent);
    component = fixture.componentInstance;
    component.currentSelections = [
      'ajain+12+12+1@fyle.in',
      'ajain+12121212@fyle.in',
      'aaaaaaa@aaaabbbb.com',
      'aaaaasdjskjd@sdsd.com',
      'kawaljeet.ravi22@gmail.com',
      'abcdefg@somemail.com',
    ];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('getSelectedItemDict', () => {});
  xit('getSeparatorKeysCodes', () => {});
  xit('addChip', () => {});
  xit('removeChip', () => {});
  xit('clearValue', () => {});
  xit('getDefaultUsersList', () => {});
  xit('getSearchedUsersList', () => {});
  xit('getUsersList', () => {});
  xit('filterSearchedEmployees', () => {});
  xit('getNewlyAddedUsers', () => {});
  xit('processNewlyAddedItems', () => {});
  xit('onDoneClick', () => {});
  xit('onSelect', () => {});
  xit('useSelected', () => {});
  xit('onAddNew', () => {});
});
