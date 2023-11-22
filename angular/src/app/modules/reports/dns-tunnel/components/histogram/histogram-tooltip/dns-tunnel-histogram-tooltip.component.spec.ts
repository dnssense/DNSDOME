import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DnsTunnelHistogramTooltipComponent } from './dns-tunnel-histogram-tooltip.component';

describe('HistogramTooltipComponent', () => {
  let component: DnsTunnelHistogramTooltipComponent;
  let fixture: ComponentFixture<DnsTunnelHistogramTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DnsTunnelHistogramTooltipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DnsTunnelHistogramTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
