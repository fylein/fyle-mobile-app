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

  describe('ngOnInit', () => {
    it('should set parentFieldIcon to "list" when parentFieldType is PROJECT', () => {
      component.parentFieldType = 'PROJECT';
      component.ngOnInit();
      expect(component.parentFieldIcon).toEqual('list');
    });

    it('should set parentFieldIcon to "building" when parentFieldType is COST_CENTER', () => {
      component.parentFieldType = 'COST_CENTER';
      component.ngOnInit();
      expect(component.parentFieldIcon).toEqual('building');
    });

    it('should set parentFieldIcon to "building" when parentFieldType is undefined', () => {
      component.parentFieldType = undefined;
      component.ngOnInit();
      expect(component.parentFieldIcon).toEqual('building');
    });

    it('should set parentFieldIcon to "building" when parentFieldType is null', () => {
      component.parentFieldType = null;
      component.ngOnInit();
      expect(component.parentFieldIcon).toEqual('building');
    });

    it('should set parentFieldIcon to "building" when parentFieldType is empty string', () => {
      component.parentFieldType = '' as any;
      component.ngOnInit();
      expect(component.parentFieldIcon).toEqual('building');
    });

    it('should be called automatically when component initializes', () => {
      spyOn(component, 'ngOnInit').and.callThrough();
      component.parentFieldType = 'PROJECT';
      fixture.detectChanges();
      expect(component.ngOnInit).toHaveBeenCalled();
    });
  });
});
