import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-statuses-diff',
  templateUrl: './statuses-diff.component.html',
  styleUrls: ['./statuses-diff.component.scss'],
  standalone: false,
})
export class StatusesDiffComponent implements OnInit {
  @Input() key;

  @Input() value;

  isValueList: boolean;

  constructor() {}

  ngOnInit() {
    this.isValueList = this.value instanceof Array;
  }
}
