import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HamzaComponent } from './hamza.component';



describe('HamzaComponent', () => {
  let component: HamzaComponent;
  let fixture: ComponentFixture<HamzaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HamzaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HamzaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
