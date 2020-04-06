import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {
  constructor(private translationService: TranslateService) { }
  translate(data: string): string {
    return this.translationService.instant(data);
  }

  translateCategoryName(data: string) {
    return this.translationService.instant(`CATEGORY.${data}`);
  }

  initLanguages(lang?: string) {
    // const languages = ['en', 'tr'];
    const languages = ['en'];
    languages.forEach(x => {
      this.translationService.addLangs([x]);
    });


    this.translationService.setDefaultLang(languages[0]);

    const browserLang = this.translationService.getBrowserLang();
    if (!lang) {
      this.translationService.use(languages.find(x => x == browserLang) ? browserLang : languages[0]);
    } else {
      const language = languages.find(x => x == lang);
      if (language) {
        this.translationService.use(language);
      } else { this.translationService.use(languages[0]); }
    }
  }

  use(lang: string): any {
    this.translationService.use(lang);
  }
  getCurrentLang(): any {
    return this.translationService.currentLang;
  }
  setDefaultLang(lang: string): any {
    this.translationService.setDefaultLang(lang);
  }
}
