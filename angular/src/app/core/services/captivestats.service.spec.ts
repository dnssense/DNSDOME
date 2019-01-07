/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CaptivestatsService } from './captivestats.service';

describe('Service: Captivestats', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CaptivestatsService]
    });
  });

  it('should ...', inject([CaptivestatsService], (service: CaptivestatsService) => {
    expect(service).toBeTruthy();
  }));
});
