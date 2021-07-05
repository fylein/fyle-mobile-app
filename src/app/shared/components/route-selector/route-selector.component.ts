import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { RouteSelectorModalComponent } from './route-selector-modal/route-selector-modal.component';

@Component({
  selector: 'app-route-selector',
  templateUrl: './route-selector.component.html',
  styleUrls: ['./route-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: RouteSelectorComponent
    }
  ]
})
export class RouteSelectorComponent implements OnInit, ControlValueAccessor, OnDestroy {

  @Input() unit: 'KM' | 'MILES';
  @Input() mileageConfig;
  @Input() isDistanceMandatory;
  @Input() isAmountDisabled;
  @Input() txnFields;

  onTouched = () => { };

  onChangeSub: Subscription;

  form: FormGroup = this.fb.group({
    mileage_locations: new FormArray([]),
    distance: [, Validators.required],
    round_trip: [],
  })

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController
  ) { }

  get mileage_locations() {
    return this.form.controls.mileage_locations as FormArray;
  }

  ngOnDestroy(): void {
    this.onChangeSub.unsubscribe();
  }

  writeValue(value): void {
    if (value) {
      this.form.setValue(value);
    }
  }

  registerOnChange(onChange): void {
    this.onChangeSub = this.form.valueChanges.subscribe(onChange);
  }

  registerOnTouched(onTouched): void {
    this.onTouched = onTouched;
  }

  setDisabledState?(disabled: boolean): void {
    if (disabled) {
      this.form.disable();
    }
    else {
      this.form.enable();
    }
  }

  ngOnInit() { }

  async openModal() {
    const selectionModal = await this.modalController.create({
      component: RouteSelectorModalComponent,
      componentProps: {
        unit: this.unit,
        mileageConfig: this.txnFields,
        isDistanceMandatory: this.txnFields,
        isAmountDisabled: this.isAmountDisabled,
        txnFields: this.txnFields,
        value: this.form.value
      },
    });

    await selectionModal.present();

    const { data } = await selectionModal.onWillDismiss();

    if (data && data.mileageLocations) {

      this.mileage_locations.clear({
        emitEvent: false
      });

      data.mileageLocations.forEach(mileageLocation => {
        this.mileage_locations.push(new FormControl(mileageLocation, this.mileageConfig.location_mandatory && Validators.required))
      });
    }
  }

}
