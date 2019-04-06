import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from 'src/app/core/services/validation.service';
import { User, UserExtended } from 'src/app/core/models/User';
import { AlertService } from 'src/app/core/services/alert.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/UserService';
import { Role } from 'src/app/core/models/Role';

declare var $: any;
@Component({
    selector: 'app-users',
    templateUrl: 'users.component.html',
    styleUrls: ['users.component.sass']
})
export class UsersComponent implements OnInit {
    userForm: FormGroup;
    userList: User[] = [];
    selectedUser: UserExtended = new UserExtended();
    roleList: Role[] = [];

    constructor(private formBuilder: FormBuilder, private notification: NotificationService,
        private alert: AlertService, private userService: UserService) {

        this.selectedUser.roles = new Role();
        this.userService.getUsers().subscribe(res => this.userList = res);

        this.userService.getRoles().subscribe(res => {
            this.roleList = [];
            res.forEach(r => {
                if (r.id != 6) {
                    this.roleList.push(r);
                }
            });
        });

    }

    ngOnInit() {
        this.userForm =
            this.formBuilder.group({
                "name": ["", [Validators.required, Validators.minLength(2)]],
                "surname": ["", [Validators.required, Validators.minLength(2)]],
                "email": ["", [Validators.required, ValidationService.emailValidator]],
                "role": ["", [Validators.required]],
                "password": ["", [Validators.required]],
                "passwordAgain": ["", [Validators.required]],
            }, { validator: Validators.compose([ValidationService.matchingPasswords("password", "passwordAgain")]) }
            );
    }

    showNewWizard() {
        this.selectedUser = new UserExtended();
        this.selectedUser.roles = new Role();

        $('#listPanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);

    }

    showEditWizard(id: Number) {
        this.selectedUser = this.userList.find(r => r.id == id) as UserExtended;

        $('#listPanel').toggle("slide", { direction: "left" }, 500);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 500);

    }

    hideWizard() {
        this.alert.alertWarningAndCancel('Are You Sure?', 'Your Changes will be cancelled!').subscribe(
            res => {
                this.userService.getUsers().subscribe(ul => this.userList = ul);
                if (res) {
                    $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
                    $('#listPanel').toggle("slide", { direction: "left" }, 600);
                }
            }
        );
    }

    changeLockStatus() {
        this.selectedUser.locked = this.selectedUser.locked === true ? false : true;
    }

    changeActiveStatus() {
        this.selectedUser.active = this.selectedUser.active === true ? false : true;
    }

    changeLockedStatusOnRow(id: number) {
        if (id) {
            let user = this.userList.find(u => u.id == id);
            user.locked = user.locked === true ? false : true;
            this.userService.save(user).subscribe(res => {
                if (res.status == 200) {
                    this.userService.getUsers().subscribe(res => this.userList = res);
                    this.notification.success(res.message);
                } else {
                    this.notification.error(res.message);
                }
            });
        }
    }

    changeActiveStatusOnRow(id: number) {
        if (id) {
            let user = this.userList.find(u => u.id == id);
            user.active = user.active === true ? false : true;
            this.userService.save(user).subscribe(res => {
                if (res.status == 200) {
                    this.userService.getUsers().subscribe(res => this.userList = res);
                    this.notification.success(res.message);
                } else {
                    this.notification.error(res.message);
                }
            });
        }
    }

    userFormSubmit() {

        if (!this.selectedUser.locked) {
            this.selectedUser.locked = false;
        }

        if (!this.selectedUser.active) {
            this.selectedUser.active = false;
        }

        if (this.userForm.dirty && this.userForm.valid && this.selectedUser) {
            this.userService.save(this.selectedUser).subscribe(res => {
                if (res.status == 200) {
                    this.hideWizard();
                    this.notification.success(res.message);
                } else {
                    this.notification.error(res.message);
                }
            });
        } else {
            return;
        }
    }

    deleteUser(id: number) {
        if (id) {
            this.alert.alertWarningAndCancel('Are You Sure?', 'Selected User will be deleted!').subscribe(
                res => {
                    if (res) {
                        this.userService.delete(this.userList.find(u => u.id == id)).subscribe(res => {
                            this.userService.getUsers().subscribe(us => this.userList = us);
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
    }


}
