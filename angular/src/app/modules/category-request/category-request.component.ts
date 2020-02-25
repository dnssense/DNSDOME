import { Component, OnInit } from '@angular/core';
import { ValidationService } from 'src/app/core/services/validation.service';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';

@Component({
    selector: 'app-category-request',
    templateUrl: 'category-request.component.html'
})

export class CategoryRequestComponent implements OnInit {

    constructor() { }

    domain: string;
    category: RkSelectModel = {} as RkSelectModel;
    commment: string;

    ngOnInit() { }

    get getIsValidForm() {
        return ValidationService.isDomainValid(this.domain) && this.category.value && this.commment.trim().length > 0;
    }

}
