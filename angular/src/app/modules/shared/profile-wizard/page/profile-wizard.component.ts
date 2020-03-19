import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NotificationService } from 'src/app/core/services/notification.service';
import { StaticService } from 'src/app/core/services/StaticService';
import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { Agent } from 'src/app/core/models/Agent';
import { ApplicationV2 } from 'src/app/core/models/ApplicationV2';
import { SecurityProfile, BlackWhiteListProfile, SecurityProfileItem, ListItem } from 'src/app/core/models/SecurityProfile';
import { ValidationService } from 'src/app/core/services/validation.service';
import { AgentService } from 'src/app/core/services/agent.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { RoamingService } from 'src/app/core/services/roaming.service';
import { Box } from 'src/app/core/models/Box';
import { BoxService } from 'src/app/core/services/box.service';
import { DEVICE_GROUP } from 'src/app/core/Constants';
import { DeviceGroup, AgentInfo } from 'src/app/core/models/DeviceGroup';
import { BWListItem } from 'src/app/core/models/BWListItem';
import { StaticMessageService } from 'src/app/core/services/StaticMessageService';
import { TranslatorService } from 'src/app/core/services/translator.service';

declare var $: any;

// tslint:disable-next-line: class-name
export class categoryItem {
  constructor(public category: CategoryV2, public name: string, public isBlocked: boolean) { }
}

// tslint:disable-next-line: class-name
export class applicationItem {
  constructor(public application: ApplicationV2, public isBlocked: boolean) { }
}

export const ApplicationTypes = {
  REMOTE_ACCESS: 'REMOTE_ACCESS',
  ONLINE_VIDEO: 'ONLINE_VIDEO',
  INSTANT_MESSAGING: 'INSTANT_MESSAGING',
  SOCIAL: 'SOCIAL',
  CLEAR_ADS: 'CLEAR_ADS',
  HTTP: 'HTTP'
};


export const categoryMappings = {
  'variable': [
    'Unknown',
    'Undecided Not Safe',
    'Undecided Safe',
    'Domain Parking',
    'Newly Register',
    'Newly Up',
    'Dead Sites',
    // 'Firstly Seen' //burasi positive security model kapsaminda yonetiliyor
  ],
  'harmful': [
    'Illegal Drugs',
    'Adult',
    'Pornography',
    'Hate/Violance/illegal',
    'Gambling',
    'Games',
    'Swimsuits and Underwear',
    'Dating',
    'Alcohol'
  ],
  'safe': [
    'Cooking',
    'Online Video',
    'Sport',
    'Advertisements',
    'Shopping',
    'Software Downloads',
    'Reference',
    'Financial Services',
    'Health',
    'Society',
    'Webmail',
    'Vehicles',
    'Government and Organization',
    'Search Engines',
    'Online Storage',
    'Business Services',
    'Entertainment',
    'Tobacco',
    'Blogs',
    'Content Delivery Networks (CDN)',
    'Social Networks',
    'Real Estate',
    'Forums',
    'Arts and Culture',
    'Kids',
    'Job Search',
    'Clothing and Fashion',
    'Chats',
    'Education',
    'Technology and Computer',
    'Infrastructure Service',
    'Music',
    'Weapon and Military',
    'News',
    'Religion',
    'Vacation and Travel',
    'Local IP',
    'WhiteList'
  ],
  'malicious': [
    'Phishing',
    'Spam Sites',
    'Proxy',
    'Warez',
    'Hacking',
    'Potentially Dangerous',
    'Malware/Virus',
    'Dynamic DNS',
    'Botnet CC',
    'DGA Domain',
    'BlackList',
    'Malformed Query',
    'Bad-IP',
    'NX Domain'
  ]
};


@Component({
  selector: 'app-profile-wizard',
  templateUrl: './profile-wizard.component.html',
  styleUrls: ['./profile-wizard.component.sass']
})
export class ProfileWizardComponent {

  constructor(
    private notification: NotificationService,
    private alertService: AlertService,
    private staticService: StaticService,
    private agentService: AgentService,
    private roamingService: RoamingService,
    private boxService: BoxService,
    private staticMessageService: StaticMessageService,
    private translatorService: TranslatorService
  ) {
    this.getCategoriesAndApps();
  }

  isSafeSearchEnabled: boolean;
  isYoutubeStrictModeEnabled: boolean;
  profileName: string;
  isNewBlackListItem = false;
  isNewWhiteListItem = false;
  blackListItem: ListItem = new ListItem();
  whiteListItem: ListItem = new ListItem();
  categoryList: categoryItem[] = [];
  applicationList: applicationItem[] = [];
  activeNumber = 1;

  securityMode = true;

  groupedApplications: { type: string, displayText: string, description: string, applications: applicationItem[] }[] = [];

  public _selectedBox: Box;
  public _selectedAgent: Agent;
  public _startWizard: boolean;
  public _saveMode: string;

  @Input() startWizard;

  @Input() set saveMode(value: string) {
    this._saveMode = value;
  }
  get saveMode(): string {
    return this._saveMode;
  }
  @Input() set selectedAgent(value: Agent) {
    this._selectedAgent = value;

    this.updateModels();
  }
  get selectedAgent(): Agent {
    return this._selectedAgent;
  }

  @Input() set selectedBox(value: Box) {
    this._selectedBox = value;
  }
  get selectedBox(): Box {
    return this._selectedBox;
  }

  private _currentStep: number;

  @Input()
  get currentStep(): number { return this._currentStep; }
  set currentStep(value: number) { this._currentStep = value; }

  @Input() updateCount: number;

  @Output() public saveEmitter = new EventEmitter();

  getCategoriesAndApps(): void {

    this.staticService.getCategoryList().subscribe(res => {
      res.forEach(r => {

        this.categoryList.push(new categoryItem(r, this.translatorService.translateCategoryName(r.name), false));
      });

      this.categoryList = this.categoryList.sort((x, y) => x.category.name > y.category.name ? 1 : -1);
    });

    this.staticService.getApplicationList().subscribe(res => {
      res.forEach(r => {
        this.applicationList.push(new applicationItem(r, false));
      });
      this.applicationList = this.applicationList.sort((x, y) => x.application.name > y.application.name ? 1 : -1);

      this.fillGroupedApplications();
    });
  }

  setActiveNumber(val: number) {
    this.activeNumber = val;
  }

  isInCategoryType(type: string, cat: categoryItem) {

    if (cat.category.isVisible && categoryMappings[type]) {
      return categoryMappings[type].find(x => x === cat.category.name);
    }
    return false;
  }

  fillGroupedApplications() {
    const http = [];
    const onlineVideo = [];
    const instantMessaging = [];
    const remoteAccess = [];
    const social = [];

    this.applicationList.forEach(el => {
      switch (el.application.type) {
        case ApplicationTypes.HTTP:
          http.push(el);
          break;

        case ApplicationTypes.INSTANT_MESSAGING:
          instantMessaging.push(el);
          break;

        case ApplicationTypes.ONLINE_VIDEO:
          onlineVideo.push(el);
          break;

        case ApplicationTypes.REMOTE_ACCESS:
          remoteAccess.push(el);
          break;

        case ApplicationTypes.SOCIAL:
          social.push(el);
          break;

        default:
          break;
      }
    });

    // TODO burasi multi language yapilmali

    this.groupedApplications = [
      // { type: ApplicationTypes.CLEAR_ADS, displayText: 'Advertisement', description: 'Newly Register, Newly Up, Domain Parking, Dead Sites gibi içerik ve güvenlik riski değişiklik gösterebilen domainleri içerir.', applications: clearAds },
      // { type: ApplicationTypes.HTTP, displayText: 'HTTP', description: '',  applications: http },
      { type: ApplicationTypes.INSTANT_MESSAGING, displayText: 'Instant Messaging', description: 'Newly Register, Newly Up, Domain Parking, Dead Sites gibi içerik ve güvenlik riski değişiklik gösterebilen domainleri içerir.', applications: instantMessaging },
      { type: ApplicationTypes.ONLINE_VIDEO, displayText: 'Online Video', description: 'Pornogrphy, Adult, Gamblig gibi istenmeyen domainleri içerir.', applications: onlineVideo },
      { type: ApplicationTypes.REMOTE_ACCESS, displayText: 'Remote Access Tools', description: 'Newly Register, Newly Up, Domain Parking, Dead Sites gibi içerik ve güvenlik riski değişiklik gösterebilen domainleri içerir.', applications: remoteAccess },
      { type: ApplicationTypes.SOCIAL, displayText: 'Social Media', description: 'Newly Register, Newly Up, Domain Parking, Dead Sites gibi içerik ve güvenlik riski değişiklik gösterebilen domainleri içerir.', applications: social },
    ];
  }

  updateModels() {
    if (this.saveMode === 'NewProfile') {
      this.categoryList.forEach(c => {
        if (c.category.isVisible) {
          c.isBlocked = false;
          this.selectedAgent.rootProfile.domainProfile.categories.push({ id: c.category.id, isBlocked: false });
        }
      });
      this.applicationList.forEach(a => {
        if (a.application.isVisible) {
          a.isBlocked = false;
          this.selectedAgent.rootProfile.applicationProfile.categories.push({ id: a.application.id, isBlocked: false });
        }
      });
    } else if (this.saveMode === 'ProfileUpdate') {
      this.selectedAgent.rootProfile.domainProfile.categories.forEach(x => {
        this.categoryList.find(y => y.category.id === x.id).isBlocked = x.isBlocked;
      });

      this.selectedAgent.rootProfile.applicationProfile.categories.forEach(x => {
        this.applicationList.find(y => y.application.id === x.id).isBlocked = x.isBlocked;
      });
    } else {
      this.categoryList.forEach(c => {
        if (c.category.isVisible) {
          c.isBlocked = false;
          this.selectedAgent.rootProfile.domainProfile.categories.push({ id: c.category.id, isBlocked: false });
        }
      });
      this.applicationList.forEach(a => {
        if (a.application.isVisible) {
          a.isBlocked = false;
          this.selectedAgent.rootProfile.applicationProfile.categories.push({ id: a.application.id, isBlocked: false });
        }
      });
    }
  }

  categoryChanged(category: categoryItem) {
    if (category.isBlocked) {
      this.allowCategory(category.category.id);
    } else {
      this.blockCategory(category.category.id);
    }
  }

  allowCategory(id: number) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.categoryList.find(c => c.category.id === id).isBlocked = false;
      this.selectedAgent.rootProfile.domainProfile.categories.find(c => c.id === id).isBlocked = false;
    }
  }

  blockCategory(id: number) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.categoryList.find(c => c.category.id === id).isBlocked = true;
      this.selectedAgent.rootProfile.domainProfile.categories.find(c => c.id === id).isBlocked = true;
    }
  }

  applicationChanged(application: applicationItem) {
    if (application.isBlocked) {
      this.blockApplication(application.application.id);
    } else {
      this.allowApplication(application.application.id);
    }
  }

  allowApplication(id: number) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      const findedApp = this.applicationList.find(a => a.application.id === id);
      if (findedApp) {
        findedApp.isBlocked = true;
      }

      const finded = this.selectedAgent.rootProfile.applicationProfile.categories.find(c => c.id === id);
      if (finded) {
        finded.isBlocked = true;
      }
    }
  }

  blockApplication(id: number) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      const findedApp = this.applicationList.find(a => a.application.id === id);
      if (findedApp) {
        findedApp.isBlocked = false;
      }

      const finded = this.selectedAgent.rootProfile.applicationProfile.categories.find(c => c.id === id);
      if (finded) {
        finded.isBlocked = false;
      }
    }
  }

  isClearedAdds(): boolean {
    // advertisement apps
    const adsIds = this.groupedApplications.find(x => x.type == ApplicationTypes.CLEAR_ADS)?.applications.map(x => x.application.id);
    if (!adsIds) { return false; }

    const adsApplicatons = this.selectedAgent.rootProfile.applicationProfile.categories.filter(x => adsIds.find(y => x.id == y));
    const filtered = adsApplicatons.filter(x => x.isBlocked);


    // tslint:disable-next-line: triple-equals
    if (filtered.length == adsIds.length) {
      return true;
    }
    return false;
  }
  changeClearAds() {
    const clearedAdds = this.isClearedAdds();

    const adsApps = this.groupedApplications.find(x => x.type == ApplicationTypes.CLEAR_ADS)?.applications;
    if (!adsApps) { return; }
    adsApps.forEach(x => {
      x.isBlocked = !clearedAdds;
      this.applicationChanged(x);
    });

  }

  saveProfile() {
    let status = false;

    if (!this.selectedAgent.rootProfile.name && this.selectedAgent.rootProfile.name.trim().length === 0) {
      this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);

      return status;
    }

    let alertMessage = '', alertTitle = '';

    if (this.selectedAgent.rootProfile.numberOfUsage && this.selectedAgent.rootProfile.numberOfUsage > 0) {
      alertTitle = this.selectedAgent.rootProfile.numberOfUsage + ` ${this.staticMessageService.agentsUsingThisProfileMessage}`;
      alertMessage = this.staticMessageService.profileConfigurationWillChangeForAllOfRelatedAgentsMessage;
    } else {
      alertTitle = `${this.staticMessageService.areYouSureMessage}?`;
      alertMessage = this.staticMessageService.profileConfigurationWillChangeMessage;
    }

    this.alertService.alertWarningAndCancel(alertTitle, alertMessage).subscribe(
      res => {
        if (res) {
          if (this.saveMode === 'NewProfile' || this.saveMode === 'ProfileUpdate') {
            this.agentService.saveSecurityProfile(this.selectedAgent.rootProfile).subscribe(result => {

              this.notification.success(this.staticMessageService.savedProfileMessage);
              this.saveEmitter.emit();

              status = true;
            });
          } else if (this.saveMode === 'NewProfileWithAgent') {
            this.agentService.saveAgentLocation(this.selectedAgent).subscribe(result => {

              this.notification.success(this.staticMessageService.savedAgentLocationMessage);
              this.saveEmitter.emit();

              status = true;
            });
          } else if (this.saveMode === 'NewProfileWithRoaming') {
            this.roamingService.saveClient(this.selectedAgent).subscribe(result => {

              this.notification.success(this.staticMessageService.savedAgentRoaminClientMessage);
              this.saveEmitter.emit();

              status = true;
            });
          } else if (this.saveMode === 'NewProfileWithBox') {
            this.selectedBox.agent = this.selectedAgent;
            this.boxService.saveBox(this.selectedBox).subscribe(result => {

              this.notification.success(this.staticMessageService.savedAgentBoxMessage);
              this.saveEmitter.emit();

              status = true;
            });
          } else if (this.saveMode === 'NewProfileWithDevice') {
            const dg = new DeviceGroup();
            dg.rootProfile = this.selectedAgent.rootProfile;

            const ai: AgentInfo = new AgentInfo();
            ai.mac = this.selectedAgent.mac;
            ai.blockMessage = this.selectedAgent.blockMessage;
            ai.agentType = this.selectedAgent.agentType;
            ai.agentAlias = this.selectedAgent.agentAlias;
            ai.agentGroup = this.selectedAgent.agentGroup;
            ai.rootProfile = this.selectedAgent.rootProfile;

            dg.agents = [ai];
            delete dg.agentGroup;

            this.agentService.saveAgentDevice(dg).subscribe(result => {

              this.notification.success(this.staticMessageService.savedDeviceMessage);
              this.saveEmitter.emit();

              status = true;
            });
          } else if (this.saveMode === 'NewProfileWithDeviceGroup') {
            if (localStorage.getItem(DEVICE_GROUP)) {
              const deviceGroup: DeviceGroup = JSON.parse(localStorage.getItem(DEVICE_GROUP));
              deviceGroup.rootProfile = this.selectedAgent.rootProfile;

              if (deviceGroup.agents.length > 0 && deviceGroup.agentGroup.groupName && deviceGroup.rootProfile) {
                this.agentService.saveAgentDevice(deviceGroup).subscribe(result => {

                  this.notification.success(this.staticMessageService.savedDeviceMessage);
                  this.saveEmitter.emit();

                  status = true;
                });
              } else {
                this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);
              }
            }
          }
        }
      }
    );

    return status;
  }

  blackListItemValidation() {
    if (this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.find(b => b.domain === this.blackListItem.domain)) {
      this.isNewBlackListItem = false;
    } else {
      const result = ValidationService.domainValidation({ value: this.blackListItem.domain });
      if (result === true) {
        this.isNewBlackListItem = true;
      } else {
        this.isNewBlackListItem = false;
      }
    }
  }

  addToBlackList() {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      if (this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.find(b => b.domain === this.blackListItem.domain)) {
        this.notification.warning(this.staticMessageService.thisDomainAllreadyExitsInBlackListMessage);
      } else
        if (this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.find(b => b.domain === this.blackListItem.domain)) {
          this.notification.warning(this.staticMessageService.thisDomainAllreadyExitsInWhiteListMessage);
        } else {
          this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.push(JSON.parse(JSON.stringify(this.blackListItem)));
          this.blackListItem.domain = '';
          this.blackListItem.comment = '';
          this.isNewBlackListItem = false;
        }
    }
  }

  removeFromBlackList(item: ListItem) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.splice(
        this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.findIndex(b => b.domain === item.domain), 1);
    }
  }

  whiteListItemValidation() {
    if (this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.find(b => b.domain === this.whiteListItem.domain)) {
      this.isNewWhiteListItem = false;
    } else {
      const result = ValidationService.domainValidation({ value: this.whiteListItem.domain });
      if (result == true) {
        this.isNewWhiteListItem = true;
      } else {
        this.isNewWhiteListItem = false;
      }
    }
  }

  addToWhiteList() {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      if (this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.find(b => b.domain === this.whiteListItem.domain)) {
        this.notification.warning(this.staticMessageService.thisDomainAllreadyExitsInWhiteListMessage);
      } else
        if (this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.find(b => b.domain === this.whiteListItem.domain)) {
          this.notification.warning(this.staticMessageService.thisDomainAllreadyExitsInBlackListMessage);
        } else {
          this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.push(JSON.parse(JSON.stringify(this.whiteListItem)));
          this.whiteListItem.domain = '';
          this.whiteListItem.comment = '';
          this.isNewWhiteListItem = false;
        }
    }
  }

  removeFromWhiteList(item: string) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.splice(
        this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.findIndex(b => b.domain === item), 1);
    }
  }

  changeSafeSearchMode() {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.selectedAgent.rootProfile.isSafeSearchEnabled = this.selectedAgent.rootProfile.isSafeSearchEnabled ? false : true;
    }
  }

  changeYoutubeMode() {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.selectedAgent.rootProfile.isYoutubeStrictModeEnabled = this.selectedAgent.rootProfile.isYoutubeStrictModeEnabled ? false : true;
    }
  }

  setSecurityMode(val: boolean) {
    this.selectedAgent.rootProfile.isPositiveSecurity = val;
  }

}
