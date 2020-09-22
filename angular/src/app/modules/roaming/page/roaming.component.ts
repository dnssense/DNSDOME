import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as isip from 'is-ip';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Agent } from 'src/app/core/models/Agent';
import { Box } from 'src/app/core/models/Box';
import { AgentGroup } from 'src/app/core/models/DeviceGroup';
import { SecurityProfile } from 'src/app/core/models/SecurityProfile';
import { AgentService } from 'src/app/core/services/agent.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { BoxService } from 'src/app/core/services/box.service';
import { InputIPService } from 'src/app/core/services/inputIPService';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RoamingService } from 'src/app/core/services/roaming.service';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { GroupAgentModel } from '../../devices/page/devices.component';

declare let $: any;
export interface BoxConf {
    donttouchdomains: string;
    donttouchips: string;
    localnetips: string;
    uninstallPassword: string;
    disablePassword: string;
}

export interface AgentConf {
    uninstallPassword: string;
    disablePassword: string;
    isDisabled: number;
}


@Component({
    selector: 'app-roaming',
    templateUrl: 'roaming.component.html',
    styleUrls: ['roaming.component.sass']
})
export class RoamingComponent implements OnInit, AfterViewInit {
    virtualBox: Box;


    constructor(
        private formBuilder: FormBuilder,
        private agentService: AgentService,
        private alertService: AlertService,
        private notification: NotificationService,
        private roamingService: RoamingService,
        private boxService: BoxService,
        private staticMessageService: StaticMessageService,
        private inputIpService: InputIPService
    ) { }

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

    clientForm: FormGroup;
    clients: Agent[];
    clientsGroupedFiltered: Agent[];
    clientsUngroupedFiltered: Agent[];
    clientsForShow: Agent[];
    // clientGroups: Agent[];
    // selectedClients: Agent[] = [];
    // clientListForGroup: Agent[] = [];

    selectedClient: Agent = new Agent();

    securityProfiles: SecurityProfile[];
    securityProfilesForSelect: RkSelectModel[] = [];
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
    dontIps: string[] = [];
    localnetIps: string[] = [];

    confParameters: string[] = [];

    isDontDomainsValid = true;

    groupedClients: GroupAgentModel[] = [];

    searchKeyUnGroup = '';

    domain: string;
    ip: string;
    localnetip: string;
    uninstallPassword: string;
    disablePassword: string;

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
    onUninstallPasswordChange: any;
    onDisablePasswordChange: any;


    @ViewChild('inputAgentUninstallPassword') inputAgentUninstallPassword: ElementRef<any>;
    @ViewChild('inputAgentDisablePassword') inputAgentDisablePassword: ElementRef<any>;

    isAgentUninstallPasswordEyeOff = false;
    isAgentDisablePasswordEyeOff = false;
    onAgentUninstallPasswordChange: any;
    onAgentDisablePasswordChange: any;


    ngOnInit(): void {

        this.clients = [];
        this.clientForm = this.formBuilder.group({
            'name': ['', [Validators.required]],
            'type': ['', [Validators.required]],
            'blockMessage': []
        });

        this.loadClients();

        this.getConfParameters();


        // this.defineNewAgentForProfile();
    }

    ngAfterViewInit() {
        this.configureModal.close.subscribe(x => {

            if (x.closed) {

                if (this.onUninstallPasswordChange) {
                    this.onUninstallPasswordChange.unsubscribe();
                }
                this.onUninstallPasswordChange = null;


                if (this.onDisablePasswordChange) {
                    this.onDisablePasswordChange.unsubscribe();
                }
                this.onDisablePasswordChange = null;
            }
        });

        /* this.roamingClientModal.close.subscribe(x => {

            if (x.closed) {

                if (this.onAgentUninstallPasswordChange) {
                    this.onAgentUninstallPasswordChange.unsubscribe();
                }
                this.onAgentUninstallPasswordChange = null;


                if (this.onAgentDisablePasswordChange) {
                    this.onAgentDisablePasswordChange.unsubscribe();
                }
                this.onAgentDisablePasswordChange = null;
            }
        });*/

        $('[data-toggle="tooltip"]').tooltip({ html: true, container: 'body' });

    }


    openConfigureModal() {
        this.configureModal.toggle();
        this.onUninstallPasswordChange = Observable.fromEvent(this.inputUninstallPassword.nativeElement, 'input').pipe(debounceTime(1500)).subscribe((x: Event) => {
            this.saveRoamingGlobalSettings();
        });

        this.onDisablePasswordChange = Observable.fromEvent(this.inputDisablePassword.nativeElement, 'input').pipe(debounceTime(1500)).subscribe((x: Event) => {
            this.saveRoamingGlobalSettings();
        });


    }

    closeConfigureModal() {
        this.configureModal.toggle();

    }



    loadClients() {
        this.agentService.getSecurityProfiles().subscribe(result => {
            this.securityProfiles = result;
            this.fillSecurityProfilesSelect(result);
        });

        this.roamingService.getClients().subscribe(res => {
            this.clients = res;
            this.clients.forEach(x => {
                if (x.conf) {
                    const agentConf = JSON.parse(x.conf) as AgentConf;
                    x.isDisabled = agentConf.isDisabled > 0;
                    x.uninstallPassword = agentConf.uninstallPassword;
                    x.disablePassword = agentConf.disablePassword;

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
                this.clients.forEach(y => {
                    if (x?.infos?.find) {

                        const info = x.infos.find(a => a.uuid == y.uuid);

                        y.isUserDisabled = info ? info.isUserDisabled > 0 : false;
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

    private getGroupClients(clients: Agent[]): GroupAgentModel[] {
        const grouped = new Map<string, GroupAgentModel>(); // [] as GroupAgentModel[];

        clients.forEach(elem => {
            if (elem.agentGroup && elem.agentGroup.id > 0) {
                const finded = grouped.get(elem.agentGroup.groupName); // .find(x => x.agentGroup.groupName === elem.agentGroup.groupName);

                if (finded) {
                    finded.memberCounts++;
                    finded.agents.push(elem);
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
    checkIPNumberForLocalNetIps(event: KeyboardEvent, inputValue: string) {

        const isIPV4 = this.inputIpService.checkIPNumber(event, inputValue);

    }


    getConfParameters() {

        this.boxService.getVirtualBox().subscribe(res => {
            this.virtualBox = res;
            if (res.conf) {
                try {
                    const boxConf: BoxConf = JSON.parse(res.conf);
                    if (boxConf.donttouchdomains) {
                        this.dontDomains = boxConf.donttouchdomains.split(',').filter(x => x).map(x => x[0] === '.' ? x.substring(1) : x);
                    }
                    if (boxConf.donttouchips) {
                        this.dontIps = boxConf.donttouchips.split(',').filter(x => x);
                    }
                    if (boxConf.localnetips) {
                        this.localnetIps = boxConf.localnetips.split(',').filter(x => x);
                    }
                    if (boxConf.uninstallPassword) {
                        this.uninstallPassword = boxConf.uninstallPassword;
                    }
                    if (boxConf.disablePassword) {
                        this.disablePassword = boxConf.disablePassword;
                    }
                } catch (ignore) {
                    console.log(ignore);
                }

            }
        });
    }

    showEditWizard(id: number) {
        this.selectedClient = JSON.parse(JSON.stringify(this.clients.find(c => c.id === id)));
        $('#newClientRow').slideDown(300);
    }



    searchByKeyword() {
        if (this.searchKey) {
            this.clientsGroupedFiltered = this.clients.filter(f => f.agentAlias.toLowerCase().includes(this.searchKey.toLowerCase()));
        } else {
            this.clientsGroupedFiltered = this.clients;
        }
    }

    copyLink() {
        /* const domains = this.dontDomains.map(d => { d = '.'.concat(d); return d; }).join(',');
        const ips = this.dontIps.filter(x => isip(x)).join(',');
        const localnetworkips = this.localnetIps.filter(x => isip(x)).join(',');

        this.boxService.getProgramLink({ donttouchdomains: domains, donttouchips: ips, localnetips: localnetworkips, uninstallPassword: this.uninstallPassword, disablePassword: this.disablePassword }).subscribe(res => {
            if (res && res.link) {
                this.getConfParameters();
                this.fileLink = res.link;
                this.copyToClipBoard(this.fileLink);
                this.notification.info(this.staticMessageService.downloadLinkCopiedToClipboardMessage);
            } else {
                this.notification.error(this.staticMessageService.couldNotCreateDownloadLinkMessage);
            }
        }); */
        this.boxService.getProgramLink().subscribe(res => {
            if (res && res.link) {

                this.fileLink = res.link;
                this.copyToClipBoard(this.fileLink);
                this.notification.info(this.staticMessageService.downloadLinkCopiedToClipboardMessage);
            } else {
                this.notification.error(this.staticMessageService.couldNotCreateDownloadLinkMessage);
            }
        });


    }

    copyToClipBoard(input: string) {
        const selBox = document.createElement('textarea');
        selBox.value = input;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
    }


    saveRoamingGlobalSettings() {

        const domains = this.dontDomains.map(domain => domain[0] !== '.' ? '.'.concat(domain) : domain).join(',');
        const ips = this.dontIps.filter(x => isip(x)).join(',');
        const localnetworkips = this.localnetIps.filter(x => isip(x)).join(',');
        const request = { box: this.virtualBox?.serial, uuid: this.virtualBox?.uuid, donttouchdomains: domains, donttouchips: ips, localnetips: localnetworkips, uninstallPassword: this.uninstallPassword, disablePassword: this.disablePassword };
        this.boxService.saveBoxConfig(request).subscribe(x => {
            this.notification.info(this.staticMessageService.agentsGlobalConfSaved);
            /* this.boxService.getProgramLink().subscribe(res => {
                if (res && res.link) {
                    this.getConfParameters();

                } else {
                    this.notification.error(this.staticMessageService.changesCouldNotSavedMessage);

                }
                return res;
            }); */
        });

    }

    saveDomainChanges() {

        if (this.isDontDomainsValid) {
            this.saveRoamingGlobalSettings();
        }
    }

    downloadFile() {
        const domains = this.dontDomains.map(d => { d = '.'.concat(d.trim()); return d; }).join(',');
        const ips = this.dontIps.filter(x => isip(x)).join(',');
        const localnetworkips = this.localnetIps.filter(x => isip(x)).join(',');
        this.boxService.saveBoxConfig({ box: this.virtualBox?.serial, uuid: this.virtualBox?.uuid, donttouchdomains: domains, donttouchips: ips, localnetips: localnetworkips, uninstallPassword: this.uninstallPassword, disablePassword: this.disablePassword }).subscribe(x => {
            this.boxService.getProgramLink().subscribe(res => {
                if (res && res.link) {
                    this.getConfParameters();
                    this.fileLink = res.link;
                    window.open('http://' + this.fileLink, '_blank');
                } else {
                    this.notification.error(this.staticMessageService.couldNotCreateDownloadLinkMessage);
                }
            });
        });

    }

    addDomainToList() {

        if (this.dontDomains && this.dontDomains.length < 10) {
            const result = this.checkIsValidDomaind(this.domain);
            if (!result) {
                this.notification.warning(this.staticMessageService.enterValidDomainMessage);
                return;
            }

            this.dontDomains.push(result);



            this.domain = '';

            this.saveDomainChanges();
        } else {
            this.notification.warning(this.staticMessageService.youReachedMaxDomainsCountMessage);
        }
    }

    removeElementFromDomainList(index: number) {
        this.dontDomains.splice(index, 1);

        this.saveDomainChanges();
    }
    addIpToList() {

        if (this.dontIps && this.dontIps.length < 10) {
            const result = isip(this.ip) ? this.ip : null;
            if (!result) {
                this.notification.warning(this.staticMessageService.pleaseEnterValidIp);
                return;
            }

            this.dontIps.push(result);



            this.ip = '';

            this.saveDomainChanges();
        } else {
            this.notification.warning(this.staticMessageService.youReachedMaxIpsCountMessage);
        }
    }
    addIpToLocalNetList() {

        if (this.localnetIps && this.localnetIps.length < 10) {
            const result = isip(this.localnetip) ? this.localnetip : null;
            if (!result) {
                this.notification.warning(this.staticMessageService.pleaseEnterValidIp);
                return;
            }

            this.localnetIps.push(result);



            this.localnetip = '';

            this.saveDomainChanges();
        } else {
            this.notification.warning(this.staticMessageService.youReachedMaxIpsCountMessage);
        }
    }

    removeElementFromIpList(index: number) {
        this.dontIps.splice(index, 1);

        this.saveDomainChanges();
    }
    removeElementFromLocalNetIpList(index: number) {
        this.localnetIps.splice(index, 1);

        this.saveDomainChanges();
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

            const findedGroup = this.groupedClients.find(group => group.agentGroup.groupName === this.selectedGroupName);

            if (findedGroup) {
                x.rootProfile = findedGroup.securityProfile;
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

        const findedProfile = this.securityProfiles.find(x => x.id === this.selectedProfileRadio);

        console.log('findedProfile => ', findedProfile);

        if (findedProfile) {
            selectedItems.forEach(elem => {
                elem.rootProfile = findedProfile;
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
            const conf: AgentConf = { isDisabled: this.selectedClient.isDisabled ? 1 : 0, disablePassword: this.selectedClient.disablePassword, uninstallPassword: this.selectedClient.uninstallPassword };
            this.selectedClient.conf = JSON.stringify(conf);
            debugger;
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
    showGroupedClients(val: boolean) {

        this.isGroupedRadioButtonSelected = val;
        this.clientsForShow = val ? this.clientsGroupedFiltered : this.clientsUngroupedFiltered;
        this.clients.forEach(x => x.selected = false);
    }

    saveAgentConf(agent: Agent) {
        const conf: AgentConf = { isDisabled: agent.isDisabled ? 1 : 0, disablePassword: agent.disablePassword, uninstallPassword: agent.uninstallPassword };
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

}
