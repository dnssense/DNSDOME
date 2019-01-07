import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { CaptiveStatistic } from '../models/CaptiveStatistic';

@Injectable({
  providedIn: 'root'
})
export class CaptivestatsService {

  path = '/api/captive';
  constructor(private httpClient: HttpClient, private config: ConfigService) { }

  getStatistics(): Observable<CaptiveStatistic> {
    return this.httpClient.get<CaptiveStatistic>(this.config.getApiUrl() + this.path);
  }
}
