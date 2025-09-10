import { Component, OnInit, Input, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderService } from 'src/app/core/services/loader.service';
import {
  switchMap,
  finalize,
  distinctUntilChanged,
  debounceTime,
  throttle,
  throttleTime,
  pairwise,
  map,
} from 'rxjs/operators';
import { from } from 'rxjs';
import { FyNumberComponent } from '../../../../shared/components/fy-number/fy-number.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-fy-currency-exchange-rate',
  templateUrl: './fy-currency-exchange-rate.component.html',
  styleUrls: ['./fy-currency-exchange-rate.component.scss'],
  imports: [IonicModule, FormsModule, ReactiveFormsModule, FyNumberComponent, TranslocoPipe],
})
export class FyCurrencyExchangeRateComponent implements OnInit {
  private modalController = inject(ModalController);

  private currencyService = inject(CurrencyService);

  private formBuilder = inject(UntypedFormBuilder);

  private loaderService = inject(LoaderService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() amount!: number;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() currentCurrency!: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() newCurrency!: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() txnDt!: Date;

  fg: UntypedFormGroup;

  toFixed(num: number, fixed: number): string {
    const re = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)?.[0] || '0';
  }

  ngOnInit() {
    this.fg = this.formBuilder.group({
      newCurrencyAmount: [, Validators.compose([Validators.required])],
      exchangeRate: [, Validators.compose([Validators.required])],
      homeCurrencyAmount: [, Validators.compose([Validators.required])],
    });

    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() =>
          this.currencyService.getExchangeRate(this.newCurrency, this.currentCurrency, this.txnDt || new Date()),
        ),
        finalize(() => from(this.loaderService.hideLoader())),
      )
      .subscribe((exchangeRate) => {
        this.fg.setValue({
          newCurrencyAmount: this.amount,
          exchangeRate,
          homeCurrencyAmount: this.currencyService.getAmountWithCurrencyFraction(
            exchangeRate * this.amount,
            this.currentCurrency,
          ),
        });
      });

    this.fg.controls.newCurrencyAmount.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      const amount = +this.fg.controls.newCurrencyAmount.value * +this.fg.controls.exchangeRate.value;
      if (amount && amount !== Infinity) {
        const formattedAmount = this.currencyService.getAmountWithCurrencyFraction(amount, this.currentCurrency);
        this.fg.controls.homeCurrencyAmount.setValue(formattedAmount, {
          emitEvent: false,
        });
      } else {
        this.fg.controls.homeCurrencyAmount.setValue(0, {
          emitEvent: false,
        });
      }
    });

    this.fg.controls.exchangeRate.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      const amount = +this.fg.controls.newCurrencyAmount.value * +this.fg.controls.exchangeRate.value;
      if (amount && amount !== Infinity) {
        const formattedAmount = this.currencyService.getAmountWithCurrencyFraction(amount, this.currentCurrency);
        this.fg.controls.homeCurrencyAmount.setValue(formattedAmount, {
          emitEvent: false,
        });
      } else {
        this.fg.controls.homeCurrencyAmount.setValue(0, {
          emitEvent: false,
        });
      }
    });

    this.fg.controls.homeCurrencyAmount.valueChanges.pipe(distinctUntilChanged()).subscribe((e) => {
      if (this.fg.controls.newCurrencyAmount.value && this.fg.controls.homeCurrencyAmount.value) {
        this.fg.controls.exchangeRate.setValue(
          this.toFixed(+this.fg.controls.homeCurrencyAmount.value / +this.fg.controls.newCurrencyAmount.value, 7),
          {
            emitEvent: false,
          },
        );
      }
    });
  }

  save() {
    this.modalController.dismiss({
      amount: +this.fg.value.newCurrencyAmount,
      homeCurrencyAmount: +this.fg.value.homeCurrencyAmount,
    });
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  constructor() {
    addIcons({ closeOutline });
    addIcons({ closeOutline });
  }
}
