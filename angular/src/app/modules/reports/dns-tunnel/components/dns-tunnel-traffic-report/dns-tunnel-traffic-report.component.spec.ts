import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DnsTunnelTrafficReportComponent } from './dns-tunnel-traffic-report.component';

describe('DnsTunnelTrafficReportComponent', () => {
  let component: DnsTunnelTrafficReportComponent;
  let fixture: ComponentFixture<DnsTunnelTrafficReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DnsTunnelTrafficReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DnsTunnelTrafficReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
