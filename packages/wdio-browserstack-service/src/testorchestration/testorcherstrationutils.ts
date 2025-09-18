import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'

import type { Logger } from '@wdio/logger'
import logger from '@wdio/logger'

import { getHostInfo, getGitMetadataForAiSelection } from './helpers.js'
import { RequestUtils } from './request-utils.js'

const require = createRequire(import.meta.url)
const log = logger('wdio-browserstack-service:TestOrchestrationUtils')

// Constants
const DEFAULT_LOG_LEVEL = 'info'
const TEST_ORDERING_SUPPORTED_FRAMEWORKS = ['mocha', 'jasmine', 'cucumber']

const RUN_SMART_SELECTION = 'runSmartSelection'

const ALLOWED_ORCHESTRATION_KEYS = [
    RUN_SMART_SELECTION
]

/**
 * Class to handle test ordering functionality
 */
class TestOrdering {
    private enabled: boolean
    private name: string | null

    constructor() {
        this.enabled = false
        this.name = null
    }

    enable(name: string): void {
        this.enabled = true
        this.name = name
    }

    disable(): void {
        this.enabled = false
        this.name = null
    }

    getEnabled(): boolean {
        return this.enabled
    }

    getName(): string | null {
        return this.name
    }
}

/**
 * Utility class for test orchestration
 */
export class OrchestrationUtils {
    private static _instance: OrchestrationUtils | null = null
    private runSmartSelection: boolean
    private smartSelectionMode: string
    private testOrdering: TestOrdering
    private smartSelectionSource: string[] | null
    private logger: Logger
    private projectName?: string
    private buildName?: string
    private buildIdentifier?: string

    /**
     * @param config Configuration object
     */
    constructor(config: Record<string, any>) {
        this.logger = log
        this.runSmartSelection = false
        this.smartSelectionMode = 'relevantFirst'
        this.testOrdering = new TestOrdering()
        this.smartSelectionSource = null // Store source paths if provided
        
        // Check both possible configuration paths: direct or nested in services
        let testOrchOptions = config.testOrchestrationOptions || {}
        
        // If not found at top level, check if it's in the browserstack service config
        if (Object.keys(testOrchOptions).length === 0 && config.services && Array.isArray(config.services)) {
            // Look for browserstack service configuration
            for (const service of config.services) {
                if (Array.isArray(service) && service[0] === 'browserstack' && service[1] && service[1].testOrchestrationOptions) {
                    testOrchOptions = service[1].testOrchestrationOptions
                    this.logger.debug(`[constructor] Found testOrchestrationOptions in browserstack service config`)
                    break
                }
            }
        }
        
        // Try to get runSmartSelection options
        const runSmartSelectionOpts = testOrchOptions[RUN_SMART_SELECTION] || {}
        
        this._setRunSmartSelection(
            runSmartSelectionOpts.enabled || false,
            runSmartSelectionOpts.mode || 'relevantFirst',
            runSmartSelectionOpts.source || null
        )
        
        // Extract build details from capabilities
        this._extractBuildDetails(config)
    }

    /**
     * Extract build details from capabilities
     */
    private _extractBuildDetails(config: Record<string, any>): void {
        try {
            const capabilities = config.capabilities
            
            if (Array.isArray(capabilities)) {
                capabilities.forEach((capability: any) => {
                    if (!capability['bstack:options']) {
                        // Extract from legacy format
                        this.buildIdentifier = capability['browserstack.buildIdentifier']?.toString()
                        this.buildName = capability.build?.toString()
                    } else {
                        // Extract from bstack:options format
                        this.buildName = capability['bstack:options'].buildName
                        this.projectName = capability['bstack:options'].projectName
                        this.buildIdentifier = capability['bstack:options'].buildIdentifier
                    }
                })
            } else if (typeof capabilities === 'object' && capabilities) {
                // Handle multiremote capabilities
                Object.entries(capabilities).forEach(([, caps]: [string, any]) => {
                    if (caps.capabilities) {
                        if (!caps.capabilities['bstack:options']) {
                            this.buildIdentifier = caps.capabilities['browserstack.buildIdentifier']
                        } else {
                            const bstackOptions = caps.capabilities['bstack:options']
                            this.buildName = bstackOptions.buildName
                            this.projectName = bstackOptions.projectName
                            this.buildIdentifier = bstackOptions.buildIdentifier
                        }
                    }
                })
            }
            
            this.logger.debug(`[_extractBuildDetails] Extracted - projectName: ${this.projectName}, buildName: ${this.buildName}, buildIdentifier: ${this.buildIdentifier}`)
        } catch (e) {
            this.logger.error(`[_extractBuildDetails] ${e}`)
        }
    }

    /**
     * Get or create an instance of OrchestrationUtils
     */
    static getInstance(config?: Record<string, any>): OrchestrationUtils | null {
        if (!OrchestrationUtils._instance && config) {
            OrchestrationUtils._instance = new OrchestrationUtils(config)
        }
        return OrchestrationUtils._instance
    }

    /**
     * Get orchestration data from config
     */
    static getOrchestrationData(config: Record<string, any>): Record<string, any> {
        const orchestrationData = config.testOrchestrationOptions || {}
        const result: Record<string, any> = {}
        
        Object.entries(orchestrationData).forEach(([key, value]) => {
            if (ALLOWED_ORCHESTRATION_KEYS.includes(key)) {
                result[key] = value
            }
        })
        
        return result
    }

    /**
     * Check if the abort build file exists
     */
    static checkAbortBuildFileExists(): boolean {
        const buildUuid = process.env.BROWSERSTACK_TESTHUB_UUID
        const filePath = path.join(tmpdir(), `abort_build_${buildUuid}`)
        return fs.existsSync(filePath)
    }

    /**
     * Write failure to file
     */
    static writeFailureToFile(testName: string): void {
        const buildUuid = process.env.BROWSERSTACK_TESTHUB_UUID
        const failedTestsFile = path.join(tmpdir(), `failed_tests_${buildUuid}.txt`)
        
        fs.appendFileSync(failedTestsFile, `${testName}\n`)
    }

    /**
     * Get run smart selection setting
     */
    getRunSmartSelection(): boolean {
        return this.runSmartSelection
    }

    /**
     * Get smart selection mode
     */
    getSmartSelectionMode(): string {
        return this.smartSelectionMode
    }

    /**
     * Get smart selection source
     */
    getSmartSelectionSource(): string[] | null {
        return this.smartSelectionSource
    }

    /**
     * Get project name
     */
    getProjectName(): string | undefined {
        return this.projectName
    }

    /**
     * Get build name
     */
    getBuildName(): string | undefined {
        return this.buildName
    }

    /**
     * Get build identifier
     */
    getBuildIdentifier(): string | undefined {
        return this.buildIdentifier
    }

    /**
     * Set build details
     */
    setBuildDetails(projectName?: string, buildName?: string, buildIdentifier?: string): void {
        this.projectName = projectName
        this.buildName = buildName
        this.buildIdentifier = buildIdentifier
        this.logger.debug(`[setBuildDetails] Set - projectName: ${this.projectName}, buildName: ${this.buildName}, buildIdentifier: ${this.buildIdentifier}`)
    }

    /**
     * Set run smart selection
     */
    private _setRunSmartSelection(enabled: boolean, mode: string, source: string[] | null = null): void {
        try {
            this.runSmartSelection = Boolean(enabled)
            this.smartSelectionMode = mode
            
            // Log the configuration for debugging
            this.logger.debug(`Setting runSmartSelection: enabled=${this.runSmartSelection}, mode=${this.smartSelectionMode}`)
            
            // Normalize source to always be a list of paths
            if (source === null) {
                this.smartSelectionSource = []
            } else if (Array.isArray(source)) {
                this.smartSelectionSource = source
            }
            
            this._setTestOrdering()
        } catch (e) {
            this.logger.error(`[_setRunSmartSelection] ${e}`)
        }
    }

    /**
     * Set test ordering based on priorities
     */
    private _setTestOrdering(): void {
        if (this.runSmartSelection) { // Highest priority
            this.testOrdering.enable(RUN_SMART_SELECTION)
        } else {
            this.testOrdering.disable()
        }
    }

    /**
     * Check if test ordering is enabled
     */
    testOrderingEnabled(): boolean {
        return this.testOrdering.getEnabled()
    }

    /**
     * Get test ordering name
     */
    getTestOrderingName(): string | null {
        if (this.testOrdering.getEnabled()) {
            return this.testOrdering.getName()
        }
        return null
    }

    /**
     * Get test orchestration metadata
     */
    getTestOrchestrationMetadata(): Record<string, any> {
        const data = {
            'run_smart_selection': {
                'enabled': this.getRunSmartSelection(),
                'mode': this.getSmartSelectionMode(),
                'source': this.getSmartSelectionSource()
            }
        }
        return data
    }

    /**
     * Get build start data
     */
    getBuildStartData(config: Record<string, any>): Record<string, any> {
        const testOrchestrationData: Record<string, any> = {}

        testOrchestrationData['run_smart_selection'] = {
            'enabled': this.getRunSmartSelection(),
            'mode': this.getSmartSelectionMode()
            // Not sending "source" to TH builds
        }

        return testOrchestrationData
    }

    /**
     * Collects build data by making a call to the collect-build-data endpoint
     */
    async collectBuildData(config: Record<string, any>): Promise<Record<string, any> | null> {
        // Return early if smart selection is not enabled or applicable
        // if (!(TEST_ORDERING_SUPPORTED_FRAMEWORKS.includes(config.framework) && this.getRunSmartSelection())) {
        //     return null
        // }
        
        const buildUuid = process.env.BROWSERSTACK_TESTHUB_UUID
        this.logger.debug(`[collectBuildData] Collecting build data for build UUID: ${buildUuid}`)

        try {
            const endpoint = `testorchestration/api/v1/builds/${buildUuid}/collect-build-data`
            
            const multiRepoSource = this.getSmartSelectionSource() || [] 
            const prDetails = getGitMetadataForAiSelection(multiRepoSource) 
            
            // Extract testObservabilityOptions from the complex config structure
            let testObservabilityOptions: Record<string, any> = {}
            
            try {
                // Check if config has services array
                if (config.services && Array.isArray(config.services)) {
                    // Look for browserstack service configuration
                    for (const service of config.services) {
                        if (Array.isArray(service) && service[0] === 'browserstack' && service[1]) {
                            // Extract testObservabilityOptions from the browserstack service config
                            testObservabilityOptions = service[1].testObservabilityOptions || {}
                            break
                        }
                    }
                }
                
                this.logger.debug(`[collectBuildData] Found testObservabilityOptions: ${JSON.stringify(testObservabilityOptions)}`)
            } catch (e) {
                this.logger.error(`[collectBuildData] Error extracting testObservabilityOptions: ${e}`)
            }
            
            const payload = {
                projectName: testObservabilityOptions.projectName || '',
                buildName: testObservabilityOptions.buildName || path.basename(process.cwd()),
                buildRunIdentifier: process.env.BROWSERSTACK_BUILD_RUN_IDENTIFIER || '',
                nodeIndex: parseInt(process.env.BROWSERSTACK_NODE_INDEX || '0', 10),
                totalNodes: parseInt(process.env.BROWSERSTACK_TOTAL_NODE_COUNT || '1', 10),
                hostInfo: getHostInfo(),
                prDetails
            }

            // console.log('Build data payload:', JSON.stringify(payload, null, 2))

            // this.logger.debug(`[collectBuildData] Sending build data payload: ${JSON.stringify(payload)}`)

            const response = await RequestUtils.postCollectBuildData(endpoint, payload)

            if (response) {
                this.logger.debug(`[collectBuildData] Build data collection response: ${JSON.stringify(response)}`)
                return response
            } else {
                this.logger.error(`[collectBuildData] Failed to collect build data for build UUID: ${buildUuid}`)
                return null
            }
        } catch (e) {
            this.logger.error(`[collectBuildData] Exception in collecting build data for build UUID ${buildUuid}: ${e}`)
            return null
        }
    }
}

export default OrchestrationUtils
