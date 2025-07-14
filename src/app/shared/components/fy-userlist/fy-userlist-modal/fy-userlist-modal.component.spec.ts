import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  MatChipInputEvent,
  MatChipsModule,
} from '@angular/material/chips';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ModalController } from '@ionic/angular';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { FyUserlistModalComponent } from './fy-userlist-modal.component';
import { ChangeDetectorRef } from '@angular/core';
import { employeesParamsRes, employeesRes } from 'src/app/core/test-data/org-user.service.spec.data';
import { of } from 'rxjs';
import {
  selectedItem,
  selectedOptionRes,
  filteredOptionsRes,
  filteredDataRes,
  searchedUserListRes,
} from 'src/app/core/mock-data/employee.data';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { Employee } from 'src/app/core/models/spender/employee.model';
import { By } from '@angular/platform-browser';
import { cloneDeep } from 'lodash';

describe('FyUserlistModalComponent', () => {
  let component: FyUserlistModalComponent;
  let fixture: ComponentFixture<FyUserlistModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;
  let employeesService: jasmine.SpyObj<EmployeesService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    const employeesServiceSpy = jasmine.createSpyObj('EmployeesService', ['getEmployeesBySearch']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [FyUserlistModalComponent],
      imports: [
        IonicModule.forRoot(),
        MatIconTestingModule,
        FormsModule,
        MatChipsModule,
        MatIconModule,
        MatCheckboxModule,
        TranslocoModule,
      ],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ChangeDetectorRef, useValue: cdrSpy },
        { provide: EmployeesService, useValue: employeesServiceSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
    }).compileComponents();

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    cdr = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
    employeesService = TestBed.inject(EmployeesService) as jasmine.SpyObj<EmployeesService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyUserlistModal.title': 'Select items',
        'fyUserlistModal.done': 'Done',
        'fyUserlistModal.multiSelectAriaLabel': 'Multi select',
        'fyUserlistModal.searchPlaceholder': 'Search',
        'fyUserlistModal.selected': 'selected',
        'fyUserlistModal.addPrefix': 'Add "',
        'fyUserlistModal.addSuffix': '"',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    const employeesData = cloneDeep(employeesRes.data);
    employeesService.getEmployeesBySearch.and.returnValue(of(employeesData));
    fixture = TestBed.createComponent(FyUserlistModalComponent);
    component = fixture.componentInstance;
    component.value = 'test value';
    component.currentSelections = cloneDeep([
      'ajain+12+12+1@fyle.in',
      'ajain+12121212@fyle.in',
      'aaaaaaa@aaaabbbb.com',
      'aaaaasdjskjd@sdsd.com',
      'kawaljeet.ravi22@gmail.com',
      'abcdefg@somemail.com',
    ]);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getSeparatorKeysCodes(): should get the number of separator keycodes', () => {
    const keyCodeData = [13, 188];
    const separatorKeysCodes = component.getSeparatorKeysCodes();
    expect(separatorKeysCodes).toEqual(keyCodeData);
  });

  it('getSelectedItemDict(): should return a selected item dictonary', () => {
    const selectedItemDict = component.getSelectedItemDict();
    fixture.detectChanges();
    expect(selectedItemDict).toEqual(selectedItem);
  });

  it('clearValue(): should clear value ', () => {
    const input = getElementBySelector(fixture, '.selection-modal--form-input') as HTMLInputElement;

    component.clearValue();
    fixture.detectChanges();
    expect(component.value).toEqual('');
    expect(input.value).toEqual('');
  });

  it('addChip(): should add material chip', () => {
    const inputElement = getElementBySelector(fixture, '.selection-modal--form-input') as HTMLInputElement;
    const chipInput = jasmine.createSpyObj('chipInput', ['clear']);
    const event: MatChipInputEvent = {
      value: 'label',
      chipInput,
      input: inputElement,
    };
    component.addChip(event);
    fixture.detectChanges();
    expect(chipInput.clear).toHaveBeenCalledTimes(1);
  });

  describe('onSelect():', () => {
    it('add the employee email address to the list of currently selected email addresses', () => {
      const getSelectedItemDictSpy = spyOn(component, 'getSelectedItemDict').and.returnValue(selectedItem);
      component.onSelect(selectedOptionRes, { checked: true });
      fixture.detectChanges();
      expect(component.currentSelections).toContain('ajain+12+12+1@fyle.in');
      expect(getSelectedItemDictSpy).toHaveBeenCalledTimes(1);
    });

    it('remove the email address from the list of currently selected email addresses', () => {
      const getSelectedItemDictSpy = spyOn(component, 'getSelectedItemDict').and.returnValue(selectedItem);
      component.onSelect(selectedOptionRes, { checked: false });
      fixture.detectChanges();
      expect(component.currentSelections).not.toContain('ajain+12+12+1@fyle.in');
      expect(getSelectedItemDictSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('onDoneClick: should dismiss the model', () => {
    component.onDoneClick();
    expect(modalController.dismiss).toHaveBeenCalled();
  });

  it('useSelected(): should dismiss the modal with only current selection marked as selected', () => {
    component.useSelected();
    fixture.detectChanges();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selected: component.currentSelections });
  });

  it('onAddNew(): should add new email address', () => {
    const getSelectedItemDictSpy = spyOn(component, 'getSelectedItemDict').and.returnValue(selectedItem);
    const clearValueSpy = spyOn(component, 'clearValue');
    component.value = 'aditi.saini@fyle.in';
    component.onAddNew();
    fixture.detectChanges();
    expect(component.currentSelections).toContain('aditi.saini@fyle.in');
    expect(getSelectedItemDictSpy).toHaveBeenCalledTimes(1);
    expect(clearValueSpy).toHaveBeenCalledTimes(1);
  });

  it('removeChip(): should remove the selected item', () => {
    const onSelectSpy = spyOn(component, 'onSelect');
    const item = 'ajain121212@fyle.in';
    const updatedItem = {
      email: item,
      is_selected: false,
    };
    const event = {
      checked: false,
    };

    component.removeChip(item);
    fixture.detectChanges();
    expect(onSelectSpy).toHaveBeenCalledOnceWith(updatedItem, event);
  });

  describe('getDefaultUsersList():', () => {
    beforeEach(() => {
      const employeesData = cloneDeep(employeesParamsRes.data);
      employeesService.getEmployeesBySearch.and.returnValue(of(employeesData));
    });

    it('should get default users list', (done) => {
      const params = {
        order: 'full_name.asc,email.asc',
        email:
          'in.(ajain+12+12+1@fyle.in,ajain+12121212@fyle.in,aaaaaaa@aaaabbbb.com,aaaaasdjskjd@sdsd.com,kawaljeet.ravi22@gmail.com,abcdefg@somemail.com)',
      };

      component.getDefaultUsersList().subscribe((res) => {
        fixture.detectChanges();
        expect(res).toEqual(searchedUserListRes);
        expect(component.currentSelections).toEqual(component.currentSelections);
        expect(employeesService.getEmployeesBySearch).toHaveBeenCalledWith(params);
        done();
      });
    });

    it('should get default users list with empty params', () => {
      component.currentSelections = [];
      const params = { limit: 20, order: 'full_name.asc,email.asc' };

      component.getDefaultUsersList();
      fixture.detectChanges();
      expect(component.currentSelections).toEqual([]);
      expect(employeesService.getEmployeesBySearch).toHaveBeenCalledWith(params);
    });
  });

  it('getSearchedUsersList(): should get the searched user list', fakeAsync(() => {
    const params = {
      limit: 20,
      order: 'full_name.asc,email.asc',
      or: '(email.ilike.%ajain+12+12+1@fyle.in%,full_name.ilike.%ajain+12+12+1@fyle.in%)',
    };
    const employeesData = cloneDeep(employeesParamsRes.data);
    employeesService.getEmployeesBySearch.and.returnValue(of(employeesData));
    component.getSearchedUsersList('ajain+12+12+1@fyle.in').subscribe((res) => {
      fixture.detectChanges();
      expect(res).toEqual(searchedUserListRes);
      expect(employeesService.getEmployeesBySearch).toHaveBeenCalledWith(params);
    });
    tick(500);
  }));

  it('getNewlyAddedUsers', (done) => {
    component.currentSelectionsCopy = component.currentSelections;
    component.getNewlyAddedUsers(filteredOptionsRes).subscribe((res) => {
      fixture.detectChanges();
      expect(res).toEqual(filteredDataRes);
      done();
    });
  });

  describe('processNewlyAddedItems():', () => {
    it('should process newly processed items', fakeAsync(() => {
      const result = [
        {
          isNew: true,
          email: 'john.doe@fyle.in',
        },
      ];

      const searchText = 'john.doe@fyle.in';
      component.filteredOptions$ = of(filteredOptionsRes);
      const getNewlyAddedUsersSpy = spyOn(component, 'getNewlyAddedUsers').and.returnValue(of(filteredDataRes));
      component.processNewlyAddedItems(searchText).subscribe((res) => {
        fixture.detectChanges();
        expect(res).toEqual(result);
        expect(getNewlyAddedUsersSpy).toHaveBeenCalledOnceWith(filteredOptionsRes);
      });
      tick(500);
    }));

    it('should return the array as it is when search text is not provided', fakeAsync(() => {
      const result = filteredDataRes;
      const searchText = '';
      component.filteredOptions$ = of(filteredOptionsRes);
      const getNewlyAddedUsersSpy = spyOn(component, 'getNewlyAddedUsers').and.returnValue(of(filteredDataRes));
      component.processNewlyAddedItems(searchText).subscribe((res) => {
        fixture.detectChanges();
        expect(res).toEqual(result);
        expect(getNewlyAddedUsersSpy).toHaveBeenCalledOnceWith(filteredOptionsRes);
      });
      tick(500);
    }));
  });

  it('ngAfterViewInit(): should call processNewlyAddedItems() if allowCustomValues is true', fakeAsync(() => {
    component.allowCustomValues = true;
    const processNewlyAddedItemsSpy = spyOn(component, 'processNewlyAddedItems').and.returnValue(of(filteredDataRes));
    component.ngAfterViewInit();
    const result: Partial<Employee>[] = [
      {
        is_selected: true,
        email: 'john.doe@fyle.in',
      },
    ];

    component.newlyAddedItems$ = of(result);

    const searchBarInput = fixture.debugElement.query(By.css('input')).nativeElement;
    searchBarInput.value = 'john.doe@fyle.in';
    searchBarInput.dispatchEvent(new Event('keyup'));
    tick(400);
    expect(component.newlyAddedItems$).toBeDefined();
    expect(processNewlyAddedItemsSpy).toHaveBeenCalledWith(searchBarInput.value);
  }));

  describe('getUsersList():', () => {
    it('should return searched user list if searchText is provided', fakeAsync(() => {
      const searchText = 'ajain';
      const mockUsersList = cloneDeep(searchedUserListRes);
      const getSearchedUsersListSpy = spyOn(component, 'getSearchedUsersList').and.returnValue(of(mockUsersList));
      const result$ = component.getUsersList(searchText);
      fixture.detectChanges();
      expect(component.isLoading).toBeTrue();
      expect(getSearchedUsersListSpy).toHaveBeenCalledOnceWith(searchText);
      result$.subscribe((res) => {
        expect(res).toEqual(mockUsersList);
      });
      tick(500);
    }));

    it('should return default users list if searchText is not provided', fakeAsync(() => {
      const mockUsersList = cloneDeep(searchedUserListRes);
      spyOn(component, 'getSearchedUsersList').and.returnValue(of([]));
      const getDefaultUserListSpy = spyOn(component, 'getDefaultUsersList').and.returnValue(of(mockUsersList));
      const result$ = component.getUsersList('');
      fixture.detectChanges();
      result$.subscribe((res) => {
        expect(component.isLoading).toBeTrue();
        expect(res).toEqual(mockUsersList);
        expect(getDefaultUserListSpy).toHaveBeenCalledTimes(1);
      });
      tick(500);
      expect(component.isLoading).toBeFalse();
    }));
  });
});
