import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { Observable, fromEvent, from } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { map, startWith, distinctUntilChanged, switchMap, finalize, concatMap } from 'rxjs/operators';
import { isEqual, cloneDeep } from 'lodash';
import { Employee } from 'src/app/core/models/employee.model';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-fy-userlist-modal',
  templateUrl: './fy-userlist-modal.component.html',
  styleUrls: ['./fy-userlist-modal.component.scss'],
})
export class FyUserlistModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;
  @Input() currentSelections: any[] = [];
  @Input() filteredOptions$: Observable<Employee[]>;
  @Input() placeholder;

  value;
  eouc$: Observable<Employee[]>;
  options: { label: string, value: any, selected?: boolean }[] = [];
  selectedUsers: any[] = [];
  intialSelectedEmployees: any[] = [];
  userListCopy$: Observable<Employee[]>;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private orgUserService: OrgUserService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.intialSelectedEmployees = cloneDeep(this.currentSelections);
    this.intialSelectedEmployees.sort((a, b) => a < b ? -1 : 1);
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

    return from(this.loaderService.showLoader('Loading...')).pipe(
      switchMap(_ => {
        return this.orgUserService.getEmployeesBySearch(params);
      }),
      map(eouc => {
        return eouc.map(eou => {
          eou.is_selected = this.currentSelections.indexOf(eou.us_email) > -1;
          return eou;
        });
      }),
      finalize(() => from(this.loaderService.hideLoader()))
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
      map(eouc => {
        return eouc.map(eou => {
          if (this.currentSelections && this.currentSelections.length > 0) {
            eou.is_selected = this.currentSelections.indexOf(eou.us_email) > -1;
          }
          return eou;
        });
      })
    );
  }

  getUsersList(searchText) {
    if (searchText) {
      return this.getSearchedUsersList(searchText);
    } else {
      return this.getDefaultUsersList().pipe(
        switchMap(employees => {
          return this.getSearchedUsersList().pipe(
            map(searchedEmployees => {
              searchedEmployees = searchedEmployees.filter(searchedEmployee => {
                return !employees.find(employee => employee.us_email === searchedEmployee.us_email);
              });
              return employees.concat(searchedEmployees);
            })
          );
        })
      );
    }
  }

  ngAfterViewInit() {
    this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) => {
        return this.getUsersList(searchText);
      })
    );
    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onSelect(selectedOption: Employee, event: { checked: boolean; }) {
    if (event.checked) {
      this.currentSelections.push(selectedOption.us_email);
    } else {
      const index = this.currentSelections.indexOf(selectedOption.us_email);
      this.currentSelections.splice(index, 1);
    }
  }

  useSelected() {
    this.modalController.dismiss({
      selected: this.currentSelections
    });
  }
}
