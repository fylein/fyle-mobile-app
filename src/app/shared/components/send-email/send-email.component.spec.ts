import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { UntypedFormBuilder, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';

import { SendEmailComponent } from './send-email.component';
import { of } from 'rxjs';

describe('SendEmailComponent', () => {
  let component: SendEmailComponent;
  let fixture: ComponentFixture<SendEmailComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [SendEmailComponent],
      imports: [
        IonicModule.forRoot(),
        MatFormFieldModule,
        FormsModule,
        RouterModule,
        RouterTestingModule,
        TranslocoModule,
      ],
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
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SendEmailComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'sendEmail.fyleLogoAlt': 'fyle-logo-light',
        'sendEmail.placeholderWorkEmail': 'Work email',
        'sendEmail.invalidEmailError': 'Please enter a valid email.',
        'sendEmail.sendingLink': 'Sending link',
        'sendEmail.requestFailedTitle': 'Request failed',
        'sendEmail.requestFailedContent': 'Something went wrong. Please send us a note at support@fylehq.com',
        'sendEmail.backToSignIn': 'Back to sign in',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{${key}}`, params[key]);
        });
      }
      return translation;
    });
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
