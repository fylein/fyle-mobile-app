import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-sidemenu-footer',
  templateUrl: './sidemenu-footer.component.html',
  styleUrls: ['./sidemenu-footer.component.scss'],
})
export class SidemenuFooterComponent implements OnInit {
  @Input() appVersion: string;

  constructor() {}

  ngOnInit(): void {}
}
