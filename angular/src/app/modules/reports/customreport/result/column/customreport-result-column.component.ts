import { OnInit, OnDestroy, Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { CountryPipe } from 'src/app/modules/shared/pipes/CountryPipe';
import { MacAddressFormatterPipe } from 'src/app/modules/shared/pipes/MacAddressFormatterPipe';

@Component({
  selector: 'app-customreport-result-column',
  templateUrl: 'customreport-result-column.component.html',
  styleUrls: ['customreport-result-column.component.sass'],
  providers: [CountryPipe]
})
export class CustomReportResultColumnComponent implements OnInit {
  elementRef: ElementRef;
  public data: string = "";

  @Input() public value;
  @Input() public columnName;
  @Output() public addColumnValueEmitter = new EventEmitter();

  constructor(private countryPipe: CountryPipe) { }

  ngOnInit(): void {
    if (this.columnName != 'sourceIpCountryCode' && this.columnName != 'destinationIpCountryCode'
      && this.columnName != 'action' && this.columnName != 'clientMacAddress') {
      this.data = this.value;
    } else if (this.columnName == 'sourceIpCountryCode' || this.columnName == 'destinationIpCountryCode') {
      if (this.value != null) {
        let imageName = this.value.toLowerCase() == "local" ? "TR" : this.value.toUpperCase();
        if (this.value != 'Others') {
          this.data = "<img src='/assets/img/flags/" + imageName + ".png' class='flagImage' alt='" + this.value + "' title='" + this.value + "'/>" +
            "&nbsp;" + (this.value == "00" ? "Local Domain" : this.countryPipe.transform(this.value));
        } else {
          this.data = this.value;
        }
      } else {
        this.data = this.value;
      }
    } else if (this.columnName == 'action') {
      this.data = this.value == true ? "Allow" : "Block";
    } else if (this.columnName == 'clientMacAddress') {
      this.data = this.value == null ? null : this.value.match(/.{1,2}/g).join(':');
    }
  }

  public addColumnValueIntoSelectedValues(column: string, value: any) {
    if (value == 'Others') {
      return;
    }
    this.addColumnValueEmitter.emit({ column: column, data: value }); // How to pass the params event and ui...?
  }

}
