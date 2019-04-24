import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomReportSearchComponent } from './customreport-search.component';

describe('CustomReportSearchComponent', () => {
  let component: CustomReportSearchComponent;
  let fixture: ComponentFixture<CustomReportSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomReportSearchComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomReportSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
