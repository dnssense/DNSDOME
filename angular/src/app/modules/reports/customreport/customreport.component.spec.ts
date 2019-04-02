import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomReportComponent } from './customreport.component';

describe('ReportsComponent', () => {
  let component: CustomReportComponent;
  let fixture: ComponentFixture<CustomReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomReportComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
