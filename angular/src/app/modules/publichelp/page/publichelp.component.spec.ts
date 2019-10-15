import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicHelpComponent } from './publichelp.component';

describe('PublicHelpComponent', () => {
  let component: PublicHelpComponent;
  let fixture: ComponentFixture<PublicHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublicHelpComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
