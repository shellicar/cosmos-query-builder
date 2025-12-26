# @shellicar/cosmos-query-builder

> A type-safe query builder for [Azure Cosmos DB for NoSQL](https://docs.microsoft.com/en-us/azure/cosmos-db/nosql/)

[![npm package](https://img.shields.io/npm/v/@shellicar/cosmos-query-builder.svg)](https://npmjs.com/package/@shellicar/cosmos-query-builder)
[![build status](https://github.com/shellicar/cosmos-query-builder/actions/workflows/node.js.yml/badge.svg)](https://github.com/shellicar/cosmos-query-builder/actions/workflows/node.js.yml)

> **Note**: This library is for Azure Cosmos DB for NoSQL (formerly SQL API). For MongoDB API, see [Azure Cosmos DB for MongoDB](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb/).

## Features

- 🎯 **Type-safe field access** - IntelliSense and compile-time validation instead of error-prone string queries
- ⚡ **Builder pattern** - Use methods instead of writing raw SQL strings
- 🔍 **Type-safe advanced operators** - Array operations like `ARRAY_CONTAINS` and Cosmos DB functions with full type safety
- � **Type-safe patch operations** - JSON patch document creation with compile-time path validation
- � **Automatic parameter generation** - Dynamic `@p0`, `@p1` parameter binding without manual parameter management
- 🚀 **Built-in execution** - Execute queries directly with pagination and total count support

## Installation & Quick Start

```sh
npm i --save @shellicar/cosmos-query-builder
```

```sh
pnpm add @shellicar/cosmos-query-builder
```

```ts
import { createCosmosQueryBuilder, SortDirection } from '@shellicar/cosmos-query-builder';

const builder = createCosmosQueryBuilder<Person>();

builder.where('type', 'eq', 'Person');
builder.where('age', 'gt', 18);
builder.orderBy('created', SortDirection.Desc);
builder.limit(50);

const results = await builder.getAll(container);
```

For a complete working example, see [examples/simple/src/main.ts](./examples/simple/src/main.ts).

<!-- BEGIN_ECOSYSTEM -->

## @shellicar TypeScript Ecosystem

### Core Libraries

- [`@shellicar/core-config`](https://github.com/shellicar/core-config) - A library for securely handling sensitive configuration values like connection strings, URLs, and secrets.
- [`@shellicar/core-di`](https://github.com/shellicar/core-di) - A basic dependency injection library.

### Reference Architectures

- [`@shellicar/reference-foundation`](https://github.com/shellicar/reference-foundation) - A comprehensive starter repository. Illustrates individual concepts.
- [`@shellicar/reference-enterprise`](https://github.com/shellicar/reference-enterprise) - A comprehensive starter repository. Can be used as the basis for creating a new Azure application workload.

### Build Tools

- [`@shellicar/build-clean`](https://github.com/shellicar/build-clean) - Build plugin that automatically cleans unused files from output directories.
- [`@shellicar/build-version`](https://github.com/shellicar/build-version) - Build plugin that calculates and exposes version information through a virtual module import.
- [`@shellicar/build-graphql`](https://github.com/shellicar/build-graphql) - Build plugin that loads GraphQL files and makes them available through a virtual module import.

### Framework Adapters

- [`@shellicar/svelte-adapter-azure-functions`](https://github.com/shellicar/svelte-adapter-azure-functions) - A [SvelteKit adapter](https://kit.svelte.dev/docs/adapters) that builds your app into an Azure Function.
- [`@shellicar/cosmos-query-builder`](https://github.com/shellicar/cosmos-query-builder) - Helper class for type safe advanced queries for Cosmos DB (Sql Core).

### Logging & Monitoring

- [`@shellicar/winston-azure-application-insights`](https://github.com/shellicar/winston-azure-application-insights) - An [Azure Application Insights](https://azure.microsoft.com/en-us/services/application-insights/) transport for [Winston](https://github.com/winstonjs/winston) logging library.
- [`@shellicar/pino-applicationinsights-transport`](https://github.com/shellicar/pino-applicationinsights-transport) - [Azure Application Insights](https://azure.microsoft.com/en-us/services/application-insights) transport for [pino](https://github.com/pinojs/pino)

<!-- END_ECOSYSTEM -->

## Motivation

I wanted a type-safe interface for Azure Cosmos DB for NoSQL and couldn't find any existing solutions for TypeScript.

Originally developed for the Circuit Breaker platform at Hope Ventures, this library was graciously allowed to be released as open source.

## Feature Examples

Type-safe query builder for Azure Cosmos DB, supporting advanced operators and structured filtering.

See [readme examples](./examples/readme/src) for example source code.

- **Builder pattern** - Use methods like `where()`, `orderBy()`, `limit()` instead of writing raw SQL.

```ts
builder.where('type', 'eq', 'Person');
builder.where('age', 'gt', 18);
builder.orderBy('created', SortDirection.Desc);
builder.limit(50);
```

- **Advanced operators** - Array operations like `contains`, `in`, and fuzzy search across multiple fields.

```ts
builder.where('bones', 'contains', 'arm');
builder.where('name.givenName', 'in', ['John', 'Jane']);
builder.whereFuzzy('steve', ['name.givenName', 'name.familyName', 'email']);
```

- **Type-safe field access** - IntelliSense and compile-time validation for field paths and values.

```ts
// @ts-expect-error: Argument of type 'number' is not assignable to parameter of type 'string'.
builder.where('age', 'eq', 'invalid');
builder.where('age', 'eq', 25);
```

- **Structured filtering** - Use filter objects with type information for complex queries.

```ts
type PersonFilter = {
  name?: {
    givenName?: StringFilter;
  };
};
const filter = {
  name: {
    givenName: { __typeInfo: 'StringFilter', eq: 'John' }
  }
} satisfies PersonFilter;
builder.buildQuery(filter);
```

- **Patch operations** - Create type-safe JSON patch documents for Cosmos DB.

```ts
const operations = builder.patch({
  op: 'replace',
  path: '/name/givenName',
  value: 'Smith'
});
await container.item('id', 'partitionKey').patch(operations);
```

## Usage

Check the test files for different usage scenarios.

```ts
import { createCosmosQueryBuilder, SortDirection } from '@shellicar/cosmos-query-builder';
import type { Container } from '@azure/cosmos';

type Person = {
  id: string;
  type: 'Person';
  age: number;
  created: string;
  name: {
    givenName: string;
    familyName: string;
  };
};

const queryPeople = async (container: Container) => {
  const builder = createCosmosQueryBuilder<Person>();
  
  builder.where('type', 'eq', 'Person');
  builder.where('age', 'gt', 18);
  builder.orderBy('created', SortDirection.Desc);
  builder.limit(50);
  
  const results = await builder.getAll(container);
  console.log(`Found ${results.count} people`);
  
  return results.items;
};
```

## Credits & Inspiration

Originally developed for [Circuit Breaker](https://circuitbreaker.au) platform.

Special thanks to [Hope Ventures](https://www.hopeventures.org.au/) for graciously allowing this code to be open sourced.
