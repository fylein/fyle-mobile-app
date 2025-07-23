import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FySelectDisabledComponent } from './fy-select-disabled.component';
import { getTextContent, getElementBySelector } from 'src/app/core/dom-helpers';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('FySelectDisabledComponent', () => {
  let component: FySelectDisabledComponent;
  let fixture: ComponentFixture<FySelectDisabledComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FySelectDisabledComponent],
}).compileComponents();

    fixture = TestBed.createComponent(FySelectDisabledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the correct text', () => {
    component.label = 'Label';
    fixture.detectChanges();

    const labelText = getElementBySelector(fixture, '.fy-select--label-content');
    expect(getTextContent(labelText)).toEqual(component.label);
  });

  it('should check if mandatory is displayed', () => {
    component.mandatory = true;
    fixture.detectChanges();

    const mandatoryText = getElementBySelector(fixture, '.fy-select--mandatory');
    expect(getTextContent(mandatoryText)).toEqual('*');
  });
});
