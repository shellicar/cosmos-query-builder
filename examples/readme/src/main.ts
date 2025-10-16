import type { UUID } from 'node:crypto';
import { CosmosClient } from '@azure/cosmos';
import { createCosmosQueryBuilder, type ICosmosQueryBuilder, SortDirection, type StringFilter, type UUIDFilter } from '@shellicar/cosmos-query-builder';

const client = new CosmosClient('');
const db = client.database('database');
const container = db.container('container');

enum Sex {
  Male = 'Male',
  Female = 'Female',
  Unspecified = 'Unspecified',
}

type Person = {
  id: UUID;

  created: string;
  modified: string;
  deleted?: string | null;

  sex: Sex;

  name: {
    givenName: string;
    familyName: string;
  };
  email: string;
  age: number;

  bones: string[];
  products: {
    id: UUID;
    name: string;
  }[];
};

const getAll = async (builder: ICosmosQueryBuilder<Person>): Promise<Person[]> => {
  const result = await builder.getAll(container);
  const { continuationToken, count, hasMoreResults, items, totalCount } = result;

  console.log({ continuationToken, count, hasMoreResults, totalCount });
  return items;
};

const getOne = async (builder: ICosmosQueryBuilder<Person>): Promise<Person | null> => {
  const result = await builder.getOne(container);
  if (result == null) {
    console.log('No person found');
    return null;
  }
  console.log('Found person:', result);
  return result;
};

const main = async () => {
  const builder = createCosmosQueryBuilder<Person>();

  // [field] Array contains [value] using 'contains' operator
  // @ts-expect-error: Argument of type 'number' is not assignable to parameter of type 'string'.
  builder.where('bones', 'contains', 50);
  builder.where('bones', 'contains', 'arm');

  // [value] Array contains [field] using 'in' operator
  // @ts-expect-error: Argument of type 'string' is not assignable to parameter of type 'readonly Sex[]'.
  builder.where('sex', 'in', 'Male');
  builder.where('name.givenName', 'in', ['John', 'Smith']);

  builder.where('deleted', 'isNull');
  builder.where('age', 'gt', 18);
  builder.where('name.givenName', 'eq', 'John');

  // Mathematical operators
  const createdFilter: string = new Date().toISOString();
  // @ts-expect-error: Argument of type 'number' is not assignable to parameter of type 'string'.
  builder.where('created', 'ge', 50);
  builder.where('created', 'ge', createdFilter);

  // @ts-expect-error: Argument of type '"some-uuid-value"' is not assignable to parameter of type '`${string}-${string}-${string}-${string}-${string}`'.
  builder.where('id', 'eq', 'some-uuid-value');
  // @ts-expect-error: Argument of type '"Hello"' is not assignable to parameter of type 'Sex'.ts(2769)
  builder.where('sex', 'eq', 'Hello');
  builder.where('sex', 'eq', Sex.Female);
  builder.where('id', 'eq', 'c36a5bf0-6dcd-46b5-9538-35ecc870bb9f');

  // Cosmos joins
  builder.join('b', 'bones');
  // @ts-expect-error: Argument of type '"missing"' is not assignable to parameter of type '"bones" | "id" | "created" | "modified" | "sex" | "name" | "email" | "age" | "products" | `bones[${number}]` | (...).
  builder.join('b', 'missing');

  // Fallback to raw clauses
  builder.join('p', 'products');
  builder.whereRaw('p.id', 'eq', 'c36a5bf0-6dcd-46b5-9538-35ecc870bb9f');

  // Find either condition
  builder.whereOr([
    { field: 'name.givenName', operator: 'eq', value: 'John' },
    { field: 'name.familyName', operator: 'eq', value: 'Smith' },
  ]);

  // Pagination
  builder.limit(100);

  // Select different fields - no type safety
  builder.select('COUNT(1) as count, UPPER(c.name.givenName) as name');

  // Grouping - no type safety
  builder.groupBy('UPPER(c.sex)');

  // Ordering
  builder.orderBy();
  builder.orderBy('created', SortDirection.Desc);

  // Search multiple fields for
  builder.whereFuzzy('steve', ['name.givenName', 'name.familyName', 'email']);

  // Create patch operations that can be used
  const operations = builder.patch({
    op: 'replace',
    path: '/name/givenName',
    value: 'Smith',
  });
  const item = container.item('id', 'partitionKey');
  await item.patch<Person>(operations);

  type PersonFilter = {
    name?: {
      givenName?: StringFilter;
    };
    id?: UUIDFilter;
  };
  const filter = {
    name: {
      givenName: { __typeInfo: 'StringFilter', eq: 'John' },
    },
  } satisfies PersonFilter;
  builder.buildQuery(filter);

  const query = builder.query();
  console.log('SQL Query:', query);

  await getAll(builder);
  await getOne(builder);
};

await main();
