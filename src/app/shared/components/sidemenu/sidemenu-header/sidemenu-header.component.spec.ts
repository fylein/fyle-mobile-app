import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatRippleModule } from '@angular/material/core';
import { IonicModule } from '@ionic/angular';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { InitialsPipe } from 'src/app/shared/pipes/initials.pipe';

import { SidemenuHeaderComponent } from './sidemenu-header.component';

describe('SidemenuHeaderComponent', () => {
  let component: SidemenuHeaderComponent;
  let fixture: ComponentFixture<SidemenuHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidemenuHeaderComponent, InitialsPipe],
      imports: [IonicModule.forRoot(), MatRippleModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidemenuHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the profileClicked event when onProfileClicked is called', () => {
    const spy = spyOn(component.profileClicked, 'emit');
    const event = new Event('click');

    component.onProfileClicked(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should display the user name and organization name', () => {
    component.eou = apiEouRes;
    component.activeOrg = orgData1[0];
    fixture.detectChanges();

    const userNameInitialEl = getElementBySelector(fixture, '.sidemenu-header__icon-container__text');
    const activeOrgEl = getElementBySelector(fixture, '.sidemenu-header__content-container__sub-title');

    expect(userNameInitialEl).toBeTruthy();
    expect(getTextContent(userNameInitialEl)).toContain('AJ');
    expect(activeOrgEl).toBeTruthy();
    expect(getTextContent(activeOrgEl)).toContain('Staging Loaded');
  });
});
