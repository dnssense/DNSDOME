import { Component, OnInit } from '@angular/core';
import { ConfigService, ConfigHost } from 'src/app/core/services/config.service';

@Component({
    selector: 'app-help',
    templateUrl: 'help.component.html',
    styleUrls: ['help.component.sass']
})
export class HelpComponent {

    host: ConfigHost
    constructor(private config: ConfigService) {

        this.host = this.config.host

        if (this.host.brand=='CyberCyte') {
            window.open(this.host.onlineHelpUrl, "_blank");
        }
    }

}
