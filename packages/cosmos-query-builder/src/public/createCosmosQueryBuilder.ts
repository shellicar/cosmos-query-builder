import { CosmosQueryBuilder } from '../private/CosmosQueryBuilder';
import type { ICosmosQueryBuilder } from './interfaces';
import type { CosmosQueryBuilderOptions } from './types';

export function createCosmosQueryBuilder<T extends Record<string, any>>(options?: CosmosQueryBuilderOptions): ICosmosQueryBuilder<T> {
  return new CosmosQueryBuilder<T>(options);
}
