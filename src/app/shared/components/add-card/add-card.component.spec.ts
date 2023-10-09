import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddCardComponent } from './add-card.component';
import { getElementRef, getTextContent } from 'src/app/core/dom-helpers';

describe('AddCardComponent', () => {
  let component: AddCardComponent;
  let fixture: ComponentFixture<AddCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddCardComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a zero state message if showZeroStateMessage is true', () => {
    component.showZeroStateMessage = true;
    fixture.detectChanges();

    const zeroStateMessageElement = getElementRef(fixture, '[data-testid="zero-state-message"]');
    const zeroStateMessage = getTextContent(zeroStateMessageElement.nativeElement);

    expect(zeroStateMessageElement).toBeTruthy();
    expect(zeroStateMessage).toEqual('No card added yet!');
  });

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
