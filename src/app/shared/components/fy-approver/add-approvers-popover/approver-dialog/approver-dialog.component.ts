import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { Observable, from, fromEvent } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { switchMap, map, finalize, startWith, distinctUntilChanged } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { Employee } from 'src/app/core/models/spender/employee.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { Approver } from '../models/approver.model';
import { EmployeeParams } from 'src/app/core/models/employee-params.model';

@Component({
  selector: 'app-approver-dialog',
  templateUrl: './approver-dialog.component.html',
  styleUrls: ['./approver-dialog.component.scss'],
})
export class ApproverDialogComponent implements AfterViewInit, OnInit {
  @ViewChild('searchBar') searchBarRef: ElementRef<HTMLElement>;

  @Input() approverEmailsList: string[];

  @Input() id: string;

  @Input() ownerEmail: string;

  @Input() type;

  @Input() initialApproverList: Approver[];

  value: string;

  searchedApprovers$: Observable<Employee | Partial<Employee>[]>;

  selectedApproversList: Approver[] = [];

  searchTerm;

  areApproversAdded = true;

  selectable = true;

  removable = true;

  addOnBlur = true;

  selectedApproversDict = {};

  readonly separatorKeysCodes = this.getSeparatorKeysCodes();

  constructor(
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.selectedApproversList = this.initialApproverList;
    this.selectedApproversDict = this.getSelectedApproversDict();
  }

  getSelectedApproversDict(): Record<string, boolean> {
    return this.selectedApproversList.reduce((acc, curr) => {
      acc[curr.email] = true;
      return acc;
    }, {});
  }

  clearValue(): void {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
    this.getSearchedUsersList();
  }

  getSeparatorKeysCodes(): number[] {
    return [ENTER, COMMA];
  }

  addChip(event: MatChipInputEvent): void {
    if (event && event.chipInput) {
      event.chipInput.clear();
    }
    this.clearValue();
  }

  closeApproverModal(): void {
    this.modalController.dismiss();
  }

  async saveUpdatedApproveList(): Promise<void> {
    this.modalController.dismiss({ selectedApproversList: this.selectedApproversList });
  }

  onSelectApprover(approver: Employee, event: { checked: boolean }): void {
    if (event.checked) {
      this.selectedApproversList.push({ name: approver.us_full_name, email: approver.us_email });
    } else {
      this.selectedApproversList = this.selectedApproversList.filter(
        (selectedApprover) => selectedApprover.email !== approver.us_email
      );
    }
    this.areApproversAdded = this.selectedApproversList.length === 0;
    this.selectedApproversDict = this.getSelectedApproversDict();
  }

  removeApprover(approver: Approver): void {
    this.selectedApproversList = this.selectedApproversList.filter(
      (selectedApprover) => selectedApprover.email !== approver.email
    );
    this.areApproversAdded = this.selectedApproversList.length === 0;
    this.selectedApproversDict = this.getSelectedApproversDict();
  }

  getDefaultUsersList(): Observable<Partial<Employee>[]> {
    const params: Partial<EmployeeParams> = {
      order: 'us_full_name.asc,us_email.asc,ou_id',
    };

    if (this.approverEmailsList.length > 0) {
      params.us_email = `in.(${this.approverEmailsList.join(',')})`;
    } else {
      params.limit = 20;
    }

    return from(this.loaderService.showLoader('Loading...')).pipe(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      switchMap((_) => this.orgUserService.getEmployeesBySearch(params)),
      map((approvers) =>
        approvers.map((approver) => {
          approver.is_selected = true;
          return approver;
        })
      ),
      finalize(() => from(this.loaderService.hideLoader()))
    );
  }

  getSearchedUsersList(searchText?: string): Observable<Partial<Employee>[]> {
    const params: Partial<EmployeeParams> = {
      limit: 20,
      order: 'us_full_name.asc,us_email.asc,ou_id',
    };

    if (searchText) {
      params.or = `(us_email.ilike.*${searchText}*,us_full_name.ilike.*${searchText}*)`;
    }

    return this.orgUserService.getEmployeesBySearch(params).pipe(
      map((eouc) => eouc.filter((eou) => this.approverEmailsList.indexOf(eou.us_email) === -1)),
      map((eouc) =>
        eouc
          .map((eou) => {
            eou.is_selected = this.approverEmailsList.indexOf(eou.us_email) > -1;
            return eou;
          })
          .filter((employee) => employee.us_email !== this.ownerEmail)
      )
    );
  }

  getUsersList(searchText: string): Employee[] | Observable<Partial<Employee>[]> {
    if (searchText) {
      return this.getSearchedUsersList(searchText);
    } else {
      return this.getDefaultUsersList().pipe(
        switchMap((employees) => {
          employees = employees.filter((employee) => this.approverEmailsList.indexOf(employee.us_email) === -1);
          return this.getSearchedUsersList(null).pipe(
            map((searchedEmployees: Partial<Employee>[]) => {
              searchedEmployees = this.getSearchedEmployees(searchedEmployees, employees);
              return employees.concat(searchedEmployees);
            })
          );
        })
      );
    }
  }

  getSearchedEmployees(searchedEmployees: Partial<Employee>[], employees: Partial<Employee>[]): Partial<Employee>[] {
    searchedEmployees = searchedEmployees.filter(
      (searchedEmployee) => !employees.find((employee) => employee.us_email === searchedEmployee.us_email)
    );
    return searchedEmployees;
  }

  ngAfterViewInit(): void {
    this.searchedApprovers$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText: string) => this.getUsersList(searchText))
    );
  }
}
