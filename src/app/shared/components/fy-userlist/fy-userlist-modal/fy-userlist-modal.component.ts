import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { Observable, fromEvent, from, of } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { map, startWith, distinctUntilChanged, switchMap, finalize, debounceTime } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { Employee } from 'src/app/core/models/spender/employee.model';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { EmployeeParams } from 'src/app/core/models/employee-params.model';
@Component({
  selector: 'app-fy-userlist-modal',
  templateUrl: './fy-userlist-modal.component.html',
  styleUrls: ['./fy-userlist-modal.component.scss'],
  standalone: false,
})
export class FyUserlistModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() currentSelections: string[] = [];

  @Input() filteredOptions$: Observable<Partial<Employee>[]>;

  @Input() placeholder;

  @Input() allowCustomValues: boolean;

  value = '';

  eouc$: Observable<Partial<Employee>[]>;

  initialSelectedEmployees: string[] = [];

  userListCopy$: Observable<Employee[]>;

  newlyAddedItems$: Observable<Partial<Employee>[]>;

  invalidEmail = false;

  currentSelectionsCopy = [];

  isLoading = false;

  selectable = true;

  addOnBlur = true;

  selectedItemDict = {};

  readonly separatorKeysCodes = this.getSeparatorKeysCodes();

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private employeesService: EmployeesService,
  ) {}

  getSelectedItemDict(): Record<string, boolean> {
    return this.currentSelections.reduce((acc, curr) => {
      acc[curr] = true;
      return acc;
    }, {});
  }

  getSeparatorKeysCodes(): number[] {
    return [ENTER, COMMA];
  }

  addChip(event: MatChipInputEvent): void {
    if (event && event.chipInput) {
      event.chipInput.clear();
    }
  }

  removeChip(item: string): void {
    const updatedItem = {
      email: item,
      is_selected: false,
    };
    const event = {
      checked: false,
    };
    this.onSelect(updatedItem, event);
  }

  ngOnInit(): void {
    this.initialSelectedEmployees = cloneDeep(this.currentSelections);
    this.initialSelectedEmployees.sort((a, b) => (a < b ? -1 : 1));
    this.selectedItemDict = this.getSelectedItemDict();
  }

  clearValue(): void {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  getDefaultUsersList(): Observable<Partial<Employee>[]> {
    const params: Partial<EmployeeParams> = {
      order: 'full_name.asc,email.asc',
    };

    if (this.currentSelections.length > 0) {
      params.email = `in.(${this.currentSelections.join(',')})`;
    } else {
      params.limit = 20;
    }

    return from(this.employeesService.getEmployeesBySearch(params)).pipe(
      map((eouc) =>
        eouc.map((eou) => {
          eou.is_selected = this.currentSelections.indexOf(eou.email) > -1;
          return eou;
        }),
      ),
    );
  }

  getSearchedUsersList(searchText?: string): Observable<Partial<Employee>[]> {
    const params: Partial<EmployeeParams> = {
      limit: 20,
      order: 'full_name.asc,email.asc',
    };

    if (searchText) {
      params.or = `(email.ilike.%${searchText}%,full_name.ilike.%${searchText}%)`;
    }

    return this.employeesService.getEmployeesBySearch(params).pipe(
      map((eouc) =>
        eouc.map((eou) => {
          if (this.currentSelections && this.currentSelections.length > 0) {
            eou.is_selected = this.currentSelections.indexOf(eou.email) > -1;
          }
          return eou;
        }),
      ),
    );
  }

  getUsersList(searchText: string): Observable<Partial<Employee>[]> {
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
            }),
          ),
        ),
      );
    }
  }

  filterSearchedEmployees(searchedEmployees: Partial<Employee>[], employees: Partial<Employee>[]): Partial<Employee>[] {
    searchedEmployees = searchedEmployees.filter(
      (searchedEmployee) => !employees.find((employee) => employee.email === searchedEmployee.email),
    );
    return searchedEmployees;
  }

  getNewlyAddedUsers(filteredOptions: Partial<Employee>[]): Observable<Partial<Employee>[]> {
    // make a copy of current selections
    this.currentSelectionsCopy = [];
    this.currentSelections.forEach((val) => this.currentSelectionsCopy.push(val));

    // remove the ones which are in the filtered list
    // now currentSelectionsCopy will have only those emails which were newly added
    filteredOptions.forEach((item) => {
      const index = this.currentSelectionsCopy.indexOf(item.email);
      if (index > -1) {
        this.currentSelectionsCopy.splice(index, 1);
      }
    });

    // create a temp list of type Partial<Employee>[] and
    /// push items in currentSelectionsCopy as partial employee objects and setting the is_selected to true
    const newEmpList: Partial<Employee>[] = [];
    this.currentSelectionsCopy.forEach((item: string) => {
      newEmpList.push({ email: item, is_selected: true });
    });

    return of(newEmpList);
  }

  processNewlyAddedItems(searchText: string): Observable<Partial<Employee>[]> {
    return from(this.filteredOptions$).pipe(
      switchMap((filteredOptions) =>
        this.getNewlyAddedUsers(filteredOptions).pipe(
          map((newlyAddedItems: Partial<Employee>[]) => {
            if (searchText && searchText.length > 0) {
              const searchTextLowerCase = searchText.toLowerCase();
              const newItem = {
                isNew: true,
                email: searchText,
              };
              const newArr: (Partial<Employee> & { isNew?: boolean })[] = [];
              newArr.push(newItem);
              newlyAddedItems = newArr.concat(newlyAddedItems);
              return newlyAddedItems.filter(
                (item) => item?.email?.length > 0 && item.email.toLowerCase().includes(searchTextLowerCase),
              );
            }
            return newlyAddedItems;
          }),
        ),
      ),
    );
  }

  ngAfterViewInit(): void {
    const searchElement = this.searchBarRef.nativeElement as HTMLInputElement;

    this.filteredOptions$ = fromEvent<KeyboardEvent>(searchElement, 'keyup').pipe(
      map((event) => (event.target as HTMLInputElement).value),
      startWith(''),
      distinctUntilChanged(),
      debounceTime(400),
      switchMap((searchText: string) => this.getUsersList(searchText)),
    );

    if (this.allowCustomValues) {
      this.newlyAddedItems$ = fromEvent<KeyboardEvent>(searchElement, 'keyup').pipe(
        map((event) => (event.target as HTMLInputElement).value),
        startWith(''),
        distinctUntilChanged(),
        debounceTime(400),
        switchMap((searchText: string) => this.processNewlyAddedItems(searchText)),
      );
    }
    this.cdr.detectChanges();
  }

  onDoneClick(): void {
    this.modalController.dismiss();
  }

  onSelect(selectedOption: Partial<Employee>, event: { checked: boolean }): void {
    if (event.checked) {
      this.currentSelections.push(selectedOption.email);
    } else {
      const index = this.currentSelections.indexOf(selectedOption.email);
      this.currentSelections.splice(index, 1);
    }
    this.selectedItemDict = this.getSelectedItemDict();
  }

  useSelected(): void {
    this.modalController.dismiss({
      selected: this.currentSelections,
    });
  }

  onAddNew(): void {
    this.value = this.value.trim();
    if (!(this.currentSelections.indexOf(this.value) > -1)) {
      this.currentSelections.push(this.value);
    }
    this.clearValue();
    this.selectedItemDict = this.getSelectedItemDict();
  }
}
