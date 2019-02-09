/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AgentService } from './agent.service';

describe('Service: Agent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgentService]
    });
  });

  it('should ...', inject([AgentService], (service: AgentService) => {
    expect(service).toBeTruthy();
  }));
});
