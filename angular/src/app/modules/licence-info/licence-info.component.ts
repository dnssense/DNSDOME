import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LicenceComponent} from 'roksit-lib';

@Component({
  selector: 'app-licence-info',
  standalone: true,
  imports: [CommonModule, LicenceComponent],
  templateUrl: './licence-info.component.html',
  styleUrls: ['./licence-info.component.sass']
})
export default class LicenceInfoComponent {

}
