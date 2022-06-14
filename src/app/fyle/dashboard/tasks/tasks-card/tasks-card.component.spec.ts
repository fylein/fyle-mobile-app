import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksCardComponent } from './tasks-card.component';

xdescribe('TasksCardComponent', () => {
  let component: TasksCardComponent;
  let fixture: ComponentFixture<TasksCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TasksCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
