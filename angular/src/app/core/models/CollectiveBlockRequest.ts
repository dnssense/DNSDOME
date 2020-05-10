import { AgentResponse } from './AgentResponse';
import { CollectiveCategory } from './CollectiveCategory';

export class CollectiveBlockRequest {
    agent: AgentResponse;
    collectiveCategories: CollectiveCategory[];
}
