import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonBWListProfileComponent } from './commonbwlistprofile.component';



describe('CommonBWListComponent', () => {
  let component: CommonBWListProfileComponent;
  let fixture: ComponentFixture<CommonBWListProfileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CommonBWListProfileComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonBWListProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
