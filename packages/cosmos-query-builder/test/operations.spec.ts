import { describe, expect, it } from 'vitest';
import { createCosmosQueryBuilder } from '../src';

type MyEntity = {
  givenName: string;
  familyName: string;
};

describe('operations', () => {
  describe('eq', () => {
    it('builds a basic query', () => {
      const builder = createCosmosQueryBuilder<MyEntity>();
      builder.where('givenName', 'eq', 'Joe');
      const query = builder.query();

      expect(query.query).toBe(`SELECT
  *
FROM
  c
WHERE
  c.givenName = @p0`);
    });

    it('puts each where on a new line', () => {
      const builder = createCosmosQueryBuilder<MyEntity>();
      builder.where('givenName', 'eq', 'Joe');
      builder.where('familyName', 'eq', 'Bloggs');
      const query = builder.query();

      expect(query.query).toBe(`SELECT
  *
FROM
  c
WHERE
  c.givenName = @p0 AND
  c.familyName = @p1`);
    });
  });

  describe('ieq', () => {
    it('passes parameter name', () => {
      const builder = createCosmosQueryBuilder<MyEntity>();
      builder.where('givenName', 'ieq', 'joe');
      const query = builder.query();

      expect(query.parameters?.[0].name).toBe('@p0');
    });

    it('passes parameter value', () => {
      const builder = createCosmosQueryBuilder<MyEntity>();
      builder.where('givenName', 'ieq', 'joe');
      const query = builder.query();

      expect(query.parameters?.[0].value).toBe('joe');
    });

    it('builds a basic query', () => {
      const builder = createCosmosQueryBuilder<MyEntity>();
      builder.where('givenName', 'ieq', 'joe');
      const query = builder.query();

      expect(query.query).toBe(`SELECT
  *
FROM
  c
WHERE
  StringEquals(c.givenName, @p0, true)`);
    });
  });

  describe('ine', () => {
    it('builds a basic query', () => {
      const builder = createCosmosQueryBuilder<MyEntity>();
      builder.where('givenName', 'ine', 'joe');
      const query = builder.query();

      expect(query.query).toBe(`SELECT
  *
FROM
  c
WHERE
  Not(StringEquals(c.givenName, @p0, true))`);
    });
  });
});
