import { Component, OnInit, input } from '@angular/core';

@Component({
  selector: 'app-sidemenu-footer',
  templateUrl: './sidemenu-footer.component.html',
  styleUrls: ['./sidemenu-footer.component.scss'],
  standalone: false,
})
export class SidemenuFooterComponent implements OnInit {
  readonly appVersion = input<string>(undefined);

  constructor() {}

  ngOnInit(): void {}
}
