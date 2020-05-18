import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';

let NOTIFICATION_URL = '';

export class NotificationRequest {
    page = 0;
    pageSize = 10;
    date: Date = new Date('1970/01/01 00:00:00');
}

export interface Notification {
    id: number;
    message: string;
    status: 0 | 1; // 0 not readed, 1 readed
}

@Injectable({ providedIn: 'root' })
export class NotificationApiService {

    constructor(
        private httpClient: HttpClient,
        private configService: ConfigService
    ) {
        NOTIFICATION_URL = configService.getApiUrl() + '/notification';
    }

    private options: { headers: HttpHeaders } = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    getNotifications(request: NotificationRequest): Observable<Notification[]> {
        return this.httpClient.get<Notification[]>(`${NOTIFICATION_URL}?page=${request.page}&pageSize=${request.pageSize}&date=${request.date.toISOString()}`, this.options).map(result => result);
    }

    updateNotification(request: Notification) {
        return this.httpClient.put(NOTIFICATION_URL, request, this.options);
    }
}
