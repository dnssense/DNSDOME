import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ToolsService } from 'src/app/core/services/ToolsService';
import { ValidationService } from 'src/app/core/services/validation.service';
import { CategoryQuery } from 'src/app/core/models/CategoryQuery';
import { map } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/core/services/authentication.service';


@Component({
    selector: 'app-tools',
    templateUrl: 'tools.component.html',
    styleUrls: ['tools.component.sass']
})
export class ToolsComponent {

    searchForm: FormGroup;
    isDomain: boolean;
    domain: string;
    categoryQuery: CategoryQuery;
    constructor(private toolsService: ToolsService, private formBuilder: FormBuilder, private authService: AuthenticationService) {

        this.authService.canActivate(document.location.href.substring(document.location.href.lastIndexOf("/") + 1));

        this.searchForm = this.formBuilder.group({
            "domain": ["", [Validators.required]]
        });
    }

    checkDomain() {
        if (String(this.domain).toLowerCase().startsWith('http')) {
            this.domain = String(this.domain).toLowerCase().replace('http://', '').replace('https://', '');
        }
        const result = ValidationService.domainValidation({ value: this.domain });
        if (result == true) {
            this.isDomain = true;
        } else {
            this.isDomain = false;
        }
    }

    searchCategory() {

        if (this.isDomain) {
            this.toolsService.searchCategory(this.domain).subscribe(res => {
                this.categoryQuery = res;
                this.domain = '';
            });
        }

    }


}
