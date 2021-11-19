import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-fy-nav-footer',
  templateUrl: './fy-nav-footer.component.html',
  styleUrls: ['./fy-nav-footer.component.scss'],
})
export class FyNavFooterComponent implements OnInit {
  @Input() activeEtxnIndex: number;

  @Input() numEtxnsInReport: number;

  @Output() nextClicked = new EventEmitter<void>();

  @Output() prevClicked = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}

  goToNext() {
    this.nextClicked.emit();
  }

  goToPrev() {
    this.prevClicked.emit();
  }
}
