import { Injectable } from '@angular/core';
import { AgentResponse } from '../models/AgentResponse';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { MobileCategory } from '../models/MobileCategory';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private unRegisteredAgentsURL = this.config.getApiUrl() + '/home-controller/unregistered';
  private registeredAgentsURL = this.config.getApiUrl() + '/home-controller/registered';
  private mobileCategoriesURL = this.config.getApiUrl() + '/home-controller/categories?agentId=';
  

  constructor(private http: HttpClient, private config: ConfigService) { }

  getRegisteredAgents(): Observable<AgentResponse[]> {
    return this.http.get<AgentResponse[]>(this.registeredAgentsURL).map(data => data);
  }

  getUnRegisteredAgents(): Observable<AgentResponse[]> {
    return this.http.get<AgentResponse[]>(this.unRegisteredAgentsURL).map(data => data);
  }

  getMobileCategories(agetId: number): Observable<MobileCategory[]>{
    return this.http.get<MobileCategory[]>(this.mobileCategoriesURL + agetId).map(data => data);
  }


}
