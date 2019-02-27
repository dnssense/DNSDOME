import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { TimeProfileViewModel } from 'src/app/core/models/TimeProfileViewModel';
import { DayProfileGroup } from 'src/app/core/models/DayProfileGroup';
import { AlertService } from 'src/app/core/services/alert.service';
import { DayProfile } from 'src/app/core/models/DayProfile';
import { AgentService } from 'src/app/core/services/agent.service';
import { forEach } from '@angular/router/src/utils/collection';

declare var $: any;

@Component({
  selector: 'app-time-profile',
  templateUrl: './time-profile.component.html',
  styleUrls: ['./time-profile.component.css']
})
export class TimeProfileComponent implements OnInit {

  @Input() public profilePanelId: string;
  public _selectedProfile: DayProfileGroup;
  @Input() set selectedProfile(value: DayProfileGroup) {
    this._selectedProfile = value;
    this.initializeDayProfiles();
  }

  get selectedProfile(): DayProfileGroup {
    return this._selectedProfile;
  }
  dayProfiles: TimeProfileViewModel[];
  constructor(private alertService: AlertService, private agentService: AgentService) {

  }

  ngOnInit() {
    this.initializeDayProfiles();
  }

  initializeDayProfiles() {
    this.dayProfiles = [
      { id: 0, startDate: null, endDate: null, status: 0 },
      { id: 1, startDate: null, endDate: null, status: 0 },
      { id: 2, startDate: null, endDate: null, status: 0 },
      { id: 3, startDate: null, endDate: null, status: 0 },
      { id: 4, startDate: null, endDate: null, status: 0 },
      { id: 5, startDate: null, endDate: null, status: 0 },
      { id: 6, startDate: null, endDate: null, status: 0 }
    ];
    debugger;
    if (this.selectedProfile && this.selectedProfile.id) {

      this.dayProfiles.forEach(dp => {
        if (this.selectedProfile.dayProfiles.find(p => p.id == dp.id)) {
          dp.status = 1;
          dp.startDate = new Date(this.selectedProfile.dayProfiles.find(p => p.id == dp.id).startDate).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
          dp.endDate = new Date(this.selectedProfile.dayProfiles.find(p => p.id == dp.id).endDate).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
        }
      })
    }
  }


  saveTimeProfile() {

    this.selectedProfile.dayProfiles = [];
    debugger;

    for (let i = 0; i < this.dayProfiles.length; i++) {
      debugger;
      if (this.dayProfiles[i].startDate && this.dayProfiles[i].endDate) {
        let dp = this.dayProfiles[i];
        if ((dp.status == 2 || dp.status == 1) && dp.startDate && dp.endDate) {

          let sdh = dp.startDate.split(':')[0];
          let sdm = dp.startDate.split(':')[1];
          let sd = new Date();
          sd.setHours(Number(sdh));
          sd.setMinutes(Number(sdm));

          let edh = dp.endDate.split(':')[0];
          let edm = dp.endDate.split(':')[1];
          let ed = new Date();
          ed.setHours(Number(edh));
          ed.setMinutes(Number(edm));

          if (this.selectedProfile.dayProfiles.find(p => p.id == dp.id)) {
            this.selectedProfile.dayProfiles.find(p => p.id == dp.id).startDate = sd.getTime();
            this.selectedProfile.dayProfiles.find(p => p.id == dp.id).endDate = ed.getTime();
          } else {
            let item: DayProfile = new DayProfile();
            item.id = dp.id;
            item.startDate = sd.getTime();
            item.endDate = ed.getTime();
            this.selectedProfile.dayProfiles.push(item);
          }
        } else {
          this.selectedProfile.dayProfiles.splice(this.selectedProfile.dayProfiles.findIndex(p => p.id == dp.id), 1);
        }
      }
    }

    console.log(JSON.stringify(this.selectedProfile, null, " "));

    this.agentService.saveProfile(this.selectedProfile).subscribe(data => {
      this.selectedProfile = data;
      this.closeProfilePanel();
      this.alertService.alertSuccessMessage("Operation Successful", "Profile Changes committed");
    });

  }

  closeProfilePanel() {
    $('#' + this.profilePanelId).slideUp(300);
  }

  valueChanged(i: number) {
    this.dayProfiles[i].status = 2;
  }

  deleteDay(pId: number) {
    if (this.dayProfiles[pId].startDate || this.dayProfiles[pId].endDate) {
      this.dayProfiles[pId].startDate = null;
      this.dayProfiles[pId].endDate = null;
      this.dayProfiles[pId].status = 2;
    }
  }


}
