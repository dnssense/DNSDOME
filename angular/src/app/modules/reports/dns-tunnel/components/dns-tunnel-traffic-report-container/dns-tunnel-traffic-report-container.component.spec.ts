import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DnsTunnelTrafficReportContainerComponent } from './dns-tunnel-traffic-report-container.component';

describe('DnsTunnelTrafficReportContainerComponent', () => {
  let component: DnsTunnelTrafficReportContainerComponent;
  let fixture: ComponentFixture<DnsTunnelTrafficReportContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DnsTunnelTrafficReportContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DnsTunnelTrafficReportContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
