import { Effect, Layer, Option } from 'effect';
import { type IItemRepository, ItemRepository } from '../../src/port/item-repository';
import { sampleItem } from './data/item';

const mockItemRepository: IItemRepository = {
  create: (item) => Effect.succeed(item),
  delete: () => Effect.void,
  findByFeedId: () => Effect.succeed([sampleItem]),
  findById: () => Effect.succeed(Option.some(sampleItem)),
};

export const ItemRepositoryTest = Layer.succeed(ItemRepository, mockItemRepository);

const mockItemRepositoryEmpty: IItemRepository = {
  create: (item) => Effect.succeed(item),
  delete: () => Effect.void,
  findByFeedId: () => Effect.succeed([]),
  findById: () => Effect.succeed(Option.none()),
};

export const ItemRepositoryEmpty = Layer.succeed(ItemRepository, mockItemRepositoryEmpty);
