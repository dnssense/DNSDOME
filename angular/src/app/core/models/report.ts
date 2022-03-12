export interface GraphDto {
  datestr: string
  timestemp: number
  hit: number
}

export interface Aggregation {
  name: string;
  hit: number;
}

export interface LiveReportRequest {
  group?: string | undefined | null
  category?: string | undefined | null
  domain?: string | undefined | null
}

export interface LiveReportResponse {
  hitstotal: number
  domains: {items: Aggregation[]}
  cats: {items: Aggregation[]}
  groups: {items: Aggregation[]}
  graphs: {items: GraphDto[]}
  actions: {allow: number, block: number}
}
