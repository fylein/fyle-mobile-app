import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fy-category-icon',
  templateUrl: './fy-category-icon.component.html',
  styleUrls: ['./fy-category-icon.component.scss'],
})
export class FyCategoryIconComponent implements OnInit {
  @Input() category: string;

  constructor() {}

  ngOnInit() {}
}
