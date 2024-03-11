import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
    HelpSupportResponseModel,
    HelpSupportModel,
    HelpSupportService
} from 'roksit-lib';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
declare const VERSION: string;
import FormData2 from 'form-data';


@Injectable({
    providedIn: 'root'
})
export class HelpSupportServiceImpl extends HelpSupportService {
    private http = inject(HttpClient);
    private config = inject(ConfigService);
    private baseUrl = this.config.getApiUrl() + '/communication/api/help-support';
    headers = {
        'Content-Type': ['application/json']
    };
    createTicket(req: HelpSupportModel, attachments: any[]): Observable<HelpSupportResponseModel> {
        req.uiVersion = moment(VERSION).format('YYYY-MM-DD HH:mm');
        let formData: FormData2 = new FormData2();
        formData.append('request', JSON.stringify(req));
        attachments.forEach(a => {
            formData.append('attachments', a);
        });

        let  headers = new HttpHeaders('multipart/form-data');
        headers = headers.append('app', 'DNSDome');
        headers = headers.append('brand', this.config?.host.brand);
        console.log(headers);
        return  this.http.post<HelpSupportResponseModel>(this.baseUrl, formData, {headers: headers}).pipe(
            map((data) => {
                return data;
            })
        );
    }
}