import type { JSONValue, PatchRequestBody, SqlQuerySpec } from '@azure/cosmos';
import type { ExtractPatchPathExpressions, ExtractPathExpressions, PatchPathValue, PathValue } from '../private/types';
import type { SortDirection } from './enums';
import type { BasicOpCode, Container, ExtendedOpCode, FetchResult, InstantFilter, StringFilter, UUIDFilter } from './types';

export abstract class ILogger {
  public abstract debug(message?: any, ...optionalParams: any[]): void;
  public abstract info(message?: any, ...optionalParams: any[]): void;
  public abstract error(message?: any, ...optionalParams: any[]): void;
  public abstract warn(message?: any, ...optionalParams: any[]): void;
  public abstract verbose(message?: any, ...optionalParams: any[]): void;
}

export abstract class ICosmosQueryBuilder<T extends Record<string, any>> {
  /**
   * Sets the maximum number of items to return
   * @param limit Maximum number of items
   * @example
   * ```typescript
   * builder.limit(100);
   * ```
   */
  public abstract limit(limit: number): void;

  /**
   * Adds a JOIN clause to the query
   * @param value JOIN alias
   * @param statement Field path to join on
   * @example
   * ```typescript
   * builder.join('b', 'bones');
   * ```
   */
  public abstract join<P extends ExtractPathExpressions<T>>(value: string, statement: P): void;

  /**
   * Sets the SELECT clause for the query
   * @param value SELECT clause string
   * @example
   * ```typescript
   * builder.select('COUNT(1) as count, UPPER(c.name.givenName) as name');
   * ```
   */
  public abstract select(value: string): void;

  /**
   * Sets the GROUP BY clause for the query
   * @param value GROUP BY expression
   * @example
   * ```typescript
   * builder.groupBy('UPPER(c.sex)');
   * ```
   */
  public abstract groupBy(value: string): void;

  /**
   * Performs fuzzy search across multiple fields
   * @param value Search term
   * @param fields Array of field paths to search in
   * @example
   * ```typescript
   * builder.whereFuzzy('steve', ['name.givenName', 'name.familyName', 'email']);
   * ```
   */
  public abstract whereFuzzy<P extends ExtractPathExpressions<T>>(value: string, fields: [P, ...P[]]): void;

  /**
   * Adds a raw WHERE clause with field, operator, and value
   * @param field Field name as string
   * @param operator SQL operator (excluding isNull, contains, in)
   * @param value Value to compare against
   * @example
   * ```typescript
   * builder.whereRaw('p.id', 'eq', 'some-id');
   * ```
   */
  public abstract whereRaw(field: string, operator: Exclude<ExtendedOpCode, 'isNull' | 'contains' | 'in'>, value: JSONValue): void;

  /**
   * Adds an OR clause to match items satisfying any of the given conditions
   * @param conditions Array of field/operator/value conditions
   * @example
   * ```typescript
   * builder.whereOr([
   *   { field: 'name.givenName', operator: 'eq', value: 'John' },
   *   { field: 'name.familyName', operator: 'eq', value: 'Smith' }
   * ]);
   * ```
   */
  public abstract whereOr(conditions: Array<{ field: string; operator: ExtendedOpCode; value: JSONValue }>): void;

  /**
   * Creates a JSON patch document for Cosmos DB patch operations
   * @param operations Array of patch operations (set, add, replace, remove)
   * @returns Patch request body for Cosmos DB
   * @example
   * ```typescript
   * const operations = builder.patch({
   *   op: 'replace',
   *   path: '/name/givenName',
   *   value: 'Smith',
   * });
   * const item = container.item('id', 'partitionKey');
   * await item.patch<Person>(operations);
   * ```
   */
  public abstract patch<P extends ExtractPatchPathExpressions<T>>(...operations: Array<{ path: P; op: 'set' | 'add' | 'replace'; value: PatchPathValue<T, P> } | { path: P; op: 'remove' }>): PatchRequestBody;

  /**
   * Builds query conditions from a structured object with type filters
   * Supports {@link StringFilter}, {@link UUIDFilter}, and {@link InstantFilter} types
   * @param query Query object with nested field filters containing __typeInfo
   * @param prefix Path prefix for nested queries (defaults to 'c')
   * @example
   * ```typescript
   * type PersonFilter = {
   *   name?: {
   *     givenName?: StringFilter;
   *   };
   * };
   * const filter = {
   *   name: {
   *     givenName: { __typeInfo: 'StringFilter', eq: 'John' }
   *   },
   * } satisfies PersonFilter;
   * builder.buildQuery(filter);
   * ```
   */
  public abstract buildQuery(query: Record<string, any> | undefined | null, prefix?: string): void;

  /**
   * Adds a WHERE clause with type-safe field access and operators
   * @param field Type-safe field path
   * @param operator SQL operator
   * @example
   * ```typescript
   * builder.where('name.givenName', 'eq', 'John');
   * builder.where('age', 'gt', 18);
   * builder.where('bones', 'contains', 'arm');
   * builder.where('name.givenName', 'in', ['John', 'Jane']);
   * builder.where('deletedAt', 'isNull');
   * ```
   */
  public abstract where<P extends ExtractPathExpressions<T>>(field: P, operator: 'isNull'): void;
  public abstract where<P extends ExtractPathExpressions<T>>(field: P, operator: 'in', value: readonly PathValue<T, P>[]): void;
  public abstract where<P extends ExtractPathExpressions<T>>(field: P, operator: 'contains', value: PathValue<T, P>[number]): void;
  public abstract where<P extends ExtractPathExpressions<T>, V extends PathValue<T, P>>(field: P, operator: BasicOpCode, value: V): void;

  /**
   * Clears any existing ordering
   */
  public abstract orderBy(): void;

  /**
   * Sets ordering by field and direction
   * @param field Field path to order by
   * @param direction Sort direction (ASC/DESC)
   */
  public abstract orderBy<P extends ExtractPathExpressions<T>>(field: P, direction: SortDirection): void;

  /**
   * Builds and returns the final SQL query specification
   * @returns SQL query specification with parameters
   */
  public abstract query(): SqlQuerySpec;

  /**
   * Executes the query and returns the first result
   * @param container Cosmos DB container to query
   * @returns First matching item or null
   */
  public abstract getOne<TSelect = T>(container: Container): Promise<TSelect | null>;

  /**
   * Executes the query and returns paginated results with total count
   * @param container Cosmos DB container to query
   * @param limit Maximum number of items per page
   * @param cursor Continuation token for pagination
   * @returns Paginated results with metadata
   */
  public abstract getAll<TSelect = T>(container: Container, limit?: number | null | undefined, cursor?: string | null | undefined): Promise<FetchResult<TSelect>>;
}
