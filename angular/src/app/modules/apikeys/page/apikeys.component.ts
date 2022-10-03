import {Component, OnInit, ViewChild} from '@angular/core';
import {RkModalModel} from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import {RkSelectModel} from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import {RestRole, Role} from 'src/app/core/models/Role';
import {ApiKey, User} from 'src/app/core/models/User';
import {AuthenticationService} from 'src/app/core/services/authentication.service';
import {StaticMessageService} from 'src/app/core/services/staticMessageService';
import {UserService} from 'src/app/core/services/userService';
import * as validator from 'validator';
import {ClipboardService} from 'ngx-clipboard'
import { RkAlertService, RkNotificationService } from 'roksit-lib';

declare var $: any;

@Component({
  selector: 'app-apikeys',
  templateUrl: 'apikeys.component.html',
  styleUrls: ['apikeys.component.sass']
})
export class ApiKeysComponent implements OnInit {

  constructor(
    private notification: RkNotificationService,
    private userService: UserService,
    private staticMessageService: StaticMessageService,
    private authenticatonService: AuthenticationService,
    private alertService: RkAlertService,
    private clipboardSevice: ClipboardService
  ) {
    this.user = this.constructNewUser();

    this.userService.getUsers(true).subscribe(res => {
      this.users = res;
    });

    this.userRoles = this.userService.getRoles(true);

    this.userRoles.forEach(elem => {
      this.userRolesForSelect.push({
        displayText: elem.description,
        value: elem.id
      });
    });
  }

  constructNewUser() {
    const user = new User();
    user.apikey = {who: '', description: ''} as ApiKey;
    let role = new Role();
    role.id = 7;
    role.name = 'ROLE_APIADMIN';
    user.role = [role]
    return user;
  }

  @ViewChild('userModal') userModal: RkModalModel;
  userModalType: 'create' | 'edit';

  user: User;


  users: User[] = [];

  userRoles: Role[] = [];
  userRolesForSelect: RkSelectModel[] = [];

  passwordStrength = 0;

  searchKey: string;

  selectedRoleId;

  isActive: boolean;

  ngOnInit() {

  }

  userFriendlyRoleName(roleList: RestRole[]) {
    if (!roleList || !roleList.length) {
      return 'Not Defined';
    }
       
    if (roleList.find(r => r.name === 'ROLE_APIADMIN')) {
      return 'Admin';
    } else if (roleList.find(r => r.name === 'ROLE_API')) {
      return 'User';
    } else if (roleList.find(r => r.name === 'ROLE_INTEGRATION')) {
      return 'Integration';
    } else if (roleList.find(r => r.name === 'ROLE_REPUTATION')) {
      return 'Reputation';
    } else {
      return 'Not Defined';
    }
  }


  get isCurrentUserAdmin() {
    const role = this.authenticatonService.currentSession?.currentUser?.role;
    if (role && role.find(r => r.name == 'ROLE_CUSTOMER')) {
      return true
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

    this.user = this.constructNewUser();
    this.prepareRoleSelect(this.user);
    this.userModal.toggle();
  }

  clean() {

    this.user = new User();
    this.user.apikey = {who: '', description: ''} as ApiKey;
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

    this.selectedRoleId = role?.id || 8;

    this.userRolesForSelect = [];

    this.userRoles.forEach(elem => {
      const obj = {
        displayText: elem.description,
        value: elem.id
      } as RkSelectModel;

      if (elem.id === role?.id) {
        obj.selected = true;
      }

      this.userRolesForSelect.push(obj);
    });
  }

  modalClosed($event) {

    if ($event.closed) {

      this.user = new User();
      this.user.apikey = {who: '', description: ''} as ApiKey;
    }
  }

  roleChange($event) {

    const role = this.userRoles.find(x => x.id === $event);

    if (role) {

      this.user.role = [JSON.parse(JSON.stringify(role))];
    }
  }


  save() {

    if (!this.user.apikey.who) {
      this.notification.warning(this.staticMessageService.pleaseFillName);
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

    if (!isHaveRole) {
      this.notification.warning(this.staticMessageService.pleaseSelectARole);
    }


    if (this.user.id > 0) {
      this.userService.update(this.user).subscribe(res => {

        this.userModal.toggle();

        this.notification.success(this.staticMessageService.savedApiKeyMessage);

        this.userService.getUsers(true).subscribe(result => {

          this.users = result;
        });

      });
    } else {


      this.userService.save(this.user).subscribe(res => {
        if (res.key) {
          this.userModal.toggle();

          this.notification.success(this.staticMessageService.savedApiKeyMessage);

          this.userService.getUsers(true).subscribe(result => this.users = result);
        } else {
          this.notification.error(res.message);
        }
      });

    }

  }

  isActiveChanged($event: boolean) {
    this.user.isLocked = $event ? 0 : 1;
  }

  isLockedChanged($event: boolean) {
    this.user.isActive = $event ? 0 : 1;
  }

  copyToClipBoard(input: string) {
    this.clipboardSevice.copy(input);
  }

  copyApiKey(key: string) {
    this.copyToClipBoard(key);
    this.notification.info(this.staticMessageService.apikeyCopiedToClipboardMessage);
  }


  deleteUser(user: User) {
    this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.selectedApiKeyWillBeDeletedMessage}!`).subscribe(
      res => {
        if (res) {

          this.userService.delete(user).subscribe(res => {

            this.notification.success(this.staticMessageService.deletedSelectedApiKeyMessage);
            this.userService.getUsers(true).subscribe(res => {
              this.users = res;
            });

          });
        }
      }
    );
  }
}
