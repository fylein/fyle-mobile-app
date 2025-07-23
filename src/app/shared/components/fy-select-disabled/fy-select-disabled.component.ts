import { Component, Input, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-fy-select-disabled',
    templateUrl: './fy-select-disabled.component.html',
    styleUrls: ['./fy-select-disabled.component.scss'],
    imports: [MatIcon],
})
export class FySelectDisabledComponent implements OnInit {
  @Input() label = '';

  @Input() value = '';

  @Input() mandatory = false;

  constructor() {}

  ngOnInit() {}
}
