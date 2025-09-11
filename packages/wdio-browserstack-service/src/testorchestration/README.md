# WebdriverIO Test Orchestration

This feature enables intelligent test orchestration in WebdriverIO when using BrowserStack. Test orchestration reorders your test files based on various strategies to optimize test execution, similar to how it works in other frameworks like Pytest.

## Features

- **Smart Test Selection**: Prioritize tests based on relevance or likelihood of failure
- **Optimized Test Ordering**: Run tests in an order that helps catch failures earlier
- **Test Orchestration Integration**: Seamlessly integrates with WebdriverIO testing workflow

## Usage

### 1. Configure BrowserStack Service

In your WebdriverIO configuration file, add the orchestration service alongside the BrowserStack service:

```typescript
import { defineConfig } from '@wdio/cli'
import { orchestrationService } from '@wdio/browserstack-service'

export const config = defineConfig({
    // ...
    services: [
        ['browserstack', {
            browserstackLocal: true,
            buildName: 'Your Build Name',
            projectName: 'Your Project Name',
            
            // Enable test observability (required for orchestration)
            testObservability: true,
            
            // Test orchestration options
            testOrchestrationOptions: {
                runSmartSelection: {
                    enabled: true,
                    mode: 'relevantFirst', // or other modes as available
                    source: [] // Optional source paths for multi-repo setups
                }
            }
        }],
        // Add the orchestration service
        [orchestrationService]
    ],
    // ...
})
```

### 2. Test Orchestration Will Automatically:

- Check if orchestration is enabled and applicable
- Collect test files from your specs
- Reorder tests based on the selected strategy
- Update the specs list with the optimized order
- Run tests in the optimized order

## Requirements

- WebdriverIO v8 or higher
- BrowserStack service configured with valid credentials
- Test observability enabled
- Project name and build name set in the configuration

## How It Works

1. Before the test session starts, the orchestration service intercepts the list of spec files
2. It communicates with BrowserStack's orchestration API to determine the optimal order
3. The spec files are reordered and the test runner executes them in the optimized sequence
4. Orchestration metrics are collected and reported back to BrowserStack

## Advanced Configuration

For more advanced scenarios, you can access the orchestration programmatically:

```typescript
import { TestOrchestrationIntegration } from '@wdio/browserstack-service'

// Get the orchestration instance
const orchestration = TestOrchestrationIntegration.getInstance(config)

// Check if orchestration is enabled
if (orchestration.isOrchestrationEnabled()) {
    // Apply orchestration manually
    const orderedSpecs = await orchestration.applyOrchestration(specs)
    
    // Get orchestration metrics
    const metrics = orchestration.getOrchestrationMetrics()
    console.log('Orchestration metrics:', metrics)
}
```
