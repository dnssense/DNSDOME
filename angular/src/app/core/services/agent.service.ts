import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { Agent } from '../models/Agent';
import { SecurityProfile } from '../models/SecurityProfile';
import { OperationResult } from '../models/OperationResult';
import { DeviceResponse } from '../models/DeviceResponse';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  private getRegisteredURL = this.config.getApiUrl() + "/devices/registered";
  private saveDeviceURL = this.config.getApiUrl() + "/devices/save";
  private getUnregisteredURL = this.config.getApiUrl() + "/devices/unregistered";
  private deleteDeviceURL = this.config.getApiUrl() + "/devices/delete";
  private getAgentsURL = this.config.getApiUrl() + "/agents";
  private saveAgentURL = this.config.getApiUrl() + "/agents/save";
  private deleteAgentURL = this.config.getApiUrl() + "/agents/delete/";
  private getSecurityProfilesURL = this.config.getApiUrl() + "/profiles";
  private saveSecurityProfileURL = this.config.getApiUrl() + "/profiles/save";
  private deleteSecurityProfileURL = this.config.getApiUrl() + "/profiles/delete";

  

  constructor(private http: HttpClient, private config: ConfigService) { }

  getRegisteredDevices(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.getRegisteredURL).map(data => data);
  }

  getUnregisteredDevices(): Observable<DeviceResponse[]> {
    return this.http.get<DeviceResponse[]>(this.getUnregisteredURL).map(data => data);
  }

  saveDevice(agent: any): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.saveDeviceURL, agent, this.getOptions()).map(data => data);
  }

  deleteDevice(ids: number[]): Observable<OperationResult> {
    let idList = []
    for (let i = 0; i < ids.length; i++) {
      idList.push({ id: ids[i] });
    }
    return this.http.post<OperationResult>(this.deleteDeviceURL, { agents: idList }, this.getOptions()).map(res => res);
  }

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

}
