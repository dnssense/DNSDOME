import { HttpClient } from '@angular/common/http';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';

declare const VERSION: string;
export function translateHttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: '/assets/i18n/roksit-lib/', suffix: `.json?version=${VERSION}` }, // first add lib translation, then if you want you can override any translation
    { prefix: '/assets/i18n/', suffix: `.json?version=${VERSION}` },
  ]);
}
