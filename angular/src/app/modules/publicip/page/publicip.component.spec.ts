import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicipComponent } from './publicip.component';



describe('PublicipComponent', () => {
  let component: PublicipComponent;
  let fixture: ComponentFixture<PublicipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
