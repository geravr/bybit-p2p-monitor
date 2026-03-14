# Bybit P2P Monitor Tests

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun run test:watch

# Run specific test file
bun test __tests__/index.test.ts
```

## Test Coverage

### Unit Tests
- ✅ API Client configuration
- ✅ Price formatting utilities
- ✅ Amount formatting
- ✅ Percentage formatting
- ✅ Price change calculations
- ✅ Pagination logic
- ✅ Filter logic

### Integration Tests
- ✅ Client instantiation
- ⏭️ API connectivity (requires credentials)

## Expected Outputs

```bash
$ bun test
Bun v1.x.x | 10 test files | 8 passed | 0 failed
```

## Adding New Tests

Tests use Bun's built-in test framework:

```typescript
import { describe, it, expect } from "bun:test";

describe("Feature", () => {
  it("should work correctly", () => {
    expect(true).toBe(true);
  });
});
```

## Mocking

For API tests, use test environment variables:

```bash
BYBIT_API_KEY=test BYBIT_API_SECRET=test bun test
```
