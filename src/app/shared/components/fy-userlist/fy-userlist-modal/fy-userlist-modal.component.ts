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
  // @Input() options: { label: string, value: any, selected?: boolean }[] = [];
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
    this.filteredOptions$ = from(this.loaderService.showLoader('Loading...')).pipe(
      switchMap(() => {
        const params: any = {
          us_email: 'in.(' + this.currentSelections.join(',') + ')',
          order: 'us_email.asc,ou_id',
        };
        return this.orgUserService.getEmployeesBySearch(params).pipe(
          map(employees => {
            return employees.map(employee => {
              employee.checked = true;
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

              console.log('sanjkdasdnk ->', selectedEou);
              employees = employees.concat(selectedEou);
            });
            console.log('last employees ->', employees);
            return employees;
          })
        );
      }),
      map(employees => employees.map(employee => {
          const employeesFinal =  ({ label: `${employee.us_full_name} (${employee.checked})`,
                    value: employee.us_email,
                    checked: employee.checked
                  });

          return cloneDeep(employeesFinal);
        }
      )),
      tap(res => console.log('final ->', res)),
      finalize(() => from(this.loaderService.hideLoader()))
    );

    this.userListCopy$ = this.filteredOptions$;
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
                eou.checked = this.currentSelections.map(x => x.us_email).indexOf(eou.value) > -1;
                return eou;
              });
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
          map(eous => cloneDeep(eous).map(eou => ({ label: `${eou.us_full_name} (${eou.checked})`, value: eou.us_email, checked: eou.checked })))
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
    this.selectedUsers.push(selectedOption);
  }

  useSelected() {
    this.modalController.dismiss({
      selected: this.selectedUsers
    });
  }
}
