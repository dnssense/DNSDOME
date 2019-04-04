import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnTagInputComponent } from './column-tag-input.component';

describe('ColumnTagInputComponent', () => {
  let component: ColumnTagInputComponent;
  let fixture: ComponentFixture<ColumnTagInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ColumnTagInputComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnTagInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
