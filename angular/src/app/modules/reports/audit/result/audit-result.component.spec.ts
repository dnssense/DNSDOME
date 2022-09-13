import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuditResultComponent } from './audit-result.component';

describe('MonitorResultComponent', () => {
  let component: AuditResultComponent;
  let fixture: ComponentFixture<AuditResultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AuditResultComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
