import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CustomReportResultColumnComponent } from './customreport-result-column.component';

describe('CustomReportResultColumnComponent', () => {
  let component: CustomReportResultColumnComponent;
  let fixture: ComponentFixture<CustomReportResultColumnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CustomReportResultColumnComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomReportResultColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
