import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CaptiveComponent } from './captive.component';



describe('CaptiveComponent', () => {
  let component: CaptiveComponent;
  let fixture: ComponentFixture<CaptiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaptiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
