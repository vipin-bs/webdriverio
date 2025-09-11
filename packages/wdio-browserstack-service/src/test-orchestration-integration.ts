import logger from '@wdio/logger'
import path from 'node:path'
import fs from 'node:fs'

import { TestOrchestrationHandler } from './testorchestration/testorcherstrationhandler.js'
import { applyOrchestrationIfEnabled } from './testorchestration/apply-orchestration.js'

const log = logger('wdio-browserstack-service:test-orchestration-integration')

/**
 * Integrates test orchestration with WebdriverIO test runner.
 * This class provides methods to initialize and apply test orchestration to WebdriverIO tests.
 */
export class TestOrchestrationIntegration {
    private static _instance: TestOrchestrationIntegration | null = null
    private config: Record<string, any>
    private orchestrationHandler: TestOrchestrationHandler | null = null

    constructor(config: Record<string, any>) {
        this.config = config
        this.orchestrationHandler = TestOrchestrationHandler.getInstance(config, log)
    }

    /**
     * Get singleton instance of TestOrchestrationIntegration
     */
    static getInstance(config: Record<string, any>): TestOrchestrationIntegration {
        if (!TestOrchestrationIntegration._instance && config !== null) {
            TestOrchestrationIntegration._instance = new TestOrchestrationIntegration(config)
        }
        return TestOrchestrationIntegration._instance as TestOrchestrationIntegration
    }

    /**
     * Checks if orchestration is enabled and applicable for the current test framework
     */
    isOrchestrationEnabled(): boolean {
        return this.orchestrationHandler !== null && this.orchestrationHandler.testOrderingEnabled()
    }

    /**
     * Apply orchestration to a list of spec files
     * This method is the main entry point for integrating test orchestration
     */
    async applyOrchestration(specs: string[]): Promise<string[]> {
        if (!this.isOrchestrationEnabled()) {
            log.debug('Test orchestration is not enabled. Skipping orchestration.')
            return specs
        }

        log.info('Applying test orchestration to specs')
        return await applyOrchestrationIfEnabled(specs, this.config)
    }

    /**
     * Get orchestration metrics and instrumentation data
     */
    getOrchestrationMetrics(): Record<string, any> {
        if (this.orchestrationHandler) {
            return this.orchestrationHandler.getOrderingInstrumentationData()
        }
        return {}
    }
}

export default TestOrchestrationIntegration
