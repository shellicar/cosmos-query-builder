# @shellicar/cosmos-query-builder

> A type-safe query builder for [Azure Cosmos DB for NoSQL](https://docs.microsoft.com/en-us/azure/cosmos-db/nosql/) with fluent API

[![npm package](https://img.shields.io/npm/v/@shellicar/cosmos-query-builder.svg)](https://npmjs.com/package/@shellicar/cosmos-query-builder)
[![build status](https://github.com/shellicar/cosmos-query-builder/actions/workflows/node.js.yml/badge.svg)](https://github.com/shellicar/cosmos-query-builder/actions/workflows/node.js.yml)

> **Note**: This library is for Azure Cosmos DB for NoSQL (formerly SQL API). For MongoDB API, see [Azure Cosmos DB for MongoDB](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb/).

## Features

- 🎯 **Type-safe field access** - IntelliSense and compile-time validation instead of error-prone string queries
- ⚡ **Fluent query building** - Chain methods instead of writing raw SQL strings
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

// TODO: Add proper example when examples are created
```

<!-- BEGIN_ECOSYSTEM -->

## @shellicar TypeScript Ecosystem

### Core Libraries

- [`@shellicar/core-config`](https://github.com/shellicar/core-config) - A library for securely handling sensitive configuration values like connection strings, URLs, and secrets.
- [`@shellicar/cosmos-query-builder`](https://github.com/shellicar/cosmos-query-builder) - A type-safe query builder for Azure Cosmos DB for NoSQL with fluent API.

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

> TODO: Intro

See [readme examples](./examples/readme/src) for example source code.

> TODO: Examples

## Usage

Check the test files for different usage scenarios.

> TODO: Usage examples

## Credits & Inspiration

Originally developed for [Circuit Breaker](https://circuitbreaker.au) platform.

Special thanks to [Hope Ventures](https://www.hopeventures.org.au/) for graciously allowing this code to be open sourced.
