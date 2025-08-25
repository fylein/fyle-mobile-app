import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EventData } from './event-data.model';
@Component({
  selector: 'app-preference-setting',
  templateUrl: './preference-setting.component.html',
  styleUrls: ['./preference-setting.component.scss'],
  standalone: false,
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

  @Output() preferenceChanged = new EventEmitter<EventData>();

  onChange(): void {
    this.preferenceChanged.emit({ key: this.key, isEnabled: this.isEnabled });
  }
}
