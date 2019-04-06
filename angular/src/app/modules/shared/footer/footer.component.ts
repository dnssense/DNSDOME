import { Component } from '@angular/core';
import { ConfigService, ConfigHost } from 'src/app/core/services/config.service';

@Component({
    selector: 'app-footer-cmp',
    templateUrl: 'footer.component.html'
})

export class FooterComponent {
    test: Date = new Date();

     host:ConfigHost;
    /**
     *
     */
    constructor(private configService:ConfigService) {

       this.host=this.configService.host;


    }
}
