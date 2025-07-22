import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { NgClass } from '@angular/common';
import { HighlightPipe } from '../../pipes/highlight.pipe';
@Component({
  selector: 'app-fy-highlight-text',
  templateUrl: './fy-highlight-text.component.html',
  styleUrls: ['./fy-highlight-text.component.scss'],
  // ViewEncapsulation will not allow style to be applied for innerHTML that comes from highlight pipe.
  // To avoid that, setting ViewEncapsulation to None
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [NgClass, HighlightPipe],
})
export class FyHighlightTextComponent implements OnInit {
  @Input() fullText: string;

  @Input() queryText: string;

  constructor() {}

  ngOnInit() {}
}
