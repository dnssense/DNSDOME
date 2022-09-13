import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PublicipComponent } from './publicip.component';



describe('PublicipComponent', () => {
  let component: PublicipComponent;
  let fixture: ComponentFixture<PublicipComponent>;

  beforeEach(waitForAsync(() => {
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
