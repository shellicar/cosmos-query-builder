# @shellicar/cosmos-query-builder

> A type-safe query builder for [Azure Cosmos DB for NoSQL](https://docs.microsoft.com/en-us/azure/cosmos-db/nosql/) with fluent API

> **Note**: This library is for Azure Cosmos DB for NoSQL (formerly SQL API). For MongoDB API, see [Azure Cosmos DB for MongoDB](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb/).

## Installation & Quick Start

```sh
npm i --save @shellicar/cosmos-query-builder
```

```sh
pnpm add @shellicar/cosmos-query-builder
```

## Quick Example

```ts
import { createCosmosQueryBuilder, SortDirection } from '@shellicar/cosmos-query-builder';

const builder = createCosmosQueryBuilder<Person>();

builder.where('type', 'eq', 'Person');
builder.where('age', 'gt', 18);
builder.orderBy('created', SortDirection.Desc);
builder.limit(50);

const results = await builder.getAll(container);
```

For a complete working example, see [examples/simple/src/main.ts](../../examples/simple/src/main.ts).

## Documentation

For full documentation, visit the [GitHub repository](https://github.com/shellicar/cosmos-query-builder).
