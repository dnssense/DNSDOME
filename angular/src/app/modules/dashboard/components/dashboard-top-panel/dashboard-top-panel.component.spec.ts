import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {DashboardTopPanelComponent} from "./dashboard-top-panel.component";

describe('DashboardTopPanelComponent', () => {
  let component: DashboardTopPanelComponent;
  let fixture: ComponentFixture<DashboardTopPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardTopPanelComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTopPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
