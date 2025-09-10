import { Component, Input, output } from '@angular/core';
import { EventData } from './event-data.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-preference-setting',
  templateUrl: './preference-setting.component.html',
  styleUrls: ['./preference-setting.component.scss'],
  imports: [IonicModule, FormsModule],
})
export class PreferenceSettingComponent {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() title: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() content: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isEnabled: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() key: EventData['key'];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() defaultCurrency: string;

  readonly preferenceChanged = output<EventData>();

  onChange(): void {
    this.preferenceChanged.emit({ key: this.key, isEnabled: this.isEnabled });
  }
}
