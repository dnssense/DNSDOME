import {inject, Injectable} from '@angular/core';
import {StaticService} from './staticService';
import {ApplicationService, ApplicationUI, ApplicationDomainUI} from 'roksit-lib';
import {map, shareReplay, tap} from 'rxjs/operators';
import {ApplicationV2, Domain} from '../models/ApplicationV2';
import {mapCategoryToDom} from './cacheable-categories.service';
import {Observable} from 'rxjs';

function mapDomainToDom(json: Domain):  ApplicationDomainUI {
    return {
        name: json.name
    };
}

function mapApplicationsToDom(json: ApplicationV2):  ApplicationUI {
    return {
        id: json.id,
        name: json.name,
        type: json.type,
        isVisible: json.isVisible,
        domains: json?.domains?.map(d => mapDomainToDom(d)),
        categories: json?.categories?.map(d => mapCategoryToDom(d)),
        select: false
    };
}

@Injectable({
    providedIn: 'root'
})
export class CacheableApplicationServiceImpl extends ApplicationService {
    private cache$: Observable<ApplicationV2[]>;
    private cacheTime = 5 * 60 * 1000;
    private cacheCreationTime: number;
    constructor(private staticService: StaticService) {
        super();
    }
    getApplications(clearCache?: boolean): Observable<ApplicationUI[]> {
            return this.getRawServiceData(clearCache).pipe(
                map(data => {
                    const applications = [];
                    data?.forEach(cat => {
                        applications.push(mapApplicationsToDom(cat));
                    });
                    return applications;
                })
            );
    }
    getRawServiceData = (clearCache?: boolean): Observable<ApplicationV2[]> => {
        const currentTime = new Date().getTime();
        if (clearCache || !this.cache$ || currentTime - this.cacheTime > this.cacheCreationTime) {
            this.cache$ = this.staticService.getApplicationList().pipe(
                tap(() => this.cacheCreationTime = new Date().getTime()),
                shareReplay(1, this.cacheTime)
            );
        }
        return this.cache$;
    }
}
