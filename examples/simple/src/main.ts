import { type Container, CosmosClient } from '@azure/cosmos';
import { createCosmosQueryBuilder, SortDirection } from '@shellicar/cosmos-query-builder';

const client = new CosmosClient('');
const db = client.database('database');
const container = db.container('container');

type Person = {
  type: 'Person';
  age: number;
  created: string;
};

const getPerson = async (container: Container) => {
  const builder = createCosmosQueryBuilder<Person>();

  builder.where('type', 'eq', 'Person');
  builder.where('age', 'gt', 18);
  builder.orderBy('created', SortDirection.Desc);
  builder.limit(50);

  const results = await builder.getAll(container);
  console.log(`Found ${results.count} people`);
  return results;
};

getPerson(container);
