import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {StaticService} from './staticService';
import {CategoryV2} from '../models/CategoryV2';
import {CategoryService, CategoryUI} from 'roksit-lib';
import {map, shareReplay, tap} from 'rxjs/operators';

export function mapCategoryToDom(json: CategoryV2): CategoryUI {
    return {
        id: json.id,
        type: json.type,
        name: json.name,
        isVisible: json.isVisible > 0 ? 1 : 0,
        group: json.group,
        select: false
    };
}

@Injectable({
    providedIn: 'root',
})
export class CacheableCategoryServiceImpl extends CategoryService {
    private cache$: Observable<CategoryV2[]>;
    private cacheTime = 5 * 60 * 1000;
    private cacheCreationTime: number;
    constructor(private staticService: StaticService) {
        super();
    }
    getCategories(clearCache?: boolean): Observable<CategoryUI[]> {
            return this.getRawServiceData(clearCache).pipe(
                map(data => {
                    const categories = [];
                    data?.forEach(cat => {
                        categories.push(mapCategoryToDom(cat));
                    });
                    return categories;
                })
            );
    }
    getRawServiceData = (clearCache?: boolean): Observable<CategoryV2[]> => {
        const currentTime = new Date().getTime();
        if (clearCache || !this.cache$ || currentTime - this.cacheTime > this.cacheCreationTime) {
            this.cache$ = this.staticService.getCategoryList().pipe(
                tap(() => this.cacheCreationTime = new Date().getTime()),
                shareReplay(1, this.cacheTime)
            );
        }
        return this.cache$;
    }
}
