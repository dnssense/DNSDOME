import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/core/services/config.service';

@Component({
    selector: 'app-help',
    templateUrl: 'help.component.html',
    styleUrls: ['help.component.sass']
})
export class HelpComponent {

    docUrl: string;
    siteUrl: string;
    brand: string;
    constructor(private config: ConfigService) {
        
        this.docUrl = this.config.host.docUrl;
        this.siteUrl = this.config.host.portal;
        this.brand = this.config.host.brand;
    }

}
