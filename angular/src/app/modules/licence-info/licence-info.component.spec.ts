import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenceInfoComponent } from './licence-info.component';

describe('LicenceInfoComponent', () => {
  let component: LicenceInfoComponent;
  let fixture: ComponentFixture<LicenceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ LicenceInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
