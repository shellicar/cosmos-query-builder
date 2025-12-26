import { createCosmosQueryBuilder } from './public/createCosmosQueryBuilder';
import { SortDirection } from './public/enums';
import { type ICosmosQueryBuilder, ILogger } from './public/interfaces';
import type { BasicOpCode, CosmosQueryBuilderOptions, ExtendedOpCode, FetchResult, InstantFilter, StringFilter, UUIDFilter } from './public/types';

export type { CosmosQueryBuilderOptions, FetchResult, ExtendedOpCode as OpCode, BasicOpCode, StringFilter, UUIDFilter, InstantFilter, ICosmosQueryBuilder };
export { ILogger, SortDirection, createCosmosQueryBuilder };
