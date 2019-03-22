import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RealTimeComponent } from './realtime.component';



describe('RealTimeComponent', () => {
  let component: RealTimeComponent;
  let fixture: ComponentFixture<RealTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
