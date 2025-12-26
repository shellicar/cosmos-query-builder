import { env } from 'node:process';
import { type Container, CosmosClient } from '@azure/cosmos';
import { createCosmosQueryBuilder } from '@shellicar/cosmos-query-builder';

const client = new CosmosClient(env.COSMOS_CONNECTION_STRING ?? '');
const db = client.database('database');
const container = db.container('container');

type Person = {
  id: string;
  type: 'Person';
};

const test = async (container: Container) => {
  const builder = createCosmosQueryBuilder<Person>();
  builder.where('type', 'eq', 'Person');

  await builder.getAll(container);
  await builder.getOne(container);
};

test(container);
