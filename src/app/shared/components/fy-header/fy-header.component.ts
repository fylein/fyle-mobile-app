import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { HeaderState } from './header-state.enum';

@Component({
  selector: 'app-fy-header',
  templateUrl: './fy-header.component.html',
  styleUrls: ['./fy-header.component.scss'],
})
export class FyHeaderComponent implements OnInit {
  @Input() currentState: HeaderState;

  @Input() navigateBack = false;

  @Input() title = 'Fyle';

  @Input() isHiddenBorder = false;

  @Output() simpleSearchCancel = new EventEmitter();

  @Output() multiselectBack = new EventEmitter();

  get HeaderState() {
    return HeaderState;
  }

  constructor() {}

  ngOnInit() {}

  onSimpleSearchCancel() {
    this.simpleSearchCancel.emit();
  }

  onMultiselectBack() {
    this.multiselectBack.emit();
  }
}
