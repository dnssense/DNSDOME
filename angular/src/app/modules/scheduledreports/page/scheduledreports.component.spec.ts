import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduledReportsComponent } from './scheduledreports.component';



describe('ScheduledReportsComponent', () => {
  let component: ScheduledReportsComponent;
  let fixture: ComponentFixture<ScheduledReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduledReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
