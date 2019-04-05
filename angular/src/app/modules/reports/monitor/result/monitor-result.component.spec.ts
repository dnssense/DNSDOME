import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MonitorResultComponent } from './monitor-result.component';

describe('MonitorResultComponent', () => {
  let component: MonitorResultComponent;
  let fixture: ComponentFixture<MonitorResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MonitorResultComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
