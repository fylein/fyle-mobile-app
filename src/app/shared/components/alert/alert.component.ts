import { Component, OnInit, Input, Output } from '@angular/core';
import { TestComponentRenderer } from '@angular/core/testing';
import { EventEmitter } from 'events';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  @Input() message: string;
  close: any;

  constructor() { }

  ngOnInit() {}

}
