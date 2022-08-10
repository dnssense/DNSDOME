import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MonitorResultComponent } from './monitor-result.component';

describe('MonitorResultComponent', () => {
  let component: MonitorResultComponent;
  let fixture: ComponentFixture<MonitorResultComponent>;

  beforeEach(waitForAsync(() => {
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
