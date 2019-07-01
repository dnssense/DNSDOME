import { Injectable } from '@angular/core';
import { AgentResponse } from '../models/AgentResponse';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { MobileCategory } from '../models/MobileCategory';
import { TimeProfileResponse } from '../models/TimeProfileResponse';
import { RequestOptions } from '@angular/http';
import { CollectiveBlockRequest } from '../models/CollectiveBlockRequest';
import { DayProfile } from '../models/DayProfile';
import { DayProfileGroup } from '../models/DayProfileGroup';
import { Agent } from '../models/Agent';
import { SecurityProfile } from '../models/SecurityProfile';
import { OperationResult } from '../models/OperationResult';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private unRegisteredAgentsURL = this.config.getApiUrl() + '/services/home-controller/unregistered';
  private registeredAgentsURL = this.config.getApiUrl() + '/services/home-controller/registered';
  private mobileCategoriesURL = this.config.getApiUrl() + '/services/home-controller/categories?agentId=';
  // private profilesURL = this.config.getApiUrl() + '/services/home-controller/profiles';
  private bedTimesURL = this.config.getApiUrl() + '/services/home-controller/bed-time';
  private collectiveBlockURL = this.config.getApiUrl() + "/services/home-controller/collective-block";
  //private deleteAgentURL = this.config.getApiUrl() + "/services/home-controller/agent";
  private createProfileURL = this.config.getApiUrl() + "/services/home-controller/profile";

  private getAgentsURL = this.config.getApiUrl() + "/agents";
  private saveAgentURL = this.config.getApiUrl() + "/agents/save";
  private deleteAgentURL = this.config.getApiUrl() + "/agents/delete/";
  private getSecurityProfilesURL = this.config.getApiUrl() + "/profiles";
  private saveSecurityProfileURL = this.config.getApiUrl() + "/profiles/save";
  private deleteSecurityProfileURL = this.config.getApiUrl() + "/profiles/delete";

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

  getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    return options;
  }


  // getRegisteredAgents(): Observable<AgentResponse[]> {
  //   return this.http.get<AgentResponse[]>(this.registeredAgentsURL).map(data => data);
  // }

  // getUnRegisteredAgents(): Observable<AgentResponse[]> {
  //   return this.http.get<AgentResponse[]>(this.unRegisteredAgentsURL).map(data => data);
  // }

  // getMobileCategories(agetId: number): Observable<MobileCategory[]> {
  //   return this.http.get<MobileCategory[]>(this.mobileCategoriesURL + agetId).map(data => data);
  // }

  // getProfiles(): Observable<TimeProfileResponse> {
  //   return this.http.get<TimeProfileResponse>(this.profilesURL).map(data => data);
  // }

  // getBedTimes(): Observable<TimeProfileResponse> {
  //   return this.http.get<TimeProfileResponse>(this.bedTimesURL).map(data => data);
  // }

  // collectiveBlock(cbr: CollectiveBlockRequest): Observable<AgentResponse> {

  //   let options = {
  //     headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  //   }
  //   let body = JSON.stringify(cbr, null, " ");
  //   return this.http.post<AgentResponse>(this.collectiveBlockURL, body, options).map(d => d);
  // }

  // // deleteAgent(agent: AgentResponse) {
  // //   let options = {
  // //     headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  // //   };

  // //   this.http.request('DELETE', this.deleteAgentURL, { body: JSON.stringify(agent, null, " ") });
  // // }

  saveProfile(profile: DayProfileGroup): Observable<DayProfileGroup> {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<DayProfileGroup>(this.createProfileURL, JSON.stringify(profile, null, ""), options).map(d => d);
  }
}
