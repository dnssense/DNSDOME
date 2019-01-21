import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { DashboardStatistic } from '../models/DashboardStatistic';

@Injectable({
  providedIn: 'root'
})
export class DashboardStatsService {

  path = '/api/dashboard';
  constructor(private httpClient: HttpClient, private config: ConfigService) { }

  getStatistics(): Observable<DashboardStatistic> {
    return this.httpClient.get<DashboardStatistic>(this.config.getApiUrl() + this.path);
  }
}
