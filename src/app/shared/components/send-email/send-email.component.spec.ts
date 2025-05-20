import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';

import { SendEmailComponent } from './send-email.component';

describe('SendEmailComponent', () => {
  let component: SendEmailComponent;
  let fixture: ComponentFixture<SendEmailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SendEmailComponent],
      imports: [IonicModule.forRoot(), MatFormFieldModule, FormsModule, RouterModule, RouterTestingModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                email: 'test@test.com',
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SendEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with email parameter', () => {
    expect(component.fg.controls.email.value).toEqual('test@test.com');
  });

  it('should emit the email address if valid', () => {
    const sendEmailSpy = spyOn(component.sendEmail, 'emit');
    component.fg.controls.email.setValue('test@test.com');
    component.onClickSend();
    expect(sendEmailSpy).toHaveBeenCalledOnceWith('test@test.com');
  });

  it('should not emit the email address if invalid', () => {
    const sendEmailSpy = spyOn(component.sendEmail, 'emit');
    component.fg.controls.email.setValue('not_an_email');
    component.onClickSend();
    expect(sendEmailSpy).not.toHaveBeenCalled();
  });
});
