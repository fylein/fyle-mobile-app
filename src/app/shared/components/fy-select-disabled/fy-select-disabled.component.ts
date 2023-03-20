import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fy-select-disabled',
  templateUrl: './fy-select-disabled.component.html',
  styleUrls: ['./fy-select-disabled.component.scss'],
})
export class FySelectDisabledComponent implements OnInit {
  @Input() label = '';

  @Input() value = '';

  @Input() mandatory = false;

  constructor() {}

  ngOnInit() {}
}
