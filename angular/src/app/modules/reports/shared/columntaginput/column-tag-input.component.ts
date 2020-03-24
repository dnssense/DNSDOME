import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { Category } from 'src/app/core/models/Category';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import * as countryList from 'src/app/core/models/Countries';
import { Location } from 'src/app/core/models/Location';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { WApplication } from 'src/app/core/models/WApplication';
import { FastReportService } from 'src/app/core/services/fastReportService';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { ReportService } from 'src/app/core/services/reportService';

declare var jQuery: any;

@Component({
  selector: 'app-column-tag-input',
  templateUrl: './column-tag-input.component.html',
  styleUrls: ['./column-tag-input.component.css']
})
export class ColumnTagInputComponent implements OnInit {
  current: ColumnTagInput;
  currentColumn: string;
  currentOperator: string;
  currentInput: string;
  currentinputValue: string;

  @Input() tags: Array<ColumnTagInput>;
  @Input() public columns: LogColumn[];
  @Input() public zoneName: ColumnTagInputComponent;
  @Input() public mainApplications: WApplication[];
  @Input() public applicationsMap = new Map<number, WApplication[]>();
  @Input() public mainCategories: Category[];
  @Input() public agents: Location[];

  public inputCollapsed = true;
  public inputSelected = false;

  @ViewChild('inputElement') inputElement: ElementRef;
  @ViewChild('mainInputElement') mainInputElement: ElementRef;
  @ViewChild('tagInput') tagInput: ElementRef;
  @ViewChild('select') select: ElementRef;

  public select2: any = null;

  public countries: any = [];

  private tableColumnsubscription: Subscription;

  // deleted constructer parameters
  // public roksitTranslateService: RoksitTranslateService,
  public constructor(private renderer: Renderer2,
    private fastReportService: FastReportService,
    private reportService: ReportService,
    private notificationService: NotificationService) {
    if (!this.tags) {
      this.tags = [];
      this.current = new ColumnTagInput('domain', '=', '');
      this.currentOperator = '=';
      this.currentColumn = 'domain';
    }

    this.tableColumnsubscription = this.reportService.initTableColumns().subscribe(
      (res: LogColumn[]) => {
        this.columns = res;
      }
    );
  }

  ngOnInit() {
    this.countries = countryList.countries;
  }

  public closeTagInputDiv($event) {
    this.inputCollapsed = true;
    this.inputSelected = false;
    this.current = null;
    this.currentinputValue = '';
  }

  public showHideInputDiv($event) {
    if (
      $event.target.tagName == 'INPUT' ||
      $event.target.tagName == 'SELECT' ||
      $event.target.tagName == 'SPAN'
    ) {
      return;
    }

    if (!this.inputCollapsed) {
      this.current = null;
      this.currentinputValue = '';
      this.inputCollapsed = true;
      this.inputSelected = false;
    } else {
      this.showInputControl($event);
    }
  }

  public showInputControl($event) {
    $event.stopPropagation();

    this.inputCollapsed = false;
    this.inputSelected = false;
    this.current = new ColumnTagInput('domain', '=', '');
    this.currentColumn = this.current.field;
    this.currentOperator = this.current.operator;
    this.currentInput = this.current.value;
    this.currentinputValue =
      '' + this.currentColumn + this.currentOperator + this.currentInput;
    this.tagInput.nativeElement.focus();

    this.tagInput.nativeElement.focus();

    this.positionInputElement(this.tagInput.nativeElement);
  }

  public inputsChanged($event, select: boolean) {
    $event.stopPropagation();

    if ($event.keyCode === 13) {
      this.addTag(event);
      return;
    }
    if (select) {
      this.currentInput = '';
    }

    if (this.inputSelected) {
      this.current.value = this.currentInput;
      this.current.operator = this.currentOperator;
      this.current.field = this.currentColumn;
      this.currentinputValue = '';
    } else {
      this.currentinputValue =
        '' + this.currentColumn + this.currentOperator + this.currentInput;
    }

    if (
      this.currentColumn == 'applicationName' ||
      this.currentColumn == 'category' ||
      this.currentColumn == 'agentAlias' ||
      this.currentColumn == 'sourceIpCountryCode' ||
      this.currentColumn == 'destinationIpCountryCode'
    ) {
      this.initSelect();
    }
  }

  keyUp(event: KeyboardEvent) {
    if (this.currentInput == '') {
      return;
    }
    if (event.keyCode === 32) {
      this.tags.push(this.current);
      this.current = new ColumnTagInput(this.columns[0].name, '=', '');
    } else if (event.keyCode === 8 && this.current.value.length == 0) {
      this.current = this.tags.pop();
    }

    this.positionInputElement(this.tagInput.nativeElement);
  }

  blur($event) {
    $event.stopPropagation();
  }

  public inputClicked($event) {
    $event.stopPropagation();
  }

  public selectInputTag($event, value: ColumnTagInput) {
    this.inputSelected = true;
    this.currentinputValue = '';
    this.current = value;
    this.currentColumn = value.field;
    this.currentOperator = value.operator;
    this.currentInput = value.value;

    this.inputCollapsed = false;
    this.positionInputElement($event.target);
    this.tagInput.nativeElement.focus();
    this.tagInput.nativeElement.focus();
  }

  public addTag($event) {
    this.current.value = this.currentInput;
    this.current.operator = this.currentOperator;
    this.current.field = this.currentColumn;

    if (
      this.currentColumn == 'sourceIp' ||
      this.currentColumn == 'destinationIp'
    ) {
      if (!this.checkIp(this.currentInput)) {
        return;
      }
    }
    $event.stopPropagation();
    if (this.currentInput == '') {
      this.tagInput.nativeElement.focus();
      return;
    }

    let addStatus = true;
    for (const op of this.tags) {
      if (
        op.field == this.current.field &&
        op.operator == this.current.operator &&
        op.value == this.current.value
      ) {
        if (op.id != this.current.id) {
          return;
        }
        op.field = this.currentColumn;
        op.operator = this.currentOperator;
        op.value = this.currentInput;
        addStatus = false;
      }
    }

    if (addStatus) {
      this.tags.push(
        new ColumnTagInput(
          this.currentColumn,
          this.currentOperator,
          this.currentInput
        )
      );
    }

    this.current = new ColumnTagInput('domain', '=', '');
    this.currentColumn = this.current.field;
    this.currentOperator = this.current.operator;
    this.currentInput = this.current.value;
    this.currentinputValue = '';
    this.inputCollapsed = true;
    this.inputSelected = false;
  }

  public removeTag(tag) {
    for (let t = 0; t < this.tags.length; t++) {
      const ta = this.tags[t];
      if (
        ta.value == tag.value &&
        ta.field == tag.field &&
        ta.operator == tag.operator
      ) {
        this.tags.splice(t, 1);
        break;
      }
    }

    if (!this.inputCollapsed) {
      this.positionInputElement(this.tagInput.nativeElement);
    }
    this.inputCollapsed = true;
    this.inputSelected = false;
    this.currentinputValue = '';


  }

  public positionInputElement(sourcePosition) {
    setTimeout(() => {
      const position = jQuery(sourcePosition).position();
      jQuery(this.inputElement.nativeElement).css({
        top: position.top + 21,
        left: position.left - 1,
        position: 'absolute'
      });
    }, 50);
  }

  public dropSuccess(event: any) {
    this.zoneName.tags.push(event.dragData);
  }

  public dragSuccess(event: any) {
    const index = this.zoneName.tags.indexOf(event.dragData);
    this.zoneName.tags.splice(index, 1);
  }

  public initSelect() {
    if (this.select2 != null) {
      this.select2.select2('destroy');
    }
    this.select2 = jQuery(this.select.nativeElement)
      .select2({})
      .on('select2:select', e => {
        this.currentInput = e.target.value;
      });
  }

  public checkIp(ipForCheck: string) {
    const res = ValidationService.isValidIpWithLocals(ipForCheck);
    if (!res) {
      this.notificationService.warning('Invalid IP');
    }
    return res;
  }

  public updateColumns(cols: LogColumn[]) {
    this.columns = cols;
  }
}
