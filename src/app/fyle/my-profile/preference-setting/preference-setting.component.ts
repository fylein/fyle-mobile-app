import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EventData } from './event-data.model';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
@Component({
    selector: 'app-preference-setting',
    templateUrl: './preference-setting.component.html',
    styleUrls: ['./preference-setting.component.scss'],
    imports: [IonicModule, FormsModule],
})
export class PreferenceSettingComponent {
  @Input() title: string;

  @Input() content: string;

  @Input() isEnabled: boolean;

  @Input() key: EventData['key'];

  @Input() defaultCurrency: string;

  @Output() preferenceChanged = new EventEmitter<EventData>();

  onChange(): void {
    this.preferenceChanged.emit({ key: this.key, isEnabled: this.isEnabled });
  }
}
