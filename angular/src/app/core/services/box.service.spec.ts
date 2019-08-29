/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BoxService } from './box.service';

describe('Service: Box', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoxService]
    });
  });

  it('should ...', inject([BoxService], (service: BoxService) => {
    expect(service).toBeTruthy();
  }));
});
