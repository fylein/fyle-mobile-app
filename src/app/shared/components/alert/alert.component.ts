import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  @Input() message: string;
  @Output() outputMessage: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit() {}

  onClick() {
    this.message = 'Message received!!!!!';
    this.outputMessage.emit(this.message);
  }

}
