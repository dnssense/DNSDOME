import {inject, Injectable} from '@angular/core';
import {CacheableApplicationServiceImpl} from './cacheable-application.service';
import {CacheableCategoryServiceImpl} from './cacheable-categories.service';
import {ApplicationService, CategoryService, ProductLicenceService} from 'roksit-lib';
import {ProductLicenceServiceImpl} from "./product-licence.service";

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  productLicenceService = inject(ProductLicenceService);
  cachableApplicationService = inject(ApplicationService);
  cachableCategoryService = inject(CategoryService);
  constructor() { }

  clear(): any {
    (this.productLicenceService as ProductLicenceServiceImpl)?.clearCache();
    (this.cachableApplicationService as CacheableApplicationServiceImpl)?.clearCache();
    (this.cachableCategoryService as CacheableCategoryServiceImpl)?.clearCache();
  }
}
