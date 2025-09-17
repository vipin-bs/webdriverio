import type { Capabilities, Options } from '@wdio/types'
import logger from '@wdio/logger'

import BrowserstackService from './service.js'
import { TestOrchestrationIntegration } from './test-orchestration-integration.js'
import type { BrowserstackConfig } from './types.js'

const log = logger('wdio-browserstack-service:service-patch')

/**
 * Patches the BrowserStack service to inject orchestration functionality
 * This function allows applying orchestration without adding a separate service
 */
export function patchServiceWithOrchestration(
    service: BrowserstackService,
    options: BrowserstackConfig,
    config: Options.Testrunner
): BrowserstackService {
    const originalBeforeSession = service.beforeSession
    
    // Patch the beforeSession method to apply orchestration
    service.beforeSession = async function(...args: any[]) {
        try {
            // Extract specs array from args (4th parameter)
            const specs = args[3] || []
            
            // Apply orchestration
            const orchestration = TestOrchestrationIntegration.getInstance(options)
            const orderedSpecs = await orchestration.applyOrchestration(specs)
            
            // Update specs array
            if (orderedSpecs && orderedSpecs.length > 0) {
                specs.length = 0
                orderedSpecs.forEach(spec => specs.push(spec))
                log.info(`Test specs updated with orchestrated order`)
            }
        } catch (error) {
            log.error(`Error applying orchestration in patched service: ${error}`)
        }
        
        // Call original beforeSession
        if (typeof originalBeforeSession === 'function') {
            return await originalBeforeSession.apply(this, args)
        }
    }
    
    return service
}

export default patchServiceWithOrchestration