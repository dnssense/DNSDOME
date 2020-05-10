import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { Agent } from '../models/Agent';


@Injectable({ providedIn: 'root' })
export class RoamingService {

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) { }

  private roamingClientUrl = this.config.getApiUrl() + '/agent/roamingclient';

  private options: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  getClients(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.roamingClientUrl).map(data => data);
  }

  saveClient(client: Agent): Observable<Agent> {
    return this.http.post<Agent>(this.roamingClientUrl, client, this.options).map(data => data);
  }

  saveClients(clients: Agent[]): Observable<Agent> {

    return Observable.from(clients).concatMap(x => {

      return this.http.post<Agent>(this.roamingClientUrl, x, this.options).map(data => data);
    }).map(x => x).last();

  }

  updateClient(client: Agent): Observable<Agent> {
    return this.http.put<Agent>(this.roamingClientUrl, client, this.options).map(data => data);
  }

  deleteClient(id: number): Observable<{}> {
    return this.http.delete<{}>(`${this.roamingClientUrl}/${id}`, this.options).map(res => res);
  }

}
