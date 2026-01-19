import type { JSONValue, PatchRequestBody, SqlParameter, SqlQuerySpec } from '@azure/cosmos';
import type { SortDirection } from '../public/enums';
import { ICosmosQueryBuilder, type ILogger } from '../public/interfaces';
import type { BasicOpCode, Container, CosmosQueryBuilderOptions, ExtendedOpCode, FeedResponse, FetchResult, InstantFilter, StringFilter, UUIDFilter } from '../public/types';
import { operators } from './consts';
import { DefaultLogger } from './DefaultLogger';
import type { ExtractPatchPathExpressions, ExtractPathExpressions, PatchPathValue, PathValue, StringFilterData } from './types';

export class CosmosQueryBuilder<T extends Record<string, any>> extends ICosmosQueryBuilder<T> {
  // TODO: Allow setting
  private _indent = '  ';
  private _orderBy: string[] = [];
  private _select = '*';
  private _groupBy: string[] = [];
  private _join = '';
  private _from = 'c';
  private _queries: string[] = [];
  private _parameters: SqlParameter[] = [];
  private _limit: number | undefined;
  private _logger: ILogger;

  public constructor(options?: CosmosQueryBuilderOptions) {
    super();
    this._logger = options?.logger ?? new DefaultLogger();
  }

  public get queries(): string[] {
    return this._queries;
  }

  public set queries(value: string[]) {
    this._queries = value;
  }

  public get parameters(): SqlParameter[] {
    return this._parameters;
  }

  public set parameters(value: SqlParameter[]) {
    this._parameters = value;
  }

  private handleStringFilter(prefix: string, value: StringFilter) {
    return this.handleFilterObject(prefix, value);
  }

  private handleUuidFilter(prefix: string, value: UUIDFilter) {
    return this.handleFilterObject(prefix, value);
  }

  private handleInstantFilter(prefix: string, value: InstantFilter) {
    return this.handleFilterObject(prefix, value);
  }

  private handleFilterObject(prefix: string, value: StringFilterData & { __typeInfo: string }) {
    const { __typeInfo, ...rest } = value;
    for (const [key, value2] of Object.entries(rest).filter((x) => x[1] !== undefined)) {
      const path = prefix;
      const parameterName = `@p${this._parameters.length}`;
      const operator = operators[key];

      // Default to null to allow null comparison when parent object is not defined
      const queryKey = `(${path} ?? null)`;
      if (operator != null) {
        this._queries.push(`${queryKey} ${operator} ${parameterName}`);
      } else {
        if (key === 'ieq') {
          this._queries.push(`StringEquals(${queryKey}, ${parameterName}, true)`);
        } else if (key === 'ine') {
          this._queries.push(`Not(StringEquals(${queryKey}, ${parameterName}, true))`);
        } else if (key === 'like') {
          this._queries.push(`Contains(${queryKey}, ${parameterName}, true)`);
        } else if (key === 'in') {
          this._queries.push(`ARRAY_CONTAINS(${parameterName}, ${queryKey})`);
        } else {
          throw new Error(`Unknown operator ${key}`);
        }
      }
      this._parameters.push({ name: parameterName, value: value2 });
    }
  }

  private _buildQuery(query: Record<string, any> | null | undefined, prefix = 'c'): void {
    if (query != null) {
      const { __typeInfo, ...rest } = query;
      const queryKeys = Object.keys(rest);

      for (const key of queryKeys) {
        const value = query[key];
        const type: string | null = value.__typeInfo ?? null;
        const subPath = `${prefix}.${key}`;

        if (typeof value === 'object' && value != null) {
          if (type === 'StringFilter') {
            this.handleStringFilter(subPath, value);
          } else if (type === 'InstantFilter') {
            this.handleInstantFilter(subPath, value);
          } else if (type === 'UUIDFilter') {
            this.handleUuidFilter(subPath, value);
          } else {
            this._buildQuery(value, subPath);
          }
        } else {
          throw new Error(`Unhandled type ${type}`);
        }
      }
    }
  }

  public override buildQuery(query: Record<string, any> | undefined | null, prefix = 'c'): void {
    this._buildQuery(query, prefix);
  }

  public override orderBy(): ICosmosQueryBuilder<T>;
  public override orderBy<P extends ExtractPathExpressions<T>>(field: P, direction: SortDirection): ICosmosQueryBuilder<T>;
  public override orderBy<P extends ExtractPathExpressions<T>>(field?: P, direction?: SortDirection): ICosmosQueryBuilder<T> {
    if (field == null || direction == null) {
      this._orderBy = [];
    } else {
      this._orderBy = ['ORDER BY', `${this._indent}c.${field} ${direction}`];
    }
    return this;
  }

  public override groupBy(value: string): ICosmosQueryBuilder<T> {
    this._groupBy = ['GROUP BY', `${this._indent}${value}`];
    return this;
  }

  public override select(value: string): ICosmosQueryBuilder<T> {
    this._select = value;
    return this;
  }

  private parameter(name: string, value: JSONValue): void {
    this._parameters.push({
      name,
      value,
    });
  }

  public override limit(limit: number): ICosmosQueryBuilder<T> {
    this._limit = limit;
    return this;
  }

  public override join<P extends ExtractPathExpressions<T>>(value: string, statement: P): ICosmosQueryBuilder<T> {
    this._join = `${value} IN c.${statement}`;
    return this;
  }

  public override whereFuzzy<P extends ExtractPathExpressions<T>>(value: string, fields: [P, ...P[]]): ICosmosQueryBuilder<T> {
    const parameterName = `@p${this._parameters.length}`;
    const lines: string[] = [];
    for (const field of fields) {
      const clause = `Contains(c.${field}, ${parameterName}, true)`;
      lines.push(clause);
    }
    const queryLine = `(${lines.join(' OR ')})`;
    this._queries.push(queryLine);
    this._parameters.push({ name: parameterName, value });
    return this;
  }

  public override whereRaw(field: string, operator: Exclude<ExtendedOpCode, 'isNull' | 'contains' | 'in'>, value: JSONValue): ICosmosQueryBuilder<T> {
    const parameterName = `@p${this._parameters.length}`;
    const sqlOperator = operators[operator];
    this._queries.push(`${field} ${sqlOperator} ${parameterName}`);
    this._parameters.push({ name: parameterName, value });
    return this;
  }

  public override whereOr(conditions: Array<{ field: string; operator: ExtendedOpCode; value: JSONValue }>): ICosmosQueryBuilder<T> {
    const orClauses: string[] = [];
    for (const condition of conditions) {
      const { field, operator, value } = condition;
      const parameterName = `@p${this._parameters.length}`;

      if (operator === 'isNull') {
        orClauses.push(`(c.${field} ?? null) = null`);
      } else if (operator === 'contains') {
        orClauses.push(`ARRAY_CONTAINS(c.${field}, ${parameterName})`);
      } else if (operator === 'in') {
        orClauses.push(`ARRAY_CONTAINS(${parameterName}, c.${field})`);
      } else {
        const sqlOperator = operators[operator];
        if (sqlOperator != null && value !== undefined) {
          orClauses.push(`c.${field} ${sqlOperator} ${parameterName}`);
          this._parameters.push({ name: parameterName, value });
        }
      }
    }

    if (orClauses.length > 0) {
      this._queries.push(`(${orClauses.join(' OR ')})`);
    }
    return this;
  }

  public override where<P extends ExtractPathExpressions<T>>(field: P, operator: 'isNull'): ICosmosQueryBuilder<T>;
  public override where<P extends ExtractPathExpressions<T>>(field: P, operator: 'in', value: readonly PathValue<T, P>[]): ICosmosQueryBuilder<T>;
  public override where<P extends ExtractPathExpressions<T>>(field: P, operator: 'contains', value: PathValue<T, P>[number]): ICosmosQueryBuilder<T>;
  public override where<P extends ExtractPathExpressions<T>, V extends PathValue<T, P>>(field: P, operator: BasicOpCode, value: V): ICosmosQueryBuilder<T>;
  public override where<P extends ExtractPathExpressions<T>, V extends PathValue<T, P>>(field: P, operator: ExtendedOpCode, value?: V | readonly V[]): ICosmosQueryBuilder<T> {
    const parameterName = `@p${this._parameters.length}`;

    if (operator === 'isNull') {
      const clause = `(c.${field} ?? null) = null`;
      this._queries.push(clause);
    } else if (operator === 'contains') {
      if (value !== undefined) {
        const clause = `ARRAY_CONTAINS(c.${field}, ${parameterName})`;
        this._queries.push(clause);
        this._parameters.push({ name: parameterName, value });
      }
    } else if (operator === 'in') {
      // Handle 'IN' operator
      if (value !== undefined) {
        const clause = `ARRAY_CONTAINS(${parameterName}, c.${field})`;
        this._queries.push(clause);
        this._parameters.push({ name: parameterName, value });
      }
    } else if (operator === 'ieq') {
      // Handle case-insensitive equality for strings
      if (value !== undefined) {
        const clause = `StringEquals(c.${field}, ${parameterName}, true)`;
        this._queries.push(clause);
        this._parameters.push({ name: parameterName, value });
      }
    } else if (operator === 'ine') {
      // Handle case-insensitive equality for strings
      if (value !== undefined) {
        const clause = `Not(StringEquals(c.${field}, ${parameterName}, true))`;
        this._queries.push(clause);
        this._parameters.push({ name: parameterName, value });
      }
    } else {
      const sqlOperator = operators[operator];
      if (sqlOperator != null && value !== undefined) {
        this._queries.push(`c.${field} ${sqlOperator} ${parameterName}`);
        this._parameters.push({ name: parameterName, value });
      }
    }
    return this;
  }

  public override filter(x: { clause: string; parameter?: JSONValue }): ICosmosQueryBuilder<T> {
    const paramName = `@p${this._parameters.length}`;
    this._queries.push(x.clause.replace('@', paramName));
    if (x.parameter != null) {
      this._parameters.push({
        name: paramName,
        value: x.parameter,
      });
    }
    return this;
  }

  public override query(): SqlQuerySpec {
    const lines: string[] = [];
    lines.push(`SELECT\n${this._indent}${this._select}`);
    lines.push(`FROM\n${this._indent}${this._from}`);
    if (this._join !== '') {
      lines.push(`JOIN\n${this._indent}${this._join}`);
    }

    if (this._queries.length > 0) {
      lines.push('WHERE');
      const where = this._queries.join(` AND\n${this._indent}`);
      lines.push(`${this._indent}${where}`);
    }

    lines.push(...this._orderBy);
    lines.push(...this._groupBy);
    if (this._limit != null) {
      lines.push('OFFSET 0');
      lines.push(`LIMIT ${this._limit}`);
    }

    const queryText = lines.join('\n');
    const result = {
      query: queryText,
      parameters: this.parameters,
    };
    this._logger.verbose('Cosmos Query', result);
    return result;
  }

  public override async getOne<TSelect = T>(container: Container): Promise<TSelect | null> {
    const itemsQuery = this.query();
    const itemsIterator = container.items.query<TSelect>(itemsQuery);
    const items = await itemsIterator.fetchNext();
    this._logger.verbose('Cosmos Result', { result: items });
    return items.resources?.[0] ?? null;
  }

  public override async getAll<TSelect>(container: Container, limit?: number | null | undefined, cursor?: string | null | undefined): Promise<FetchResult<TSelect>> {
    const itemsQuery = this.query();
    const itemsIterator = container.items.query<TSelect>(itemsQuery, {
      continuationToken: cursor ?? undefined,
      maxItemCount: limit ?? undefined,
    });
    let items: FeedResponse<TSelect>;
    try {
      items = await itemsIterator.fetchAll();
    } catch (err) {
      this._logger.error('Cosmos Query Error', err);
      throw err;
    }
    this._logger.verbose('Cosmos Result', { result: items });

    this.select('VALUE COUNT(1)');
    this.orderBy();

    const countQuery = this.query();
    const countIterator = container.items.query<number>(countQuery);

    let count: FeedResponse<number>;
    try {
      count = await countIterator.fetchAll();
    } catch (err) {
      this._logger.error('Cosmos Count Query Error', err);
      throw err;
    }

    const totalCount = count.resources?.[0] ?? 0;

    const result: FetchResult<TSelect> = {
      continuationToken: items.continuationToken,
      count: items.resources?.length ?? 0,
      items: items.resources ?? [],
      hasMoreResults: items.hasMoreResults,
      totalCount,
    };
    return result;
  }

  public override patch<P extends ExtractPatchPathExpressions<T>>(...operations: Array<{ path: P; op: 'set' | 'add' | 'replace'; value: PatchPathValue<T, P> } | { path: P; op: 'remove' }>): PatchRequestBody {
    const patchOperations = operations.map((opDef) => {
      if (opDef.op === 'remove') {
        return { op: opDef.op, path: opDef.path };
      }

      if (opDef.value !== undefined) {
        return { op: opDef.op, path: opDef.path, value: opDef.value };
      }

      throw new Error(`Value is required for operation: ${opDef.op}`);
    });

    return { operations: patchOperations };
  }
}
