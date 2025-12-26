import { createCosmosQueryBuilder, SortDirection } from '@shellicar/cosmos-query-builder';

type Person = {
  type: 'Person';
  age: number;
};

const builder = createCosmosQueryBuilder<Person>();
builder.orderBy('age', SortDirection.Desc);
