import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-fy-alert-info',
  templateUrl: './fy-alert-info.component.html',
  styleUrls: ['./fy-alert-info.component.scss'],
})
export class FyAlertInfoComponent implements OnInit {
  @Input() message: string;

  @Input() type: 'information' | 'warning';

  @Input() showActionButton = false;

  @Input() actionButtonContent = 'Action;';

  @Output() actionClick = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}

  onActionClick() {
    this.actionClick.emit();
  }
}
