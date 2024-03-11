import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenceActivationComponent } from './licence-activation.component';

describe('LicenceActivationComponent', () => {
  let component: LicenceActivationComponent;
  let fixture: ComponentFixture<LicenceActivationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ LicenceActivationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenceActivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
