import { Component } from '@angular/core';
import { ToolsService } from 'src/app/core/services/toolsService';
import { ValidationService } from 'src/app/core/services/validation.service';
import { CategoryQuery } from 'src/app/core/models/CategoryQuery';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { RkNotificationService } from 'roksit-lib';

@Component({
    selector: 'app-tools',
    templateUrl: 'tools.component.html',
    styleUrls: ['tools.component.sass']
})
export class ToolsComponent {

    constructor(
        private toolsService: ToolsService,
        private formBuilder: UntypedFormBuilder,
        private notification: RkNotificationService
    ) {
        this.searchForm = this.formBuilder.group({
            'domain': ['', [Validators.required]]
        });
    }

    searchForm: UntypedFormGroup;
    isDomain: boolean;
    isDomainForReq: boolean;
    domain: string;
    domainForReq: string;
    categoryQuery: CategoryQuery;

    checkDomain(type: string) {
        if (type === 'category') {
            if (String(this.domain).toLowerCase().startsWith('http')) {
                this.domain = String(this.domain).toLowerCase().replace('http://', '').replace('https://', '');
            }
            this.isDomain = ValidationService.domainValidationWithoutTLD(this.domain);
        }
    }

    searchCategory() {
        if (this.isDomain) {
            this.toolsService.searchCategory(this.domain).subscribe(res => {
                this.categoryQuery = res;
                this.categoryQuery.domain = this.domain;
                this.domain = '';
            });
        }
    }


}
