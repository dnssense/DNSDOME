import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { Agent } from '../models/Agent';
import { OperationResult } from '../models/OperationResult';

@Injectable({ providedIn: 'root' })
export class RoamingService {
  private getRoamingsURL = this.config.getApiUrl() + "/roamingclients";
  private saveRoamingClientURL = this.config.getApiUrl() + "/roamingclients/save";
  private deleteRoamingClientURL = this.config.getApiUrl() + "/roamingclients/delete/";

  constructor(private http: HttpClient, private config: ConfigService) { }

  getClients(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.getRoamingsURL).map(data => data);
  }

  saveClient(client: Agent): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.saveRoamingClientURL, JSON.stringify(client), this.getOptions()).map(data => data);
  }

  deleteClient(id: number): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.deleteRoamingClientURL, { "id": id }, this.getOptions()).map(res => res);
  }

  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    return options;
  }


}
