import { CosmosQueryBuilder } from '../private/CosmosQueryBuilder';
import type { CosmosQueryBuilderOptions } from './types';

export function createCosmosQueryBuilder<T extends Record<string, any>>(options?: CosmosQueryBuilderOptions): CosmosQueryBuilder<T> {
  return new CosmosQueryBuilder<T>(options);
}
