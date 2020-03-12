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
  get savedDeviceMessage(): string {
    return this.translator.translate('DeviceSaved');
  }
  get savedDevicesMessage(): string {
    return this.translator.translate('DevicesSaved');
  }
  get deletedDeviceMessage(): string {
    return this.translator.translate('DeviceDeleted');
  }
  get deletedDevicesMessage(): string {
    return this.translator.translate('DevicesDeleted');
  }
  get deletedProfileMessage(): string {
    return this.translator.translate('ProfileDeleted');
  }
  get savedProfileMessage(): string {
    return this.translator.translate('ProfileSaved');
  }

  get savedAgentLocationMessage(): string {
    return this.translator.translate('AgentLocationSaved');
  }
  get deletedAgentLocationMessage(): string {
    return this.translator.translate('AgentLocationDeleted');
  }

  get savedAgentRoaminClientMessage(): string {
    return this.translator.translate('AgentRoamingClientSaved');
  }
  get savedAgentBoxMessage(): string {
    return this.translator.translate('AgentBoxSaved');
  }
  get deletedAgentBoxMessage(): string {
    return this.translator.translate('AgentBoxDeleted');
  }

  get needsToSelectSecurityProfileMessage(): string {
    return this.translator.translate('SelectASecurityProfile');
  }
  get needsGroupNameMessage(): string {
    return this.translator.translate('FillGroupNameWithAValue');
  }

  get needsToSelectAGroupMemberMessage(): string {
    return this.translator.translate('SelectAGroupMember');
  }

  get needsToFillInRequiredFieldsMessage(): string {
    return this.translator.translate(`PleaseFillInRequirementFields`);
}

get savedUserMessage(): string {
  return this.translator.translate(`UserSaved`);
}

  get areYouSureMessage(): string {
    return this.translator.translate(`AreYouSure`);
  }

  get settingsForThisGroupWillBeDeletedMessage(): string {
    return this.translator.translate(`SettingsForThisGroupWillBeDeleted`);
  }

  get agentOfThisBoxWillBeDeletedMessage(): string {
    return this.translator.translate(`AgentOfThisBoxWillBeDeleted`);
  }
  get deletedAgentRoamingClientMessage(): string {
    return this.translator.translate(`AgentRoamingClientDeleted`);
  }
  get willDeleteAgentRoamingClientMessage(): string {
    return this.translator.translate(`AgentRoamingClientWillBeDeleted`);
  }

  get settingsForThisDeviceWillBeDeletedMessage(): string {
    return this.translator.translate(`SettingsForThisDeviceWillBeDeleted`);
  }

  get yourChangesWillBeCanceledMessage(): string {
    return this.translator.translate(`YourChangesWillBeCanceled`);
  }

  get selectedPublicIpAndItsSettingsWillBeDeletedMessage(): string {
    return this.translator.translate(`SelectedPublicIpAndItsSettingsWillBeDeleted`);
  }

  get pleaseEnterAValidPublicIpAddressMessage(): string {
    return this.translator.translate(`PleaseEnterAValiePublicIpAddress`);
  }

  get thisDomainAllreadyExitsInWhiteListMessage(): string {
    return this.translator.translate(`ThisDomainAllreadyExitsInWhiteList`);
  }

  get thisDomainAllreadyExitsInBlackListMessage(): string {
    return this.translator.translate(`ThisDomainAllreadyExitsInBlackList`);
  }

  get agentsUsingThisProfileMessage(): string {
    return this.translator.translate(`AgentsUsingThisProfile`);
  }

  get profileConfigurationWillChangeForAllOfRelatedAgentsMessage(): string {
    return this.translator.translate(`ProfileConfigurationWillChangeForAllOfRelatedAgents`);
  }
  get profileConfigurationWillChangeMessage(): string {
    return this.translator.translate(`ProfileConfigurationWillChange`);
  }

  get canNotDeleteMessage(): string {
    return this.translator.translate(`CanNotDelete`);
  }

  get thisSecurityProfileIsUsingBySomeAgentsMessage(): string {
    return this.translator.translate(`ThisSecurityProfileIsUsingBySomeAgents`);
  }

  get itWillBeDeletedMessage(): string {
    return this.translator.translate(`ItWillBeDeleted`);
  }

  get profileNotFoundMessage(): string {
    return this.translator.translate(`ProfileNotFound`);
  }

  get youReachedMaxDomainsCountMessage(): string {
    return this.translator.translate(`YouReachedMaxDomainsCount`);
  }

  get enterValidDomainMessage(): string {
    return this.translator.translate(`EnterValidDomain`);
  }

  get couldNotCreateDownloadLinkMessage(): string {
    return this.translator.translate(`CouldNotCreateDownloadLink`);
  }

  get downloadLinkCopiedToClipboardMessage(): string {
    return this.translator.translate(`DownloadLinkCopiedToClipboard`);
  }

  get changesCouldNotSavedMessage(): string {
    return this.translator.translate(`ChangesCouldNotSaved`);
  }

  get groupWillBeDeletedMessage(): string {
    return this.translator.translate(`GroupWillBeDeleted`);
  }

  get groupDeletedMessage(): string {
    return this.translator.translate(`GroupDeleted`);
  }

  get pleaseChangeSomethingMessage(): string {
    return this.translator.translate(`PleaseChangeSomething`);
  }

  get categoryRequestSuccessfullySendedMessage(): string {
    return this.translator.translate('CategoryRequestSuccessfullySended');
  }

  get nameUpdatedMessage(): string {
    return this.translator.translate('ACCOUNTSETTINGS.NameUpdated');
  }
  get companyInformationUpdatedMessage(): string {
    return this.translator.translate('ACCOUNTSETTINGS.CompanyInformationUpdated');
  }
  get enterRequiredFieldsMessage(): string {
    return this.translator.translate('ACCOUNTSETTINGS.EnterRequiredFields');
  }
  get twoFactorAuthenticationMessage(): string {
    return this.translator.translate('ACCOUNTSETTINGS.TwoFactorAuthentication');
  }
  get userGSMIsMissingMessage(): string {
    return this.translator.translate('ACCOUNTSETTINGS.UserGSMIsMissing');
  }
  get pleaseEnterSmsCodeMessage(): string {
    return this.translator.translate('ACCOUNTSETTINGS.PleaseEnterSmsCode');
  }
  get phoneNumberUpdatedMessage(): string {
    return this.translator.translate('ACCOUNTSETTINGS.PhoneNumberUpdated');
  }
  get exceededTheNumberOfAttemptsMessage(): string {
    return this.translator.translate('ACCOUNTSETTINGS.ExceededTheNumberOfAttempts');
  }
  get confirmationTimeIsUpMessage(): string {
    return this.translator.translate('ACCOUNTSETTINGS.ConfirmationTimeIsUp');
  }

  get passwordChangedMessage(): string {
    return this.translator.translate('ACCOUNTSETTINGS.PasswordChanged');
  }









}
