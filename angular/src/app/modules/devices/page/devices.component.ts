import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgentService } from 'src/app/core/services/agent.service';
import { AgentResponse } from 'src/app/core/models/AgentResponse';
import { AlertService } from 'src/app/core/services/alert.service';
import { Box } from 'src/app/core/models/Box';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Agent } from 'src/app/core/models/Agent';
import { AgentType } from 'src/app/core/models/AgentType';
import { SecurityProfile, SecurityProfileItem, BlackWhiteListProfile } from 'src/app/core/models/SecurityProfile';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

declare var $: any;

@Component({
    selector: 'app-devices',
    templateUrl: 'devices.component.html',
    styleUrls: ['devices.component.sass']
})
export class DevicesComponent implements OnInit {

    registeredCount: number = 0;
    unregisteredCount: number = 0;
    registered: AgentResponse[];
    unregistered: AgentResponse[];
    // profiles: TimeProfileResponse;
    // mobileCategories: MobileCategory[];
    // notUpdatedCategories: MobileCategory[] = [];
    device: AgentResponse;
    deviceForm: FormGroup;
    //  collectiveBlockReq: CollectiveBlockRequest = new CollectiveBlockRequest();
    //selectedProfile: DayProfileGroup;
    //boxes: Box[] = [];
    selectedBox: Box;
    isNewProfileSelected: boolean = false;

    boxAgents: Agent[] = [];
    deviceAgents: Agent[] = [];
    selectedAgent: Agent;
    securityProfiles: SecurityProfile[] = [];
    startWizard: boolean;

    constructor(private agentService: AgentService, private formBuilder: FormBuilder, private alertService: AlertService,
        private notification: NotificationService, private authService: AuthenticationService) {

        this.authService.canActivate(document.location.href.substring(document.location.href.lastIndexOf("/") + 1));
        //  this.initializeVariables();

        this.agentService.getAgents().subscribe(res => {
            res.forEach(r => {
                if (r.agentType && r.agentType.toString() == AgentType.BOX.toString()) {
                    this.boxAgents.push(r);
                } else if (r.agentType && r.agentType.toString() == AgentType.DEVICE.toString()) {
                    this.deviceAgents.push(r);
                }
            });
        });

        this.agentService.getSecurityProfiles().subscribe(res => this.securityProfiles = res);

        // this.agentService.getRegisteredAgents().subscribe(data => { this.registered = data; this.registeredCount = data.length });
        // this.agentService.getUnRegisteredAgents().subscribe(data => { this.unregistered = data; this.unregisteredCount = data.length; });
        // this.agentService.getProfiles().subscribe(data => this.profiles = data);

        this.defineNewAgentForProfile();
    }

    defineNewAgentForProfile() {
        this.selectedAgent = new Agent();
        this.selectedAgent.rootProfile = new SecurityProfile();
        this.selectedAgent.rootProfile.domainProfile = {} as SecurityProfileItem;
        this.selectedAgent.rootProfile.applicationProfile = {} as SecurityProfileItem;
        this.selectedAgent.rootProfile.blackWhiteListProfile = {} as BlackWhiteListProfile;
        this.selectedAgent.rootProfile.domainProfile.categories = [];
        this.selectedAgent.rootProfile.applicationProfile.categories = [];
        this.selectedAgent.rootProfile.blackWhiteListProfile.blackList = [];
        this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList = [];
    }

    // initializeVariables() {
    //     this.boxes = [];
    //     this.boxService.getBoxes().subscribe(b => {
    //         b.forEach(bx => {
    //             if (!bx.location) {
    //                 this.boxes.push(bx);
    //             }
    //         });
    //         b.forEach(bx => {
    //             if (bx.location) {
    //                 this.boxes.push(bx);
    //             }
    //         });
    //     });

    //     this.device = new AgentResponse();
    //     this.device.id = null;
    //     this.device.agentAlias = null;
    //     this.device.agentCode = null;
    // }

    ngOnInit() {
        this.deviceForm = this.formBuilder.group({
            deviceName: ["", [Validators.required, Validators.minLength(2)]]
        });
    }

    showNewWizard(type: string, id: number) {
        if (type == AgentType.BOX.toString()) {
            this.selectedAgent = this.boxAgents.find(a => a.id == id);
            this.selectedAgent.rootProfile = this.securityProfiles[0];
        } else {
            this.selectedAgent = this.deviceAgents.find(a => a.id == id);
            this.selectedAgent.rootProfile = this.securityProfiles[0];
        }

        $('#devicePanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
        this.startWizard = true;
        $('#contentLink').click();
        document.getElementById('wizardPanel').scrollIntoView();

    }

    showEditWizard(type: string, id: number) {

        if (type == AgentType.BOX.toString()) {
            this.selectedAgent = this.boxAgents.find(a => a.id == id);
            this.selectedAgent.rootProfile = this.securityProfiles[0];
        } else {
            this.selectedAgent = this.deviceAgents.find(a => a.id == id);
            this.selectedAgent.rootProfile = this.securityProfiles[0];
        }

        $('#devicePanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
        this.startWizard = true;
        $('#contentLink').click();
        document.getElementById('wizardPanel').scrollIntoView();
    }

    hideWizard() {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'Your Changes will be cancelled!').subscribe(
            res => {
                if (res) {
                    this.hideWizardWithoutConfirm();
                }
            }
        );
    }

    hideWizardWithoutConfirm() {
        $('#wizardPanel').hide("slide", { direction: "right" }, 1000);
        $('#devicePanel').show("slide", { direction: "left" }, 1000);
    }

    deleteAgent(id: number) {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'Settings for this device will be deleted!').subscribe(
            res => {
                if (res) {
                    //id ile agenti bulup gonder
                    this.agentService.deleteAgent(null);
                }
            }
        );

    }

    deleteBox(id: number) {
        if (id) {
            this.agentService.deleteAgent(id).subscribe(res => {
                if (res.status == 200) {
                    this.notification.success(res.message);
                } else {
                    this.notification.error(res.message);
                }
            });
        }
    }

    securityProfileChanged(agentName: any, profile: any) {
        this.isNewProfileSelected = true;
        this.notification.success(agentName + " profile changed as: " + profile);
    }


}
