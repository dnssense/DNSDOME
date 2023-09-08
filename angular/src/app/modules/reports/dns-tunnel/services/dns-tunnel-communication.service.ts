import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs';
import {DnsTunnelSuspiciousEventsItem} from '../../../../core/services/dns-tunnel.service';

@Injectable({
    providedIn: 'root'
})
export class DnsTunnelCommunicationService {
    private eventsItem$ = new BehaviorSubject<DnsTunnelSuspiciousEventsItem>(null);
    selectedEventItem$ = this.eventsItem$.asObservable();
    showEventDetail(item: DnsTunnelSuspiciousEventsItem) {
        this.eventsItem$.next(item);
    }
    getDateInterval(date: Date, unit: 'days' | 'hours', intervalMinute: number): [Date, Date] {
        const startDate = moment(date).add(1, unit).startOf(unit).toDate();
        const endDate = moment(startDate).add(intervalMinute, 'minutes').subtract(1, 'milliseconds').toDate();
        return [startDate, endDate];
    }
}
