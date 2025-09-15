import type { Capabilities, Options } from '@wdio/types'
import logger from '@wdio/logger'

import { applyOrchestrationIfEnabled } from './testorchestration/apply-orchestration.js'
import type { BrowserstackConfig } from './types.js'

const log = logger('wdio-browserstack-service:orchestration-service')

/**
 * WebdriverIO Browserstack Service with Orchestration integration
 * This class enhances the standard BrowserStack service with test orchestration capabilities
 */
export class BrowserstackOrchestrationService {
    private _config: Options.Testrunner
    private _options: BrowserstackConfig

    constructor(
        options: BrowserstackConfig,
        capabilities: Capabilities.RemoteCapability,
        config: Options.Testrunner
    ) {
        this._options = options
        this._config = config
    }

    /**
     * Hook that gets executed before test execution begins
     * This is where we apply the test orchestration to reorder tests
     */
    async beforeSession(_: any, __: any, ___: any, specs: string[]): Promise<void> {
        try {
            const orderedSpecs = await applyOrchestrationIfEnabled(specs, this._options)
            
            // Update the specs in the config
            if (orderedSpecs && orderedSpecs.length > 0 && specs.length > 0) {
                // Replace the specs array with the ordered specs
                specs.length = 0
                orderedSpecs.forEach(spec => specs.push(spec))
                
                log.info(`Test specs updated with orchestrated order. New order: ${specs.join(', ')}`)
            }
        } catch (error) {
            log.error(`Error applying test orchestration: ${error}`)
        }
    }
}

export default BrowserstackOrchestrationService
