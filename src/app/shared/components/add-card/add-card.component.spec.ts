import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddCardComponent } from './add-card.component';
import { getElementRef, getTextContent } from 'src/app/core/dom-helpers';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';
describe('AddCardComponent', () => {
  let component: AddCardComponent;
  let fixture: ComponentFixture<AddCardComponent>;
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
    imports: [IonicModule.forRoot(), TranslocoModule, AddCardComponent],
    providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
}).compileComponents();

    fixture = TestBed.createComponent(AddCardComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'addCard.noCardAddedYet': 'No card added yet!',
        'addCard.addCorporateCard': 'Add corporate card',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a zero state message if showZeroStateMessage is true', fakeAsync(() => {
    component.showZeroStateMessage = true;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const zeroStateMessageElement = getElementRef(fixture, '[data-testid="zero-state-message"]');
    const zeroStateMessage = getTextContent(zeroStateMessageElement.nativeElement);

    expect(zeroStateMessageElement).toBeTruthy();
    expect(zeroStateMessage).toEqual('No card added yet!');
  }));

  it('should not show a zero state message if showZeroStateMessage is false', () => {
    component.showZeroStateMessage = false;
    fixture.detectChanges();

    const zeroStateMessageElement = getElementRef(fixture, '[data-testid="zero-state-message"]');
    expect(zeroStateMessageElement).toBeNull();
  });

  it('should raise an event addCardClick when the add card container is clicked', () => {
    spyOn(component.addCardClick, 'emit');

    const addCardContainer = getElementRef(fixture, '[data-testid="add-card-container"]');
    addCardContainer.nativeElement.click();

    expect(component.addCardClick.emit).toHaveBeenCalled();
  });
});
