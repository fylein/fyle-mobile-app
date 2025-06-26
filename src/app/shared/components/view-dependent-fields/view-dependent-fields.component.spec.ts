import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';

import { ViewDependentFieldsComponent } from './view-dependent-fields.component';
import { of } from 'rxjs';

describe('ViewDependentFieldsComponent', () => {
  let component: ViewDependentFieldsComponent;
  let fixture: ComponentFixture<ViewDependentFieldsComponent>;
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
      declarations: [ViewDependentFieldsComponent],
      imports: [IonicModule.forRoot(), TranslocoModule],
      providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewDependentFieldsComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'viewDependentFields.unspecified': 'Unspecified',
        'viewDependentFields.costCenterCode': 'Cost center code',
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

  it('should set parentFieldIcon to building by default', () => {
    expect(component.parentFieldIcon).toEqual('building');
  });

  it('should set parentFieldIcon to list if parent field type is project', () => {
    component.parentFieldType = 'PROJECT';
    component.ngOnInit();
    expect(component.parentFieldIcon).toEqual('list');
  });
});
