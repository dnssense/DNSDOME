/* tslint:disable:no-unused-variable */

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { ValidationService } from './validation.service';

describe('Service: Validation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidationService]
    });
  });

  it('should ...', inject([ValidationService], (service: ValidationService) => {
    expect(service).toBeTruthy();
  }));
});
