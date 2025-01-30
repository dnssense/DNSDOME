
import {map} from 'rxjs/operators';
import { AfterViewInit, Component, DestroyRef, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as isip from 'is-ip';
import { Agent } from 'src/app/core/models/Agent';
import { Box } from 'src/app/core/models/Box';
import { AgentGroup } from 'src/app/core/models/DeviceGroup';
import { BlackWhiteListProfile, SecurityProfile, SecurityProfileItem } from 'src/app/core/models/SecurityProfile';
import { AgentService } from 'src/app/core/services/agent.service';
import { BoxService } from 'src/app/core/services/box.service';
import { InputIPService } from 'src/app/core/services/inputIPService';
import { RoamingService } from 'src/app/core/services/roaming.service';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { GroupAgentModel } from '../../devices/page/devices.component';
import { ClipboardService } from 'ngx-clipboard';
import { ProfileWizardComponent } from '../../shared/profile-wizard/page/profile-wizard.component';
import {
  RkAlertService,
  RkNotificationService,
  RkTableColumnModel,
  RkSelectModel,
  RkModalModel,
  ExportTypes
} from 'roksit-lib';
import * as moment from 'moment';
import {TranslatorService} from '../../../core/services/translator.service';
import {ExcelService} from '../../../core/services/excelService';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IpCollection } from 'src/app/core/utils/ip';

const DEFAULT_SSL_BLOCK_PAGE_IP = '176.53.43.54'

declare let $: any;
export interface BoxConf {
    donttouchdomains: string;
    donttouchips: string;
    localnetips: string;
    uninstallPassword: string;
    disablePassword: string;
    defaultRoamingSecurityProfile: number;
    isEnableLocalDedect: number;
    localDetectDomain: string;
    localDetectIp: string;
    isEnableSslBlockPage?: boolean;
    sslBlockPageIps?: string[];
}

export interface AgentConf {
    uninstallPassword: string;
    disablePassword: string;
    isDisabled: number;
    isSmartCacheEnabled: number;
}


@Component({
    selector: 'app-roaming',
    templateUrl: 'roaming.component.html',
    styleUrls: ['roaming.component.sass']
})
export class RoamingComponent implements OnInit, AfterViewInit {
    virtualBox: Box;


    constructor(
        private formBuilder: UntypedFormBuilder,
        private agentService: AgentService,
        private alertService: RkAlertService,
        private notification: RkNotificationService,
        private roamingService: RoamingService,
        private boxService: BoxService,
        private staticMessageService: StaticMessageService,
        private inputIpService: InputIPService,
        private clipboardService: ClipboardService,
        private translatorService: TranslatorService,
        private excelService: ExcelService,
        private destroyRef: DestroyRef

    ) {
        this.doNotTouchIpCollection = this.createIpCollection(20);
        this.localNetIpCollection = this.createIpCollection(10);
        this.sslBlockPageIpCollection = this.createIpCollection(20);
    }



    isGroupedRadioButtonSelected = false;
    get isFormValid() {
        return this.selectedClient.agentAlias.trim().length > 0 && this.selectedClient.rootProfile.id > 0;
    }

    get getClientsGroupedFilteredDisabled() {
        if (this.clientsGroupedFiltered) {
            return this.clientsGroupedFiltered.filter(x => x.selected).length === 0;
        }

        return true;
    }


    get getUnGroupClientsGroupedFilteredDisabled() {
        if (this.clientsUngroupedFiltered) {
            return this.clientsUngroupedFiltered.filter(x => x.selected).length === 0;
        }

        return true;
    }

    grupOperation: string;
    groupOperation: string;

    clientForm: UntypedFormGroup;
    clients: Agent[];
    clientsGroupedFiltered: Agent[];
    clientsUngroupedFiltered: Agent[];
    clientsForShow: Agent[];
    // clientGroups: Agent[];
    // selectedClients: Agent[] = [];
    // clientListForGroup: Agent[] = [];

    selectedClient: Agent = new Agent();
    profileClient: Agent = new Agent();
    currentStep = 1;

    securityProfiles: SecurityProfile[] = [];
    securityProfilesForSelect: RkSelectModel[] = [];
    securityProfilesForSelectDefaultSettings: RkSelectModel[] = [];
    selectedDefaultRomainProfileId = 41;
    selectedProfile: number;
    agentGroups;

    selectedProfileRadio: number;
    selectedProfileRadioBeforeEdit: number;

    clientType: string;
    isNewItemUpdated = false;
    fileLink: string;
    searchKey: string;
    // selectedAgent: Agent = new Agent();
    saveMode: string;
    startWizard = false;
    dontDomains: string[] = [];

    confParameters: string[] = [];

    isDontDomainsValid = true;

    groupedClients: GroupAgentModel[] = [];

    searchKeyUnGroup = '';

    domain: string;
    doNotTouchIp: string;
    localNetIp: string;
    sslBlockPageIp: string;
    uninstallPassword: string;
    disablePassword: string;
    isEnableLocalDetect: boolean;
    isSSLBlockPageEnabled: boolean;
    localDetectDomain = '';
    localDetectIp = '';
    doNotTouchIpCollection: IpCollection;
    localNetIpCollection: IpCollection;
    sslBlockPageIpCollection: IpCollection;

    alwaysActive = true;
    disabledNetwork = false;

    groupName = '';
    groupNameBeforeEdit = '';
    noGroupedClients: Agent[] = [];
    groupMembers: Agent[] = [];
    groupListForSelect: RkSelectModel[] = [];
    selectedGroupName;
    selectedAgentsForChangeAddGroup: Agent[] = [];


    @ViewChild('groupModal') groupModal: RkModalModel;
    @ViewChild('configureModal') configureModal: RkModalModel;

    @ViewChild('roamingClientModal') roamingClientModal: RkModalModel;
    @ViewChild('changeGroupModal') changeGroupModel: RkModalModel;
    @ViewChild('inputUninstallPassword') inputUninstallPassword: ElementRef<any>;
    @ViewChild('inputDisablePassword') inputDisablePassword: ElementRef<any>;

    isUninstallPasswordEyeOff = false;
    isDisablePasswordEyeOff = false;
    // onUninstallPasswordChange: any;
    // onDisablePasswordChange: any;


    @ViewChild('inputAgentUninstallPassword') inputAgentUninstallPassword: ElementRef<any>;
    @ViewChild('inputAgentDisablePassword') inputAgentDisablePassword: ElementRef<any>;

    isAgentUninstallPasswordEyeOff = false;
    isAgentDisablePasswordEyeOff = false;
    onAgentUninstallPasswordChange: any;
    onAgentDisablePasswordChange: any;

    activeTabNumber = 0;

    @ViewChild('profileModal') profileModal: RkModalModel;
    @ViewChild('profileWizard') profileWizard: ProfileWizardComponent;

    aliveDataLoaded: boolean;

    categoryOptions: RkSelectModel[] = [
        {
            displayText: 'Not Grouped',
            value: 'notgrouped',
            selected: true
        },
        {
            displayText: 'Grouped',
            value: 'grouped',
        }
    ];

    columns: RkTableColumnModel[] = [
      { id: 1, name: 'agentAlias', displayText: this.translatorService.translate('DeviceName')},
      { id: 2, name: 'rootProfile', displayText: this.translatorService.translate('SecurityProfile')},
      { id: 3, name: 'agentGroup', displayText: this.translatorService.translate('GroupName') },
      { id: 4, name: 'isAlive', displayText: this.translatorService.translate('Alive')},
      { id: 5, name: 'isUserDisabled', displayText: this.translatorService.translate('UserDisabled')},
      { id: 6, name: 'isDisabled', displayText: this.translatorService.translate('Protection')},
      { id: 7, name: 'isUserDisabledSmartCache', displayText: this.translatorService.translate('UserDisabledSmartCache')},
      { id: 8, name: 'isSmartCacheEnabled', displayText: this.translatorService.translate('SmartCache') },
      { id: 9, name: 'os', displayText: this.translatorService.translate('OS')},
      { id: 10, name: 'version', displayText: this.translatorService.translate('Version')}
    ];

  pageNumber = 1;
  pageViewCount = 10;
  paginationOptions: RkSelectModel[] = [
    { displayText: '10', value: 10, selected: true },
    { displayText: '25', value: 25 },
    { displayText: '50', value: 50 },
    { displayText: '100', value: 100 },
    { displayText: '200', value: 200 }
  ];
  sortDirection;
  sortedColumn: string;
  tableHeight = window.innerWidth > 768 ? (window.innerHeight - 373) - (document.body.scrollHeight - document.body.clientHeight) : null;
  selectAll: boolean;
  private dateFormat = 'YYYY-MM-DD HH:mm';
  roamingClientVersion: string;
  roamingMacClientVersion: string;

  ngOnInit(): void {

        this.clients = [];
        this.clientForm = this.formBuilder.group({
            'name': ['', [Validators.required]],
            'type': ['', [Validators.required]],
            'blockMessage': []
        });

        this.loadClients();

        this.getConfParameters().subscribe();
        this.categoryOptions.forEach((opt) => opt.displayText = this.translatorService.translate(opt.displayText));
        this.boxService.getWindowsRoamingClientVersion().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(version => {
            this.roamingClientVersion = version;
        });
        this.boxService.getMacRoamingClientVersion().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(version => {
            this.roamingMacClientVersion = version;
        });
    }



    ngAfterViewInit() {
        this.configureModal.close.subscribe(x => {
        });
        $('[data-toggle="tooltip"]').tooltip({ html: true, container: 'body' });

    }


    openConfigureModal() {
        this.fillBoxDefaultSettings(this.virtualBox);
        this.configureModal.toggle();
    }

    closeConfigureModal() {
        this.configureModal.toggle();

    }


    defaultRoamingProfileChanged(event: any) {
        this.selectedDefaultRomainProfileId = event;
    }

  loadClients() {
        this.agentService.getSecurityProfiles().subscribe(result => {
            this.securityProfiles = result;
            this.fillSecurityProfilesSelect(result);
            this.fillSecurityProfilesSelectForDefaultSettings(result, this.selectedDefaultRomainProfileId);
        });

        this.roamingService.getClients().subscribe(res => {
            this.clients = res;
            this.clients.forEach(x => {
                if (x.conf) {
                    const agentConf = JSON.parse(x.conf) as AgentConf;
                    x.isDisabled = agentConf.isDisabled > 0;
                    x.uninstallPassword = agentConf.uninstallPassword;
                    x.disablePassword = agentConf.disablePassword;
                    x.isSmartCacheEnabled = agentConf.isSmartCacheEnabled > 0;
                } else {
                  x.isDisabled = x.isDisabled || false;
                  x.isSmartCacheEnabled = x.isSmartCacheEnabled || false;
                }
            });
            this.agentService.getAgentAlives(this.clients.map(x => x.uuid)).subscribe(x => {

                if (x?.clients?.includes) {
                    this.clients.forEach(y => {
                        y.isAlive = x.clients.includes(y.uuid);
                    });
                }
            });
            this.agentService.getAgentInfo(this.clients.map(x => x.uuid)).subscribe(x => {
              this.aliveDataLoaded = true;
              this.clients.forEach(y => {
                    if (x?.infos?.find) {

                        const info = x.infos.find(a => a.uuid == y.uuid);

                        y.isUserDisabled = info ? info.isUserDisabled > 0 : false;
                        y.isUserDisabledSmartCache = info ? info.isUserDisabledSmartCache > 0 : false;
                        y.insertDate = info ? moment(info.insertDate).format(this.dateFormat) : null;
                        y.os = info?.os;
                        y.hostname = info?.hostname;
                        y.mac = info?.mac;
                        y.version = info?.version;
                    }

                });
            });

            this.clientsGroupedFiltered = this.clients.filter(x => x.agentGroup);
            this.clientsUngroupedFiltered = this.clients.filter(x => !x.agentGroup);

            this.groupedClients = this.getGroupClients(this.clients);
            this.groupListForSelect = [];
            this.clients.filter(x => x.agentGroup).forEach(((x, index) => {
                const item: RkSelectModel = { displayText: x.agentGroup.groupName, value: x.agentGroup.groupName, selected: false };
                if (!this.groupListForSelect.find(y => y.displayText == item.displayText)) {
                    this.groupListForSelect.push(item);
                }
            }));

            this.groupListForSelect = this.groupListForSelect.sort((x, y) => {
                return x.displayText.localeCompare(y.displayText);
            });
            this.selectedGroupName = '';
            if (this.groupListForSelect.length) {
                this.groupListForSelect[0].selected = true;
                this.selectedGroupName = this.groupListForSelect[0].displayText;
            }
            this.clientsForShow = this.isGroupedRadioButtonSelected ? this.clientsGroupedFiltered : this.clientsUngroupedFiltered;
            this.calculateTableHeight();
        });
    }

    private fillSecurityProfilesSelect(profiles: SecurityProfile[], id?: number) {
        const _profiles = [];

        profiles.forEach(elem => {
            const obj = {
                displayText: elem.name,
                value: elem.id,
            } as RkSelectModel;

            if (id) {
                obj.selected = elem.id === id;
            }

            _profiles.push(obj);
        });

        this.securityProfilesForSelect = _profiles;
    }
    private fillSecurityProfilesSelectForDefaultSettings(profiles: SecurityProfile[], id?: number) {
        const _profiles = [];

        profiles.forEach(elem => {
            const obj = {
                displayText: elem.name,
                value: elem.id,
            } as RkSelectModel;

            if (id) {
                obj.selected = elem.id === id;
            }

            _profiles.push(obj);
        });

        this.securityProfilesForSelectDefaultSettings = _profiles;
    }

    private getGroupClients(clients: Agent[]): GroupAgentModel[] {
        const grouped = new Map<string, GroupAgentModel>(); // [] as GroupAgentModel[];

        clients.forEach(elem => {
            if (elem.agentGroup && elem.agentGroup.id > 0) {
                const found = grouped.get(elem.agentGroup.groupName); // .find(x => x.agentGroup.groupName === elem.agentGroup.groupName);

                if (found) {
                    found.memberCounts++;
                    found.agents.push(elem);
                } else {
                    grouped.set(elem.agentGroup?.groupName,
                        {
                            name: elem.agentGroup?.groupName,
                            agentGroup: elem.agentGroup,
                            securityProfile: elem.rootProfile,
                            agents: [elem],
                            memberCounts: 1
                        });
                }
            }
        });

        return Array.from(grouped.values());
    }


    checkIPNumberForDontTouchIps(event: KeyboardEvent, inputValue: string) {

        const isIPV4 = this.inputIpService.checkIPNumber(event, inputValue);

    }
    checkIPNumber(event: KeyboardEvent, inputValue: string) {

        const isIPV4 = this.inputIpService.checkIPNumber(event, inputValue);

    }

    fillBoxDefaultSettings(virtualBox: Box) {
        this.dontDomains = [];
        this.doNotTouchIpCollection.clear();
        this.localNetIpCollection.clear();
        this.uninstallPassword = '';
        this.disablePassword = '';
        this.selectedDefaultRomainProfileId = 41;

        if (virtualBox?.conf) {
            try {
                const boxConf: BoxConf = JSON.parse(virtualBox.conf);

                if (boxConf.donttouchdomains) {
                    this.dontDomains = boxConf.donttouchdomains.split(',').filter(Boolean).map(x => x[0] === '.' ? x.substring(1) : x);
                }

                if (boxConf.donttouchips) {
                    this.doNotTouchIpCollection.fromString(boxConf.donttouchips);
                }

                if (boxConf.localnetips) {
                    this.localNetIpCollection.fromString(boxConf.localnetips);
                }

                if (boxConf.sslBlockPageIps) {
                    this.sslBlockPageIpCollection.set(boxConf.sslBlockPageIps);
                }

                if (boxConf.uninstallPassword) {
                    this.uninstallPassword = boxConf.uninstallPassword;
                }

                if (boxConf.disablePassword) {
                    this.disablePassword = boxConf.disablePassword;
                }

                this.isEnableLocalDetect = !!boxConf.isEnableLocalDedect;
                this.isSSLBlockPageEnabled = !!boxConf.isEnableSslBlockPage;

                if (this.isSSLBlockPageEnabled) {
                    this.assignDefaultSSLBlockPageIps();
                }

                if (boxConf.localDetectDomain) {
                  this.localDetectDomain = boxConf.localDetectDomain;
                }

                if (boxConf.localDetectIp) {
                  this.localDetectIp = boxConf.localDetectIp;
                }

                this.selectedDefaultRomainProfileId = boxConf.defaultRoamingSecurityProfile || 41;
                this.fillSecurityProfilesSelectForDefaultSettings(this.securityProfiles, this.selectedDefaultRomainProfileId);

            } catch (ignore) {
                console.log(ignore);
            }

        }

    }

    getConfParameters() {
        return this.boxService.getVirtualBox().pipe(map(res => {
            this.virtualBox = res;
            this.fillBoxDefaultSettings(this.virtualBox);
        }));
    }

    showEditWizard(id: number) {
        this.selectedClient = JSON.parse(JSON.stringify(this.clients.find(c => c.id === id)));
        $('#newClientRow').slideDown(300);
    }



    searchByKeyword() {
        if (this.searchKey) {
            const key = this.searchKey.toLowerCase();
            this.clientsGroupedFiltered = this.clients.filter(f => {
                return f.agentAlias.toLowerCase().includes(key)
                    || f.agentGroup?.groupName.toLowerCase().includes(key)
                    || f.hostname?.toLocaleLowerCase().includes(key)
                    || f.mac?.toLocaleLowerCase().includes(key)
                    || f.os?.toLocaleLowerCase().includes(key)
                    || f.version?.toLocaleLowerCase().includes(key)
                    || f.rootProfile?.name.toLocaleLowerCase().includes(key);
            });
        } else {
            this.clientsGroupedFiltered = this.clients;
        }
    }

    copyLink(mac?: boolean) {

        this.boxService.getProgramLink().subscribe(res => {
            if (res && res.link) {
                if(mac) {
                    res.link = res.link + '&platform=mac';
                }
                this.fileLink = res.link;
                this.copyToClipBoard(this.fileLink);
                this.notification.info(this.staticMessageService.downloadLinkCopiedToClipboardMessage);
            } else {
                this.notification.error(this.staticMessageService.couldNotCreateDownloadLinkMessage);
            }
        });


    }

    copyMagicLink() {
        this.boxService.getMagicLink().subscribe(res => {
            if (res && res.magic) {


                this.copyToClipBoard(res.magic);
                this.notification.info(this.staticMessageService.magicLinkCopiedToClipboardMessage);
            } else {
                this.notification.error(this.staticMessageService.couldNotCreateMagicLinkMessage);
            }
        });
    }


    copyToClipBoard(input: string) {
        this.clipboardService.copy(input);
    }

    checkLocalDetect(): boolean {
      if (this.isEnableLocalDetect) {
        const resultIp = isip(this.localDetectIp) ? this.localDetectIp : null;
        if (!resultIp) {
          this.notification.warning(this.staticMessageService.pleaseEnterValidIp);
          return false;
        }
        const resultDomain = this.checkIsValidDomaind(this.localDetectDomain);
        if (!resultDomain) {
          this.notification.warning(this.staticMessageService.enterValidDomainMessage);
          return false;
        }
      }
      return true;
    }

    saveRoamingGlobalSettings() {
        if (!this.checkLocalDetect()) {
          return;
        }

        const domains = this.dontDomains.map(domain => domain[0] !== '.' ? '.'.concat(domain) : domain).join(',');

        const request = {
            box: this.virtualBox?.serial,
            boxuuid: this.virtualBox?.uuid,
            donttouchdomains: domains,
            donttouchips: this.doNotTouchIpCollection.toString(),
            localnetips: this.localNetIpCollection.toString(),
            isEnableSslBlockPage: this.isSSLBlockPageEnabled,
            sslBlockPageIps: this.sslBlockPageIpCollection.values(),
            uninstallPassword: this.uninstallPassword,
            isEnableLocalDedect: this.isEnableLocalDetect ? 1 : 0,
            localDetectIp: this.localDetectIp,
            localDetectDomain: this.localDetectDomain,
            disablePassword: this.disablePassword,
            defaultRoamingSecurityProfile: this.selectedDefaultRomainProfileId
        };

        this.boxService.saveBoxConfig(request).subscribe(x => {
            this.notification.info(this.staticMessageService.agentsGlobalConfSaved);
            this.getConfParameters().subscribe(x => {
                this.configureModal.toggle();
            });

        });

    }


    downloadFile(mac?: boolean) {
        this.boxService.getProgramLink().subscribe(res => {
            if (res && res.link) {
                this.getConfParameters().subscribe(x => {
                    if(mac) {
                        res.link = res.link + '&platform=mac';
                    }
                    this.fileLink = res.link;
                    window.open(window.location.protocol + '//' + this.fileLink , '_blank');

                });

                //
            } else {
                this.notification.error(this.staticMessageService.couldNotCreateDownloadLinkMessage);
            }
        });
    }

    addDomainToList() {
        if (this.dontDomains && this.dontDomains.length < 20) {
            const result = this.checkIsValidDomaind(this.domain);
            if (!result) {
                this.notification.warning(this.staticMessageService.enterValidDomainMessage);
                return;
            }

            this.dontDomains.push(result);



            this.domain = '';

            // this.saveDomainChanges();
        } else {
            this.notification.warning(this.staticMessageService.youReachedMaxDomainsCountMessage);
        }
    }

    removeElementFromDomainList(index: number) {
        this.dontDomains.splice(index, 1);

        // this.saveDomainChanges();
    }

    addToSSLBlockPageIps() {
        this.sslBlockPageIpCollection.add(this.sslBlockPageIp);
        this.sslBlockPageIp = ''
    }

    addIpToList() {
        this.doNotTouchIpCollection.add(this.doNotTouchIp);
        this.doNotTouchIp = '';
    }

    addIpToLocalNetList() {
        this.localNetIpCollection.add(this.localNetIp);
        this.localNetIp = '';
    }

    checkIsValidDomaind(d: string): string | null {
        d = d.toLocaleLowerCase().replace('https://', '').replace('http://', '');

        for (let i = 0; i < d.length; i++) {
            const f = d[i];

            const res = f.match(/^[a-z0-9.-]+$/i); // alpha or num or - or .
        }
        return d;
    }


    clientsTableCheckboxChanged($event) {
        this.clients.forEach(x => x.selected = false);
        this.clientsForShow.forEach(elem => elem.selected = $event);
    }





    openRoamingClientModal(client: Agent) {
        this.selectedClient = JSON.parse(JSON.stringify(client));

        this.fillSecurityProfilesSelect(this.securityProfiles, client.rootProfile.id);


        this.roamingClientModal.toggle();
        /*  this.onAgentUninstallPasswordChange = Observable.fromEvent(this.inputAgentUninstallPassword.nativeElement, 'input').pipe(debounceTime(1500)).subscribe((x: Event) => {
             this.saveAgentConf(this.selectedAgent);
         });

         this.onAgentDisablePasswordChange = Observable.fromEvent(this.inputAgentDisablePassword.nativeElement, 'input').pipe(debounceTime(1500)).subscribe((x: Event) => {
             this.saveAgentConf(this.selectedAgent);
         }); */
    }

    clearRoamingClientForm() {

        this.selectedClient.agentAlias = '';
        // this.selectedAgent.blockMessage = '';

        this.fillSecurityProfilesSelect(this.securityProfiles, -1);
    }

    profileSelectChange($event: number) {
        this.selectedClient.rootProfile = this.securityProfiles.find(x => x.id === $event);
    }

    groupSelectChange($event: string) {
        this.selectedGroupName = $event;
    }

    addToGroup() {
        this.groupModal.toggle();
    }

    changeGroup() {
        this.groupModal.toggle();
    }

    openChangeGroup() {
        this.selectedAgentsForChangeAddGroup = this.clients.filter(x => x.selected).map(x => JSON.parse(JSON.stringify(x)));
        if (!this.selectedAgentsForChangeAddGroup.length) {
            this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
            return;
        }
        this.changeGroupModel.toggle();
    }

   async updateAgents(type: 'cache' | 'protection', mod: 'enable' | 'disable') {
     const filteredClients = this.clients.filter(x => x.selected).map(x => JSON.parse(JSON.stringify(x)));
     if (!filteredClients.length) {
       this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
       return;
     }
     const changedAgents = filteredClients.filter((agent) => {
       if (type === 'protection') {
          return  (agent.isDisabled && mod === 'enable') || (!agent.isDisabled && mod === 'disable');
       }
       return  (agent.isSmartCacheEnabled && mod === 'disable') || (!agent.isSmartCacheEnabled && mod === 'enable');
     });
     for (const agent of changedAgents) {
       const conf: AgentConf = {
         isDisabled: type === 'protection' ? (mod === 'disable' ? 1 : 0) : (agent.isDisabled ? 1 : 0),
         isSmartCacheEnabled: type === 'cache' ? (mod === 'enable' ? 1 : 0) : (agent.isSmartCacheEnabled ? 1 : 0),
         disablePassword: agent.disablePassword,
         uninstallPassword: agent.uninstallPassword
       };
       await this.agentService.saveAgentConf(agent.uuid, conf).toPromise();
     }
     if (changedAgents.length > 0) {
        this.loadClients();
        this.notification.success(this.staticMessageService.savedAgentConfMessage);
        this.selectAll = false;
     }
   }

    deleteAgents() {
        const filteredClients = this.clients.filter(x => x.selected).map(x => JSON.parse(JSON.stringify(x)));

        if (!filteredClients.length) {
            this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);

            return;
        }

        this.alertService.alertWarningAndCancel(
            this.staticMessageService.areYouSureMessage,
            this.staticMessageService.willDeleteAgentRoamingClientMessage
        ).subscribe(
            async res => {
                if (res) {
                    for (const agent of filteredClients) {
                        await this.roamingService.deleteClient(agent.id).toPromise();
                    }

                    this.deletedAgentRoamingClientMessage();
                    this.loadClients();
                    this.selectAll = false;
                }
            }
        );
    }

    saveChangedGroup() {
        if (!this.selectedAgentsForChangeAddGroup.length) {
            this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
            return;
        }

        this.selectedAgentsForChangeAddGroup.forEach(x => {
            if (!x.agentGroup) {
                x.agentGroup = new AgentGroup();
                x.agentGroup.id = 0;
            }

            x.agentGroup.groupName = this.selectedGroupName;

            const foundGroup = this.groupedClients.find(group => group.agentGroup.groupName === this.selectedGroupName);

            if (foundGroup) {
                x.rootProfile = foundGroup.securityProfile;
            }
        });

        this.roamingService.saveClients(this.selectedAgentsForChangeAddGroup).subscribe(
            res => {

                this.notification.success(this.staticMessageService.savedAgentRoaminClientMessage);
                this.loadClients();
                this.changeGroupModel.toggle();

            });

    }

    cleanChangedGroup() {
        this.selectedAgentsForChangeAddGroup.forEach(x => x.selected = false);
    }

    openCreateGroup() {
        this.groupOperation = 'Create New';
        this.groupName = '';
        this.groupNameBeforeEdit = '';
        this.selectedProfileRadio = -1;
        this.selectedProfileRadioBeforeEdit = -1;

        this.noGroupedClients = this.clients.filter(x => !x.agentGroup).map(x => JSON.parse(JSON.stringify(x)));
        this.groupMembers = [];
        this.groupModal.toggle();
    }

    saveOrUpdateGroup() {
        let selectedItems: Agent[] = [];
        if (!this.groupName) {
            this.notification.warning(this.staticMessageService.needsGroupNameMessage);
            return;
        }
        if (this.groupOperation == 'Create New') {

            selectedItems = this.noGroupedClients.filter(x => x.selected);
            if (!selectedItems.length) {
                this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
                return;
            }
            // set agent groupnames
            selectedItems.forEach(x => {
                if (!x.agentGroup) {
                    x.agentGroup = new AgentGroup();
                    x.agentGroup.id = 0;
                }
                x.agentGroup.groupName = this.groupName;

            });
        } else {
            const addClients = this.noGroupedClients.filter(x => x.selected);
            addClients.forEach(x => {
                if (!x.agentGroup) {
                    x.agentGroup = new AgentGroup();
                    x.agentGroup.id = 0;
                }
                x.agentGroup.groupName = this.groupName;

            });
            selectedItems = selectedItems.concat(addClients);

            const removeClients = this.groupMembers.filter(x => !x.selected);
            removeClients.forEach(x => {
                x.agentGroup = null;

            });

            selectedItems = selectedItems.concat(removeClients);

            if (this.groupNameBeforeEdit !== this.groupName || this.selectedProfileRadio !== this.selectedProfileRadioBeforeEdit) {// name changed
                const changedItems = this.groupMembers.filter(x => x.selected).filter(x => x.agentGroup);
                changedItems.forEach(element => {
                    element.agentGroup.groupName = this.groupName;
                });
                selectedItems = selectedItems.concat(changedItems);
            }

            if (!selectedItems.length) {
                this.notification.warning(this.staticMessageService.pleaseChangeSomethingMessage);
                return;
            }
        }

        const foundProfile = this.securityProfiles.find(x => x.id === this.selectedProfileRadio);


        if (foundProfile) {
            selectedItems.forEach(elem => {
                elem.rootProfile = foundProfile;
            });
        }

        this.roamingService.saveClients(selectedItems).subscribe(
            res => {

                this.notification.success(this.staticMessageService.savedAgentRoaminClientMessage);
                this.loadClients();
                this.groupModal.toggle();

            });
    }


    cleanNewGroup() {
        this.groupName = '';

        this.noGroupedClients.forEach(x => x.selected = false);
        this.groupMembers.forEach(x => x.selected = false);
    }
    openUpdateGroup(agents: Agent[]) {
        this.groupOperation = 'Edit';
        this.groupName = agents[0].agentGroup.groupName;
        this.groupNameBeforeEdit = this.groupName;
        this.selectedProfileRadio = agents[0].rootProfile.id;
        this.selectedProfileRadioBeforeEdit = this.selectedProfileRadio;
        this.noGroupedClients = this.clients.filter(x => !x.agentGroup).map(x => JSON.parse(JSON.stringify(x)));
        this.groupMembers = this.clients.filter(x => x.agentGroup && x.agentGroup.groupName == this.groupName).map(x => JSON.parse(JSON.stringify(x)));
        this.groupMembers.forEach(x => x.selected = true);
        this.groupModal.toggle();
    }

    deleteGroup(agents: Agent[]) {

        this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.groupWillBeDeletedMessage}`).subscribe(res => {
            agents.forEach(x => x.agentGroup = null);

            this.roamingService.saveClients(agents).subscribe(
                res => {

                    this.notification.success(this.staticMessageService.groupDeletedMessage);
                    this.loadClients();


                });

        });
    }

    saveRoamingClient() {

        if (this.selectedClient && this.isFormValid) {
            const conf: AgentConf = { isDisabled: this.selectedClient.isDisabled ? 1 : 0, isSmartCacheEnabled: this.selectedClient.isSmartCacheEnabled ? 1 : 0, disablePassword: this.selectedClient.disablePassword, uninstallPassword: this.selectedClient.uninstallPassword };
            this.selectedClient.conf = JSON.stringify(conf);

            this.roamingService.saveClient(this.selectedClient).subscribe(
                res => {

                    this.notification.success(this.staticMessageService.savedAgentRoaminClientMessage);

                    this.loadClients();
                    this.roamingClientModal.toggle();


                });
        } else {
            this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);
        }
    }

    deleteClient(id: number) {
        this.alertService.alertWarningAndCancel(this.staticMessageService.areYouSureMessage, this.staticMessageService.willDeleteAgentRoamingClientMessage).subscribe(
            res => {
                if (res && id && id > 0) {
                    this.roamingService.deleteClient(id).subscribe(result => {

                        this.deletedAgentRoamingClientMessage();
                        this.loadClients();

                    });
                }
            });
    }
    deletedAgentRoamingClientMessage(): void {
        this.notification.info(this.staticMessageService.deletedAgentRoamingClientMessage);
    }
    changeUninstallPasswordEye(status: boolean) {

        this.isUninstallPasswordEyeOff = status;
    }
    changeDisablePasswordEye(status: boolean) {

        this.isDisablePasswordEyeOff = status;
    }

    agentDisableEnable(state: boolean, agent: Agent) {
        agent.isDisabled = !state;

        this.saveAgentConf(agent);
    }
    agentUserDisableEnable(state: boolean, agent: Agent) {
        // burasi
    }
    agentDisableEnableSmartCache(state: boolean, agent: Agent) {

        agent.isSmartCacheEnabled = state;

        this.saveAgentConf(agent);
    }
    showGroupedClients(val: boolean) {
        this.isGroupedRadioButtonSelected = val;
        this.clientsForShow = val ? this.clientsGroupedFiltered : this.clientsUngroupedFiltered;
        this.clients.forEach(x => x.selected = false);
    }

    saveAgentConf(agent: Agent) {
        const conf: AgentConf = { isDisabled: agent.isDisabled ? 1 : 0, isSmartCacheEnabled: agent.isSmartCacheEnabled ? 1 : 0, disablePassword: agent.disablePassword, uninstallPassword: agent.uninstallPassword };

        return this.agentService.saveAgentConf(agent.uuid, conf).subscribe(x => {

            this.notification.success(this.staticMessageService.savedAgentConfMessage);
        });
    }
    changeAgentUninstallPasswordEye(status: boolean) {

        this.isAgentUninstallPasswordEyeOff = status;
    }
    changeAgentDisablePasswordEye(status: boolean) {

        this.isAgentDisablePasswordEyeOff = status;
    }

    getOSImg(os: string) {
        if (os) {
            const ostype = os.toLowerCase();
            return ostype.includes('windows') ? '../../../../assets/img/windows.png' : (ostype.includes('mac') ? '../../../../assets/img/Ios.png' : '');
        }
        return null;
    }

    clickedSelect(event) {
        if (event === 'grouped') {
            this.isGroupedRadioButtonSelected = true;
            this.showGroupedClients(true);
        } else {
            this.isGroupedRadioButtonSelected = false;
            this.showGroupedClients(false);
        }
    }

    rkSelectButtonClicked($event: { clicked: boolean }) {
        this.saveMode = 'NewProfile';
        this.profileClient = JSON.parse(JSON.stringify(this.selectedClient));
        this.currentStep = 1;

        this.profileModal.toggle();
    }

    saveProfileEmit() {
        this.profileModal.toggle();

        this.loadClients();
    }

    saveProfile() {
        this.profileWizard.saveProfile();
    }

    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
        }
    }

    showProfileEditWizard(id: number, t: boolean = true) {
        this.currentStep = 1;
        let agent;
        if (t) {
            agent = this.clients.find(p => p.id === id);
        } else {
            agent = this.clients.find(p => p.rootProfile.id === id);
        }

        if (agent) {
            if (agent.rootProfile && agent.rootProfile.id > 0) {
                this.saveMode = 'ProfileUpdate';
                this.profileWizard.saveMode = this.saveMode;
                this.selectedClient = JSON.parse(JSON.stringify(agent));

                // this.fillSecurityProfilesArray(agent);

                this.profileClient = JSON.parse(JSON.stringify(agent));

                this.startWizard = true;

                this.profileModal.toggle();
            } else {
                this.notification.warning(this.staticMessageService.profileCannotFind);
            }
        }
    }

    fillSecurityProfilesArray(agent?: Agent) {
        this.securityProfilesForSelect = this.securityProfiles.map((elem, index) => {
            const obj = {
                displayText: elem.name,
                value: elem.id,
            } as RkSelectModel;

            if (this.saveMode === 'NewProfile') {
                if (index === this.securityProfiles.length - 1) {
                    obj.selected = true;
                }
            } else if (agent) {
                // tslint:disable-next-line: triple-equals
                if (elem.id == agent.rootProfile.id) {
                    obj.selected = true;
                }
            } else {
                if ((this.selectedClient.rootProfile && this.selectedClient.rootProfile.name) && this.selectedClient.rootProfile.id === elem.id) {
                    obj.selected = true;
                }
            }

            return obj;
        });
    }

    onIsEnableLocalDetectChange(value: boolean) {
        this.isEnableLocalDetect = value;
    }

  onPageChange(pageNumber: number) {
    this.pageNumber = pageNumber;
    this.calculateTableHeight();
  }

  onPageViewCountChange(pageViewCount: number) {
    this.pageViewCount = pageViewCount;
    this.calculateTableHeight();
  }

  onIsSSLBlockPageEnabledChange(value: boolean) {
    if (value) {
        this.assignDefaultSSLBlockPageIps()
    }
  }

  sort(col, name: string) {
    this.clientsForShow = this.clientsForShow.sort((a, b) => {
      if (name === 'agentGroup') {
        return this.sortDirection === 'asc' ? (a[name]?.groupName > b[name]?.groupName ? 1 : -1) : (a[name]?.groupName < b[name]?.groupName ? 1 : -1);
      } else if(name === 'rootProfile'){
        return this.sortDirection === 'asc' ? (a.rootProfile?.name > b.rootProfile?.name ? 1 : -1) : (a.rootProfile?.name < b.rootProfile?.name ? 1 : -1);
      }else if(name === 'isAlive'){
         let sortValue;
         if(a.isAlive === b.isAlive){
             sortValue = moment(a.insertDate).toDate().getTime() - moment(b.insertDate).toDate().getTime();
         } else {
           sortValue = a.isAlive ? 1: -1;
         }
        return this.sortDirection === 'asc' ? sortValue :-1*sortValue;
      }
      return this.sortDirection === 'asc' ? (a[name] > b[name] ? 1 : -1) : (a[name] < b[name] ? 1 : -1);
    });
    this.clientsForShow = [...this.clientsForShow];

    if (col) {
      this.sortedColumn = col.name;
    }

    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }
  checkboxAllChange($event: boolean, list: Agent[]) {
    this.clientsForShow.forEach(elem => {
      elem.selected = false;
    });

    list.forEach(elem => {
      elem.selected = $event;
    });
  }

  calculateTableHeight() {
    this.tableHeight = window.innerWidth > 768 ? (window.innerHeight - 373) - (document.body.scrollHeight - document.body.clientHeight) : null;
  }

  exportAs(extention: ExportTypes) {
    const exportedTypeList = this.isGroupedRadioButtonSelected ? this.clientsGroupedFiltered : this.clientsUngroupedFiltered;
    if (exportedTypeList && exportedTypeList?.length > 0) {
      const tableData = JSON.parse(JSON.stringify(exportedTypeList)) as any[];

      tableData.forEach(data => {
        data.alive = data.isAlive ? 'Alive' : 'Last Seen ' + (data?.insertDate ? (data?.insertDate) : 'More Than One Week');
        delete data.id;
        delete data.userId;
        delete data.companyId;
        delete data.conf;
        delete data.isAlive;
        delete data.insertDate;
      });

      const d = new Date();

      if (extention === 'excel') {
        this.excelService.exportAsExcelFile(tableData, 'ClientsReport-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
      }
    }
  }

  exportGroupsAs(extention: ExportTypes) {
    if (this.groupedClients && this.groupedClients.length > 0) {
      const tableData = JSON.parse(JSON.stringify(this.groupedClients)) as any[];
      tableData.forEach(data => {
        data['Name'] = data.name;
        data['Member Count'] = data.memberCounts;
        data['Security Profile'] = data.securityProfile.name;
        delete data.agents;
        delete data.securityProfile;
        delete data.agentGroup;
        delete data.memberCounts;
        delete data.name;
      });
      const d = new Date();

      if (extention === 'excel') {
        this.excelService.exportAsExcelFile(tableData, 'GroupedClientsReport-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
      }
    }
  }

  private assignDefaultSSLBlockPageIps() {
    if (!this.sslBlockPageIpCollection.length) {
        this.sslBlockPageIpCollection.set([DEFAULT_SSL_BLOCK_PAGE_IP])
    }
  }

  private createIpCollection(maxCount: number) {
    return new IpCollection({
        maxCount,
        onIpNotValid: () => {
            this.notification.warning(this.staticMessageService.pleaseEnterValidIp);
        },
        onMaxCountReached: () => {
            this.notification.warning(this.staticMessageService.youReachedMaxIpsCountMessage);
        },
    })
  }
}
