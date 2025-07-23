import { Component, OnInit, Input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-sidemenu-footer',
    templateUrl: './sidemenu-footer.component.html',
    styleUrls: ['./sidemenu-footer.component.scss'],
    imports: [TranslocoPipe],
})
export class SidemenuFooterComponent implements OnInit {
  @Input() appVersion: string;

  constructor() {}

  ngOnInit(): void {}
}
