import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { HeaderState } from './header-state.enum';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { NgClass } from '@angular/common';
import { FyMenuIconComponent } from '../fy-menu-icon/fy-menu-icon.component';

@Component({
  selector: 'app-fy-header',
  templateUrl: './fy-header.component.html',
  styleUrls: ['./fy-header.component.scss'],
  standalone: true,
  imports: [IonicModule, NgClass, FyMenuIconComponent, TranslocoPipe],
})
export class FyHeaderComponent implements OnInit {
  @Input() currentState: HeaderState;

  @Input() navigateBack = false;

  @Input() title: string;

  @Input() isHiddenBorder = false;

  @Output() simpleSearchCancel = new EventEmitter();

  @Output() multiselectBack = new EventEmitter();

  constructor(private translocoService: TranslocoService) {}

  get HeaderState(): typeof HeaderState {
    return HeaderState;
  }

  ngOnInit(): void {
    this.title = this.title || this.translocoService.translate('fyHeader.fyle');
  }

  onSimpleSearchCancel(): void {
    this.simpleSearchCancel.emit();
  }

  onMultiselectBack(): void {
    this.multiselectBack.emit();
  }
}
