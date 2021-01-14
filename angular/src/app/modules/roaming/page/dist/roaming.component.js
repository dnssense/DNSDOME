"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.RoamingComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var isip = require("is-ip");
var Agent_1 = require("src/app/core/models/Agent");
var DeviceGroup_1 = require("src/app/core/models/DeviceGroup");
var RoamingComponent = /** @class */ (function () {
    function RoamingComponent(formBuilder, agentService, alertService, notification, roamingService, boxService, staticMessageService, inputIpService, clipboardService) {
        this.formBuilder = formBuilder;
        this.agentService = agentService;
        this.alertService = alertService;
        this.notification = notification;
        this.roamingService = roamingService;
        this.boxService = boxService;
        this.staticMessageService = staticMessageService;
        this.inputIpService = inputIpService;
        this.clipboardService = clipboardService;
        this.isGroupedRadioButtonSelected = false;
        // clientGroups: Agent[];
        // selectedClients: Agent[] = [];
        // clientListForGroup: Agent[] = [];
        this.selectedClient = new Agent_1.Agent();
        this.securityProfilesForSelect = [];
        this.securityProfilesForSelectDefaultSettings = [];
        this.selectedDefaultRomainProfileId = 41;
        this.isNewItemUpdated = false;
        this.startWizard = false;
        this.dontDomains = [];
        this.dontIps = [];
        this.localnetIps = [];
        this.confParameters = [];
        this.isDontDomainsValid = true;
        this.groupedClients = [];
        this.searchKeyUnGroup = '';
        this.alwaysActive = true;
        this.disabledNetwork = false;
        this.groupName = '';
        this.groupNameBeforeEdit = '';
        this.noGroupedClients = [];
        this.groupMembers = [];
        this.groupListForSelect = [];
        this.selectedAgentsForChangeAddGroup = [];
        this.isUninstallPasswordEyeOff = false;
        this.isDisablePasswordEyeOff = false;
        this.isAgentUninstallPasswordEyeOff = false;
        this.isAgentDisablePasswordEyeOff = false;
        this.activeTabNumber = 0;
        this.categoryOptions = [
            {
                displayText: 'Not Grouped',
                value: 'notgrouped',
                selected: true
            },
            {
                displayText: 'Grouped',
                value: 'grouped'
            }
        ];
    }
    Object.defineProperty(RoamingComponent.prototype, "isFormValid", {
        get: function () {
            return this.selectedClient.agentAlias.trim().length > 0 && this.selectedClient.rootProfile.id > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RoamingComponent.prototype, "getClientsGroupedFilteredDisabled", {
        get: function () {
            if (this.clientsGroupedFiltered) {
                return this.clientsGroupedFiltered.filter(function (x) { return x.selected; }).length === 0;
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RoamingComponent.prototype, "getUnGroupClientsGroupedFilteredDisabled", {
        get: function () {
            if (this.clientsUngroupedFiltered) {
                return this.clientsUngroupedFiltered.filter(function (x) { return x.selected; }).length === 0;
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    RoamingComponent.prototype.ngOnInit = function () {
        this.clients = [];
        this.clientForm = this.formBuilder.group({
            'name': ['', [forms_1.Validators.required]],
            'type': ['', [forms_1.Validators.required]],
            'blockMessage': []
        });
        this.loadClients();
        this.getConfParameters().subscribe();
        // this.defineNewAgentForProfile();
    };
    RoamingComponent.prototype.ngAfterViewInit = function () {
        this.configureModal.close.subscribe(function (x) {
        });
        $('[data-toggle="tooltip"]').tooltip({ html: true, container: 'body' });
    };
    RoamingComponent.prototype.openConfigureModal = function () {
        this.configureModal.toggle();
    };
    RoamingComponent.prototype.closeConfigureModal = function () {
        this.configureModal.toggle();
    };
    RoamingComponent.prototype.defaultRoamingProfileChanged = function (event) {
        this.selectedDefaultRomainProfileId = event;
    };
    RoamingComponent.prototype.loadClients = function () {
        var _this = this;
        this.agentService.getSecurityProfiles().subscribe(function (result) {
            _this.securityProfiles = result;
            _this.fillSecurityProfilesSelect(result);
            _this.fillSecurityProfilesSelectForDefaultSettings(result);
        });
        this.roamingService.getClients().subscribe(function (res) {
            _this.clients = res;
            _this.clients.forEach(function (x) {
                if (x.conf) {
                    var agentConf = JSON.parse(x.conf);
                    x.isDisabled = agentConf.isDisabled > 0;
                    x.uninstallPassword = agentConf.uninstallPassword;
                    x.disablePassword = agentConf.disablePassword;
                    x.isSmartCacheEnabled = agentConf.isSmartCacheEnabled > 0;
                }
            });
            _this.agentService.getAgentAlives(_this.clients.map(function (x) { return x.uuid; })).subscribe(function (x) {
                var _a;
                if ((_a = x === null || x === void 0 ? void 0 : x.clients) === null || _a === void 0 ? void 0 : _a.includes) {
                    _this.clients.forEach(function (y) {
                        y.isAlive = x.clients.includes(y.uuid);
                    });
                }
            });
            _this.agentService.getAgentInfo(_this.clients.map(function (x) { return x.uuid; })).subscribe(function (x) {
                _this.clients.forEach(function (y) {
                    var _a;
                    if ((_a = x === null || x === void 0 ? void 0 : x.infos) === null || _a === void 0 ? void 0 : _a.find) {
                        var info = x.infos.find(function (a) { return a.uuid == y.uuid; });
                        y.isUserDisabled = info ? info.isUserDisabled > 0 : false;
                        y.isUserDisabledSmartCache = info ? info.isUserDisabledSmartCache > 0 : false;
                        y.os = info === null || info === void 0 ? void 0 : info.os;
                        y.hostname = info === null || info === void 0 ? void 0 : info.hostname;
                        y.mac = info === null || info === void 0 ? void 0 : info.mac;
                        y.version = info === null || info === void 0 ? void 0 : info.version;
                    }
                });
            });
            _this.clientsGroupedFiltered = _this.clients.filter(function (x) { return x.agentGroup; });
            _this.clientsUngroupedFiltered = _this.clients.filter(function (x) { return !x.agentGroup; });
            _this.groupedClients = _this.getGroupClients(_this.clients);
            _this.groupListForSelect = [];
            _this.clients.filter(function (x) { return x.agentGroup; }).forEach((function (x, index) {
                var item = { displayText: x.agentGroup.groupName, value: x.agentGroup.groupName, selected: false };
                if (!_this.groupListForSelect.find(function (y) { return y.displayText == item.displayText; })) {
                    _this.groupListForSelect.push(item);
                }
            }));
            _this.groupListForSelect = _this.groupListForSelect.sort(function (x, y) {
                return x.displayText.localeCompare(y.displayText);
            });
            _this.selectedGroupName = '';
            if (_this.groupListForSelect.length) {
                _this.groupListForSelect[0].selected = true;
                _this.selectedGroupName = _this.groupListForSelect[0].displayText;
            }
            _this.clientsForShow = _this.isGroupedRadioButtonSelected ? _this.clientsGroupedFiltered : _this.clientsUngroupedFiltered;
        });
    };
    RoamingComponent.prototype.fillSecurityProfilesSelect = function (profiles, id) {
        var _profiles = [];
        profiles.forEach(function (elem) {
            var obj = {
                displayText: elem.name,
                value: elem.id
            };
            if (id) {
                obj.selected = elem.id === id;
            }
            _profiles.push(obj);
        });
        this.securityProfilesForSelect = _profiles;
    };
    RoamingComponent.prototype.fillSecurityProfilesSelectForDefaultSettings = function (profiles, id) {
        var _profiles = [];
        profiles.forEach(function (elem) {
            var obj = {
                displayText: elem.name,
                value: elem.id
            };
            if (id) {
                obj.selected = elem.id === id;
            }
            _profiles.push(obj);
        });
        this.securityProfilesForSelectDefaultSettings = _profiles;
    };
    RoamingComponent.prototype.getGroupClients = function (clients) {
        var grouped = new Map(); // [] as GroupAgentModel[];
        clients.forEach(function (elem) {
            var _a, _b;
            if (elem.agentGroup && elem.agentGroup.id > 0) {
                var finded = grouped.get(elem.agentGroup.groupName); // .find(x => x.agentGroup.groupName === elem.agentGroup.groupName);
                if (finded) {
                    finded.memberCounts++;
                    finded.agents.push(elem);
                }
                else {
                    grouped.set((_a = elem.agentGroup) === null || _a === void 0 ? void 0 : _a.groupName, {
                        name: (_b = elem.agentGroup) === null || _b === void 0 ? void 0 : _b.groupName,
                        agentGroup: elem.agentGroup,
                        securityProfile: elem.rootProfile,
                        agents: [elem],
                        memberCounts: 1
                    });
                }
            }
        });
        return Array.from(grouped.values());
    };
    RoamingComponent.prototype.checkIPNumberForDontTouchIps = function (event, inputValue) {
        var isIPV4 = this.inputIpService.checkIPNumber(event, inputValue);
    };
    RoamingComponent.prototype.checkIPNumberForLocalNetIps = function (event, inputValue) {
        var isIPV4 = this.inputIpService.checkIPNumber(event, inputValue);
    };
    RoamingComponent.prototype.getConfParameters = function () {
        var _this = this;
        return this.boxService.getVirtualBox().map(function (res) {
            _this.virtualBox = res;
            if (res.conf) {
                try {
                    var boxConf = JSON.parse(res.conf);
                    if (boxConf.donttouchdomains) {
                        _this.dontDomains = boxConf.donttouchdomains.split(',').filter(function (x) { return x; }).map(function (x) { return x[0] === '.' ? x.substring(1) : x; });
                    }
                    if (boxConf.donttouchips) {
                        _this.dontIps = boxConf.donttouchips.split(',').filter(function (x) { return x; });
                    }
                    if (boxConf.localnetips) {
                        _this.localnetIps = boxConf.localnetips.split(',').filter(function (x) { return x; });
                    }
                    if (boxConf.uninstallPassword) {
                        _this.uninstallPassword = boxConf.uninstallPassword;
                    }
                    if (boxConf.disablePassword) {
                        _this.disablePassword = boxConf.disablePassword;
                    }
                    _this.selectedDefaultRomainProfileId = boxConf.defaultRoamingSecurityProfile || 41;
                    _this.fillSecurityProfilesSelectForDefaultSettings(_this.securityProfiles, _this.selectedDefaultRomainProfileId);
                }
                catch (ignore) {
                    console.log(ignore);
                }
            }
        });
    };
    RoamingComponent.prototype.showEditWizard = function (id) {
        this.selectedClient = JSON.parse(JSON.stringify(this.clients.find(function (c) { return c.id === id; })));
        $('#newClientRow').slideDown(300);
    };
    RoamingComponent.prototype.searchByKeyword = function () {
        var _this = this;
        if (this.searchKey) {
            this.clientsGroupedFiltered = this.clients.filter(function (f) { return f.agentAlias.toLowerCase().includes(_this.searchKey.toLowerCase()); });
        }
        else {
            this.clientsGroupedFiltered = this.clients;
        }
    };
    RoamingComponent.prototype.copyLink = function () {
        var _this = this;
        this.boxService.getProgramLink().subscribe(function (res) {
            if (res && res.link) {
                _this.fileLink = res.link;
                _this.copyToClipBoard(_this.fileLink);
                _this.notification.info(_this.staticMessageService.downloadLinkCopiedToClipboardMessage);
            }
            else {
                _this.notification.error(_this.staticMessageService.couldNotCreateDownloadLinkMessage);
            }
        });
    };
    RoamingComponent.prototype.copyMagicLink = function () {
        var _this = this;
        this.boxService.getMagicLink().subscribe(function (res) {
            if (res && res.magic) {
                _this.copyToClipBoard(res.magic);
                _this.notification.info(_this.staticMessageService.magicLinkCopiedToClipboardMessage);
            }
            else {
                _this.notification.error(_this.staticMessageService.couldNotCreateMagicLinkMessage);
            }
        });
    };
    RoamingComponent.prototype.copyToClipBoard = function (input) {
        this.clipboardService.copy(input);
    };
    RoamingComponent.prototype.saveRoamingGlobalSettings = function () {
        var _this = this;
        var _a, _b;
        var domains = this.dontDomains.map(function (domain) { return domain[0] !== '.' ? '.'.concat(domain) : domain; }).join(',');
        var ips = this.dontIps.filter(function (x) { return isip(x); }).join(',');
        var localnetworkips = this.localnetIps.filter(function (x) { return isip(x); }).join(',');
        var request = {
            box: (_a = this.virtualBox) === null || _a === void 0 ? void 0 : _a.serial, uuid: (_b = this.virtualBox) === null || _b === void 0 ? void 0 : _b.uuid,
            donttouchdomains: domains,
            donttouchips: ips,
            localnetips: localnetworkips, uninstallPassword: this.uninstallPassword,
            disablePassword: this.disablePassword, defaultRoamingProfile: this.selectedDefaultRomainProfileId
        };
        this.boxService.saveBoxConfig(request).subscribe(function (x) {
            _this.notification.info(_this.staticMessageService.agentsGlobalConfSaved);
            _this.getConfParameters().subscribe(function (x) {
                _this.configureModal.toggle();
            });
            /* this.boxService.getProgramLink().subscribe(res => {
                if (res && res.link) {
                    this.getConfParameters();

                } else {
                    this.notification.error(this.staticMessageService.changesCouldNotSavedMessage);

                }
                return res;
            }); */
        });
    };
    /*  saveDomainChanges() {

         if (this.isDontDomainsValid) {
             this.saveRoamingGlobalSettings();
         }
     } */
    RoamingComponent.prototype.downloadFile = function () {
        var _this = this;
        var _a, _b;
        var domains = this.dontDomains.map(function (d) { d = '.'.concat(d.trim()); return d; }).join(',');
        var ips = this.dontIps.filter(function (x) { return isip(x); }).join(',');
        var localnetworkips = this.localnetIps.filter(function (x) { return isip(x); }).join(',');
        this.boxService.saveBoxConfig({ box: (_a = this.virtualBox) === null || _a === void 0 ? void 0 : _a.serial, uuid: (_b = this.virtualBox) === null || _b === void 0 ? void 0 : _b.uuid, donttouchdomains: domains, donttouchips: ips, localnetips: localnetworkips, uninstallPassword: this.uninstallPassword, disablePassword: this.disablePassword }).subscribe(function (x) {
            _this.boxService.getProgramLink().subscribe(function (res) {
                if (res && res.link) {
                    _this.getConfParameters().subscribe(function (x) {
                        _this.fileLink = res.link;
                        window.open(window.location.protocol + '//' + _this.fileLink, '_blank');
                    });
                    //
                }
                else {
                    _this.notification.error(_this.staticMessageService.couldNotCreateDownloadLinkMessage);
                }
            });
        });
    };
    RoamingComponent.prototype.addDomainToList = function () {
        if (this.dontDomains && this.dontDomains.length < 10) {
            var result = this.checkIsValidDomaind(this.domain);
            if (!result) {
                this.notification.warning(this.staticMessageService.enterValidDomainMessage);
                return;
            }
            this.dontDomains.push(result);
            this.domain = '';
            // this.saveDomainChanges();
        }
        else {
            this.notification.warning(this.staticMessageService.youReachedMaxDomainsCountMessage);
        }
    };
    RoamingComponent.prototype.removeElementFromDomainList = function (index) {
        this.dontDomains.splice(index, 1);
        // this.saveDomainChanges();
    };
    RoamingComponent.prototype.addIpToList = function () {
        if (this.dontIps && this.dontIps.length < 10) {
            var result = isip(this.ip) ? this.ip : null;
            if (!result) {
                this.notification.warning(this.staticMessageService.pleaseEnterValidIp);
                return;
            }
            this.dontIps.push(result);
            this.ip = '';
            // this.saveDomainChanges();
        }
        else {
            this.notification.warning(this.staticMessageService.youReachedMaxIpsCountMessage);
        }
    };
    RoamingComponent.prototype.addIpToLocalNetList = function () {
        if (this.localnetIps && this.localnetIps.length < 10) {
            var result = isip(this.localnetip) ? this.localnetip : null;
            if (!result) {
                this.notification.warning(this.staticMessageService.pleaseEnterValidIp);
                return;
            }
            this.localnetIps.push(result);
            this.localnetip = '';
            // this.saveDomainChanges();
        }
        else {
            this.notification.warning(this.staticMessageService.youReachedMaxIpsCountMessage);
        }
    };
    RoamingComponent.prototype.removeElementFromIpList = function (index) {
        this.dontIps.splice(index, 1);
        // this.saveDomainChanges();
    };
    RoamingComponent.prototype.removeElementFromLocalNetIpList = function (index) {
        this.localnetIps.splice(index, 1);
        // this.saveDomainChanges();
    };
    RoamingComponent.prototype.checkIsValidDomaind = function (d) {
        d = d.toLocaleLowerCase().replace('https://', '').replace('http://', '');
        for (var i = 0; i < d.length; i++) {
            var f = d[i];
            var res = f.match(/^[a-z0-9.-]+$/i); // alpha or num or - or .
        }
        return d;
    };
    RoamingComponent.prototype.clientsTableCheckboxChanged = function ($event) {
        this.clients.forEach(function (x) { return x.selected = false; });
        this.clientsForShow.forEach(function (elem) { return elem.selected = $event; });
    };
    RoamingComponent.prototype.openRoamingClientModal = function (client) {
        this.selectedClient = JSON.parse(JSON.stringify(client));
        this.fillSecurityProfilesSelect(this.securityProfiles, client.rootProfile.id);
        this.roamingClientModal.toggle();
        /*  this.onAgentUninstallPasswordChange = Observable.fromEvent(this.inputAgentUninstallPassword.nativeElement, 'input').pipe(debounceTime(1500)).subscribe((x: Event) => {
             this.saveAgentConf(this.selectedAgent);
         });

         this.onAgentDisablePasswordChange = Observable.fromEvent(this.inputAgentDisablePassword.nativeElement, 'input').pipe(debounceTime(1500)).subscribe((x: Event) => {
             this.saveAgentConf(this.selectedAgent);
         }); */
    };
    RoamingComponent.prototype.clearRoamingClientForm = function () {
        this.selectedClient.agentAlias = '';
        // this.selectedAgent.blockMessage = '';
        this.fillSecurityProfilesSelect(this.securityProfiles, -1);
    };
    RoamingComponent.prototype.profileSelectChange = function ($event) {
        this.selectedClient.rootProfile = this.securityProfiles.find(function (x) { return x.id === $event; });
    };
    RoamingComponent.prototype.groupSelectChange = function ($event) {
        this.selectedGroupName = $event;
    };
    RoamingComponent.prototype.addToGroup = function () {
        this.groupModal.toggle();
    };
    RoamingComponent.prototype.changeGroup = function () {
        this.groupModal.toggle();
    };
    RoamingComponent.prototype.openChangeGroup = function () {
        this.selectedAgentsForChangeAddGroup = this.clients.filter(function (x) { return x.selected; }).map(function (x) { return JSON.parse(JSON.stringify(x)); });
        if (!this.selectedAgentsForChangeAddGroup.length) {
            this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
            return;
        }
        this.changeGroupModel.toggle();
    };
    RoamingComponent.prototype.saveChangedGroup = function () {
        var _this = this;
        if (!this.selectedAgentsForChangeAddGroup.length) {
            this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
            return;
        }
        this.selectedAgentsForChangeAddGroup.forEach(function (x) {
            if (!x.agentGroup) {
                x.agentGroup = new DeviceGroup_1.AgentGroup();
                x.agentGroup.id = 0;
            }
            x.agentGroup.groupName = _this.selectedGroupName;
            var findedGroup = _this.groupedClients.find(function (group) { return group.agentGroup.groupName === _this.selectedGroupName; });
            if (findedGroup) {
                x.rootProfile = findedGroup.securityProfile;
            }
        });
        this.roamingService.saveClients(this.selectedAgentsForChangeAddGroup).subscribe(function (res) {
            _this.notification.success(_this.staticMessageService.savedAgentRoaminClientMessage);
            _this.loadClients();
            _this.changeGroupModel.toggle();
        });
    };
    RoamingComponent.prototype.cleanChangedGroup = function () {
        this.selectedAgentsForChangeAddGroup.forEach(function (x) { return x.selected = false; });
    };
    RoamingComponent.prototype.openCreateGroup = function () {
        this.groupOperation = 'Create New';
        this.groupName = '';
        this.groupNameBeforeEdit = '';
        this.selectedProfileRadio = -1;
        this.selectedProfileRadioBeforeEdit = -1;
        this.noGroupedClients = this.clients.filter(function (x) { return !x.agentGroup; }).map(function (x) { return JSON.parse(JSON.stringify(x)); });
        this.groupMembers = [];
        this.groupModal.toggle();
    };
    RoamingComponent.prototype.saveOrUpdateGroup = function () {
        var _this = this;
        var selectedItems = [];
        if (!this.groupName) {
            this.notification.warning(this.staticMessageService.needsGroupNameMessage);
            return;
        }
        if (this.groupOperation == 'Create New') {
            selectedItems = this.noGroupedClients.filter(function (x) { return x.selected; });
            if (!selectedItems.length) {
                this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
                return;
            }
            // set agent groupnames
            selectedItems.forEach(function (x) {
                if (!x.agentGroup) {
                    x.agentGroup = new DeviceGroup_1.AgentGroup();
                    x.agentGroup.id = 0;
                }
                x.agentGroup.groupName = _this.groupName;
            });
        }
        else {
            var addClients = this.noGroupedClients.filter(function (x) { return x.selected; });
            addClients.forEach(function (x) {
                if (!x.agentGroup) {
                    x.agentGroup = new DeviceGroup_1.AgentGroup();
                    x.agentGroup.id = 0;
                }
                x.agentGroup.groupName = _this.groupName;
            });
            selectedItems = selectedItems.concat(addClients);
            var removeClients = this.groupMembers.filter(function (x) { return !x.selected; });
            removeClients.forEach(function (x) {
                x.agentGroup = null;
            });
            selectedItems = selectedItems.concat(removeClients);
            if (this.groupNameBeforeEdit !== this.groupName || this.selectedProfileRadio !== this.selectedProfileRadioBeforeEdit) { // name changed
                var changedItems = this.groupMembers.filter(function (x) { return x.selected; }).filter(function (x) { return x.agentGroup; });
                changedItems.forEach(function (element) {
                    element.agentGroup.groupName = _this.groupName;
                });
                selectedItems = selectedItems.concat(changedItems);
            }
            if (!selectedItems.length) {
                this.notification.warning(this.staticMessageService.pleaseChangeSomethingMessage);
                return;
            }
        }
        var findedProfile = this.securityProfiles.find(function (x) { return x.id === _this.selectedProfileRadio; });
        console.log('findedProfile => ', findedProfile);
        if (findedProfile) {
            selectedItems.forEach(function (elem) {
                elem.rootProfile = findedProfile;
            });
        }
        this.roamingService.saveClients(selectedItems).subscribe(function (res) {
            _this.notification.success(_this.staticMessageService.savedAgentRoaminClientMessage);
            _this.loadClients();
            _this.groupModal.toggle();
        });
    };
    RoamingComponent.prototype.cleanNewGroup = function () {
        this.groupName = '';
        this.noGroupedClients.forEach(function (x) { return x.selected = false; });
        this.groupMembers.forEach(function (x) { return x.selected = false; });
    };
    RoamingComponent.prototype.openUpdateGroup = function (agents) {
        var _this = this;
        this.groupOperation = 'Edit';
        this.groupName = agents[0].agentGroup.groupName;
        this.groupNameBeforeEdit = this.groupName;
        this.selectedProfileRadio = agents[0].rootProfile.id;
        this.selectedProfileRadioBeforeEdit = this.selectedProfileRadio;
        this.noGroupedClients = this.clients.filter(function (x) { return !x.agentGroup; }).map(function (x) { return JSON.parse(JSON.stringify(x)); });
        this.groupMembers = this.clients.filter(function (x) { return x.agentGroup && x.agentGroup.groupName == _this.groupName; }).map(function (x) { return JSON.parse(JSON.stringify(x)); });
        this.groupMembers.forEach(function (x) { return x.selected = true; });
        this.groupModal.toggle();
    };
    RoamingComponent.prototype.deleteGroup = function (agents) {
        var _this = this;
        this.alertService.alertWarningAndCancel(this.staticMessageService.areYouSureMessage + "?", "" + this.staticMessageService.groupWillBeDeletedMessage).subscribe(function (res) {
            agents.forEach(function (x) { return x.agentGroup = null; });
            _this.roamingService.saveClients(agents).subscribe(function (res) {
                _this.notification.success(_this.staticMessageService.groupDeletedMessage);
                _this.loadClients();
            });
        });
    };
    RoamingComponent.prototype.saveRoamingClient = function () {
        var _this = this;
        if (this.selectedClient && this.isFormValid) {
            var conf = { isDisabled: this.selectedClient.isDisabled ? 1 : 0, isSmartCacheEnabled: this.selectedClient.isSmartCacheEnabled ? 1 : 0, disablePassword: this.selectedClient.disablePassword, uninstallPassword: this.selectedClient.uninstallPassword };
            this.selectedClient.conf = JSON.stringify(conf);
            this.roamingService.saveClient(this.selectedClient).subscribe(function (res) {
                _this.notification.success(_this.staticMessageService.savedAgentRoaminClientMessage);
                _this.loadClients();
                _this.roamingClientModal.toggle();
            });
        }
        else {
            this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);
        }
    };
    RoamingComponent.prototype.deleteClient = function (id) {
        var _this = this;
        this.alertService.alertWarningAndCancel(this.staticMessageService.areYouSureMessage, this.staticMessageService.willDeleteAgentRoamingClientMessage).subscribe(function (res) {
            if (res && id && id > 0) {
                _this.roamingService.deleteClient(id).subscribe(function (result) {
                    _this.deletedAgentRoamingClientMessage();
                    _this.loadClients();
                });
            }
        });
    };
    RoamingComponent.prototype.deletedAgentRoamingClientMessage = function () {
        this.notification.info(this.staticMessageService.deletedAgentRoamingClientMessage);
    };
    RoamingComponent.prototype.changeUninstallPasswordEye = function (status) {
        this.isUninstallPasswordEyeOff = status;
    };
    RoamingComponent.prototype.changeDisablePasswordEye = function (status) {
        this.isDisablePasswordEyeOff = status;
    };
    RoamingComponent.prototype.agentDisableEnable = function (state, agent) {
        agent.isDisabled = !state;
        this.saveAgentConf(agent);
    };
    RoamingComponent.prototype.agentDisableEnableSmartCache = function (state, agent) {
        agent.isSmartCacheEnabled = state;
        this.saveAgentConf(agent);
    };
    RoamingComponent.prototype.showGroupedClients = function (val) {
        this.isGroupedRadioButtonSelected = val;
        this.clientsForShow = val ? this.clientsGroupedFiltered : this.clientsUngroupedFiltered;
        this.clients.forEach(function (x) { return x.selected = false; });
    };
    RoamingComponent.prototype.saveAgentConf = function (agent) {
        var _this = this;
        var conf = { isDisabled: agent.isDisabled ? 1 : 0, isSmartCacheEnabled: agent.isSmartCacheEnabled ? 1 : 0, disablePassword: agent.disablePassword, uninstallPassword: agent.uninstallPassword };
        return this.agentService.saveAgentConf(agent.uuid, conf).subscribe(function (x) {
            _this.notification.success(_this.staticMessageService.savedAgentConfMessage);
        });
    };
    RoamingComponent.prototype.changeAgentUninstallPasswordEye = function (status) {
        this.isAgentUninstallPasswordEyeOff = status;
    };
    RoamingComponent.prototype.changeAgentDisablePasswordEye = function (status) {
        this.isAgentDisablePasswordEyeOff = status;
    };
    RoamingComponent.prototype.getOSImg = function (os) {
        if (os) {
            var ostype = os.toLowerCase();
            return ostype.includes('windows') ? '../../../../assets/img/windows.png' : (ostype.includes('mac') ? '../../../../assets/img/Ios.png' : '');
        }
        return null;
    };
    RoamingComponent.prototype.clickedSelect = function (event) {
        if (event === 'grouped') {
            this.isGroupedRadioButtonSelected = true;
            this.showGroupedClients(true);
        }
        else {
            this.isGroupedRadioButtonSelected = false;
            this.showGroupedClients(false);
        }
    };
    __decorate([
        core_1.ViewChild('groupModal')
    ], RoamingComponent.prototype, "groupModal");
    __decorate([
        core_1.ViewChild('configureModal')
    ], RoamingComponent.prototype, "configureModal");
    __decorate([
        core_1.ViewChild('roamingClientModal')
    ], RoamingComponent.prototype, "roamingClientModal");
    __decorate([
        core_1.ViewChild('changeGroupModal')
    ], RoamingComponent.prototype, "changeGroupModel");
    __decorate([
        core_1.ViewChild('inputUninstallPassword')
    ], RoamingComponent.prototype, "inputUninstallPassword");
    __decorate([
        core_1.ViewChild('inputDisablePassword')
    ], RoamingComponent.prototype, "inputDisablePassword");
    __decorate([
        core_1.ViewChild('inputAgentUninstallPassword')
    ], RoamingComponent.prototype, "inputAgentUninstallPassword");
    __decorate([
        core_1.ViewChild('inputAgentDisablePassword')
    ], RoamingComponent.prototype, "inputAgentDisablePassword");
    RoamingComponent = __decorate([
        core_1.Component({
            selector: 'app-roaming',
            templateUrl: 'roaming.component.html',
            styleUrls: ['roaming.component.sass']
        })
    ], RoamingComponent);
    return RoamingComponent;
}());
exports.RoamingComponent = RoamingComponent;
