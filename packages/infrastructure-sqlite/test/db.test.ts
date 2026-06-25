import { assert, it } from '@effect/vitest';
import { ConfigProvider, Effect } from 'effect';
import { DB } from '../src/db';

const mockConfigProvider = ConfigProvider.fromJson({
  DATABASE_URL: ':memory:',
});

it.effect('DB: creates in-memory client', () =>
  Effect.gen(function* () {
    const db = yield* DB;

    const result = yield* db.run('SELECT 1');

    assert.deepEqual(result.rows, [{ 1: 1 }]);
  }).pipe(Effect.provide(DB.Default), Effect.withConfigProvider(mockConfigProvider))
);
