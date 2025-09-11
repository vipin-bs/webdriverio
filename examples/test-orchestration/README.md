# WebdriverIO Test Orchestration Example

This example demonstrates how to run WebdriverIO tests with BrowserStack, with or without test orchestration.

## Configuration

The main configuration file is `wdio.conf.js`. It includes a flag `useTestOrchestration` that controls whether test orchestration is enabled:

```javascript
// Set this to true to enable test orchestration
// Set to false for normal test execution without orchestration
useTestOrchestration: false
```

## Running Tests

### Without Test Orchestration (Default)

By default, test orchestration is disabled. To run tests without test orchestration:

```bash
npx wdio run wdio.conf.js
```

This will execute the tests directly on BrowserStack without using the test orchestration feature.

### With Test Orchestration

To enable test orchestration, edit the `wdio.conf.js` file and set `useTestOrchestration: true`, then run:

```bash
npx wdio run wdio.conf.js
```

## How It Works

The configuration uses a helper module (`test-orchestration-helper.js`) that dynamically configures WebdriverIO based on whether test orchestration is enabled:

1. When `useTestOrchestration` is `false`, tests connect directly to BrowserStack's WebDriver hub
2. When `useTestOrchestration` is `true`, the BrowserStack service is used with test orchestration enabled

This approach avoids the issues with automatic test orchestration that can cause tests to be skipped.

## Test Files

The example includes three test files in the `test` directory:

- `testA.js` - Tests for the WebdriverIO homepage and API docs
- `testB.js` - Tests for the Getting Started and Frameworks docs
- `testC.js` - Tests for the BrowserStack service and organizing suites docs
