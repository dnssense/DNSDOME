
import {from as observableFrom,  Observable } from 'rxjs';

import {last, concatMap, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
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
    return this.http.get<Agent[]>(this.roamingClientUrl).pipe(map(data => data));
  }

  saveClient(client: Agent): Observable<Agent> {
    return this.http.post<Agent>(this.roamingClientUrl, client, this.options).pipe(map(data => data));
  }

  saveClients(clients: Agent[]): Observable<Agent> {

    return observableFrom(clients).pipe(concatMap(x => {

      return this.http.post<Agent>(this.roamingClientUrl, x, this.options).pipe(map(data => data));
    }),map(x => x),last(),);

  }

  updateClient(client: Agent): Observable<Agent> {
    return this.http.put<Agent>(this.roamingClientUrl, client, this.options).pipe(map(data => data));
  }

  deleteClient(id: number): Observable<{}> {
    return this.http.delete<{}>(`${this.roamingClientUrl}/${id}`, this.options).pipe(map(res => res));
  }

}
