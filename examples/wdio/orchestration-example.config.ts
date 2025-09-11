import { defineConfig } from '@wdio/cli'
import type { Options } from '@wdio/types'

// Import the orchestration service
import { orchestrationService } from '@wdio/browserstack-service'

export const config: Options.Testrunner = defineConfig({
    // Your standard WebdriverIO configuration options...
    runner: 'local',
    specs: [
        './test/specs/**/*.js'
    ],
    
    // Use BrowserStack service with orchestration
    services: [
        ['browserstack', {
            // Standard BrowserStack service options
            browserstackLocal: true,
            buildName: 'Test Build',
            projectName: 'Example Project',
            
            // Enable test orchestration
            testObservability: true,
            
            // Test orchestration options
            testOrchestrationOptions: {
                runSmartSelection: {
                    enabled: true,
                    mode: 'relevantFirst',
                    source: []
                }
            }
        }],
        // Add the orchestration service to enable test reordering
        [orchestrationService]
    ],
    
    // Other standard WebdriverIO configuration options...
    capabilities: [{
        browserName: 'chrome'
    }],
    
    // Hooks
    onPrepare: function (config, capabilities) {
        console.log('Preparing to run tests with orchestration...')
    },
    
    beforeSession: function (config, capabilities, specs) {
        console.log('Session starting with ordered specs:', specs)
    }
})

export default config
