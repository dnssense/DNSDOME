import { Pipe, PipeTransform } from '@angular/core';


// We use the @Pipe decorator to register the name of the pipe
@Pipe({
    name: 'customDecimalPipe'
})
export class CustomDecimalPipe implements PipeTransform {

    transform(value: number, args?: any[]) {
        if (value && !isNaN(value)) {

            let temp: string = '' + value;

            if (value > 1000000) {
                temp = (value / 1000000).toPrecision(3) + 'M';
            } else if (value > 1000) {
                temp = (value / 1000).toPrecision(3) + 'K';
            }
            return temp;
        }

        return;
    }

}
