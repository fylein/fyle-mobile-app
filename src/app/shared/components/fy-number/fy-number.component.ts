import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { noop } from 'rxjs';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';

@Component({
  selector: 'app-fy-number',
  templateUrl: './fy-number.component.html',
  styleUrls: ['./fy-number.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyNumberComponent),
      multi: true,
    },
  ],
})
export class FyNumberComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() placeholder: string;

  @Input() disabled: boolean;

  @Input() min: number;

  isDisabled = false;

  fc: FormControl;

  isIos = false;

  isKeyboardPluginEnabled = true;

  // This variable stores the input without the decimal value
  inputWithoutDecimal: string;

  // This variable tracks if comma was clicked by the user.
  commaClicked = false;

  innerValue;

  onTouchedCallback: () => void = noop;

  onChangeCallback: (_: any) => void = noop;

  constructor(private platform: Platform, private launchDarklyService: LaunchDarklyService) {}

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value && parseFloat(value);
      this.fc.setValue(value && parseFloat(value));
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onBlur() {
    this.onTouchedCallback();
  }

  ngOnDestroy(): void {}

  ngOnInit() {
    this.isIos = this.platform.is('ios');
    this.launchDarklyService
      .checkIfKeyboardPluginIsEnabled()
      .subscribe((isKeyboardPluginEnabled) => (this.isKeyboardPluginEnabled = isKeyboardPluginEnabled));

    this.fc = new FormControl();
    this.fc.valueChanges.subscribe((value) => {
      if (typeof value === 'string') {
        this.value = value && parseFloat(value);
      } else if (typeof value === 'number') {
        this.value = value;
      } else {
        this.value = null;
      }
    });
  }

  // This is a hack to handle the comma key on ios devices in regions where the decimal separator is a comma
  handleChange(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;

    if (event.code === 'Comma') {
      this.commaClicked = true;
    } else {
      // If last input was a comma, patch value with period as decimal separator
      if (this.commaClicked) {
        this.commaClicked = false;
        this.fc.patchValue(this.inputWithoutDecimal + '.' + event.key);
      }
      this.inputWithoutDecimal = inputValue;
    }
  }
}
