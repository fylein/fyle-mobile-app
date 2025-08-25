import { Component, Input, OnInit, input } from '@angular/core';

@Component({
  selector: 'app-fy-select-disabled',
  templateUrl: './fy-select-disabled.component.html',
  styleUrls: ['./fy-select-disabled.component.scss'],
  standalone: false,
})
export class FySelectDisabledComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() label = '';

  readonly value = input('');

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() mandatory = false;

  constructor() {}

  ngOnInit() {}
}
