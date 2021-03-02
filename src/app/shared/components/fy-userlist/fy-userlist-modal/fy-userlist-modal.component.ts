import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { Observable, fromEvent, noop, from } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { map, startWith, distinctUntilChanged, switchMap, tap, finalize, concatMap } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { Employee } from 'src/app/core/models/employee.model';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import {cloneDeep} from 'lodash';

@Component({
  selector: 'app-fy-userlist-modal',
  templateUrl: './fy-userlist-modal.component.html',
  styleUrls: ['./fy-userlist-modal.component.scss'],
})
export class FyUserlistModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;
  @Input() currentSelections: any[] = [];
  @Input() filteredOptions$: Observable<{ label: string, value: any, checked?: boolean }[]>;
  @Input() placeholder;
  value;
  eouc$: Observable<Employee[]>;
  options: { label: string, value: any, selected?: boolean }[] = [];
  selectedUsers: any[] = [];
  userListCopy$: Observable<{ label: string, value: any, checked?: boolean }[]>;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private orgUserService: OrgUserService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.userListCopy$ = from(this.loaderService.showLoader('Loading...')).pipe(
      switchMap(() => {
        const params: any = {
          us_email: 'in.(' + this.currentSelections.join(',') + ')',
          order: 'us_email.asc,ou_id',
        };
        return this.orgUserService.getEmployeesBySearch(params).pipe(
          map(employees => {
            return employees.map(employee => {
              employee.checked = true;

              const ifEmployeeExist = this.selectedUsers.find(x => x.value === employee.us_email);
              if (!ifEmployeeExist) {
                this.selectedUsers.push({
                  label: employee.us_full_name + `(${employee.us_email})`,
                  value: employee.us_email,
                  checked: employee.checked});
              }
              return employee;
            });
          })
        );
      }),
      switchMap(selectedEous => {
        const params: any = {
          limit: 20,
          order: 'us_email.asc,ou_id',
        };
        return this.orgUserService.getEmployeesBySearch(params).pipe(
          map(employees => {
            selectedEous.filter(selectedEou => {
              employees = employees.filter(employee => {
                return employee.us_email !== selectedEou.us_email;
              });

              employees = employees.concat(selectedEou);
            });
            return employees;
          })
        );
      }),
      map(employees => employees.map(employee => {
        return ({label: `${employee.us_full_name} (${employee.us_email})`, value: employee.us_email, checked: employee.checked});
        }
      ).sort((a, b) => a.checked < b.checked ? -1 : 1)),
      finalize(() => from(this.loaderService.hideLoader()))
    );
   }

  clearValue() {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ngAfterViewInit() {
    this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) => {
        if (!searchText) {
          return this.userListCopy$.pipe(
            map(eouc => {
              return eouc.map(eou => {
                eou.checked = this.selectedUsers.map(x => x.value).indexOf(eou.value) > -1;
                return eou;
              }).sort((a, b) => a.checked > b.checked ? -1 : 1);
            })
          );
        }

        const params: any = {
          limit: 20,
          us_email: 'in.(' + this.currentSelections.join(',') + ')',
          order: 'us_email.asc,ou_id',
        };

        if (searchText) {
          params.us_email = 'ilike.*' + searchText + '*';
        }

        return this.orgUserService.getEmployeesBySearch(params).pipe(
          map(eouc => {
            return eouc.map(eou => {
              eou.checked = this.selectedUsers.map(x => x.value).indexOf(eou.us_email) > -1;
              return ({ label: `${eou.us_full_name} (${eou.us_email})`, value: eou.us_email, checked: eou.checked });
            });
          })
        );
        }
      )
    );
    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelected(selectedOption) {
    if (selectedOption.checked) {
      this.selectedUsers.push(selectedOption);
    } else {
      const removedUser = this.selectedUsers.find(x => x.value === selectedOption.value);
      const index = this.selectedUsers.indexOf(removedUser);
      this.selectedUsers.splice(index, 1);
    }
  }

  useSelected() {
    this.modalController.dismiss({
      selected: this.selectedUsers
    });
  }
}
