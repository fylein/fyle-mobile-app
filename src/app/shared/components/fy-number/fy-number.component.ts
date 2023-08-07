import { Component, forwardRef, Input, OnInit } from '@angular/core';
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
export class FyNumberComponent implements ControlValueAccessor, OnInit {
  @Input() placeholder: string;

  @Input() disabled: boolean;

  @Input() min: number;

  @Input() isAmount: boolean;

  isDisabled = false;

  fc: FormControl;

  isIos = false;

  isKeyboardPluginEnabled = true;

  // This variable stores the input without the decimal value
  inputWithoutDecimal: string;

  // This variable tracks if comma was clicked by the user.
  commaClicked = false;

  innerValue: string | number;

  isNegativeExpensePluginEnabled = false;

  negativeExpense: string;

  onTouchedCallback: () => void = noop;

  onChangeCallback: (_: string | number) => void = noop;

  keysForNegativeExpense = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '.'];

  constructor(private platform: Platform, private launchDarklyService: LaunchDarklyService) {}

  get value(): string | number {
    return this.innerValue;
  }

  set value(v: string | number) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  writeValue(value: string | number): void {
    if (value !== this.innerValue) {
      this.innerValue = value && parseFloat(value as string);
      this.fc.setValue(value && parseFloat(value as string));
      this.negativeExpense = this.fc.value as string;
    }
  }

  registerOnChange(fn: (_: string | number) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onBlur(): void {
    this.onTouchedCallback();
  }

  ngOnInit(): void {
    this.isIos = this.platform.is('ios');
    this.launchDarklyService
      .checkIfKeyboardPluginIsEnabled()
      .subscribe((isKeyboardPluginEnabled) => (this.isKeyboardPluginEnabled = isKeyboardPluginEnabled));

    this.launchDarklyService
      .checkIfNegativeExpensePluginIsEnabled()
      .subscribe(
        (isNegativeExpensePluginEnabled) => (this.isNegativeExpensePluginEnabled = isNegativeExpensePluginEnabled)
      );

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
  handleChange(event: KeyboardEvent): void {
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

  handleNegativeExpenseChange(event: KeyboardEvent): void {
    if (!this.keysForNegativeExpense.includes(event.key) && !(event.code === 'Backspace')) {
      event.preventDefault();
    }
  }
}
