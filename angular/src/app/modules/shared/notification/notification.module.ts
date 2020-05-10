import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './notification.component';
import { IconsModule } from 'roksit-lib';


@NgModule({
  imports: [
    CommonModule,
    IconsModule
  ],
  declarations: [NotificationComponent],
  exports: [NotificationComponent]
})
export class NotificationModule { }
