import { Injectable, Pipe, PipeTransform } from "@angular/core";
import * as countryList from "../../../core/models/Countries";

@Pipe({
    name: 'countryPipe'
})
@Injectable()
export class CountryPipe implements PipeTransform {
    public countries = countryList.countries;

    transform(key: string): any {
        if (key != '') {
            let country = this.countries.filter(function (value) {
                return value.code == key;
            });
            if (country != null && country.length > 0) {
                return country[0].name;
            }
        }
        return "";
    }
}
