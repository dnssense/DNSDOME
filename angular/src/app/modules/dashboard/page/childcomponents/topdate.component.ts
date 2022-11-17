import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {RkDateButton} from '../dashboard.component';
import {RkDateConfig, RkDateTime} from 'roksit-lib/lib/modules/rk-date/rk-date.component';
import {TranslatorService} from 'src/app/core/services/translator.service';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard-topdate',
  templateUrl: 'topdate.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class TopdateComponent implements OnInit {
  constructor(private translatorService: TranslatorService) {
  }
  @ViewChild('date') date;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() public onDateChanged = new EventEmitter<{startDate: Date, endDate: Date, duration: number, name: string}>();
  private now: Date = new Date();
  startDate: Date = new Date();
  endDate: Date = new Date();
  dateText: string;
  dateButtons: RkDateButton[];

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

    times: RkDateTime[] = [
                        { value: 60 * 1, displayText: this.translatorService.translateWithArgs('Date.LastXHour', {X: '1'}) },
                        { value: 60 * 3, displayText: this.translatorService.translateWithArgs('Date.LastXHour', {X: '3'}) },
                        { value: 60 * 6, displayText: this.translatorService.translateWithArgs('Date.LastXHour', {X: '6'}) },
                        { value: 60 * 12, displayText: this.translatorService.translateWithArgs('Date.LastXHour', {X: '12'}) },
                        { value: 60 * 24, displayText: this.translatorService.translateWithArgs('Date.LastXDay', {X: '1'}) },
                        { value: 60 * 24 * 2, displayText: this.translatorService.translateWithArgs('Date.LastXDay', {X: '2'}) },
                        { value: 60 * 24 * 3, displayText: this.translatorService.translateWithArgs('Date.LastXDay', {X: '3'}) },
                        { value: 60 * 24 * 7, displayText: this.translatorService.translateWithArgs('Date.LastXWeek', {X: '1'}) },
                        { value: 60 * 24 * 14, displayText: this.translatorService.translateWithArgs('Date.LastXWeek', {X: '2'}) },
                        { value: 60 * 24 * 30, displayText: this.translatorService.translate('Date.LastMonth') },
                        { value: 60 * 24 * 30 * 2, displayText: this.translatorService.translateWithArgs('Date.LastXMonth', {X: '2'}) }
                        ];

  ngOnInit() {
    this.initDateDisplay();
    this.setDateButtons();
  }

  // region initialization
  initDateDisplay() {
    this.startDate.setDate(this.now.getDate() - 7);
    this.endDate = new Date();
    this.setDateTextByDates();
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
        endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours()),
        displayText: this.translatorService.translate('Date.LastYear'),
        active: false,
        isToday: false
      },
      {
        startDate: new Date(this.now.getFullYear(), this.now.getMonth() - 3, this.now.getDate()),
        endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours()),
        displayText: this.translatorService.translate('Date.Last3Month'),
        active: false,
        isToday: false
      },
      {
        startDate: new Date(this.now.getFullYear(), this.now.getMonth() - 1, this.now.getDate()),
        endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours()),
        displayText: this.translatorService.translate('Date.LastMonth'),
        active: false,
        isToday: false
      },
      {
        startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() - 7),
        endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours()),
        displayText: this.translatorService.translate('Date.LastWeek'),
        active: true,
        isToday: false
      },
      {
        startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), 0),
        endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours(), this.now.getMinutes()),
        displayText: `${this.translatorService.translate('Date.Today')} (00:00-${this.now.getHours()}:${(this.now.getMinutes() < 10 ? '0' : '') + this.now.getMinutes() })`,
        active: false,
        isToday: true
      }

    ];
  }
  // endregion

  // region direct ui methodes
  setDateByDateButton(it: RkDateButton) {
    if (it.displayText === 'Live Report') {
      it.startDate = new Date();
      it.startDate.setHours(it.startDate.getHours() - 1);
      it.endDate = new Date();
    }
    this.dateChanged({startDate: it.startDate, endDate: it.endDate, nameDis: it.displayText}, false, it.isToday);
    it.active = true;

    const startDate = moment(this.startDate);
    const endDate = moment(this.endDate);
    const diff = endDate.diff(startDate, 'minutes');
    const found = this.times.find(x => x.value === diff);
    if (found) {
      this.date.selectTime(found);
    } else {
      this.date.selectTime({value: diff }  as RkDateTime);
    }

  }
  // endregion

  // region indirect ui methode
  dateChanged(ev: { startDate: Date, endDate: Date, nameDis: string }, isDateComponent = false, isToday = false) {
    this.dateButtons.forEach(elem => elem.active = false);
    this.startDate = ev.startDate;
    this.endDate = ev.endDate;
    if (moment(this.startDate) > moment(this.endDate)) {
      this.endDate = ev.startDate;
      this.startDate = ev.endDate;
      this.date.startDate = this.startDate;
      this.date.endDate = this.endDate;
    }
    this.setDateTextByDates();
    let duration = 0;
    if (!(isDateComponent || isToday)) {
      const diff = this.calculateDateDiff();
      duration = diff * 24;
    }

    this.onDateChanged.emit({startDate: this.startDate, endDate: this.endDate, duration: duration, name: ev.nameDis});
  }
  setDateComponent(selected: { startDate: Date, endDate: Date, duration: number }) {
    this.startDate = new Date(selected.startDate);
    this.endDate = new Date(selected.endDate);
    this.dateButtons.forEach(elem => elem.active = false);
    this.setDateTextByDates();
  }
  // region utils function
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

  calculateDateDiff(): number {
    const startDate = moment([this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate()]);
    const endDate = moment([this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate()]);

    const diff = endDate.diff(startDate, 'days');
    return diff;
  }
  // endregion
}
