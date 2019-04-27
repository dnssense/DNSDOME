import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomReportResultComponent } from './customreport-result.component';

describe('CustomReportResultComponent', () => {
  let component: CustomReportResultComponent;
  let fixture: ComponentFixture<CustomReportResultComponent>;

  beforeEach(async(() => {
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
