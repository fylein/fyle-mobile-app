import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

enum PageState {
  notSent,
  success,
  failure,
}

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.scss'],
})
export class SendEmailComponent implements OnInit {
  @Input() title: string;

  @Input() content: string;

  @Input() content2: string;

  @Input() ctaText: string;

  @Input() successTitle: string;

  @Input() successContent: string;

  @Input() pageState: PageState;

  @Input() isLoading: boolean;

  @Output() sendEmail = new EventEmitter<string>();

  fg: FormGroup;

  get pageStates() {
    return PageState;
  }

  constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute) {}

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
