/* tslint:disable:no-unused-variable */

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { AgentService } from './agent.service';
import { HttpClient } from '@angular/common/http';

describe('Service: Agent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgentService,HttpClient]
    });
  });

  it('should ...', inject([AgentService, HttpClient], (service: AgentService) => {
    expect(service).toBeTruthy();
  }));
 


});
