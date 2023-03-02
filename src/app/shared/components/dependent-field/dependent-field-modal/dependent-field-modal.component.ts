import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectorRef } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, startWith, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { PlatformDependentFieldValue } from 'src/app/core/models/platform/platform-dependent-field-value.model';

@Component({
  selector: 'app-dependent-field-modal',
  templateUrl: './dependent-field-modal.component.html',
  styleUrls: ['./dependent-field-modal.component.scss'],
})
export class DependentFieldModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() currentSelection: string;

  @Input() placeholder: string;

  @Input() label: string;

  @Input() fieldId: number;

  @Input() parentFieldId: number;

  @Input() parentFieldValue: string;

  filteredOptions$: Observable<(PlatformDependentFieldValue & { selected?: boolean })[]>;

  value: string;

  isLoading = false;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private dependentFieldsService: DependentFieldsService
  ) {}

  ngOnInit() {}

  getDependentFieldOptions(searchQuery: string) {
    this.isLoading = true;

    return this.dependentFieldsService
      .getOptionsForDependentField({
        fieldId: this.fieldId,
        parentFieldId: this.parentFieldId,
        parentFieldValue: this.parentFieldValue,
        searchQuery,
      })
      .pipe(
        finalize(() => {
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
      map((dependentFieldOptions: (PlatformDependentFieldValue & { selected?: boolean })[]) =>
        dependentFieldOptions.map((option) => {
          if (option.expense_field_value === this.currentSelection) {
            option.selected = true;
          }
          return option;
        })
      )
    );

    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(option: PlatformDependentFieldValue & { selected?: boolean }) {
    this.modalController.dismiss(option.expense_field_value);
  }
}
