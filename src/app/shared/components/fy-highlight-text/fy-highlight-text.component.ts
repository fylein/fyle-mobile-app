import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fy-highlight-text',
  templateUrl: './fy-highlight-text.component.html'
})
export class FyHighlightTextComponent implements OnInit {

  @Input() fullText: string;
  @Input() queryText: string;

  constructor() { }

  ngOnInit() {}

}
