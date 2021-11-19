import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SelectCurrencyComponent } from '../select-currency/select-currency.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { Currency } from 'src/app/core/models/currency.model';

type EventData = {
  key: 'instaFyle' | 'bulkFyle' | 'defaultCurrency' | 'formAutofill';
  isEnabled: boolean;
  selectedCurrency?: Currency;
};
@Component({
  selector: 'app-preference-setting',
  templateUrl: './preference-setting.component.html',
  styleUrls: ['./preference-setting.component.scss'],
})
export class PreferenceSettingComponent implements OnInit {
  @Input() title: string;

  @Input() content: string;

  @Input() isEnabled: boolean;

  @Input() key: EventData['key'];

  @Input() defaultCurrency: string;

  @Output() preferenceChanged = new EventEmitter<EventData>();

  constructor(private modalController: ModalController, private modalProperties: ModalPropertiesService) {}

  ngOnInit(): void {}

  onChange() {
    this.preferenceChanged.emit({ key: this.key, isEnabled: this.isEnabled });
  }

  async openCurrencyModal() {
    const modal = await this.modalController.create({
      component: SelectCurrencyComponent,
      componentProps: {
        currentSelection: this.defaultCurrency,
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.selectedCurrency) {
      this.defaultCurrency = data.selectedCurrency.shortCode;
      this.preferenceChanged.emit({
        key: this.key,
        isEnabled: this.isEnabled,
        selectedCurrency: data.selectedCurrency,
      });
    }
  }
}
