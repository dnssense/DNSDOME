import {Component, EventEmitter, OnInit, Output, ViewChild} from "@angular/core";
import {RkDateButton} from "../dashboard.component";
import {RkDateConfig} from "roksit-lib/lib/modules/rk-date/rk-date.component";
import {TranslatorService} from 'src/app/core/services/translator.service';
import * as moment from "moment";

@Component({
  selector: 'app-dashboard-topdate',
  templateUrl: 'topdate.component.html',
  styleUrls:['../dashboard.component.scss']
})
export class TopdateComponent implements OnInit {
  constructor(private translatorService: TranslatorService) {
  }
  @ViewChild('date') date;
  @Output() public onDateChanged = new EventEmitter<{startDate:Date,endDate:Date, name: string}>()
  private now: Date = new Date();
  startDate: Date = new Date();
  endDate: Date = new Date();
  dateText: string;
  dateButtons: RkDateButton[]

  dateConfig: RkDateConfig = {
    startHourText: this.translatorService.translate('Date.StartHour'),
    endHourText: this.translatorService.translate('Date.EndHour'),
    applyText: this.translatorService.translate('Date.Apply'),
    cancelText: this.translatorService.translate('Date.Cancel'),
    customText: this.translatorService.translate('Date.Custom'),
    selectDateText: this.translatorService.translate('Date.SelectDate'),
    placeholder: this.translatorService.translate('Date.Placeholder'),
    startDate: this.translatorService.translate('Date.StartDate'),
    endDate: this.translatorService.translate('Date.EndDate'),
  };

  ngOnInit() {
    this.initDateDisplay()
    this.setDateButtons()
  }

  //region initialization
  initDateDisplay() {
    this.startDate = new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours() - 1, this.now.getMinutes())
    this.endDate = new Date();
    this.setDateTextByDates()
  }

  setDateTextByDates() {
    const startDate = moment(this.startDate);
    const endDate = moment(this.endDate);

    const minutes = endDate.diff(startDate, 'minutes');

    this.dateText = this.convertTimeString(minutes);
  }

  setDateButtons() {
    this.dateButtons = [
      {
        startDate: new Date(this.now.getFullYear() - 1, this.now.getMonth(), this.now.getDate()),
        endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
        displayText: 'Last Year',
        active: false,
        isToday: false
      },
      {
        startDate: new Date(this.now.getFullYear(), this.now.getMonth() - 3, this.now.getDate()),
        endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
        displayText: 'Last 3 Month',
        active: false,
        isToday: false
      },
      {
        startDate: new Date(this.now.getFullYear(), this.now.getMonth() - 1, this.now.getDate()),
        endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
        displayText: 'Last Month',
        active: false,
        isToday: false
      },
      {
        startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() - 7),
        endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
        displayText: 'Last Week',
        active: false,
        isToday: false
      },
      {
        startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours() - 1, this.now.getMinutes()),
        endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours(), this.now.getMinutes()),
        displayText: 'Last Hour',
        active: true,
        isToday: false
      },
      {
        startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), 0),
        endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours(), this.now.getMinutes()),
        displayText: `Today (00:00-${this.now.getHours()}:${this.now.getMinutes()})`,
        active: false,
        isToday: true
      }

    ];
  }
  //endregion

  //region direct ui methodes
  setDateByDateButton(it: RkDateButton) {
    if (it.displayText == 'Last Hour') {
      it.startDate = new Date()
      it.startDate.setHours(it.startDate.getHours() - 1)
      it.endDate = new Date()
    }
    this.dateChanged({startDate:it.startDate, endDate: it.endDate, nameDis:it.displayText}, false, it.isToday)
    it.active = true
  }
  //endregion

  //region indirect ui methode
  dateChanged(ev: { startDate: Date, endDate: Date, nameDis: string }, isDateComponent = false, isToday = false) {
    this.dateButtons.forEach(elem => elem.active = false)
    this.startDate = ev.startDate;
    this.endDate = ev.endDate;
    if (moment(this.startDate) > moment(this.endDate)) {
      this.endDate = ev.startDate
      this.startDate = ev.endDate
      this.date.startDate = this.startDate;
      this.date.endDate = this.endDate;
    }
    this.setDateTextByDates()
    this.onDateChanged.emit({startDate: this.startDate, endDate: this.endDate, name: ev.nameDis})
  }

  //region utils function
  convertTimeString(num: number) {
    const month = Math.floor(num / (1440 * 30));
    const w = Math.floor((num - (month * 1440 * 30)) / (1440 * 7));
    const d = Math.floor((num - (w * 1440 * 7)) / 1440); // 60*24
    const h = Math.floor((num - (d * 1440)) / 60);
    const m = Math.round(num % 60);

    let text = '';

    if (month > 0) {
      text = `${month} ${this.translatorService.translate('Month')}`;

      if (w > 0) {
        text += ` ${w} ${this.translatorService.translate('Week')}`;
      }
    } else if (w > 0) {
      text = `${w} ${this.translatorService.translate('Week')}`;

      if (d > 0) {
        text += ` ${d} ${this.translatorService.translate('Day')}`;
      }
    } else if (d > 0) {
      text = `${d} ${this.translatorService.translate('Day')}`;

      if (h > 0) {
        text += ` ${h} ${this.translatorService.translate('Hour')}`;
      }
    } else if (h > 0) {
      text = `${h} ${this.translatorService.translate('Hour')}`;

      if (m > 0) {
        text += ` ${m} ${this.translatorService.translate('Minute')}`;
      }
    } else {
      text = `${m} ${this.translatorService.translate('Minute')}`;
    }

    return text;
  }
  //endregion
}
