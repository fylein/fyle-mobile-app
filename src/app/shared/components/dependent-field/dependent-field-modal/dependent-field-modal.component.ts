import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectorRef } from '@angular/core';
import { fromEvent, Observable, of } from 'rxjs';
import { map, startWith, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { isEqual } from 'lodash';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';

@Component({
  selector: 'app-dependent-field-modal',
  templateUrl: './dependent-field-modal.component.html',
  styleUrls: ['./dependent-field-modal.component.scss'],
})
export class DependentFieldModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() currentSelection: any;

  @Input() showNullOption = true;

  @Input() enableSearch: boolean;

  @Input() selectModalHeader = '';

  @Input() placeholder: string;

  @Input() label: string;

  filteredOptions$: Observable<{ label: string; value: any; selected?: boolean }[]>;

  value;

  isLoading = false;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private dependentFieldsService: DependentFieldsService
  ) {}

  ngOnInit() {}

  getDependentFieldOptions(searchQuery: string) {
    this.isLoading = true;

    this.cdr.detectChanges();

    return this.dependentFieldsService
      .getOptionsForDependentField({
        fieldId: 1,
        parentFieldId: 3,
        parentValueId: 3,
        offset: 0,
        limit: 20,
        searchQuery,
      })
      .pipe(
        finalize(() => {
          this.cdr.detectChanges();
          this.isLoading = false;
        })
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
      switchMap((searchString) => this.getDependentFieldOptions(searchString)),
      map((projects: any[]) =>
        projects.map((project) => {
          if (isEqual(project.value, this.currentSelection)) {
            project.selected = true;
          }
          return project;
        })
      )
    );

    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(option) {
    this.modalController.dismiss(option);
  }
}
