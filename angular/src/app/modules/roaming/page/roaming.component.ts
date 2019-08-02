import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

@Component({
    selector: 'app-roaming',
    templateUrl: 'roaming.component.html',
    styleUrls: ['roaming.component.sass']
})
export class RoamingComponent implements OnInit {


    constructor(private authService: AuthenticationService) {

        this.authService.canActivate(document.location.href.substring(document.location.href.lastIndexOf("/") + 1));

    }


    ngOnInit() {
    }



}
