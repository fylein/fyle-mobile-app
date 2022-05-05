import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EventEmitter, Injector, Output, TemplateRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  FormControl,
  FormGroup,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormBuilder,
  Validators,
} from '@angular/forms';

type Option = Partial<{
  label: string;
  value: any;
}>;

type OptionsData = Partial<{
  options: Option[];
  areSameValues: boolean;
  name: string;
  value: any;
}>;

@Component({
  selector: 'app-category-dependent-fields-form',
  templateUrl: './category-dependent-fields-form.component.html',
  styleUrls: ['./category-dependent-fields-form.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: CategoryDependentFieldsFormComponent, multi: true }],
})
export class CategoryDependentFieldsFormComponent implements OnInit, ControlValueAccessor, OnDestroy {
  @Output() fieldsTouched = new EventEmitter<string[]>();

  @Input() location1OptionsData: OptionsData;

  @Input() location2OptionsData: OptionsData;

  @Input() onwardDateOptionsData: OptionsData;

  @Input() returnDateOptionsData: OptionsData;

  @Input() flightJourneyTravelClassOptionsData: OptionsData;

  @Input() flightReturnTravelClassOptionsData: OptionsData;

  @Input() trainTravelClassOptionsData: OptionsData;

  @Input() busTravelClassOptionsData: OptionsData;

  @Input() distanceOptionsData: OptionsData;

  @Input() distanceUnitOptionsData: OptionsData;

  @Input() disableFormElements: boolean;

  categoryDependentFormGroup: FormGroup;

  onChangeSub: Subscription;

  constructor(private formBuilder: FormBuilder, private injector: Injector) {}

  ngOnInit() {
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

    this.categoryDependentFormGroup.valueChanges.subscribe((formControlNames) => {
      const touchedItems = [];
      Object.keys(formControlNames).forEach((key) => {
        if (this.categoryDependentFormGroup.get(key).touched) {
          touchedItems.push(key);
        }
      });
      this.fieldsTouched.emit(touchedItems);
    });
  }

  onTouched = () => {};

  ngOnDestroy(): void {
    this.onChangeSub.unsubscribe();
  }

  writeValue(value: any) {
    if (value) {
      this.categoryDependentFormGroup.patchValue(value);
    }
  }

  registerOnChange(onChange): void {
    this.onChangeSub = this.categoryDependentFormGroup.valueChanges.subscribe(onChange);
  }

  registerOnTouched(onTouched): void {
    this.onTouched = onTouched;
  }
}
