import { ConfigProvider } from 'effect';

export const mockConfigProvider = ConfigProvider.fromJson({
  DATABASE_URL: ':memory:',
});
