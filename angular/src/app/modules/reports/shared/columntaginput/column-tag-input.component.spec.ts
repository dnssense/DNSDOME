import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ColumnTagInputComponent } from './column-tag-input.component';

describe('ColumnTagInputComponent', () => {
  let component: ColumnTagInputComponent;
  let fixture: ComponentFixture<ColumnTagInputComponent>;

  beforeEach(waitForAsync(() => {
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
