import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { FyZeroStateComponent } from './fy-zero-state.component';
import { of } from 'rxjs';

describe('FyZeroStateComponent', () => {
  let component: FyZeroStateComponent;
  let fixture: ComponentFixture<FyZeroStateComponent>;
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
      declarations: [FyZeroStateComponent],
      imports: [IonicModule.forRoot(), TranslocoModule],
      providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(FyZeroStateComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyZeroState.altText': 'zero',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check if message icon is displayed', () => {
    component.message = '<ion-icon><ion-icon>';
    fixture.detectChanges();
    component.ngAfterViewInit();

    expect(getElementBySelector(fixture, '.zero-state--icon')).toBeTruthy();
  });

  it('should check if header is displayed', () => {
    component.header = 'Header';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.zero-state--header'))).toEqual('Header');
  });

  it('should check if message is displayed', () => {
    component.message = 'A message';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.zero-state--description'))).toEqual('A message');
  });

  it('should check if message is displayed', () => {
    component.submessage = 'A sub message';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.zero-state--description'))).toEqual('A sub message');
  });
});
