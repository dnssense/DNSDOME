import { Injectable } from '@angular/core';

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
  get savedApiKeyMessage(): string {
    return this.translator.translate(`ApiKeySaved`);
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

  get selectedDomainsWillBeDeletedMessage(): string {
    return this.translator.translate(`SelectedDomainsWillBeDeleted`);
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

  get thisSecurityProfileIsUsingByDefaultRoamingSettingsMessage(): string {
    return this.translator.translate(`ThisSecurityProfileIsUsingByDefaultRoamingSettingsMessage`);
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
  get youReachedMaxIpsCountMessage(): string {
    return this.translator.translate(`YouReachedMaxIpsCount`);
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
  get couldNotCreateMagicLinkMessage(): string {
    return this.translator.translate(`CouldNotCreateMagicLink`);
  }

  get magicLinkCopiedToClipboardMessage(): string {
    return this.translator.translate(`MagicLinkCopiedToClipboard`);
  }

  get apikeyCopiedToClipboardMessage(): string {
    return this.translator.translate(`ApiKeyCopiedToClipboard`);
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
  get dashboardNoDataFoundMessage(): string {
    return this.translator.translate('DASHBOARD.DataNotFound');

  }

  get notEditableSystemProfile(): string {
    return this.translator.translate('SystemSecurityProfileCannotUpdate');
  }

  get pleaseFillTheFullName(): string {
    return this.translator.translate('PleaseFillTheFullName');
  }
  get pleaseFillRequirementFields(): string {
    return this.translator.translate('PleaseFillRequirementFields');
  }

  get pleaseFillThePhoneNumber(): string {
    return this.translator.translate('PleaseFillThePhoneNumber');
  }

  get pleaseFillTheGsmCode(): string {
    return this.translator.translate('PleaseFillTheGsmCode');
  }
  get pleaseFillTheCompanyName(): string {
    return this.translator.translate('PleaseFillTheCompanyName');
  }
  get pleaseFillTheCompanyIndustry(): string {
    return this.translator.translate('PleaseFillTheCompanyIndustry');
  }
  get pleaseFillTheCompanyWebSite(): string {
    return this.translator.translate('PleaseFillTheCompanyWebSite');
  }
  get pleaseFillTheCompanyPersonnelCount(): string {
    return this.translator.translate('PleaseFillTheCompanyPersonnelCount');
  }

  get pleaseFillTheCurrentPassword(): string {
    return this.translator.translate('PleaseFillTheCurrentPassword');
  }

  get pleaseFillTheNewPassword(): string {
    return this.translator.translate('PleaseFillTheNewPassword');
  }

  get pleaseFillTheNewPasswordAgain(): string {
    return this.translator.translate('PleaseFillTheNewPasswordAgain');
  }

  get newPasswordAndConfirmedPasswordAreNotSame(): string {
    return this.translator.translate('NewPasswordAndConfirmedPasswordAreNotSame');
  }

  get passwordComplexityMustBe(): string {
    return this.translator.translate('PasswordComplexityMustBe');
  }

  get pleaseFillName(): string {
    return this.translator.translate('PleaseFillName');
  }

  get pleaseFillFirstName(): string {
    return this.translator.translate('PleaseFillFirstName');
  }

  get pleaseFillLastName(): string {
    return this.translator.translate('PleaseFillLastName');
  }

  get pleaseEnterAValidEmail(): string {
    return this.translator.translate('PleaseEnterAValidEmail');
  }

  get pleaseFillThePassword(): string {
    return this.translator.translate('PleaseFillThePassword');
  }

  get pleaseFillThePasswordAgain(): string {
    return this.translator.translate('PleaseFillThePasswordAgain');
  }
  get passwordAndConfirmedPasswordAreNotSame(): string {
    return this.translator.translate('PasswordAndConfirmedPasswordAreNotSame');
  }

  get captchaIsNotValid(): string {
    return this.translator.translate('CaptchaIsNotValid');
  }
  get pleaseSelectARole(): string {
    return this.translator.translate('PleaseSelectARole');
  }

  get passwordResetLinkSendedPleaseCheckYourEmail(): string {
    return this.translator.translate('PasswordResetLinkSendedPleaseCheckYourEmail');
  }

  get profileCannotFind(): string {
    return this.translator.translate('ProfileCannotFind');
  }

  get pleaseEnterValidIp(): string {
    return this.translator.translate('PleaseEnterValidIp');
  }

  get pleaseEnterValidIpAndMask(): string {
    return this.translator.translate('PleaseEnterValidIpAndMask');
  }

  get savedAgentConfMessage(): string {
    return this.translator.translate('AgentConfSaved');
  }

  get agentsGlobalConfSaved(): string {
    return this.translator.translate('AgentsGlobalConfSaved');
  }
  get deletedSelectedUserMessage() {
    return this.translator.translate('DeletedSelectedUserMessage');
  }
  get selectedUserWillBeDeletedMessage() {
    return this.translator.translate('SelectedUserWillBeDeletedMessage');
  }
  get deletedSelectedApiKeyMessage() {
    return this.translator.translate('DeletedSelectedApiKeyMessage');
  }
  get selectedApiKeyWillBeDeletedMessage() {
    return this.translator.translate('SelectedApiKeyWillBeDeletedMessage');
  }

  get reportWillBeDeleted(): string {
    return this.translator.translate('ReportWillBeDeleted');
  }

  get reportDeleted(): string {
    return this.translator.translate('ReportDeleted');
  }

  get filterIncludesInvalidChar(): string {
    return this.translator.translate('FilterIncludesInvalidChar');
  }

  get pleaseSelectAtLeastOneItem(): string {
    return this.translator.translate('PleaseSelectAtLeastOneItem');
  }
  get pleaseEnterSomeDomains(): string {
    return this.translator.translate('PleaseEnterSomeDomains');
  }

  get domainCopiedToClipboardMessage(): string {
    return this.translator.translate('DomainCopiedToClipboard');
  }

  get ruleSaved(): string {
    return this.translator.translate('RuleSaved');
  }

  get ruleDeleted(): string {
    return this.translator.translate('RuleDeleted');
  }

  get deleteRule(): string {
    return this.translator.translate('DeleteRule');
  }

  get fillRuleKeyword(): string {
    return this.translator.translate('FillRuleKeyword');
  }

  get fillRuleBy(): string {
    return this.translator.translate('FillRuleBy');
  }
}
