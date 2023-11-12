import createMockClient from 'ioredis-mock';

jest.mock('ioredis', () => {
  return {
    createClient: () => new createMockClient(),
  };
});