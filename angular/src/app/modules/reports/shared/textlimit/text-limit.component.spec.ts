import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TextLimitComponent } from './text-limit.component';

describe('TextLimitComponent', () => {
  let component: TextLimitComponent;
  let fixture: ComponentFixture<TextLimitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TextLimitComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextLimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
