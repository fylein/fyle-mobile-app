import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

type option = Partial<{ label: string; value: any }>;
type optionsData = Partial<{ options: option[]; areSameValues: boolean }>;

@Component({
  selector: 'app-category-dependent-fields-form',
  templateUrl: './category-dependent-fields-form.component.html',
  styleUrls: ['./category-dependent-fields-form.component.scss'],
})
export class CategoryDependentFieldsFormComponent implements OnInit {
  @Input() categoryDependentFormGroup: FormGroup;

  @Input() location1OptionsData$: Observable<optionsData>;

  @Input() location2OptionsData$: Observable<optionsData>;

  @Input() onwardDateOptionsData$: Observable<optionsData>;

  @Input() returnDateOptionsData$: Observable<optionsData>;

  @Input() flightJourneyTravelClassOptionsData$: Observable<optionsData>;

  @Input() flightReturnTravelClassOptionsData$: Observable<optionsData>;

  @Input() trainTravelClassOptionsData$: Observable<optionsData>;

  @Input() busTravelClassOptionsData$: Observable<optionsData>;

  @Input() distanceOptionsData$: Observable<optionsData>;

  @Input() distanceUnitOptionsData$: Observable<optionsData>;

  constructor() {}

  ngOnInit() {}
}
