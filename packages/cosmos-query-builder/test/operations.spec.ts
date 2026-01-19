import { describe, expect, it } from 'vitest';
import { createCosmosQueryBuilder, SortDirection } from '../src';

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

  describe('where and order', () => {
    it('two where and order', () => {
      const builder = createCosmosQueryBuilder<MyEntity>();
      builder.select('c.sex');
      builder.where('givenName', 'eq', 'Joe');
      builder.where('familyName', 'eq', 'Bloggs');
      builder.orderBy('givenName', SortDirection.Desc);
      builder.limit(10);
      builder.groupBy('UPPER(c.sex) as sex');
      const query = builder.query();

      expect(query.query).toBe(`SELECT
  c.sex
FROM
  c
WHERE
  c.givenName = @p0 AND
  c.familyName = @p1
ORDER BY
  c.givenName DESC
GROUP BY
  UPPER(c.sex) as sex
OFFSET 0
LIMIT 10`);
    });

    it('one where and order', () => {
      const builder = createCosmosQueryBuilder<MyEntity>();
      builder.where('givenName', 'eq', 'Joe');
      builder.orderBy('givenName', SortDirection.Desc);
      const query = builder.query();
      expect(query.query).toBe(`SELECT
  *
FROM
  c
WHERE
  c.givenName = @p0
ORDER BY
  c.givenName DESC`);
    });
  });

  describe('builder pattern', () => {
    it('allow chaining operations', () => {
      const query = createCosmosQueryBuilder<MyEntity>().where('givenName', 'eq', 'Joe').orderBy('givenName', SortDirection.Desc).query();

      expect(query.query).toBe(`SELECT
  *
FROM
  c
WHERE
  c.givenName = @p0
ORDER BY
  c.givenName DESC`);
    });
  });
});
