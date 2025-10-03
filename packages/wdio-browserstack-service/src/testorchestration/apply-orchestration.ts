import path from 'node:path'
import fs from 'node:fs'
import type { Logger } from '@wdio/logger'
import logger from '@wdio/logger'
import { performance } from 'node:perf_hooks'

import { TestOrchestrationHandler } from './testorcherstrationhandler.js'

const log = logger('wdio-browserstack-service:apply-orchestration')

/**
 * Applies test orchestration to the WebdriverIO test run
 * This function is the main entry point for the orchestration integration
 */
export async function applyOrchestrationIfEnabled(
    specs: string[],
    config: Record<string, any>
): Promise<string[]> {
    // Initialize orchestration handler
    const orchestrationHandler = TestOrchestrationHandler.getInstance(config, log)
    log.warn('Orchestration handler is initialized step 2')
    if (!orchestrationHandler) {
        log.warn('Orchestration handler is not initialized. Skipping orchestration.')
        return specs
    }

    // Check if runSmartSelection is enabled in config
    const runSmartSelectionEnabled = Boolean(config?.testOrchestrationOptions?.runSmartSelection?.enabled)
    if (!runSmartSelectionEnabled) {
        log.info('runSmartSelection is not enabled in config. Skipping orchestration.')
        return specs
    }

    // Check if orchestration is enabled
    let testOrderingApplied = false
    orchestrationHandler.addToOrderingInstrumentationData('enabled', orchestrationHandler.testOrderingEnabled())
    
    const startTime = performance.now()
    
    // if (orchestrationHandler.testOrderingEnabled()) {
    log.info('Test orchestration is enabled. Attempting to reorder test files.')
    
    // Get the test files from the specs - pass them as received
    const testFiles = specs
    testOrderingApplied = true
    log.info(`Test files to be reordered: ${testFiles.join(', ')}`) 
    
    // Reorder the test files
    const orderedFiles = await orchestrationHandler.reorderTestFiles(testFiles)
    
    if (orderedFiles && orderedFiles.length > 0) {
        orchestrationHandler.setTestOrderingApplied(testOrderingApplied)
        log.info(`Tests reordered using orchestration: ${orderedFiles.join(', ')}`)
        
        // Return the ordered files as the new specs
        orchestrationHandler.addToOrderingInstrumentationData(
            'timeTakenToApply', 
            Math.floor(performance.now() - startTime) // Time in milliseconds
        )
        
        return orderedFiles
    } else {
        log.info('No test files were reordered by orchestration.')
        orchestrationHandler.addToOrderingInstrumentationData(
            'timeTakenToApply', 
            Math.floor(performance.now() - startTime) // Time in milliseconds
        )
    }
    return specs
}

export default applyOrchestrationIfEnabled
