import type { AceBase } from 'acebase';
import type { AdapterFactoryCustomizeAdapterCreator, CustomAdapter } from 'better-auth/adapters';
import { ensureIndexes } from './database-initialization';
import { makeCreate } from './methods/create';
import { makeCount, makeFindMany, makeFindOne } from './methods/read';
import { makeDelete, makeDeleteMany, makeUpdate, makeUpdateMany } from './methods/write';

export const createAdapterMethods = (db: AceBase): AdapterFactoryCustomizeAdapterCreator => {
  return ({ getModelName, getFieldName }) => {
    const initPromise = ensureIndexes({ db, getModelName });
    const context = { db, getFieldName, initPromise };
    const methods: CustomAdapter = {
      count: makeCount(context) as CustomAdapter['count'],
      create: makeCreate(context) as CustomAdapter['create'],
      delete: makeDelete(context) as CustomAdapter['delete'],
      deleteMany: makeDeleteMany(context) as CustomAdapter['deleteMany'],
      findMany: makeFindMany(context) as CustomAdapter['findMany'],
      findOne: makeFindOne(context) as CustomAdapter['findOne'],
      update: makeUpdate(context) as CustomAdapter['update'],
      updateMany: makeUpdateMany(context) as CustomAdapter['updateMany'],
    };
    return methods;
  };
};
