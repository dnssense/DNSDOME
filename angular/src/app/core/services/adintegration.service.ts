import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ConfigService} from './config.service';
import {Observable} from 'rxjs';
import {AgentRule} from '../models/AgentRule';


@Injectable({
    providedIn: 'root'
})
export class ADIntegrationService {
    private adIntegrationUrl = this.config.getApiUrl() + '/dnsrelay';


    constructor(private http: HttpClient, private config: ConfigService) { }

    getClients(): Observable<any> {
        return this.http.get(`${this.adIntegrationUrl}/clients`, this.getOptions()).map(res => res);
    }

    getRules(): Observable<any> {
        return this.http.get(`${this.adIntegrationUrl}/rules`, this.getOptions()).map(res => res);
    }

    getBoxes(): Observable<any> {
        return this.http.get(`${this.adIntegrationUrl}/box`, this.getOptions()).map(res => res);
    }

    getGroups(): Observable<any> {
        return this.http.get(`${this.adIntegrationUrl}/groups`, this.getOptions()).map(res => res);
    }

    setRule(rule: AgentRule) {
        return this.http.post(`${this.adIntegrationUrl}/rule`, rule, this.getOptions()).map(res => res);
    }

    deleteRule(rule: AgentRule) {
        return this.http.delete(`${this.adIntegrationUrl}/rule/${rule.ruleId}`).map(res => res);
    }

    getOptions() {
        return {
            headers: new HttpHeaders({'Content-Type': 'application/json'})
        };
    }
}
