import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { Observable, fromEvent, from, of } from 'rxjs';
import { ModalController } from '@ionic/angular';
import {
  map,
  startWith,
  distinctUntilChanged,
  switchMap,
  finalize,
  concatMap,
  debounceTime,
  tap,
} from 'rxjs/operators';
import { isEqual, cloneDeep, startsWith } from 'lodash';
import { Employee } from 'src/app/core/models/spender/employee.model';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';
@Component({
  selector: 'app-fy-userlist-modal',
  templateUrl: './fy-userlist-modal.component.html',
  styleUrls: ['./fy-userlist-modal.component.scss'],
})
export class FyUserlistModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() currentSelections: any[] = [];

  @Input() filteredOptions$: Observable<Partial<Employee>[]>;

  @Input() placeholder;

  @Input() allowCustomValues: boolean;

  value;

  eouc$: Observable<Partial<Employee>[]>;

  options: { label: string; value: any; selected?: boolean }[] = [];

  selectedUsers: any[] = [];

  intialSelectedEmployees: any[] = [];

  userListCopy$: Observable<Employee[]>;

  newlyAddedItems$: Observable<Partial<Employee>[]>;

  invalidEmail = false;

  currentSelectionsCopy = [];

  isLoading = false;

  selectable = true;

  removable = true;

  addOnBlur = true;

  selectedItemDict = {};

  readonly separatorKeysCodes = this.getSeparatorKeysCodes();

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private orgUserService: OrgUserService,
    private loaderService: LoaderService
  ) {}

  getSelectedItemDict() {
    return this.currentSelections.reduce((acc, curr) => {
      acc[curr] = true;
      return acc;
    }, {});
  }

  getSeparatorKeysCodes() {
    return [ENTER, COMMA];
  }

  addChip(event: MatChipInputEvent) {
    if (event && event.chipInput) {
      event.chipInput.clear();
    }
  }

  removeChip(item) {
    const updatedItem = {
      us_email: item,
      is_selected: false,
    };
    const event = {
      checked: false,
    };
    this.onSelect(updatedItem, event);
  }

  ngOnInit() {
    this.intialSelectedEmployees = cloneDeep(this.currentSelections);
    this.intialSelectedEmployees.sort((a, b) => (a < b ? -1 : 1));
  }

  clearValue() {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  getDefaultUsersList() {
    const params: any = {
      order: 'us_full_name.asc,us_email.asc,ou_id',
    };

    if (this.currentSelections.length > 0) {
      params.us_email = `in.(${this.currentSelections.join(',')})`;
    } else {
      params.limit = 20;
    }

    return from(this.orgUserService.getEmployeesBySearch(params)).pipe(
      map((eouc) =>
        eouc.map((eou) => {
          eou.is_selected = this.currentSelections.indexOf(eou.us_email) > -1;
          return eou;
        })
      )
    );
  }

  getSearchedUsersList(searchText?: string) {
    const params: any = {
      limit: 20,
      order: 'us_full_name.asc,us_email.asc,ou_id',
    };

    if (searchText) {
      params.or = `(us_email.ilike.*${searchText}*,us_full_name.ilike.*${searchText}*)`;
    }

    return this.orgUserService.getEmployeesBySearch(params).pipe(
      map((eouc) =>
        eouc.map((eou) => {
          if (this.currentSelections && this.currentSelections.length > 0) {
            eou.is_selected = this.currentSelections.indexOf(eou.us_email) > -1;
          }
          return eou;
        })
      )
    );
  }

  getUsersList(searchText) {
    this.isLoading = true;
    // run ChangeDetectionRef.detectChanges to avoid
    // 'expression has changed after it was checked error'.
    // More details about CDR: https://angular.io/api/core/ChangeDetectorRef
    this.cdr.detectChanges();
    if (searchText) {
      return this.getSearchedUsersList(searchText);
    } else {
      return this.getDefaultUsersList().pipe(
        switchMap((employees) =>
          this.getSearchedUsersList().pipe(
            map((searchedEmployees) => {
              searchedEmployees = this.filterSearchedEmployees(searchedEmployees, employees);
              return employees.concat(searchedEmployees);
            }),
            finalize(() => {
              // set isLoading to false
              this.isLoading = false;
              // run ChangeDetectionRef.detectChanges to avoid 'expression has changed after it was checked error'.
              // More details about CDR: https://angular.io/api/core/ChangeDetectorRef
              this.cdr.detectChanges();
              // set focus on input once data is loaded
              const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
              searchInput.focus();
            })
          )
        )
      );
    }
  }

  filterSearchedEmployees(searchedEmployees: Partial<Employee>[], employees: Partial<Employee>[]) {
    searchedEmployees = searchedEmployees.filter(
      (searchedEmployee) => !employees.find((employee) => employee.us_email === searchedEmployee.us_email)
    );
    return searchedEmployees;
  }

  getNewlyAddedUsers(filteredOptions) {
    // make a copy of current selections
    this.currentSelectionsCopy = [];
    this.currentSelections.forEach((val) => this.currentSelectionsCopy.push(val));

    // remove the ones which are in the filtered list
    // now currentSelectionsCopy will have only those emails which were newly added
    filteredOptions.forEach((item) => {
      const index = this.currentSelectionsCopy.indexOf(item.us_email);
      if (index > -1) {
        this.currentSelectionsCopy.splice(index, 1);
      }
    });

    // create a temp list of type Partial<Employee>[] and
    /// push items in currentSelectionsCopy as partial employee objects and setting the is_selected to true
    const newEmpList: Partial<Employee>[] = [];
    this.currentSelectionsCopy.forEach((item) => {
      newEmpList.push({ us_email: item, is_selected: true });
    });

    return of(newEmpList);
  }

  processNewlyAddedItems(searchText) {
    return from(this.filteredOptions$).pipe(
      switchMap((filteredOptions) =>
        this.getNewlyAddedUsers(filteredOptions).pipe(
          map((newlyAddedItems: Partial<Employee>[]) => {
            if (searchText && searchText.length > 0) {
              const searchTextLowerCase = searchText.toLowerCase();
              const newItem = {
                isNew: true,
                us_email: searchText,
              };
              const newArr = [];
              newArr.push(newItem);
              newlyAddedItems = newArr.concat(newlyAddedItems);
              return newlyAddedItems.filter(
                (item) =>
                  item &&
                  item.us_email &&
                  item.us_email.length > 0 &&
                  item.us_email.toLowerCase().includes(searchTextLowerCase)
              );
            }
            return newlyAddedItems;
          })
        )
      )
    );
  }

  ngAfterViewInit() {
    this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      debounceTime(400),
      switchMap((searchText) => this.getUsersList(searchText))
    );

    if (this.allowCustomValues) {
      this.newlyAddedItems$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
        map((event: any) => event.srcElement.value),
        startWith(''),
        distinctUntilChanged(),
        debounceTime(400),
        switchMap((searchText) => this.processNewlyAddedItems(searchText))
      );
    }
    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onSelect(selectedOption: Partial<Employee>, event: { checked: boolean }) {
    if (event.checked) {
      this.currentSelections.push(selectedOption.us_email);
    } else {
      const index = this.currentSelections.indexOf(selectedOption.us_email);
      this.currentSelections.splice(index, 1);
    }
    this.selectedItemDict = this.getSelectedItemDict();
  }

  useSelected() {
    this.modalController.dismiss({
      selected: this.currentSelections,
    });
  }

  onAddNew() {
    this.value = this.value.trim();
    if (!(this.currentSelections.indexOf(this.value) > -1)) {
      this.currentSelections.push(this.value);
    }
    this.clearValue();
    this.selectedItemDict = this.getSelectedItemDict();
  }
}
