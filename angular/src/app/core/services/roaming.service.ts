import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { Agent } from '../models/Agent';
import { OperationResult } from '../models/OperationResult';

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

  saveClient(client: Agent): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.roamingClientUrl, JSON.stringify(client), this.options).map(data => data);
  }

  updateClient(client: Agent): Observable<OperationResult> {
    return this.http.put<OperationResult>(this.roamingClientUrl, JSON.stringify(client), this.options).map(data => data);
  }

  deleteClient(id: number): Observable<OperationResult> {
    return this.http.delete<OperationResult>(`${this.roamingClientUrl}/${id}`, this.options).map(res => res);
  }

}
