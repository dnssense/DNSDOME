import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DnsTunnelComponent } from './dns-tunnel.component';

describe('DnsTunnelComponent', () => {
  let component: DnsTunnelComponent;
  let fixture: ComponentFixture<DnsTunnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DnsTunnelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DnsTunnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
