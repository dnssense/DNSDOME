import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DnsTunnelEventReportComponent } from './dns-tunnel-event-report.component';

describe('DnsTunnelEventReportComponent', () => {
  let component: DnsTunnelEventReportComponent;
  let fixture: ComponentFixture<DnsTunnelEventReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DnsTunnelEventReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DnsTunnelEventReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
