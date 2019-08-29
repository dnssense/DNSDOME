/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RoamingService } from './roaming.service';

describe('Service: Roaming', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoamingService]
    });
  });

  it('should ...', inject([RoamingService], (service: RoamingService) => {
    expect(service).toBeTruthy();
  }));
});
