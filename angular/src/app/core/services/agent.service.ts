import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { Agent } from '../models/Agent';
import { SecurityProfile } from '../models/SecurityProfile';
import { OperationResult } from '../models/OperationResult';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private getAgentsURL = this.config.getApiUrl() + "/agents";
  private saveAgentURL = this.config.getApiUrl() + "/agents/save";
  private deleteAgentURL = this.config.getApiUrl() + "/agents/delete/";
  private getSecurityProfilesURL = this.config.getApiUrl() + "/profiles";
  private saveSecurityProfileURL = this.config.getApiUrl() + "/profiles/save";
  private deleteSecurityProfileURL = this.config.getApiUrl() + "/profiles/delete";

  private getLinkURL = this.config.getApiUrl() + "/box/roamingclientlink";

  constructor(private http: HttpClient, private config: ConfigService) { }

  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.getAgentsURL).map(data => data);
  }

  saveAgent(agent: Agent): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.saveAgentURL, JSON.stringify(agent), this.getOptions()).map(data => data);
  }

  deleteAgent(id: number): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.deleteAgentURL, { "id": id }, this.getOptions()).map(res => res);
  }

  getSecurityProfiles(): Observable<SecurityProfile[]> {
    return this.http.get<SecurityProfile[]>(this.getSecurityProfilesURL).map(data => data);
  }

  saveSecurityProfile(p: SecurityProfile): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.saveSecurityProfileURL, JSON.stringify(p), this.getOptions()).map(res => res);
  }

  deleteSecurityProfile(id: number): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.deleteSecurityProfileURL, { "id": id }, this.getOptions()).map(res => res);
  }

  getProgramLink(): Observable<any> {
    return this.http.get<any>(this.getLinkURL).map(data => data);
  }

  getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    return options;
  }

}
