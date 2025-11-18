import { Component, Input, OnDestroy, OnInit, inject, input, output } from '@angular/core';
import { Subscription, noop } from 'rxjs';
import {
  UntypedFormGroup,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  UntypedFormBuilder,
  UntypedFormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { FySelectComponent } from '../../../shared/components/fy-select/fy-select.component';
import { TranslocoPipe } from '@jsverse/transloco';

type Option = Partial<{
  label: string;
  value: string;
}>;

type OptionsData = Partial<{
  options: Option[];
  areSameValues: boolean;
  name: string;
  value: string;
}>;

@Component({
  selector: 'app-category-dependent-fields-form',
  templateUrl: './category-dependent-fields-form.component.html',
  styleUrls: ['./category-dependent-fields-form.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: CategoryDependentFieldsFormComponent, multi: true }],
  imports: [FormsModule, ReactiveFormsModule, NgClass, FySelectComponent, TranslocoPipe],
})
export class CategoryDependentFieldsFormComponent implements OnInit, ControlValueAccessor, OnDestroy {
  private formBuilder = inject(UntypedFormBuilder);

  readonly fieldsTouched = output<string[]>();

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() location1OptionsData: OptionsData;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() location2OptionsData: OptionsData;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() onwardDateOptionsData: OptionsData;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() returnDateOptionsData: OptionsData;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() flightJourneyTravelClassOptionsData: OptionsData;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() flightReturnTravelClassOptionsData: OptionsData;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() trainTravelClassOptionsData: OptionsData;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() busTravelClassOptionsData: OptionsData;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() distanceOptionsData: OptionsData;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() distanceUnitOptionsData: OptionsData;

  readonly disableFormElements = input<boolean>(undefined);

  categoryDependentFormGroup: UntypedFormGroup;

  onChangeSub: Subscription;

  onTouched: () => void = noop;

  isFieldTouched = (fieldName: string): boolean => this.categoryDependentFormGroup.get(fieldName).touched;

  ngOnInit(): void {
    this.categoryDependentFormGroup = this.formBuilder.group({
      location_1: [],
      location_2: [],
      from_dt: [],
      to_dt: [],
      flight_journey_travel_class: [],
      flight_return_travel_class: [],
      train_travel_class: [],
      bus_travel_class: [],
      distance: [],
      distance_unit: [],
    });

    this.categoryDependentFormGroup.valueChanges.subscribe((formControlNames: UntypedFormControl[]) => {
      const touchedItems: string[] = [];
      Object.keys(formControlNames).forEach((key) => {
        if (this.isFieldTouched(key)) {
          touchedItems.push(key);
        }
      });
      this.fieldsTouched.emit(touchedItems);
    });
  }

  ngOnDestroy(): void {
    this.onChangeSub?.unsubscribe();
  }

  writeValue(value: UntypedFormGroup): void {
    if (value) {
      this.categoryDependentFormGroup.patchValue(value);
    }
  }

  registerOnChange(onChange: () => void): void {
    this.onChangeSub = this.categoryDependentFormGroup.valueChanges.subscribe(onChange);
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }
}
