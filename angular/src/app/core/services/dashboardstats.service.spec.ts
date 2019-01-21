/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DashboardStatsService } from './dashboardstats.service';

describe('Service: Dashboardstats', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardStatsService]
    });
  });

  it('should ...', inject([DashboardStatsService], (service: DashboardStatsService) => {
    expect(service).toBeTruthy();
  }));
});
