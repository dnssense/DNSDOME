import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SecurityProfilesComponent } from './securityprofiles.component';



describe('SecurityProfilesComponent', () => {
  let component: SecurityProfilesComponent;
  let fixture: ComponentFixture<SecurityProfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecurityProfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
