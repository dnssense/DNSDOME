import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { CategoryV2 } from '../models/CategoryV2';
import { ApplicationV2 } from '../models/ApplicationV2';
import { TranslatorService } from './translator.service';

@Injectable({
  providedIn: 'root'
})
export class StaticMessageService {





  constructor(private translator: TranslatorService) {


  }
  savedDeviceMessage(): string {
    return this.translator.translate('DeviceSaved');
  }
  savedDevicesMessage(): string {
    return this.translator.translate('DevicesSaved');
  }
  deletedDeviceMessage(): string {
    return this.translator.translate('DeviceDeleted');
  }
  deletedDevicesMessage(): string {
    return this.translator.translate('DevicesDeleted');
  }
  deletedProfileMessage(): string {
    return this.translator.translate('ProfileDeleted');
  }
  savedProfileMessage(): string {
    return this.translator.translate('ProfileSaved');
  }

  savedAgentLocationMessage(): string {
    return this.translator.translate('AgentLocationSaved');
  }
  deletedAgentLocationMessage(): string {
    return this.translator.translate('AgentLocationDeleted');
  }

  savedAgentRoaminClientMessage(): string {
    return this.translator.translate('AgentRoamingClientSaved');
  }
  savedAgentBoxMessage(): string {
    return this.translator.translate('AgentBoxSaved');
  }
  deletedAgentBoxMessage(): string {
    return this.translator.translate('AgentBoxDeleted');
  }

  needsToSelectSecurityProfileMessage(): string {
    return this.translator.translate('SelectASecurityProfile');
  }
  needsGroupNameMessage(): string {
    return this.translator.translate('FillGroupNameWithAValue');
  }

  needsToSelectAGroupMemberMessage(): string {
    return this.translator.translate('SelectAGroupMember');
  }

  needsToFillInRequiredFields(): string {
    return this.translator.translate(`PleaseFillInRequirementFields`);
}





}
