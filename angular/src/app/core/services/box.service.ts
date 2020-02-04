import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { Box } from '../models/Box';
import { OperationResult } from '../models/OperationResult';

@Injectable({
  providedIn: 'root'
})
export class BoxService {
  private getBoxesURL = this.config.getApiUrl() + "/boxes";
  private saveBoxURL = this.config.getApiUrl() + "/boxes/save";
  private deleteBoxURL = this.config.getApiUrl() + "/boxes/delete/"; 
  private virtualBoxURL = this.config.getApiUrl() + "/boxes/virtual"
  private getLinkURL = this.config.getApiUrl() + "/box/roamingclientlink";

  constructor(private http: HttpClient, private config: ConfigService) { }
  
  getBoxes(): Observable<Box[]> {
    return this.http.get<Box[]>(this.getBoxesURL).map(data => data);
  }

  saveBox(box: Box): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.saveBoxURL, JSON.stringify(box), this.getOptions()).map(data => data);
  }

  deleteBox(id: number): Observable<OperationResult> {
    return this.http.post<OperationResult>(this.deleteBoxURL, { "id": id }, this.getOptions()).map(res => res);
  }

  getVirtualBox(): Observable<Box> {
    return this.http.get<Box>(this.virtualBoxURL).map(data => data);
  }
  
  getProgramLink(domains: string): Observable<any> {
    return this.http.post<any>(this.getLinkURL, {donttouchdomains:domains},this.getOptions()).map(data => data);
  }
  
  private getOptions() {
    let options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    return options;
  }
}
