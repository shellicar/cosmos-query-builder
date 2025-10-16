import type { ILogger } from './interfaces';

export type UUIDFilter = {
  __typeInfo: 'UUIDFilter';
  eq?: string;
  ne?: string;
};

export type InstantFilter = {
  __typeInfo: 'InstantFilter';
  eq?: string;
  ieq?: string;
  in?: string;
  ine?: string;
  like?: string;
  ne?: string;
};

export type StringFilter = {
  __typeInfo: 'StringFilter';
  eq?: string;
  ieq?: string;
  in?: string;
  ine?: string;
  like?: string;
  ne?: string;
};

export type TypeInfo = {
  __typename: string;
  [key: string]: TypeInfo | string;
};

export type ExtendedOpCode = BasicOpCode | 'contains' | 'in' | 'isNull';
export type BasicOpCode = 'eq' | 'gt' | 'lt' | 'ge' | 'le' | 'ne';

export type FetchResult<T> = {
  items: T[];
  continuationToken: string;
  hasMoreResults: boolean;
  totalCount: number;
  count: number;
};

export type CosmosQueryBuilderOptions = {
  /**
   * Custom implementation for logger.
   * @defaultValue undefined (no logging)
   */
  logger?: ILogger;
};
