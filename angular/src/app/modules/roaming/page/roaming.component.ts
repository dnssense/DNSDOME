import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Agent } from 'src/app/core/models/Agent';
import { SecurityProfile, SecurityProfileItem, BlackWhiteListProfile } from 'src/app/core/models/SecurityProfile';
import { AgentService } from 'src/app/core/services/agent.service';
import * as introJs from 'intro.js/intro.js';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RoamingService } from 'src/app/core/services/roaming.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { BoxService } from 'src/app/core/services/box.service';

declare let $: any;

@Component({
    selector: 'app-roaming',
    templateUrl: 'roaming.component.html',
    styleUrls: ['roaming.component.sass']
})
export class RoamingComponent implements OnInit {
    confParameters: string
    clientForm: FormGroup;
    clients: Agent[];
    clientsFiltered: Agent[];
    clientGroups: Agent[];
    selectedClients: Agent[] = [];
    clientListForGroup: Agent[] = [];
    selectedClient: Agent = new Agent();
    securityProfiles: SecurityProfile[];
    clientType: string;
    isNewItemUpdated: boolean = false;
    fileLink: string;
    searchKey: string;
    selectedAgent: Agent = new Agent();
    saveMode: string;
    startWizard: boolean = false;
    constructor(private formBuilder: FormBuilder, private agentService: AgentService, private alertService: AlertService,
        private notification: NotificationService, private roamingService: RoamingService, private boxService: BoxService) { }

    ngOnInit(): void {
        this.clients = [];
        this.clientForm = this.formBuilder.group({
            "name": ["", [Validators.required]],
            "type": ["", [Validators.required]],
            "blockMessage": []
        });

        this.loadClients();
        this.getConfParameters()
        this.defineNewAgentForProfile();
    }

    loadClients() {
        this.agentService.getSecurityProfiles().subscribe(res => { this.securityProfiles = res });

        this.roamingService.getClients().subscribe(res => {
            this.clients = res;
            this.clientsFiltered = this.clients;
        });

    }

    getConfParameters() {
        this.boxService.getVirtualBox().subscribe(res => {
            this.confParameters = res.conf.split(',').map(d => { d = d.slice(1); return d; }).join(',');
        });
    }

    defineNewAgentForProfile() {

        this.selectedAgent.rootProfile = new SecurityProfile();
        this.selectedAgent.rootProfile.domainProfile = {} as SecurityProfileItem;
        this.selectedAgent.rootProfile.applicationProfile = {} as SecurityProfileItem;
        this.selectedAgent.rootProfile.blackWhiteListProfile = {} as BlackWhiteListProfile;
        this.selectedAgent.rootProfile.domainProfile.categories = [];
        this.selectedAgent.rootProfile.applicationProfile.categories = [];
        this.selectedAgent.rootProfile.blackWhiteListProfile.blackList = [];
        this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList = [];
    }

    onSelectionChangeType() {

    }

    securityProfileChanged(id: number) {
        this.isNewItemUpdated = true;
        this.selectedClient.rootProfile = this.securityProfiles.find(p => p.id == id);
    }

    openTooltipGuide() {
        introJs().start();
    }

    showForm() {
        $('#newClientRow').slideDown(300);
        //$('#pi_card_btn').hide();
    }

    hideForm() {
        $('#newClientRow').slideUp(300);
        //   $('#pi_card_btn').show();
    }

    showNewProfileWizard() {
        if (!this.isFormValid()) {
            return;
        }

        this.selectedAgent = this.selectedClient;
        this.defineNewAgentForProfile();
        this.selectedAgent.rootProfile.name = this.selectedClient.agentAlias + "-Profile";

        this.saveMode = 'NewProfileWithRoaming';

        $('#clientsPanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
        this.startWizard = true;
        document.getElementById('wizardPanel').scrollIntoView();
    }

    isFormValid() {
        const $validator = $('.clientForm').validate({
            rules: {
                name: {
                    required: true
                },
                type: {
                    required: false
                }
            }
        });

        var $valid = $('.clientForm').valid();
        if (!$valid) {
            this.notification.warning("Client form is not valid. Please enter required fields. ")
            $validator.focusInvalid();
            return false;
        }
        return true;
    }

    showEditWizard(id: number) {
        this.selectedClient = JSON.parse(JSON.stringify(this.clients.find(c => c.id == id)));
        this.showForm()
    }

    showProfileEditWizard(id: number) {
        let agent = this.clients.find(p => p.id == id);
        if (agent.rootProfile && agent.rootProfile.id > 0) {
            this.selectedAgent = agent;
            this.saveMode = 'ProfileUpdate';
            $('#clientsPanel').toggle("slide", { direction: "left" }, 600);
            $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
            this.startWizard = true;
            //$('#contentLink').click();
            document.getElementById('wizardPanel').scrollIntoView();
        } else {
            this.notification.warning('Profile can not find!');
        }

    }

    hideWizard() {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'If you made changes, your Changes will be cancelled!').subscribe(
            () => {
                $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
                $('#clientsPanel').toggle("slide", { direction: "left" }, 600);
                $('#newClientRow').slideUp(300);
                // $('#pi_card_btn').show();
                this.loadClients();
            }
        );
    }

    hideWizardWithoutConfirm() {
        $('#wizardPanel').toggle("slide", { direction: "right" }, 800);
        $('#clientsPanel').toggle("slide", { direction: "left" }, 800);
        $('#newClientRow').slideUp(300);
        // $('#pi_card_btn').show();
        this.loadClients();
    }

    saveClient() {
        if (this.selectedClient && this.isFormValid()) {
            this.roamingService.saveClient(this.selectedClient).subscribe(
                res => {
                    if (res.status == 200) {
                        this.notification.success(res.message);
                        this.hideForm();
                        this.loadClients();
                    } else {
                        this.notification.error(res.message);
                    }
                });
        }
    }

    deleteClient(id: number) {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'Selected Client will be deleted!').subscribe(
            res => {
                if (res && id && id > 0) {
                    this.roamingService.deleteClient(id).subscribe(res => {
                        if (res.status == 200) {
                            this.notification.success(res.message);
                        } else {
                            this.notification.error(res.message);
                        }
                    });
                }
            }
        );


    }

    searchByKeyword() {
        if (this.searchKey) {
            this.clientsFiltered = this.clients.filter(f => f.agentAlias.toLowerCase().includes(this.searchKey.toLowerCase()));
        } else {
            this.clientsFiltered = this.clients;
        }
    }

    copyLink() {
        let domains = this.dontDomains.split(',').map(d => { d = '.'.concat(d); return d; }).join(',')
        this.boxService.getProgramLink(domains).subscribe(res => {
            if (res && res.link) {
                this.getConfParameters()
                this.closeModal();
                this.fileLink = res.link;
                this.copyToClipBoard(this.fileLink)
                this.notification.info('File link copied to clipboard')
            } else {
                this.notification.error('Could not create link')
            }
        });
    }

    copyToClipBoard(input: string) {
        let selBox = document.createElement('textarea');
        selBox.value = input;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
    }

    dontDomains: string
    downloadFile() {
        let domains = this.dontDomains.split(',').map(d => { d = '.'.concat(d.trim()); return d; }).join(',')

        this.boxService.getProgramLink(domains).subscribe(res => {
            if (res && res.link) {
                this.getConfParameters()
                this.closeModal();
                this.fileLink = res.link
                window.open('http://' + this.fileLink, "_blank");
            } else {
                this.notification.error('Could not create link')
            }
        });
    }

    isDontDomainsValid: boolean = true
    checkDomain() {
        this.dontDomains = this.dontDomains.toLowerCase()
        this.isDontDomainsValid = true;
        const d = this.dontDomains.split(',');
        if (d.length > 10) {
            this.notification.warning('You can report 10 domains per request');
            this.isDontDomainsValid = false;
        } else {
            for (let i = 0; i < d.length; i++) {
                let f = d[i];
                if (f.toLowerCase().startsWith('http')) {
                    f = f.toLowerCase().replace('http://', '').replace('https://', '');
                }
                const res = f.match(/^[a-z0-9.-]+$/i);//alpha or num or - or .
                if (!res) {
                    this.isDontDomainsValid = false;
                    break;
                }
            }
        }
    }

    moveDeviceInGroup(opType: number, id: number) {
        if (opType == 1) {
            this.selectedClients.push(this.clientListForGroup.find(u => u.id == id));
            this.clientListForGroup.splice(this.clientListForGroup.findIndex(x => x.id == id), 1);
        } else {
            this.clientListForGroup.push(this.selectedClients.find(u => u.id == id));
            this.selectedClients.splice(this.selectedClients.findIndex(x => x.id == id), 1);
        }

    }

    openModal() {
        this.dontDomains = JSON.parse(JSON.stringify(this.confParameters))
        this.checkDomain()
        this.clientListForGroup = JSON.parse(JSON.stringify(this.clientsFiltered));
        $(document.body).addClass('modal-open');
        $('#exampleModal').css('display', 'block');
        $('#exampleModal').attr('aria-hidden', 'false');
        $('#exampleModal').addClass('show');
    }

    closeModal() {
        $(document.body).removeClass('modal-open');
        $('#exampleModal').css('display', 'none');
        $('#exampleModal').attr('aria-hidden', 'true');
        $('#exampleModal').removeClass('show');
    }


}
