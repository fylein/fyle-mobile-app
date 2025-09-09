import { Component, Input, ElementRef, AfterViewInit, OnInit, inject, input, viewChild } from '@angular/core';
import { Observable, from, fromEvent } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { switchMap, map, finalize, startWith, distinctUntilChanged } from 'rxjs/operators';
import { ModalController, IonicModule } from '@ionic/angular';
import { Employee } from 'src/app/core/models/spender/employee.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipGrid, MatChipRow, MatChipRemove, MatChipInput } from '@angular/material/chips';
import { Approver } from '../models/approver.model';
import { EmployeeParams } from 'src/app/core/models/employee-params.model';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatFormField, MatPrefix } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
    selector: 'app-approver-dialog',
    templateUrl: './approver-dialog.component.html',
    styleUrls: ['./approver-dialog.component.scss'],
    imports: [
        IonicModule,
        MatIcon,
        NgClass,
        MatFormField,
        MatChipGrid,
        MatChipRow,
        MatChipRemove,
        MatPrefix,
        FormsModule,
        MatChipInput,
        MatCheckbox,
        AsyncPipe,
        TranslocoPipe,
    ],
})
export class ApproverDialogComponent implements AfterViewInit, OnInit {
  private loaderService = inject(LoaderService);

  private employeesService = inject(EmployeesService);

  private modalController = inject(ModalController);

  private translocoService = inject(TranslocoService);

  readonly searchBarRef = viewChild<ElementRef<HTMLElement>>('searchBar');

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() approverEmailsList: string[];

  readonly id = input<string>(undefined);

  readonly ownerEmail = input<string>(undefined);

  readonly type = input(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() initialApproverList: Approver[];

  value: string;

  searchedApprovers$: Observable<Employee | Partial<Employee>[]>;

  selectedApproversList: Approver[] = [];

  searchTerm;

  areApproversAdded = true;

  addOnBlur = true;

  selectedApproversDict = {};

  readonly separatorKeysCodes = this.getSeparatorKeysCodes();

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
    const searchInput = this.searchBarRef().nativeElement as HTMLInputElement;
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
      this.selectedApproversList.push({ name: approver.full_name, email: approver.email });
    } else {
      this.selectedApproversList = this.selectedApproversList.filter(
        (selectedApprover) => selectedApprover.email !== approver.email,
      );
    }
    this.areApproversAdded = this.selectedApproversList.length === 0;
    this.selectedApproversDict = this.getSelectedApproversDict();
  }

  removeApprover(approver: Approver): void {
    this.selectedApproversList = this.selectedApproversList.filter(
      (selectedApprover) => selectedApprover.email !== approver.email,
    );
    this.areApproversAdded = this.selectedApproversList.length === 0;
    this.selectedApproversDict = this.getSelectedApproversDict();
  }

  getDefaultUsersList(): Observable<Partial<Employee>[]> {
    const params: Partial<EmployeeParams> = {
      order: 'full_name.asc,email.asc',
    };

    if (this.approverEmailsList.length > 0) {
      params.email = `in.(${this.approverEmailsList.join(',')})`;
    } else {
      params.limit = 20;
    }

    return from(this.loaderService.showLoader(this.translocoService.translate('approverDialog.loading'))).pipe(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      switchMap((_) => this.employeesService.getEmployeesBySearch(params)),
      map((approvers) =>
        approvers.map((approver) => {
          approver.is_selected = true;
          return approver;
        }),
      ),
      finalize(() => from(this.loaderService.hideLoader())),
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
      map((eouc) => eouc.filter((eou) => this.approverEmailsList.indexOf(eou.email) === -1)),
      map((eouc) =>
        eouc
          .map((eou) => {
            eou.is_selected = this.approverEmailsList.indexOf(eou.email) > -1;
            return eou;
          })
          .filter((employee) => employee.email !== this.ownerEmail()),
      ),
    );
  }

  getUsersList(searchText: string): Employee[] | Observable<Partial<Employee>[]> {
    if (searchText) {
      return this.getSearchedUsersList(searchText);
    } else {
      return this.getDefaultUsersList().pipe(
        switchMap((employees) => {
          employees = employees.filter((employee) => this.approverEmailsList.indexOf(employee.email) === -1);
          return this.getSearchedUsersList(null).pipe(
            map((searchedEmployees: Partial<Employee>[]) => {
              searchedEmployees = this.getSearchedEmployees(searchedEmployees, employees);
              return employees.concat(searchedEmployees);
            }),
          );
        }),
      );
    }
  }

  getSearchedEmployees(searchedEmployees: Partial<Employee>[], employees: Partial<Employee>[]): Partial<Employee>[] {
    searchedEmployees = searchedEmployees.filter(
      (searchedEmployee) => !employees.find((employee) => employee.email === searchedEmployee.email),
    );
    return searchedEmployees;
  }

  ngAfterViewInit(): void {
    this.searchedApprovers$ = fromEvent<{ srcElement: { value: string } }>(
      this.searchBarRef().nativeElement,
      'keyup',
    ).pipe(
      map((event) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText: string) => this.getUsersList(searchText)),
    );
  }
}
