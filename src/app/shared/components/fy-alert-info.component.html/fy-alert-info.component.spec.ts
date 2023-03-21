import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { FyAlertInfoComponent } from './fy-alert-info.component';

describe('FyAlertComponent', () => {
  let component: FyAlertInfoComponent;
  let fixture: ComponentFixture<FyAlertInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FyAlertInfoComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FyAlertInfoComponent);
    component = fixture.componentInstance;
    component.message = 'This expense might be a duplicate of an existing expense.';
    component.type = 'warning';
    component.showActionButton = true;
    component.actionButtonContent = 'View';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onActionClick(): should emit actionClick', () => {
    component.showActionButton = true;
    fixture.detectChanges();
    const actionClickSpy = spyOn(component.actionClick, 'emit');
    const buttonEl = getElementBySelector(fixture, '.alert-info-container--button') as HTMLElement;
    click(buttonEl);
    expect(actionClickSpy).toHaveBeenCalledTimes(1);
  });

  describe('template', () => {
    it('should display the correct message', () => {
      component.message = 'This expense might be a duplicate of an existing expense.';
      fixture.detectChanges();
      const messageEl = getElementBySelector(fixture, '.alert-info-container--message');
      expect(getTextContent(messageEl)).toBe('This expense might be a duplicate of an existing expense.');
    });

    it('should display the action button when showActionButton is true', () => {
      component.showActionButton = true;
      fixture.detectChanges();
      const buttonEl = getElementBySelector(fixture, '.alert-info-container--button');
      expect(getTextContent(buttonEl)).toContain('View');
    });

    it('should not display the action button when showActionButton is false', () => {
      component.showActionButton = false;
      fixture.detectChanges();
      const buttonEl = getElementBySelector(fixture, '.alert-info-container--button');
      expect(buttonEl).toBeNull();
    });
  });
});
