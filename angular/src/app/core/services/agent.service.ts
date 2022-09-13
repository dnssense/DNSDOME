
import {from as observableFrom,  Observable } from 'rxjs';

import {last, concatMap, map} from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AgentConf } from 'src/app/modules/roaming/page/roaming.component';
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
  private deleteUnregisteredURL = this.config.getApiUrl() + '/device/unregistered/byMac';
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
  private agentConfUrl = this.config.getApiUrl() + '/agent/conf';




  constructor(private http: HttpClient, private config: ConfigService) { }

  getRegisteredDevices(): Observable<Agent[]> {

    return this.http.get<Agent[]>(this.getRegisteredURL).pipe(map(data => data));
  }

  getUnregisteredDevices(): Observable<DeviceResponse[]> {

    return this.http.get<DeviceResponse[]>(this.getUnregisteredURL).pipe(map(data => data));
  }
  deleteUnregisteredDevices(mac: string): Observable<DeviceResponse[]> {

    return this.http.delete<DeviceResponse[]>(this.deleteUnregisteredURL + '/' + mac.replace(`:`, ``).toLowerCase()).pipe(map(data => data));
  }
  saveAgentDevice(devices: DeviceGroup): Observable<Agent> {

    return observableFrom(devices.agents).pipe(concatMap(x => {

      x.agentGroup = devices.agentGroup;
      x.rootProfile = devices.rootProfile;

      return this.http.post<Agent>(this.saveDeviceURL, x, this.getOptions()).pipe(map(data => data));
    }),map(x => x),last(),);

  }

  deleteAgentDevice(ids: number[]): Observable<{}> {

    return observableFrom(ids).pipe(concatMap(id =>
      this.http.delete<{}>(this.deleteDeviceURL + `/${id}`, this.getOptions())
    ),map(x => x),last(),);

  }

  getAgentLocation(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.getAgentsURL).pipe(map(data => data));
  }

  saveAgentLocation(agent: Agent): Observable<Agent> {

    return this.http.post<Agent>(this.saveAgentURL, agent, this.getOptions()).pipe(map(data => data));
  }

  deleteAgent(id: number): Observable<{}> {
    return this.http.delete<{}>(this.deleteAgentURL + `/${id}`, this.getOptions()).pipe(map(res => res));
  }

  getSecurityProfiles(): Observable<SecurityProfile[]> {
    return this.http.get<SecurityProfile[]>(this.getSecurityProfilesURL).pipe(map(data => data));
  }

  saveSecurityProfile(p: SecurityProfile): Observable<SecurityProfile> {
    return this.http.post<SecurityProfile>(this.saveSecurityProfileURL, p, this.getOptions()).pipe(map(res => res));

  }

  deleteSecurityProfile(id: number): Observable<{}> {
    return this.http.delete<{}>(this.deleteSecurityProfileURL + `/${id}`, this.getOptions()).pipe(map(res => res));
  }

  getOptions() {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return options;
  }

  getAgentAlives(uuids: string[]): Observable<{ clients?: string[] }> {
    return this.http.post<any>(this.getAgentAliveUrl, { agentSerials: uuids.join(',') }, this.getOptions()).pipe(map(res => res));
  }

  getAgentInfo(uuids: string[]): Observable<{ infos?: AgentDetail[] }> {
    return this.http.post<any>(this.getAgentInfoUrl, { agentSerials: uuids.join(',') }, this.getOptions()).pipe(map(res => res));
  }

  saveAgentConf(uuid: string, conf: AgentConf): Observable<any> {
    interface AgentConfItem {
      agentSerial: string;
      conf: AgentConf;
    }
    interface AgentConfRequest {
      items: AgentConfItem[];
    }

    return this.http.post(this.agentConfUrl, { items: [{ agentSerial: uuid, conf: conf }] }, this.getOptions()).pipe(map(res => res));
  }


}
