import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RoamingComponent } from './roaming.component';



describe('RoamingComponent', () => {
  let component: RoamingComponent;
  let fixture: ComponentFixture<RoamingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoamingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoamingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
