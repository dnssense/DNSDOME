import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CustomReportResultComponent } from './customreport-result.component';

describe('CustomReportResultComponent', () => {
  let component: CustomReportResultComponent;
  let fixture: ComponentFixture<CustomReportResultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CustomReportResultComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomReportResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
