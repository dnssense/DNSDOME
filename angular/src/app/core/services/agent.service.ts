import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Agent, AgentDetail } from '../models/Agent';
import { DeviceGroup } from '../models/DeviceGroup';
import { DeviceResponse } from '../models/DeviceResponse';
import { SecurityProfile } from '../models/SecurityProfile';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  private getRegisteredURL = this.config.getApiUrl() + '/agent/device';
  private getUnregisteredURL = this.config.getApiUrl() + '/device/unregistered';
  private getAgentsURL = this.config.getApiUrl() + '/agent/location';

  private getSecurityProfilesURL = this.config.getApiUrl() + '/profile';
  private saveSecurityProfileURL = this.config.getApiUrl() + '/profile';
  private deleteSecurityProfileURL = this.config.getApiUrl() + '/profile';

  private saveDeviceURL = this.config.getApiUrl() + '/agent/device';
  private deleteDeviceURL = this.config.getApiUrl() + '/agent/device';

  private saveAgentURL = this.config.getApiUrl() + '/agent/location';
  private deleteAgentURL = this.config.getApiUrl() + '/agent/location';

  private getAgentAliveUrl = this.config.getApiUrl() + '/agent/alive/search';
  private getAgentInfoUrl = this.config.getApiUrl() + '/agent/info/search';




  constructor(private http: HttpClient, private config: ConfigService) { }

  getRegisteredDevices(): Observable<Agent[]> {

    return this.http.get<Agent[]>(this.getRegisteredURL).map(data => data);
  }

  getUnregisteredDevices(): Observable<DeviceResponse[]> {

    return this.http.get<DeviceResponse[]>(this.getUnregisteredURL).map(data => data);
  }

  saveAgentDevice(devices: DeviceGroup): Observable<Agent> {

    return Observable.from(devices.agents).concatMap(x => {

      x.agentGroup = { id: x.agentGroup ? x.agentGroup.id : 0, groupName: devices.agentGroup.groupName };
      x.rootProfile = devices.rootProfile;

      return this.http.post<Agent>(this.saveDeviceURL, x, this.getOptions()).map(data => data);
    }).map(x => x).last();

  }

  deleteAgentDevice(ids: number[]): Observable<{}> {

    return Observable.from(ids).concatMap(id =>
      this.http.delete<{}>(this.deleteDeviceURL + `/${id}`, this.getOptions())
    ).map(x => x).last();

  }

  getAgentLocation(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.getAgentsURL).map(data => data);
  }

  saveAgentLocation(agent: Agent): Observable<Agent> {

    return this.http.post<Agent>(this.saveAgentURL, agent, this.getOptions()).map(data => data);
  }

  deleteAgent(id: number): Observable<{}> {
    return this.http.delete<{}>(this.deleteAgentURL + `/${id}`, this.getOptions()).map(res => res);
  }

  getSecurityProfiles(): Observable<SecurityProfile[]> {
    return this.http.get<SecurityProfile[]>(this.getSecurityProfilesURL).map(data => data);
  }

  saveSecurityProfile(p: SecurityProfile): Observable<SecurityProfile> {
    return this.http.post<SecurityProfile>(this.saveSecurityProfileURL, p, this.getOptions()).map(res => res);

  }

  deleteSecurityProfile(id: number): Observable<{}> {
    return this.http.delete<{}>(this.deleteSecurityProfileURL + `/${id}`, this.getOptions()).map(res => res);
  }

  getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return options;
  }

  getAgentAlives(uuids: string[]): Observable<string[]> {

    return this.http.post<any>(this.getAgentAliveUrl, { agentSerials: uuids.join(',') }, this.getOptions()).map(res => res);
  }

  getAgentInfo(uuids: string[]): Observable<AgentDetail[]> {
    return this.http.post<any>(this.getAgentInfoUrl, { agentSerials: uuids.join(',') }, this.getOptions()).map(res => res);
  }

}
