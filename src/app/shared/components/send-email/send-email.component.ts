import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PageState } from 'src/app/core/models/page-state.enum';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.scss'],
})
export class SendEmailComponent implements OnInit {
  @Input() title: string;

  @Input() content: string;

  @Input() subcontent: string;

  @Input() ctaText: string;

  @Input() successTitle: string;

  @Input() successContent: string;

  @Input() sendEmailPageState: PageState;

  @Input() isLoading: boolean;

  @Output() sendEmail = new EventEmitter<string>();

  fg: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder, private activatedRoute: ActivatedRoute) {}

  get pageStates() {
    return PageState;
  }

  ngOnInit() {
    const email = this.activatedRoute.snapshot.params.email || '';
    this.fg = this.formBuilder.group({
      email: [email, Validators.compose([Validators.required, Validators.pattern('\\S+@\\S+\\.\\S{2,}')])],
    });
  }

  onClickSend() {
    if (this.fg.controls.email.valid) {
      this.sendEmail.emit(this.fg.controls.email.value);
    } else {
      this.fg.controls.email.markAsTouched();
    }
  }
}
