import {Component, OnInit, ViewChild} from '@angular/core';
import {RkModalModel} from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import {RkSelectModel} from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import {Role} from 'src/app/core/models/Role';
import {User} from 'src/app/core/models/User';
import {AlertService} from 'src/app/core/services/alert.service';
import {AuthenticationService} from 'src/app/core/services/authentication.service';
import {NotificationService} from 'src/app/core/services/notification.service';
import {StaticMessageService} from 'src/app/core/services/staticMessageService';
import {UserService} from 'src/app/core/services/userService';
import * as validator from 'validator';
import {Company, CompanyUpdaterDTO} from "../../../core/models/Company";
import {CompanyService} from "../../../core/services/companyService";

declare var $: any;

@Component({
  selector: 'app-users',
  templateUrl: 'users.component.html',
  styleUrls: ['users.component.sass']
})
export class UsersComponent implements OnInit {

  constructor(
    private notification: NotificationService,
    private userService: UserService,
    private staticMessageService: StaticMessageService,
    private authenticatonService: AuthenticationService,
    private alertService: AlertService,
    private companyService: CompanyService,
  ) {

    let role = new Role();
    role.id = 2;
    role.name = 'ROLE_CUSTOMER';
    if (!this.user.role)
      this.user.role = []
    this.user.role.push(role)
    this.userService.getUsers().subscribe(res => {
      this.users = res;
    });

    this.userRoles = this.userService.getRoles();

    this.userRoles.forEach(elem => {
      this.userRolesForSelect.push({
        displayText: elem.description,
        value: elem.id
      });
    });
  }

  @ViewChild('userModal') userModal: RkModalModel;
  userModalType: 'create' | 'edit';

  @ViewChild('mspSettingModal') mspSettingModal: RkModalModel
  mspSettingModalType: 'mspedit'

  user: User = new User();

  users: User[] = [];

  userRoles: Role[] = [];
  userRolesForSelect: RkSelectModel[] = [];

  passwordStrength = 0;

  searchKey: string;

  selectedRoleId;

  isActive: boolean;

  currentCompany: Company
  parentCompany: Company = new Company()
  companyUpdaterDto: CompanyUpdaterDTO
  parentCompanyRolesForSelect: RkSelectModel[] = [];
  selectedMspRoleId
  parentIsLocked: boolean = true

  ngOnInit() {
    this.loadCompanyAndParent()
  }

  checkPasswordStrength() {
    this.passwordStrength = 0;

    if (!this.user.password || this.user.password.length < 1) {
      return;
    }

    if (/[a-z]/.test(this.user.password)) {
      this.passwordStrength++;
    }

    if (/[A-Z]/.test(this.user.password)) {
      this.passwordStrength++;
    }

    if (/[0-9]/.test(this.user.password)) {
      this.passwordStrength++;
    }

    if (this.user.password && this.user.password.length > 7) {
      this.passwordStrength++;
    }
  }

  get isCurrentUserAdmin() {
    const role = this.authenticatonService.currentSession?.currentUser?.role;
    if (role && role.find(r => r.name == 'ROLE_MSP_ADMIN') /*role.name == 'ROLE_CUSTOMER'*/) {
      return true;
    }
    return false;
  }

  canDeleteThisRow(user: User) {

    if (this.isCurrentUserAdmin && user.id != this.authenticatonService.currentSession?.currentUser?.id) {
      return true;
    }
    return false;
  }

  newUserClick() {
    this.userModalType = 'create';

    this.user = new User();
    let role = this.userRoles.filter(x => x.name == 'ROLE_MSP_USER').find(x => x);
    if(role){
      this.user.role = [role]
    } else {
      this.user.role = []
    }


    this.prepareRoleSelect(this.user);
    this.userModal.toggle();
  }

  clean() {

    this.user = new User();
  }

  isUpdateUser(user: User) {
    return Number(user.id) > 0;
  }

  editUserClick(user: User) {

    this.user = JSON.parse(JSON.stringify(user));

    this.prepareRoleSelect(user);

    this.passwordStrength = 0;

    this.userModal.toggle();
  }

  private prepareRoleSelect(user: User) {
    const role = this.userRoles.find(x => user.role.find(ur => ur.name === x.name));
    if (!this.userRoles.length)
      return
    if (role) {
      this.selectedRoleId = role.id;
    }

    this.userRolesForSelect = [];

    this.userRoles.forEach(elem => {
      const obj = {
        displayText: elem.description,
        value: elem.id
      } as RkSelectModel;

      if (this.selectedRoleId && elem.id === this.selectedRoleId) {
        obj.selected = true;
      }

      this.userRolesForSelect.push(obj);
    });
  }

  modalClosed($event) {

    if ($event.closed) {
      this.user = new User();
    }
  }

  roleChange($event) {

    const role = this.userRoles.find(x => x.id === $event);

    if (role) {

      this.user.role = [JSON.parse(JSON.stringify(role))];
    }
  }

  private emailValidator(value: string): boolean {
    if (!value) {
      return false;
    } else if (!value.match(/^((?!yopmail.com|boximail.com|eelmail.com|maildrop.cc|mailnesia.com|mintemail.com|mt2015.com|mt2014.com|thankyou2010.com|trash2009.com|mt2009.com|trashymail.com|mytrashmail.com|dispostable.com|trbvn.com|mailinator.com).)*$/)) {
      return false;
    } else {
      return validator.isEmail(value);
    }
  }
  //region ui methodes
  userFriendlyRoleName(role: Role[]) {
    if (role.find(r=>r.name === 'ROLE_CUSTOMER')) {
      return 'Admin';
    } else if (role.find(r => r.name === 'ROLE_USER')) {
      return 'User';
    } else {
      return 'Not Defined';
    }
  }

  save() {

    if (!this.user.name) {
      this.notification.warning(this.staticMessageService.pleaseFillName);
      return;
    }
    if (!this.user.username) {
      this.notification.warning(this.staticMessageService.pleaseEnterAValidEmail);
      return;
    }
    if (!this.emailValidator(this.user.username)) {
      this.notification.warning(this.staticMessageService.pleaseEnterAValidEmail);
      return;
    }

    var isHaveRole = false
    if (this.user.role.length) {
      for (let role of this.user.role) {
        if (role.name) {
          isHaveRole = true
          break
        }
      }
    }

    if (!this.user.role || !isHaveRole) {
      this.notification.warning(this.staticMessageService.pleaseSelectARole);
    }


    if (this.emailValidator(this.user.username)) {
      if (this.user.id > 0) {
        this.userService.update(this.user).subscribe(res => {

          this.userModal.toggle();

          this.notification.success(this.staticMessageService.savedUserMessage);

          this.userService.getUsers().subscribe(result => {

            this.users = result;
          });

        });
      } else {
        // if (!this.user.password) {
        //     this.notification.warning(this.staticMessageService.pleaseFillThePassword);
        //     return;
        // }
        // if (this.passwordStrength != 4) {
        //     this.notification.warning(this.staticMessageService.passwordComplexityMustBe);
        //     return;
        // }
        // if (this.passwordStrength > 3) {
        this.userService.save(this.user).subscribe(res => {
          if (res.key) {
            this.userModal.toggle();

            this.notification.success(this.staticMessageService.savedUserMessage);

            this.userService.getUsers().subscribe(result => this.users = result);
          } else {
            this.notification.error(res.message);
          }
        });
        // }
      }
    } else {
      this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);
    }
  }

  isActiveChanged($event: boolean) {
    this.user.isLocked = $event ? 0 : 1;
  }

  isLockedChanged($event: boolean) {
    this.user.isActive = $event ? 0 : 1;
  }
 //region uimsp methodes
  isHaveParent(): boolean {
    if (this.parentCompany && this.parentCompany.companyType == "MSP" && this.parentCompany.id > 0) {
      return true
    }
    return false
  }

  prepareParentRoleSelect() {
    const role = this.userRoles.find(x => x.name == this.currentCompany.parentRoleLevel)
    if (role){
      this.selectedMspRoleId = role.id
    }
    this.parentCompanyRolesForSelect = []
    for (let rol of this.userRoles) {
      const obj: RkSelectModel = {displayText: rol.description, value: rol.id}
      if (this.selectedMspRoleId && this.selectedMspRoleId === rol.id) {
        obj.selected = true
      }
      this.parentCompanyRolesForSelect.push(obj)
    }
  }
  getParentRoleLevel(role?: string): string {
    if (this.currentCompany) {
      if (this.currentCompany.parentRoleLevel === 'ROLE_CUSTOMER'){
        return 'Admin';
      } else if (this.currentCompany.parentRoleLevel === 'ROLE_USER') {
        return 'Read only';
      }
    }
    return 'Not Defined'
  }

  getRoleFriendly(role?: string) {
    if (role) {
      if (role === 'ROLE_CUSTOMER') {
        return 'Admin'
      } else if (role === 'ROLE_USER') {
        return 'Read only';
      }
    }
    return 'Role'
  }

  parentRoleChange($event) {
    const role = this.userRoles.find(x => x.id === $event)
    if (role) {
      this.companyUpdaterDto.parentRoleLevel = role.name
    }
  }

  isParentLock(): boolean {
    if (this.currentCompany) {
      return this.currentCompany.parentIsLocked > 0
    }
    return true
  }

  isParentLockedChanged($event: boolean) {
    this.parentIsLocked = $event
  }

  openParentSettings() {
    if (this.isHaveParent()) {
      this.companyUpdaterDto = new CompanyUpdaterDTO()
      this.companyUpdaterDto.id = this.currentCompany.id
      //this.companyUpdaterDto.parentId = this.parentCompany.id
      this.prepareParentRoleSelect()
      this.parentIsLocked = this.isParentLock()
      this.mspSettingModal.toggle()
    }
  }

  mspModalClosed($event) {
    if ($event.closed) {
      this.companyUpdaterDto = new CompanyUpdaterDTO()
    }
  }

  saveParentSettings() {
    let isChanged = false
    if (this.parentIsLocked != this.isParentLock()) {
      this.companyUpdaterDto.parentIsLocked = this.parentIsLocked ? 1 : 0
      isChanged = true
    }
    const role = this.userRoles.find(r=>r.id === this.selectedMspRoleId)
    if (role.name !== this.currentCompany.parentRoleLevel) {
      this.companyUpdaterDto.parentRoleLevel = role.name
      isChanged = true
    }
    if (!isChanged) {
      this.mspSettingModal.toggle()
      return
    }
    if (this.authenticatonService.currentSession.currentUser) {
      const cuser = this.authenticatonService.currentSession.currentUser
      this.companyUpdaterDto.audit = {userId: cuser.id, username: cuser.username}
    }
    this.saveParentCompany(this.companyUpdaterDto)
  }
  //endregion
  //endregion

  //region network methode

  deleteUser(user: User) {
    this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.selectedUserWillBeDeletedMessage}!`).subscribe(
      res => {
        if (res) {

          this.userService.delete(user).subscribe(res => {

            this.notification.success(this.staticMessageService.deletedSelectedUserMessage);
            this.userService.getUsers().subscribe(res => {
              this.users = res;
            });

          });
        }
      }
    );
  }

  loadCompanyAndParent() {
    if (this.authenticatonService.currentSession && this.authenticatonService.currentSession.currentUser
      && this.authenticatonService.currentSession.currentUser.companyId){
      this.companyService.getCompanyById(this.authenticatonService.currentSession.currentUser.companyId).subscribe(res => {
        this.currentCompany = res
        this.parentIsLocked = !!this.currentCompany.parentIsLocked
        if (res.parentId && Number(res.parentId)) {
          this.companyService.getCompanyById(res.parentId).subscribe(res => {
            this.parentCompany = res
          })
        }
      })
    }
  }

  saveParentCompany(dto: CompanyUpdaterDTO){
    this.companyService.updateCompanyWithParent(dto).subscribe(res=>{
      this.mspSettingModal.toggle()
      this.loadCompanyAndParent()
    })
  }
  //endregion
}
