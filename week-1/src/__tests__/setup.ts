// Test setup and global mocks
beforeAll(() => {
  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    error: jest.fn(),
    log: jest.fn(),
  };
});

afterAll(() => {
  jest.restoreAllMocks();
});