import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

type EventData = {
  key: 'instaFyle' | 'bulkFyle' | 'defaultCurrency' | 'formAutofill';
  isEnabled: boolean;
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

  @Output() preferenceChanged = new EventEmitter<EventData>();

  constructor() {}

  ngOnInit(): void {}

  onChange() {
    this.preferenceChanged.emit({ key: this.key, isEnabled: this.isEnabled });
  }
}
