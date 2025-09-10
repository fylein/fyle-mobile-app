import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { SidemenuFooterComponent } from './sidemenu-footer.component';
import { of } from 'rxjs';

describe('SidemenuFooterComponent', () => {
  let sidemenuFooterComponent: SidemenuFooterComponent;
  let fixture: ComponentFixture<SidemenuFooterComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(async () => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    await TestBed.configureTestingModule({
      imports: [TranslocoModule, SidemenuFooterComponent],
      providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidemenuFooterComponent);
    sidemenuFooterComponent = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'sidemenu.versionPrefix': 'v',
      };
      return translations[key] || key;
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sidemenuFooterComponent).toBeTruthy();
  });
});
