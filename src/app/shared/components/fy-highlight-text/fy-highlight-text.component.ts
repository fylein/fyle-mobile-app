import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
@Component({
  selector: 'app-fy-highlight-text',
  templateUrl: './fy-highlight-text.component.html',
  styleUrls: ['./fy-highlight-text.component.scss'],
  // ViewEncapsulation will not allow style to be applied for innerHTML that comes from highlight pipe.
  // To avoid that, setting ViewEncapsulation to None
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class FyHighlightTextComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() fullText: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() queryText: string;

  constructor() {}

  ngOnInit() {}
}
