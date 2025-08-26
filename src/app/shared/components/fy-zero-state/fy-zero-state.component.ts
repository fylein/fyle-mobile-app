import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, input, output } from '@angular/core';
import { EventEmitter } from 'events';

@Component({
  selector: 'app-fy-zero-state',
  templateUrl: './fy-zero-state.component.html',
  styleUrls: ['./fy-zero-state.component.scss'],
  standalone: false,
})
export class FyZeroStateComponent implements OnInit, AfterViewInit {
  @ViewChild('messageRef') messageRef: ElementRef;

  readonly image = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() header: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() message: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() submessage: string;

  // TODO: Remove off when all old zero states are replaced with new ones
  // zero state has a max-width associated with the image.
  // This meant that I couldn't reuse it for the new places without the image appearing very small
  readonly unscaledImage = input(false);

  readonly useNewStyling = input(false);

  readonly taskImageStyle = input<object>(undefined);

  readonly linkClicked = output();

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.message?.indexOf('ion-icon') > -1) {
      this.messageRef.nativeElement.innerHTML = this.message;
      this.messageRef.nativeElement.getElementsByTagName('ion-icon')[0]?.classList.add('zero-state--icon');
    }
  }
}
