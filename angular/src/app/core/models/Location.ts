import { DomainProfile } from './DomainProfile';
import { User } from './User';
import { WAgentIpGroup } from './WAgentIpGroup';
import { ApplicationProfile } from './ApplicationProfile';
import { BWList } from './BWList';

export class Location {
  public id: number = -1;
  public agentAlias: string = '';
  public user: User;
  public profile: DomainProfile;
  public bwList: BWList;
  // simdilik kullanilmiyor
  public agentIpGroups: WAgentIpGroup[] = [];
  public appUserProfile: ApplicationProfile;
  public logo: string = '';
  public blockMessage: string = '';
  public blockip: number[] = [];
  public etvUser: boolean = false;

  public constructor() {}
}
