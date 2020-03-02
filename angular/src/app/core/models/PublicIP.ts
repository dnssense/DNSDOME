import { DomainProfile } from './DomainProfile';
import { User } from './User';
import { ApplicationProfile } from './ApplicationProfile';
import { BWList } from './BWList';
import { WAgentIpGroup } from './WAgentIpGroup';

export class PublicIP {
  public id = -1;
  public agentAlias = '';
  public user: User;
  public agentIpGroups: WAgentIpGroup[] = [];
  public profile: DomainProfile;
  public bwList: BWList;
  public appUserProfile: ApplicationProfile;
  public logo: any;
  public blockMessage = '';
  public blockip: number[] = [];
  public ips: Array<string[]> = [];
  public etvUser = false;

  public constructor() {

  }
}
